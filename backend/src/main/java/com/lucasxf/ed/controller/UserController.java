package com.lucasxf.ed.controller;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.UpdateUserSettingsRequest;
import com.lucasxf.ed.service.UserService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for user settings management.
 *
 * <p>All endpoints require JWT authentication. User ID is extracted from the
 * authentication context.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile and settings")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = requireNonNull(userService);
    }

    /**
     * Updates the authenticated user's privacy and preference settings.
     *
     * @param request        the settings to update (all fields optional)
     * @param authentication the authenticated user
     * @return 204 No Content on success
     */
    @PatchMapping("/me/settings")
    @Operation(
        summary = "Update user settings",
        description = "Updates the authenticated user's settings. All fields are optional.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Settings updated successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    public ResponseEntity<Void> updateSettings(
            @Valid @RequestBody UpdateUserSettingsRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        if (request.defaultPokVisibility() != null) {
            userService.updateDefaultPokVisibility(userId, request.defaultPokVisibility());
        }
        return ResponseEntity.noContent().build();
    }
}
