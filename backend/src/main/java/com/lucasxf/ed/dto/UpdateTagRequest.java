package com.lucasxf.ed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for renaming an existing tag.
 *
 * @param name the new tag name
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
public record UpdateTagRequest(
    @NotBlank(message = "Tag name is required and must not be blank")
    @Size(max = 100, message = "Tag name must be 100 characters or less")
    String name
) {
}
