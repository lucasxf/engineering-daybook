package com.lucasxf.ed.exception;

/**
 * Exception thrown when a learner profile cannot be found by handle.
 *
 * <p>This exception results in an HTTP 404 Not Found response.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
public class LearnerNotFoundException extends RuntimeException {

    public LearnerNotFoundException(String message) {
        super(message);
    }
}
