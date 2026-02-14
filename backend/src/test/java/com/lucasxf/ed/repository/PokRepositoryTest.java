package com.lucasxf.ed.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for {@link PokRepository} using Testcontainers.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PokRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
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
}
