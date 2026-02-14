package com.lucasxf.ed.exception;

/**
 * Exception thrown when a user attempts to access a POK they don't own.
 *
 * <p>This exception should result in an HTTP 403 Forbidden response.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public class PokAccessDeniedException extends RuntimeException {

    public PokAccessDeniedException(String message) {
        super(message);
    }

    public PokAccessDeniedException() {
        super("You do not have permission to access this POK");
    }
}
