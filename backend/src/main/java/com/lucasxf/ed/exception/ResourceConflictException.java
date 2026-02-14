package com.lucasxf.ed.exception;

/**
 * Exception thrown when a resource conflict occurs (e.g., duplicate email or handle).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
public class ResourceConflictException extends RuntimeException {

    public ResourceConflictException(String message) {
        super(message);
    }

    public ResourceConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
