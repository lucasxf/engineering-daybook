package com.lucasxf.ed.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import com.lucasxf.ed.service.AuthResult;

/**
 * Response DTO for Sign in with Apple.
 *
 * <p>If the user exists, tokens are delivered via {@code httpOnly} cookies (web) and in
 * the JSON body ({@code accessToken}, {@code refreshToken}) for mobile clients. If the
 * user is new, returns a temp token and email for handle selection ({@code requiresHandle=true}).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@Schema(description = "Sign in with Apple response")
public record AppleLoginResponse(

    @Schema(description = "Whether the user needs to choose a handle (first-time Apple user)")
    boolean requiresHandle,

    @Schema(description = "Temporary token for completing registration (only when requiresHandle=true)")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String tempToken,

    @Schema(description = "User email address (present for new users to pre-fill the form; only when requiresHandle=true)")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String email,

    @Schema(description = "User handle (only when requiresHandle=false)")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String handle,

    @Schema(description = "User ID (only when requiresHandle=false)")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UUID userId,

    @Schema(description = "JWT access token — mobile clients only; web clients use the access_token cookie")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String accessToken,

    @Schema(description = "Opaque refresh token — mobile clients only; web clients use the refresh_token cookie")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String refreshToken) {

    /**
     * Creates a response for an existing Apple user (returning user).
     * Tokens are delivered via cookies (web) and JSON body (mobile).
     */
    public static AppleLoginResponse existingUser(AuthResult authResult) {
        return new AppleLoginResponse(
            false, null, authResult.email(),
            authResult.handle(), authResult.userId(),
            authResult.accessToken(), authResult.refreshToken());
    }

    /**
     * Creates a response for a new Apple user who needs to choose a handle.
     */
    public static AppleLoginResponse newUser(String tempToken, String email) {
        return new AppleLoginResponse(true, tempToken, email, null, null, null, null);
    }
}
