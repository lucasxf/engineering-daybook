package com.lucasxf.ed.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for CORS allowed origins.
 *
 * <p>Set {@code ALLOWED_ORIGINS} environment variable in production as a
 * comma-separated list of allowed origins (e.g., {@code https://app.example.com}).
 * Defaults to {@code http://localhost:3000} for local development.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-19
 */
@ConfigurationProperties(prefix = "cors")
public record CorsProperties(
    List<String> allowedOrigins
) {
}
