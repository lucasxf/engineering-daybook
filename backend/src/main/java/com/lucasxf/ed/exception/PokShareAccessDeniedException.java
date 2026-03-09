package com.lucasxf.ed.exception;

/**
 * Thrown when a user attempts to modify or delete a PokShare they do not own.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public class PokShareAccessDeniedException extends RuntimeException {

    public PokShareAccessDeniedException(String message) {
        super(message);
    }
}
