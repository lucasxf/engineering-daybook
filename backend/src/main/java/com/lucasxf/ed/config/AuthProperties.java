package com.lucasxf.ed.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for authentication and JWT.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@ConfigurationProperties(prefix = "auth")
public record AuthProperties(
    JwtProperties jwt,
    GoogleProperties google,
    PasswordResetProperties passwordReset,
    CookieProperties cookie
) {

    /**
     * JWT-specific configuration.
     */
    public record JwtProperties(
        String secret,
        Duration accessTokenExpiry,
        Duration refreshTokenExpiry
    ) {
    }

    /**
     * Google OAuth configuration.
     */
    public record GoogleProperties(
        String clientId
    ) {
    }

    /**
     * Password reset flow configuration.
     */
    public record PasswordResetProperties(
        Duration tokenExpiry
    ) {
    }

    /**
     * Cookie settings for token delivery.
     *
     * <p>Set {@code AUTH_COOKIE_SECURE=true} in production (Railway) to enforce
     * the {@code Secure} attribute. Defaults to {@code false} for local HTTP development.
     */
    public record CookieProperties(
        boolean secure
    ) {
    }
}
