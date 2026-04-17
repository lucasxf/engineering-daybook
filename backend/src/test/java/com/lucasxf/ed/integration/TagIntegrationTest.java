package com.lucasxf.ed.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end integration tests for the tagging system against a real PostgreSQL database.
 *
 * <p>Exercises the full stack: HTTP layer, service layer, repository layer, and
 * Hibernate-managed schema (via create-drop in the test profile).
 *
 * <p>Requires Docker to be running. Skipped if Docker is not available.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("Tagging System — Integration")
class TagIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return;
        }
        postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15")
                .withDatabaseName("ed_test")
                .withUsername("test")
                .withPassword("test");
        postgres.start();

        // Enable pgvector extension before Hibernate create-drop generates the vector(384) column
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ===== AC1: Create tag =====

    @Test
    @DisplayName("AC1 — create tag creates global tag and user subscription")
    void createTag_shouldReturn201WithTagData() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        MvcResult result = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"name": "spring-boot"}
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("spring-boot"))
                .andExpect(jsonPath("$.color").isNotEmpty())
                .andReturn();

        String tagId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asText();
        assertThat(tagId).isNotNull();
    }

    // ===== AC4: Idempotent create =====

    @Test
    @DisplayName("AC4 — creating duplicate tag returns existing subscription")
    void createTag_withDuplicateName_shouldBeIdempotent() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // First create
        MvcResult first = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"kubernetes\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        // Second create (duplicate)
        MvcResult second = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"kubernetes\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        String firstId = objectMapper.readTree(first.getResponse().getContentAsString()).get("id").asText();
        String secondId = objectMapper.readTree(second.getResponse().getContentAsString()).get("id").asText();
        assertThat(firstId).isEqualTo(secondId); // same subscription returned
    }

    // ===== AC8: List tags =====

    @Test
    @DisplayName("AC8 — list returns only active tags for the user")
    void listTags_shouldReturnActiveTags() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // Create two tags
        mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"java\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"docker\"}"))
                .andExpect(status().isCreated());

        // List
        mockMvc.perform(get("/api/v1/tags").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ===== AC16: Delete tag removes assignments =====

    @Test
    @DisplayName("AC16 — delete tag soft-deletes subscription")
    void deleteTag_shouldReturn204AndTagRemovedFromList() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // Create
        MvcResult createResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"legacy-tag\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        String tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // Delete
        mockMvc.perform(delete("/api/v1/tags/" + tagId).cookie(token))
                .andExpect(status().isNoContent());

        // No longer listed
        mockMvc.perform(get("/api/v1/tags").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ===== AC22: Assign tag to POK =====

    @Test
    @DisplayName("AC22 — assign tag to POK and retrieve via getById")
    void assignTag_shouldAppearInPokResponse() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // Create tag
        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"integration\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String tagId = objectMapper.readTree(tagResult.getResponse().getContentAsString())
                .get("id").asText();

        // Create POK
        MvcResult pokResult = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"title": "Test POK", "content": "Some content"}
                            """))
                .andExpect(status().isCreated())
                .andReturn();
        String pokId = objectMapper.readTree(pokResult.getResponse().getContentAsString())
                .get("id").asText();

        // Assign tag
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + tagId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // Verify via getById
        mockMvc.perform(get("/api/v1/poks/" + pokId).cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags").isArray())
                .andExpect(jsonPath("$.tags.length()").value(1))
                .andExpect(jsonPath("$.tags[0].name").value("integration"));
    }

    // ===== AC: Subscription ID vs global tag ID — root cause of mobile "Failed to add tag" bug =====

    @Test
    @DisplayName("assign tag — 204 with UserTag subscription ID (id field)")
    void assignTag_withSubscriptionId_shouldReturn204() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"subscription-id-test\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String subscriptionId = objectMapper.readTree(tagResult.getResponse().getContentAsString())
                .get("id").asText(); // UserTag.id — the subscription ID

        MvcResult pokResult = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Contract test\", \"content\": \"Content\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String pokId = objectMapper.readTree(pokResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + subscriptionId)
                        .cookie(token))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("assign tag — 404 when passing global Tag.id (tagId field) instead of UserTag subscription ID")
    void assignTag_withGlobalTagId_shouldReturn404() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"global-id-test\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        // tagId is the global Tag pool ID — NOT the UserTag subscription ID
        String globalTagId = objectMapper.readTree(tagResult.getResponse().getContentAsString())
                .get("tagId").asText();

        MvcResult pokResult = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Contract test\", \"content\": \"Content\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String pokId = objectMapper.readTree(pokResult.getResponse().getContentAsString())
                .get("id").asText();

        // Passing the global Tag.id (tagId) instead of UserTag.id must return 404
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + globalTagId)
                        .cookie(token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("assign tag — idempotent: assigning same tag twice returns 204 both times")
    void assignTag_twice_shouldBeIdempotent() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"idempotent-tag\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String subscriptionId = objectMapper.readTree(tagResult.getResponse().getContentAsString())
                .get("id").asText();

        MvcResult pokResult = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Idempotency test\", \"content\": \"Content\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String pokId = objectMapper.readTree(pokResult.getResponse().getContentAsString())
                .get("id").asText();

        // First assign — 204
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + subscriptionId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // Second assign (duplicate) — must also return 204, not 409 or 500
        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + subscriptionId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // Tag appears exactly once in the POK
        mockMvc.perform(get("/api/v1/poks/" + pokId).cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags.length()").value(1));
    }

    // ===== AC23: Remove tag from POK =====

    @Test
    @DisplayName("AC23 — remove tag from POK clears the assignment")
    void removeTag_shouldClearTagFromPok() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // Create and assign
        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"to-remove\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String tagId = objectMapper.readTree(tagResult.getResponse().getContentAsString())
                .get("id").asText();

        MvcResult pokResult = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"POK to untag\", \"content\": \"Content\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String pokId = objectMapper.readTree(pokResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/poks/" + pokId + "/tags/" + tagId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // Remove
        mockMvc.perform(delete("/api/v1/poks/" + pokId + "/tags/" + tagId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // No tags on POK
        mockMvc.perform(get("/api/v1/poks/" + pokId).cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags.length()").value(0));
    }

    // ===== AC: Rename tag =====

    @Test
    @DisplayName("Rename tag soft-deletes old subscription and creates new")
    void renameTag_shouldUpdateName() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"k8s\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // Rename
        mockMvc.perform(put("/api/v1/tags/" + tagId)
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"kubernetes\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("kubernetes"));

        // Old tag gone from list, new tag present
        mockMvc.perform(get("/api/v1/tags").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("kubernetes"));
    }

    // ===== AC: displayName field in TagResponse =====

    @Test
    @DisplayName("displayName — tag response includes displayName with original casing")
    void createTag_shouldReturnDisplayName() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"spring-boot\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("spring-boot"))
                .andExpect(jsonPath("$.displayName").value("spring-boot"));
    }

    @Test
    @DisplayName("displayName — spaces in input are converted to dashes in both name and displayName")
    void createTag_withSpaces_shouldNormaliseNameAndDisplayName() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"machine learning\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("machine-learning"))
                .andExpect(jsonPath("$.displayName").value("machine-learning"));
    }

    // ===== AC: tagId filter for GET /poks =====

    @Test
    @DisplayName("tagId filter — GET /poks?tagId returns only POKs tagged with that tag")
    void listPoks_withTagIdFilter_shouldReturnOnlyTaggedPoks() throws Exception {
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker not available");

        Cookie token = registerAndLogin();

        // Create a tag
        MvcResult tagResult = mockMvc.perform(post("/api/v1/tags")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"java\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String userTagId = objectMapper.readTree(tagResult.getResponse().getContentAsString()).get("id").asText();
        String globalTagId = objectMapper.readTree(tagResult.getResponse().getContentAsString()).get("tagId").asText();

        // Create two POKs
        MvcResult pok1Result = mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Tagged POK\", \"content\": \"About Java\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String pok1Id = objectMapper.readTree(pok1Result.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/poks")
                        .cookie(token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Untagged POK\", \"content\": \"About Python\"}"))
                .andExpect(status().isCreated());

        // Assign tag to pok1 only
        mockMvc.perform(post("/api/v1/poks/" + pok1Id + "/tags/" + userTagId)
                        .cookie(token))
                .andExpect(status().isNoContent());

        // Filter by tagId — should return only pok1
        mockMvc.perform(get("/api/v1/poks")
                        .cookie(token)
                        .param("tagId", globalTagId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Tagged POK"));
    }

    // ===== helpers =====

    /**
     * Registers a new user and returns the access_token as a Cookie object
     * suitable for use with MockMvc's {@code .cookie()} method.
     *
     * <p>Uses {@code .cookie()} rather than {@code .header("Cookie", ...)} because
     * {@code JwtAuthenticationFilter} reads cookies via {@code request.getCookies()},
     * which MockMvc only populates when cookies are added via the cookie API —
     * not when the {@code Cookie} header is set manually.
     */
    private Cookie registerAndLogin() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "tag-test-" + suffix + "@example.com";
        String handle = "tagtest" + suffix;

        MockHttpServletResponse response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "email": "%s",
                                "password": "Password1",
                                "displayName": "Tag Tester",
                                "handle": "%s"
                            }
                            """.formatted(email, handle)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();

        String tokenValue = response.getHeaders("Set-Cookie").stream()
                .filter(c -> c.startsWith("access_token="))
                .findFirst()
                .map(c -> c.split(";")[0].substring("access_token=".length()))
                .orElseThrow(() -> new AssertionError("No access_token cookie in register response"));

        return new Cookie("access_token", tokenValue);
    }
}
