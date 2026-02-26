package com.lucasxf.ed.service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.repository.PokRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link EmbeddingGenerationService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmbeddingGenerationService")
class EmbeddingGenerationServiceTest {

    @Mock
    private PokRepository pokRepository;

    @Mock
    private EmbeddingService embeddingService;

    @InjectMocks
    private EmbeddingGenerationService service;

    private UUID pokId;
    private Pok pok;

    @BeforeEach
    void setUp() {
        pokId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        pok = new Pok(userId, "Test title", "Test content about Java");
    }

    @Test
    @DisplayName("generates and saves embedding when POK exists")
    void generateEmbeddingForPok_whenPokExists_savesEmbedding() {
        float[] vector = new float[384];
        vector[0] = 0.5f;

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(embeddingService.embed(anyString())).thenReturn(vector);
        when(pokRepository.save(any(Pok.class))).thenReturn(pok);

        service.generateEmbeddingForPok(pokId);

        verify(embeddingService).embed("Test title Test content about Java");
        verify(pokRepository).save(pok);
    }

    @Test
    @DisplayName("does nothing when POK is not found")
    void generateEmbeddingForPok_whenPokNotFound_doesNothing() {
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        service.generateEmbeddingForPok(pokId);

        verify(embeddingService, never()).embed(anyString());
        verify(pokRepository, never()).save(any());
    }

    @Test
    @DisplayName("logs warning and continues when embedding service is unavailable")
    void generateEmbeddingForPok_whenEmbeddingUnavailable_doesNotPropagateException() {
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(pok));
        when(embeddingService.embed(anyString()))
            .thenThrow(new EmbeddingUnavailableException("HF unavailable"));

        // Must not throw — embedding failures are non-fatal
        service.generateEmbeddingForPok(pokId);

        verify(pokRepository, never()).save(any());
    }
}
