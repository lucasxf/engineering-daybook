package com.lucasxf.ed;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for Engineering Daybook backend.
 *
 * <p>Engineering Daybook is a personal knowledge management tool for engineers
 * to capture, organize, and recall daily learnings.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class EdApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdApplication.class, args);
    }
}
