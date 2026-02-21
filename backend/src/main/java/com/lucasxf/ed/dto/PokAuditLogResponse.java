package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.domain.PokAuditLog;

/**
 * Response DTO for a POK audit log entry.
 *
 * @param id         audit entry unique identifier
 * @param pokId      the POK this entry belongs to
 * @param userId     the user who performed the action
 * @param action     the operation type (CREATE, UPDATE, or DELETE)
 * @param oldTitle   title before the change (null for CREATE entries)
 * @param newTitle   title after the change (null for DELETE entries)
 * @param oldContent content before the change (null for CREATE entries)
 * @param newContent content after the change (null for DELETE entries)
 * @param occurredAt timestamp of the operation
 * @author Lucas Xavier Ferreira
 * @since 2026-02-20
 */
public record PokAuditLogResponse(
    UUID id,
    UUID pokId,
    UUID userId,
    String action,
    String oldTitle,
    String newTitle,
    String oldContent,
    String newContent,
    Instant occurredAt
) {

    /**
     * Converts a {@link PokAuditLog} entity to a {@link PokAuditLogResponse} DTO.
     *
     * @param log the audit log entity
     * @return the response DTO
     */
    public static PokAuditLogResponse from(PokAuditLog log) {
        return new PokAuditLogResponse(
            log.getId(),
            log.getPokId(),
            log.getUserId(),
            log.getAction().name(),
            log.getOldTitle(),
            log.getNewTitle(),
            log.getOldContent(),
            log.getNewContent(),
            log.getOccurredAt()
        );
    }
}
