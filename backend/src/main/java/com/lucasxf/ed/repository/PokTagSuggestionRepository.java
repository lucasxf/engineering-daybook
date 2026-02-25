package com.lucasxf.ed.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lucasxf.ed.domain.PokTagSuggestion;
import com.lucasxf.ed.domain.PokTagSuggestion.Status;

/**
 * Repository for {@link PokTagSuggestion} AI-generated tag suggestions.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public interface PokTagSuggestionRepository extends JpaRepository<PokTagSuggestion, UUID> {

    /**
     * Returns all suggestions for a POK owned by a specific user.
     *
     * @param pokId  the POK's ID
     * @param userId the user's ID
     * @return list of suggestions
     */
    List<PokTagSuggestion> findByPokIdAndUserId(UUID pokId, UUID userId);

    /**
     * Returns all suggestions for a POK filtered by status (internal use — ownership must be verified by caller).
     *
     * @param pokId  the POK's ID
     * @param status the status to filter by
     * @return list of matching suggestions
     */
    List<PokTagSuggestion> findByPokIdAndStatus(UUID pokId, Status status);

    /**
     * Returns suggestions for a POK owned by a specific user, filtered by status.
     *
     * @param pokId  the POK's ID
     * @param userId the user's ID (ownership check)
     * @param status the status to filter by
     * @return list of matching suggestions
     */
    List<PokTagSuggestion> findByPokIdAndUserIdAndStatus(UUID pokId, UUID userId, Status status);

    /**
     * Finds a specific suggestion by ID and user.
     *
     * @param id     the suggestion's ID
     * @param userId the user's ID
     * @return the suggestion, if owned by the user
     */
    Optional<PokTagSuggestion> findByIdAndUserId(UUID id, UUID userId);
}
