package com.lucasxf.ed.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;

/**
 * Repository for {@link PokShare} entities.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public interface PokShareRepository extends JpaRepository<PokShare, UUID> {

    /**
     * Returns a page of shares created by the given user, filtered by visibility tiers.
     *
     * @param sharedByUserId the sharer's user ID
     * @param visibilities   the set of visibility tiers to include
     * @param pageable       pagination parameters
     * @return page of matching shares
     */
    Page<PokShare> findBySharedByUserIdAndVisibilityIn(
        UUID sharedByUserId, Collection<Pok.Visibility> visibilities, Pageable pageable);

    /**
     * Returns all shares created by the given user (used for owner's own feed).
     *
     * @param sharedByUserId the sharer's user ID
     * @param pageable       pagination parameters
     * @return page of shares
     */
    Page<PokShare> findBySharedByUserId(UUID sharedByUserId, Pageable pageable);

    /**
     * Returns a share by ID and sharer's user ID (used for ownership verification).
     *
     * @param id             the share ID
     * @param sharedByUserId the expected owner's user ID
     * @return optional share if it exists and belongs to the given user
     */
    Optional<PokShare> findByIdAndSharedByUserId(UUID id, UUID sharedByUserId);

    /**
     * Deletes all shares referencing the given original POK.
     * Called within the same transaction as visibility→PRIVATE or soft-delete of the original.
     *
     * @param originalPokId the original POK's ID
     */
    void deleteByOriginalPokId(UUID originalPokId);

    /**
     * Checks whether the given user has already re-learned the given original POK.
     *
     * @param originalPokId  the original POK's ID
     * @param sharedByUserId the potential sharer's user ID
     * @return true if a share already exists
     */
    boolean existsByOriginalPokIdAndSharedByUserId(UUID originalPokId, UUID sharedByUserId);

    /**
     * Returns all shares of a given original POK (e.g. for bulk operations).
     *
     * @param originalPokId the original POK's ID
     * @return list of shares referencing that POK
     */
    List<PokShare> findByOriginalPokId(UUID originalPokId);

    /**
     * Counts all shares created by the given user.
     *
     * <p>Used alongside a bounded fetch in feed pagination to compute the accurate
     * total element count without loading all rows into memory.
     *
     * @param sharedByUserId the sharer's user ID
     * @return total number of shares by this user
     */
    long countBySharedByUserId(UUID sharedByUserId);

    /**
     * Counts shares created by the given user, filtered by visibility tiers.
     *
     * <p>Used alongside a bounded fetch in learner feed pagination to compute the accurate
     * total element count without loading all rows into memory.
     *
     * @param sharedByUserId the sharer's user ID
     * @param visibilities   the set of visibility tiers to include
     * @return total number of matching shares
     */
    long countBySharedByUserIdAndVisibilityIn(
        UUID sharedByUserId, Collection<Pok.Visibility> visibilities);
}
