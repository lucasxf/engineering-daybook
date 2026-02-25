package com.lucasxf.ed.config;

import java.time.Instant;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link JacksonConfig}.
 *
 * <p>Verifies that the {@link ObjectMapper} bean is configured with Java time
 * module support and does not write dates as timestamps.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@DisplayName("JacksonConfig")
class JacksonConfigTest {

    private final JacksonConfig jacksonConfig = new JacksonConfig();

    @Test
    @DisplayName("objectMapper bean is not null")
    void objectMapper_returnsNonNullMapper() {
        ObjectMapper mapper = jacksonConfig.objectMapper();

        assertThat(mapper).isNotNull();
    }

    @Test
    @DisplayName("objectMapper serializes Instant as ISO-8601 string, not timestamp")
    void objectMapper_serializesInstantAsIsoString() throws JsonProcessingException {
        ObjectMapper mapper = jacksonConfig.objectMapper();

        assertThat(mapper.isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)).isFalse();

        // Verify round-trip: Instant → JSON string → Instant
        Instant now = Instant.parse("2026-02-25T10:00:00Z");
        String json = mapper.writeValueAsString(now);

        // Should produce a quoted ISO-8601 string, not a numeric epoch value
        assertThat(json).isEqualTo("\"2026-02-25T10:00:00Z\"");
    }
}
