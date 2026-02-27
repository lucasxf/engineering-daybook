package com.lucasxf.ed.controller;

import java.util.UUID;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.security.CookieHelper;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.AuthResult;
import com.lucasxf.ed.service.AuthService;
import com.lucasxf.ed.service.GoogleLoginResult;
import com.lucasxf.ed.service.JwtService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for {@link AuthMobileController}.
 *
 * <p>Verifies that mobile endpoints return tokens in the JSON body and do NOT set cookies,
 * separating them from the web-only {@link AuthController} cookie behaviour.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-27
 */
@WebMvcTest(AuthMobileController.class)
@Import({SecurityConfig.class, CookieHelper.class})
@EnableConfigurationProperties({CorsProperties.class, AuthProperties.class})
@DisplayName("AuthMobileController")
class AuthMobileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "test@example.com";
    private static final String HANDLE = "testuser";
    private static final AuthResult AUTH_RESULT = new AuthResult(
        "access-token", "refresh-token", HANDLE, USER_ID, EMAIL
    );

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/login")
    class Login {

        @Test
        @DisplayName("should return 200 with tokens in body and no Set-Cookie headers")
        void login_success() throws Exception {
            when(authService.login(any())).thenReturn(AUTH_RESULT);

            var result = mockMvc.perform(post("/api/v1/auth/mobile/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "test@example.com",
                            "password": "Password1"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andReturn();

            var cookies = result.getResponse().getHeaders("Set-Cookie");
            assertThat(cookies).noneMatch(c -> c.contains("access_token="));
            assertThat(cookies).noneMatch(c -> c.contains("refresh_token="));
        }

        @Test
        @DisplayName("should return 400 for missing password")
        void login_missingPassword() throws Exception {
            mockMvc.perform(post("/api/v1/auth/mobile/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "email": "test@example.com" }
                        """))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/register")
    class Register {

        @Test
        @DisplayName("should return 200 with tokens in body and no Set-Cookie headers")
        void register_success() throws Exception {
            when(authService.register(any())).thenReturn(AUTH_RESULT);

            var result = mockMvc.perform(post("/api/v1/auth/mobile/register")
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
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andReturn();

            var cookies = result.getResponse().getHeaders("Set-Cookie");
            assertThat(cookies).noneMatch(c -> c.contains("access_token="));
            assertThat(cookies).noneMatch(c -> c.contains("refresh_token="));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/refresh")
    class Refresh {

        @Test
        @DisplayName("should return 200 with new tokens in body when refresh token is valid")
        void refresh_success() throws Exception {
            when(authService.refreshToken(eq("old-refresh"))).thenReturn(AUTH_RESULT);

            mockMvc.perform(post("/api/v1/auth/mobile/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "refreshToken": "old-refresh" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
        }

        @Test
        @DisplayName("should return 401 when no refresh token provided")
        void refresh_noToken() throws Exception {
            mockMvc.perform(post("/api/v1/auth/mobile/refresh")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/google")
    class GoogleLogin {

        @Test
        @DisplayName("should return tokens for existing Google user")
        void googleLogin_existingUser() throws Exception {
            when(authService.googleLogin(any()))
                .thenReturn(new GoogleLoginResult.ExistingUser(AUTH_RESULT));

            mockMvc.perform(post("/api/v1/auth/mobile/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "google-id-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
        }

        @Test
        @DisplayName("should return temp token for new Google user")
        void googleLogin_newUser() throws Exception {
            when(authService.googleLogin(any()))
                .thenReturn(new GoogleLoginResult.NewUser("temp-token"));

            mockMvc.perform(post("/api/v1/auth/mobile/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "google-id-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").value("temp-token"));
        }
    }
}
