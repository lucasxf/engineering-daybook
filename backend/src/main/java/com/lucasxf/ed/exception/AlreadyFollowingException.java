package com.lucasxf.ed.exception;

/**
 * Thrown when a learner attempts to follow someone they already follow.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public class AlreadyFollowingException extends RuntimeException {

    public AlreadyFollowingException(String message) {
        super(message);
    }
}
