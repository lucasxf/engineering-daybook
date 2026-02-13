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

import com.lucasxf.ed.domain.RefreshToken;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AuthService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, refreshTokenRepository, jwtService, passwordEncoder);
    }

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("should register a new user and return tokens")
        void register_success() {
            var request = new RegisterRequest("test@example.com", "Password1", "Test User", "testuser");

            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByHandle("testuser")).thenReturn(false);
            when(passwordEncoder.encode("Password1")).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed-refresh");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AuthResponse response = authService.register(request);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
            assertThat(response.handle()).isEqualTo("testuser");

            verify(userRepository).save(any(User.class));
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("should throw when email already exists")
        void register_duplicateEmail() {
            var request = new RegisterRequest("taken@example.com", "Password1", "Test User", "testuser");
            when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when handle already exists")
        void register_duplicateHandle() {
            var request = new RegisterRequest("test@example.com", "Password1", "Test User", "taken");
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByHandle("taken")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Handle already taken");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should normalize email to lowercase")
        void register_normalizeEmail() {
            var request = new RegisterRequest("Test@Example.COM", "Password1", "Test User", "testuser");

            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.existsByHandle("testuser")).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh");
            when(jwtService.hashRefreshToken(anyString())).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            authService.register(request);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getEmail()).isEqualTo("test@example.com");
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should login with valid credentials")
        void login_success() {
            var request = new LoginRequest("test@example.com", "Password1");
            var user = new User("test@example.com", "hashed", "Test User", "testuser");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed-refresh");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AuthResponse response = authService.login(request);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
            assertThat(response.handle()).isEqualTo("testuser");
        }

        @Test
        @DisplayName("should throw on invalid email")
        void login_invalidEmail() {
            var request = new LoginRequest("wrong@example.com", "Password1");
            when(userRepository.findByEmail("wrong@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
        }

        @Test
        @DisplayName("should throw on wrong password")
        void login_wrongPassword() {
            var request = new LoginRequest("test@example.com", "WrongPass1");
            var user = new User("test@example.com", "hashed", "Test User", "testuser");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass1", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
        }
    }

    @Nested
    @DisplayName("refreshToken")
    class RefreshTokenTests {

        @Test
        @DisplayName("should issue new tokens and rotate refresh token")
        void refresh_success() {
            var user = new User("test@example.com", "hashed", "Test User", "testuser");
            var existing = new RefreshToken(user, "old-hash", Instant.now().plusSeconds(3600));

            when(jwtService.hashRefreshToken("old-refresh")).thenReturn("old-hash");
            when(refreshTokenRepository.findByTokenHash("old-hash")).thenReturn(Optional.of(existing));
            when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("new-access");
            when(jwtService.generateRefreshToken()).thenReturn("new-refresh");
            when(jwtService.hashRefreshToken("new-refresh")).thenReturn("new-hash");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AuthResponse response = authService.refreshToken("old-refresh");

            assertThat(response.accessToken()).isEqualTo("new-access");
            assertThat(response.refreshToken()).isEqualTo("new-refresh");
            assertThat(existing.isRevoked()).isTrue();
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("should throw when refresh token not found")
        void refresh_notFound() {
            when(jwtService.hashRefreshToken("bad-token")).thenReturn("bad-hash");
            when(refreshTokenRepository.findByTokenHash("bad-hash")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refreshToken("bad-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid refresh token");
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should revoke the refresh token on logout")
        void logout_success() {
            var user = new User("test@example.com", "hashed", "Test User", "testuser");
            var token = new RefreshToken(user, "token-hash", Instant.now().plusSeconds(3600));

            when(jwtService.hashRefreshToken("raw-token")).thenReturn("token-hash");
            when(refreshTokenRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));

            authService.logout("raw-token");

            assertThat(token.isRevoked()).isTrue();
        }
    }

    @Nested
    @DisplayName("isHandleAvailable")
    class HandleAvailability {

        @Test
        @DisplayName("should return true for available handle")
        void available() {
            when(userRepository.existsByHandle("newhandle")).thenReturn(false);

            assertThat(authService.isHandleAvailable("newhandle")).isTrue();
        }

        @Test
        @DisplayName("should return false for taken handle")
        void taken() {
            when(userRepository.existsByHandle("taken")).thenReturn(true);

            assertThat(authService.isHandleAvailable("taken")).isFalse();
        }
    }
}
