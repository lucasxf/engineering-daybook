package com.lucasxf.ed.service;

import java.time.Instant;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.domain.PasswordResetToken;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.InvalidPasswordResetTokenException;
import com.lucasxf.ed.repository.PasswordResetTokenRepository;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Service for the self-service password reset flow.
 * <p>
 * Handles token generation, validation, and password update.
 * Follows the no-enumeration principle: all responses are identical regardless
 * of whether the email is registered or the account type.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@Slf4j
@Service
public class PasswordResetService {

    /**
     * Per-email rate limit: max reset requests per hour (FR14).
     */
    private static final int MAX_REQUESTS_PER_HOUR = 3;
    private static final String INVALID_TOKEN_MESSAGE = "Link invalid or expired";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthProperties.PasswordResetProperties resetProps;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository passwordResetTokenRepository,
                                RefreshTokenRepository refreshTokenRepository,
                                JwtService jwtService,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                AuthProperties authProperties) {
        this.userRepository = requireNonNull(userRepository);
        this.passwordResetTokenRepository = requireNonNull(passwordResetTokenRepository);
        this.refreshTokenRepository = requireNonNull(refreshTokenRepository);
        this.jwtService = requireNonNull(jwtService);
        this.passwordEncoder = requireNonNull(passwordEncoder);
        this.emailService = requireNonNull(emailService);
        this.resetProps = requireNonNull(authProperties.passwordReset());
    }

    /**
     * Initiates a password reset for the given email.
     * <p>
     * Always returns without throwing — identical behaviour for known, unknown,
     * and Google-only accounts (no email enumeration, NFR1).
     *
     * @param email the email address submitted by the user
     */
    @Transactional
    public void requestReset(String email) {
        String normalizedEmail = email.toLowerCase(java.util.Locale.ROOT);

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            // Google OAuth accounts have no password — silently ignore (FR9)
            if (!"local".equals(user.getAuthProvider())) {
                log.debug("Password reset requested for non-local account: handle={}", user.getHandle());
                return;
            }

            // Per-email rate limit: max 3 requests per hour (FR14)
            Instant oneHourAgo = Instant.now().minus(resetProps.tokenExpiry());
            long recentCount = passwordResetTokenRepository
                .countByUserIdAndCreatedAtAfter(user.getId(), oneHourAgo);
            if (recentCount >= MAX_REQUESTS_PER_HOUR) {
                log.debug("Password reset rate limit reached: handle={}", user.getHandle());
                return;
            }

            // Invalidate all pending tokens (FR10) then issue a new one
            passwordResetTokenRepository.invalidateAllPendingByUserId(user.getId());

            String rawToken = jwtService.generateRefreshToken();
            String tokenHash = jwtService.hashRefreshToken(rawToken);
            Instant expiresAt = Instant.now().plus(resetProps.tokenExpiry());

            var resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user, rawToken);
            log.info("Password reset initiated: handle={}", user.getHandle());
        });
    }

    /**
     * Validates a reset token without consuming it.
     * Called by the web UI on page load to fail fast on stale links (FR6).
     *
     * @param rawToken the raw token from the URL parameter
     * @throws InvalidPasswordResetTokenException if the token is not found, expired, or used
     */
    @Transactional(readOnly = true)
    public void validateToken(String rawToken) {
        resolveValidToken(rawToken);
    }

    /**
     * Confirms a password reset: updates the password, marks the token as used,
     * and revokes all active refresh tokens for the user (FR7).
     *
     * @param rawToken    the raw token from the URL parameter
     * @param newPassword the new password (already validated by the controller)
     * @throws InvalidPasswordResetTokenException if the token is not found, expired, or used
     */
    @Transactional
    public void confirmReset(String rawToken, String newPassword) {
        PasswordResetToken token = resolveValidToken(rawToken);
        User user = token.getUser();

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.markUsed();

        refreshTokenRepository.revokeAllByUserId(user.getId());

        log.info("Password reset confirmed: handle={}", user.getHandle());
    }

    private PasswordResetToken resolveValidToken(String rawToken) {
        String tokenHash = jwtService.hashRefreshToken(rawToken);
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new InvalidPasswordResetTokenException(INVALID_TOKEN_MESSAGE));

        if (!token.isValid()) {
            throw new InvalidPasswordResetTokenException(INVALID_TOKEN_MESSAGE);
        }

        return token;
    }
}
