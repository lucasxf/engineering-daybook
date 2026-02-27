package com.lucasxf.ed.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucasxf.ed.dto.AuthResponse;
import com.lucasxf.ed.dto.CompleteGoogleSignupRequest;
import com.lucasxf.ed.dto.GoogleLoginRequest;
import com.lucasxf.ed.dto.GoogleLoginResponse;
import com.lucasxf.ed.dto.HandleAvailabilityResponse;
import com.lucasxf.ed.dto.LoginRequest;
import com.lucasxf.ed.dto.RefreshRequest;
import com.lucasxf.ed.dto.RegisterRequest;
import com.lucasxf.ed.security.CookieHelper;
import com.lucasxf.ed.security.UserPrincipal;
import com.lucasxf.ed.service.AuthResult;
import com.lucasxf.ed.service.AuthService;
import com.lucasxf.ed.service.GoogleLoginResult;

import static java.util.Objects.requireNonNull;

/**
 * REST controller for web authentication endpoints.
 *
 * <p>All successful auth operations issue tokens via {@code httpOnly} cookies only.
 * The JSON response body contains user identity only — no tokens. Mobile clients must
 * use the {@code /api/v1/auth/mobile/*} endpoints (see {@link AuthMobileController}),
 * which return tokens in the response body instead of cookies.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User registration, login, and session management")
public class AuthController {

    private final AuthService authService;
    private final CookieHelper cookieHelper;

    public AuthController(AuthService authService, CookieHelper cookieHelper) {
        this.authService = requireNonNull(authService);
        this.cookieHelper = requireNonNull(cookieHelper);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user",
        description = "Creates a new user with email, password, display name, and handle. "
            + "Tokens are delivered via httpOnly cookies only. "
            + "Mobile clients: use /auth/mobile/register instead.")
    @ApiResponse(responseCode = "200", description = "Registration successful")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "409", description = "Email or handle already taken")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletResponse httpResponse) {
        AuthResult result = authService.register(request);
        cookieHelper.setAuthCookies(httpResponse, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(new AuthResponse(result.handle(), result.userId(), result.email()));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password",
        description = "Authenticates a user and issues tokens via httpOnly cookies only. "
            + "Mobile clients: use /auth/mobile/login instead.")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse httpResponse) {
        AuthResult result = authService.login(request);
        cookieHelper.setAuthCookies(httpResponse, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(new AuthResponse(result.handle(), result.userId(), result.email()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token",
        description = "Rotates the refresh token and issues new tokens. "
            + "Web clients: sends the refresh_token httpOnly cookie (no body needed). "
            + "Mobile clients: sends { refreshToken } in the JSON body (no cookie). "
            + "Returns new tokens via cookies (web) and JSON body (mobile).")
    @ApiResponse(responseCode = "200", description = "Token refreshed")
    @ApiResponse(responseCode = "401", description = "Missing, invalid, or expired refresh token")
    public ResponseEntity<AuthResponse> refresh(
        @CookieValue(name = "refresh_token", required = false) String cookieToken,
        @RequestBody(required = false) RefreshRequest body,
        HttpServletResponse httpResponse) {

        // Accept token from cookie (web) or request body (mobile) — cookie takes precedence
        String refreshToken = cookieToken != null ? cookieToken
            : (body != null ? body.refreshToken() : null);

        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        AuthResult result = authService.refreshToken(refreshToken);
        cookieHelper.setAuthCookies(httpResponse, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(new AuthResponse(result.handle(), result.userId(), result.email()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out",
        description = "Revokes the refresh token cookie and clears auth cookies.")
    @ApiResponse(responseCode = "204", description = "Logout successful")
    public ResponseEntity<Void> logout(
        @CookieValue(name = "refresh_token", required = false) String refreshToken,
        HttpServletResponse httpResponse) {

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        cookieHelper.clearAuthCookies(httpResponse);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user identity",
        description = "Returns the identity of the authenticated user from the access_token cookie. "
            + "Used by the frontend to restore session state on page load. "
            + "Returns 401 if the cookie is absent or invalid.")
    @ApiResponse(responseCode = "200", description = "Session is valid — user identity returned")
    @ApiResponse(responseCode = "401", description = "No valid session (cookie absent or expired)")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null
            || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
            new AuthResponse(principal.handle(), principal.userId(), principal.email())
        );
    }

    @PostMapping("/google")
    @Operation(summary = "Log in with Google",
        description = "Verifies a Google ID token. Returns user identity for existing users "
            + "(tokens in cookies) or a temp token for new users who need to choose a handle.")
    @ApiResponse(responseCode = "200", description = "Token verified — see requiresHandle field")
    @ApiResponse(responseCode = "401", description = "Invalid or expired Google ID token")
    @ApiResponse(responseCode = "409", description = "Email already registered with password")
    public ResponseEntity<GoogleLoginResponse> googleLogin(
        @Valid @RequestBody GoogleLoginRequest request,
        HttpServletResponse httpResponse) {

        GoogleLoginResult result = authService.googleLogin(request.idToken());

        return switch (result) {
            case GoogleLoginResult.ExistingUser(AuthResult authResult) -> {
                cookieHelper.setAuthCookies(httpResponse, authResult.accessToken(), authResult.refreshToken());
                yield ResponseEntity.ok(new GoogleLoginResponse(
                    false, null,
                    authResult.handle(), authResult.userId(), authResult.email(),
                    null, null));
            }
            case GoogleLoginResult.NewUser(String tempToken) ->
                ResponseEntity.ok(GoogleLoginResponse.newUser(tempToken));
        };
    }

    @PostMapping("/google/complete")
    @Operation(summary = "Complete Google OAuth registration",
        description = "Creates a new user account for a Google OAuth user with their chosen handle. "
            + "Issues tokens via httpOnly cookies (web) and in the JSON body (mobile).")
    @ApiResponse(responseCode = "200", description = "Registration complete, tokens issued")
    @ApiResponse(responseCode = "400", description = "Invalid handle format")
    @ApiResponse(responseCode = "401", description = "Temp token expired")
    @ApiResponse(responseCode = "409", description = "Handle already taken")
    public ResponseEntity<AuthResponse> completeGoogleSignup(
        @Valid @RequestBody CompleteGoogleSignupRequest request,
        HttpServletResponse httpResponse) {

        AuthResult result = authService.completeGoogleSignup(
            request.tempToken(), request.handle(), request.displayName());
        cookieHelper.setAuthCookies(httpResponse, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(new AuthResponse(result.handle(), result.userId(), result.email()));
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
