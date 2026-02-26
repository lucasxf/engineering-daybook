package com.lucasxf.ed.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.web.client.RestClient;

/**
 * Provides a prototype {@link RestClient.Builder} bean for injection into services
 * that need to construct {@link RestClient} instances.
 *
 * <p>Spring Boot's {@code RestClientAutoConfiguration} should register this automatically,
 * but defining it explicitly here ensures it is always available regardless of which
 * auto-configuration conditions are active (e.g., in integration test contexts).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Configuration
public class RestClientConfig {

    /**
     * Returns a fresh {@link RestClient.Builder} for each injection point.
     *
     * @return a new {@code RestClient.Builder}
     */
    @Bean
    @Scope("prototype")
    @ConditionalOnMissingBean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
