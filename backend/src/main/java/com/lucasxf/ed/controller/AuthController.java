package com.lucasxf.ed.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.HandleAvailabilityResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RefreshTokenRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.service.AuthService;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for authentication endpoints.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User registration, login, and session management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = requireNonNull(authService);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user",
        description = "Creates a new user with email, password, display name, and handle")
    @ApiResponse(responseCode = "200", description = "Registration successful")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "409", description = "Email or handle already taken")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password",
        description = "Authenticates a user and returns JWT tokens")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token",
        description = "Issues a new access token using a valid refresh token (rotation)")
    @ApiResponse(responseCode = "200", description = "Token refreshed")
    @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    public ResponseEntity<AuthResponse> refresh(
        @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out",
        description = "Invalidates the refresh token, ending the session")
    @ApiResponse(responseCode = "204", description = "Logout successful")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/handle/available")
    @Operation(summary = "Check handle availability",
        description = "Returns whether a handle is available for registration")
    @ApiResponse(responseCode = "200", description = "Availability check result")
    public ResponseEntity<HandleAvailabilityResponse> checkHandleAvailability(
        @RequestParam("h") String handle) {
        boolean available = authService.isHandleAvailable(handle);
        return ResponseEntity.ok(new HandleAvailabilityResponse(available, handle));
    }
}
