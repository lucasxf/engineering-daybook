package com.lucasxf.ed.service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.PokShareResponse;

import static java.util.Objects.requireNonNull;

/**
 * Service responsible for the cross-learner discovery feed (Milestone 6.5).
 *
 * <p>Uses a native SQL {@code UNION ALL} query executed via {@link NamedParameterJdbcTemplate}
 * to merge owned learnings and re-learnings from all followed learners in a single database
 * round-trip. Visibility filtering is enforced at the SQL level (NFR3).
 *
 * <p>The feed excludes:
 * <ul>
 *   <li>The requesting user's own learnings (FR10)</li>
 *   <li>{@code PRIVATE} learnings from any followed learner (FR2)</li>
 *   <li>{@code COLLEAGUES_ONLY} learnings when the viewer is not a colleague (FR2, AC-4)</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
@Service
public class FeedService {

    /**
     * UNION ALL query that merges owned POKs and re-learnings from all followed learners.
     *
     * <p>Named parameters: {@code :requesterId} (UUID), {@code :size} (int), {@code :offset} (long).
     */
    static final String FEED_QUERY = """
            SELECT
                'owned' AS item_type,
                p.id                   AS id,
                p.created_at           AS sort_ts,
                p.title                AS title,
                p.content              AS content,
                p.visibility::text     AS visibility,
                p.created_at           AS item_created_at,
                p.updated_at           AS item_updated_at,
                p.user_id              AS author_user_id,
                u.handle               AS author_handle,
                u.display_name         AS author_display_name,
                u.avatar_url           AS author_avatar_url,
                CAST(NULL AS uuid)     AS original_pok_id,
                CAST(NULL AS uuid)     AS original_pok_user_id,
                NULL::text             AS original_pok_visibility,
                NULL::timestamptz      AS original_pok_created_at,
                NULL::timestamptz      AS original_pok_updated_at,
                NULL::text             AS share_note,
                NULL::text             AS original_author_handle,
                NULL::text             AS original_author_display_name,
                NULL::text             AS original_author_avatar_url
            FROM poks p
            JOIN follows f ON f.followed_id = p.user_id AND f.follower_id = :requesterId
            JOIN users u   ON u.id = p.user_id
            WHERE p.deleted_at IS NULL
              AND p.user_id <> :requesterId
              AND (  p.visibility = 'PUBLIC'
                  OR p.visibility = 'FOLLOWERS_ONLY'
                  OR (p.visibility = 'COLLEAGUES_ONLY'
                      AND EXISTS (SELECT 1 FROM follows fb
                                  WHERE fb.follower_id = p.user_id
                                    AND fb.followed_id = :requesterId)))

            UNION ALL

            SELECT
                'shared' AS item_type,
                ps.id                     AS id,
                ps.created_at             AS sort_ts,
                p.title                   AS title,
                p.content                 AS content,
                ps.visibility::text       AS visibility,
                ps.created_at             AS item_created_at,
                p.updated_at              AS item_updated_at,
                ps.shared_by_user_id      AS author_user_id,
                sharer.handle             AS author_handle,
                sharer.display_name       AS author_display_name,
                sharer.avatar_url         AS author_avatar_url,
                ps.original_pok_id        AS original_pok_id,
                p.user_id                 AS original_pok_user_id,
                p.visibility::text        AS original_pok_visibility,
                p.created_at              AS original_pok_created_at,
                p.updated_at              AS original_pok_updated_at,
                ps.note                   AS share_note,
                orig_author.handle        AS original_author_handle,
                orig_author.display_name  AS original_author_display_name,
                orig_author.avatar_url    AS original_author_avatar_url
            FROM pok_shares ps
            JOIN follows f        ON f.followed_id = ps.shared_by_user_id AND f.follower_id = :requesterId
            JOIN poks p           ON p.id = ps.original_pok_id AND p.deleted_at IS NULL
            JOIN users sharer     ON sharer.id = ps.shared_by_user_id
            JOIN users orig_author ON orig_author.id = p.user_id
            WHERE ps.shared_by_user_id <> :requesterId
              AND (  ps.visibility = 'PUBLIC'
                  OR ps.visibility = 'FOLLOWERS_ONLY'
                  OR (ps.visibility = 'COLLEAGUES_ONLY'
                      AND EXISTS (SELECT 1 FROM follows fb
                                  WHERE fb.follower_id = ps.shared_by_user_id
                                    AND fb.followed_id = :requesterId)))

            ORDER BY sort_ts DESC
            LIMIT :size OFFSET :offset
            """;

    /**
     * Count query wrapping the same UNION ALL without LIMIT/OFFSET.
     *
     * <p>Named parameters: {@code :requesterId} (UUID).
     */
    static final String COUNT_QUERY = """
            SELECT COUNT(*) FROM (
                SELECT p.id
                FROM poks p
                JOIN follows f ON f.followed_id = p.user_id AND f.follower_id = :requesterId
                WHERE p.deleted_at IS NULL
                  AND p.user_id <> :requesterId
                  AND (  p.visibility = 'PUBLIC'
                      OR p.visibility = 'FOLLOWERS_ONLY'
                      OR (p.visibility = 'COLLEAGUES_ONLY'
                          AND EXISTS (SELECT 1 FROM follows fb
                                      WHERE fb.follower_id = p.user_id
                                        AND fb.followed_id = :requesterId)))
                UNION ALL
                SELECT ps.id
                FROM pok_shares ps
                JOIN follows f ON f.followed_id = ps.shared_by_user_id AND f.follower_id = :requesterId
                JOIN poks p    ON p.id = ps.original_pok_id AND p.deleted_at IS NULL
                WHERE ps.shared_by_user_id <> :requesterId
                  AND (  ps.visibility = 'PUBLIC'
                      OR ps.visibility = 'FOLLOWERS_ONLY'
                      OR (ps.visibility = 'COLLEAGUES_ONLY'
                          AND EXISTS (SELECT 1 FROM follows fb
                                      WHERE fb.follower_id = ps.shared_by_user_id
                                        AND fb.followed_id = :requesterId)))
            ) AS feed
            """;

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public FeedService(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = requireNonNull(namedParameterJdbcTemplate);
    }

    /**
     * Returns a page of the discovery feed for the given requester.
     *
     * <p>The feed contains {@code PUBLIC}, {@code FOLLOWERS_ONLY}, and (when the requester is
     * a colleague) {@code COLLEAGUES_ONLY} learnings and re-learnings from all learners the
     * requester follows. The requester's own learnings are excluded.
     *
     * @param requesterId the ID of the authenticated user requesting the feed
     * @param page        zero-based page index
     * @param size        number of items per page (default 20)
     * @return a page of {@link FeedItemResponse} items sorted newest-first
     */
    public Page<FeedItemResponse> getDiscoveryFeed(UUID requesterId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        MapSqlParameterSource countParams = new MapSqlParameterSource("requesterId", requesterId);
        Long rawCount = namedParameterJdbcTemplate.queryForObject(COUNT_QUERY, countParams, Long.class);
        long total = rawCount != null ? rawCount : 0L;

        if (total == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        MapSqlParameterSource itemParams = new MapSqlParameterSource()
            .addValue("requesterId", requesterId)
            .addValue("size", size)
            .addValue("offset", pageable.getOffset());

        List<FeedItemResponse> items = namedParameterJdbcTemplate.query(FEED_QUERY, itemParams, ROW_MAPPER);
        return new PageImpl<>(items, pageable, total);
    }

    // ---------------------------------------------------------------------------
    // Row mapper
    // ---------------------------------------------------------------------------

    private static final RowMapper<FeedItemResponse> ROW_MAPPER = (rs, rowNum) -> {
        String itemType = rs.getString("item_type");
        return "owned".equals(itemType) ? mapOwnedRow(rs) : mapSharedRow(rs);
    };

    private static PokResponse mapOwnedRow(ResultSet rs) throws SQLException {
        return PokResponse.fromFeed(
            uuid(rs, "id"),
            uuid(rs, "author_user_id"),
            rs.getString("title"),
            rs.getString("content"),
            Pok.Visibility.valueOf(rs.getString("visibility")),
            instant(rs, "item_created_at"),
            instant(rs, "item_updated_at"),
            rs.getString("author_handle"),
            rs.getString("author_display_name"),
            rs.getString("author_avatar_url"));
    }

    private static PokShareResponse mapSharedRow(ResultSet rs) throws SQLException {
        UUID originalPokId = uuid(rs, "original_pok_id");
        UUID originalPokUserId = uuid(rs, "original_pok_user_id");
        String originalPokVisibilityStr = rs.getString("original_pok_visibility");
        Pok.Visibility originalPokVisibility = originalPokVisibilityStr != null
            ? Pok.Visibility.valueOf(originalPokVisibilityStr) : null;

        PokResponse originalPok = PokResponse.fromFeed(
            originalPokId,
            originalPokUserId,
            rs.getString("title"),
            rs.getString("content"),
            originalPokVisibility,
            instant(rs, "original_pok_created_at"),
            instant(rs, "original_pok_updated_at"),
            rs.getString("original_author_handle"),
            rs.getString("original_author_display_name"),
            rs.getString("original_author_avatar_url"));

        return new PokShareResponse(
            "shared",
            uuid(rs, "id"),
            originalPokId,
            originalPok,
            rs.getString("author_handle"),
            rs.getString("share_note"),
            Pok.Visibility.valueOf(rs.getString("visibility")),
            instant(rs, "sort_ts"),
            rs.getString("original_author_handle"),
            rs.getString("original_author_display_name"),
            rs.getString("original_author_avatar_url"));
    }

    private static UUID uuid(ResultSet rs, String column) throws SQLException {
        Object val = rs.getObject(column);
        if (val == null) return null;
        return val instanceof UUID u ? u : UUID.fromString(val.toString());
    }

    private static Instant instant(ResultSet rs, String column) throws SQLException {
        Timestamp ts = rs.getTimestamp(column);
        return ts != null ? ts.toInstant() : null;
    }
}
