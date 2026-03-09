package com.lucasxf.ed.integration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;

import com.lucasxf.ed.domain.Follow;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.repository.FollowRepository;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the Discovery Feed endpoint ({@code GET /api/v1/feed}).
 *
 * <p>Exercises the full HTTP → FeedService → SQL stack against a real PostgreSQL database,
 * covering all Acceptance Criteria from the Discovery Feed spec:
 * <ul>
 *   <li>AC-1 — Feed shows PUBLIC learnings from followed learners</li>
 *   <li>AC-2 — FOLLOWERS_ONLY visible to follower</li>
 *   <li>AC-3 — FOLLOWERS_ONLY NOT visible to non-follower</li>
 *   <li>AC-4 — COLLEAGUES_ONLY: visible to colleague, hidden from non-colleague</li>
 *   <li>AC-5 — PRIVATE learnings never appear</li>
 *   <li>AC-6 — Re-learning in social feed</li>
 *   <li>AC-7/8 — Empty feed returns 200 with empty content</li>
 *   <li>AC-9 — Pagination (totalElements, totalPages)</li>
 *   <li>AC-10 — Unauthenticated access returns 401</li>
 *   <li>FR10 — Own learnings excluded</li>
 * </ul>
 *
 * <p>Requires Docker. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Feed — Integration")
class FeedIntegrationTest {

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
    private FollowRepository followRepository;

    @Autowired
    private JwtService jwtService;

    // Test personas
    private User alice;  // the viewer / requester
    private User bob;    // followed by alice
    private User carol;  // NOT followed by alice
    private User dan;    // mutual follow (colleague) with alice

    @BeforeEach
    void setUp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");
        pokShareRepository.deleteAll();
        pokRepository.deleteAll();
        followRepository.deleteAll();
        userRepository.deleteAll();

        String s = UUID.randomUUID().toString().substring(0, 6);
        alice = userRepository.save(new User("alice-" + s + "@x.com", "h", "Alice", "alice-" + s));
        bob   = userRepository.save(new User("bob-" + s + "@x.com", "h", "Bob", "bob-" + s));
        carol = userRepository.save(new User("carol-" + s + "@x.com", "h", "Carol", "carol-" + s));
        dan   = userRepository.save(new User("dan-" + s + "@x.com", "h", "Dan", "dan-" + s));

        // alice follows bob and dan; dan follows alice back (colleagues)
        followRepository.save(new Follow(alice.getId(), bob.getId()));
        followRepository.save(new Follow(alice.getId(), dan.getId()));
        followRepository.save(new Follow(dan.getId(), alice.getId())); // makes alice+dan colleagues
    }

    private Cookie jwtFor(User user) {
        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getHandle());
        return new Cookie("access_token", token);
    }

    // ===== AC-10: Unauthenticated access =====

    @Test
    @DisplayName("AC-10: Unauthenticated GET /feed returns 401")
    void getFeed_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/feed"))
            .andExpect(status().isUnauthorized());
    }

    // ===== AC-7/8: Empty feed =====

    @Test
    @DisplayName("AC-7: Empty feed when not following anyone")
    void getFeed_whenFollowingNobody_returnsEmptyPage() throws Exception {
        // carol follows nobody
        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(carol)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("AC-8: Empty feed when followed learners have no visible content")
    void getFeed_whenFollowedLearnersHaveNoContent_returnsEmptyPage() throws Exception {
        // alice follows bob, but bob has no learnings
        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ===== AC-1: Public learnings from followed learners =====

    @Test
    @DisplayName("AC-1: Feed shows PUBLIC learnings from followed learners, excludes own")
    void getFeed_showsPublicLearningsFromFollowedLearners() throws Exception {
        pokRepository.save(new Pok(bob.getId(), "Bob's Learning 1", "Content 1", Pok.Visibility.PUBLIC));
        pokRepository.save(new Pok(bob.getId(), "Bob's Learning 2", "Content 2", Pok.Visibility.PUBLIC));
        // alice's own learning — must NOT appear
        pokRepository.save(new Pok(alice.getId(), "Alice's own", "Own content", Pok.Visibility.PUBLIC));
        // carol's learning — alice doesn't follow carol, must NOT appear
        pokRepository.save(new Pok(carol.getId(), "Carol's Learning", "Carol content", Pok.Visibility.PUBLIC));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(2)))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.content[0].authorHandle").value(bob.getHandle()))
            .andExpect(jsonPath("$.content[0].type").value("owned"));
    }

    // ===== AC-2: FOLLOWERS_ONLY visible to follower =====

    @Test
    @DisplayName("AC-2: FOLLOWERS_ONLY learning is visible to alice who follows bob")
    void getFeed_followersOnlyVisibleToFollower() throws Exception {
        pokRepository.save(new Pok(bob.getId(), "Bob's Followers Only", "Content", Pok.Visibility.FOLLOWERS_ONLY));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].visibility").value("FOLLOWERS_ONLY"));
    }

    // ===== AC-3: FOLLOWERS_ONLY NOT visible to non-follower =====

    @Test
    @DisplayName("AC-3: FOLLOWERS_ONLY is NOT visible in carol's feed (carol doesn't follow bob)")
    void getFeed_followersOnlyNotVisibleToNonFollower() throws Exception {
        pokRepository.save(new Pok(bob.getId(), "Bob's Followers Only", "Content", Pok.Visibility.FOLLOWERS_ONLY));

        // carol does not follow bob — should not see it
        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(carol)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty());
    }

    // ===== AC-4: COLLEAGUES_ONLY =====

    @Test
    @DisplayName("AC-4a: COLLEAGUES_ONLY visible to alice (colleague of dan)")
    void getFeed_colleaguesOnlyVisibleToColleague() throws Exception {
        pokRepository.save(new Pok(dan.getId(), "Dan's Colleague Post", "Content", Pok.Visibility.COLLEAGUES_ONLY));

        // alice and dan are mutual follows (colleagues)
        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].visibility").value("COLLEAGUES_ONLY"));
    }

    @Test
    @DisplayName("AC-4b: COLLEAGUES_ONLY NOT visible to carol (not a colleague of dan)")
    void getFeed_colleaguesOnlyHiddenFromNonColleague() throws Exception {
        pokRepository.save(new Pok(dan.getId(), "Dan's Colleague Post", "Content", Pok.Visibility.COLLEAGUES_ONLY));
        // carol follows dan but dan does not follow carol
        followRepository.save(new Follow(carol.getId(), dan.getId()));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(carol)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty());
    }

    // ===== AC-5: PRIVATE never appears =====

    @Test
    @DisplayName("AC-5: PRIVATE learnings never appear in the feed, even for colleagues")
    void getFeed_privateLearningsNeverAppear() throws Exception {
        pokRepository.save(new Pok(dan.getId(), "Dan's Private", "Secret", Pok.Visibility.PRIVATE));
        pokRepository.save(new Pok(bob.getId(), "Bob's Private", "Secret", Pok.Visibility.PRIVATE));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty());
    }

    // ===== FR10: Own learnings excluded =====

    @Test
    @DisplayName("FR10: alice's own learnings never appear in her feed")
    void getFeed_ownLearningsExcluded() throws Exception {
        pokRepository.save(new Pok(alice.getId(), "Alice's Public", "My content", Pok.Visibility.PUBLIC));
        pokRepository.save(new Pok(bob.getId(), "Bob's Public", "Bob content", Pok.Visibility.PUBLIC));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].authorHandle").value(bob.getHandle()));
    }

    // ===== AC-6: Re-learning appears in feed =====

    @Test
    @DisplayName("AC-6: Re-learning posted by followed learner appears in feed with attribution")
    void getFeed_reLearningInFeed_showsSharerAndOriginalAuthor() throws Exception {
        // carol has a PUBLIC learning; bob re-learns it
        Pok carolPok = pokRepository.save(new Pok(carol.getId(), "Carol's Rust Notes", "Rust content", Pok.Visibility.PUBLIC));
        PokShare share = pokShareRepository.save(new PokShare(carolPok.getId(), bob.getId(), null, Pok.Visibility.PUBLIC));

        mockMvc.perform(get("/api/v1/feed").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].type").value("shared"))
            .andExpect(jsonPath("$.content[0].sharedByHandle").value(bob.getHandle()))
            .andExpect(jsonPath("$.content[0].originalAuthorHandle").value(carol.getHandle()))
            .andExpect(jsonPath("$.content[0].originalPok.title").value("Carol's Rust Notes"));
    }

    // ===== AC-9: Pagination =====

    @Test
    @DisplayName("AC-9: Pagination — 25 items, page 0 size 20 returns 20 items; totalElements=25")
    void getFeed_pagination_returnsCorrectPage() throws Exception {
        // Create 25 PUBLIC learnings for bob
        for (int i = 0; i < 25; i++) {
            pokRepository.save(new Pok(bob.getId(), "Bob Learning " + i, "Content", Pok.Visibility.PUBLIC));
        }

        mockMvc.perform(get("/api/v1/feed?page=0&size=20").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(20)))
            .andExpect(jsonPath("$.totalElements").value(25))
            .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    @DisplayName("AC-9: Pagination — page 1 returns remaining 5 items")
    void getFeed_pagination_secondPageReturnsRemainder() throws Exception {
        for (int i = 0; i < 25; i++) {
            pokRepository.save(new Pok(bob.getId(), "Bob Learning " + i, "Content", Pok.Visibility.PUBLIC));
        }

        mockMvc.perform(get("/api/v1/feed?page=1&size=20").cookie(jwtFor(alice)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(5)))
            .andExpect(jsonPath("$.totalElements").value(25))
            .andExpect(jsonPath("$.totalPages").value(2));
    }
}
