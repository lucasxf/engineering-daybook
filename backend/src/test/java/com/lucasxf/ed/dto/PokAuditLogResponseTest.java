package com.lucasxf.ed.dto;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.lucasxf.ed.domain.PokAuditLog;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link PokAuditLogResponse}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@DisplayName("PokAuditLogResponse")
class PokAuditLogResponseTest {

    @Nested
    @DisplayName("from(PokAuditLog)")
    class From {

        @Test
        @DisplayName("maps all fields from a CREATE audit log entry")
        void from_createEntry_mapsAllFields() {
            UUID pokId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = Instant.now();

            PokAuditLog log = new PokAuditLog(
                pokId, userId, PokAuditLog.Action.CREATE,
                null, "New Title",
                null, "New content",
                now
            );

            PokAuditLogResponse response = PokAuditLogResponse.from(log);

            assertThat(response.pokId()).isEqualTo(pokId);
            assertThat(response.userId()).isEqualTo(userId);
            assertThat(response.action()).isEqualTo("CREATE");
            assertThat(response.oldTitle()).isNull();
            assertThat(response.newTitle()).isEqualTo("New Title");
            assertThat(response.oldContent()).isNull();
            assertThat(response.newContent()).isEqualTo("New content");
            assertThat(response.occurredAt()).isEqualTo(now);
            // id is null because the entity was not persisted (no @GeneratedValue trigger)
        }

        @Test
        @DisplayName("maps all fields from an UPDATE audit log entry")
        void from_updateEntry_mapsOldAndNewValues() {
            UUID pokId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = Instant.now();

            PokAuditLog log = new PokAuditLog(
                pokId, userId, PokAuditLog.Action.UPDATE,
                "Old Title", "New Title",
                "Old content", "New content",
                now
            );

            PokAuditLogResponse response = PokAuditLogResponse.from(log);

            assertThat(response.action()).isEqualTo("UPDATE");
            assertThat(response.oldTitle()).isEqualTo("Old Title");
            assertThat(response.newTitle()).isEqualTo("New Title");
            assertThat(response.oldContent()).isEqualTo("Old content");
            assertThat(response.newContent()).isEqualTo("New content");
            assertThat(response.occurredAt()).isEqualTo(now);
        }

        @Test
        @DisplayName("maps all fields from a DELETE audit log entry")
        void from_deleteEntry_newTitleAndContentAreNull() {
            UUID pokId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            Instant now = Instant.now();

            PokAuditLog log = new PokAuditLog(
                pokId, userId, PokAuditLog.Action.DELETE,
                "Deleted Title", null,
                "Deleted content", null,
                now
            );

            PokAuditLogResponse response = PokAuditLogResponse.from(log);

            assertThat(response.action()).isEqualTo("DELETE");
            assertThat(response.oldTitle()).isEqualTo("Deleted Title");
            assertThat(response.newTitle()).isNull();
            assertThat(response.oldContent()).isEqualTo("Deleted content");
            assertThat(response.newContent()).isNull();
        }
    }
}
