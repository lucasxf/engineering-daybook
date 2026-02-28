package com.lucasxf.ed.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lucasxf.ed.domain.UserTag;

/**
 * Repository for {@link UserTag} per-user tag subscriptions.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public interface UserTagRepository extends JpaRepository<UserTag, UUID> {

    /**
     * Returns all active (non-deleted) tag subscriptions for a user.
     *
     * @param userId the user's ID
     * @return list of active subscriptions
     */
    List<UserTag> findByUserIdAndDeletedAtIsNull(UUID userId);

    /**
     * Finds an active subscription for a specific user and tag.
     *
     * @param userId the user's ID
     * @param tagId  the global tag's ID
     * @return the active subscription, if any
     */
    Optional<UserTag> findByUserIdAndTagIdAndDeletedAtIsNull(UUID userId, UUID tagId);

    /**
     * Checks whether an active subscription exists for the given user and tag name (case-insensitive).
     *
     * @param userId   the user's ID
     * @param tagName  the tag name to check
     * @return true if an active subscription with that name exists
     */
    @Query("SELECT COUNT(ut) > 0 FROM UserTag ut " +
           "WHERE ut.userId = :userId " +
           "AND LOWER(ut.tag.name) = LOWER(:tagName) " +
           "AND ut.deletedAt IS NULL")
    boolean existsByUserIdAndTagNameIgnoreCaseAndDeletedAtIsNull(
            @Param("userId") UUID userId,
            @Param("tagName") String tagName);

    /**
     * Returns the distinct user IDs of all users who have at least one active tag subscription.
     *
     * <p>Used by the tag suggestion backfill to limit processing to users for whom suggestions
     * can actually be generated (users with no tags produce no suggestions).
     *
     * @return list of user IDs with at least one active tag
     */
    @Query("SELECT DISTINCT ut.userId FROM UserTag ut WHERE ut.deletedAt IS NULL")
    List<UUID> findDistinctUserIdsWithActiveTags();
}
