package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for health check endpoint.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@Schema(description = "Health check response")
public record HealthResponse(
    @Schema(description = "Health status", example = "OK")
    String status,

    @Schema(description = "Health message", example = "Engineering Daybook API is running")
    String message
) {
}
