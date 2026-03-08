package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.service.FeedService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for the discovery feed (Milestone 6.5).
 *
 * <p>Exposes {@code GET /api/v1/feed}, a paginated endpoint returning a chronological
 * mix of owned learnings and re-learnings from all learners the authenticated user follows.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-08
 */
@RestController
@RequestMapping("/api/v1/feed")
@Tag(name = "Feed", description = "Discovery feed — chronological learnings from followed learners")
public class FeedController {

    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = requireNonNull(feedService);
    }

    /**
     * Returns a paginated discovery feed for the authenticated user.
     *
     * <p>Items are sorted newest-first. The feed contains owned learnings and re-learnings
     * from all learners the caller follows, filtered by visibility tier. The caller's own
     * learnings are excluded.
     *
     * @param page          zero-based page index (default 0)
     * @param size          number of items per page (default 20)
     * @param authentication the caller's authentication context
     * @return a paginated page of {@link FeedItemResponse} items
     */
    @GetMapping
    @Operation(
        summary = "Get discovery feed",
        description = "Returns a paginated, newest-first feed of learnings from followed learners. " +
            "Requires authentication.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Feed page returned"),
            @ApiResponse(responseCode = "401", description = "Unauthenticated")
        })
    public Page<FeedItemResponse> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return feedService.getDiscoveryFeed(requesterId, page, size);
    }
}
