package com.lucasxf.ed.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for internal admin operations.
 *
 * <p>The {@code internalKey} is compared against the {@code X-Internal-Key} request header
 * on all admin endpoints. It must be set via the {@code ADMIN_INTERNAL_KEY} environment variable
 * in production. The default placeholder value is intentionally weak — it must be overridden.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ConfigurationProperties(prefix = "admin")
public record AdminProperties(String internalKey) {
}
