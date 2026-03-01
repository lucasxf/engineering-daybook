package com.lucasxf.ed.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new POK.
 *
 * <p>Title is optional (can be null or empty) to minimize friction.
 * Content is mandatory as it represents the actual knowledge.
 * Tags are optional; if provided, they are assigned atomically during creation.
 *
 * @param title   optional title (0-200 characters)
 * @param content mandatory content (1-50,000 characters)
 * @param tagIds  optional list of user-tag subscription IDs to assign at creation time
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
public record CreatePokRequest(
    @Size(max = 200, message = "Title must be 200 characters or less") String title,
    @NotBlank(message = "Content is required and must not be blank")
    @Size(min = 1, max = 50000, message = "Content must be between 1 and 50,000 characters")
    String content,
    @Size(max = 50, message = "You can assign at most 50 tags when creating a learning")
    List<UUID> tagIds) {
}
