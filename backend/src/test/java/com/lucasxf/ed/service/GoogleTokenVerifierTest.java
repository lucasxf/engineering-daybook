package com.lucasxf.ed.service;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GoogleTokenVerifierService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GoogleTokenVerifierService")
class GoogleTokenVerifierTest {

    @Mock
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    private GoogleTokenVerifierService verifierService;

    @BeforeEach
    void setUp() {
        verifierService = new GoogleTokenVerifierService(googleIdTokenVerifier);
    }

    @Nested
    @DisplayName("verify")
    class Verify {

        @Test
        @DisplayName("should return claims for a valid Google ID token")
        void verify_validToken() throws Exception {
            GoogleIdToken idToken = mock(GoogleIdToken.class);
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.setSubject("google-sub-123");
            payload.setEmail("alice@gmail.com");
            payload.set("name", "Alice Smith");

            when(googleIdTokenVerifier.verify("valid-id-token")).thenReturn(idToken);
            when(idToken.getPayload()).thenReturn(payload);

            GoogleTokenVerifierService.GoogleUserInfo userInfo =
                verifierService.verify("valid-id-token");

            assertThat(userInfo.sub()).isEqualTo("google-sub-123");
            assertThat(userInfo.email()).isEqualTo("alice@gmail.com");
            assertThat(userInfo.name()).isEqualTo("Alice Smith");
        }

        @Test
        @DisplayName("should throw for an invalid or expired Google ID token")
        void verify_invalidToken() throws Exception {
            when(googleIdTokenVerifier.verify("invalid-token")).thenReturn(null);

            assertThatThrownBy(() -> verifierService.verify("invalid-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid Google ID token");
        }

        @Test
        @DisplayName("should throw when Google verification fails with exception")
        void verify_verificationException() throws Exception {
            when(googleIdTokenVerifier.verify("bad-token"))
                .thenThrow(new GeneralSecurityException("Verification failed"));

            assertThatThrownBy(() -> verifierService.verify("bad-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid Google ID token");
        }
    }
}
