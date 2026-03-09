package com.lucasxf.ed.dto;

import com.lucasxf.ed.domain.User;

/**
 * DTO representing a single learner in search results (Milestone 6.5.2).
 *
 * <p>Only learners with {@code profileVisibility = PUBLIC} appear in search results.
 * The {@code relationship} field reflects the caller's current follow state, allowing
 * the UI to render an appropriate Follow / Unfollow button.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
public record LearnerSearchResult(
        String handle,
        String displayName,
        String avatarUrl,
        String bio,
        RelationshipStatus relationship) {

    /**
     * Builds a search result from a {@link User} entity and the caller's relationship.
     *
     * @param user         the matching learner
     * @param relationship the caller's relationship to this learner (or {@code null} for self)
     * @return the search result DTO
     */
    public static LearnerSearchResult from(User user, RelationshipStatus relationship) {
        return new LearnerSearchResult(
            user.getHandle(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getBio(),
            relationship);
    }
}
