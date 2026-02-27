package com.lucasxf.ed.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.CompleteGoogleSignupRequest;
import com.lucasxf.ed.dto.GoogleLoginRequest;
import com.lucasxf.ed.dto.GoogleLoginResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RefreshRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.service.AuthResult;
import com.lucasxf.ed.service.AuthService;
import com.lucasxf.ed.service.GoogleLoginResult;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for mobile authentication endpoints.
 *
 * <p>Mobile clients (iOS/Android via Expo/React Native) cannot store {@code httpOnly}
 * cookies, so tokens are returned in the JSON response body instead. Cookies are never
 * set by this controller. Web clients must use {@link AuthController} (cookie-based).
 *
 * <p>All endpoints are under {@code /api/v1/auth/mobile/} and are publicly accessible
 * (covered by the {@code /api/v1/auth/**} permitAll rule in SecurityConfig).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-27
 */
@RestController
@RequestMapping("/api/v1/auth/mobile")
@Tag(name = "Authentication (Mobile)", description = "Token-in-body auth endpoints for mobile clients")
public class AuthMobileController {

    private final AuthService authService;

    public AuthMobileController(AuthService authService) {
        this.authService = requireNonNull(authService);
    }

    @PostMapping("/register")
    @Operation(summary = "Register (mobile)",
        description = "Creates a new user. Returns tokens in the JSON body — no cookies set.")
    @ApiResponse(responseCode = "200", description = "Registration successful")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "409", description = "Email or handle already taken")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResult result = authService.register(request);
        return ResponseEntity.ok(new AuthResponse(
            result.handle(), result.userId(), result.email(),
            result.accessToken(), result.refreshToken()));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in (mobile)",
        description = "Authenticates a user. Returns tokens in the JSON body — no cookies set.")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResult result = authService.login(request);
        return ResponseEntity.ok(new AuthResponse(
            result.handle(), result.userId(), result.email(),
            result.accessToken(), result.refreshToken()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token (mobile)",
        description = "Rotates the refresh token using the token from the request body. "
            + "Returns new tokens in the JSON body — no cookies set.")
    @ApiResponse(responseCode = "200", description = "Token refreshed")
    @ApiResponse(responseCode = "401", description = "Missing, invalid, or expired refresh token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody(required = false) RefreshRequest body) {
        if (body == null || body.refreshToken() == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResult result = authService.refreshToken(body.refreshToken());
        return ResponseEntity.ok(new AuthResponse(
            result.handle(), result.userId(), result.email(),
            result.accessToken(), result.refreshToken()));
    }

    @PostMapping("/google")
    @Operation(summary = "Log in with Google (mobile)",
        description = "Verifies a Google ID token. Returns tokens in the JSON body for existing "
            + "users, or a temp token for new users who need to choose a handle.")
    @ApiResponse(responseCode = "200", description = "Token verified — see requiresHandle field")
    @ApiResponse(responseCode = "401", description = "Invalid or expired Google ID token")
    @ApiResponse(responseCode = "409", description = "Email already registered with password")
    public ResponseEntity<GoogleLoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        GoogleLoginResult result = authService.googleLogin(request.idToken());
        return switch (result) {
            case GoogleLoginResult.ExistingUser(AuthResult authResult) ->
                ResponseEntity.ok(GoogleLoginResponse.existingUser(authResult));
            case GoogleLoginResult.NewUser(String tempToken) ->
                ResponseEntity.ok(GoogleLoginResponse.newUser(tempToken));
        };
    }

    @PostMapping("/google/complete")
    @Operation(summary = "Complete Google OAuth registration (mobile)",
        description = "Creates a new user account for a Google OAuth user with their chosen handle. "
            + "Returns tokens in the JSON body — no cookies set.")
    @ApiResponse(responseCode = "200", description = "Registration complete, tokens issued")
    @ApiResponse(responseCode = "400", description = "Invalid handle format")
    @ApiResponse(responseCode = "401", description = "Temp token expired")
    @ApiResponse(responseCode = "409", description = "Handle already taken")
    public ResponseEntity<AuthResponse> completeGoogleSignup(
        @Valid @RequestBody CompleteGoogleSignupRequest request) {
        AuthResult result = authService.completeGoogleSignup(
            request.tempToken(), request.handle(), request.displayName());
        return ResponseEntity.ok(new AuthResponse(
            result.handle(), result.userId(), result.email(),
            result.accessToken(), result.refreshToken()));
    }
}
