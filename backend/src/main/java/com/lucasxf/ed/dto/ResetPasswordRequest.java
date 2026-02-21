package com.lucasxf.ed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body for the reset-password confirm endpoint.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
public record ResetPasswordRequest(
    @NotBlank(message = "auth.passwordReset.errors.tokenInvalid")
    String token,

    @NotBlank(message = "auth.errors.passwordRequired")
    @Size(min = 8, max = 128, message = "auth.errors.passwordLength")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "auth.errors.passwordComplexity"
    )
    String newPassword
) {
}
