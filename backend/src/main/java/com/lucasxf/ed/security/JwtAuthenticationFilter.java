package com.lucasxf.ed.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lucasxf.ed.service.JwtService;

import static java.util.Objects.requireNonNull;

/**
 * Filter that validates JWT Bearer tokens on incoming requests
 * and sets the Spring Security authentication context.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-11
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
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

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (jwtService.isTokenValid(token)) {
            var userId = jwtService.extractUserId(token);
            var email = jwtService.extractEmail(token);

            var authentication = new UsernamePasswordAuthenticationToken(
                userId, null, List.of()
            );
            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Authenticated user: {}", email);
        }

        filterChain.doFilter(request, response);
    }
}
