package com.lucasxf.ed.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for Sign in with Apple.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@Schema(description = "Sign in with Apple request")
public record AppleLoginRequest(

    @Schema(description = "Apple identity token from Sign in with Apple")
    @NotBlank(message = "Apple identity token is required")
    String identityToken
) {
}
