package com.lucasxf.ed.service;

import java.util.UUID;

/**
 * Abstraction for object storage operations (avatar upload/delete).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
public interface StorageService {

    /**
     * Uploads a JPEG image to storage and returns its public URL.
     *
     * <p>Overwrites any existing file for the same user.
     *
     * @param userId   the user's UUID (used as the storage key)
     * @param jpegData the JPEG image bytes to upload
     * @return the public URL of the uploaded image
     */
    String upload(UUID userId, byte[] jpegData);

    /**
     * Deletes the avatar for the given user from storage.
     *
     * <p>No-op if the file does not exist.
     *
     * @param userId the user's UUID
     */
    void delete(UUID userId);
}
