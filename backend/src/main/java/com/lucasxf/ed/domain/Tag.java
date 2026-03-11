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
 * <p>The {@code name} field is the canonical form: lowercase with spaces replaced by dashes
 * (e.g. {@code "claude-code"}). The {@code displayName} field preserves the original casing
 * with dashes instead of spaces (e.g. {@code "Claude-Code"}).
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

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Tag() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new global tag with canonical name and display name.
     *
     * @param name        the canonical form (lowercase, spaces replaced by dashes)
     * @param displayName the display form (original casing, spaces replaced by dashes)
     */
    public Tag(String name, String displayName) {
        this.name = name;
        this.displayName = displayName;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
