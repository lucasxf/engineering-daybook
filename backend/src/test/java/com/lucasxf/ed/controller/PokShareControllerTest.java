package com.lucasxf.ed.controller;

import java.time.Instant;
import java.util.UUID;

import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.PokShareResponse;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.exception.PokShareAccessDeniedException;
import com.lucasxf.ed.exception.PokShareConflictException;
import com.lucasxf.ed.exception.PokShareNotFoundException;
import com.lucasxf.ed.exception.SelfShareException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.PokShareService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for {@link PokShareController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@WebMvcTest(PokShareController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class PokShareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PokShareService pokShareService;

    @MockitoBean
    private JwtService jwtService;

    private final UUID userId = UUID.randomUUID();
    private final UUID pokId = UUID.randomUUID();
    private final UUID shareId = UUID.randomUUID();

    // ── POST /{id}/share ─────────────────────────────────────────────────────

    @Test
    void share_publicPok_returns201WithShareResponse() throws Exception {
        PokResponse originalPok = new PokResponse(
            "owned", pokId, UUID.randomUUID(), "Original Title", "Original Content",
            Pok.Visibility.PUBLIC, null, null, null, null, null, null, null, null);
        PokShareResponse response = new PokShareResponse(
            "shared", shareId, pokId, originalPok, "alice", null, Pok.Visibility.PUBLIC, Instant.now(), null, null, null);

        when(pokShareService.share(eq(pokId), any(UUID.class), isNull(), eq(Pok.Visibility.PUBLIC)))
            .thenReturn(response);

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("shared"))
            .andExpect(jsonPath("$.id").value(shareId.toString()))
            .andExpect(jsonPath("$.originalPokId").value(pokId.toString()))
            .andExpect(jsonPath("$.sharedByHandle").value("alice"))
            .andExpect(jsonPath("$.visibility").value("PUBLIC"));
    }

    @Test
    void share_withNote_returns201() throws Exception {
        String note = "Great explanation of this concept";
        PokResponse originalPok = new PokResponse(
            "owned", pokId, UUID.randomUUID(), "Title", "Content",
            Pok.Visibility.PUBLIC, null, null, null, null, null, null, null, null);
        PokShareResponse response = new PokShareResponse(
            "shared", shareId, pokId, originalPok, "alice", note, Pok.Visibility.PUBLIC, Instant.now(), null, null, null);

        when(pokShareService.share(eq(pokId), any(UUID.class), eq(note), eq(Pok.Visibility.PUBLIC)))
            .thenReturn(response);

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"" + note + "\",\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.note").value(note));
    }

    @Test
    void share_selfShare_returns400() throws Exception {
        when(pokShareService.share(eq(pokId), any(UUID.class), any(), any()))
            .thenThrow(new SelfShareException("Cannot re-learn your own learning"));

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void share_pokNotFound_returns404() throws Exception {
        when(pokShareService.share(eq(pokId), any(UUID.class), any(), any()))
            .thenThrow(new PokNotFoundException("POK not found: " + pokId));

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void share_duplicate_returns409() throws Exception {
        when(pokShareService.share(eq(pokId), any(UUID.class), any(), any()))
            .thenThrow(new PokShareConflictException("Already re-learned this learning"));

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void share_notePastMaxLength_returns400() throws Exception {
        String tooLong = "x".repeat(501);

        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"" + tooLong + "\",\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void share_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/poks/{id}/share", pokId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isUnauthorized());
    }

    // ── DELETE /shared/{shareId} ─────────────────────────────────────────────

    @Test
    void unshare_byOwner_returns204() throws Exception {
        doNothing().when(pokShareService).unshare(eq(shareId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isNoContent());
    }

    @Test
    void unshare_byNonOwner_returns403() throws Exception {
        doThrow(new PokShareAccessDeniedException("Access denied for share: " + shareId))
            .when(pokShareService).unshare(eq(shareId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isForbidden());
    }

    @Test
    void unshare_shareNotFound_returns404() throws Exception {
        doThrow(new PokShareNotFoundException("Share not found: " + shareId))
            .when(pokShareService).unshare(eq(shareId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isNotFound());
    }

    @Test
    void unshare_unauthenticated_returns401() throws Exception {
        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId))
            .andExpect(status().isUnauthorized());
    }

    // ── GET /shared/{shareId} ────────────────────────────────────────────────

    @Test
    void getShareById_found_returns200WithShareResponse() throws Exception {
        PokResponse originalPok = new PokResponse(
            "owned", pokId, UUID.randomUUID(), "Title", "Content",
            Pok.Visibility.PUBLIC, null, null, null, null, null, null, null, null);
        PokShareResponse response = new PokShareResponse(
            "shared", shareId, pokId, originalPok, "bob", "A note", Pok.Visibility.PUBLIC, Instant.now(), null, null, null);

        when(pokShareService.getShareById(eq(shareId), any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.type").value("shared"))
            .andExpect(jsonPath("$.id").value(shareId.toString()))
            .andExpect(jsonPath("$.sharedByHandle").value("bob"))
            .andExpect(jsonPath("$.note").value("A note"));
    }

    @Test
    void getShareById_accessDenied_returns403() throws Exception {
        when(pokShareService.getShareById(eq(shareId), any(UUID.class)))
            .thenThrow(new PokShareAccessDeniedException("Access denied for share: " + shareId));

        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isForbidden());
    }

    @Test
    void getShareById_notFound_returns404() throws Exception {
        when(pokShareService.getShareById(eq(shareId), any(UUID.class)))
            .thenThrow(new PokShareNotFoundException("Share not found: " + shareId));

        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", shareId)
                .with(user(userId.toString())))
            .andExpect(status().isNotFound());
    }

    @Test
    void getShareById_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", shareId))
            .andExpect(status().isUnauthorized());
    }
}
