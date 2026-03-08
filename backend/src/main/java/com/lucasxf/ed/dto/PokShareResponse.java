package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;

/**
 * Response DTO for a re-learning (PokShare).
 *
 * <p>Implements {@link FeedItemResponse} — {@code type} is always {@code "shared"} so the
 * frontend can distinguish re-learnings from owned learnings in a mixed feed.
 *
 * <p>The {@code originalAuthor*} fields are populated only in the discovery feed context where
 * the original author may differ from the profile being viewed. They are {@code null} in
 * single-share detail and learner-profile listing contexts.
 *
 * @param type                        always {@code "shared"}
 * @param id                          share unique identifier
 * @param originalPokId               ID of the original POK being re-learned
 * @param originalPok                 full nested response for the original POK (for display)
 * @param sharedByHandle              handle of the learner who performed the re-learning
 * @param note                        optional personal note added by the sharer (max 500 chars, nullable)
 * @param visibility                  visibility tier chosen by the sharer (≤ original's tier)
 * @param createdAt                   when the re-learning was created
 * @param originalAuthorHandle        handle of the original POK's author (nullable; set in feed context)
 * @param originalAuthorDisplayName   display name of the original POK's author (nullable; set in feed context)
 * @param originalAuthorAvatarUrl     avatar URL of the original POK's author (nullable; set in feed context)
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public record PokShareResponse(
    String type,
    UUID id,
    UUID originalPokId,
    PokResponse originalPok,
    String sharedByHandle,
    String note,
    Pok.Visibility visibility,
    Instant createdAt,
    String originalAuthorHandle,
    String originalAuthorDisplayName,
    String originalAuthorAvatarUrl) implements FeedItemResponse {

    /**
     * Builds a {@link PokShareResponse} for single-share detail and learner-profile contexts.
     * The {@code originalAuthor*} fields are left {@code null} because the original author is
     * implied by the profile being viewed.
     *
     * @param share          the PokShare entity
     * @param originalPok    the full original POK response
     * @param sharedByHandle the sharer's handle
     * @return the response DTO with {@code type = "shared"} and {@code null} author identity fields
     */
    public static PokShareResponse from(PokShare share, PokResponse originalPok, String sharedByHandle) {
        return new PokShareResponse(
            "shared",
            share.getId(),
            share.getOriginalPokId(),
            originalPok,
            sharedByHandle,
            share.getNote(),
            share.getVisibility(),
            share.getCreatedAt(),
            null,
            null,
            null);
    }

    /**
     * Builds a {@link PokShareResponse} for the discovery feed context where the original
     * author's identity fields are needed for attribution rendering.
     *
     * @param share                       the PokShare entity
     * @param originalPok                 the full original POK response
     * @param sharedByHandle              the sharer's handle
     * @param originalAuthorHandle        the original author's handle
     * @param originalAuthorDisplayName   the original author's display name (nullable)
     * @param originalAuthorAvatarUrl     the original author's avatar URL (nullable)
     * @return the response DTO with all author identity fields populated
     */
    public static PokShareResponse fromFeed(
            PokShare share,
            PokResponse originalPok,
            String sharedByHandle,
            String originalAuthorHandle,
            String originalAuthorDisplayName,
            String originalAuthorAvatarUrl) {
        return new PokShareResponse(
            "shared",
            share.getId(),
            share.getOriginalPokId(),
            originalPok,
            sharedByHandle,
            share.getNote(),
            share.getVisibility(),
            share.getCreatedAt(),
            originalAuthorHandle,
            originalAuthorDisplayName,
            originalAuthorAvatarUrl);
    }
}
