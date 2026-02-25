package com.lucasxf.ed.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for successful authentication.
 *
 * <p>JWT tokens are delivered via {@code httpOnly} cookies and are intentionally absent from
 * this response body. Only the user identity required by the client to initialise application
 * state is returned here.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "Authentication response with user identity")
public record AuthResponse(

    @Schema(description = "User handle", example = "lucasxf")
    String handle,

    @Schema(description = "User ID")
    UUID userId,

    @Schema(description = "User email address", example = "user@example.com")
    String email
) {
}
