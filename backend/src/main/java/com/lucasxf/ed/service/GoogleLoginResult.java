package com.lucasxf.ed.service;

/**
 * Result of a Google OAuth login attempt returned by {@link AuthService#googleLogin(String)}.
 *
 * <p>Uses a sealed interface to model the two distinct outcomes:
 * <ul>
 *   <li>{@link ExistingUser} — the email matched an existing Google OAuth account; an
 *       {@link AuthResult} with tokens is ready to be delivered via cookies.</li>
 *   <li>{@link NewUser} — first-time Google sign-in; a short-lived temp token is returned
 *       for the handle-selection flow.</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-22
 */
public sealed interface GoogleLoginResult {

    /**
     * The email matched an existing Google OAuth account.
     * The controller must set auth cookies from {@code authResult} and return
     * the user identity in the response body.
     */
    record ExistingUser(AuthResult authResult) implements GoogleLoginResult {}

    /**
     * First-time Google sign-in. The user must choose a handle.
     * The temp token is short-lived and must be sent to {@code /auth/google/complete}.
     */
    record NewUser(String tempToken) implements GoogleLoginResult {}
}
