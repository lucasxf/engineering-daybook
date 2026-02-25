package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;

/**
 * Response DTO for POK operations.
 *
 * @param id                 POK unique identifier
 * @param userId             owner user ID
 * @param title              optional title (can be null)
 * @param content            POK content
 * @param deletedAt          soft delete timestamp (null if active)
 * @param createdAt          creation timestamp
 * @param updatedAt          last update timestamp
 * @param tags               active tag subscriptions assigned to this POK
 * @param pendingSuggestions AI-generated tag suggestions awaiting user decision
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
    Instant updatedAt,
    List<TagResponse> tags,
    List<TagSuggestionResponse> pendingSuggestions
) {

    /**
     * Converts a {@link Pok} entity to a {@link PokResponse} DTO without tags or suggestions.
     * Used in contexts where tag data is not needed (e.g., list views before tags are loaded).
     *
     * @param pok the POK entity
     * @return the response DTO with empty tag lists
     */
    public static PokResponse from(Pok pok) {
        return new PokResponse(
            pok.getId(),
            pok.getUserId(),
            pok.getTitle(),
            pok.getContent(),
            pok.getDeletedAt(),
            pok.getCreatedAt(),
            pok.getUpdatedAt(),
            List.of(),
            List.of()
        );
    }

    /**
     * Converts a {@link Pok} entity to a {@link PokResponse} DTO with full tag data.
     *
     * @param pok                the POK entity
     * @param tags               the user's active tags assigned to this POK
     * @param pendingSuggestions AI-generated tag suggestions pending user decision
     * @return the response DTO
     */
    public static PokResponse from(Pok pok, List<TagResponse> tags, List<TagSuggestionResponse> pendingSuggestions) {
        return new PokResponse(
            pok.getId(),
            pok.getUserId(),
            pok.getTitle(),
            pok.getContent(),
            pok.getDeletedAt(),
            pok.getCreatedAt(),
            pok.getUpdatedAt(),
            tags,
            pendingSuggestions
        );
    }
}
