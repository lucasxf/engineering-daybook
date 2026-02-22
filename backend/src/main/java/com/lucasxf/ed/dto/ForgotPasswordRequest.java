package com.lucasxf.ed.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for the forgot-password endpoint.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
public record ForgotPasswordRequest(
    @NotBlank(message = "auth.passwordReset.errors.emailRequired")
    @Email(message = "auth.passwordReset.errors.emailInvalid")
    String email
) {
}
