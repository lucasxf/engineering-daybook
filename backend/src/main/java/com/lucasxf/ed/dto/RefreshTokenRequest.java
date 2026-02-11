package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for token refresh.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "Token refresh request")
public record RefreshTokenRequest(

    @Schema(description = "Refresh token")
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {
}
