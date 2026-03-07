package com.lucasxf.ed.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Supabase object storage.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@ConfigurationProperties(prefix = "storage")
public record StorageProperties(Supabase supabase) {

    /** Supabase Storage REST API configuration. */
    public record Supabase(String url, String serviceKey, String bucket) {}
}
