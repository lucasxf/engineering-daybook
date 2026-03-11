package com.lucasxf.ed.exception;

/**
 * Thrown when a learner attempts to re-learn a POK they have already re-learned.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public class PokShareConflictException extends RuntimeException {

    public PokShareConflictException(String message) {
        super(message);
    }
}
