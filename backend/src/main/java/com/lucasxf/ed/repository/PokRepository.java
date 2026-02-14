package com.lucasxf.ed.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.lucasxf.ed.domain.Pok;

/**
 * Data access for {@link Pok} entities.
 *
 * <p>All queries automatically filter out soft-deleted POKs (where deletedAt IS NOT NULL).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public interface PokRepository extends JpaRepository<Pok, UUID> {

    /**
     * Finds all active (non-deleted) POKs for a specific user with pagination and sorting.
     *
     * @param userId   the user ID
     * @param pageable pagination and sorting parameters
     * @return a page of active POKs for the user
     */
    Page<Pok> findByUserIdAndDeletedAtIsNull(UUID userId, Pageable pageable);

    /**
     * Finds an active (non-deleted) POK by ID.
     *
     * @param id the POK ID
     * @return an {@link Optional} containing the POK if found and active, empty otherwise
     */
    Optional<Pok> findByIdAndDeletedAtIsNull(UUID id);
}
