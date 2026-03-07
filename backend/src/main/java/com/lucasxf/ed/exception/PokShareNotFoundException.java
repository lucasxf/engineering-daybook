package com.lucasxf.ed.exception;

/**
 * Thrown when a requested PokShare does not exist.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public class PokShareNotFoundException extends RuntimeException {

    public PokShareNotFoundException(String message) {
        super(message);
    }
}
