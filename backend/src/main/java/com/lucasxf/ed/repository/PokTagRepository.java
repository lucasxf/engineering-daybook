package com.lucasxf.ed.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lucasxf.ed.domain.PokTag;

/**
 * Repository for {@link PokTag} POK–tag assignments.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public interface PokTagRepository extends JpaRepository<PokTag, UUID> {

    /**
     * Returns all tag assignments for a POK.
     *
     * @param pokId the POK's ID
     * @return list of assignments
     */
    List<PokTag> findByPokId(UUID pokId);

    /**
     * Returns all POK assignments for a specific tag.
     *
     * @param tagId the tag's ID
     * @return list of assignments
     */
    List<PokTag> findByTagId(UUID tagId);

    /**
     * Finds the assignment between a specific POK and tag.
     *
     * @param pokId the POK's ID
     * @param tagId the tag's ID
     * @return the assignment, if any
     */
    Optional<PokTag> findByPokIdAndTagId(UUID pokId, UUID tagId);

    /**
     * Deletes all assignments for a specific tag owned by a user.
     * Used during tag deletion to remove the user's POK associations.
     *
     * @param tagId  the tag being deleted
     * @param pokIds the IDs of POKs owned by the user
     */
    @Modifying
    @Query("DELETE FROM PokTag pt WHERE pt.tagId = :tagId AND pt.pokId IN :pokIds")
    void deleteByTagIdAndPokIdIn(@Param("tagId") UUID tagId, @Param("pokIds") List<UUID> pokIds);

    /**
     * Reassigns all POK–tag links from one tag to another.
     * Used during tag rename to migrate assignments to the target tag.
     *
     * @param oldTagId the tag being soft-deleted
     * @param newTagId the replacement tag
     * @param pokIds   the IDs of POKs owned by the user
     */
    @Modifying
    @Query("UPDATE PokTag pt SET pt.tagId = :newTagId " +
           "WHERE pt.tagId = :oldTagId AND pt.pokId IN :pokIds")
    void reassignTag(
            @Param("oldTagId") UUID oldTagId,
            @Param("newTagId") UUID newTagId,
            @Param("pokIds") List<UUID> pokIds);

    /**
     * Counts how many non-deleted POKs each tag is assigned to for the given user.
     * Returns rows of {@code [tagId, count]} for all tags that have at least one assignment.
     *
     * @param userId the user's ID
     * @return list of {@code Object[]} where {@code [0]} is a {@link UUID} tagId
     *         and {@code [1]} is a {@link Long} count
     */
    @Query("SELECT pt.tagId, COUNT(pt) FROM PokTag pt " +
           "JOIN Pok p ON p.id = pt.pokId " +
           "WHERE p.userId = :userId AND p.deletedAt IS NULL " +
           "GROUP BY pt.tagId")
    List<Object[]> countPoksByTagForUser(@Param("userId") UUID userId);

    /**
     * Deletes all tag assignments for the given POK IDs.
     * Used during account deletion to remove all POK–tag associations.
     *
     * @param pokIds the IDs of POKs whose tag assignments should be deleted
     */
    @Modifying
    @Query("DELETE FROM PokTag pt WHERE pt.pokId IN :pokIds")
    void deleteByPokIdIn(@Param("pokIds") List<UUID> pokIds);
}
