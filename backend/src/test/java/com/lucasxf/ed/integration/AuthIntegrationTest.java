package com.lucasxf.ed.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.repository.UserRepository;
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

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
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

    // =====================================================================
    // Email / password flows
    // =====================================================================

    @Nested
    @DisplayName("Email/password flows")
    class EmailPasswordFlows {

        @Test
        @DisplayName("register should persist user in database and return tokens")
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
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                    assertThat(cookies).anyMatch(c -> c.contains("refresh_token="));
                });

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
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                });
        }

        @Test
        @DisplayName("refresh should accept token in request body for mobile clients")
        void refresh_shouldAcceptTokenInRequestBody() throws Exception {
            assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
                "Docker not available, skipping integration test");

            String suffix = UUID.randomUUID().toString().substring(0, 8);
            String email = "eve-" + suffix + "@example.com";
            String handle = "eve" + suffix;

            // Register to get initial tokens in the JSON body
            String registerBody = mockMvc.perform(post("/api/v1/auth/register")
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
                .andReturn().getResponse().getContentAsString();

            String refreshToken = extractField(registerBody, "refreshToken");

            // Refresh using the token in the request body (mobile client pattern)
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        { "refreshToken": "%s" }
                        """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
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

            // Step 2: complete sign-up — should create user and return auth tokens
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
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                    assertThat(cookies).anyMatch(c -> c.contains("refresh_token="));
                });

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
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andDo(result -> {
                    var cookies = result.getResponse().getHeaders("Set-Cookie");
                    assertThat(cookies).anyMatch(c -> c.contains("access_token="));
                });
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
