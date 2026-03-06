package com.lucasxf.ed.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lucasxf.ed.domain.Tag;

/**
 * Repository for the global {@link Tag} pool.
 *
 * <p>The {@code name} column is canonical (lowercase, dashes), so a plain equality
 * lookup is sufficient — no {@code LOWER()} wrapper needed.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public interface TagRepository extends JpaRepository<Tag, UUID> {

    /**
     * Finds a tag by its canonical name (exact match — name is pre-normalised).
     *
     * @param name the canonical tag name (lowercase, dashes)
     * @return the matching tag, if any
     */
    Optional<Tag> findByName(String name);
}
