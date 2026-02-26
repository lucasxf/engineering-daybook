package com.lucasxf.ed.service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.PokTagSuggestionRepository;
import com.lucasxf.ed.repository.UserTagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link PokService} semantic and hybrid search.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PokService — semantic and hybrid search")
class PokServiceSemanticSearchTest {

    @Mock private PokRepository pokRepository;
    @Mock private PokAuditLogRepository pokAuditLogRepository;
    @Mock private PokTagRepository pokTagRepository;
    @Mock private UserTagRepository userTagRepository;
    @Mock private PokTagSuggestionRepository pokTagSuggestionRepository;
    @Mock private TagSuggestionService tagSuggestionService;
    @Mock private EmbeddingGenerationService embeddingGenerationService;
    @Mock private EmbeddingService embeddingService;

    private PokService pokService;
    private UUID userId;
    private Pok pok1;
    private Pok pok2;

    @BeforeEach
    void setUp() {
        pokService = new PokService(
            pokRepository, pokAuditLogRepository, pokTagRepository,
            userTagRepository, pokTagSuggestionRepository,
            tagSuggestionService, embeddingGenerationService, embeddingService
        );
        userId = UUID.randomUUID();
        pok1 = new Pok(userId, "Java basics", "Introduction to Java");
        pok2 = new Pok(userId, "Spring Boot", "Building REST APIs");
        ReflectionTestUtils.setField(pok1, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(pok2, "id", UUID.randomUUID());
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(userId)).thenReturn(List.of());
    }

    @Test
    @DisplayName("semantic search embeds the query and calls findSemantically")
    void search_withSemanticMode_usesSemanticsRepository() {
        float[] vector = new float[384];
        when(embeddingService.embed("java")).thenReturn(vector);
        when(pokRepository.findSemantically(eq(userId), anyString(), anyInt(), anyInt()))
            .thenReturn(List.of(pok1));

        Page<PokResponse> result = pokService.search(
            userId, "java", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Java basics");
        verify(embeddingService).embed("java");
        verify(pokRepository).findSemantically(eq(userId), anyString(), anyInt(), anyInt());
        verify(pokRepository, never()).searchPoks(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("hybrid search merges semantic and keyword results, deduplicating by ID")
    void search_withHybridMode_mergesAndDeduplicates() {
        float[] vector = new float[384];
        when(embeddingService.embed("java")).thenReturn(vector);
        // Semantic returns pok1; keyword returns pok1 + pok2
        when(pokRepository.findSemantically(eq(userId), anyString(), anyInt(), anyInt()))
            .thenReturn(List.of(pok1));
        when(pokRepository.searchPoks(eq(userId), eq("java"), any(), any(), any(), any(), any()))
            .thenReturn(new PageImpl<>(List.of(pok1, pok2)));

        Page<PokResponse> result = pokService.search(
            userId, "java", "hybrid",
            null, null, null, null, null, null, 0, 20
        );

        // pok1 appears once (deduped), pok2 appended from keyword results
        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    @DisplayName("falls back to keyword-only when embedding service is unavailable")
    void search_whenEmbeddingUnavailable_fallsBackToKeyword() {
        when(embeddingService.embed("java")).thenThrow(new EmbeddingUnavailableException("down"));
        when(pokRepository.searchPoks(eq(userId), eq("java"), any(), any(), any(), any(), any()))
            .thenReturn(new PageImpl<>(List.of(pok1)));

        Page<PokResponse> result = pokService.search(
            userId, "java", "semantic",
            null, null, null, null, null, null, 0, 20
        );

        assertThat(result.getContent()).hasSize(1);
        verify(pokRepository, never()).findSemantically(any(), any(), anyInt(), anyInt());
        verify(pokRepository).searchPoks(eq(userId), eq("java"), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("null searchMode uses existing keyword-only search path")
    void search_withNullSearchMode_usesKeywordPath() {
        when(pokRepository.searchPoks(eq(userId), eq("java"), any(), any(), any(), any(), any()))
            .thenReturn(new PageImpl<>(List.of(pok1)));

        pokService.search(
            userId, "java", null,
            null, null, null, null, null, null, 0, 20
        );

        verify(embeddingService, never()).embed(anyString());
        verify(pokRepository).searchPoks(eq(userId), eq("java"), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("blank keyword with hybrid/semantic mode falls back to keyword-only (no embed call)")
    void search_withBlankKeywordAndSemanticMode_fallsBackToKeyword() {
        when(pokRepository.searchPoks(eq(userId), eq(null), any(), any(), any(), any(), any()))
            .thenReturn(new PageImpl<>(List.of(pok1, pok2)));

        Page<PokResponse> result = pokService.search(
            userId, null, "hybrid",
            null, null, null, null, null, null, 0, 20
        );

        assertThat(result.getContent()).hasSize(2);
        verify(embeddingService, never()).embed(anyString());
        verify(pokRepository, never()).findSemantically(any(), any(), anyInt(), anyInt());
        verify(pokRepository).searchPoks(eq(userId), eq(null), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("semantic search total is an approximation based on over-fetched results")
    void search_withSemanticMode_totalIsApproximateNotPageSize() {
        int size = 10;
        // Over-fetch returns 15 results (size * 3 = 30 limit, but only 15 available)
        List<Pok> overFetch = List.of(pok1, pok2, pok1, pok2, pok1, pok2, pok1, pok2,
            pok1, pok2, pok1, pok2, pok1, pok2, pok1); // 15 elements
        float[] vector = new float[384];
        when(embeddingService.embed("spring")).thenReturn(vector);
        when(pokRepository.findSemantically(eq(userId), anyString(), eq(30), eq(0)))
            .thenReturn(overFetch);

        Page<PokResponse> result = pokService.search(
            userId, "spring", "semantic",
            null, null, null, null, null, null, 0, size
        );

        // Approximate total: offset(0) + fetched(15) = 15, NOT page size (10)
        assertThat(result.getTotalElements()).isEqualTo(15L);
        assertThat(result.getContent()).hasSize(size); // page is capped at `size`
    }
}
