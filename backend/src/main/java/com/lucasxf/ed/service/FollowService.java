package com.lucasxf.ed.service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.Follow;
import com.lucasxf.ed.dto.RelationshipStatus;
import com.lucasxf.ed.exception.AlreadyFollowingException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.exception.NotFollowingException;
import com.lucasxf.ed.exception.SelfFollowException;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.UserRepository;

import static java.util.Objects.requireNonNull;

/**
 * Service for follow/unfollow mechanics and relationship queries.
 *
 * <p>Self-follow is rejected at the service level (guard) and at the database level (CHECK
 * constraint) for defence-in-depth. Colleague detection is purely derived from mutual follows —
 * no separate request flow or entity is required.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
@Slf4j
@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = requireNonNull(followRepository);
        this.userRepository = requireNonNull(userRepository);
    }

    /**
     * Creates a follow relationship from {@code followerId} to {@code followedId}.
     *
     * @param followerId the ID of the learner who wants to follow
     * @param followedId the ID of the learner to be followed
     * @throws SelfFollowException          if {@code followerId} equals {@code followedId}
     * @throws LearnerNotFoundException     if {@code followedId} does not exist
     * @throws AlreadyFollowingException    if the relationship already exists
     */
    @Transactional
    public void follow(UUID followerId, UUID followedId) {
        if (followerId.equals(followedId)) {
            throw new SelfFollowException("You cannot follow yourself");
        }
        if (!userRepository.existsById(followedId)) {
            throw new LearnerNotFoundException("Learner not found");
        }
        if (followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
            throw new AlreadyFollowingException("Already following this learner");
        }
        followRepository.save(new Follow(followerId, followedId));
        log.info("Follow: {} -> {}", followerId, followedId);
    }

    /**
     * Removes a follow relationship from {@code followerId} to {@code followedId}.
     *
     * @param followerId the ID of the learner who wants to unfollow
     * @param followedId the ID of the learner to be unfollowed
     * @throws NotFollowingException if the relationship does not exist
     */
    @Transactional
    public void unfollow(UUID followerId, UUID followedId) {
        if (!followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
            throw new NotFollowingException("Not following this learner");
        }
        followRepository.deleteByFollowerIdAndFollowedId(followerId, followedId);
        log.info("Unfollow: {} -> {}", followerId, followedId);
    }

    /**
     * Returns whether {@code followerId} follows {@code followedId}.
     *
     * @param followerId the potential follower
     * @param followedId the potential followed user
     * @return true if the follow relationship exists
     */
    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followedId) {
        return followRepository.existsByFollowerIdAndFollowedId(followerId, followedId);
    }

    /**
     * Returns whether {@code a} and {@code b} are colleagues (mutual follows).
     *
     * @param a first learner
     * @param b second learner
     * @return true if both follow each other
     */
    @Transactional(readOnly = true)
    public boolean areColleagues(UUID a, UUID b) {
        return followRepository.existsByFollowerIdAndFollowedId(a, b)
            && followRepository.existsByFollowerIdAndFollowedId(b, a);
    }

    /**
     * Returns the relationship status between the requester and the target.
     *
     * @param requesterId the requesting learner's ID
     * @param targetId    the target learner's ID
     * @return NONE, FOLLOWING, FOLLOWED_BY, or COLLEAGUE
     */
    @Transactional(readOnly = true)
    public RelationshipStatus getRelationship(UUID requesterId, UUID targetId) {
        boolean iFollowThem = followRepository.existsByFollowerIdAndFollowedId(requesterId, targetId);
        boolean theyFollowMe = followRepository.existsByFollowerIdAndFollowedId(targetId, requesterId);

        if (iFollowThem && theyFollowMe) return RelationshipStatus.COLLEAGUE;
        if (iFollowThem) return RelationshipStatus.FOLLOWING;
        if (theyFollowMe) return RelationshipStatus.FOLLOWED_BY;
        return RelationshipStatus.NONE;
    }

    /**
     * Returns relationship statuses between the requester and each of the given targets in bulk.
     *
     * <p>Issues exactly 2 DB queries regardless of how many targets are provided, avoiding the
     * N+1 pattern that would result from calling {@link #getRelationship} per user.
     *
     * @param requesterId the requesting learner's ID
     * @param targetIds   the set of target learner IDs (must not be empty)
     * @return a map from each target ID to its {@link RelationshipStatus}; every ID in
     *         {@code targetIds} is guaranteed to have an entry
     */
    @Transactional(readOnly = true)
    public Map<UUID, RelationshipStatus> getRelationships(UUID requesterId, Set<UUID> targetIds) {
        Set<UUID> iFollow = followRepository.findFollowedIdsByFollowerIdAndFollowedIdIn(requesterId, targetIds);
        Set<UUID> followMe = followRepository.findFollowerIdsByFollowedIdAndFollowerIdIn(requesterId, targetIds);

        return targetIds.stream().collect(Collectors.toMap(
            id -> id,
            id -> {
                boolean iFollowThem = iFollow.contains(id);
                boolean theyFollowMe = followMe.contains(id);
                if (iFollowThem && theyFollowMe) return RelationshipStatus.COLLEAGUE;
                if (iFollowThem) return RelationshipStatus.FOLLOWING;
                if (theyFollowMe) return RelationshipStatus.FOLLOWED_BY;
                return RelationshipStatus.NONE;
            }
        ));
    }

    /**
     * Returns the number of learners who follow the given user.
     *
     * @param userId the user whose follower count is requested
     * @return follower count
     */
    @Transactional(readOnly = true)
    public long countFollowers(UUID userId) {
        return followRepository.countByFollowedId(userId);
    }

    /**
     * Returns the number of learners the given user follows.
     *
     * @param userId the user whose following count is requested
     * @return following count
     */
    @Transactional(readOnly = true)
    public long countFollowing(UUID userId) {
        return followRepository.countByFollowerId(userId);
    }

    /**
     * Returns the number of colleagues (mutual follows) for the given user.
     *
     * @param userId the user whose colleague count is requested
     * @return colleague count
     */
    @Transactional(readOnly = true)
    public long countColleagues(UUID userId) {
        return followRepository.countColleagues(userId);
    }
}
