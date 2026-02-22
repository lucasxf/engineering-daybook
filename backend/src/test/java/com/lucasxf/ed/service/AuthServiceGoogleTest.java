package com.lucasxf.ed.service;

import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.ResourceConflictException;
import com.lucasxf.ed.exception.InvalidTokenException;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.GoogleTokenVerifierService.GoogleUserInfo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for Google OAuth methods in {@link AuthService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-13
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Google OAuth")
class AuthServiceGoogleTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GoogleTokenVerifierService googleTokenVerifier;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            userRepository, refreshTokenRepository, jwtService,
            passwordEncoder, googleTokenVerifier
        );
    }

    @Nested
    @DisplayName("googleLogin")
    class GoogleLogin {

        @Test
        @DisplayName("should return auth tokens for existing Google user")
        void googleLogin_existingGoogleUser() {
            var userInfo = new GoogleUserInfo("google-sub", "alice@gmail.com", "Alice Smith");
            when(googleTokenVerifier.verify("valid-id-token")).thenReturn(userInfo);

            var user = new User("alice@gmail.com", null, "Alice Smith", "alice");
            user.setAuthProvider("google");
            when(userRepository.findByEmail("alice@gmail.com")).thenReturn(Optional.of(user));

            when(jwtService.generateAccessToken(any(), anyString(), anyString()))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            GoogleLoginResult result = authService.googleLogin("valid-id-token");

            assertThat(result).isInstanceOf(GoogleLoginResult.ExistingUser.class);
            GoogleLoginResult.ExistingUser existing = (GoogleLoginResult.ExistingUser) result;
            assertThat(existing.authResult().accessToken()).isEqualTo("access-token");
            assertThat(existing.authResult().refreshToken()).isEqualTo("refresh-token");
            assertThat(existing.authResult().handle()).isEqualTo("alice");
        }

        @Test
        @DisplayName("should return temp token for new Google user")
        void googleLogin_newUser() {
            var userInfo = new GoogleUserInfo("google-sub", "bob@gmail.com", "Bob Smith");
            when(googleTokenVerifier.verify("valid-id-token")).thenReturn(userInfo);
            when(userRepository.findByEmail("bob@gmail.com")).thenReturn(Optional.empty());
            when(jwtService.generateTempToken("google-sub", "bob@gmail.com", "Bob Smith"))
                .thenReturn("temp-token");

            GoogleLoginResult result = authService.googleLogin("valid-id-token");

            assertThat(result).isInstanceOf(GoogleLoginResult.NewUser.class);
            GoogleLoginResult.NewUser newUser = (GoogleLoginResult.NewUser) result;
            assertThat(newUser.tempToken()).isEqualTo("temp-token");
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when Google email matches local auth user")
        void googleLogin_emailConflictWithLocal() {
            var userInfo = new GoogleUserInfo("google-sub", "carol@gmail.com", "Carol");
            when(googleTokenVerifier.verify("valid-id-token")).thenReturn(userInfo);

            var localUser = new User("carol@gmail.com", "hashed-pw", "Carol", "carol");
            // authProvider defaults to "local"
            when(userRepository.findByEmail("carol@gmail.com")).thenReturn(Optional.of(localUser));

            assertThatThrownBy(() -> authService.googleLogin("valid-id-token"))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("already registered with a password");
        }
    }

    @Nested
    @DisplayName("completeGoogleSignup")
    class CompleteGoogleSignup {

        @Test
        @DisplayName("should create user and return auth tokens")
        void completeGoogleSignup_success() {
            Claims claims = Jwts.claims()
                .add("type", "google_signup")
                .add("googleSub", "google-sub-123")
                .add("email", "bob@gmail.com")
                .add("name", "Bob Smith")
                .build();

            when(jwtService.parseTempToken("temp-token")).thenReturn(claims);
            when(userRepository.existsByHandle("bobsmith")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtService.generateAccessToken(any(), anyString(), anyString()))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AuthResult result = authService.completeGoogleSignup(
                "temp-token", "bobsmith", "Bobby S"
            );

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(result.handle()).isEqualTo("bobsmith");

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getEmail()).isEqualTo("bob@gmail.com");
            assertThat(savedUser.getPasswordHash()).isNull();
            assertThat(savedUser.getAuthProvider()).isEqualTo("google");
            assertThat(savedUser.getDisplayName()).isEqualTo("Bobby S");
            assertThat(savedUser.getHandle()).isEqualTo("bobsmith");
        }

        @Test
        @DisplayName("should throw when handle is already taken")
        void completeGoogleSignup_handleTaken() {
            Claims claims = Jwts.claims()
                .add("type", "google_signup")
                .add("googleSub", "google-sub-123")
                .add("email", "bob@gmail.com")
                .add("name", "Bob Smith")
                .build();

            when(jwtService.parseTempToken("temp-token")).thenReturn(claims);
            when(userRepository.existsByHandle("taken")).thenReturn(true);

            assertThatThrownBy(() -> authService.completeGoogleSignup(
                "temp-token", "taken", "Bob Smith"
            ))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("Handle already taken");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when temp token is expired")
        void completeGoogleSignup_expiredToken() {
            when(jwtService.parseTempToken("expired-token"))
                .thenThrow(new InvalidTokenException("Invalid or expired temp token"));

            assertThatThrownBy(() -> authService.completeGoogleSignup(
                "expired-token", "handle", "Name"
            ))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Invalid or expired temp token");

            verify(userRepository, never()).save(any());
        }
    }
}
