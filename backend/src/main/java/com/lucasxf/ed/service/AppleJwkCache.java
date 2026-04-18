package com.lucasxf.ed.service;

import java.math.BigInteger;
import java.net.URI;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Cache for Apple's public JWK set used to verify identity token signatures.
 *
 * <p>Fetches {@code https://appleid.apple.com/auth/keys} on first use and every 15 minutes.
 * The cache is refreshed lazily (on cache miss), not on a background schedule.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@Slf4j
@Component
public class AppleJwkCache {

    private static final String APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";
    private static final Duration TTL = Duration.ofMinutes(15);
    private static final int TIMEOUT_MS = 3_000;

    private final RestClient restClient;

    private volatile Map<String, RSAPublicKey> cachedKeys;
    private volatile Instant cacheExpiry = Instant.EPOCH;

    public AppleJwkCache(RestClient.Builder restClientBuilder) {
        requireNonNull(restClientBuilder, "restClientBuilder must not be null");
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(TIMEOUT_MS);
        factory.setReadTimeout(TIMEOUT_MS);
        this.restClient = restClientBuilder
            .requestFactory(factory)
            .baseUrl(APPLE_KEYS_URL)
            .build();
    }

    /**
     * Returns the cached Apple public keys, refreshing from Apple's JWKS endpoint if the
     * cache has expired (TTL = 15 minutes).
     *
     * @return map of {@code kid} → {@link RSAPublicKey}
     */
    public Map<String, RSAPublicKey> getKeys() {
        if (isCacheValid()) {
            return cachedKeys;
        }
        return refreshCache();
    }

    private boolean isCacheValid() {
        return cachedKeys != null && Instant.now().isBefore(cacheExpiry);
    }

    private synchronized Map<String, RSAPublicKey> refreshCache() {
        // Double-checked locking: re-test inside the synchronized block
        if (isCacheValid()) {
            return cachedKeys;
        }
        log.info("Refreshing Apple JWK cache from {}", APPLE_KEYS_URL);
        AppleKeysResponse response = restClient.get()
            .uri(URI.create(APPLE_KEYS_URL))
            .retrieve()
            .body(AppleKeysResponse.class);

        requireNonNull(response, "Apple JWKS response was null");
        requireNonNull(response.keys(), "Apple JWKS response contained no keys");

        Map<String, RSAPublicKey> keys = response.keys().stream()
            .filter(k -> "RSA".equals(k.kty()) && "RS256".equals(k.alg()))
            .collect(Collectors.toMap(JwkEntry::kid, AppleJwkCache::toRsaPublicKey));

        cachedKeys = keys;
        cacheExpiry = Instant.now().plus(TTL);
        log.info("Apple JWK cache refreshed: {} keys loaded, expires at {}", keys.size(), cacheExpiry);
        return keys;
    }

    private static RSAPublicKey toRsaPublicKey(JwkEntry entry) {
        try {
            Base64.Decoder decoder = Base64.getUrlDecoder();
            BigInteger modulus = new BigInteger(1, decoder.decode(entry.n()));
            BigInteger exponent = new BigInteger(1, decoder.decode(entry.e()));
            RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException("Failed to build RSAPublicKey for kid=" + entry.kid(), ex);
        }
    }

    // ── Internal response records ────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    record AppleKeysResponse(List<JwkEntry> keys) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record JwkEntry(String kid, String kty, String alg, String n, String e) { }
}
