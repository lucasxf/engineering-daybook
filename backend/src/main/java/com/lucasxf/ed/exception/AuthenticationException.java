package com.lucasxf.ed.exception;

/**
 * Exception thrown when authentication fails due to invalid credentials.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
