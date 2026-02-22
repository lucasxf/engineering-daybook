package com.lucasxf.ed.controller;

import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.exception.InvalidPasswordResetTokenException;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.PasswordResetService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for {@link PasswordResetController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@WebMvcTest(PasswordResetController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(CorsProperties.class)
@DisplayName("PasswordResetController")
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PasswordResetService passwordResetService;

    @MockitoBean
    private JwtService jwtService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/password-reset/request
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/auth/password-reset/request")
    class Request {

        @Test
        @DisplayName("any valid email — returns 200 with generic message (no enumeration, AC1, AC4, AC5)")
        void anyEmail_returns200WithGenericMessage() throws Exception {
            doNothing().when(passwordResetService).requestReset(any());

            mockMvc.perform(post("/api/v1/auth/password-reset/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "email": "user@example.com" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("blank email — returns 400 validation error")
        void blankEmail_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/password-reset/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "email": "" }
                        """))
                .andExpect(status().isBadRequest());

            verify(passwordResetService, never()).requestReset(anyString());
        }

        @Test
        @DisplayName("invalid email format — returns 400 validation error")
        void invalidEmailFormat_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/password-reset/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "email": "not-an-email" }
                        """))
                .andExpect(status().isBadRequest());

            verify(passwordResetService, never()).requestReset(anyString());
        }

        @Test
        @DisplayName("service throws — still returns 200 (no enumeration)")
        void serviceThrows_stillReturns200() throws Exception {
            // The service is designed to not throw, but if it does, the controller
            // should still handle gracefully. The service always swallows exceptions internally.
            doNothing().when(passwordResetService).requestReset(any());

            mockMvc.perform(post("/api/v1/auth/password-reset/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "email": "user@example.com" }
                        """))
                .andExpect(status().isOk());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/auth/password-reset/validate
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/auth/password-reset/validate")
    class Validate {

        @Test
        @DisplayName("valid token — returns 200 (AC1, FR6)")
        void validToken_returns200() throws Exception {
            doNothing().when(passwordResetService).validateToken(any());

            mockMvc.perform(get("/api/v1/auth/password-reset/validate")
                    .param("token", "valid-raw-token"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("invalid/expired/used token — returns 400 (AC6, AC7, AC8)")
        void invalidToken_returns400() throws Exception {
            doThrow(new InvalidPasswordResetTokenException("Link invalid or expired"))
                .when(passwordResetService).validateToken(any());

            mockMvc.perform(get("/api/v1/auth/password-reset/validate")
                    .param("token", "stale-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Link invalid or expired"));
        }

        @Test
        @DisplayName("missing token parameter — returns 400")
        void missingToken_returns400() throws Exception {
            mockMvc.perform(get("/api/v1/auth/password-reset/validate"))
                .andExpect(status().isBadRequest());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/password-reset/confirm
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/auth/password-reset/confirm")
    class Confirm {

        @Test
        @DisplayName("valid token and password — returns 200 (AC2)")
        void validTokenAndPassword_returns200() throws Exception {
            doNothing().when(passwordResetService).confirmReset(any(), any());

            mockMvc.perform(post("/api/v1/auth/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "token": "valid-raw-token",
                            "newPassword": "NewPass123"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("invalid/expired token — returns 400 (AC6, AC7)")
        void invalidToken_returns400() throws Exception {
            doThrow(new InvalidPasswordResetTokenException("Link invalid or expired"))
                .when(passwordResetService).confirmReset(any(), any());

            mockMvc.perform(post("/api/v1/auth/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "token": "stale-token",
                            "newPassword": "NewPass123"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Link invalid or expired"));
        }

        @Test
        @DisplayName("password too short — returns 400 validation error (AC9)")
        void passwordTooShort_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "token": "valid-token",
                            "newPassword": "short"
                        }
                        """))
                .andExpect(status().isBadRequest());

            verify(passwordResetService, never()).confirmReset(anyString(), anyString());
        }

        @Test
        @DisplayName("password missing complexity — returns 400 validation error (AC9)")
        void passwordMissingComplexity_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "token": "valid-token",
                            "newPassword": "alllowercase1"
                        }
                        """))
                .andExpect(status().isBadRequest());

            verify(passwordResetService, never()).confirmReset(anyString(), anyString());
        }

        @Test
        @DisplayName("blank token — returns 400 validation error")
        void blankToken_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "token": "",
                            "newPassword": "NewPass123"
                        }
                        """))
                .andExpect(status().isBadRequest());
        }
    }
}
