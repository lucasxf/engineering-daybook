package com.lucasxf.ed.exception;

/**
 * Exception thrown when the embedding service is unavailable or has failed
 * after all retries are exhausted.
 *
 * <p>Callers should catch this exception and fall back to keyword-only search
 * rather than surfacing the error to the user.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
public class EmbeddingUnavailableException extends RuntimeException {

    public EmbeddingUnavailableException(String message) {
        super(message);
    }

    public EmbeddingUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
