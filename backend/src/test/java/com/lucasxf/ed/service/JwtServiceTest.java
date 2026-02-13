package com.lucasxf.ed.service;

import java.time.Duration;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.config.AuthProperties.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link JwtService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET =
        "test-secret-for-unit-tests-must-be-at-least-256-bits-long-for-hs256-algorithm";

    @BeforeEach
    void setUp() {
        var jwtProps = new JwtProperties(SECRET, Duration.ofMinutes(15), Duration.ofDays(7));
        var authProps = new AuthProperties(jwtProps, null);
        jwtService = new JwtService(authProps);
    }

    @Test
    @DisplayName("should generate a valid access token with correct claims")
    void generateAccessToken_validClaims() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        String handle = "testuser";

        String token = jwtService.generateAccessToken(userId, email, handle);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractEmail(token)).isEqualTo(email);
        assertThat(jwtService.extractHandle(token)).isEqualTo(handle);
    }

    @Test
    @DisplayName("should generate a refresh token string")
    void generateRefreshToken_notBlank() {
        String refreshToken = jwtService.generateRefreshToken();

        assertThat(refreshToken).isNotBlank();
        assertThat(refreshToken.length()).isGreaterThanOrEqualTo(32);
    }

    @Test
    @DisplayName("should generate unique refresh tokens on each call")
    void generateRefreshToken_unique() {
        String token1 = jwtService.generateRefreshToken();
        String token2 = jwtService.generateRefreshToken();

        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("should reject a tampered token")
    void isTokenValid_tamperedToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateAccessToken(userId, "test@example.com", "testuser");
        String tampered = token + "x";

        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("should reject a token signed with a different secret")
    void isTokenValid_wrongSecret() {
        var otherProps = new AuthProperties(
            new JwtProperties("other-secret-that-is-also-256-bits-long-for-hs256-signing-algorithm",
                Duration.ofMinutes(15), Duration.ofDays(7)),
            null
        );
        var otherService = new JwtService(otherProps);

        String token = otherService.generateAccessToken(UUID.randomUUID(), "test@example.com", "testuser");

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("should reject an expired token")
    void isTokenValid_expiredToken() {
        var shortProps = new AuthProperties(
            new JwtProperties(SECRET, Duration.ofMillis(1), Duration.ofDays(7)),
            null
        );
        var shortService = new JwtService(shortProps);

        String token = shortService.generateAccessToken(UUID.randomUUID(), "test@example.com", "testuser");

        // Wait for expiration
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        assertThat(shortService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("should hash refresh token deterministically")
    void hashRefreshToken_deterministic() {
        String token = "some-refresh-token-value";

        String hash1 = jwtService.hashRefreshToken(token);
        String hash2 = jwtService.hashRefreshToken(token);

        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    @DisplayName("should produce different hashes for different tokens")
    void hashRefreshToken_different() {
        String hash1 = jwtService.hashRefreshToken("token-a");
        String hash2 = jwtService.hashRefreshToken("token-b");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    @DisplayName("should return refresh token expiry duration")
    void getRefreshTokenExpiry() {
        assertThat(jwtService.getRefreshTokenExpiry()).isEqualTo(Duration.ofDays(7));
    }

    @Nested
    @DisplayName("tempToken")
    class TempToken {

        @Test
        @DisplayName("should generate a temp token with google_signup type and correct claims")
        void generateTempToken_validClaims() {
            String token = jwtService.generateTempToken("google-sub-123", "alice@gmail.com", "Alice Smith");

            assertThat(token).isNotBlank();

            Claims claims = jwtService.parseTempToken(token);
            assertThat(claims.get("type", String.class)).isEqualTo("google_signup");
            assertThat(claims.get("googleSub", String.class)).isEqualTo("google-sub-123");
            assertThat(claims.get("email", String.class)).isEqualTo("alice@gmail.com");
            assertThat(claims.get("name", String.class)).isEqualTo("Alice Smith");
        }

        @Test
        @DisplayName("should reject an expired temp token")
        void parseTempToken_expired() {
            // Build an already-expired temp token directly
            Instant past = Instant.now().minusSeconds(60);
            String token = Jwts.builder()
                .claim("type", "google_signup")
                .claim("googleSub", "sub")
                .claim("email", "email@test.com")
                .claim("name", "Name")
                .issuedAt(Date.from(past.minusSeconds(60)))
                .expiration(Date.from(past))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

            assertThatThrownBy(() -> jwtService.parseTempToken(token))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired temp token");
        }

        @Test
        @DisplayName("should reject a non-temp-token JWT")
        void parseTempToken_wrongType() {
            // Generate a regular access token (no "type" claim)
            String accessToken = jwtService.generateAccessToken(
                UUID.randomUUID(), "test@example.com", "testuser"
            );

            assertThatThrownBy(() -> jwtService.parseTempToken(accessToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired temp token");
        }
    }
}
