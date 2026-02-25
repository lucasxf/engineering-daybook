package com.lucasxf.ed.security;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.lucasxf.ed.config.AuthProperties;

import static java.util.Objects.requireNonNull;

/**
 * Utility for setting and clearing authentication cookies on HTTP responses.
 *
 * <p>Both cookies are {@code HttpOnly}. The {@code SameSite} policy is derived from the
 * {@code Secure} flag: {@code SameSite=None} when {@code Secure=true} (production HTTPS),
 * {@code SameSite=Lax} otherwise (local HTTP dev). Browsers reject {@code SameSite=None}
 * without {@code Secure}, so the two are always kept in sync.
 * The {@code Secure} flag is controlled by {@code auth.cookie.secure} (set to
 * {@code true} via the {@code AUTH_COOKIE_SECURE} environment variable in production).
 *
 * <ul>
 *   <li>{@code access_token} — short-lived JWT access token; {@code Path=/}</li>
 *   <li>{@code refresh_token} — long-lived opaque refresh token; {@code Path=/api/v1/auth}</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-22
 */
@Component
public class CookieHelper {

    static final String ACCESS_TOKEN_COOKIE = "access_token";
    static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    static final String REFRESH_TOKEN_PATH = "/api/v1/auth";

    private final AuthProperties authProperties;

    public CookieHelper(AuthProperties authProperties) {
        this.authProperties = requireNonNull(authProperties);
    }

    /**
     * Writes both auth cookies onto the response.
     *
     * @param response     the HTTP response to write cookies to
     * @param accessToken  the JWT access token
     * @param refreshToken the opaque refresh token
     */
    public void setAuthCookies(HttpServletResponse response,
                               String accessToken,
                               String refreshToken) {
        long accessMaxAge = authProperties.jwt().accessTokenExpiry().getSeconds();
        long refreshMaxAge = authProperties.jwt().refreshTokenExpiry().getSeconds();
        boolean secure = authProperties.cookie().secure();
        String sameSite = secure ? "None" : "Lax";

        ResponseCookie accessCookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, accessToken)
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path("/")
            .maxAge(accessMaxAge)
            .build();

        ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path(REFRESH_TOKEN_PATH)
            .maxAge(refreshMaxAge)
            .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    /**
     * Expires both auth cookies, effectively clearing the session from the browser.
     *
     * @param response the HTTP response to clear cookies on
     */
    public void clearAuthCookies(HttpServletResponse response) {
        boolean secure = authProperties.cookie().secure();
        String sameSite = secure ? "None" : "Lax";

        ResponseCookie clearAccess = ResponseCookie.from(ACCESS_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path("/")
            .maxAge(0)
            .build();

        ResponseCookie clearRefresh = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path(REFRESH_TOKEN_PATH)
            .maxAge(0)
            .build();

        response.addHeader("Set-Cookie", clearAccess.toString());
        response.addHeader("Set-Cookie", clearRefresh.toString());
    }
}
