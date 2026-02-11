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
    JwtProperties jwt
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
}
