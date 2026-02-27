package com.lucasxf.ed.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for successful authentication.
 *
 * <p>Tokens are delivered via {@code httpOnly} cookies for browser clients and also
 * included in the JSON body ({@code accessToken}, {@code refreshToken}) for mobile clients
 * that cannot store cookies. Web clients should ignore these fields and rely on cookies
 * instead. Both fields are omitted from the JSON body when no tokens are issued (e.g. the
 * {@code /me} endpoint).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Schema(description = "Authentication response with user identity")
public record AuthResponse(

    @Schema(description = "User handle", example = "lucasxf")
    String handle,

    @Schema(description = "User ID")
    UUID userId,

    @Schema(description = "User email address", example = "user@example.com")
    String email,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "JWT access token — mobile clients only; web clients use the access_token cookie")
    String accessToken,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Opaque refresh token — mobile clients only; web clients use the refresh_token cookie")
    String refreshToken
) {

    /** Identity-only constructor — for endpoints that do not issue tokens (e.g. {@code /me}). */
    public AuthResponse(String handle, UUID userId, String email) {
        this(handle, userId, email, null, null);
    }
}
