package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.domain.UserTag;

/**
 * Response DTO for a user's active tag subscription.
 *
 * @param id          the user-tag subscription ID
 * @param tagId       the global tag pool ID
 * @param name        the canonical tag name (lowercase, dashes)
 * @param displayName the display tag name (original casing, dashes)
 * @param color       the user's assigned color for this tag
 * @param createdAt   when the subscription was created
 * @param pokCount    how many of the user's non-deleted POKs use this tag
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public record TagResponse(
    UUID id,
    UUID tagId,
    String name,
    String displayName,
    String color,
    Instant createdAt,
    int pokCount) {

    /**
     * Creates a {@link TagResponse} from a {@link UserTag} subscription with {@code pokCount = 0}.
     * Use this for single-tag create/rename contexts where frequency is not meaningful.
     *
     * @param userTag the subscription entity
     * @return the response DTO
     */
    public static TagResponse from(UserTag userTag) {
        return from(userTag, 0);
    }

    /**
     * Creates a {@link TagResponse} from a {@link UserTag} subscription with an explicit usage count.
     *
     * @param userTag  the subscription entity
     * @param pokCount how many of the user's non-deleted POKs use this tag
     * @return the response DTO
     */
    public static TagResponse from(UserTag userTag, int pokCount) {
        return new TagResponse(
            userTag.getId(),
            userTag.getTag().getId(),
            userTag.getTag().getName(),
            userTag.getTag().getDisplayName(),
            userTag.getColor(),
            userTag.getCreatedAt(),
            pokCount);
    }
}
