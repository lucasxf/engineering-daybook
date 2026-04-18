package com.lucasxf.ed.service;

/**
 * Result of a Sign in with Apple login attempt returned by {@link AuthService#appleLogin(String)}.
 *
 * <p>Uses a sealed interface to model the two distinct outcomes:
 * <ul>
 *   <li>{@link ExistingUser} — the Apple sub (or email) matched an existing Apple account; an
 *       {@link AuthResult} with tokens is ready to be delivered via cookies.</li>
 *   <li>{@link NewUser} — first-time Apple sign-in; a short-lived temp token and email are
 *       returned for the handle-selection flow.</li>
 * </ul>
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-04-18
 */
public sealed interface AppleLoginResult {

    /**
     * The Apple sub matched an existing Apple account.
     * The controller must set auth cookies from {@code authResult} and return
     * the user identity in the response body.
     */
    record ExistingUser(AuthResult authResult) implements AppleLoginResult {}

    /**
     * First-time Apple sign-in. The user must choose a handle.
     * The temp token is short-lived and must be sent to {@code /auth/mobile/apple/complete}.
     * The email may be null if the user chose to hide their real email from Apple.
     */
    record NewUser(String tempToken, String email) implements AppleLoginResult {}
}
