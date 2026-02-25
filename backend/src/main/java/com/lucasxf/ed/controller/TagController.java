package com.lucasxf.ed.controller;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.CreateTagRequest;
import com.lucasxf.ed.dto.TagResponse;
import com.lucasxf.ed.dto.TagSuggestionResponse;
import com.lucasxf.ed.dto.UpdateTagRequest;
import com.lucasxf.ed.service.TagService;
import com.lucasxf.ed.service.TagSuggestionService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for user tag management and POK–tag assignments.
 *
 * <p>All endpoints require JWT authentication. User ID is extracted from the
 * authentication context and used to enforce ownership rules.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-25
 */
@RestController
@RequestMapping("/api/v1")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "User tag management and POK–tag assignments")
public class TagController {

    private final TagService tagService;
    private final TagSuggestionService tagSuggestionService;

    public TagController(TagService tagService, TagSuggestionService tagSuggestionService) {
        this.tagService = requireNonNull(tagService);
        this.tagSuggestionService = requireNonNull(tagSuggestionService);
    }

    // ===== Tag CRUD =====

    /**
     * Returns all active tag subscriptions for the authenticated user.
     *
     * @param authentication the authenticated user
     * @return list of active tags
     */
    @GetMapping("/tags")
    @Operation(summary = "List user's tags", description = "Returns all active tag subscriptions for the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Tags retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<List<TagResponse>> list(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return ResponseEntity.ok(tagService.getUserTags(userId));
    }

    /**
     * Creates or reuses a global tag and subscribes the user to it.
     *
     * @param request        the tag name
     * @param authentication the authenticated user
     * @return the tag subscription (new or existing)
     */
    @PostMapping("/tags")
    @Operation(summary = "Create or reuse a tag", description = "Creates a new tag or reuses an existing global tag (case-insensitive). Idempotent.")
    @ApiResponse(responseCode = "201", description = "Tag created or reused")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<TagResponse> create(
            @Valid @RequestBody CreateTagRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        TagResponse response = tagService.createOrReuse(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Renames a tag subscription.
     *
     * @param id             the user-tag subscription ID
     * @param request        the new tag name
     * @param authentication the authenticated user
     * @return the updated tag subscription
     */
    @PutMapping("/tags/{id}")
    @Operation(summary = "Rename a tag", description = "Soft-deletes the old subscription and creates a new one with the given name.")
    @ApiResponse(responseCode = "200", description = "Tag renamed successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Tag not found")
    @ApiResponse(responseCode = "409", description = "Tag name already in use")
    public ResponseEntity<TagResponse> rename(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTagRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        TagResponse response = tagService.renameTag(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a tag subscription and removes all POK assignments.
     *
     * @param id             the user-tag subscription ID
     * @param authentication the authenticated user
     * @return no content
     */
    @DeleteMapping("/tags/{id}")
    @Operation(summary = "Delete a tag", description = "Soft-deletes the tag subscription and removes all POK–tag assignments.")
    @ApiResponse(responseCode = "204", description = "Tag deleted successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Tag not found")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        tagService.deleteTag(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ===== POK–Tag Assignments =====

    /**
     * Assigns a tag to a POK (manual source).
     *
     * @param pokId          the POK ID
     * @param tagId          the user-tag subscription ID
     * @param authentication the authenticated user
     * @return no content
     */
    @PostMapping("/poks/{pokId}/tags/{tagId}")
    @Operation(summary = "Assign tag to POK", description = "Assigns a tag to a POK with MANUAL source. Idempotent.")
    @ApiResponse(responseCode = "204", description = "Tag assigned successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Tag not found")
    public ResponseEntity<Void> assignTag(
            @PathVariable UUID pokId,
            @PathVariable UUID tagId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        tagService.assignTag(pokId, tagId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Removes a tag assignment from a POK.
     *
     * @param pokId          the POK ID
     * @param tagId          the user-tag subscription ID
     * @param authentication the authenticated user
     * @return no content
     */
    @DeleteMapping("/poks/{pokId}/tags/{tagId}")
    @Operation(summary = "Remove tag from POK", description = "Removes a POK–tag assignment. Does nothing gracefully if not assigned.")
    @ApiResponse(responseCode = "204", description = "Tag removed successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Tag not found")
    public ResponseEntity<Void> removeTag(
            @PathVariable UUID pokId,
            @PathVariable UUID tagId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        tagService.removeTag(pokId, tagId, userId);
        return ResponseEntity.noContent().build();
    }

    // ===== Tag Suggestions =====

    /**
     * Returns PENDING tag suggestions for a POK.
     *
     * @param pokId          the POK ID
     * @param authentication the authenticated user
     * @return list of pending suggestions
     */
    @GetMapping("/poks/{pokId}/tags/suggestions")
    @Operation(summary = "Get tag suggestions", description = "Returns AI-generated PENDING tag suggestions for a specific POK.")
    @ApiResponse(responseCode = "200", description = "Suggestions retrieved")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<List<TagSuggestionResponse>> getSuggestions(
            @PathVariable UUID pokId,
            Authentication authentication) {
        List<TagSuggestionResponse> suggestions = tagSuggestionService.getPendingSuggestions(pokId);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Approves a tag suggestion, creating a POK–tag assignment with AI source.
     *
     * @param pokId          the POK ID (unused, for REST consistency)
     * @param suggestionId   the suggestion ID
     * @param authentication the authenticated user
     * @return no content
     */
    @PostMapping("/poks/{pokId}/tags/suggestions/{suggestionId}/approve")
    @Operation(summary = "Approve tag suggestion", description = "Approves a suggestion, assigning the tag with AI source.")
    @ApiResponse(responseCode = "204", description = "Suggestion approved")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Suggestion not found")
    public ResponseEntity<Void> approveSuggestion(
            @PathVariable UUID pokId,
            @PathVariable UUID suggestionId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        tagSuggestionService.approveSuggestion(suggestionId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Rejects a tag suggestion.
     *
     * @param pokId          the POK ID (unused, for REST consistency)
     * @param suggestionId   the suggestion ID
     * @param authentication the authenticated user
     * @return no content
     */
    @PostMapping("/poks/{pokId}/tags/suggestions/{suggestionId}/reject")
    @Operation(summary = "Reject tag suggestion", description = "Rejects a suggestion. No tag is created.")
    @ApiResponse(responseCode = "204", description = "Suggestion rejected")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Suggestion not found")
    public ResponseEntity<Void> rejectSuggestion(
            @PathVariable UUID pokId,
            @PathVariable UUID suggestionId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        tagSuggestionService.rejectSuggestion(suggestionId, userId);
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
