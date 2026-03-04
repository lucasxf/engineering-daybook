package com.lucasxf.ed.exception;

/**
 * Exception thrown when a caller attempts to change a learning's visibility
 * from {@code PUBLIC} back to {@code PRIVATE}.
 *
 * <p>Once a learning is made public it cannot be reverted to private — the transition
 * is irreversible by design. This exception results in an HTTP {@code 409 Conflict}
 * response to distinguish it from a plain access-denied error.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-03
 */
public class PokVisibilityImmutableException extends RuntimeException {

    public PokVisibilityImmutableException(String message) {
        super(message);
    }
}
