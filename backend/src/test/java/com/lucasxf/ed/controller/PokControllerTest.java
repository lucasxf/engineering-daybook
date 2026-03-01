package com.lucasxf.ed.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.dto.CreatePokRequest;
import com.lucasxf.ed.dto.PokAuditLogResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.UpdatePokRequest;
import java.util.Collections;
import com.lucasxf.ed.exception.PokAccessDeniedException;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.PokService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link PokController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@WebMvcTest(PokController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class PokControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private PokService pokService;

    @MockitoBean
    private JwtService jwtService; // Required by SecurityConfig

    private final UUID userId = UUID.randomUUID();
    private final UUID pokId = UUID.randomUUID();

    // ===== CREATE POK TESTS =====

    @Test
    @WithMockUser
    void createPok_withValidRequest_shouldReturn201() throws Exception {
        // Given
        CreatePokRequest request = new CreatePokRequest("Test Title", "Test content", null);
        PokResponse response = new PokResponse(
            pokId, userId, "Test Title", "Test content", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        when(pokService.create(any(CreatePokRequest.class), any(UUID.class)))
            .thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/v1/poks")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(pokId.toString()))
            .andExpect(jsonPath("$.title").value("Test Title"))
            .andExpect(jsonPath("$.content").value("Test content"));

        verify(pokService).create(any(CreatePokRequest.class), eq(userId));
    }

    @Test
    @WithMockUser
    void createPok_withoutTitle_shouldReturn201() throws Exception {
        // Given: Title is optional (frictionless capture)
        CreatePokRequest request = new CreatePokRequest(null, "Content without title", null);
        PokResponse response = new PokResponse(
            pokId, userId, null, "Content without title", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        when(pokService.create(any(CreatePokRequest.class), any(UUID.class)))
            .thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/v1/poks")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").isEmpty())
            .andExpect(jsonPath("$.content").value("Content without title"));
    }

    @Test
    @WithMockUser
    void createPok_withEmptyContent_shouldReturn400() throws Exception {
        // Given: Content is mandatory
        CreatePokRequest request = new CreatePokRequest("Title", "", null);

        // When/Then
        mockMvc.perform(post("/api/v1/poks")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void createPok_withTitleTooLong_shouldReturn400() throws Exception {
        // Given: Title max 200 chars
        String longTitle = "a".repeat(201);
        CreatePokRequest request = new CreatePokRequest(longTitle, "Content", null);

        // When/Then
        mockMvc.perform(post("/api/v1/poks")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createPok_withoutAuthentication_shouldReturn401() throws Exception {
        // Given
        CreatePokRequest request = new CreatePokRequest("Title", "Content", null);

        // When/Then: No authentication
        mockMvc.perform(post("/api/v1/poks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    // ===== GET POK BY ID TESTS =====

    @Test
    @WithMockUser
    void getPokById_whenExists_shouldReturn200() throws Exception {
        // Given
        PokResponse response = new PokResponse(
            pokId, userId, "Title", "Content", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        when(pokService.getById(eq(pokId), any(UUID.class))).thenReturn(response);

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(pokId.toString()))
            .andExpect(jsonPath("$.title").value("Title"))
            .andExpect(jsonPath("$.content").value("Content"));

        verify(pokService).getById(eq(pokId), eq(userId));
    }

    @Test
    @WithMockUser
    void getPokById_whenNotFound_shouldReturn404() throws Exception {
        // Given
        when(pokService.getById(eq(pokId), any(UUID.class)))
            .thenThrow(new PokNotFoundException("POK not found"));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isNotFound());

        verify(pokService).getById(eq(pokId), eq(userId));
    }

    @Test
    @WithMockUser
    void getPokById_whenAccessDenied_shouldReturn403() throws Exception {
        // Given
        when(pokService.getById(eq(pokId), any(UUID.class)))
            .thenThrow(new PokAccessDeniedException("You do not have permission to access this POK"));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isForbidden());

        verify(pokService).getById(eq(pokId), eq(userId));
    }

    @Test
    void getPokById_withoutAuthentication_shouldReturn401() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}", pokId))
            .andExpect(status().isUnauthorized());
    }

    // ===== LIST POKS TESTS =====

    @Test
    @WithMockUser
    void listPoks_shouldReturn200WithPagedResults() throws Exception {
        // Given
        PokResponse pok1 = new PokResponse(
            UUID.randomUUID(), userId, "Title 1", "Content 1", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );
        PokResponse pok2 = new PokResponse(
            UUID.randomUUID(), userId, null, "Content 2", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        Page<PokResponse> page = new PageImpl<>(
            List.of(pok1, pok2),
            PageRequest.of(0, 20),
            2
        );

        when(pokService.search(any(UUID.class), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20))).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.content[0].title").value("Title 1"))
            .andExpect(jsonPath("$.content[1].title").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.size").value(20));

        verify(pokService).search(eq(userId), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    @WithMockUser
    void listPoks_withPagination_shouldReturn200() throws Exception {
        // Given
        Page<PokResponse> emptyPage = Page.empty(PageRequest.of(1, 10));

        when(pokService.search(any(UUID.class), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(1), eq(10))).thenReturn(emptyPage);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .param("page", "1")
                .param("size", "10")
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.number").value(1))
            .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void listPoks_withoutAuthentication_shouldReturn401() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/v1/poks"))
            .andExpect(status().isUnauthorized());
    }

    // ===== UPDATE POK TESTS =====

    @Test
    @WithMockUser
    void updatePok_withValidRequest_shouldReturn200() throws Exception {
        // Given
        UpdatePokRequest request = new UpdatePokRequest("Updated Title", "Updated content");
        PokResponse response = new PokResponse(
            pokId, userId, "Updated Title", "Updated content", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        when(pokService.update(eq(pokId), any(UpdatePokRequest.class), any(UUID.class)))
            .thenReturn(response);

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Updated Title"))
            .andExpect(jsonPath("$.content").value("Updated content"));

        verify(pokService).update(eq(pokId), any(UpdatePokRequest.class), eq(userId));
    }

    @Test
    @WithMockUser
    void updatePok_removingTitle_shouldReturn200() throws Exception {
        // Given: User removes title (sets to null)
        UpdatePokRequest request = new UpdatePokRequest(null, "Content only");
        PokResponse response = new PokResponse(
            pokId, userId, null, "Content only", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );

        when(pokService.update(eq(pokId), any(UpdatePokRequest.class), any(UUID.class)))
            .thenReturn(response);

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").isEmpty())
            .andExpect(jsonPath("$.content").value("Content only"));
    }

    @Test
    @WithMockUser
    void updatePok_whenNotFound_shouldReturn404() throws Exception {
        // Given
        UpdatePokRequest request = new UpdatePokRequest("Title", "Content");

        when(pokService.update(eq(pokId), any(UpdatePokRequest.class), any(UUID.class)))
            .thenThrow(new PokNotFoundException("POK not found"));

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void updatePok_whenAccessDenied_shouldReturn403() throws Exception {
        // Given
        UpdatePokRequest request = new UpdatePokRequest("Title", "Content");

        when(pokService.update(eq(pokId), any(UpdatePokRequest.class), any(UUID.class)))
            .thenThrow(new PokAccessDeniedException("You do not have permission to access this POK"));

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void updatePok_withEmptyContent_shouldReturn400() throws Exception {
        // Given: Content is mandatory
        UpdatePokRequest request = new UpdatePokRequest("Title", "");

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void updatePok_withoutAuthentication_shouldReturn401() throws Exception {
        // Given
        UpdatePokRequest request = new UpdatePokRequest("Title", "Content");

        // When/Then
        mockMvc.perform(put("/api/v1/poks/{id}", pokId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    // ===== DELETE POK TESTS =====

    @Test
    @WithMockUser
    void deletePok_whenExists_shouldReturn204() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isNoContent());

        verify(pokService).softDelete(eq(pokId), eq(userId));
    }

    @Test
    @WithMockUser
    void deletePok_whenNotFound_shouldReturn404() throws Exception {
        // Given
        doThrow(new PokNotFoundException("POK not found"))
            .when(pokService).softDelete(eq(pokId), any(UUID.class));

        // When/Then
        mockMvc.perform(delete("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isNotFound());

        verify(pokService).softDelete(eq(pokId), eq(userId));
    }

    @Test
    @WithMockUser
    void deletePok_whenAccessDenied_shouldReturn403() throws Exception {
        // Given
        doThrow(new PokAccessDeniedException("You do not have permission to access this POK"))
            .when(pokService).softDelete(eq(pokId), any(UUID.class));

        // When/Then
        mockMvc.perform(delete("/api/v1/poks/{id}", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isForbidden());

        verify(pokService).softDelete(eq(pokId), eq(userId));
    }

    @Test
    void deletePok_withoutAuthentication_shouldReturn401() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/v1/poks/{id}", pokId))
            .andExpect(status().isUnauthorized());
    }

    // ===== SEARCH/FILTER/SORT TESTS =====

    @Test
    @WithMockUser
    void searchPoks_withKeyword_shouldReturn200() throws Exception {
        // Given
        PokResponse pok = new PokResponse(
            pokId, userId, "Spring Boot", "Content about Spring", null, Instant.now(), Instant.now(), Collections.emptyList(), Collections.emptyList()
        );
        Page<PokResponse> page = new PageImpl<>(List.of(pok), PageRequest.of(0, 20), 1);

        when(pokService.search(
            any(UUID.class),
            eq("spring"),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        )).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString()))
                .param("keyword", "spring"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("Spring Boot"))
            .andExpect(jsonPath("$.totalElements").value(1));

        verify(pokService).search(eq(userId), eq("spring"), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    @WithMockUser
    void searchPoks_withSortParameters_shouldReturn200() throws Exception {
        // Given
        Page<PokResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        when(pokService.search(
            any(UUID.class),
            eq(null),
            eq(null),
            eq("createdAt"),
            eq("ASC"),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        )).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString()))
                .param("sortBy", "createdAt")
                .param("sortDirection", "ASC"))
            .andExpect(status().isOk());

        verify(pokService).search(eq(userId), eq(null), eq(null), eq("createdAt"), eq("ASC"), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    @WithMockUser
    void searchPoks_withDateFilters_shouldReturn200() throws Exception {
        // Given
        Page<PokResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        when(pokService.search(
            any(UUID.class),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq("2026-01-01T00:00:00Z"),
            eq("2026-01-31T23:59:59Z"),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        )).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString()))
                .param("createdFrom", "2026-01-01T00:00:00Z")
                .param("createdTo", "2026-01-31T23:59:59Z"))
            .andExpect(status().isOk());

        verify(pokService).search(
            eq(userId),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq("2026-01-01T00:00:00Z"),
            eq("2026-01-31T23:59:59Z"),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        );
    }

    @Test
    @WithMockUser
    void searchPoks_withAllParameters_shouldReturn200() throws Exception {
        // Given
        Page<PokResponse> page = new PageImpl<>(List.of(), PageRequest.of(1, 10), 0);

        when(pokService.search(
            any(UUID.class),
            eq("docker"),
            eq(null),
            eq("updatedAt"),
            eq("DESC"),
            eq("2026-01-01T00:00:00Z"),
            eq("2026-01-31T23:59:59Z"),
            eq("2026-02-01T00:00:00Z"),
            eq("2026-02-28T23:59:59Z"),
            eq(1),
            eq(10)
        )).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString()))
                .param("keyword", "docker")
                .param("sortBy", "updatedAt")
                .param("sortDirection", "DESC")
                .param("createdFrom", "2026-01-01T00:00:00Z")
                .param("createdTo", "2026-01-31T23:59:59Z")
                .param("updatedFrom", "2026-02-01T00:00:00Z")
                .param("updatedTo", "2026-02-28T23:59:59Z")
                .param("page", "1")
                .param("size", "10"))
            .andExpect(status().isOk());

        verify(pokService).search(
            eq(userId),
            eq("docker"),
            eq(null),
            eq("updatedAt"),
            eq("DESC"),
            eq("2026-01-01T00:00:00Z"),
            eq("2026-01-31T23:59:59Z"),
            eq("2026-02-01T00:00:00Z"),
            eq("2026-02-28T23:59:59Z"),
            eq(1),
            eq(10)
        );
    }

    @Test
    @WithMockUser
    void searchPoks_withDefaultParameters_shouldReturn200() throws Exception {
        // Given: No parameters (should use defaults)
        Page<PokResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        when(pokService.search(
            any(UUID.class),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        )).thenReturn(page);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString())))
            .andExpect(status().isOk());

        verify(pokService).search(eq(userId), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    @WithMockUser
    void searchPoks_withEmptyResults_shouldReturn200() throws Exception {
        // Given: Search returns no results
        Page<PokResponse> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        when(pokService.search(
            any(UUID.class),
            eq("nonexistent"),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(null),
            eq(0),
            eq(20)
        )).thenReturn(emptyPage);

        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .with(user(userId.toString()))
                .param("keyword", "nonexistent"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));

        verify(pokService).search(eq(userId), eq("nonexistent"), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    void searchPoks_withoutAuthentication_shouldReturn401() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/v1/poks")
                .param("keyword", "test"))
            .andExpect(status().isUnauthorized());
    }

    // ===== GET HISTORY TESTS =====

    @Test
    @WithMockUser
    void getHistory_withValidOwner_shouldReturn200WithEntries() throws Exception {
        // Given
        PokAuditLogResponse entry1 = new PokAuditLogResponse(
            UUID.randomUUID(), pokId, userId, "CREATE",
            null, "Title", null, "Content", Instant.now().minusSeconds(100)
        );
        PokAuditLogResponse entry2 = new PokAuditLogResponse(
            UUID.randomUUID(), pokId, userId, "UPDATE",
            "Title", "Updated Title", "Content", "Updated content", Instant.now()
        );

        when(pokService.getHistory(eq(pokId), any(UUID.class)))
            .thenReturn(List.of(entry2, entry1));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}/history", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].action").value("UPDATE"))
            .andExpect(jsonPath("$[1].action").value("CREATE"));

        verify(pokService).getHistory(eq(pokId), eq(userId));
    }

    @Test
    @WithMockUser
    void getHistory_whenAccessDenied_shouldReturn403() throws Exception {
        // Given
        when(pokService.getHistory(eq(pokId), any(UUID.class)))
            .thenThrow(new PokAccessDeniedException("You do not have permission to access this POK"));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}/history", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void getHistory_whenPokNotFound_shouldReturn404() throws Exception {
        // Given
        when(pokService.getHistory(eq(pokId), any(UUID.class)))
            .thenThrow(new PokNotFoundException("POK not found"));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}/history", pokId)
                .with(user(userId.toString())))
            .andExpect(status().isNotFound());
    }

    @Test
    void getHistory_withoutAuthentication_shouldReturn401() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/v1/poks/{id}/history", pokId))
            .andExpect(status().isUnauthorized());
    }
}
