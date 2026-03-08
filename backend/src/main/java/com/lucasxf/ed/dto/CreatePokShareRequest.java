package com.lucasxf.ed.dto;

import jakarta.validation.constraints.Size;

import com.lucasxf.ed.domain.Pok;

/**
 * Request DTO for re-learning (sharing) a POK.
 *
 * @param note       optional personal note from the sharer (max 500 chars)
 * @param visibility visibility tier for this re-learning; null defaults to the original's visibility
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public record CreatePokShareRequest(
    @Size(max = 500, message = "Note must not exceed 500 characters")
    String note,
    Pok.Visibility visibility) {
}
