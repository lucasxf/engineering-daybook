package com.lucasxf.ed.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.exception.InvalidTokenException;
import lombok.extern.slf4j.Slf4j;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static java.util.Objects.requireNonNull;

/**
 * Service for JWT token generation, validation, and claim extraction.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Slf4j
@Service
public class JwtService {

    private static final String INVALID_TEMP_TOKEN_MESSAGE = "Invalid or expired temp token";

    private final SecretKey signingKey;
    private final Duration accessTokenExpiry;
    private final Duration refreshTokenExpiry;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtService(AuthProperties authProperties) {
        requireNonNull(authProperties, "authProperties must not be null");
        requireNonNull(authProperties.jwt(), "jwt properties must not be null");

        byte[] keyBytes = authProperties.jwt().secret()
            .getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiry = authProperties.jwt().accessTokenExpiry();
        this.refreshTokenExpiry = authProperties.jwt().refreshTokenExpiry();
    }

    /**
     * Generates a signed JWT access token with user claims.
     */
    public String generateAccessToken(UUID userId, String email, String handle) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("handle", handle)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(accessTokenExpiry)))
            .signWith(signingKey)
            .compact();
    }

    /**
     * Generates a cryptographically random refresh token string.
     */
    public String generateRefreshToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Validates a JWT access token.
     *
     * @return true if the token is valid and not expired
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String extractHandle(String token) {
        return parseClaims(token).get("handle", String.class);
    }

    /**
     * Hashes a refresh token using SHA-256 for secure storage.
     */
    public String hashRefreshToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Generates a short-lived temp token for two-step Google OAuth signup.
     * Contains Google user claims and a {@code type=google_signup} marker.
     * Expires after 5 minutes.
     */
    public String generateTempToken(String googleSub, String email, String name) {
        Instant now = Instant.now();
        return Jwts.builder()
            .claim("type", "google_signup")
            .claim("googleSub", googleSub)
            .claim("email", email)
            .claim("name", name)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(Duration.ofMinutes(5))))
            .signWith(signingKey)
            .compact();
    }

    /**
     * Parses and validates a temp token issued for Google OAuth signup.
     *
     * @return the token claims containing googleSub, email, and name
     * @throws InvalidTokenException if the token is invalid, expired, or not a temp token
     */
    public Claims parseTempToken(String token) {
        try {
            Claims claims = parseClaims(token);
            String type = claims.get("type", String.class);
            if (!"google_signup".equals(type)) {
                throw new InvalidTokenException(INVALID_TEMP_TOKEN_MESSAGE);
            }
            return claims;
        } catch (JwtException e) {
            throw new InvalidTokenException(INVALID_TEMP_TOKEN_MESSAGE, e);
        }
    }

    public Duration getAccessTokenExpiry() {
        return accessTokenExpiry;
    }


    public Duration getRefreshTokenExpiry() {
        return refreshTokenExpiry;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
