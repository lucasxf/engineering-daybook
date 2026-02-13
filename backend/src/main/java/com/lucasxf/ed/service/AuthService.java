package com.lucasxf.ed.service;

import java.time.Instant;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.RefreshToken;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for user authentication: registration, login, token refresh, and logout.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Slf4j
@Service
public class AuthService {


    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = requireNonNull(userRepository);
        this.refreshTokenRepository = requireNonNull(refreshTokenRepository);
        this.jwtService = requireNonNull(jwtService);
        this.passwordEncoder = requireNonNull(passwordEncoder);
    }

    /**
     * Registers a new user with email, password, display name, and handle.
     *
     * @throws IllegalArgumentException if email or handle is already taken
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByHandle(request.handle())) {
            throw new IllegalArgumentException("Handle already taken");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        var user = new User(normalizedEmail, hashedPassword, request.displayName(), request.handle());
        userRepository.save(user);

        log.info("User registered: handle={}", request.handle());
        return issueTokens(user);
    }

    /**
     * Authenticates a user with email and password.
     *
     * @throws IllegalArgumentException if credentials are invalid
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        log.info("User logged in: handle={}", user.getHandle());
        return issueTokens(user);
    }

    /**
     * Refreshes the session by rotating the refresh token.
     *
     * @throws IllegalArgumentException if the refresh token is invalid, expired, or revoked
     */
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        String tokenHash = jwtService.hashRefreshToken(rawRefreshToken);

        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!existing.isValid()) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // Rotate: revoke old token
        existing.revoke();

        User user = existing.getUser();
        log.debug("Token refreshed for user: handle={}", user.getHandle());
        return issueTokens(user);
    }

    /**
     * Logs out the user by revoking the refresh token.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = jwtService.hashRefreshToken(rawRefreshToken);

        refreshTokenRepository.findByTokenHash(tokenHash)
            .ifPresent(token -> {
                token.revoke();
                log.info("User logged out: handle={}", token.getUser().getHandle());
            });
    }

    /**
     * Checks whether a handle is available for registration.
     */
    public boolean isHandleAvailable(String handle) {
        return !userRepository.existsByHandle(handle);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(
            user.getId(), user.getEmail(), user.getHandle()
        );
        String rawRefreshToken = jwtService.generateRefreshToken();
        String refreshHash = jwtService.hashRefreshToken(rawRefreshToken);

        Instant expiresAt = Instant.now().plus(jwtService.getRefreshTokenExpiry());
        var refreshToken = new RefreshToken(user, refreshHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
            accessToken,
            rawRefreshToken,
            user.getHandle(),
            user.getId(),
            jwtService.getAccessTokenExpiry().toSeconds()
        );
    }
}
