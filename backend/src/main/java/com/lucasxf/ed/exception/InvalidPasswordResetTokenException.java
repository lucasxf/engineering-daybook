package com.lucasxf.ed.exception;

/**
 * Exception thrown when a password reset token is invalid, expired, or already used.
 * <p>
 * Maps to HTTP 400 Bad Request (not 401) — the reset token is not an authentication credential.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
public class InvalidPasswordResetTokenException extends RuntimeException {

    public InvalidPasswordResetTokenException(String message) {
        super(message);
    }
}
