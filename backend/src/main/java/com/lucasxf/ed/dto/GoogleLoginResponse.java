package com.lucasxf.ed.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import com.lucasxf.ed.service.AuthResult;

/**
 * Response DTO for Google OAuth login.
 *
 * <p>If the user exists, tokens are delivered via {@code httpOnly} cookies (web) and in
 * the JSON body ({@code accessToken}, {@code refreshToken}) for mobile clients. If the
 * user is new, returns a temp token for handle selection ({@code requiresHandle=true}).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@Schema(description = "Google OAuth login response")
public record GoogleLoginResponse(

    @Schema(description = "Whether the user needs to choose a handle (first-time Google user)")
    boolean requiresHandle,

    @Schema(description = "Temporary token for completing registration (only when requiresHandle=true)")
    String tempToken,

    @Schema(description = "User handle (only when requiresHandle=false)")
    String handle,

    @Schema(description = "User ID (only when requiresHandle=false)")
    UUID userId,

    @Schema(description = "User email address (only when requiresHandle=false)")
    String email,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "JWT access token — mobile clients only; web clients use the access_token cookie")
    String accessToken,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Opaque refresh token — mobile clients only; web clients use the refresh_token cookie")
    String refreshToken) {

    /**
     * Creates a response for an existing Google user (returning user).
     * Tokens are delivered via cookies (web) and JSON body (mobile).
     */
    public static GoogleLoginResponse existingUser(AuthResult authResult) {
        return new GoogleLoginResponse(
            false, null,
            authResult.handle(), authResult.userId(), authResult.email(),
            authResult.accessToken(), authResult.refreshToken());
    }

    /**
     * Creates a response for a new Google user who needs to choose a handle.
     */
    public static GoogleLoginResponse newUser(String tempToken) {
        return new GoogleLoginResponse(true, tempToken, null, null, null, null, null);
    }
}
