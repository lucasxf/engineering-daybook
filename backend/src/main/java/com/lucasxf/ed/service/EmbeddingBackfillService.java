package com.lucasxf.ed.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.lucasxf.ed.repository.PokRepository;

import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Backfills vector embeddings for all POKs that currently have none.
 *
 * <p>Processes POKs in batches of {@value #BATCH_SIZE} with a {@value #BATCH_DELAY_MS} ms delay
 * between batches to avoid overwhelming the HuggingFace rate limits. Delegates actual embedding
 * generation to {@link EmbeddingGenerationService} (asynchronous). The operation is idempotent —
 * safe to re-run; already-embedded POKs are skipped automatically by the repository query.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Slf4j
@Service
public class EmbeddingBackfillService {

    private static final int BATCH_SIZE = 20;
    private static final long BATCH_DELAY_MS = 100;

    private final PokRepository pokRepository;
    private final EmbeddingGenerationService embeddingGenerationService;

    public EmbeddingBackfillService(PokRepository pokRepository,
                                    EmbeddingGenerationService embeddingGenerationService) {
        this.pokRepository = requireNonNull(pokRepository);
        this.embeddingGenerationService = requireNonNull(embeddingGenerationService);
    }

    /**
     * Enqueues embedding generation for all POKs with a null embedding.
     *
     * @return the number of POKs enqueued for embedding
     */
    public int backfill() {
        List<UUID> ids = pokRepository.findIdsByEmbeddingIsNullAndDeletedAtIsNull();
        int total = ids.size();

        for (int i = 0; i < ids.size(); i += BATCH_SIZE) {
            List<UUID> batch = ids.subList(i, Math.min(i + BATCH_SIZE, ids.size()));
            batch.forEach(embeddingGenerationService::generateEmbeddingForPok);

            if (i + BATCH_SIZE < ids.size()) {
                try {
                    Thread.sleep(BATCH_DELAY_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    int processed = i + batch.size();
                    log.warn("Backfill interrupted after {}/{} POKs", processed, total);
                    return processed;
                }
            }
        }

        log.info("Backfill enqueued {} POKs for embedding generation", total);
        return total;
    }
}
