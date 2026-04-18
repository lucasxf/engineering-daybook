package com.lucasxf.ed.service;

import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lucasxf.ed.exception.AuthenticationException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Verifies Apple identity tokens (RS256 JWTs) issued by Sign in with Apple.
 *
 * <p>Uses {@link AppleJwkCache} to retrieve Apple's public keys and JJWT 0.13 to
 * validate signature, expiry, issuer, and audience claims.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@Slf4j
@Service
public class AppleIdentityTokenVerifier {

    private static final String APPLE_ISSUER = "https://appleid.apple.com";
    private static final String APPLE_AUDIENCE = "net.learnimo.app";
    private static final String EXPECTED_ALG = "RS256";

    private final AppleJwkCache appleJwkCache;
    private final ObjectMapper objectMapper;

    public AppleIdentityTokenVerifier(AppleJwkCache appleJwkCache, ObjectMapper objectMapper) {
        this.appleJwkCache = requireNonNull(appleJwkCache, "appleJwkCache must not be null");
        this.objectMapper = requireNonNull(objectMapper, "objectMapper must not be null");
    }

    /**
     * Verifies an Apple identity token and extracts the user's stable ID and email.
     *
     * @param identityToken the raw JWT from Sign in with Apple
     * @return verified Apple user information
     * @throws AuthenticationException if the token is invalid, expired, tampered, or
     *                                 fails issuer/audience/algorithm checks
     */
    public AppleUserInfo verify(String identityToken) {
        requireNonNull(identityToken, "identityToken must not be null");

        try {
            // Step 1 — parse the JWT header
            String[] parts = identityToken.split("\\.", -1);
            if (parts.length != 3) {
                throw new AuthenticationException("Invalid Apple identity token format");
            }
            String headerJson = new String(
                Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            Map<String, String> header = objectMapper.readValue(
                headerJson, new TypeReference<>() { });

            // Step 2 — assert algorithm
            String alg = header.get("alg");
            if (!EXPECTED_ALG.equals(alg)) {
                throw new AuthenticationException(
                    "Unexpected algorithm in Apple identity token: " + alg);
            }

            // Step 3 — look up the public key by kid
            String kid = header.get("kid");
            Map<String, RSAPublicKey> keys = appleJwkCache.getKeys();
            RSAPublicKey publicKey = keys.get(kid);
            if (publicKey == null) {
                log.warn("Unknown kid in Apple identity token: {}", kid);
                throw new AuthenticationException(
                    "Unknown key ID in Apple identity token: " + kid);
            }

            // Step 4 — verify signature + expiry with JJWT
            Claims claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(identityToken)
                .getPayload();

            // Step 5 — assert issuer
            String iss = claims.getIssuer();
            if (!APPLE_ISSUER.equals(iss)) {
                throw new AuthenticationException(
                    "Invalid issuer in Apple identity token: " + iss);
            }

            // Step 6 — assert audience contains the bundle ID
            List<String> audience = claims.getAudience().stream().toList();
            if (!audience.contains(APPLE_AUDIENCE)) {
                throw new AuthenticationException(
                    "Invalid audience in Apple identity token: " + audience);
            }

            // Step 7 — extract sub and email
            String sub = claims.getSubject();
            String email = claims.get("email", String.class);

            log.info("Apple identity token verified for sub={}", sub);
            return new AppleUserInfo(sub, email);

        } catch (AuthenticationException ex) {
            throw ex;
        } catch (JwtException ex) {
            log.warn("Apple identity token JWT validation failed: {}", ex.getMessage());
            throw new AuthenticationException("Apple identity token validation failed", ex);
        } catch (Exception ex) {
            log.warn("Failed to parse Apple identity token: {}", ex.getMessage());
            throw new AuthenticationException("Failed to process Apple identity token", ex);
        }
    }

    /**
     * Verified Apple user information extracted from an identity token.
     *
     * @param sub   stable Apple user ID (never changes for a given user + app pair)
     * @param email user's email (may be a private relay address or null if not shared)
     */
    public record AppleUserInfo(String sub, String email) { }
}
