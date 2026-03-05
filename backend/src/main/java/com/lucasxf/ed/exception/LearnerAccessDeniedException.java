package com.lucasxf.ed.exception;

/**
 * Exception thrown when a non-owner attempts to access learnings on a private profile.
 *
 * <p>This exception results in an HTTP 403 Forbidden response.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
public class LearnerAccessDeniedException extends RuntimeException {

    public LearnerAccessDeniedException(String message) {
        super(message);
    }
}
