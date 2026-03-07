package com.lucasxf.ed.service;

import java.io.IOException;
import java.util.UUID;

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

    // Minimal valid 1×1 JPEG bytes (JPEG SOI + EOI markers)
    private static final byte[] MINIMAL_JPEG = new byte[]{
        (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, (byte) 0xFF, (byte) 0xDB,
        0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07,
        0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24,
        0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30,
        0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33,
        0x34, 0x32, (byte) 0xFF, (byte) 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01,
        0x01, 0x01, 0x11, 0x00, (byte) 0xFF, (byte) 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01,
        0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
        (byte) 0xFF, (byte) 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02,
        0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D, (byte) 0xFF, (byte) 0xDA,
        0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, (byte) 0xFB, 0x35, 0x14, (byte) 0xFF, (byte) 0xD9
    };

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
