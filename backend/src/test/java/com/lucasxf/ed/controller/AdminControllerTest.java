package com.lucasxf.ed.controller;

import com.lucasxf.ed.config.AdminProperties;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.EmbeddingBackfillService;
import com.lucasxf.ed.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link AdminController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties({AdminProperties.class, CorsProperties.class})
@DisplayName("AdminController")
class AdminControllerTest {

    private static final String VALID_KEY = "test-internal-key";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmbeddingBackfillService embeddingBackfillService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AdminProperties adminProperties;

    @Test
    @DisplayName("POST /admin/poks/backfill-embeddings with valid key returns 202 with enqueued count")
    void backfill_withValidKey_returns202() throws Exception {
        when(adminProperties.internalKey()).thenReturn(VALID_KEY);
        when(embeddingBackfillService.backfill()).thenReturn(42);

        mockMvc.perform(post("/api/v1/admin/poks/backfill-embeddings")
                .header("X-Internal-Key", VALID_KEY))
            .andExpect(status().isAccepted())
            .andExpect(jsonPath("$.enqueued").value(42));

        verify(embeddingBackfillService).backfill();
    }

    @Test
    @DisplayName("POST /admin/poks/backfill-embeddings with wrong key returns 401")
    void backfill_withWrongKey_returns401() throws Exception {
        when(adminProperties.internalKey()).thenReturn(VALID_KEY);

        mockMvc.perform(post("/api/v1/admin/poks/backfill-embeddings")
                .header("X-Internal-Key", "wrong-key"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /admin/poks/backfill-embeddings without key returns 401")
    void backfill_withoutKey_returns401() throws Exception {
        when(adminProperties.internalKey()).thenReturn(VALID_KEY);

        mockMvc.perform(post("/api/v1/admin/poks/backfill-embeddings"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("returns 202 with enqueued=0 when all POKs already have embeddings")
    void backfill_whenNothingToBackfill_returnsZero() throws Exception {
        when(adminProperties.internalKey()).thenReturn(VALID_KEY);
        when(embeddingBackfillService.backfill()).thenReturn(0);

        mockMvc.perform(post("/api/v1/admin/poks/backfill-embeddings")
                .header("X-Internal-Key", VALID_KEY))
            .andExpect(status().isAccepted())
            .andExpect(jsonPath("$.enqueued").value(0));
    }
}
