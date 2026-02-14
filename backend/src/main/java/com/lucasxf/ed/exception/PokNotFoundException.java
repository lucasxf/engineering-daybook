package com.lucasxf.ed.exception;

/**
 * Exception thrown when a POK is not found or is soft-deleted.
 *
 * <p>This exception should result in an HTTP 404 Not Found response.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public class PokNotFoundException extends RuntimeException {

    public PokNotFoundException(String message) {
        super(message);
    }

    public PokNotFoundException() {
        super("POK not found");
    }
}
