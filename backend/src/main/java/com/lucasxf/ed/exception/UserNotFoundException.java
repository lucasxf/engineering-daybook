package com.lucasxf.ed.exception;

/**
 * Exception thrown when a user account cannot be found.
 *
 * <p>This exception should result in an HTTP 404 Not Found response.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-03
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
