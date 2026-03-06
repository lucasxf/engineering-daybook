package com.lucasxf.ed.exception;

/**
 * Thrown when a learner attempts to follow themselves.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public class SelfFollowException extends RuntimeException {

    public SelfFollowException(String message) {
        super(message);
    }
}
