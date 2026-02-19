package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for Google OAuth login.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@Schema(description = "Google OAuth login request")
public record GoogleLoginRequest(

    @Schema(description = "Google ID token from Google Identity Services")
    @NotBlank(message = "Google ID token is required")
    String idToken
) {
}
