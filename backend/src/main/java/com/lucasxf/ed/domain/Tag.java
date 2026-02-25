package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Global tag pool entity. Tags are shared across all users and are never physically deleted.
 * Users interact with tags via {@link UserTag} subscriptions.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Tag() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new global tag.
     *
     * @param name the tag name (trimmed, case-preserved, unique case-insensitively)
     */
    public Tag(String name) {
        this.name = name;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
