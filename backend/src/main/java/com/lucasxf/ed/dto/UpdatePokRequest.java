package com.lucasxf.ed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing POK.
 *
 * <p>Same validation rules as {@link CreatePokRequest}.
 * Title is optional, content is mandatory.
 *
 * @param title   optional title (0-200 characters, can be null or empty)
 * @param content mandatory content (1-50,000 characters)
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public record UpdatePokRequest(

    @Size(max = 200, message = "Title must be 200 characters or less")
    String title,

    @NotBlank(message = "Content is required and must not be blank")
    @Size(min = 1, max = 50000, message = "Content must be between 1 and 50,000 characters")
    String content
) {
}
