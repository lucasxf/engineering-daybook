package com.lucasxf.ed.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lucasxf.ed.domain.PokAuditLog;

/**
 * Repository for {@link PokAuditLog} audit entries.
 *
 * <p>Audit entries are append-only — no update or delete operations are exposed.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-20
 */
public interface PokAuditLogRepository extends JpaRepository<PokAuditLog, UUID> {

    /**
     * Retrieves all audit log entries for a POK, ordered most-recent first.
     *
     * @param pokId the POK ID
     * @return list of audit entries, newest first
     */
    List<PokAuditLog> findByPokIdOrderByOccurredAtDesc(UUID pokId);

    /**
     * Deletes all audit log entries for the given POK IDs.
     * Used during account deletion to remove all audit history for a user's POKs.
     *
     * @param pokIds the IDs of POKs whose audit logs should be deleted
     */
    @Modifying
    @Query("DELETE FROM PokAuditLog pal WHERE pal.pokId IN :pokIds")
    void deleteByPokIdIn(@Param("pokIds") List<UUID> pokIds);
}
