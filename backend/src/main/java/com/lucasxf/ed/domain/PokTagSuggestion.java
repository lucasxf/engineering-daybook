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
 * AI-generated tag suggestion pending user decision.
 *
 * <p>Status values:
 * <ul>
 *   <li>{@code PENDING} — awaiting user action</li>
 *   <li>{@code APPROVED} — user approved; a {@link PokTag} has been created</li>
 *   <li>{@code REJECTED} — user rejected; no tag was created</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@Entity
@Table(name = "pok_tag_suggestions")
public class PokTagSuggestion {

    public enum Status {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pok_id", nullable = false)
    private UUID pokId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "suggested_name", nullable = false, length = 100)
    private String suggestedName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PokTagSuggestion() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new PENDING tag suggestion.
     *
     * @param pokId         the POK for which the suggestion was generated
     * @param userId        the owner of the POK
     * @param suggestedName the tag name suggested by the AI
     */
    public PokTagSuggestion(UUID pokId, UUID userId, String suggestedName) {
        this.pokId = pokId;
        this.userId = userId;
        this.suggestedName = suggestedName;
    }

    /**
     * Marks this suggestion as approved.
     */
    public void approve() {
        this.status = Status.APPROVED;
    }

    /**
     * Marks this suggestion as rejected.
     */
    public void reject() {
        this.status = Status.REJECTED;
    }

    public UUID getId() {
        return id;
    }

    public UUID getPokId() {
        return pokId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getSuggestedName() {
        return suggestedName;
    }

    public Status getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
