package com.lucasxf.ed.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lucasxf.ed.domain.Tag;

/**
 * Repository for the global {@link Tag} pool.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public interface TagRepository extends JpaRepository<Tag, UUID> {

    /**
     * Finds a tag by name, case-insensitively.
     *
     * @param name the tag name to search for
     * @return the matching tag, if any
     */
    Optional<Tag> findByNameIgnoreCase(String name);
}
