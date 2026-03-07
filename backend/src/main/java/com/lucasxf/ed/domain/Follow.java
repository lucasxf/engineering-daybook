package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/**
 * Follow relationship between two learners.
 *
 * <p>Uses a composite primary key {@code (follower_id, followed_id)}.
 * Hard-deleted on unfollow — no soft-delete column (follows have no content to preserve).
 * Self-follows are prevented at the service level and via a DB CHECK constraint.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
@Entity
@Table(name = "follows")
@IdClass(FollowId.class)
public class Follow {

    @Id
    @Column(name = "follower_id", nullable = false)
    private UUID followerId;

    @Id
    @Column(name = "followed_id", nullable = false)
    private UUID followedId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Follow() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new follow relationship.
     *
     * @param followerId the ID of the user who follows
     * @param followedId the ID of the user being followed
     */
    public Follow(UUID followerId, UUID followedId) {
        this.followerId = followerId;
        this.followedId = followedId;
    }

    public UUID getFollowerId() {
        return followerId;
    }

    public UUID getFollowedId() {
        return followedId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
