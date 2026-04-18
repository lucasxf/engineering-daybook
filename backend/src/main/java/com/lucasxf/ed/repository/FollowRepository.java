package com.lucasxf.ed.repository;

import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lucasxf.ed.domain.Follow;
import com.lucasxf.ed.domain.FollowId;

/**
 * Data access for {@link Follow} entities.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public interface FollowRepository extends JpaRepository<Follow, FollowId> {

    boolean existsByFollowerIdAndFollowedId(UUID followerId, UUID followedId);

    void deleteByFollowerIdAndFollowedId(UUID followerId, UUID followedId);

    long countByFollowedId(UUID followedId);

    long countByFollowerId(UUID followerId);

    /**
     * Returns the subset of {@code targetIds} that {@code followerId} follows.
     *
     * <p>Used for bulk relationship resolution to avoid N+1 queries.
     *
     * @param followerId the requester's ID
     * @param targetIds  the set of candidate target IDs
     * @return followed IDs that are a subset of {@code targetIds}
     */
    @Query("SELECT f.followedId FROM Follow f WHERE f.followerId = :followerId AND f.followedId IN :targetIds")
    Set<UUID> findFollowedIdsByFollowerIdAndFollowedIdIn(
            @Param("followerId") UUID followerId, @Param("targetIds") Set<UUID> targetIds);

    /**
     * Returns the subset of {@code targetIds} that follow {@code followedId}.
     *
     * <p>Used for bulk relationship resolution to avoid N+1 queries.
     *
     * @param followedId the requester's ID (the one being followed)
     * @param targetIds  the set of candidate follower IDs
     * @return follower IDs that are a subset of {@code targetIds}
     */
    @Query("SELECT f.followerId FROM Follow f WHERE f.followedId = :followedId AND f.followerId IN :targetIds")
    Set<UUID> findFollowerIdsByFollowedIdAndFollowerIdIn(
            @Param("followedId") UUID followedId, @Param("targetIds") Set<UUID> targetIds);

    /**
     * Counts mutual follows (colleagues) for the given user.
     *
     * <p>A colleague is a learner who both follows and is followed by the given user.
     * Uses a self-join to find symmetric follow pairs in a single query.
     *
     * @param userId the user whose colleague count is requested
     * @return number of mutual follows
     */
    @Query("""
            SELECT COUNT(DISTINCT f1.followedId)
            FROM Follow f1 JOIN Follow f2
              ON f1.followerId = f2.followedId AND f1.followedId = f2.followerId
            WHERE f1.followerId = :userId
            """)
    long countColleagues(@Param("userId") UUID userId);

    void deleteAllByFollowerId(UUID followerId);

    void deleteAllByFollowedId(UUID followedId);
}
