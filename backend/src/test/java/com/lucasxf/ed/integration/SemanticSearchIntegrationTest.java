package com.lucasxf.ed.integration;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.EmbeddingService;
import com.lucasxf.ed.service.PokService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Integration tests for semantic and hybrid search using a real pgvector PostgreSQL container.
 *
 * <p>Uses a {@link MockitoBean} for {@link EmbeddingService} to inject deterministic
 * test vectors without calling the HuggingFace API.
 *
 * <p>Covers acceptance criteria:
 * <ul>
 *   <li>AC1 — semantic search finds conceptually similar POK</li>
 *   <li>AC4 — POKs with null embedding excluded from semantic results</li>
 *   <li>AC5 — cross-user isolation enforced at SQL level</li>
 *   <li>AC6 — graceful degradation when embedding service is unavailable</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Semantic Search — Integration")
class SemanticSearchIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return;
        }
        postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
            .withDatabaseName("ed_semantic_test")
            .withUsername("test")
            .withPassword("test");
        postgres.start();

        // Enable pgvector extension before Hibernate creates schema (create-drop)
        try (Connection conn = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
            conn.createStatement().execute("CREATE EXTENSION IF NOT EXISTS vector;");
        } catch (Exception e) {
            throw new RuntimeException("Failed to enable pgvector extension", e);
        }

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

    @MockitoBean
    private EmbeddingService embeddingService;

    @Autowired
    private PokService pokService;

    @Autowired
    private PokRepository pokRepository;

    @Autowired
    private UserRepository userRepository;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");
        pokRepository.deleteAll();
        userRepository.deleteAll();
        alice = userRepository.save(new User("alice@semantic-test.com", "hash", "Alice", "alice_semantic"));
        bob = userRepository.save(new User("bob@semantic-test.com", "hash", "Bob", "bob_semantic"));
    }

    /**
     * AC1 — semantic search finds the POK whose embedding is closest to the query vector.
     *
     * <p>Uses two POKs with orthogonal embeddings. The query embedding points toward POK1.
     * Semantic search should return only POK1 as the top (and only) result.
     */
    @Test
    @DisplayName("AC1 — semantic search returns the most similar POK")
    void semanticSearch_findsMostSimilarPok() {
        // POK1: embedding dominated in dimension 0
        float[] embedding1 = new float[384];
        embedding1[0] = 1.0f;
        Pok pok1 = pokRepository.save(savePokWithEmbedding(
            alice.getId(), "React render optimization", "Memoize with React.memo", embedding1));

        // POK2: embedding dominated in dimension 1 (orthogonal to pok1)
        float[] embedding2 = new float[384];
        embedding2[1] = 1.0f;
        pokRepository.save(savePokWithEmbedding(
            alice.getId(), "Database indexing", "Use indexes on foreign keys", embedding2));

        // Query: very close to pok1's embedding
        float[] queryEmbedding = new float[384];
        queryEmbedding[0] = 0.99f;
        when(embeddingService.embed("component performance")).thenReturn(queryEmbedding);

        Page<PokResponse> result = pokService.search(
            alice.getId(), "component performance", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        // Both POKs have embeddings so both are returned, but pok1 must rank first
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).title()).isEqualTo("React render optimization");
    }

    /**
     * AC4 — POKs with null embedding are excluded from semantic results.
     */
    @Test
    @DisplayName("AC4 — semantic search excludes POKs with null embedding")
    void semanticSearch_excludesPoksWithNullEmbedding() {
        // POK with no embedding (keyword-only eligible)
        Pok pok = new Pok(alice.getId(), "Flyway pitfall", "baseline-on-migrate skips V1");
        pokRepository.save(pok);

        float[] queryEmbedding = new float[384];
        queryEmbedding[0] = 1.0f;
        when(embeddingService.embed("flyway migration")).thenReturn(queryEmbedding);

        Page<PokResponse> result = pokService.search(
            alice.getId(), "flyway migration", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        // POK has no embedding — excluded from semantic results
        assertThat(result.getContent()).isEmpty();
    }

    /**
     * AC5 — cross-user isolation: semantic search only returns the requesting user's POKs.
     */
    @Test
    @DisplayName("AC5 — semantic search enforces user isolation")
    void semanticSearch_onlyReturnsCurrentUserPoks() {
        // Alice has a POK with embedding
        float[] embedding = new float[384];
        embedding[0] = 1.0f;
        pokRepository.save(savePokWithEmbedding(
            alice.getId(), "Kubernetes pod scheduling", "Node affinity rules", embedding));

        // Bob searches — should get no results (POK belongs to Alice)
        float[] queryEmbedding = Arrays.copyOf(embedding, 384);
        when(embeddingService.embed("pod scheduling")).thenReturn(queryEmbedding);

        Page<PokResponse> result = pokService.search(
            bob.getId(), "pod scheduling", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        assertThat(result.getContent()).isEmpty();
    }

    /**
     * AC6 — graceful degradation: when embedding service is unavailable, search falls back
     * to keyword-only and still returns relevant results.
     */
    @Test
    @DisplayName("AC6 — semantic search falls back to keyword when embedding service is down")
    void semanticSearch_fallsBackToKeywordOnEmbeddingFailure() {
        Pok pok = new Pok(alice.getId(), "memory management", "prevent memory leaks with cleanup");
        pokRepository.save(pok);

        when(embeddingService.embed(anyString())).thenThrow(new EmbeddingUnavailableException("service down"));

        Page<PokResponse> result = pokService.search(
            alice.getId(), "memory", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        // Keyword fallback finds the POK (content contains "memory")
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("memory management");
    }

    // ---- helpers ----

    private Pok savePokWithEmbedding(java.util.UUID userId, String title, String content, float[] embedding) {
        Pok pok = new Pok(userId, title, content);
        pok.updateEmbedding(embedding);
        return pok;
    }
}
