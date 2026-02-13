package com.lucasxf.ed.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for successful authentication.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "Authentication response with tokens")
public record AuthResponse(

    @Schema(description = "JWT access token")
    String accessToken,

    @Schema(description = "Refresh token for session renewal")
    String refreshToken,

    @Schema(description = "User handle", example = "lucasxf")
    String handle,

    @Schema(description = "User ID")
    UUID userId,

    @Schema(description = "Access token expiry in seconds", example = "900")
    long expiresIn
) {
}
