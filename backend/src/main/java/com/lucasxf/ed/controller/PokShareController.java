package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.CreatePokShareRequest;
import com.lucasxf.ed.dto.PokShareResponse;
import com.lucasxf.ed.service.PokShareService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for re-learning (PokShare) operations.
 *
 * <p>Re-learnings are references to another learner's PUBLIC learning, attributed to the original
 * author. The original content is never modified.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@RestController
@RequestMapping("/api/v1/poks")
@Tag(name = "Re-Learnings", description = "Share (re-learn) public learnings from other learners")
public class PokShareController {

    private final PokShareService pokShareService;

    public PokShareController(PokShareService pokShareService) {
        this.pokShareService = requireNonNull(pokShareService);
    }

    /**
     * Re-learns (shares) a public learning.
     *
     * @param id             the original POK's ID
     * @param request        the share request (optional note, optional visibility)
     * @param authentication the authenticated user
     * @return the created share response (201)
     */
    @PostMapping("/{id}/share")
    @Operation(
        summary = "Re-learn a public learning",
        description = "Creates a re-learning (share) of another learner's PUBLIC learning. " +
                      "The original content is never modified — this is a reference with attribution. " +
                      "One re-learning per learner per original. Cannot re-learn own learnings.")
    @ApiResponse(responseCode = "201", description = "Re-learning created")
    @ApiResponse(responseCode = "400", description = "Self-share, non-PUBLIC original, or visibility tier violation")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "404", description = "Original learning not found")
    @ApiResponse(responseCode = "409", description = "Already re-learned this learning")
    public ResponseEntity<PokShareResponse> share(
        @PathVariable UUID id,
        @Valid @RequestBody CreatePokShareRequest request,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        PokShareResponse response = pokShareService.share(id, userId, request.note(), request.visibility());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Removes a re-learning. Only the sharer can remove their own re-learning.
     *
     * @param shareId        the re-learning ID to remove
     * @param authentication the authenticated user
     * @return 204 No Content
     */
    @DeleteMapping("/shared/{shareId}")
    @Operation(
        summary = "Remove a re-learning",
        description = "Hard-deletes a re-learning. Only the sharer can remove their own re-learning.")
    @ApiResponse(responseCode = "204", description = "Re-learning removed")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Not the sharer")
    @ApiResponse(responseCode = "404", description = "Re-learning not found")
    public ResponseEntity<Void> unshare(
        @PathVariable UUID shareId,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        pokShareService.unshare(shareId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the share detail for the given share ID, applying visibility-based access control.
     *
     * @param shareId        the re-learning ID
     * @param authentication the authenticated user
     * @return the share response
     */
    @GetMapping("/shared/{shareId}")
    @Operation(
        summary = "Get re-learning detail",
        description = "Returns a re-learning by ID. Access is governed by the share's visibility " +
                      "tier and the requester's relationship with the sharer.")
    @ApiResponse(responseCode = "200", description = "Re-learning found")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Access denied by visibility tier")
    @ApiResponse(responseCode = "404", description = "Re-learning not found")
    public ResponseEntity<PokShareResponse> getShareById(
        @PathVariable UUID shareId,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        PokShareResponse response = pokShareService.getShareById(shareId, userId);
        return ResponseEntity.ok(response);
    }
}
