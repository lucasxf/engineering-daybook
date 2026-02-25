package com.lucasxf.ed.service;

import java.util.UUID;

/**
 * Internal result of a successful authentication operation, carrying both the issued
 * tokens and the user identity. Produced by {@link AuthService} and consumed by
 * {@link com.lucasxf.ed.controller.AuthController}, which splits the data:
 * tokens go into {@code httpOnly} cookies, user identity is serialised to the JSON body.
 *
 * <p>This type is intentionally NOT exposed as an API DTO. The external contract is
 * {@link com.lucasxf.ed.dto.AuthResponse}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-22
 */
public record AuthResult(
    String accessToken,
    String refreshToken,
    String handle,
    UUID userId,
    String email
) {
}
