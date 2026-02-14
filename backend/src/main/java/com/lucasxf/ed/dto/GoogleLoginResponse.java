package com.lucasxf.ed.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for Google OAuth login.
 * <p>
 * If the user exists, returns full auth tokens ({@code requiresHandle=false}).
 * If the user is new, returns a temp token for handle selection ({@code requiresHandle=true}).
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

    @Schema(description = "JWT access token (only when requiresHandle=false)")
    String accessToken,

    @Schema(description = "Refresh token (only when requiresHandle=false)")
    String refreshToken,

    @Schema(description = "User handle (only when requiresHandle=false)")
    String handle,

    @Schema(description = "User ID (only when requiresHandle=false)")
    UUID userId,

    @Schema(description = "Access token expiry in seconds (only when requiresHandle=false)")
    Long expiresIn
) {

    /**
     * Creates a response for an existing Google user (returning user).
     */
    public static GoogleLoginResponse existingUser(AuthResponse authResponse) {
        return new GoogleLoginResponse(
            false, null,
            authResponse.accessToken(), authResponse.refreshToken(),
            authResponse.handle(), authResponse.userId(), authResponse.expiresIn()
        );
    }

    /**
     * Creates a response for a new Google user who needs to choose a handle.
     */
    public static GoogleLoginResponse newUser(String tempToken) {
        return new GoogleLoginResponse(
            true, tempToken,
            null, null, null, null, null
        );
    }
}
