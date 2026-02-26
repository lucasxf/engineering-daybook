package com.lucasxf.ed.repository;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for {@link PokRepository} using Testcontainers (local) or service container (CI).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
class PokRepositoryTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String url;
        String username;
        String password;

        if (isRunningInCI()) {
            // Use GitHub Actions service container
            url      = "jdbc:postgresql://localhost:5432/testdb";
            username = "test";
            password = "test";
        } else {
            if (!DockerClientFactory.instance().isDockerAvailable()) {
                return; // Class disabled by @Testcontainers(disabledWithoutDocker = true)
            }
            // Start Testcontainers here — @DynamicPropertySource runs during context loading,
            // before @BeforeAll, so the container must be started here.
            postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
                .withDatabaseName("testdb")
                .withUsername("test")
                .withPassword("test");
            postgres.start();
            url      = postgres.getJdbcUrl();
            username = postgres.getUsername();
            password = postgres.getPassword();
        }

        // Must run BEFORE Hibernate create-drop generates the vector(384) column.
        // pgvector/pgvector:pg15 ships the extension binaries but does NOT activate
        // it automatically — CREATE EXTENSION is required for every database, regardless
        // of how the container was started (Testcontainers or CI service container).
        enablePgVector(url, username, password);

        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> username);
        registry.add("spring.datasource.password", () -> password);
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

    private static boolean isRunningInCI() {
        return System.getenv("CI") != null || System.getenv("GITHUB_ACTIONS") != null;
    }

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PokRepository pokRepository;

    private User testUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // Create test users
        testUser = new User("test@example.com", "hash", "Test User", "testuser");
        entityManager.persist(testUser);

        otherUser = new User("other@example.com", "hash", "Other User", "otheruser");
        entityManager.persist(otherUser);

        entityManager.flush();
    }

    @Test
    void findByUserIdAndDeletedAtIsNull_shouldReturnOnlyActivePoksForUser() {
        // Given: 2 active POKs and 1 soft-deleted POK for testUser
        Pok activePok1 = new Pok(testUser.getId(), "Title 1", "Content 1");
        entityManager.persist(activePok1);

        Pok activePok2 = new Pok(testUser.getId(), null, "Content 2 without title");
        entityManager.persist(activePok2);

        Pok deletedPok = new Pok(testUser.getId(), "Deleted", "Deleted content");
        deletedPok.softDelete();
        entityManager.persist(deletedPok);

        // And: 1 active POK for otherUser
        Pok otherUserPok = new Pok(otherUser.getId(), "Other", "Other content");
        entityManager.persist(otherUserPok);

        entityManager.flush();

        // When: Query active POKs for testUser
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.findByUserIdAndDeletedAtIsNull(testUser.getId(), pageRequest);

        // Then: Should return only 2 active POKs for testUser
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent())
            .hasSize(2)
            .extracting(Pok::getContent)
            .containsExactlyInAnyOrder("Content 1", "Content 2 without title");
    }

    @Test
    void findByUserIdAndDeletedAtIsNull_shouldRespectPagination() {
        // Given: 5 active POKs for testUser
        for (int i = 1; i <= 5; i++) {
            Pok pok = new Pok(testUser.getId(), "Title " + i, "Content " + i);
            entityManager.persist(pok);
        }
        entityManager.flush();

        // When: Query first page (size 2)
        PageRequest page0 = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.findByUserIdAndDeletedAtIsNull(testUser.getId(), page0);

        // Then: Should return page 0 with 2 items, total 5 elements, 3 pages
        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(2);
        assertThat(result.getTotalElements()).isEqualTo(5);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void findByUserIdAndDeletedAtIsNull_shouldSortByUpdatedAtDescending() throws InterruptedException {
        // Given: 3 POKs created at different times
        Pok oldest = new Pok(testUser.getId(), "Oldest", "Oldest content");
        entityManager.persist(oldest);
        entityManager.flush();

        Thread.sleep(10); // Ensure different timestamps

        Pok middle = new Pok(testUser.getId(), "Middle", "Middle content");
        entityManager.persist(middle);
        entityManager.flush();

        Thread.sleep(10);

        Pok newest = new Pok(testUser.getId(), "Newest", "Newest content");
        entityManager.persist(newest);
        entityManager.flush();

        // When: Query with default sort (updatedAt DESC)
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.findByUserIdAndDeletedAtIsNull(testUser.getId(), pageRequest);

        // Then: Should return POKs sorted by updatedAt descending (newest first)
        assertThat(result.getContent())
            .extracting(Pok::getTitle)
            .containsExactly("Newest", "Middle", "Oldest");
    }

    @Test
    void findByIdAndDeletedAtIsNull_shouldReturnPokIfActive() {
        // Given: An active POK
        Pok activePok = new Pok(testUser.getId(), "Active", "Active content");
        entityManager.persist(activePok);
        entityManager.flush();
        UUID pokId = activePok.getId();

        // When: Find by ID
        Optional<Pok> result = pokRepository.findByIdAndDeletedAtIsNull(pokId);

        // Then: Should return the POK
        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Active");
    }

    @Test
    void findByIdAndDeletedAtIsNull_shouldReturnEmptyIfSoftDeleted() {
        // Given: A soft-deleted POK
        Pok deletedPok = new Pok(testUser.getId(), "Deleted", "Deleted content");
        deletedPok.softDelete();
        entityManager.persist(deletedPok);
        entityManager.flush();
        UUID pokId = deletedPok.getId();

        // When: Find by ID
        Optional<Pok> result = pokRepository.findByIdAndDeletedAtIsNull(pokId);

        // Then: Should return empty (soft-deleted POKs are hidden)
        assertThat(result).isEmpty();
    }

    @Test
    void findByIdAndDeletedAtIsNull_shouldReturnEmptyIfNotFound() {
        // When: Find non-existent POK
        Optional<Pok> result = pokRepository.findByIdAndDeletedAtIsNull(UUID.randomUUID());

        // Then: Should return empty
        assertThat(result).isEmpty();
    }

    @Test
    void save_shouldPersistPokWithNullableTitle() {
        // Given: A POK without title (title is null)
        Pok pok = new Pok(testUser.getId(), null, "Content without title");

        // When: Save the POK
        Pok saved = pokRepository.save(pok);
        entityManager.flush();

        // Then: Should persist successfully with null title
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isNull();
        assertThat(saved.getContent()).isEqualTo("Content without title");
        assertThat(saved.getDeletedAt()).isNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void save_shouldPersistPokWithEmptyStringTitle() {
        // Given: A POK with empty string title
        Pok pok = new Pok(testUser.getId(), "", "Content with empty title");

        // When: Save the POK
        Pok saved = pokRepository.save(pok);
        entityManager.flush();

        // Then: Should persist successfully with empty title
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEmpty();
        assertThat(saved.getContent()).isEqualTo("Content with empty title");
    }

    // ============================
    // Search/Filter/Sort Tests
    // ============================

    @Test
    void searchPoks_shouldFindByKeywordInTitle() {
        // Given: POKs with different titles
        Pok postgres = new Pok(testUser.getId(), "PostgreSQL indexing strategies", "Database content");
        entityManager.persist(postgres);

        Pok react = new Pok(testUser.getId(), "React state management", "Frontend content");
        entityManager.persist(react);

        entityManager.flush();

        // When: Search for "postgresql"
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "postgresql", null, null, null, null, pageRequest
        );

        // Then: Should find POK with "PostgreSQL" in title (case-insensitive)
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).contains("PostgreSQL");
    }

    @Test
    void searchPoks_shouldFindByKeywordInContent() {
        // Given: POKs with different content
        Pok virtualThreads = new Pok(testUser.getId(), "Java 21", "Learned about Spring Boot virtual threads today");
        entityManager.persist(virtualThreads);

        Pok hooks = new Pok(testUser.getId(), "React", "React hooks are great");
        entityManager.persist(hooks);

        entityManager.flush();

        // When: Search for "virtual threads"
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "virtual threads", null, null, null, null, pageRequest
        );

        // Then: Should find POK with "virtual threads" in content
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getContent()).contains("virtual threads");
    }

    @Test
    void searchPoks_shouldBeCaseInsensitive() {
        // Given: POK with "Docker Compose" in title
        Pok docker = new Pok(testUser.getId(), "Docker Compose", "Container orchestration");
        entityManager.persist(docker);
        entityManager.flush();

        // When: Search for "docker compose" (lowercase)
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "docker compose", null, null, null, null, pageRequest
        );

        // Then: Should find the POK (case-insensitive)
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Docker Compose");
    }

    @Test
    void searchPoks_shouldSortByCreatedAtAscending() throws InterruptedException {
        // Given: 3 POKs created at different times
        Pok oldest = new Pok(testUser.getId(), "Oldest", "Content 1");
        entityManager.persist(oldest);
        entityManager.flush();

        Thread.sleep(10);

        Pok middle = new Pok(testUser.getId(), "Middle", "Content 2");
        entityManager.persist(middle);
        entityManager.flush();

        Thread.sleep(10);

        Pok newest = new Pok(testUser.getId(), "Newest", "Content 3");
        entityManager.persist(newest);
        entityManager.flush();

        // When: Search with sort by createdAt ASC
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), null, null, null, null, null, pageRequest
        );

        // Then: Should return oldest first
        assertThat(result.getContent())
            .extracting(Pok::getTitle)
            .containsExactly("Oldest", "Middle", "Newest");
    }

    @Test
    void searchPoks_shouldFilterByCreationDateRange() {
        // Given: POKs created on different dates
        Instant jan1 = Instant.parse("2026-01-01T00:00:00Z");
        Instant feb1 = Instant.parse("2026-02-01T00:00:00Z");
        Instant mar1 = Instant.parse("2026-03-01T00:00:00Z");

        Pok pokA = new Pok(testUser.getId(), "POK A", "Content A");
        pokA.setCreatedAt(jan1);
        pokA.setUpdatedAt(jan1);
        entityManager.persist(pokA);

        Pok pokB = new Pok(testUser.getId(), "POK B", "Content B");
        pokB.setCreatedAt(feb1);
        pokB.setUpdatedAt(feb1);
        entityManager.persist(pokB);

        Pok pokC = new Pok(testUser.getId(), "POK C", "Content C");
        pokC.setCreatedAt(mar1);
        pokC.setUpdatedAt(mar1);
        entityManager.persist(pokC);

        entityManager.flush();

        // When: Filter by creation date range (Jan 15 to Feb 15)
        Instant createdFrom = Instant.parse("2026-01-15T00:00:00Z");
        Instant createdTo = Instant.parse("2026-02-15T23:59:59Z");
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), null, createdFrom, createdTo, null, null, pageRequest
        );

        // Then: Should return only POK B
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("POK B");
    }

    @Test
    void searchPoks_shouldFilterByUpdateDateRange() {
        // Given: POKs updated on different dates
        Instant jan1 = Instant.parse("2026-01-01T00:00:00Z");
        Instant feb1 = Instant.parse("2026-02-01T00:00:00Z");

        Pok pokA = new Pok(testUser.getId(), "POK A", "Content A");
        pokA.setCreatedAt(jan1);
        pokA.setUpdatedAt(jan1);
        entityManager.persist(pokA);

        Pok pokB = new Pok(testUser.getId(), "POK B", "Content B");
        pokB.setCreatedAt(jan1);
        pokB.setUpdatedAt(feb1);
        entityManager.persist(pokB);

        entityManager.flush();

        // When: Filter by update date range (Jan 15 to Mar 1)
        Instant updatedFrom = Instant.parse("2026-01-15T00:00:00Z");
        Instant updatedTo = Instant.parse("2026-03-01T23:59:59Z");
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), null, null, null, updatedFrom, updatedTo, pageRequest
        );

        // Then: Should return only POK B
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("POK B");
    }

    @Test
    void searchPoks_shouldReturnEmptyWhenNoMatch() {
        // Given: POKs with specific content
        Pok pok1 = new Pok(testUser.getId(), "Java", "Content about Java");
        entityManager.persist(pok1);

        Pok pok2 = new Pok(testUser.getId(), "Spring", "Content about Spring");
        entityManager.persist(pok2);

        entityManager.flush();

        // When: Search for non-existent keyword
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "kubernetes", null, null, null, null, pageRequest
        );

        // Then: Should return empty page
        assertThat(result.getTotalElements()).isEqualTo(0);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void searchPoks_shouldHandleSpecialCharactersSafely() {
        // Given: POK with normal content
        Pok pok = new Pok(testUser.getId(), "Normal", "Normal content");
        entityManager.persist(pok);
        entityManager.flush();

        // When: Search with SQL injection attempt (should be parameterized and safe)
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "' OR 1=1--", null, null, null, null, pageRequest
        );

        // Then: Should not return any results (treated as literal string, not SQL)
        assertThat(result.getTotalElements()).isEqualTo(0);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void searchPoks_shouldOnlyReturnCurrentUsersPoks() {
        // Given: POKs for both testUser and otherUser
        Pok testUserPok = new Pok(testUser.getId(), "My secret learning", "My content");
        entityManager.persist(testUserPok);

        Pok otherUserPok = new Pok(otherUser.getId(), "Other secret learning", "Other content");
        entityManager.persist(otherUserPok);

        entityManager.flush();

        // When: Search by testUser for "secret"
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "secret", null, null, null, null, pageRequest
        );

        // Then: Should return only testUser's POK (user isolation)
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getUserId()).isEqualTo(testUser.getId());
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("My secret learning");
    }

    @Test
    void searchPoks_shouldExcludeSoftDeletedPoks() {
        // Given: Active and soft-deleted POKs
        Pok active = new Pok(testUser.getId(), "Active POK", "Active content");
        entityManager.persist(active);

        Pok deleted = new Pok(testUser.getId(), "Deleted POK", "Deleted content");
        deleted.softDelete();
        entityManager.persist(deleted);

        entityManager.flush();

        // When: Search for "POK"
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "POK", null, null, null, null, pageRequest
        );

        // Then: Should return only active POK
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Active POK");
    }

    @Test
    void searchPoks_shouldCombineKeywordAndDateFilters() {
        // Given: POKs with different keywords and dates
        Instant jan1 = Instant.parse("2026-01-01T00:00:00Z");
        Instant feb1 = Instant.parse("2026-02-01T00:00:00Z");

        Pok springJan = new Pok(testUser.getId(), "Spring Boot", "Learn Spring in January");
        springJan.setCreatedAt(jan1);
        springJan.setUpdatedAt(jan1);
        entityManager.persist(springJan);

        Pok springFeb = new Pok(testUser.getId(), "Spring Data", "Learn Spring in February");
        springFeb.setCreatedAt(feb1);
        springFeb.setUpdatedAt(feb1);
        entityManager.persist(springFeb);

        Pok reactJan = new Pok(testUser.getId(), "React", "Learn React in January");
        reactJan.setCreatedAt(jan1);
        reactJan.setUpdatedAt(jan1);
        entityManager.persist(reactJan);

        entityManager.flush();

        // When: Search for "Spring" with creation date in February
        Instant createdFrom = Instant.parse("2026-02-01T00:00:00Z");
        Instant createdTo = Instant.parse("2026-02-28T23:59:59Z");
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Pok> result = pokRepository.searchPoks(
            testUser.getId(), "Spring", createdFrom, createdTo, null, null, pageRequest
        );

        // Then: Should return only Spring Data (matches both keyword and date)
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getTitle()).isEqualTo("Spring Data");
    }
}
