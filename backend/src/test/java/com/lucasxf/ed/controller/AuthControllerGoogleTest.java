package com.lucasxf.ed.controller;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.GoogleLoginResponse;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.AuthService;
import com.lucasxf.ed.service.JwtService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for Google OAuth endpoints in {@link AuthController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@DisplayName("AuthController — Google OAuth")
class AuthControllerGoogleTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    private static final UUID USER_ID = UUID.randomUUID();

    @Nested
    @DisplayName("POST /api/v1/auth/google")
    class GoogleLogin {

        @Test
        @DisplayName("should return 200 with auth tokens for existing Google user")
        void googleLogin_existingUser() throws Exception {
            var authResponse = new AuthResponse(
                "access-token", "refresh-token", "alice", USER_ID, 900
            );
            when(authService.googleLogin("valid-id-token"))
                .thenReturn(GoogleLoginResponse.existingUser(authResponse));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "valid-id-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.handle").value("alice"));
        }

        @Test
        @DisplayName("should return 200 with temp token for new Google user")
        void googleLogin_newUser() throws Exception {
            when(authService.googleLogin("valid-id-token"))
                .thenReturn(GoogleLoginResponse.newUser("temp-token-123"));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "valid-id-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").value("temp-token-123"))
                .andExpect(jsonPath("$.accessToken").doesNotExist());
        }

        @Test
        @DisplayName("should return 409 when Google email conflicts with local account")
        void googleLogin_emailConflict() throws Exception {
            when(authService.googleLogin("valid-id-token"))
                .thenThrow(new IllegalArgumentException(
                    "This email is already registered with a password"));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "valid-id-token" }
                        """))
                .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 401 for invalid Google ID token")
        void googleLogin_invalidToken() throws Exception {
            when(authService.googleLogin("bad-token"))
                .thenThrow(new IllegalArgumentException("Invalid Google ID token"));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "bad-token" }
                        """))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 400 for missing idToken")
        void googleLogin_missingToken() throws Exception {
            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/google/complete")
    class CompleteGoogleSignup {

        @Test
        @DisplayName("should return 200 with auth tokens on successful signup")
        void complete_success() throws Exception {
            var authResponse = new AuthResponse(
                "access-token", "refresh-token", "bobsmith", USER_ID, 900
            );
            when(authService.completeGoogleSignup("temp-token", "bobsmith", "Bob Smith"))
                .thenReturn(authResponse);

            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "temp-token",
                            "handle": "bobsmith",
                            "displayName": "Bob Smith"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.handle").value("bobsmith"));
        }

        @Test
        @DisplayName("should return 409 when handle is taken")
        void complete_handleTaken() throws Exception {
            when(authService.completeGoogleSignup(anyString(), anyString(), anyString()))
                .thenThrow(new IllegalArgumentException("Handle already taken"));

            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "temp-token",
                            "handle": "taken",
                            "displayName": "Name"
                        }
                        """))
                .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 401 when temp token is expired")
        void complete_expiredToken() throws Exception {
            when(authService.completeGoogleSignup(anyString(), anyString(), anyString()))
                .thenThrow(new IllegalArgumentException(
                    "Session expired. Please try again."));

            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "expired-token",
                            "handle": "handle",
                            "displayName": "Name"
                        }
                        """))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 400 for invalid handle format")
        void complete_invalidHandle() throws Exception {
            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "temp-token",
                            "handle": "-invalid",
                            "displayName": "Name"
                        }
                        """))
                .andExpect(status().isBadRequest());
        }
    }
}
