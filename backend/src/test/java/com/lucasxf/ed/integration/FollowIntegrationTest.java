package com.lucasxf.ed.integration;

import java.util.UUID;

import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.JwtService;

import jakarta.servlet.http.Cookie;
import java.sql.Connection;
import java.sql.DriverManager;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for follow/unfollow mechanics against a real PostgreSQL database.
 *
 * <p>Exercises the full stack (HTTP → service → Flyway-managed schema) to validate
 * the composite PK, the DB CHECK constraint for self-follow, and mutual-follow detection.
 *
 * <p>Requires Docker. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Follow — Integration")
class FollowIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return;
        }
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
    private UserRepository userRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private JwtService jwtService;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");
        followRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        alice = userRepository.save(new User("alice@example.com", "hash", "Alice", "alice-" + suffix));
        bob = userRepository.save(new User("bob@example.com", "hash", "Bob", "bob-" + suffix));
    }

    private Cookie jwtCookieFor(User user) {
        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getHandle());
        return new Cookie("access_token", token);
    }

    @Test
    void follow_newRelationship_persistsToDatabase() throws Exception {
        mockMvc.perform(post("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        assertThat(followRepository.existsByFollowerIdAndFollowedId(alice.getId(), bob.getId())).isTrue();
    }

    @Test
    void follow_selfFollow_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/learners/" + alice.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest());
    }

    @Test
    void follow_alreadyFollowing_returns409() throws Exception {
        // First follow succeeds
        mockMvc.perform(post("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Second follow returns 409
        mockMvc.perform(post("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isConflict());
    }

    @Test
    void unfollow_existingRelationship_removesFromDatabase() throws Exception {
        // Setup follow
        mockMvc.perform(post("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Unfollow
        mockMvc.perform(delete("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        assertThat(followRepository.existsByFollowerIdAndFollowedId(alice.getId(), bob.getId())).isFalse();
    }

    @Test
    void mutualFollow_relationshipIsSymmetric() throws Exception {
        // Alice follows Bob
        mockMvc.perform(post("/api/v1/learners/" + bob.getHandle() + "/follow")
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Bob follows Alice
        mockMvc.perform(post("/api/v1/learners/" + alice.getHandle() + "/follow")
                .cookie(jwtCookieFor(bob))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Both follow relationships exist
        assertThat(followRepository.existsByFollowerIdAndFollowedId(alice.getId(), bob.getId())).isTrue();
        assertThat(followRepository.existsByFollowerIdAndFollowedId(bob.getId(), alice.getId())).isTrue();
        // Colleague count reflects mutual follow
        assertThat(followRepository.countColleagues(alice.getId())).isEqualTo(1L);
    }
}
