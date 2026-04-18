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
import com.lucasxf.ed.exception.InvalidTokenException;
import com.lucasxf.ed.exception.ResourceConflictException;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.service.AppleIdentityTokenVerifier.AppleUserInfo;

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
 * Unit tests for Sign in with Apple methods in {@link AuthService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Sign in with Apple")
class AuthServiceAppleTest {

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

    @Mock
    private AppleIdentityTokenVerifier appleIdentityTokenVerifier;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            userRepository, refreshTokenRepository, jwtService,
            passwordEncoder, googleTokenVerifier, appleIdentityTokenVerifier
        );
    }

    @Nested
    @DisplayName("appleLogin")
    class AppleLogin {

        @Test
        @DisplayName("should return auth tokens for existing Apple user found by appleSub")
        void appleLogin_existingAppleUserBySub() {
            var userInfo = new AppleUserInfo("apple-sub-123", "alice@privaterelay.appleid.com");
            when(appleIdentityTokenVerifier.verify("valid-identity-token")).thenReturn(userInfo);

            var user = new User("alice@privaterelay.appleid.com", null, "Alice Smith", "alice");
            user.setAuthProvider("apple");
            user.setAppleSub("apple-sub-123");
            when(userRepository.findByAppleSub("apple-sub-123")).thenReturn(Optional.of(user));

            when(jwtService.generateAccessToken(any(), anyString(), anyString()))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AppleLoginResult result = authService.appleLogin("valid-identity-token");

            assertThat(result).isInstanceOf(AppleLoginResult.ExistingUser.class);
            AppleLoginResult.ExistingUser existing = (AppleLoginResult.ExistingUser) result;
            assertThat(existing.authResult().accessToken()).isEqualTo("access-token");
            assertThat(existing.authResult().refreshToken()).isEqualTo("refresh-token");
            assertThat(existing.authResult().handle()).isEqualTo("alice");
        }

        @Test
        @DisplayName("should find existing Apple user by email when appleSub lookup misses")
        void appleLogin_existingAppleUserByEmail() {
            var userInfo = new AppleUserInfo("apple-sub-456", "bob@example.com");
            when(appleIdentityTokenVerifier.verify("valid-identity-token")).thenReturn(userInfo);

            // sub lookup misses
            when(userRepository.findByAppleSub("apple-sub-456")).thenReturn(Optional.empty());

            // email lookup hits
            var user = new User("bob@example.com", null, "Bob Smith", "bob");
            user.setAuthProvider("apple");
            user.setAppleSub("apple-sub-456");
            when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(user));

            when(jwtService.generateAccessToken(any(), anyString(), anyString()))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AppleLoginResult result = authService.appleLogin("valid-identity-token");

            assertThat(result).isInstanceOf(AppleLoginResult.ExistingUser.class);
            AppleLoginResult.ExistingUser existing = (AppleLoginResult.ExistingUser) result;
            assertThat(existing.authResult().handle()).isEqualTo("bob");
        }

        @Test
        @DisplayName("should return temp token for new Apple user")
        void appleLogin_newUser() {
            var userInfo = new AppleUserInfo("apple-sub-new", "charlie@example.com");
            when(appleIdentityTokenVerifier.verify("valid-identity-token")).thenReturn(userInfo);
            when(userRepository.findByAppleSub("apple-sub-new")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.empty());
            when(jwtService.generateAppleTempToken("apple-sub-new", "charlie@example.com"))
                .thenReturn("apple-temp-token");

            AppleLoginResult result = authService.appleLogin("valid-identity-token");

            assertThat(result).isInstanceOf(AppleLoginResult.NewUser.class);
            AppleLoginResult.NewUser newUser = (AppleLoginResult.NewUser) result;
            assertThat(newUser.tempToken()).isEqualTo("apple-temp-token");
            assertThat(newUser.email()).isEqualTo("charlie@example.com");
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when Apple email matches a local auth user")
        void appleLogin_emailConflictWithLocal() {
            var userInfo = new AppleUserInfo("apple-sub-conflict", "dave@example.com");
            when(appleIdentityTokenVerifier.verify("valid-identity-token")).thenReturn(userInfo);
            when(userRepository.findByAppleSub("apple-sub-conflict")).thenReturn(Optional.empty());

            var localUser = new User("dave@example.com", "hashed-pw", "Dave", "dave");
            // authProvider defaults to "local"
            when(userRepository.findByEmail("dave@example.com")).thenReturn(Optional.of(localUser));

            assertThatThrownBy(() -> authService.appleLogin("valid-identity-token"))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("already registered with a different sign-in method");
        }

        @Test
        @DisplayName("should throw 409 when Apple email matches a Google auth user")
        void appleLogin_emailConflictWithGoogle() {
            var userInfo = new AppleUserInfo("apple-sub-conflict", "eve@gmail.com");
            when(appleIdentityTokenVerifier.verify("valid-identity-token")).thenReturn(userInfo);
            when(userRepository.findByAppleSub("apple-sub-conflict")).thenReturn(Optional.empty());

            var googleUser = new User("eve@gmail.com", null, "Eve", "eve");
            googleUser.setAuthProvider("google");
            when(userRepository.findByEmail("eve@gmail.com")).thenReturn(Optional.of(googleUser));

            assertThatThrownBy(() -> authService.appleLogin("valid-identity-token"))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("already registered with a different sign-in method");
        }
    }

    @Nested
    @DisplayName("completeAppleSignup")
    class CompleteAppleSignup {

        @Test
        @DisplayName("should create user and return auth tokens")
        void completeAppleSignup_success() {
            Claims claims = Jwts.claims()
                .add("type", "apple_signup")
                .add("appleSub", "apple-sub-123")
                .add("email", "frank@example.com")
                .build();

            when(jwtService.parseAppleTempToken("apple-temp-token")).thenReturn(claims);
            when(userRepository.existsByHandle("franksmith")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtService.generateAccessToken(any(), anyString(), anyString()))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
            when(jwtService.hashRefreshToken("refresh-token")).thenReturn("hashed");
            when(jwtService.getRefreshTokenExpiry()).thenReturn(Duration.ofDays(7));

            AuthResult result = authService.completeAppleSignup(
                "apple-temp-token", "franksmith", "Frank S"
            );

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(result.handle()).isEqualTo("franksmith");

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getEmail()).isEqualTo("frank@example.com");
            assertThat(savedUser.getPasswordHash()).isNull();
            assertThat(savedUser.getAuthProvider()).isEqualTo("apple");
            assertThat(savedUser.getAppleSub()).isEqualTo("apple-sub-123");
            assertThat(savedUser.getDisplayName()).isEqualTo("Frank S");
            assertThat(savedUser.getHandle()).isEqualTo("franksmith");
        }

        @Test
        @DisplayName("should throw when handle is already taken")
        void completeAppleSignup_handleTaken() {
            Claims claims = Jwts.claims()
                .add("type", "apple_signup")
                .add("appleSub", "apple-sub-123")
                .add("email", "frank@example.com")
                .build();

            when(jwtService.parseAppleTempToken("apple-temp-token")).thenReturn(claims);
            when(userRepository.existsByHandle("taken")).thenReturn(true);

            assertThatThrownBy(() -> authService.completeAppleSignup(
                "apple-temp-token", "taken", "Frank Smith"
            ))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("Handle already taken");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when temp token is expired or invalid")
        void completeAppleSignup_expiredToken() {
            when(jwtService.parseAppleTempToken("expired-token"))
                .thenThrow(new InvalidTokenException("Invalid or expired temp token"));

            assertThatThrownBy(() -> authService.completeAppleSignup(
                "expired-token", "handle", "Name"
            ))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Invalid or expired temp token");

            verify(userRepository, never()).save(any());
        }
    }
}
