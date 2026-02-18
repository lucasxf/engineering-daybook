package com.lucasxf.ed.controller;

import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.AuthService;
import com.lucasxf.ed.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for {@link AuthController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@DisplayName("AuthController")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final AuthResponse AUTH_RESPONSE = new AuthResponse(
        "access-token", "refresh-token", "testuser", USER_ID, 900
    );

    @Nested
    @DisplayName("POST /api/v1/auth/register")
    class Register {

        @Test
        @DisplayName("should register and return 200 with tokens")
        void register_success() throws Exception {
            when(authService.register(any())).thenReturn(AUTH_RESPONSE);

            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "test@example.com",
                            "password": "Password1",
                            "displayName": "Test User",
                            "handle": "testuser"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.handle").value("testuser"));
        }

        @Test
        @DisplayName("should return 400 for missing email")
        void register_missingEmail() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "password": "Password1",
                            "displayName": "Test User",
                            "handle": "testuser"
                        }
                        """))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 for weak password")
        void register_weakPassword() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "test@example.com",
                            "password": "weak",
                            "displayName": "Test User",
                            "handle": "testuser"
                        }
                        """))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 for invalid handle format")
        void register_invalidHandle() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "test@example.com",
                            "password": "Password1",
                            "displayName": "Test User",
                            "handle": "-invalid"
                        }
                        """))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 409 for duplicate email")
        void register_duplicateEmail() throws Exception {
            when(authService.register(any()))
                .thenThrow(new IllegalArgumentException("Email already registered"));

            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "taken@example.com",
                            "password": "Password1",
                            "displayName": "Test User",
                            "handle": "testuser"
                        }
                        """))
                .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/login")
    class Login {

        @Test
        @DisplayName("should login and return 200 with tokens")
        void login_success() throws Exception {
            when(authService.login(any())).thenReturn(AUTH_RESPONSE);

            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "test@example.com",
                            "password": "Password1"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
        }

        @Test
        @DisplayName("should return 401 for invalid credentials")
        void login_invalidCredentials() throws Exception {
            when(authService.login(any()))
                .thenThrow(new IllegalArgumentException("Invalid credentials"));

            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "wrong@example.com",
                            "password": "WrongPass1"
                        }
                        """))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/refresh")
    class Refresh {

        @Test
        @DisplayName("should refresh and return 200 with new tokens")
        void refresh_success() throws Exception {
            when(authService.refreshToken("valid-refresh-token")).thenReturn(AUTH_RESPONSE);

            mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "refreshToken": "valid-refresh-token"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
        }

        @Test
        @DisplayName("should return 401 for invalid refresh token")
        void refresh_invalid() throws Exception {
            when(authService.refreshToken("bad-token"))
                .thenThrow(new IllegalArgumentException("Invalid refresh token"));

            mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "refreshToken": "bad-token"
                        }
                        """))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/logout")
    class Logout {

        @Test
        @DisplayName("should logout and return 204")
        void logout_success() throws Exception {
            mockMvc.perform(post("/api/v1/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "refreshToken": "some-refresh-token"
                        }
                        """))
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/auth/handle/available")
    class HandleAvailability {

        @Test
        @DisplayName("should return available=true for unused handle")
        void available() throws Exception {
            when(authService.isHandleAvailable("newhandle")).thenReturn(true);

            mockMvc.perform(get("/api/v1/auth/handle/available")
                    .param("h", "newhandle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.handle").value("newhandle"));
        }

        @Test
        @DisplayName("should return available=false for taken handle")
        void taken() throws Exception {
            when(authService.isHandleAvailable("taken")).thenReturn(false);

            mockMvc.perform(get("/api/v1/auth/handle/available")
                    .param("h", "taken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
        }
    }
}
