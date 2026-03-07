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
 * @param type           always {@code "shared"}
 * @param id             share unique identifier
 * @param originalPokId  ID of the original POK being re-learned
 * @param originalPok    full nested response for the original POK (for display)
 * @param sharedByHandle handle of the learner who performed the re-learning
 * @param note           optional personal note added by the sharer (max 500 chars, nullable)
 * @param visibility     visibility tier chosen by the sharer (≤ original's tier)
 * @param createdAt      when the re-learning was created
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
    Instant createdAt) implements FeedItemResponse {

    /**
     * Builds a {@link PokShareResponse} from a {@link PokShare} entity, the nested original POK
     * response, and the sharer's handle.
     *
     * @param share          the PokShare entity
     * @param originalPok    the full original POK response
     * @param sharedByHandle the sharer's handle
     * @return the response DTO with {@code type = "shared"}
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
            share.getCreatedAt());
    }
}
