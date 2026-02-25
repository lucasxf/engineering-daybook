package com.lucasxf.ed.exception;

/**
 * Thrown when a requested tag does not exist or is not accessible by the requesting user.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public class TagNotFoundException extends RuntimeException {

    public TagNotFoundException(String message) {
        super(message);
    }

    public TagNotFoundException() {
        super("Tag not found");
    }
}
