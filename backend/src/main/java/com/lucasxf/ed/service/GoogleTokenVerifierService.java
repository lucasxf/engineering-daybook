package com.lucasxf.ed.service;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for verifying Google ID tokens using Google's public JWKS keys.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@Slf4j
@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public GoogleTokenVerifierService(GoogleIdTokenVerifier googleIdTokenVerifier) {
        this.googleIdTokenVerifier = requireNonNull(googleIdTokenVerifier);
    }

    /**
     * Verifies a Google ID token and extracts user information.
     *
     * @param idTokenString the raw Google ID token from the frontend
     * @return the verified user information (sub, email, name)
     * @throws IllegalArgumentException if the token is invalid, expired, or tampered
     */
    public GoogleUserInfo verify(String idTokenString) {
        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(idTokenString);
            if (idToken == null) {
                log.warn("Google ID token verification returned null (invalid or expired token)");
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String sub = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            log.info("Google ID token verified: email={}", email);
            return new GoogleUserInfo(sub, email, name);
        } catch (GeneralSecurityException | IOException e) {
            log.warn("Google ID token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid Google ID token", e);
        }
    }

    /**
     * Verified Google user information extracted from an ID token.
     */
    public record GoogleUserInfo(String sub, String email, String name) {
    }
}
