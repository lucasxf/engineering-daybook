package com.lucasxf.ed.controller;

import java.util.UUID;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.config.CorsProperties;
import com.lucasxf.ed.exception.AuthenticationException;
import com.lucasxf.ed.exception.ResourceConflictException;
import com.lucasxf.ed.security.CookieHelper;
import com.lucasxf.ed.security.SecurityConfig;
import com.lucasxf.ed.service.AppleLoginResult;
import com.lucasxf.ed.service.AuthResult;
import com.lucasxf.ed.service.AuthService;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MockMvc tests for Sign in with Apple endpoints in {@link AuthMobileController}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@WebMvcTest(AuthMobileController.class)
@Import({SecurityConfig.class, CookieHelper.class})
@EnableConfigurationProperties({CorsProperties.class, AuthProperties.class})
@DisplayName("AuthMobileController — Sign in with Apple")
class AuthMobileControllerAppleTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "apple@privaterelay.appleid.com";
    private static final String HANDLE = "appleuser";
    private static final AuthResult AUTH_RESULT = new AuthResult(
        "access-token", "refresh-token", HANDLE, USER_ID, EMAIL,
        com.lucasxf.ed.domain.Pok.Visibility.PRIVATE, com.lucasxf.ed.domain.User.ProfileVisibility.PRIVATE
    );

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/apple")
    class AppleLogin {

        @Test
        @DisplayName("should return 200 with tokens for existing Apple user")
        void appleLogin_existingUser() throws Exception {
            when(authService.appleLogin("valid-identity-token"))
                .thenReturn(new AppleLoginResult.ExistingUser(AUTH_RESULT));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "valid-identity-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
        }

        @Test
        @DisplayName("should return 200 with temp token and email for new Apple user")
        void appleLogin_newUser() throws Exception {
            when(authService.appleLogin("valid-identity-token"))
                .thenReturn(new AppleLoginResult.NewUser("temp-token-123", EMAIL));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "valid-identity-token" }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").value("temp-token-123"))
                .andExpect(jsonPath("$.email").value(EMAIL));
        }

        @Test
        @DisplayName("should return 401 for invalid Apple identity token")
        void appleLogin_invalidToken() throws Exception {
            when(authService.appleLogin("bad-token"))
                .thenThrow(new AuthenticationException("Apple identity token validation failed"));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "bad-token" }
                        """))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 409 when Apple email conflicts with an existing account")
        void appleLogin_emailConflict() throws Exception {
            when(authService.appleLogin("valid-identity-token"))
                .thenThrow(new ResourceConflictException(
                    "This email is already registered with another provider"));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "valid-identity-token" }
                        """))
                .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 400 for missing identityToken")
        void appleLogin_missingToken() throws Exception {
            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/apple/complete")
    class CompleteAppleSignup {

        @Test
        @DisplayName("should return 200 with tokens on successful Apple signup completion")
        void complete_success() throws Exception {
            AuthResult result = new AuthResult(
                "access-token", "refresh-token", "bobsmith", USER_ID, "bob@example.com",
                com.lucasxf.ed.domain.Pok.Visibility.PRIVATE, com.lucasxf.ed.domain.User.ProfileVisibility.PRIVATE
            );
            when(authService.completeAppleSignup("temp-token", "bobsmith", "Bob Smith"))
                .thenReturn(result);

            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "temp-token",
                            "handle": "bobsmith",
                            "displayName": "Bob Smith"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.handle").value("bobsmith"))
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
        }

        @Test
        @DisplayName("should return 409 when handle is already taken")
        void complete_handleTaken() throws Exception {
            when(authService.completeAppleSignup(anyString(), anyString(), anyString()))
                .thenThrow(new ResourceConflictException("Handle already taken"));

            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
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
            when(authService.completeAppleSignup(anyString(), anyString(), anyString()))
                .thenThrow(new AuthenticationException("Session expired. Please try again."));

            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
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
            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
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
