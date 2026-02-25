package com.lucasxf.ed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating or finding an existing tag.
 *
 * @param name the tag name (trimmed, stored case-preserved, deduplicated case-insensitively)
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public record CreateTagRequest(
    @NotBlank(message = "Tag name is required and must not be blank")
    @Size(max = 100, message = "Tag name must be 100 characters or less")
    String name
) {
}
