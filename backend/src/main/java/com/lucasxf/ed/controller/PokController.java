package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.CreatePokRequest;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.UpdatePokRequest;
import com.lucasxf.ed.service.PokService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for POK (Piece of Knowledge) endpoints.
 *
 * <p>All endpoints require JWT authentication. User ID is extracted from the
 * authentication context and used to enforce ownership rules.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-14
 */
@RestController
@RequestMapping("/api/v1/poks")
@Tag(name = "POKs", description = "Piece of Knowledge (POK) management - create, read, update, delete learnings")
public class PokController {

    private final PokService pokService;

    public PokController(PokService pokService) {
        this.pokService = requireNonNull(pokService);
    }

    /**
     * Creates a new POK.
     *
     * <p>Title is optional (can be null or empty) to minimize friction.
     * Content is mandatory as it represents the actual knowledge.
     *
     * @param request        the POK creation request
     * @param authentication the authenticated user
     * @return the created POK
     */
    @PostMapping
    @Operation(
        summary = "Create a new POK",
        description = "Creates a new Piece of Knowledge. Title is optional (for frictionless capture), content is mandatory."
    )
    @ApiResponse(responseCode = "201", description = "POK created successfully")
    @ApiResponse(responseCode = "400", description = "Validation error (empty content, title too long)")
    @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid JWT token")
    public ResponseEntity<PokResponse> create(
        @Valid @RequestBody CreatePokRequest request,
        Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        PokResponse response = pokService.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a POK by ID.
     *
     * @param id             the POK ID
     * @param authentication the authenticated user
     * @return the POK
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get POK by ID",
        description = "Retrieves a specific POK by its ID. User must own the POK."
    )
    @ApiResponse(responseCode = "200", description = "POK found")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - POK belongs to another user")
    @ApiResponse(responseCode = "404", description = "POK not found or soft-deleted")
    public ResponseEntity<PokResponse> getById(
        @PathVariable UUID id,
        Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        PokResponse response = pokService.getById(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists all active (non-deleted) POKs for the authenticated user with pagination.
     *
     * <p>Results are sorted by most recently updated (updatedAt DESC) by default.
     *
     * @param page           page number (0-indexed, default 0)
     * @param size           page size (default 20, max 100)
     * @param authentication the authenticated user
     * @return a page of POKs
     */
    @GetMapping
    @Operation(
        summary = "List user's POKs",
        description = "Retrieves all active POKs for the authenticated user with pagination. Sorted by most recently updated."
    )
    @ApiResponse(responseCode = "200", description = "POKs retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<Page<PokResponse>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);

        // Enforce max page size
        int pageSize = Math.min(size, 100);

        Pageable pageable = PageRequest.of(
            page,
            pageSize,
            Sort.by(Sort.Direction.DESC, "updatedAt")
        );

        Page<PokResponse> response = pokService.getAll(userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a POK.
     *
     * <p>Title and content can both be updated. Title can be set to null to remove it.
     *
     * @param id             the POK ID
     * @param request        the update request
     * @param authentication the authenticated user
     * @return the updated POK
     */
    @PutMapping("/{id}")
    @Operation(
        summary = "Update POK",
        description = "Updates an existing POK. User must own the POK. Title can be set to null."
    )
    @ApiResponse(responseCode = "200", description = "POK updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - POK belongs to another user")
    @ApiResponse(responseCode = "404", description = "POK not found or soft-deleted")
    public ResponseEntity<PokResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdatePokRequest request,
        Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        PokResponse response = pokService.update(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Soft deletes a POK.
     *
     * <p>The POK is marked as deleted (deletedAt timestamp set) but remains in the database.
     * It will no longer appear in list queries or be retrievable by ID.
     * Restore functionality will be added in Phase 2.
     *
     * @param id             the POK ID
     * @param authentication the authenticated user
     * @return no content
     */
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete POK (soft delete)",
        description = "Soft deletes a POK by setting its deletion timestamp. The POK is hidden but remains in the database."
    )
    @ApiResponse(responseCode = "204", description = "POK deleted successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - POK belongs to another user")
    @ApiResponse(responseCode = "404", description = "POK not found or already soft-deleted")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        Authentication authentication
    ) {
        UUID userId = extractUserId(authentication);
        pokService.softDelete(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extracts the user ID from the authentication context.
     *
     * <p>The JWT filter sets the user ID as the principal name.
     *
     * @param authentication the authentication object
     * @return the user ID
     */
    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
