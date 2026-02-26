package com.lucasxf.ed.service;

import com.lucasxf.ed.repository.PokRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link EmbeddingBackfillService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmbeddingBackfillService")
class EmbeddingBackfillServiceTest {

    @Mock private PokRepository pokRepository;
    @Mock private EmbeddingGenerationService embeddingGenerationService;

    private EmbeddingBackfillService service;

    @BeforeEach
    void setUp() {
        service = new EmbeddingBackfillService(pokRepository, embeddingGenerationService);
    }

    @Test
    @DisplayName("returns 0 when all POKs already have embeddings")
    void backfill_whenNoPoksNeedEmbedding_returnsZero() {
        when(pokRepository.findIdsByEmbeddingIsNullAndDeletedAtIsNull()).thenReturn(List.of());

        int result = service.backfill();

        assertThat(result).isEqualTo(0);
        verify(embeddingGenerationService, never()).generateEmbeddingForPok(any());
    }

    @Test
    @DisplayName("enqueues all POKs with null embedding and returns count")
    void backfill_enqueuedCountMatchesNullEmbeddingPoks() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        UUID id3 = UUID.randomUUID();
        when(pokRepository.findIdsByEmbeddingIsNullAndDeletedAtIsNull())
            .thenReturn(List.of(id1, id2, id3));

        int result = service.backfill();

        assertThat(result).isEqualTo(3);
        verify(embeddingGenerationService).generateEmbeddingForPok(id1);
        verify(embeddingGenerationService).generateEmbeddingForPok(id2);
        verify(embeddingGenerationService).generateEmbeddingForPok(id3);
    }

    @Test
    @DisplayName("is idempotent: second call returns 0 when no null-embedding POKs remain")
    void backfill_isIdempotent_secondCallReturnsZero() {
        when(pokRepository.findIdsByEmbeddingIsNullAndDeletedAtIsNull()).thenReturn(List.of());

        int first = service.backfill();
        int second = service.backfill();

        assertThat(first).isEqualTo(0);
        assertThat(second).isEqualTo(0);
    }
}
