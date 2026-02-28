package com.lucasxf.ed.controller;

import java.util.Map;

import io.swagger.v3.oas.annotations.Hidden;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.config.AdminProperties;
import com.lucasxf.ed.service.EmbeddingBackfillService;
import com.lucasxf.ed.service.TagSuggestionBackfillService;

import static java.util.Objects.requireNonNull;

/**
 * Internal admin endpoints for operational tasks.
 *
 * <p>All endpoints are protected by the {@code X-Internal-Key} request header.
 * These endpoints are intentionally excluded from the public OpenAPI documentation.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-26
 */
@Hidden
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final EmbeddingBackfillService embeddingBackfillService;
    private final TagSuggestionBackfillService tagSuggestionBackfillService;
    private final AdminProperties adminProperties;

    public AdminController(EmbeddingBackfillService embeddingBackfillService,
                           TagSuggestionBackfillService tagSuggestionBackfillService,
                           AdminProperties adminProperties) {
        this.embeddingBackfillService = requireNonNull(embeddingBackfillService);
        this.tagSuggestionBackfillService = requireNonNull(tagSuggestionBackfillService);
        this.adminProperties = requireNonNull(adminProperties);
    }

    /**
     * Triggers a one-time backfill of embeddings for all POKs with {@code embedding IS NULL}.
     *
     * <p>The operation is idempotent — safe to re-run; already-embedded POKs are skipped.
     * Returns {@code 202 Accepted} with the count of POKs enqueued for embedding generation.
     *
     * @param internalKey the internal API key from the {@code X-Internal-Key} header
     * @return {@code 202} with {@code {"enqueued": N}} on success, {@code 401} if key is invalid
     */
    @PostMapping("/poks/backfill-embeddings")
    public ResponseEntity<Map<String, Integer>> backfillEmbeddings(
        @RequestHeader(value = "X-Internal-Key", required = false) String internalKey) {
        if (internalKey == null || !internalKey.equals(adminProperties.internalKey())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int enqueued = embeddingBackfillService.backfill();
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("enqueued", enqueued));
    }

    /**
     * Triggers a one-time backfill of tag suggestions for all active POKs of users who have tags.
     *
     * <p>Only users with at least one active tag subscription are processed. The operation is
     * idempotent — already-suggested tag names are skipped. Returns {@code 202 Accepted} with
     * the count of POKs enqueued for suggestion generation.
     *
     * @param internalKey the internal API key from the {@code X-Internal-Key} header
     * @return {@code 202} with {@code {"enqueued": N}} on success, {@code 401} if key is invalid
     */
    @PostMapping("/poks/backfill-tag-suggestions")
    public ResponseEntity<Map<String, Integer>> backfillTagSuggestions(
        @RequestHeader(value = "X-Internal-Key", required = false) String internalKey) {
        if (internalKey == null || !internalKey.equals(adminProperties.internalKey())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int enqueued = tagSuggestionBackfillService.backfill();
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("enqueued", enqueued));
    }
}
