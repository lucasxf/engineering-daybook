package com.lucasxf.ed.exception;

/**
 * Thrown when a tag operation would create a duplicate in the user's active tag set.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public class TagConflictException extends RuntimeException {

    public TagConflictException(String message) {
        super(message);
    }
}
