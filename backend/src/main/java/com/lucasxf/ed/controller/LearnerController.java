package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.service.FollowService;
import com.lucasxf.ed.service.LearnerService;
import com.lucasxf.ed.service.UserService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for public learner profile access and follow/unfollow mechanics.
 *
 * <p>All endpoints require JWT authentication. Profile access is governed by the learner's
 * {@code profileVisibility} setting and the requester's follow relationship.
 *
 * @author lucasxf
 * @since 5.2
 */
@RestController
@RequestMapping("/api/v1/learners")
@Tag(name = "Learners", description = "Public learner profile endpoints")
public class LearnerController {

    private final LearnerService learnerService;
    private final FollowService followService;
    private final UserService userService;

    public LearnerController(LearnerService learnerService, FollowService followService,
                             UserService userService) {
        this.learnerService = requireNonNull(learnerService);
        this.followService = requireNonNull(followService);
        this.userService = requireNonNull(userService);
    }

    /**
     * Returns the learner profile for the given handle.
     *
     * @param handle         the learner's unique handle
     * @param authentication the authenticated user
     * @return 200 with profile response (full or private shell); 404 if unknown handle
     */
    @GetMapping("/{handle}")
    @Operation(
        summary = "Get learner profile",
        description = "Returns the profile for the learner with the given handle. "
            + "Access is gated by the learner's profileVisibility and the requester's follow relationship.")
    @ApiResponse(responseCode = "200", description = "Profile returned")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "404", description = "Learner not found")
    public ResponseEntity<LearnerProfileResponse> getProfile(
            @PathVariable String handle,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        LearnerProfileResponse response = learnerService.getProfile(handle, requesterId);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns a paginated list of learnings for the given learner, filtered by access tier.
     *
     * @param handle         the learner's unique handle
     * @param page           zero-based page number (default 0)
     * @param size           page size (default 20)
     * @param authentication the authenticated user
     * @return 200 with paginated learnings; 403 if profile access denied; 404 if unknown handle
     */
    @GetMapping("/{handle}/poks")
    @Operation(
        summary = "Get learner's learnings",
        description = "Returns a paginated list of learnings visible to the requester based on their "
            + "relationship with the learner (PUBLIC, FOLLOWERS_ONLY, COLLEAGUES_ONLY tiers respected).")
    @ApiResponse(responseCode = "200", description = "Learnings returned")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "403", description = "Profile access denied")
    @ApiResponse(responseCode = "404", description = "Learner not found")
    public ResponseEntity<Page<PokResponse>> getLearnerPoks(
            @PathVariable String handle,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        Page<PokResponse> result = learnerService.getLearnerPoks(handle, requesterId, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * Follows the learner identified by {@code handle}.
     *
     * <p>Self-follow is rejected (400). Duplicate follow is rejected (409).
     *
     * @param handle         the handle of the learner to follow
     * @param authentication the authenticated user
     * @return 204 No Content on success
     */
    @PostMapping("/{handle}/follow")
    @Operation(
        summary = "Follow a learner",
        description = "Creates a follow relationship from the authenticated user to the learner with "
            + "the given handle. Self-follow returns 400; duplicate returns 409.")
    @ApiResponse(responseCode = "204", description = "Followed successfully")
    @ApiResponse(responseCode = "400", description = "Cannot follow yourself")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "404", description = "Learner not found")
    @ApiResponse(responseCode = "409", description = "Already following this learner")
    public ResponseEntity<Void> follow(
            @PathVariable String handle,
            Authentication authentication) {
        UUID followerId = UUID.fromString(authentication.getName());
        UUID followedId = userService.findByHandle(handle)
            .orElseThrow(() -> new com.lucasxf.ed.exception.LearnerNotFoundException(
                "Learner not found: @" + handle))
            .getId();
        followService.follow(followerId, followedId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Unfollows the learner identified by {@code handle}.
     *
     * <p>Attempting to unfollow a learner not currently followed returns 409.
     *
     * @param handle         the handle of the learner to unfollow
     * @param authentication the authenticated user
     * @return 204 No Content on success
     */
    @DeleteMapping("/{handle}/follow")
    @Operation(
        summary = "Unfollow a learner",
        description = "Removes the follow relationship from the authenticated user to the learner with "
            + "the given handle. Returns 409 if not currently following.")
    @ApiResponse(responseCode = "204", description = "Unfollowed successfully")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "404", description = "Learner not found")
    @ApiResponse(responseCode = "409", description = "Not currently following this learner")
    public ResponseEntity<Void> unfollow(
            @PathVariable String handle,
            Authentication authentication) {
        UUID followerId = UUID.fromString(authentication.getName());
        UUID followedId = userService.findByHandle(handle)
            .orElseThrow(() -> new com.lucasxf.ed.exception.LearnerNotFoundException(
                "Learner not found: @" + handle))
            .getId();
        followService.unfollow(followerId, followedId);
        return ResponseEntity.noContent().build();
    }
}
