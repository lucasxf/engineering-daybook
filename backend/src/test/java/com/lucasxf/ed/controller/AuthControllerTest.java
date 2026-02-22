package com.lucasxf.ed.controller;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.Cookie;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.GoogleLoginResponse;
import com.lucasxf.ed.security.CookieHelper;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.security.UserPrincipal;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
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
@Import({SecurityConfig.class, CookieHelper.class})
@EnableConfigurationProperties({CorsProperties.class, AuthProperties.class})
@DisplayName("AuthController")
class AuthControllerTest {

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
    private static final AuthResponse AUTH_RESPONSE = new AuthResponse(HANDLE, USER_ID, EMAIL);

    @Nested
    @DisplayName("POST /api/v1/auth/register")
    class Register {

        @Test
        @DisplayName("should register and return 200 with user info + Set-Cookie headers")
        void register_success() throws Exception {
            when(authService.register(any())).thenReturn(AUTH_RESULT);

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
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                    assertThat(cookies).anyMatch(c -> c.contains("refresh_token="));
                });
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
        @DisplayName("should login and return 200 with user info + Set-Cookie headers")
        void login_success() throws Exception {
            when(authService.login(any())).thenReturn(AUTH_RESULT);

            mockMvc.perform(post("/api/v1/auth/login")
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
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                    assertThat(cookies).anyMatch(c -> c.contains("refresh_token="));
                });
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
        @DisplayName("should refresh via cookie and return 200 with new cookies")
        void refresh_success() throws Exception {
            when(authService.refreshToken("valid-refresh-token")).thenReturn(AUTH_RESULT);

            mockMvc.perform(post("/api/v1/auth/refresh")
                    .cookie(new Cookie("refresh_token", "valid-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                });
        }

        @Test
        @DisplayName("should return 401 when refresh_token cookie is absent")
        void refresh_missingCookie() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 401 for invalid refresh token")
        void refresh_invalid() throws Exception {
            when(authService.refreshToken("bad-token"))
                .thenThrow(new IllegalArgumentException("Invalid refresh token"));

            mockMvc.perform(post("/api/v1/auth/refresh")
                    .cookie(new Cookie("refresh_token", "bad-token")))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/logout")
    class Logout {

        @Test
        @DisplayName("should logout via cookie and return 204 with cleared cookies")
        void logout_success() throws Exception {
            mockMvc.perform(post("/api/v1/auth/logout")
                    .cookie(new Cookie("refresh_token", "some-refresh-token")))
                .andExpect(status().isNoContent())
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token=;"));
                });
        }

        @Test
        @DisplayName("should logout gracefully with no cookie (idempotent)")
        void logout_noCookie() throws Exception {
            mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/auth/me")
    class Me {

        @Test
        @DisplayName("should return 200 with user identity when authenticated")
        void me_authenticated() throws Exception {
            UserPrincipal principal = new UserPrincipal(USER_ID, EMAIL, HANDLE);
            Authentication auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of()
            );

            mockMvc.perform(get("/api/v1/auth/me")
                    .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.userId").isNotEmpty());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void me_unauthenticated() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
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

    @Nested
    @DisplayName("POST /api/v1/auth/google")
    class GoogleLogin {

        @Test
        @DisplayName("should return 200 with user info + cookies for existing user")
        void googleLogin_existingUser() throws Exception {
            when(authService.googleLogin("valid-id-token"))
                .thenReturn(new GoogleLoginResult.ExistingUser(AUTH_RESULT));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "valid-id-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.handle").value(HANDLE))
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                });
        }

        @Test
        @DisplayName("should return 200 with tempToken for new user (no cookies)")
        void googleLogin_newUser() throws Exception {
            when(authService.googleLogin("new-user-token"))
                .thenReturn(new GoogleLoginResult.NewUser("temp-token-abc"));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "new-user-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").value("temp-token-abc"));
        }
    }
}
