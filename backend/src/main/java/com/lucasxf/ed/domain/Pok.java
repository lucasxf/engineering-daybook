package com.lucasxf.ed.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import org.hibernate.annotations.ColumnTransformer;

import com.lucasxf.ed.config.VectorAttributeConverter;

/**
 * POK (Piece of Knowledge) entity representing a user's learning entry.
 *
 * <p>Design philosophy: Minimize friction for knowledge capture.
 * Title is optional to support quick learnings without forced categorization.
 * Content is mandatory as it represents the actual knowledge.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@Entity
@Table(name = "poks")
public class Pok {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(length = 200)  // NULLABLE - title is optional
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Vector embedding for semantic search (384 dims, paraphrase-multilingual-MiniLM-L12-v2).
     * Null until generated asynchronously after creation. Cleared on content update
     * and regenerated async. POKs with null embedding are excluded from semantic search.
     */
    @Column(columnDefinition = "vector(384)")
    @ColumnTransformer(write = "CAST(? AS vector)")
    @Convert(converter = VectorAttributeConverter.class)
    private float[] embedding;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Pok() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new POK.
     *
     * @param userId  the ID of the user creating the POK
     * @param title   optional title (can be null or empty for frictionless capture)
     * @param content mandatory content (the actual knowledge/learning)
     */
    public Pok(UUID userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    /**
     * Soft deletes this POK by setting the deletion timestamp.
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    /**
     * Checks if this POK is soft-deleted.
     *
     * @return true if deleted, false otherwise
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * Updates the title of this POK.
     *
     * @param title the new title (can be null or empty)
     */
    public void updateTitle(String title) {
        this.title = title;
    }

    /**
     * Updates the content of this POK.
     *
     * @param content the new content
     */
    public void updateContent(String content) {
        this.content = content;
    }

    /**
     * Sets the creation timestamp.
     * Package-private for testing purposes only.
     *
     * @param createdAt the creation timestamp
     */
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Sets the update timestamp.
     * Package-private for testing purposes only.
     *
     * @param updatedAt the update timestamp
     */
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Stores a new embedding vector, replacing any previous value.
     *
     * @param embedding the new embedding (must have 384 dimensions)
     */
    public void updateEmbedding(float[] embedding) {
        this.embedding = embedding;
    }

    /**
     * Clears the embedding, marking it as stale after a content update.
     * The embedding will be regenerated asynchronously.
     */
    public void clearEmbedding() {
        this.embedding = null;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public float[] getEmbedding() {
        return embedding;
    }
}
