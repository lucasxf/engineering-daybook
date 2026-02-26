package com.lucasxf.ed.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for semantic search.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@ConfigurationProperties(prefix = "search")
public record SearchProperties(HuggingFace huggingFace) {

    /**
     * HuggingFace Inference API configuration.
     */
    public record HuggingFace(String apiKey, String modelUrl, int maxRetries) {
    }
}
