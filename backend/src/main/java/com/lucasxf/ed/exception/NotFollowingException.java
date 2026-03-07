package com.lucasxf.ed.exception;

/**
 * Thrown when a learner attempts to unfollow someone they do not currently follow.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
public class NotFollowingException extends RuntimeException {

    public NotFollowingException(String message) {
        super(message);
    }
}
