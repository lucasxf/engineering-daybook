package com.lucasxf.ed.dto;

import java.util.UUID;

import com.lucasxf.ed.domain.PokTagSuggestion;

/**
 * Response DTO for an AI-generated tag suggestion.
 *
 * @param id            the suggestion ID
 * @param pokId         the POK this suggestion belongs to
 * @param suggestedName the tag name suggested by the AI
 * @param status        current status (PENDING, APPROVED, REJECTED)
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public record TagSuggestionResponse(
    UUID id,
    UUID pokId,
    String suggestedName,
    String status
) {
    /**
     * Creates a {@link TagSuggestionResponse} from a {@link PokTagSuggestion} entity.
     *
     * @param suggestion the suggestion entity
     * @return the response DTO
     */
    public static TagSuggestionResponse from(PokTagSuggestion suggestion) {
        return new TagSuggestionResponse(
            suggestion.getId(),
            suggestion.getPokId(),
            suggestion.getSuggestedName(),
            suggestion.getStatus().name()
        );
    }
}
