package com.lucasxf.ed.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.AppleIdentityTokenVerifier;
import com.lucasxf.ed.service.AppleIdentityTokenVerifier.AppleUserInfo;
import com.lucasxf.ed.service.GoogleTokenVerifierService;
import com.lucasxf.ed.service.GoogleTokenVerifierService.GoogleUserInfo;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import jakarta.servlet.http.Cookie;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end integration tests for auth flows against a real PostgreSQL database.
 *
 * <p>These tests exercise the full stack — HTTP layer, service layer, repository layer,
 * and Flyway-managed schema — to catch infrastructure issues that unit tests cannot detect
 * (e.g. missing database tables, broken Flyway migrations, JPA entity mapping errors).
 *
 * <p>Requires Docker to be running. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-20
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Auth — Integration")
class AuthIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return; // Class disabled by @Testcontainers(disabledWithoutDocker = true)
        }
        // Start container here — @DynamicPropertySource runs during context loading,
        // before @BeforeAll, so the container must be started here.
        postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
            .withDatabaseName("ed_test")
            .withUsername("test")
            .withPassword("test");
        postgres.start();
        enablePgVector(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    private static void enablePgVector(String url, String username, String password) {
        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            conn.createStatement().execute("CREATE EXTENSION IF NOT EXISTS vector;");
        } catch (Exception e) {
            throw new RuntimeException("Failed to enable pgvector extension", e);
        }
    }

    @AfterAll
    static void stopContainers() {
        if (postgres != null && postgres.isRunning()) {
            postgres.stop();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private GoogleTokenVerifierService googleTokenVerifier;

    @MockitoBean
    private AppleIdentityTokenVerifier appleIdentityTokenVerifier;

    // =====================================================================
    // Email / password flows
    // =====================================================================

    @Nested
    @DisplayName("Email/password flows")
    class EmailPasswordFlows {

        @Test
        @DisplayName("register should persist user in database and set auth cookies (no tokens in body)")
        void register_shouldPersistUserInDb() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "alice-" + suffix + "@example.com";
            String handle = "alice" + suffix;

            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "%s",
                            "password": "Password1",
                            "displayName": "Alice",
                            "handle": "%s"
                        }
                        """.formatted(email, handle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));

            assertThat(userRepository.findByEmail(email))
                .isPresent()
                .hasValueSatisfying(user -> {
                    assertThat(user.getHandle()).isEqualTo(handle);
                    assertThat(user.getAuthProvider()).isEqualTo("local");
                    assertThat(user.getPasswordHash()).isNotNull();
                });
        }

        @Test
        @DisplayName("login should return tokens for a registered user")
        void login_shouldReturnTokensForRegisteredUser() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "bob-" + suffix + "@example.com";
            String handle = "bob" + suffix;

            // Register first
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "%s",
                            "password": "Password1",
                            "displayName": "Bob",
                            "handle": "%s"
                        }
                        """.formatted(email, handle)))
                .andExpect(status().isOk());

            // Then login
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "%s",
                            "password": "Password1"
                        }
                        """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));
        }

        @Test
        @DisplayName("refresh should accept refresh_token cookie and return new auth cookies")
        void refresh_shouldAcceptCookieAndReturnNewCookies() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "eve-" + suffix + "@example.com";
            String handle = "eve" + suffix;

            // Register to get the refresh_token cookie
            var registerResult = mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "%s",
                            "password": "Password1",
                            "displayName": "Eve",
                            "handle": "%s"
                        }
                        """.formatted(email, handle)))
                .andExpect(status().isOk())
                .andReturn();

            assertNotNull(registerResult.getResponse().getCookie("refresh_token"),
                "Register response must set refresh_token cookie");
            String refreshTokenValue = registerResult.getResponse().getCookie("refresh_token").getValue();

            // Refresh using the cookie (web client pattern)
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .cookie(new Cookie("refresh_token", refreshTokenValue)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));
        }
    }

    // =====================================================================
    // Google OAuth flows
    // =====================================================================

    @Nested
    @DisplayName("Google OAuth flows")
    class GoogleOAuthFlows {

        @Test
        @DisplayName("complete Google sign-up should persist user in database and return tokens")
        void googleSignup_shouldPersistUserInDb() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "carol-" + suffix + "@gmail.com";
            String googleSub = "google-sub-" + suffix;
            String handle = "carol" + suffix;
            String idToken = "id-token-" + suffix;

            when(googleTokenVerifier.verify(idToken))
                .thenReturn(new GoogleUserInfo(googleSub, email, "Carol"));

            // Step 1: new user — should receive a temp token for handle selection
            String step1Body = mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "%s" }
                        """.formatted(idToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

            String tempToken = extractField(step1Body, "tempToken");

            // Step 2: complete sign-up — should create user and set auth cookies (no tokens in body)
            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "%s",
                            "handle": "%s",
                            "displayName": "Carol"
                        }
                        """.formatted(tempToken, handle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));

            assertThat(userRepository.findByEmail(email))
                .isPresent()
                .hasValueSatisfying(user -> {
                    assertThat(user.getHandle()).isEqualTo(handle);
                    assertThat(user.getAuthProvider()).isEqualTo("google");
                    assertThat(user.getPasswordHash()).isNull();
                });
        }

        @Test
        @DisplayName("Google login should return tokens for an existing Google user")
        void googleLogin_shouldReturnTokensForExistingUser() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "dave-" + suffix + "@gmail.com";
            String googleSub = "google-sub-" + suffix;
            String handle = "dave" + suffix;

            // Set up: create the user via sign-up flow
            String setupToken = "setup-token-" + suffix;
            when(googleTokenVerifier.verify(setupToken))
                .thenReturn(new GoogleUserInfo(googleSub, email, "Dave"));

            String setupBody = mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "%s" }
                        """.formatted(setupToken)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

            String tempToken = extractField(setupBody, "tempToken");

            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "%s",
                            "handle": "%s",
                            "displayName": "Dave"
                        }
                        """.formatted(tempToken, handle)))
                .andExpect(status().isOk());

            // Now login as returning user — should get full tokens, no handle required
            String loginToken = "login-token-" + suffix;
            when(googleTokenVerifier.verify(loginToken))
                .thenReturn(new GoogleUserInfo(googleSub, email, "Dave"));

            mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "%s" }
                        """.formatted(loginToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));
        }
    }

    // =====================================================================
    // Sign in with Apple flows
    // =====================================================================

    @Nested
    @DisplayName("Sign in with Apple flows")
    class AppleAuth {

        @Test
        @DisplayName("new Apple user end-to-end: /apple → requiresHandle=true → /apple/complete → tokens, user in DB")
        void appleSignup_shouldPersistUserInDb() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "apple-" + suffix + "@privaterelay.appleid.com";
            String appleSub = "apple-sub-" + suffix;
            String handle = "apple" + suffix;
            String identityToken = "apple-id-token-" + suffix;

            when(appleIdentityTokenVerifier.verify(identityToken))
                .thenReturn(new AppleUserInfo(appleSub, email));

            // Step 1: new user — should receive a temp token and email for handle selection
            String step1Body = mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "%s" }
                        """.formatted(identityToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(true))
                .andExpect(jsonPath("$.tempToken").isNotEmpty())
                .andExpect(jsonPath("$.email").value(email))
                .andReturn().getResponse().getContentAsString();

            String tempToken = extractField(step1Body, "tempToken");

            // Step 2: complete sign-up — should create user and return tokens in body (mobile endpoint)
            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "%s",
                            "handle": "%s",
                            "displayName": "Apple User"
                        }
                        """.formatted(tempToken, handle)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.requiresHandle").doesNotExist());

            assertThat(userRepository.findByEmail(email))
                .isPresent()
                .hasValueSatisfying(user -> {
                    assertThat(user.getHandle()).isEqualTo(handle);
                    assertThat(user.getAuthProvider()).isEqualTo("apple");
                    assertThat(user.getPasswordHash()).isNull();
                });
        }

        @Test
        @DisplayName("returning Apple user should receive full tokens without handle selection")
        void appleLogin_shouldReturnTokensForExistingUser() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "apple2-" + suffix + "@privaterelay.appleid.com";
            String appleSub = "apple-sub2-" + suffix;
            String handle = "apple2" + suffix;

            // Set up: create the user via sign-up flow
            String setupToken = "apple-setup-token-" + suffix;
            when(appleIdentityTokenVerifier.verify(setupToken))
                .thenReturn(new AppleUserInfo(appleSub, email));

            String setupBody = mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "%s" }
                        """.formatted(setupToken)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

            String tempToken = extractField(setupBody, "tempToken");

            mockMvc.perform(post("/api/v1/auth/mobile/apple/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "%s",
                            "handle": "%s",
                            "displayName": "Apple User 2"
                        }
                        """.formatted(tempToken, handle)))
                .andExpect(status().isOk());

            // Now login as returning user — should get full tokens, no handle required
            String loginToken = "apple-login-token-" + suffix;
            when(appleIdentityTokenVerifier.verify(loginToken))
                .thenReturn(new AppleUserInfo(appleSub, email));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "%s" }
                        """.formatted(loginToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresHandle").value(false))
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
        }

        @Test
        @DisplayName("Apple login with email already registered via Google should return 409")
        void appleLogin_conflictWithGoogleAccount() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "conflict-" + suffix + "@gmail.com";
            String googleSub = "google-sub-" + suffix;
            String appleSub = "apple-sub-" + suffix;
            String handle = "conflict" + suffix;

            // Set up: create a Google user with this email
            String googleSetupToken = "google-setup-" + suffix;
            when(googleTokenVerifier.verify(googleSetupToken))
                .thenReturn(new GoogleUserInfo(googleSub, email, "Conflict User"));

            String googleSetupBody = mockMvc.perform(post("/api/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "idToken": "%s" }
                        """.formatted(googleSetupToken)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

            String tempToken = extractField(googleSetupBody, "tempToken");

            mockMvc.perform(post("/api/v1/auth/google/complete")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "tempToken": "%s",
                            "handle": "%s",
                            "displayName": "Conflict User"
                        }
                        """.formatted(tempToken, handle)))
                .andExpect(status().isOk());

            // Now attempt Apple login with the same email — should get 409
            String appleToken = "apple-conflict-" + suffix;
            when(appleIdentityTokenVerifier.verify(appleToken))
                .thenReturn(new AppleUserInfo(appleSub, email));

            mockMvc.perform(post("/api/v1/auth/mobile/apple")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "identityToken": "%s" }
                        """.formatted(appleToken)))
                .andExpect(status().isConflict());
        }
    }

    // =====================================================================
    // /me endpoint flows
    // =====================================================================

    @Nested
    @DisplayName("/me endpoint")
    class MeEndpointFlows {

        @Test
        @DisplayName("GET /auth/me should omit theme and locale for a first-time user (null columns, @JsonInclude NON_NULL)")
        void me_shouldOmitThemeAndLocaleForFirstTimeUser() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "me-" + suffix + "@example.com";
            String handle = "meuser" + suffix;

            // Register to get access_token cookie
            var registerResult = mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                            "email": "%s",
                            "password": "Password1",
                            "displayName": "Me User",
                            "handle": "%s"
                        }
                        """.formatted(email, handle)))
                .andExpect(status().isOk())
                .andReturn();

            String accessToken = registerResult.getResponse().getCookie("access_token").getValue();

            // Call /auth/me with the access_token cookie
            mockMvc.perform(get("/api/v1/auth/me")
                    .cookie(new Cookie("access_token", accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.theme").doesNotExist())
                .andExpect(jsonPath("$.locale").doesNotExist());
        }
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    @SuppressWarnings("unchecked")
    private String extractField(String json, String field) throws Exception {
        Map<String, Object> map = objectMapper.readValue(json, Map.class);
        return (String) map.get(field);
    }
}
