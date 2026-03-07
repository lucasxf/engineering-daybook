package com.lucasxf.ed.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import static java.util.Objects.requireNonNull;

/**
 * Orchestrates avatar upload validation, resizing, storage, and URL persistence.
 *
 * <p>Upload flow:
 * <ol>
 *   <li>Validate file size (≤ 2 MB)</li>
 *   <li>Validate MIME type (JPEG, PNG, WebP)</li>
 *   <li>Resize to 200×200 JPEG at 85% quality via Thumbnailator</li>
 *   <li>Upload to storage via {@link StorageService}</li>
 *   <li>Persist the public URL via {@link UserService}</li>
 * </ol>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@Service
public class AvatarService {

    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024; // 2 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp");

    private final StorageService storageService;
    private final UserService userService;

    public AvatarService(StorageService storageService, UserService userService) {
        this.storageService = requireNonNull(storageService);
        this.userService = requireNonNull(userService);
    }

    /**
     * Validates, resizes, uploads, and persists an avatar for the given user.
     *
     * @param userId the user's UUID
     * @param file   the uploaded multipart file
     * @return the public URL of the stored avatar
     * @throws IllegalArgumentException if the file is too large or not an accepted image type
     * @throws java.io.UncheckedIOException if resizing or reading fails
     */
    public String upload(UUID userId, MultipartFile file) throws IOException {
        validateSize(file);
        validateType(file);

        byte[] jpegBytes = resize(file);
        String url = storageService.upload(userId, jpegBytes);
        userService.updateAvatarUrl(userId, url);
        return url;
    }

    /**
     * Removes the avatar for the given user from storage and clears the URL.
     *
     * @param userId the user's UUID
     */
    public void delete(UUID userId) {
        storageService.delete(userId);
        userService.updateAvatarUrl(userId, null);
    }

    private void validateSize(MultipartFile file) {
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException(
                "Avatar file size must not exceed 2 MB (received " + file.getSize() + " bytes)");
        }
    }

    private void validateType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "Unsupported avatar file type: " + contentType
                    + ". Accepted types: image/jpeg, image/png, image/webp");
        }
    }

    private byte[] resize(MultipartFile file) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(file.getBytes()))
            .size(200, 200)
            .keepAspectRatio(false)
            .outputFormat("JPEG")
            .outputQuality(0.85)
            .toOutputStream(out);
        return out.toByteArray();
    }
}
