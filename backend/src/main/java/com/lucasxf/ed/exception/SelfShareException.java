package com.lucasxf.ed.exception;

/**
 * Thrown when a learner attempts to re-learn their own POK.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public class SelfShareException extends RuntimeException {

    public SelfShareException(String message) {
        super(message);
    }
}
