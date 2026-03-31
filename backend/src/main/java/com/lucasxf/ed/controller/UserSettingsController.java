package com.lucasxf.ed.controller;

import java.io.IOException;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lucasxf.ed.dto.AvatarUploadResponse;
import com.lucasxf.ed.dto.UpdateUserSettingsRequest;
import com.lucasxf.ed.service.AvatarService;
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
public class UserSettingsController {

    private final UserService userService;
    private final AvatarService avatarService;

    public UserSettingsController(UserService userService, AvatarService avatarService) {
        this.userService = requireNonNull(userService);
        this.avatarService = requireNonNull(avatarService);
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
            @ApiResponse(responseCode = "400", description = "Validation error (e.g. bio contains URL)"),
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
        if (request.profileVisibility() != null) {
            userService.updateProfileVisibility(userId, request.profileVisibility());
        }
        if (request.bio() != null) {
            userService.updateBio(userId, request.bio());
        }
        if (request.displayName() != null) {
            userService.updateDisplayName(userId, request.displayName());
        }
        if (request.theme() != null) {
            userService.updateTheme(userId, request.theme());
        }
        if (request.locale() != null) {
            userService.updateLocale(userId, request.locale());
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Uploads or replaces the authenticated user's avatar.
     *
     * <p>Accepts JPEG, PNG, or WebP files up to 2 MB. The image is resized to
     * 200×200 JPEG and stored in Supabase Storage. Returns the public URL.
     *
     * @param file           the image file to upload
     * @param authentication the authenticated user
     * @return 200 with {@link AvatarUploadResponse} on success
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload avatar",
        description = "Uploads or replaces the user's avatar. Accepted: image/jpeg, image/png, image/webp. Max 2 MB.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Avatar uploaded — returns avatarUrl"),
            @ApiResponse(responseCode = "400", description = "Invalid file type or size exceeded"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
        }
    )
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {
        UUID userId = UUID.fromString(authentication.getName());
        String avatarUrl = avatarService.upload(userId, file);
        return ResponseEntity.ok(new AvatarUploadResponse(avatarUrl));
    }

    /**
     * Deletes the authenticated user's avatar.
     *
     * @param authentication the authenticated user
     * @return 204 No Content
     */
    @DeleteMapping("/me/avatar")
    @Operation(
        summary = "Delete avatar",
        description = "Removes the user's avatar from storage and clears the avatarUrl.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Avatar deleted"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
        }
    )
    public ResponseEntity<Void> deleteAvatar(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        avatarService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
