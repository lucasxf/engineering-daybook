package com.lucasxf.ed.service;

import java.time.Instant;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.domain.RefreshToken;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.GoogleLoginResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.GoogleTokenVerifierService.GoogleUserInfo;
import lombok.extern.slf4j.Slf4j;

import io.jsonwebtoken.Claims;

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
    private final GoogleTokenVerifierService googleTokenVerifier;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       GoogleTokenVerifierService googleTokenVerifier) {
        this.userRepository = requireNonNull(userRepository);
        this.refreshTokenRepository = requireNonNull(refreshTokenRepository);
        this.jwtService = requireNonNull(jwtService);
        this.passwordEncoder = requireNonNull(passwordEncoder);
        this.googleTokenVerifier = requireNonNull(googleTokenVerifier);
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
     * Authenticates a user with a Google ID token.
     * <p>
     * If the user exists with {@code auth_provider=google}, issues JWT tokens.
     * If the user is new, returns a temp token for handle selection.
     * If the email belongs to a local account, returns 409 Conflict.
     *
     * @throws IllegalArgumentException if the ID token is invalid or email conflicts with local account
     */
    @Transactional
    public GoogleLoginResponse googleLogin(String idToken) {
        GoogleUserInfo userInfo = googleTokenVerifier.verify(idToken);
        String normalizedEmail = userInfo.email().toLowerCase(Locale.ROOT);

        return userRepository.findByEmail(normalizedEmail)
            .map(existingUser -> {
                if (!"google".equals(existingUser.getAuthProvider())) {
                    log.warn("Google OAuth email conflict with local account: email={}",
                        normalizedEmail);
                    throw new IllegalArgumentException(
                        "This email is already registered with a password. "
                            + "Please sign in with email and password.");
                }
                log.info("Google OAuth login: handle={}", existingUser.getHandle());
                return GoogleLoginResponse.existingUser(issueTokens(existingUser));
            })
            .orElseGet(() -> {
                log.info("Google OAuth new user: email={}", normalizedEmail);
                String tempToken = jwtService.generateTempToken(
                    userInfo.sub(), normalizedEmail, userInfo.name()
                );
                return GoogleLoginResponse.newUser(tempToken);
            });
    }

    /**
     * Completes registration for a new Google OAuth user by creating their account.
     *
     * @throws IllegalArgumentException if the temp token is invalid/expired or handle is taken
     */
    @Transactional
    public AuthResponse completeGoogleSignup(String tempToken, String handle, String displayName) {
        Claims claims;
        try {
            claims = jwtService.parseTempToken(tempToken);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Session expired. Please try again.");
        }

        if (userRepository.existsByHandle(handle)) {
            throw new IllegalArgumentException("Handle already taken");
        }

        String email = claims.get("email", String.class);
        var user = new User(email, null, displayName, handle);
        user.setAuthProvider("google");
        userRepository.save(user);

        log.info("Google OAuth user created: handle={}, email={}", handle, email);
        return issueTokens(user);
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
