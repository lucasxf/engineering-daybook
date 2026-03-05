package com.lucasxf.ed.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
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
 * <p>{@code defaultPokVisibility} is populated only on the {@code /me} endpoint, where a
 * DB lookup is available. It is omitted from login/register/refresh responses (null).
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
    String refreshToken,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "User's default visibility for new learnings — populated on /me only")
    Pok.Visibility defaultPokVisibility,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "User's profile visibility — populated on /me only")
    User.ProfileVisibility profileVisibility) {

    /** Identity-only constructor — for web login/register/refresh (cookie-based, no tokens, no settings). */
    public AuthResponse(String handle, UUID userId, String email) {
        this(handle, userId, email, null, null, null, null);
    }

    /** Mobile login/refresh constructor — includes tokens in body but no settings. */
    public AuthResponse(String handle, UUID userId, String email, String accessToken, String refreshToken) {
        this(handle, userId, email, accessToken, refreshToken, null, null);
    }

    /** /me constructor — includes settings from a DB-fetched User. */
    public AuthResponse(String handle, UUID userId, String email,
            Pok.Visibility defaultPokVisibility, User.ProfileVisibility profileVisibility) {
        this(handle, userId, email, null, null, defaultPokVisibility, profileVisibility);
    }
}
