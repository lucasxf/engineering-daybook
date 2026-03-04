package com.lucasxf.ed.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.domain.Pok;
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
 * Integration tests for {@link UserController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
class UserControllerTest {

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
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService).updateDefaultPokVisibility(eq(userId), eq(Pok.Visibility.PUBLIC));
    }

    @Test
    void updateSettings_withNullDefaultPokVisibility_skipsUpdate() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(null);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(userService, never()).updateDefaultPokVisibility(any(), any());
    }

    @Test
    void updateSettings_whenUserNotFound_returns404() throws Exception {
        doThrow(new UserNotFoundException("User not found: " + userId))
            .when(userService).updateDefaultPokVisibility(eq(userId), any());

        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .with(user(userId.toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateSettings_unauthenticated_returns401() throws Exception {
        UpdateUserSettingsRequest request = new UpdateUserSettingsRequest(Pok.Visibility.PUBLIC);

        mockMvc.perform(patch("/api/v1/users/me/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }
}
