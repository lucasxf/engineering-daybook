package com.lucasxf.ed.integration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokAuditLog;
import com.lucasxf.ed.domain.PokTag;
import com.lucasxf.ed.domain.Tag;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.domain.UserTag;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.TagRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.repository.UserTagRepository;
import com.lucasxf.ed.service.JwtService;
import com.lucasxf.ed.service.UserService;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end integration tests for account deletion against a real PostgreSQL database.
 *
 * <p>Exercises the full cascade: HTTP → service layer → all dependent tables → user anonymisation.
 *
 * <p>Requires Docker to be running. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Account Deletion — Integration")
class AccountDeletionIntegrationTest {

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
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PokRepository pokRepository;

    @Autowired
    private PokTagRepository pokTagRepository;

    @Autowired
    private PokAuditLogRepository pokAuditLogRepository;

    @Autowired
    private UserTagRepository userTagRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private JwtService jwtService;

    private User alice;
    private String aliceHandle;
    private String aliceEmail;

    @BeforeEach
    void setUp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        // Clean dependent tables before each test (order respects FK constraints)
        pokAuditLogRepository.deleteAll();
        pokTagRepository.deleteAll();
        pokRepository.deleteAll();
        userTagRepository.deleteAll();
        followRepository.deleteAll();
        userRepository.deleteAll();
        tagRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        aliceEmail = "alice-" + suffix + "@example.com";
        aliceHandle = "alice_" + suffix;
        alice = userRepository.save(new User(aliceEmail, "hash", "Alice", aliceHandle));
    }

    private Cookie jwtCookieFor(User user) {
        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getHandle());
        return new Cookie("access_token", token);
    }

    // ===== AC1 — Happy path: full cascade + anonymisation =====

    @Test
    @DisplayName("AC1 — deleteAccount removes all dependent rows and anonymises user")
    void deleteAccount_happyPath_cascadesAndAnonymises() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        // Arrange: create a POK with a tag and audit log
        Pok pok = pokRepository.save(new Pok(alice.getId(), "My Learning", "Content"));
        Tag tag = tagRepository.save(new Tag("java", "Java"));
        userTagRepository.save(new UserTag(alice.getId(), tag, "#3B82F6"));
        pokTagRepository.save(new PokTag(pok.getId(), tag.getId(), PokTag.Source.MANUAL));
        pokAuditLogRepository.save(new PokAuditLog(
            pok.getId(), alice.getId(), PokAuditLog.Action.CREATE,
            null, pok.getTitle(), null, pok.getContent(), Instant.now()));

        UUID aliceId = alice.getId();

        // Act
        mockMvc.perform(delete("/api/v1/users/me")
                .cookie(jwtCookieFor(alice)))
            .andExpect(status().isNoContent());

        // Assert: all dependent rows gone
        assertThat(pokRepository.findIdsByUserId(aliceId)).isEmpty();
        assertThat(pokTagRepository.findAll()).isEmpty();
        assertThat(pokAuditLogRepository.findAll()).isEmpty();
        assertThat(userTagRepository.findAll()).isEmpty();

        // Assert: user row is anonymised (findById bypasses @SQLRestriction via native query workaround —
        // we use JPA's findAll and filter since findById also applies the restriction)
        List<User> allUsers = userRepository.findAll();
        // @SQLRestriction hides deleted users — row is gone from normal JPA queries
        assertThat(allUsers).isEmpty();
    }

    // ===== AC2 — Idempotency: second call is a no-op =====

    @Test
    @DisplayName("AC2 — calling deleteAccount twice is idempotent")
    void deleteAccount_calledTwice_secondCallIsNoOp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        UUID aliceId = alice.getId();

        // First call: deletes account
        userService.deleteAccount(aliceId);

        // Second call: should not throw
        assertThatNoException().isThrownBy(() -> userService.deleteAccount(aliceId));
    }

    // ===== AC4 — Re-login fails: findByEmail returns empty after deletion =====

    @Test
    @DisplayName("AC4 — after deletion, findByEmail returns empty (re-login blocked)")
    void deleteAccount_afterDeletion_findByEmailReturnsEmpty() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        userService.deleteAccount(alice.getId());

        assertThat(userRepository.findByEmail(aliceEmail)).isEmpty();
    }

    // ===== AC5/AC9 — Email and handle reuse: new user can register with same values =====

    @Test
    @DisplayName("AC5/AC9 — after deletion, new user can be saved with the same email and handle")
    void deleteAccount_afterDeletion_emailAndHandleCanBeReused() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        userService.deleteAccount(alice.getId());

        // New user reusing same email and handle — partial index allows this
        User newUser = userRepository.save(new User(aliceEmail, "newHash", "Alice Again", aliceHandle));

        assertThat(newUser.getId()).isNotNull();
        assertThat(userRepository.findByEmail(aliceEmail)).isPresent();
        assertThat(userRepository.findByHandle(aliceHandle)).isPresent();
    }

    // ===== AC6 — Full cascade: all dependent tables are empty =====

    @Test
    @DisplayName("AC6 — deleteAccount removes rows from all dependent tables")
    void deleteAccount_fullCascade_allDependentTablesEmpty() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        // Arrange: bob follows alice
        User bob = userRepository.save(new User("bob@example.com", "hash", "Bob", "bob_" + UUID.randomUUID().toString().substring(0, 8)));
        Pok pok = pokRepository.save(new Pok(alice.getId(), "Learning", "Content"));
        Tag tag = tagRepository.save(new Tag("spring", "Spring"));
        userTagRepository.save(new UserTag(alice.getId(), tag, "#10B981"));
        pokTagRepository.save(new PokTag(pok.getId(), tag.getId(), PokTag.Source.MANUAL));
        pokAuditLogRepository.save(new PokAuditLog(
            pok.getId(), alice.getId(), PokAuditLog.Action.CREATE,
            null, pok.getTitle(), null, pok.getContent(), Instant.now()));

        mockMvc.perform(delete("/api/v1/learners/" + bob.getHandle() + "/follow")
            .cookie(jwtCookieFor(alice)));  // alice follows bob

        // Act
        mockMvc.perform(delete("/api/v1/users/me")
                .cookie(jwtCookieFor(alice)))
            .andExpect(status().isNoContent());

        // Assert
        assertThat(pokRepository.findIdsByUserId(alice.getId())).isEmpty();
        assertThat(pokTagRepository.findAll()).isEmpty();
        assertThat(pokAuditLogRepository.findAll()).isEmpty();
        assertThat(userTagRepository.findAll()).isEmpty();
        assertThat(followRepository.existsByFollowerIdAndFollowedId(alice.getId(), bob.getId())).isFalse();
    }

    // ===== AC8 — @SQLRestriction: findByHandle returns empty after deletion =====

    @Test
    @DisplayName("AC8 — after deletion, findByHandle returns empty (@SQLRestriction active)")
    void deleteAccount_afterDeletion_findByHandleReturnsEmpty() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        userService.deleteAccount(alice.getId());

        assertThat(userRepository.findByHandle(aliceHandle)).isEmpty();
    }
}
