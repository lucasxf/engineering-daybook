package com.lucasxf.ed.integration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.JwtService;

import jakarta.servlet.http.Cookie;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for re-learning (PokShare) mechanics against a real PostgreSQL database.
 *
 * <p>Exercises the full stack (HTTP → service → Flyway-managed schema) to validate
 * the unique constraint (one re-learning per learner per original), self-share prevention,
 * PUBLIC-only restriction, and cascade delete.
 *
 * <p>Requires Docker. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("PokShare — Integration")
class PokShareIntegrationTest {

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
    private PokRepository pokRepository;

    @Autowired
    private PokShareRepository pokShareRepository;

    @Autowired
    private JwtService jwtService;

    private User alice;
    private User bob;
    private Pok bobPok;

    @BeforeEach
    void setUp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");
        pokShareRepository.deleteAll();
        pokRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        alice = userRepository.save(new User("alice-" + suffix + "@example.com", "hash", "Alice", "alice-" + suffix));
        bob = userRepository.save(new User("bob-" + suffix + "@example.com", "hash", "Bob", "bob-" + suffix));
        bobPok = pokRepository.save(new Pok(bob.getId(), "Bob's Learning", "Bob's content", Pok.Visibility.PUBLIC));
    }

    private Cookie jwtCookieFor(User user) {
        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getHandle());
        return new Cookie("access_token", token);
    }

    // ── share() ─────────────────────────────────────────────────────────────

    @Test
    void share_publicPok_persistsToDatabase() throws Exception {
        mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("shared"))
            .andExpect(jsonPath("$.originalPokId").value(bobPok.getId().toString()));

        assertThat(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(bobPok.getId(), alice.getId())).isTrue();
    }

    @Test
    void share_withNote_notePersisted() throws Exception {
        String note = "This explains the concept well";

        mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"" + note + "\",\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.note").value(note));

        var shares = pokShareRepository.findByOriginalPokId(bobPok.getId());
        assertThat(shares).hasSize(1);
        assertThat(shares.get(0).getNote()).isEqualTo(note);
    }

    @Test
    void share_selfShare_returns400() throws Exception {
        Pok alicePok = pokRepository.save(new Pok(alice.getId(), "Alice's Learning", "Content", Pok.Visibility.PUBLIC));

        mockMvc.perform(post("/api/v1/poks/{id}/share", alicePok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isBadRequest());

        assertThat(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(alicePok.getId(), alice.getId())).isFalse();
    }

    @Test
    void share_nonPublicOriginal_returns400() throws Exception {
        Pok privatePok = pokRepository.save(new Pok(bob.getId(), "Private", "Content", Pok.Visibility.PRIVATE));

        mockMvc.perform(post("/api/v1/poks/{id}/share", privatePok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void share_duplicate_returns409() throws Exception {
        // First share succeeds
        mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated());

        // Second share is a conflict
        mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isConflict());

        // Only one share row in DB
        assertThat(pokShareRepository.findByOriginalPokId(bobPok.getId())).hasSize(1);
    }

    @Test
    void share_pokNotFound_returns404() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/poks/{id}/share", nonExistentId)
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isNotFound());
    }

    // ── unshare() ───────────────────────────────────────────────────────────

    @Test
    void unshare_byOwner_removesFromDatabase() throws Exception {
        // Create a share first
        var result = mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andReturn();

        String body = result.getResponse().getContentAsString();
        String shareId = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId)
                .cookie(jwtCookieFor(alice)))
            .andExpect(status().isNoContent());

        assertThat(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(bobPok.getId(), alice.getId())).isFalse();
    }

    @Test
    void unshare_byNonOwner_returns403() throws Exception {
        // Alice shares Bob's POK
        var result = mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":null,\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andReturn();

        String body = result.getResponse().getContentAsString();
        String shareId = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        // Bob tries to delete Alice's share
        mockMvc.perform(delete("/api/v1/poks/shared/{shareId}", shareId)
                .cookie(jwtCookieFor(bob)))
            .andExpect(status().isForbidden());

        // Share still exists
        assertThat(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(bobPok.getId(), alice.getId())).isTrue();
    }

    // ── getShareById() ───────────────────────────────────────────────────────

    @Test
    void getShareById_found_returns200WithShareDetails() throws Exception {
        var createResult = mockMvc.perform(post("/api/v1/poks/{id}/share", bobPok.getId())
                .cookie(jwtCookieFor(alice))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"Helpful!\",\"visibility\":\"PUBLIC\"}"))
            .andExpect(status().isCreated())
            .andReturn();

        String body = createResult.getResponse().getContentAsString();
        String shareId = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", shareId)
                .cookie(jwtCookieFor(bob)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.type").value("shared"))
            .andExpect(jsonPath("$.originalPokId").value(bobPok.getId().toString()))
            .andExpect(jsonPath("$.note").value("Helpful!"))
            .andExpect(jsonPath("$.visibility").value("PUBLIC"));
    }

    @Test
    void getShareById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/poks/shared/{shareId}", UUID.randomUUID())
                .cookie(jwtCookieFor(alice)))
            .andExpect(status().isNotFound());
    }
}
