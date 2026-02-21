package com.lucasxf.ed.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.ForgotPasswordRequest;
import com.lucasxf.ed.dto.ResetPasswordRequest;
import com.lucasxf.ed.service.PasswordResetService;

import java.util.Map;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for the self-service password reset flow.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@RestController
@RequestMapping("/api/v1/auth/password-reset")
@Tag(name = "Authentication", description = "User registration, login, and session management")
public class PasswordResetController {

    private static final String GENERIC_REQUEST_MESSAGE =
        "If an account exists for that email, a reset link has been sent.";
    private static final String CONFIRM_SUCCESS_MESSAGE =
        "Password updated successfully.";

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = requireNonNull(passwordResetService);
    }

    /**
     * Initiates a password reset. Always returns 200 OK with a generic message
     * regardless of whether the email is registered (no email enumeration, NFR1).
     */
    @PostMapping("/request")
    @Operation(
        summary = "Request a password reset link",
        description = "Sends a one-time reset link to the email if an account exists. "
            + "Always returns 200 regardless of email validity (anti-enumeration)."
    )
    @ApiResponse(responseCode = "200", description = "Generic confirmation — no enumeration")
    @ApiResponse(responseCode = "400", description = "Validation error (invalid email format)")
    public ResponseEntity<Map<String, String>> requestReset(
        @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.requestReset(request.email());
        return ResponseEntity.ok(Map.of("message", GENERIC_REQUEST_MESSAGE));
    }

    /**
     * Validates a reset token without consuming it.
     * Called by the web UI on page load to show an error immediately for stale links (FR6).
     */
    @GetMapping("/validate")
    @Operation(
        summary = "Validate a password reset token",
        description = "Checks whether a token is valid (exists, not expired, not used). "
            + "Does not consume the token."
    )
    @ApiResponse(responseCode = "200", description = "Token is valid")
    @ApiResponse(responseCode = "400", description = "Token is invalid, expired, or already used")
    public ResponseEntity<Map<String, String>> validateToken(
        @RequestParam @NotBlank String token) {

        passwordResetService.validateToken(token);
        return ResponseEntity.ok(Map.of("valid", "true"));
    }

    /**
     * Confirms a password reset: validates the token, updates the password,
     * and revokes all active refresh tokens (FR7).
     */
    @PostMapping("/confirm")
    @Operation(
        summary = "Confirm password reset with new password",
        description = "Validates the token, updates the user's password, marks the token as used, "
            + "and revokes all active sessions."
    )
    @ApiResponse(responseCode = "200", description = "Password updated successfully")
    @ApiResponse(responseCode = "400", description = "Token invalid/expired or password validation failed")
    public ResponseEntity<Map<String, String>> confirmReset(
        @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.confirmReset(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", CONFIRM_SUCCESS_MESSAGE));
    }
}
