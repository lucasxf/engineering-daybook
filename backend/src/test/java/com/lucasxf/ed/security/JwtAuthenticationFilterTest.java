package com.lucasxf.ed.security;

import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import com.lucasxf.ed.service.JwtService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link JwtAuthenticationFilter}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-02-21
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "user@example.com";
    private static final String HANDLE = "testuser";

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("Authorization header fallback")
    class BearerHeader {

        @Test
        @DisplayName("should pass through when Authorization header is absent and no cookie")
        void doFilterInternal_noAuthHeader() throws Exception {
            when(request.getCookies()).thenReturn(null);
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("should pass through when Authorization header is not Bearer")
        void doFilterInternal_nonBearerHeader() throws Exception {
            when(request.getCookies()).thenReturn(null);
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("should pass through without setting auth when Bearer token is invalid")
        void doFilterInternal_invalidBearerToken() throws Exception {
            String token = "invalid.token.value";
            when(request.getCookies()).thenReturn(null);
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtService.isTokenValid(token)).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("should set UserPrincipal in SecurityContext when Bearer token is valid")
        void doFilterInternal_validBearerToken() throws Exception {
            String token = "valid.jwt.token";
            when(request.getCookies()).thenReturn(null);
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtService.isTokenValid(token)).thenReturn(true);
            when(jwtService.extractUserId(token)).thenReturn(USER_ID);
            when(jwtService.extractEmail(token)).thenReturn(EMAIL);
            when(jwtService.extractHandle(token)).thenReturn(HANDLE);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(auth.getPrincipal()).isInstanceOf(UserPrincipal.class);
            var principal = (UserPrincipal) auth.getPrincipal();
            assertThat(principal.userId()).isEqualTo(USER_ID);
            assertThat(principal.email()).isEqualTo(EMAIL);
            assertThat(principal.handle()).isEqualTo(HANDLE);
            assertThat(auth.getName()).isEqualTo(USER_ID.toString());
        }
    }

    @Nested
    @DisplayName("Cookie-based token extraction (primary)")
    class CookieBased {

        @Test
        @DisplayName("should authenticate from access_token cookie when present")
        void doFilterInternal_validCookieToken() throws Exception {
            String token = "valid.cookie.jwt";
            Cookie accessCookie = new Cookie(CookieHelper.ACCESS_TOKEN_COOKIE, token);
            when(request.getCookies()).thenReturn(new Cookie[]{accessCookie});
            when(jwtService.isTokenValid(token)).thenReturn(true);
            when(jwtService.extractUserId(token)).thenReturn(USER_ID);
            when(jwtService.extractEmail(token)).thenReturn(EMAIL);
            when(jwtService.extractHandle(token)).thenReturn(HANDLE);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            var auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            var principal = (UserPrincipal) auth.getPrincipal();
            assertThat(principal.userId()).isEqualTo(USER_ID);
            assertThat(principal.email()).isEqualTo(EMAIL);
            assertThat(principal.handle()).isEqualTo(HANDLE);
        }

        @Test
        @DisplayName("should skip auth when access_token cookie has invalid token")
        void doFilterInternal_invalidCookieToken() throws Exception {
            String token = "invalid.cookie.jwt";
            Cookie accessCookie = new Cookie(CookieHelper.ACCESS_TOKEN_COOKIE, token);
            when(request.getCookies()).thenReturn(new Cookie[]{accessCookie});
            when(jwtService.isTokenValid(token)).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("should prefer cookie token over Authorization header — header never read")
        void doFilterInternal_cookieTakesPriorityOverHeader() throws Exception {
            String cookieToken = "cookie.jwt.token";
            Cookie accessCookie = new Cookie(CookieHelper.ACCESS_TOKEN_COOKIE, cookieToken);
            when(request.getCookies()).thenReturn(new Cookie[]{accessCookie});
            when(jwtService.isTokenValid(cookieToken)).thenReturn(true);
            when(jwtService.extractUserId(cookieToken)).thenReturn(USER_ID);
            when(jwtService.extractEmail(cookieToken)).thenReturn(EMAIL);
            when(jwtService.extractHandle(cookieToken)).thenReturn(HANDLE);

            filter.doFilterInternal(request, response, filterChain);

            var auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(((UserPrincipal) auth.getPrincipal()).email()).isEqualTo(EMAIL);
            // Prove cookie path was taken — Authorization header never read
            verify(request, never()).getHeader("Authorization");
        }

        @Test
        @DisplayName("should pass through when cookies list is present but contains no access_token")
        void doFilterInternal_irrelevantCookieOnly() throws Exception {
            Cookie other = new Cookie("other_cookie", "some-value");
            when(request.getCookies()).thenReturn(new Cookie[]{other});
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }
}
