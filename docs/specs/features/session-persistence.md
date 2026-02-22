# Session Persistence

> **Status:** Draft
> **Created:** 2026-02-22
> **Implemented:** _pending_

---

## Context

The learnimo MVP requires that authenticated users remain logged in across browser refreshes, new tabs, and normal browser close/reopen cycles. Currently, both the access token (15-minute JWT) and the refresh token (7-day opaque token) are stored in React `useRef` — in-memory variables that are discarded the moment the page unloads. The consequence is that every F5, every new tab, and every morning return to the app forces the user to log in again. For a tool intended to capture daily learnings frictionlessly, this is a session-breaking regression that directly violates the UX Mandate ("Reduce friction. Seamless experience.") and blocks the Phase 1 exit criterion.

This requirement is tracked as **AUTH-04** ("User session persists across browser/app restarts") and is classified as Must Have for Phase 1 / MVP. The architectural decision to resolve it is recorded in **ADR-007**, which specifies `httpOnly` cookies with `SameSite=Strict` as the token storage mechanism. This approach keeps tokens entirely out of JavaScript's reach (preventing XSS-based token theft) while allowing the browser to automatically attach credentials on every qualifying request — eliminating all client-side token management logic.

The scope of this milestone (1.7.1) is the **web application only**. The mobile application (Expo/React Native) cannot use browser cookies and will require a separate strategy using Expo SecureStore, deferred to Phase 3. This spec does not cover mobile. The web solution must not introduce any assumptions or backend changes that would conflict with the future mobile implementation.

**Related:**
- [AUTH-04 — REQUIREMENTS.md](../../REQUIREMENTS.md)
- [ADR-007 — ARCHITECTURE.md](../../ARCHITECTURE.md)
- [Milestone 1.7.1 — ROADMAP.md](../../ROADMAP.md)

---

## Requirements

### Functional

- [ ] **FR1 — Session survives browser refresh** `Must Have`
  After a successful login, if the user refreshes the browser (F5 / Cmd+R), they must be returned to the same page they were on, fully authenticated, without seeing a login screen. The session restoration must complete before any protected content is rendered.

- [ ] **FR2 — Session present in new tabs** `Must Have`
  After a successful login, if the user opens a new browser tab and navigates to learnimo.net, they must be authenticated automatically. No login prompt must appear.

- [ ] **FR3 — Session survives browser close and reopen** `Must Have`
  If the user closes the browser (not just the tab) and reopens learnimo.net within the 7-day refresh token window, they must be authenticated automatically without re-entering credentials.

- [ ] **FR4 — Transparent access token refresh** `Must Have`
  When the access token expires mid-session (15-minute window), the next API call that receives a `401 Unauthorized` response must automatically trigger a token refresh by calling the refresh endpoint (cookie is sent automatically by the browser). The original request must be retried with the new access token. The user must not see an error, a login prompt, or any interruption.

- [ ] **FR5 — Session restoration on page load** `Must Have`
  On every page load, the frontend must determine authentication state by calling a protected endpoint (`GET /api/v1/users/me`). A `200 OK` response means the session is valid and the user data is loaded into application state. A `401` with a failed silent refresh means the session has expired and the user is redirected to login.

- [ ] **FR6 — Logout revokes session server-side and clears cookies** `Must Have`
  Calling logout must: (1) send a request to the backend that revokes the refresh token in the database, (2) cause the backend to respond with `Set-Cookie` headers that expire both the access token cookie and the refresh token cookie immediately (Max-Age=0), (3) redirect the user to the login page. After logout, the refresh cookie must not allow session restoration.

- [ ] **FR7 — All existing auth flows continue working** `Must Have`
  Both email/password login and Google OAuth login must issue `httpOnly` cookies using the same mechanism. There must be no regression in any existing authentication path. The user-facing login and register flows must behave identically to today, except that tokens are delivered via cookies instead of JSON response body.

- [ ] **FR8 — Refresh token cookie scoped to auth endpoints only** `Should Have`
  The refresh token cookie must have its `Path` attribute set to `/api/v1/auth` so it is only sent on requests to auth endpoints, not on every API call. The access token cookie has `Path=/` (sent on all requests).

- [ ] **FR9 — Mobile is explicitly out of scope** _(Note)_
  This spec covers the web application only. The Expo/React Native mobile application must not be affected by these backend changes. The backend must not make assumptions that break future token-in-header flows for mobile (Phase 3).

### Non-Functional

- [ ] **NFR1 — XSS protection via httpOnly** `Must Have`
  Both the access token cookie and the refresh token cookie must have the `HttpOnly` flag set. Neither token must be readable by JavaScript (`document.cookie` must not expose them).

- [ ] **NFR2 — CSRF mitigation via SameSite=Strict** `Must Have`
  Both cookies must have `SameSite=Strict` set. This ensures cookies are not sent on cross-site requests, neutralising CSRF attacks without requiring a separate CSRF token for standard flows.

- [ ] **NFR3 — HTTPS-only in production** `Must Have`
  Both cookies must have the `Secure` flag in any non-local environment (production, staging). In local development (`localhost`), `Secure` may be omitted to allow HTTP. This must be driven by a configuration property (`auth.cookie.secure`), not hardcoded.

- [ ] **NFR4 — Cookie expiry aligned with token TTL** `Must Have`
  The `Max-Age` of the access token cookie must match the JWT expiry (15 minutes). The `Max-Age` of the refresh token cookie must match the refresh token TTL (7 days). Cookie and token expiry must never be out of sync.

- [ ] **NFR5 — Session restoration latency** `Should Have`
  The session restoration call on page load (`GET /api/v1/users/me`) must complete within 500ms under normal network conditions. A loading state must be shown until resolution — no blank authenticated shell must appear.

- [ ] **NFR6 — Refresh token cookie path scoping** `Should Have`
  The refresh token cookie must be scoped to `/api/v1/auth` to reduce the attack surface. Sending the long-lived refresh token on every API call is a security anti-pattern.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web)

**Technologies:**
- Backend: Java 21, Spring Boot 4.0+, Spring Security 6, `org.springframework.http.ResponseCookie`
- Frontend: Next.js 14+, TypeScript 5+, React Context API
- Cross-origin credential handling: `credentials: 'include'` (already set) + backend `allowCredentials: true` (already set)

**Integration Points:**
- `AuthController.java` — all auth endpoints (login, register, Google OAuth, Google complete, refresh, logout)
- `AuthResponse.java` record — simplified (remove token fields)
- `JwtAuthenticationFilter.java` — token extraction from incoming requests
- `SecurityConfig.java` — CORS configuration for cross-origin cookies
- `AuthContext.tsx` — frontend session state management
- `api.ts` — API client (Authorization header removal, 401 retry logic)
- `auth.ts` — auth API call signatures
- `application.yml` — new `auth.cookie.secure` config property

**Out of Scope:**
- Mobile / Expo implementation (Phase 3 — uses Expo SecureStore)
- CSRF token header (SameSite=Strict is sufficient for same-origin web flows)
- "Remember me" toggle (cookies are always persistent — 7-day window)
- Session list UI ("active sessions" / "logout other devices") — post-MVP
- Token revocation list / real-time logout across tabs

---

## Acceptance Criteria

### AC1 — Session survives browser refresh
**GIVEN** the user has logged in successfully and is on the feed page
**WHEN** the user presses F5
**THEN** the page reloads and the user remains authenticated on the feed
**AND** no login screen appears

### AC2 — Session present in new tab
**GIVEN** the user has logged in successfully in one browser tab
**WHEN** the user opens a new tab and navigates to learnimo.net
**THEN** the user is authenticated in the new tab and the feed is displayed
**AND** no login prompt appears

### AC3 — Access token expires mid-session; refresh is transparent
**GIVEN** the user is authenticated and actively using the app
**AND** the access token has just expired (15-minute TTL elapsed)
**WHEN** the frontend makes the next API request and receives `401 Unauthorized`
**THEN** the frontend automatically calls `POST /api/v1/auth/refresh` (refresh token cookie is sent automatically)
**AND** the backend issues a new access token cookie
**AND** the original request is retried and succeeds
**AND** the user sees no error, no login prompt, and no interruption

### AC4 — Refresh token expires after 7 days; user is sent to login
**GIVEN** the user's refresh token has expired (7-day TTL elapsed or revoked)
**WHEN** the user opens learnimo.net
**THEN** the session restoration call (`GET /api/v1/users/me`) returns `401`
**AND** the silent refresh attempt fails (backend rejects the expired cookie)
**AND** the user is redirected to the login page

### AC5 — Logout clears session completely
**GIVEN** the user is authenticated
**WHEN** the user clicks Logout
**THEN** the backend revokes the refresh token in the database
**AND** the backend responds with `Set-Cookie` headers expiring both cookies (Max-Age=0)
**AND** the user is redirected to the login page
**AND** if the user navigates back and refreshes, session restoration fails and the login page is shown

### AC6 — Google OAuth login persists across refresh
**GIVEN** the user has authenticated via Google OAuth
**WHEN** the user refreshes the browser at any point within the 7-day window
**THEN** the session is restored exactly as for email/password login
**AND** no re-authentication with Google is required

### AC7 — Unauthenticated user cannot access protected pages
**GIVEN** a user who has never logged in (or has been logged out)
**WHEN** the user navigates directly to a protected route (e.g., `/en/feed`)
**THEN** session restoration returns `401` and silent refresh fails
**AND** the user is redirected to the login page
**AND** no protected content is rendered at any point

### AC8 — Tokens are not readable by JavaScript
**GIVEN** the user is authenticated and cookies are set by the backend
**WHEN** any JavaScript reads `document.cookie` in the browser
**THEN** neither the access token nor the refresh token value is present in the returned string
**AND** this is verified by the `HttpOnly` flag being present on both `Set-Cookie` response headers

---

## Implementation Approach

### Architecture

**Overview:** Backend switches from returning tokens in the JSON response body to setting them as `httpOnly` cookies. Frontend drops all client-side token management and relies on the browser cookie jar + a session restoration call (`GET /api/v1/users/me`) on page load.

```
Login flow (new):
  1. POST /api/v1/auth/login (email + password)
  2. Backend authenticates → generates access + refresh tokens
  3. Backend: Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Strict; Path=/; Max-Age=900
             Set-Cookie: refresh_token=<opaque>; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
  4. Backend: JSON response = { handle, userId }   (no token fields)
  5. Frontend: stores handle + userId in React state, redirects to feed

Session restoration (on every page load):
  1. Browser auto-sends access_token cookie with GET /api/v1/users/me
  2. JwtAuthFilter extracts token from cookie → validates
  3. If valid: 200 OK + user data → AuthContext sets user state
  4. If 401: frontend calls POST /api/v1/auth/refresh (browser sends refresh_token cookie)
     a. If refresh succeeds: new access_token cookie set, retry /users/me
     b. If refresh fails: redirect to login

Refresh flow (new):
  1. API call → 401
  2. Frontend: POST /api/v1/auth/refresh (no body needed — cookie sent automatically)
  3. Backend: reads refresh_token cookie, validates, rotates
  4. Backend: Set-Cookie: access_token=<new-jwt>; ... (same settings)
             Set-Cookie: refresh_token=<new-opaque>; ... (same settings)
  5. Frontend: retries original request (new cookie sent automatically)

Logout flow (new):
  1. Frontend: POST /api/v1/auth/logout (no body — cookie sent automatically)
  2. Backend: reads refresh_token cookie, revokes in DB
  3. Backend: Set-Cookie: access_token=; Max-Age=0 (expire immediately)
             Set-Cookie: refresh_token=; Max-Age=0 (expire immediately)
  4. Frontend: clears React state, redirects to login
```

**Backend — Key Changes:**

1. **`AuthController.java`** — inject `HttpServletResponse` into login, register, Google auth, and Google complete methods. Call `cookieHelper.setAuthCookies(response, accessToken, refreshToken)` after generating tokens. Simplify return type to strip token fields.

2. **`AuthResponse.java`** — remove `accessToken`, `refreshToken`, `expiresIn` fields. Keep `handle` and `userId`.

3. **`AuthController.java` refresh endpoint** — change `@RequestBody` parameter to `@CookieValue(name = "refresh_token", required = false)`. Return no body (204) or simplified response; cookies set in response.

4. **`AuthController.java` logout endpoint** — change `@RequestBody` parameter to `@CookieValue`. On success, call `cookieHelper.clearAuthCookies(response)`.

5. **`JwtAuthenticationFilter.java`** — add cookie extraction: check `Cookie` header for `access_token` value; fall back to `Authorization: Bearer` header (kept for forward-compatibility with mobile). Token validation logic unchanged.

6. **New: `CookieHelper.java`** (or a private method in a shared config) — encapsulates `setAuthCookies()` and `clearAuthCookies()` using Spring's `ResponseCookie` builder. Reads `auth.cookie.secure` property from `AuthProperties`.

7. **`AuthProperties.java`** — add `boolean cookieSecure` field (bound from `auth.cookie.secure`).

8. **`application.yml`** — add `auth.cookie.secure: false` (local); production Railway env var `AUTH_COOKIE_SECURE=true`.

9. **`SecurityConfig.java`** — CORS is already configured with `allowCredentials: true`. Verify `allowedOriginPatterns` is set (required when `allowCredentials=true` — `allowedOrigins: *` is not allowed). No other changes needed. CSRF remains disabled (SameSite=Strict handles CSRF for web).

**Frontend — Key Changes:**

1. **`AuthContext.tsx`** — Remove `accessTokenRef`, `refreshTokenRef`, `refreshTimerRef`, and `scheduleRefresh()`. Add `initializeSession()` function called in `useEffect` on mount: calls `GET /api/v1/users/me`, sets user state on 200, attempts silent refresh on 401, redirects to login if refresh fails. The `login()` function no longer stores tokens — it stores `handle` and `userId` from the simplified `AuthResponse`.

2. **`api.ts`** — Remove the `if (token) { headers['Authorization'] = ... }` block. `credentials: 'include'` is already set — cookies are sent automatically. The `getToken()` helper becomes a no-op or is removed. Keep the 401 → `refreshApi()` → retry logic; update `refreshApi()` call to have no arguments.

3. **`auth.ts`** — Update `AuthResponse` type to `{ handle: string; userId: string }`. Update `refreshApi()` signature: no parameters. Update `logoutApi()` signature: no parameters.

### Test Strategy

- [x] **Partial TDD** — Tests written first for:
  - Backend: `AuthController` (verify `Set-Cookie` headers on all auth responses)
  - Backend: `JwtAuthenticationFilter` (verify cookie-based token extraction)
  - Backend: refresh + logout endpoints (cookie input + cookie clearing)
- [ ] TDD not applied to: Frontend changes (update existing tests; AuthContext session restoration logic is best tested via integration)

### File Changes

**New:**
- `backend/src/main/java/com/lucasxf/ed/security/CookieHelper.java` — encapsulates `setAuthCookies()` and `clearAuthCookies()` using `ResponseCookie`; reads secure flag from `AuthProperties`

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/controller/AuthController.java` — set cookies on all auth responses; read refresh token from cookie on refresh/logout endpoints
- `backend/src/main/java/com/lucasxf/ed/dto/AuthResponse.java` — remove `accessToken`, `refreshToken`, `expiresIn` fields; keep `handle`, `userId`
- `backend/src/main/java/com/lucasxf/ed/security/JwtAuthenticationFilter.java` — add cookie extraction (primary), keep Authorization header fallback
- `backend/src/main/java/com/lucasxf/ed/config/AuthProperties.java` — add `cookieSecure: boolean` field
- `backend/src/main/resources/application.yml` — add `auth.cookie.secure: false` property
- `web/src/contexts/AuthContext.tsx` — remove token refs + refresh timer; add `initializeSession()` on mount
- `web/src/lib/api.ts` — remove Bearer token injection; keep 401→refresh retry
- `web/src/lib/auth.ts` — update `AuthResponse` type; remove token params from `refreshApi`/`logoutApi`

**Test files (modified):**
- `backend/src/test/java/com/lucasxf/ed/controller/AuthControllerTest.java` — verify `Set-Cookie` headers; verify cookie-based refresh/logout
- `backend/src/test/java/com/lucasxf/ed/security/JwtAuthenticationFilterTest.java` — add cookie-based auth tests
- `backend/src/test/java/com/lucasxf/ed/integration/AuthIntegrationTest.java` — update to assert cookie flow end-to-end
- Web Vitest tests for `AuthContext` — update session restoration mock

**Migrations:**
- None — `refresh_tokens` table already exists

---

## Dependencies

**Blocked by:** None

**Blocks:**
- Phase 1 exit criterion (1-week usage clock cannot meaningfully restart until AUTH-04 is resolved)
- Phase 3 mobile implementation must account for the backend accepting either cookie or Authorization header for token delivery

**External:**
- Railway env var to add: `AUTH_COOKIE_SECURE=true` (production)
- CORS origin env var must already be set correctly (not `*`) — required with `allowCredentials: true` (verify in Railway: `ALLOWED_ORIGINS=https://learnimo.net`)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _pending_

### Architectural Decisions

**Decision: Both tokens in httpOnly cookies (not access-in-header + refresh-in-cookie hybrid)**
- **Options:** (A) access token in Authorization header + refresh token in cookie; (B) both tokens in httpOnly cookies
- **Chosen:** B
- **Rationale:** Option A still requires client-side access token storage (localStorage is XSS-vulnerable, sessionStorage is lost on tab close, useRef is lost on refresh). Only Option B fully solves AUTH-04 with no client-side token management.

**Decision: Keep Authorization header fallback in JwtAuthenticationFilter**
- **Options:** (A) cookie-only; (B) cookie primary + Authorization header fallback
- **Chosen:** B
- **Rationale:** Phase 3 mobile clients cannot use httpOnly cookies. Keeping the fallback allows a single backend to serve both web (cookies) and mobile (Bearer header) without a breaking change.

**Decision: Simplify AuthResponse (remove token fields)**
- **Options:** (A) keep tokens in body AND set cookies; (B) remove tokens from body, cookies only
- **Chosen:** B
- **Rationale:** Sending tokens in both body and cookies doubles the exposure surface. Since mobile (Phase 3) will use a different auth path, there is no current consumer of the token fields in the response body.

### Deviations from Spec
- _pending_

### Lessons Learned
- _pending_
