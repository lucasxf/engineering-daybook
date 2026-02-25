package com.lucasxf.ed.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lucasxf.ed.service.JwtService;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.requireNonNull;

/**
 * Filter that validates JWT tokens on incoming requests and sets the Spring Security
 * authentication context.
 *
 * <p>Token extraction order:
 * <ol>
 *   <li><b>Primary:</b> {@code access_token} httpOnly cookie — used by the web client.</li>
 *   <li><b>Fallback:</b> {@code Authorization: Bearer} header — reserved for future mobile
 *       clients (Phase 3, Expo SecureStore).</li>
 * </ol>
 *
 * <p>On a valid token, a {@link UserPrincipal} carrying {@code userId}, {@code email},
 * and {@code handle} is stored in the {@link SecurityContextHolder}. Controllers access the
 * user ID via {@code authentication.getName()} (which returns {@code userId.toString()}).
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = requireNonNull(jwtService);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
        throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtService.isTokenValid(token)) {
            var userId = jwtService.extractUserId(token);
            var email = jwtService.extractEmail(token);
            var handle = jwtService.extractHandle(token);

            var principal = new UserPrincipal(userId, email, handle);
            var authentication = new UsernamePasswordAuthenticationToken(
                principal, null, List.of()
            );
            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Authenticated user: {}", email);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT from the request, checking the {@code access_token} cookie first,
     * then falling back to the {@code Authorization: Bearer} header.
     */
    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (CookieHelper.ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }

        return null;
    }
}
