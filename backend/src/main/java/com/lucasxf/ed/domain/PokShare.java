package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * PokShare entity representing a re-learning: a learner's reference to another learner's PUBLIC POK.
 *
 * <p>A re-learning is a <strong>reference</strong>, not a copy — the original content is SACRED and
 * never duplicated. The original author retains full ownership; the sharer merely signals
 * "I found this valuable and want to celebrate it with my followers."
 *
 * <p>Attribution is always visible. The sharer may add a short personal note (max 500 chars)
 * as their own voice alongside the original content.
 *
 * <p>Visibility invariant: the re-learning's tier cannot be looser than the original's tier.
 * The service layer enforces this at creation time.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@Entity
@Table(name = "pok_shares")
public class PokShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_pok_id", nullable = false)
    private UUID originalPokId;

    @Column(name = "shared_by_user_id", nullable = false)
    private UUID sharedByUserId;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Pok.Visibility visibility = Pok.Visibility.PUBLIC;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PokShare() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new PokShare (re-learning).
     *
     * @param originalPokId     the ID of the original POK being re-learned
     * @param sharedByUserId    the ID of the learner performing the re-learning
     * @param note              optional personal note (max 500 chars, can be null)
     * @param visibility        visibility tier for this re-learning (must not exceed original's tier)
     */
    public PokShare(UUID originalPokId, UUID sharedByUserId, String note, Pok.Visibility visibility) {
        this.originalPokId = originalPokId;
        this.sharedByUserId = sharedByUserId;
        this.note = note;
        this.visibility = visibility;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public UUID getOriginalPokId() {
        return originalPokId;
    }

    public UUID getSharedByUserId() {
        return sharedByUserId;
    }

    public String getNote() {
        return note;
    }

    public Pok.Visibility getVisibility() {
        return visibility;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp.
     * Used in tests to control ordering without relying on database timestamps.
     *
     * @param createdAt the creation timestamp
     */
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
