package com.lucasxf.ed.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.UpdateUserSettingsRequest;
import com.lucasxf.ed.exception.UserNotFoundException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link UserSettingsController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@WebMvcTest(UserSettingsController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class UserSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    private final UUID userId = UUID.randomUUID();

    @Test
    void updateSettings_withDefaultPokVisibility_returns204() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC, null, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateDefaultPokVisibility(eq(userId), eq(Pok.Visibility.PUBLIC));
    }

    @Test
    void updateSettings_withNullDefaultPokVisibility_skipsUpdate() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, null, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService, never()).updateDefaultPokVisibility(any(), any());
        verify(userService, never()).updateProfileVisibility(any(), any());
    }

    @Test
    void updateSettings_withProfileVisibility_returns204() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, User.ProfileVisibility.PUBLIC, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateProfileVisibility(eq(userId), eq(User.ProfileVisibility.PUBLIC));
        verify(userService, never()).updateDefaultPokVisibility(any(), any());
    }

    @Test
    void updateSettings_withBothFields_updatesBoth() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(
            Pok.Visibility.PUBLIC, User.ProfileVisibility.PRIVATE, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateDefaultPokVisibility(eq(userId), eq(Pok.Visibility.PUBLIC));
        verify(userService).updateProfileVisibility(eq(userId), eq(User.ProfileVisibility.PRIVATE));
    }

    @Test
    void updateSettings_whenUserNotFound_returns404() throws Exception {
        doThrow(new UserNotFoundException("User not found: " + userId))
            .when(userService).updateDefaultPokVisibility(eq(userId), any());

        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC, null, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateSettings_unauthenticated_returns401() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC, null, null, null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void updateSettings_withBio_callsUpdateBio() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, null, "I love learning!", null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateBio(eq(userId), eq("I love learning!"));
        verify(userService, never()).updateDefaultPokVisibility(any(), any());
    }

    @Test
    void updateSettings_withDisplayName_callsUpdateDisplayName() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, null, null, "Alice Smith");

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateDisplayName(eq(userId), eq("Alice Smith"));
        verify(userService, never()).updateDefaultPokVisibility(any(), any());
    }

    @Test
    void updateSettings_withBioContainingUrl_returns400() throws Exception {
        doThrow(new IllegalArgumentException("Bio must not contain URLs"))
            .when(userService).updateBio(eq(userId), any());

        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null, null, "Visit https://example.com", null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
