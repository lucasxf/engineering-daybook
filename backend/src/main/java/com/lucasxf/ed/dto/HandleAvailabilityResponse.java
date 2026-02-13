package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for handle availability check.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "Handle availability check response")
public record HandleAvailabilityResponse(

    @Schema(description = "Whether the handle is available", example = "true")
    boolean available,

    @Schema(description = "The handle that was checked", example = "lucasxf")
    String handle
) {
}
