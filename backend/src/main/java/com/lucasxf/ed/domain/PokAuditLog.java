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
 * Immutable audit log entry recording every create, update, or delete on a POK.
 *
 * <p>Audit entries are never modified after creation. The {@code pok_id} FK uses
 * {@code ON DELETE RESTRICT} to prevent losing history if hard-delete is added later.
 *
 * <p>Content fields capture the state before and after the change:
 * <ul>
 *   <li>CREATE: {@code oldTitle}, {@code oldContent} are null; new values set</li>
 *   <li>UPDATE: both old and new values recorded</li>
 *   <li>DELETE: {@code newTitle}, {@code newContent} are null; old values preserved</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-20
 */
@Entity
@Table(name = "pok_audit_logs")
public class PokAuditLog {

    /**
     * Supported audit actions.
     */
    public enum Action {
        CREATE,
        UPDATE,
        DELETE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pok_id", nullable = false)
    private UUID pokId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Action action;

    @Column(name = "old_title", columnDefinition = "TEXT")
    private String oldTitle;

    @Column(name = "new_title", columnDefinition = "TEXT")
    private String newTitle;

    @Column(name = "old_content", columnDefinition = "TEXT")
    private String oldContent;

    @Column(name = "new_content", columnDefinition = "TEXT")
    private String newContent;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected PokAuditLog() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new audit log entry.
     *
     * @param pokId      the POK being audited
     * @param userId     the user performing the action (denormalized)
     * @param action     the operation type (CREATE, UPDATE, DELETE)
     * @param oldTitle   title before the change (null for CREATE)
     * @param newTitle   title after the change (null for DELETE)
     * @param oldContent content before the change (null for CREATE)
     * @param newContent content after the change (null for DELETE)
     * @param occurredAt timestamp of the operation
     */
    public PokAuditLog(
        UUID pokId,
        UUID userId,
        Action action,
        String oldTitle,
        String newTitle,
        String oldContent,
        String newContent,
        Instant occurredAt
    ) {
        this.pokId = pokId;
        this.userId = userId;
        this.action = action;
        this.oldTitle = oldTitle;
        this.newTitle = newTitle;
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.occurredAt = occurredAt;
    }

    // Getters — no setters: audit entries are immutable after creation

    public UUID getId() {
        return id;
    }

    public UUID getPokId() {
        return pokId;
    }

    public UUID getUserId() {
        return userId;
    }

    public Action getAction() {
        return action;
    }

    public String getOldTitle() {
        return oldTitle;
    }

    public String getNewTitle() {
        return newTitle;
    }

    public String getOldContent() {
        return oldContent;
    }

    public String getNewContent() {
        return newContent;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
