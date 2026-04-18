package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for completing Sign in with Apple registration with handle selection.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@Schema(description = "Complete Sign in with Apple signup request")
public record CompleteAppleSignupRequest(

    @Schema(description = "Temporary token from the initial Apple login step")
    @NotBlank(message = "Temp token is required")
    String tempToken,

    @Schema(description = "Unique handle (3-30 chars, lowercase alphanumeric and hyphens)",
        example = "bobsmith")
    @NotBlank(message = "Handle is required")
    @Pattern(regexp = "^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$",
        message = "Handle must be 3-30 characters, lowercase alphanumeric and hyphens, "
            + "no consecutive hyphens, must start and end with alphanumeric")
    String handle,

    @Schema(description = "Display name", example = "Bob Smith")
    @NotBlank(message = "Display name is required")
    @Size(max = 100, message = "Display name must not exceed 100 characters")
    String displayName
) {
}
