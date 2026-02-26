package com.lucasxf.ed.service;

import com.lucasxf.ed.exception.EmbeddingUnavailableException;

/**
 * Contract for generating vector embeddings from text.
 *
 * <p>Implementations are expected to be resilient: they should retry on transient
 * failures and throw {@link EmbeddingUnavailableException} only when the service
 * is truly unavailable (all retries exhausted or a non-retryable error occurred).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
public interface EmbeddingService {

    /**
     * Generates a vector embedding for the given text.
     *
     * @param text the input text to embed (must not be null or blank)
     * @return float array representing the embedding vector
     * @throws EmbeddingUnavailableException if the embedding service is unavailable
     */
    float[] embed(String text);
}
