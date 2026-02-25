package com.lucasxf.ed.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.dto.CreateTagRequest;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.dto.TagSuggestionResponse;
import com.lucasxf.ed.dto.UpdateTagRequest;
import com.lucasxf.ed.exception.TagConflictException;
import com.lucasxf.ed.exception.TagNotFoundException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.TagService;
import com.lucasxf.ed.service.TagSuggestionService;

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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for {@link TagController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@WebMvcTest(TagController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class TagControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private TagService tagService;

    @MockitoBean
    private TagSuggestionService tagSuggestionService;

    @MockitoBean
    private JwtService jwtService;

    private final UUID userId = UUID.randomUUID();
    private final UUID tagId = UUID.randomUUID();
    private final UUID pokId = UUID.randomUUID();

    // ===== GET /api/v1/tags =====

    @Test
    void listTags_shouldReturn200WithUserTags() throws Exception {
        // Given
        TagResponse tag = new TagResponse(tagId, UUID.randomUUID(), "java", "blue", Instant.now());
        when(tagService.getUserTags(any())).thenReturn(List.of(tag));

        // When/Then
        mockMvc.perform(get("/api/v1/tags").with(user(userId.toString())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("java"));
    }

    @Test
    void listTags_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/tags"))
                .andExpect(status().isUnauthorized());
    }

    // ===== POST /api/v1/tags =====

    @Test
    void createTag_withValidRequest_shouldReturn201() throws Exception {
        // Given
        CreateTagRequest request = new CreateTagRequest("spring-boot");
        TagResponse response = new TagResponse(tagId, UUID.randomUUID(), "spring-boot", "blue", Instant.now());
        when(tagService.createOrReuse(any(), any())).thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/v1/tags")
                        .with(user(userId.toString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("spring-boot"));
    }

    @Test
    void createTag_withBlankName_shouldReturn400() throws Exception {
        // Given
        CreateTagRequest request = new CreateTagRequest("");

        // When/Then
        mockMvc.perform(post("/api/v1/tags")
                        .with(user(userId.toString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ===== PUT /api/v1/tags/{id} =====

    @Test
    void renameTag_withValidRequest_shouldReturn200() throws Exception {
        // Given
        UpdateTagRequest request = new UpdateTagRequest("kubernetes");
        TagResponse response = new TagResponse(tagId, UUID.randomUUID(), "kubernetes", "purple", Instant.now());
        when(tagService.renameTag(eq(tagId), any(), any())).thenReturn(response);

        // When/Then
        mockMvc.perform(put("/api/v1/tags/" + tagId)
                        .with(user(userId.toString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("kubernetes"));
    }

    @Test
    void renameTag_withConflict_shouldReturn409() throws Exception {
        // Given
        UpdateTagRequest request = new UpdateTagRequest("existing-tag");
        when(tagService.renameTag(any(), any(), any()))
                .thenThrow(new TagConflictException("Tag already exists"));

        // When/Then
        mockMvc.perform(put("/api/v1/tags/" + tagId)
                        .with(user(userId.toString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void renameTag_whenNotFound_shouldReturn404() throws Exception {
        // Given
        UpdateTagRequest request = new UpdateTagRequest("new-name");
        when(tagService.renameTag(any(), any(), any()))
                .thenThrow(new TagNotFoundException("Not found"));

        // When/Then
        mockMvc.perform(put("/api/v1/tags/" + tagId)
                        .with(user(userId.toString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // ===== DELETE /api/v1/tags/{id} =====

    @Test
    void deleteTag_shouldReturn204() throws Exception {
        // Given
        doNothing().when(tagService).deleteTag(eq(tagId), any());

        // When/Then
        mockMvc.perform(delete("/api/v1/tags/" + tagId).with(user(userId.toString())))
                .andExpect(status().isNoContent());

        verify(tagService).deleteTag(eq(tagId), any());
    }

    @Test
    void deleteTag_whenNotFound_shouldReturn404() throws Exception {
        // Given
        doThrow(new TagNotFoundException("Not found")).when(tagService).deleteTag(any(), any());

        // When/Then
        mockMvc.perform(delete("/api/v1/tags/" + tagId).with(user(userId.toString())))
                .andExpect(status().isNotFound());
    }

    // ===== POST /api/v1/poks/{pokId}/tags/{tagId} =====

    @Test
    void assignTag_shouldReturn204() throws Exception {
        // Given
        doNothing().when(tagService).assignTag(eq(pokId), eq(tagId), any());

        // When/Then
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + tagId)
                        .with(user(userId.toString())))
                .andExpect(status().isNoContent());
    }

    // ===== DELETE /api/v1/poks/{pokId}/tags/{tagId} =====

    @Test
    void removeTag_shouldReturn204() throws Exception {
        // Given
        doNothing().when(tagService).removeTag(eq(pokId), eq(tagId), any());

        // When/Then
        mockMvc.perform(delete("/api/v1/poks/" + pokId + "/tags/" + tagId)
                        .with(user(userId.toString())))
                .andExpect(status().isNoContent());
    }

    // ===== GET /api/v1/poks/{pokId}/tags/suggestions =====

    @Test
    void getSuggestions_shouldReturn200WithPendingSuggestions() throws Exception {
        // Given
        UUID suggestionId = UUID.randomUUID();
        TagSuggestionResponse suggestion = new TagSuggestionResponse(
                suggestionId, pokId, "kubernetes", "PENDING");
        when(tagSuggestionService.getPendingSuggestions(eq(pokId), any())).thenReturn(List.of(suggestion));

        // When/Then
        mockMvc.perform(get("/api/v1/poks/" + pokId + "/tags/suggestions")
                        .with(user(userId.toString())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].suggestedName").value("kubernetes"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    // ===== POST .../suggestions/{id}/approve =====

    @Test
    void approveSuggestion_shouldReturn204() throws Exception {
        // Given
        UUID suggestionId = UUID.randomUUID();
        doNothing().when(tagSuggestionService).approveSuggestion(eq(suggestionId), any());

        // When/Then
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/suggestions/" + suggestionId + "/approve")
                        .with(user(userId.toString())))
                .andExpect(status().isNoContent());
    }

    @Test
    void approveSuggestion_whenNotFound_shouldReturn404() throws Exception {
        // Given
        UUID suggestionId = UUID.randomUUID();
        doThrow(new TagNotFoundException("Not found"))
                .when(tagSuggestionService).approveSuggestion(any(), any());

        // When/Then
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/suggestions/" + suggestionId + "/approve")
                        .with(user(userId.toString())))
                .andExpect(status().isNotFound());
    }

    // ===== POST .../suggestions/{id}/reject =====

    @Test
    void rejectSuggestion_shouldReturn204() throws Exception {
        // Given
        UUID suggestionId = UUID.randomUUID();
        doNothing().when(tagSuggestionService).rejectSuggestion(eq(suggestionId), any());

        // When/Then
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/suggestions/" + suggestionId + "/reject")
                        .with(user(userId.toString())))
                .andExpect(status().isNoContent());
    }
}
