package com.lucasxf.ed.domain;

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
 * Association between a POK and a tag, carrying the assignment source.
 *
 * <p>Source values:
 * <ul>
 *   <li>{@code MANUAL} — assigned directly by the user</li>
 *   <li>{@code AI} — suggested by AI and approved without modification</li>
 *   <li>{@code AI_EDITED} — suggested by AI, user edited the name before approving</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@Entity
@Table(name = "pok_tags")
public class PokTag {

    public enum Source {
        MANUAL, AI, AI_EDITED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pok_id", nullable = false)
    private UUID pokId;

    @Column(name = "tag_id", nullable = false)
    private UUID tagId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Source source;

    protected PokTag() {
        // JPA requires a no-arg constructor
    }

    /**
     * Creates a new POK–tag assignment.
     *
     * @param pokId  the POK being tagged
     * @param tagId  the global tag applied
     * @param source how the tag was assigned
     */
    public PokTag(UUID pokId, UUID tagId, Source source) {
        this.pokId = pokId;
        this.tagId = tagId;
        this.source = source;
    }

    public UUID getId() {
        return id;
    }

    public UUID getPokId() {
        return pokId;
    }

    public UUID getTagId() {
        return tagId;
    }

    public Source getSource() {
        return source;
    }
}
