package com.lucasxf.ed.integration;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Integration tests for EdApplication context loading.
 *
 * <p>Requires Docker to be running. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class EdApplicationTests {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return; // Class disabled by @Testcontainers(disabledWithoutDocker = true)
        }
        // Start container here — @DynamicPropertySource runs during Spring context loading,
        // before @BeforeAll, so the container must be started here to be available for
        // property registration.
        postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
            .withDatabaseName("ed_test")
            .withUsername("test")
            .withPassword("test");
        postgres.start();

        // Enable pgvector extension before Flyway applies V12 (vector column migration)
        try (Connection conn = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
            conn.createStatement().execute("CREATE EXTENSION IF NOT EXISTS vector;");
        } catch (Exception e) {
            throw new RuntimeException("Failed to enable pgvector extension", e);
        }

        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @AfterAll
    static void stopContainers() {
        if (postgres != null && postgres.isRunning()) {
            postgres.stop();
        }
    }

    @Test
    void contextLoads() {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(),
            "Docker not available, skipping integration test");
        // Verifies that the Spring context loads successfully with PostgreSQL
    }

}
