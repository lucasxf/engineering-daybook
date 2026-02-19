package com.lucasxf.ed.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Searches active POKs for a user with optional keyword, date filters, and dynamic sorting.
     *
     * <p>Keyword search is case-insensitive and searches both title and content using ILIKE.
     * All parameters are optional (null values are ignored).
     *
     * @param userId      the user ID (required)
     * @param keyword     optional keyword to search in title and content (case-insensitive)
     * @param createdFrom optional minimum creation date (inclusive)
     * @param createdTo   optional maximum creation date (inclusive)
     * @param updatedFrom optional minimum update date (inclusive)
     * @param updatedTo   optional maximum update date (inclusive)
     * @param pageable    pagination and sorting parameters
     * @return a page of matching active POKs
     */
    @Query("SELECT p FROM Pok p WHERE p.userId = :userId AND p.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "                      OR LOWER(p.content) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "AND p.createdAt >= COALESCE(:createdFrom, p.createdAt) " +
           "AND p.createdAt <= COALESCE(:createdTo, p.createdAt) " +
           "AND p.updatedAt >= COALESCE(:updatedFrom, p.updatedAt) " +
           "AND p.updatedAt <= COALESCE(:updatedTo, p.updatedAt)")
    Page<Pok> searchPoks(
        @Param("userId") UUID userId,
        @Param("keyword") String keyword,
        @Param("createdFrom") Instant createdFrom,
        @Param("createdTo") Instant createdTo,
        @Param("updatedFrom") Instant updatedFrom,
        @Param("updatedTo") Instant updatedTo,
        Pageable pageable
    );
}
