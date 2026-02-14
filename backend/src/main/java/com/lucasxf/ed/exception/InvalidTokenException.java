package com.lucasxf.ed.exception;

/**
 * Exception thrown when a token is invalid or expired.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
