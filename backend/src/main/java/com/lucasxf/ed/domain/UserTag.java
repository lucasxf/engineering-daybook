package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Per-user tag subscription. Bridges the global {@link Tag} pool and a specific user.
 * Supports soft-delete so that rename and delete operations never remove global tag records.
 *
 * <p>Color is stored here (not on {@link Tag}) so each user can have their own color
 * assignment for the same global tag.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@Entity
@Table(name = "user_tags")
public class UserTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", nullable = false, updatable = false)
    private Tag tag;

    @Column(nullable = false, length = 20)
    private String color;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected UserTag() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new user-tag subscription.
     *
     * @param userId the user who owns this subscription
     * @param tag    the global tag being subscribed to
     * @param color  the color assigned to this tag for this user
     */
    public UserTag(UUID userId, Tag tag, String color) {
        this.userId = userId;
        this.tag = tag;
        this.color = color;
    }

    /**
     * Soft-deletes this subscription. The global {@link Tag} record is not affected.
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    /**
     * Returns whether this subscription is active (not soft-deleted).
     *
     * @return true if active, false if deleted
     */
    public boolean isActive() {
        return deletedAt == null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public Tag getTag() {
        return tag;
    }

    public String getColor() {
        return color;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }
}
