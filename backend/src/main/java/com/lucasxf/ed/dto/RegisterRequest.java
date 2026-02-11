package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "User registration request")
public record RegisterRequest(

    @Schema(description = "User email address", example = "user@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    String email,

    @Schema(description = "User password (8-128 chars, 1 uppercase, 1 lowercase, 1 number)",
        example = "MyPassword1")
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number")
    String password,

    @Schema(description = "Display name", example = "Lucas Xavier")
    @NotBlank(message = "Display name is required")
    @Size(max = 100, message = "Display name must not exceed 100 characters")
    String displayName,

    @Schema(description = "Unique handle (3-30 chars, lowercase alphanumeric and hyphens)",
        example = "lucasxf")
    @NotBlank(message = "Handle is required")
    @Pattern(regexp = "^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$",
        message = "Handle must be 3-30 characters, lowercase alphanumeric and hyphens, "
            + "no consecutive hyphens, must start and end with alphanumeric")
    String handle
) {
}
