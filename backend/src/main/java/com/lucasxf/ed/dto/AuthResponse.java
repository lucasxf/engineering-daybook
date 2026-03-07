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
 * <p>{@code defaultPokVisibility} and {@code profileVisibility} are populated on all auth
 * operations (login, register, refresh, Google sign-in, and {@code /me}) since the {@code User}
 * entity is already loaded during token issuance. The separate {@code /me} endpoint remains
 * useful for restoring session state on page load without re-issuing tokens.
 *
 * <p>{@code avatarUrl}, {@code bio}, and {@code displayName} are populated only on the
 * {@code /me} endpoint, where the full User entity is already fetched.
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
    @Schema(description = "User's default visibility for new learnings")
    Pok.Visibility defaultPokVisibility,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "User's profile visibility")
    User.ProfileVisibility profileVisibility,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Avatar URL — populated on /me only; null means no avatar set")
    String avatarUrl,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Short bio — populated on /me only")
    String bio,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Display name — populated on /me only", example = "Lucas Xavier")
    String displayName) {

    /** Identity-only constructor — for web login/register/refresh (cookie-based, no tokens, no settings). */
    public AuthResponse(String handle, UUID userId, String email) {
        this(handle, userId, email, null, null, null, null, null, null, null);
    }

    /** Mobile login/refresh constructor — includes tokens in body but no settings. */
    public AuthResponse(String handle, UUID userId, String email, String accessToken, String refreshToken) {
        this(handle, userId, email, accessToken, refreshToken, null, null, null, null, null);
    }

    /**
     * Web login/register/refresh/google constructor — includes settings (no tokens, no profile fields).
     * avatarUrl, bio, displayName are omitted here to keep the login response minimal.
     */
    public AuthResponse(String handle, UUID userId, String email,
            String accessToken, String refreshToken,
            Pok.Visibility defaultPokVisibility, User.ProfileVisibility profileVisibility) {
        this(handle, userId, email, accessToken, refreshToken, defaultPokVisibility, profileVisibility,
            null, null, null);
    }

    /** /me constructor — includes full settings and profile fields from a DB-fetched User. */
    public AuthResponse(String handle, UUID userId, String email,
            Pok.Visibility defaultPokVisibility, User.ProfileVisibility profileVisibility,
            String avatarUrl, String bio, String displayName) {
        this(handle, userId, email, null, null, defaultPokVisibility, profileVisibility,
            avatarUrl, bio, displayName);
    }
}
