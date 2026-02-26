package com.lucasxf.ed.service;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.exception.EmbeddingUnavailableException;
import com.lucasxf.ed.repository.PokRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static java.util.Objects.requireNonNull;

/**
 * Asynchronous service that generates and persists vector embeddings for POKs.
 *
 * <p>Called after POK create and update operations. Failures are non-fatal:
 * if the embedding service is unavailable, a warning is logged and the POK
 * remains searchable via keyword search with a null embedding.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Slf4j
@Service
public class EmbeddingGenerationService {

    private final PokRepository pokRepository;
    private final EmbeddingService embeddingService;

    public EmbeddingGenerationService(PokRepository pokRepository,
                                      EmbeddingService embeddingService) {
        this.pokRepository = requireNonNull(pokRepository);
        this.embeddingService = requireNonNull(embeddingService);
    }

    /**
     * Generates a vector embedding for the given POK and persists it.
     *
     * <p>Runs on a separate thread (via {@link Async}). If the embedding service
     * is unavailable, the failure is logged and swallowed — the POK will remain
     * without an embedding and will be excluded from semantic search until the
     * embedding is generated (e.g. via the backfill endpoint).
     *
     * @param pokId the ID of the POK to embed
     */
    @Async
    @Transactional
    public void generateEmbeddingForPok(UUID pokId) {
        pokRepository.findByIdAndDeletedAtIsNull(pokId).ifPresent(pok -> {
            try {
                String text = buildInputText(pok);
                float[] embedding = embeddingService.embed(text);
                pok.updateEmbedding(embedding);
                pokRepository.save(pok);
                log.debug("Embedding generated for POK {}", pokId);
            } catch (EmbeddingUnavailableException e) {
                log.warn("Embedding unavailable for POK {} — will retry via backfill: {}",
                    pokId, e.getMessage());
            }
        });
    }

    /**
     * Builds the text to embed from a POK's title and content.
     * Title (if present) is prepended to improve semantic relevance.
     */
    private String buildInputText(Pok pok) {
        if (pok.getTitle() != null && !pok.getTitle().isBlank()) {
            return pok.getTitle() + " " + pok.getContent();
        }
        return pok.getContent();
    }
}
