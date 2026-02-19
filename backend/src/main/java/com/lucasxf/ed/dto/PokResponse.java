package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;

/**
 * Response DTO for POK operations.
 *
 * @param id        POK unique identifier
 * @param userId    owner user ID
 * @param title     optional title (can be null)
 * @param content   POK content
 * @param deletedAt soft delete timestamp (null if active)
 * @param createdAt creation timestamp
 * @param updatedAt last update timestamp
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public record PokResponse(
    UUID id,
    UUID userId,
    String title,
    String content,
    Instant deletedAt,
    Instant createdAt,
    Instant updatedAt
) {

    /**
     * Converts a {@link Pok} entity to a {@link PokResponse} DTO.
     *
     * @param pok the POK entity
     * @return the response DTO
     */
    public static PokResponse from(Pok pok) {
        return new PokResponse(
            pok.getId(),
            pok.getUserId(),
            pok.getTitle(),
            pok.getContent(),
            pok.getDeletedAt(),
            pok.getCreatedAt(),
            pok.getUpdatedAt()
        );
    }
}
