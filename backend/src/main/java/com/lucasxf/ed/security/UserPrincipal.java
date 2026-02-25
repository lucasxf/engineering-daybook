package com.lucasxf.ed.security;

import java.security.Principal;
import java.util.UUID;

/**
 * Immutable principal representing an authenticated user, populated from JWT claims.
 *
 * <p>Stored as the principal in Spring Security's {@code Authentication} object by
 * {@link JwtAuthenticationFilter}. {@link #getName()} returns {@code userId.toString()}
 * for backward compatibility with controllers that call
 * {@code UUID.fromString(authentication.getName())}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-22
 */
public record UserPrincipal(UUID userId, String email, String handle) implements Principal {

    /**
     * Returns the user ID as a string, compatible with existing controller code.
     */
    @Override
    public String getName() {
        return userId.toString();
    }
}
