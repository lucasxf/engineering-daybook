package com.lucasxf.ed.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AvatarService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@ExtendWith(MockitoExtension.class)
class AvatarServiceTest {

    @Mock
    private StorageService storageService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AvatarService avatarService;

    private final UUID userId = UUID.randomUUID();

    /** Generates a valid 1×1 JPEG via Java's ImageIO so Thumbnailator can decode it. */
    private static byte[] makeJpeg() {
        try {
            BufferedImage img = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
            img.setRGB(0, 0, 0xFFFFFF);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(img, "jpeg", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to create test JPEG", e);
        }
    }

    private static final byte[] MINIMAL_JPEG = makeJpeg();

    // ===== upload =====

    @Test
    void upload_validJpeg_resizesAndUploadsAndPersistsUrl() throws IOException {
        MultipartFile file = new MockMultipartFile(
            "avatar", "avatar.jpg", "image/jpeg", MINIMAL_JPEG);
        when(storageService.upload(eq(userId), any(byte[].class)))
            .thenReturn("https://storage.example.com/avatars/" + userId + ".jpg");

        String url = avatarService.upload(userId, file);

        assertThat(url).isEqualTo("https://storage.example.com/avatars/" + userId + ".jpg");
        ArgumentCaptor<byte[]> bytesCaptor = ArgumentCaptor.forClass(byte[].class);
        verify(storageService).upload(eq(userId), bytesCaptor.capture());
        assertThat(bytesCaptor.getValue()).isNotEmpty();
        verify(userService).updateAvatarUrl(eq(userId), eq(url));
    }

    @Test
    void upload_invalidContentType_throwsIllegalArgumentException() {
        MultipartFile file = new MockMultipartFile(
            "avatar", "file.pdf", "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46});

        assertThatThrownBy(() -> avatarService.upload(userId, file))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("type");

        verify(storageService, never()).upload(any(), any());
        verify(userService, never()).updateAvatarUrl(any(), any());
    }

    @Test
    void upload_oversizedFile_throwsIllegalArgumentException() {
        byte[] bigData = new byte[3 * 1024 * 1024]; // 3MB (> 2MB limit)
        MultipartFile file = new MockMultipartFile(
            "avatar", "avatar.jpg", "image/jpeg", bigData);

        assertThatThrownBy(() -> avatarService.upload(userId, file))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("size");

        verify(storageService, never()).upload(any(), any());
    }

    @Test
    void upload_nullContentType_treatedAsOctetStream_throwsIllegalArgumentException() {
        MultipartFile file = new MockMultipartFile(
            "avatar", "avatar.jpg", null, MINIMAL_JPEG);

        assertThatThrownBy(() -> avatarService.upload(userId, file))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // ===== delete =====

    @Test
    void delete_delegatesToStorageAndClearsUrl() {
        avatarService.delete(userId);

        verify(storageService).delete(userId);
        verify(userService).updateAvatarUrl(userId, null);
    }
}
