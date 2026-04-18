package com.lucasxf.ed.service;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.exception.AuthenticationException;
import io.jsonwebtoken.Jwts;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AppleIdentityTokenVerifier}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AppleIdentityTokenVerifier")
class AppleIdentityTokenVerifierTest {

    private static final String KID = "test-key-id";
    private static final String SUBJECT = "000123.abc456def789.0001";
    private static final String EMAIL = "user@privaterelay.appleid.com";

    @Mock
    private AppleJwkCache appleJwkCache;

    private AppleIdentityTokenVerifier verifier;
    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;

    @BeforeEach
    void setUp() throws Exception {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        KeyPair pair = gen.generateKeyPair();
        publicKey = (RSAPublicKey) pair.getPublic();
        privateKey = (RSAPrivateKey) pair.getPrivate();
        verifier = new AppleIdentityTokenVerifier(appleJwkCache, new ObjectMapper());
    }

    private String buildToken(String kid, String iss, List<String> aud, String sub,
                              String email, Date expiry, RSAPrivateKey signingKey) {
        var builder = Jwts.builder()
            .header().add("kid", kid).and()
            .issuer(iss)
            .audience().add(aud).and()
            .subject(sub)
            .claim("email", email)
            .issuedAt(new Date())
            .expiration(expiry)
            .signWith(signingKey);
        return builder.compact();
    }

    private Date futureDate(int seconds) {
        return new Date(System.currentTimeMillis() + seconds * 1_000L);
    }

    private Date pastDate(int seconds) {
        return new Date(System.currentTimeMillis() - seconds * 1_000L);
    }

    @Nested
    @DisplayName("verify — happy path")
    class HappyPath {

        @Test
        @DisplayName("valid token → returns correct AppleUserInfo")
        void verify_validToken_returnsUserInfo() {
            String token = buildToken(KID, "https://appleid.apple.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            AppleIdentityTokenVerifier.AppleUserInfo info = verifier.verify(token);

            assertThat(info.sub()).isEqualTo(SUBJECT);
            assertThat(info.email()).isEqualTo(EMAIL);
        }
    }

    @Nested
    @DisplayName("verify — failure cases")
    class FailureCases {

        @Test
        @DisplayName("expired token → throws AuthenticationException")
        void verify_expiredToken_throws() {
            String token = buildToken(KID, "https://appleid.apple.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, pastDate(60), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            assertThatThrownBy(() -> verifier.verify(token))
                .isInstanceOf(AuthenticationException.class);
        }

        @Test
        @DisplayName("wrong issuer → throws AuthenticationException")
        void verify_wrongIssuer_throws() {
            String token = buildToken(KID, "https://evil.example.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            assertThatThrownBy(() -> verifier.verify(token))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Invalid issuer");
        }

        @Test
        @DisplayName("wrong audience → throws AuthenticationException")
        void verify_wrongAudience_throws() {
            String token = buildToken(KID, "https://appleid.apple.com",
                List.of("com.other.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            assertThatThrownBy(() -> verifier.verify(token))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Invalid audience");
        }

        @Test
        @DisplayName("tampered signature → throws AuthenticationException")
        void verify_tamperedSignature_throws() {
            String token = buildToken(KID, "https://appleid.apple.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            // Tamper: replace the signature part with garbage
            String[] parts = token.split("\\.");
            String tampered = parts[0] + "." + parts[1] + ".invalidsignatureXXX";
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            assertThatThrownBy(() -> verifier.verify(tampered))
                .isInstanceOf(AuthenticationException.class);
        }

        @Test
        @DisplayName("unknown kid → throws AuthenticationException")
        void verify_unknownKid_throws() {
            String token = buildToken("unknown-kid", "https://appleid.apple.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            assertThatThrownBy(() -> verifier.verify(token))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Unknown key ID");
        }
    }

    @Nested
    @DisplayName("JWK cache interaction")
    class CacheInteraction {

        @Test
        @DisplayName("second verification reuses cached keys — getKeys called once per verify")
        void verify_twoCalls_jwkCacheCalledTwice() {
            String token = buildToken(KID, "https://appleid.apple.com",
                List.of("net.learnimo.app"), SUBJECT, EMAIL, futureDate(3600), privateKey);
            when(appleJwkCache.getKeys()).thenReturn(Map.of(KID, publicKey));

            verifier.verify(token);
            verifier.verify(token);

            // getKeys() is called once per verify() invocation; the cache itself handles
            // the TTL-based deduplication internally (tested separately via AppleJwkCache).
            // Here we confirm verifier delegates to the cache exactly once per call.
            verify(appleJwkCache, times(2)).getKeys();
        }
    }
}
