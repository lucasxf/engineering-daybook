package com.lucasxf.ed.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lucasxf.ed.config.AuthProperties;
import com.lucasxf.ed.domain.PasswordResetToken;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.InvalidPasswordResetTokenException;
import com.lucasxf.ed.repository.PasswordResetTokenRepository;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link PasswordResetService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordResetService")
class PasswordResetServiceTest {

    private static final String RAW_TOKEN = "raw-token-abc123";
    private static final String TOKEN_HASH = "hashed-token-abc123";
    private static final String TEST_EMAIL = "user@example.com";
    private static final String NEW_PASSWORD = "NewPass123";
    private static final String HASHED_PASSWORD = "bcrypt-hashed-password";
    private static final Duration TOKEN_EXPIRY = Duration.ofHours(1);

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        AuthProperties authProperties = new AuthProperties(
            new AuthProperties.JwtProperties("test-secret", Duration.ofMinutes(15), Duration.ofDays(7)),
            new AuthProperties.GoogleProperties("test-client-id"),
            new AuthProperties.PasswordResetProperties(TOKEN_EXPIRY)
        );

        service = new PasswordResetService(
            userRepository,
            passwordResetTokenRepository,
            refreshTokenRepository,
            jwtService,
            passwordEncoder,
            emailService,
            authProperties
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // requestReset
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("requestReset")
    class RequestReset {

        @Test
        @DisplayName("known local user — creates token and sends email")
        void knownLocalUser_createsTokenAndSendsEmail() {
            User user = localUser();
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
            when(passwordResetTokenRepository.countByUserIdAndCreatedAtAfter(
                eq(user.getId()), any(Instant.class))).thenReturn(0L);
            when(jwtService.generateRefreshToken()).thenReturn(RAW_TOKEN);
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);

            service.requestReset(TEST_EMAIL);

            verify(passwordResetTokenRepository).invalidateAllPendingByUserId(user.getId());
            ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
            verify(passwordResetTokenRepository).save(tokenCaptor.capture());
            assertThat(tokenCaptor.getValue().getTokenHash()).isEqualTo(TOKEN_HASH);
            verify(emailService).sendPasswordResetEmail(eq(user), eq(RAW_TOKEN));
        }

        @Test
        @DisplayName("unknown email — returns silently, no token, no email (no enumeration)")
        void unknownEmail_returnsSilently() {
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

            service.requestReset(TEST_EMAIL);

            verify(passwordResetTokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), anyString());
        }

        @Test
        @DisplayName("Google OAuth user — returns silently, no token, no email (AC5)")
        void googleUser_returnsSilently() {
            User googleUser = googleUser();
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(googleUser));

            service.requestReset(TEST_EMAIL);

            verify(passwordResetTokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), anyString());
        }

        @Test
        @DisplayName("per-email rate limit reached (3+ in last hour) — returns silently, no new token (AC13)")
        void rateLimitReached_returnsSilently() {
            User user = localUser();
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
            when(passwordResetTokenRepository.countByUserIdAndCreatedAtAfter(
                eq(user.getId()), any(Instant.class))).thenReturn(3L);

            service.requestReset(TEST_EMAIL);

            verify(passwordResetTokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), anyString());
        }

        @Test
        @DisplayName("previous pending token invalidated before issuing new one (FR10)")
        void invalidatesPreviousTokensBeforeIssuingNew() {
            User user = localUser();
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));
            when(passwordResetTokenRepository.countByUserIdAndCreatedAtAfter(
                eq(user.getId()), any(Instant.class))).thenReturn(0L);
            when(jwtService.generateRefreshToken()).thenReturn(RAW_TOKEN);
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);

            service.requestReset(TEST_EMAIL);

            // Verify invalidation happens BEFORE save
            var inOrder = org.mockito.Mockito.inOrder(passwordResetTokenRepository);
            inOrder.verify(passwordResetTokenRepository).invalidateAllPendingByUserId(user.getId());
            inOrder.verify(passwordResetTokenRepository).save(any());
        }

        @Test
        @DisplayName("email is normalized to lowercase before lookup")
        void emailNormalizedToLowercase() {
            when(userRepository.findByEmail("upper@example.com")).thenReturn(Optional.empty());

            service.requestReset("UPPER@Example.COM");

            verify(userRepository).findByEmail("upper@example.com");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // validateToken
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("validateToken")
    class ValidateToken {

        @Test
        @DisplayName("valid token — no exception thrown")
        void validToken_noException() {
            PasswordResetToken token = validToken();
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.of(token));

            service.validateToken(RAW_TOKEN); // must not throw
        }

        @Test
        @DisplayName("unknown token hash — throws InvalidPasswordResetTokenException (AC8)")
        void unknownToken_throws() {
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.validateToken(RAW_TOKEN))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
        }

        @Test
        @DisplayName("expired token — throws InvalidPasswordResetTokenException (AC6)")
        void expiredToken_throws() {
            PasswordResetToken token = expiredToken();
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.of(token));

            assertThatThrownBy(() -> service.validateToken(RAW_TOKEN))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
        }

        @Test
        @DisplayName("used token — throws InvalidPasswordResetTokenException (AC7)")
        void usedToken_throws() {
            PasswordResetToken token = usedToken();
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.of(token));

            assertThatThrownBy(() -> service.validateToken(RAW_TOKEN))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // confirmReset
    // ─────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("confirmReset")
    class ConfirmReset {

        @Test
        @DisplayName("valid token — updates password, marks token used, revokes refresh tokens (AC2, AC11)")
        void validToken_updatesPasswordAndRevokesRefreshTokens() {
            User user = localUser();
            PasswordResetToken token = validTokenForUser(user);
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.of(token));
            when(passwordEncoder.encode(NEW_PASSWORD)).thenReturn(HASHED_PASSWORD);

            service.confirmReset(RAW_TOKEN, NEW_PASSWORD);

            verify(passwordEncoder).encode(NEW_PASSWORD);
            verify(userRepository).save(user);
            assertThat(user.getPasswordHash()).isEqualTo(HASHED_PASSWORD);
            assertThat(token.isUsed()).isTrue();
            verify(refreshTokenRepository).revokeAllByUserId(user.getId());
        }

        @Test
        @DisplayName("invalid token — throws without updating password (AC6, AC7, AC8)")
        void invalidToken_throwsWithoutUpdatingPassword() {
            when(jwtService.hashRefreshToken(RAW_TOKEN)).thenReturn(TOKEN_HASH);
            when(passwordResetTokenRepository.findByTokenHash(TOKEN_HASH))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.confirmReset(RAW_TOKEN, NEW_PASSWORD))
                .isInstanceOf(InvalidPasswordResetTokenException.class);

            verify(userRepository, never()).save(any());
            verify(refreshTokenRepository, never()).revokeAllByUserId(any());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private User localUser() {
        User user = new User(TEST_EMAIL, "hash", "Test User", "testuser");
        return user;
    }

    private User googleUser() {
        User user = new User(TEST_EMAIL, null, "Google User", "googleuser");
        user.setAuthProvider("google");
        return user;
    }

    private PasswordResetToken validToken() {
        return new PasswordResetToken(localUser(), TOKEN_HASH, Instant.now().plus(TOKEN_EXPIRY));
    }

    private PasswordResetToken validTokenForUser(User user) {
        return new PasswordResetToken(user, TOKEN_HASH, Instant.now().plus(TOKEN_EXPIRY));
    }

    private PasswordResetToken expiredToken() {
        return new PasswordResetToken(localUser(), TOKEN_HASH, Instant.now().minus(Duration.ofSeconds(1)));
    }

    private PasswordResetToken usedToken() {
        PasswordResetToken token = new PasswordResetToken(
            localUser(), TOKEN_HASH, Instant.now().plus(TOKEN_EXPIRY));
        token.markUsed();
        return token;
    }
}
