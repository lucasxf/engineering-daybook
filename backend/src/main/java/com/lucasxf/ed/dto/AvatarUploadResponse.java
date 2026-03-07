package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response body for {@code POST /api/v1/users/me/avatar}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@Schema(description = "Result of a successful avatar upload")
public record AvatarUploadResponse(
    @Schema(description = "Public URL of the uploaded avatar image") String avatarUrl) {}
