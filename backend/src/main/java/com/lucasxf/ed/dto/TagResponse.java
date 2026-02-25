package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.domain.UserTag;

/**
 * Response DTO for a user's active tag subscription.
 *
 * @param id        the user-tag subscription ID
 * @param tagId     the global tag pool ID
 * @param name      the tag name
 * @param color     the user's assigned color for this tag
 * @param createdAt when the subscription was created
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public record TagResponse(
    UUID id,
    UUID tagId,
    String name,
    String color,
    Instant createdAt
) {
    /**
     * Creates a {@link TagResponse} from a {@link UserTag} subscription.
     *
     * @param userTag the subscription entity
     * @return the response DTO
     */
    public static TagResponse from(UserTag userTag) {
        return new TagResponse(
            userTag.getId(),
            userTag.getTag().getId(),
            userTag.getTag().getName(),
            userTag.getColor(),
            userTag.getCreatedAt()
        );
    }
}
