package com.lucasxf.ed.dto;

import java.time.Instant;

/**
 * Sealed interface for items that appear in a learner's feed or profile listing.
 *
 * <p>Implementors:
 * <ul>
 *   <li>{@link PokResponse} — an owned learning ({@code type = "owned"})</li>
 *   <li>{@link PokShareResponse} — a re-learned (shared) learning ({@code type = "shared"})</li>
 * </ul>
 *
 * <p>The {@code type} discriminator allows the frontend to render the correct card variant
 * without instanceof checks or parallel arrays.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public sealed interface FeedItemResponse permits PokResponse, PokShareResponse {

    /**
     * Type discriminator: {@code "owned"} for the learner's own POK, {@code "shared"} for a re-learning.
     *
     * @return the type string
     */
    String type();

    /**
     * Creation timestamp used for ordering feed items in reverse-chronological order.
     *
     * @return the creation timestamp
     */
    Instant createdAt();
}
