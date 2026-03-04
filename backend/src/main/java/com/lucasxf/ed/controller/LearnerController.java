package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.service.LearnerService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for public learner profile access.
 *
 * <p>All endpoints require JWT authentication. Profile access is governed by the learner's
 * {@code profileVisibility} setting:
 * <ul>
 *   <li>PUBLIC profile → full profile visible to all authenticated users</li>
 *   <li>PRIVATE profile → minimal shell (handle only) for non-owners; full profile for owner</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@RestController
@RequestMapping("/api/v1/learners")
@Tag(name = "Learners", description = "Public learner profile and learnings")
public class LearnerController {

    private final LearnerService learnerService;

    public LearnerController(LearnerService learnerService) {
        this.learnerService = requireNonNull(learnerService);
    }

    /**
     * Returns the learner profile for the given handle.
     *
     * <p>For PRIVATE profiles visited by non-owners, returns a minimal shell with only the
     * handle and profileVisibility. For PUBLIC profiles or the owner's own profile, returns
     * the full profile including display name and recent learnings.
     *
     * @param handle         the learner's unique handle
     * @param authentication the authenticated user
     * @return 200 with profile response (either full or private shell); 404 if unknown handle
     */
    @GetMapping("/{handle}")
    @Operation(
        summary = "Get learner profile",
        description = "Returns the public profile for the learner with the given handle. "
            + "Private profiles return a minimal shell (handle + visibility only) to non-owners.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Profile returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Learner not found")
        }
    )
    public ResponseEntity<LearnerProfileResponse> getProfile(
            @PathVariable String handle,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        LearnerProfileResponse response = learnerService.getProfile(handle, requesterId);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns a paginated list of PUBLIC learnings for the given learner.
     *
     * <p>The owner always sees all their own learnings (public + private).
     * Non-owners receive 403 if the profile is PRIVATE.
     *
     * @param handle         the learner's unique handle
     * @param page           zero-based page number (default 0)
     * @param size           page size (default 20)
     * @param authentication the authenticated user
     * @return 200 with paginated learnings; 403 if PRIVATE profile; 404 if unknown handle
     */
    @GetMapping("/{handle}/poks")
    @Operation(
        summary = "Get learner's public learnings",
        description = "Returns a paginated list of PUBLIC learnings for the given learner. "
            + "Returns 403 if the profile is PRIVATE and the requester is not the owner. "
            + "The owner always sees all their learnings (public + private).",
        responses = {
            @ApiResponse(responseCode = "200", description = "Learnings returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Profile is private"),
            @ApiResponse(responseCode = "404", description = "Learner not found")
        }
    )
    public ResponseEntity<Page<Pok>> getLearnerPoks(
            @PathVariable String handle,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        Page<Pok> result = learnerService.getLearnerPoks(handle, requesterId, page, size);
        return ResponseEntity.ok(result);
    }
}
