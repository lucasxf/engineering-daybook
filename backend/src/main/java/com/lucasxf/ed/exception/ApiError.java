package com.lucasxf.ed.exception;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

/**
 * Standard API error response format.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@Schema(description = "Standard API error response")
public record ApiError(
    @Schema(description = "Timestamp of the error", example = "2026-01-29T14:30:00Z")
    Instant timestamp,

    @Schema(description = "HTTP status code", example = "400")
    int status,

    @Schema(description = "Error type", example = "Bad Request")
    String error,

    @Schema(description = "Error message", example = "Validation failed")
    String message,

    @Schema(description = "Request path", example = "/api/v1/poks")
    String path,

    @Schema(description = "Detailed error messages", nullable = true)
    List<String> details
) {

    public ApiError(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }

    public ApiError(int status, String error, String message, String path, List<String> details) {
        this(Instant.now(), status, error, message, path, details);
    }
}
