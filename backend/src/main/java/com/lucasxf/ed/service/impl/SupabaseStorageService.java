package com.lucasxf.ed.service.impl;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.lucasxf.ed.config.StorageProperties;
import com.lucasxf.ed.service.StorageService;

import static java.util.Objects.requireNonNull;

/**
 * Supabase Storage implementation of {@link StorageService}.
 *
 * <p>Uploads and deletes avatar images at path {@code avatars/{userId}.jpg} in the
 * configured Supabase Storage bucket. Uses the Supabase Storage REST API with the
 * service-role key for write access. The bucket is public-read; the returned URL is
 * the Supabase public URL for the object.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@Service
public class SupabaseStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final RestClient restClient;
    private final StorageProperties.Supabase props;

    public SupabaseStorageService(RestClient.Builder restClientBuilder, StorageProperties storageProperties) {
        this.props = requireNonNull(storageProperties).supabase();
        this.restClient = restClientBuilder
            .baseUrl(props.url())
            .defaultHeader("Authorization", "Bearer " + props.serviceKey())
            .build();
    }

    @Override
    public String upload(UUID userId, byte[] jpegData) {
        String objectPath = objectPath(userId);
        // upsert=true overwrites the existing file if present
        restClient.put()
            .uri("/storage/v1/object/{bucket}/{path}", props.bucket(), objectPath)
            .header("x-upsert", "true")
            .contentType(MediaType.IMAGE_JPEG)
            .body(jpegData)
            .retrieve()
            .toBodilessEntity();
        String publicUrl = props.url() + "/storage/v1/object/public/" + props.bucket() + "/" + objectPath;
        log.debug("Avatar uploaded for user {}: {}", userId, publicUrl);
        return publicUrl;
    }

    @Override
    public void delete(UUID userId) {
        String objectPath = objectPath(userId);
        try {
            restClient.delete()
                .uri("/storage/v1/object/{bucket}/{path}", props.bucket(), objectPath)
                .retrieve()
                .toBodilessEntity();
            log.debug("Avatar deleted for user {}", userId);
        } catch (Exception ex) {
            // Non-existent files return 404 — treat as no-op
            log.debug("Avatar delete for user {} resulted in: {}", userId, ex.getMessage());
        }
    }

    private String objectPath(UUID userId) {
        return userId + ".jpg";
    }
}
