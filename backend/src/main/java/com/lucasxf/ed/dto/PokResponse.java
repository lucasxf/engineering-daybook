package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;

/**
 * Response DTO for an owned POK (Piece of Knowledge).
 *
 * <p>Implements {@link FeedItemResponse} — {@code type} is always {@code "owned"} to allow
 * the frontend to discriminate between owned learnings and re-learnings in a mixed feed.
 *
 * <p>The {@code author*} fields are populated only in the discovery feed context where the
 * viewer sees learnings from multiple followed learners. They are {@code null} in the "My
 * Learnings" listing where the viewer is always the author.
 *
 * @param type               always {@code "owned"} — discriminates from {@code PokShareResponse}
 * @param id                 POK unique identifier
 * @param userId             owner user ID
 * @param title              optional title (can be null)
 * @param content            POK content
 * @param visibility         visibility level of this learning
 * @param deletedAt          soft delete timestamp (null if active)
 * @param createdAt          creation timestamp
 * @param updatedAt          last update timestamp
 * @param tags               active tag subscriptions assigned to this POK
 * @param pendingSuggestions AI-generated tag suggestions awaiting user decision
 * @param authorHandle       author's handle (nullable; populated in discovery feed context)
 * @param authorDisplayName  author's display name (nullable; populated in discovery feed context)
 * @param authorAvatarUrl    author's avatar URL (nullable; populated in discovery feed context)
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public record PokResponse(
    String type,
    UUID id,
    UUID userId,
    String title,
    String content,
    Pok.Visibility visibility,
    Instant deletedAt,
    Instant createdAt,
    Instant updatedAt,
    List<TagResponse> tags,
    List<TagSuggestionResponse> pendingSuggestions,
    String authorHandle,
    String authorDisplayName,
    String authorAvatarUrl) implements FeedItemResponse {

    /**
     * Converts a {@link Pok} entity to a {@link PokResponse} DTO without tags or suggestions.
     * Used in contexts where tag data is not needed (e.g., list views before tags are loaded).
     * The {@code author*} fields are left {@code null} — the caller is always the author in
     * single-user listing contexts.
     *
     * @param pok the POK entity
     * @return the response DTO with empty tag lists and {@code type = "owned"}
     */
    public static PokResponse from(Pok pok) {
        return new PokResponse(
            "owned",
            pok.getId(),
            pok.getUserId(),
            pok.getTitle(),
            pok.getContent(),
            pok.getVisibility(),
            pok.getDeletedAt(),
            pok.getCreatedAt(),
            pok.getUpdatedAt(),
            List.of(),
            List.of(),
            null,
            null,
            null);
    }

    /**
     * Converts a {@link Pok} entity to a {@link PokResponse} DTO with full tag data.
     * The {@code author*} fields are left {@code null} — used in single-user listing contexts.
     *
     * @param pok                the POK entity
     * @param tags               the user's active tags assigned to this POK
     * @param pendingSuggestions AI-generated tag suggestions pending user decision
     * @return the response DTO with {@code type = "owned"}
     */
    public static PokResponse from(Pok pok, List<TagResponse> tags, List<TagSuggestionResponse> pendingSuggestions) {
        return new PokResponse(
            "owned",
            pok.getId(),
            pok.getUserId(),
            pok.getTitle(),
            pok.getContent(),
            pok.getVisibility(),
            pok.getDeletedAt(),
            pok.getCreatedAt(),
            pok.getUpdatedAt(),
            tags,
            pendingSuggestions,
            null,
            null,
            null);
    }

    /**
     * Builds a {@link PokResponse} for the discovery feed context, including the author's
     * identity so that the frontend can render the author's name and avatar on each feed card.
     *
     * @param id                 POK unique identifier
     * @param userId             owner user ID
     * @param title              optional title (can be null)
     * @param content            POK content
     * @param visibility         visibility level of this learning
     * @param createdAt          creation timestamp
     * @param updatedAt          last update timestamp
     * @param authorHandle       the author's handle
     * @param authorDisplayName  the author's display name (nullable)
     * @param authorAvatarUrl    the author's avatar URL (nullable)
     * @return the response DTO with {@code type = "owned"} and author identity fields
     */
    public static PokResponse fromFeed(
            UUID id,
            UUID userId,
            String title,
            String content,
            Pok.Visibility visibility,
            Instant createdAt,
            Instant updatedAt,
            String authorHandle,
            String authorDisplayName,
            String authorAvatarUrl) {
        return new PokResponse(
            "owned",
            id,
            userId,
            title,
            content,
            visibility,
            null,
            createdAt,
            updatedAt,
            List.of(),
            List.of(),
            authorHandle,
            authorDisplayName,
            authorAvatarUrl);
    }
}
