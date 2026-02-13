# Authentication

> **Status:** Implemented
> **Created:** 2026-02-09
> **Implemented:** 2026-02-11

---

## Context

Authentication is the first milestone of Phase 1 (MVP). It is the gateway to every other feature — no POK management, search, or personalization is possible without identifying the user.

The Engineering Daybook is a **personal knowledge tool**, so authentication must be simple, secure, and non-intrusive. The goal is to get the user authenticated and into their learning flow as quickly as possible.

Each user is also identified by a unique **handle** (e.g., `@lucasxf`). The handle serves as a human-readable, URL-safe identifier — analogous to GitHub, Twitter/X, or LinkedIn usernames. While email is the primary authentication credential, the handle is how users are recognized within the application and in any future sharing or social features.

**Related:**
- [REQUIREMENTS.md — AUTH-01 through AUTH-04](../../REQUIREMENTS.md)
- [ARCHITECTURE.md — Section 7: Security Architecture](../../ARCHITECTURE.md)
- [ADR-005: Supabase for Managed PostgreSQL and Auth](../../ARCHITECTURE.md)
- [ROADMAP.md — Milestone 1.1](../../ROADMAP.md)

---

## Requirements

### Functional

- [x] FR1: User can register with email, password, display name, and handle (AUTH-01)
- [ ] FR2: User can sign in with Google OAuth (AUTH-02)
- [x] FR3: User can sign in with email and password (AUTH-01)
- [x] FR4: JWT access + refresh tokens are issued on successful authentication. Access token claims include: userId, email, handle, and issued/expiration timestamps (AUTH-04)
- [x] FR5: JWT access token is short-lived (15 min); refresh token is long-lived (7 days)
- [x] FR6: User can refresh their session using a valid refresh token; the old refresh token is rotated (invalidated and replaced) on each refresh
- [x] FR7: User can sign out (invalidate current session)
- [ ] FR8: User session persists across browser/app restarts via refresh token (AUTH-04)
- [x] FR9: User profile is created on first registration with default locale (EN) and theme (dark)
- [x] FR10: Handle must be unique, 3-30 characters, lowercase alphanumeric and hyphens only, no consecutive hyphens, must start and end with alphanumeric. Pattern: `^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$` (e.g., `lucasxf`, `lucas-xf`)
- [x] FR11: Handle is immutable after registration (changing handle is a separate future feature)
- [x] FR12: Handle is stored without the `@` prefix; the `@` is a display convention only
- [ ] FR13: For Google OAuth first-time registration, user is prompted to choose a handle before account creation completes
- [x] FR14: User can maintain concurrent sessions across multiple devices (each device receives its own refresh token)
- [x] FR15: Email must be valid per RFC 5322, max 255 characters, and normalized to lowercase before storage
- [x] FR16: Password must be 8-128 characters, containing at least 1 uppercase letter, 1 lowercase letter, and 1 number (128-char max prevents bcrypt DoS)
- [ ] FR17: Client must automatically refresh the access token when it receives a 401 Unauthorized response, using the refresh token. If refresh fails, redirect to login

### Non-Functional

- [x] NFR1: All auth endpoints must respond within 500ms (PERF-01)
- [x] NFR2: Passwords must be hashed with bcrypt (SEC-02)
- [ ] NFR3: All API calls must be over HTTPS in production (SEC-01)
- [ ] NFR4: Auth endpoints must be rate-limited collectively: 10 requests per minute per IP across all auth endpoints — /register, /login, /google, /refresh, /logout (SEC-05)
- [x] NFR5: SQL injection prevention via parameterized queries (SEC-06)
- [x] NFR6: Test coverage > 80% for auth module (MAINT-01)
- [x] NFR7: Refresh tokens must be rotated on each refresh (invalidate old token, issue new token) to prevent token replay attacks
- [x] NFR8: Handle availability checks must use an indexed column to support high-frequency requests without database overload

### Deferred (Out of Scope for this Spec)

- Password reset flow (AUTH-03, Should Have — separate spec)
- Multi-Factor Authentication (AUTH-06, Evolution phase)
- Sign out from all devices (AUTH-05, Could Have)
- Handle change/rename flow (future feature)
- Email verification flow (send verification email after registration, require verification before full access)
- Account linking (link Google OAuth to existing email/password account, or add password to Google-only account)

---

## Technical Constraints

**Stack:** Backend + Web (full-stack)

**Technologies:**
- Backend: Java 21, Spring Boot 3.2+, Spring Security 6+, Flyway
- Web: Next.js 14+, TypeScript 5+
- Database: PostgreSQL 15+ (Supabase)
- Auth Provider: Supabase Auth (Google OAuth) + custom JWT for API

**Integration Points:**
- Supabase Auth for Google OAuth identity verification
- PostgreSQL `users` table (Flyway migration)
- Spring Security filter chain for JWT validation
- Next.js middleware for protected routes

**Out of Scope:**
- Mobile authentication (Phase 3)
- Password reset flow (separate spec)
- MFA (Phase 2+)
- Social login beyond Google (not planned)
- Admin/role-based access (single-role: user)

---

## Acceptance Criteria

### AC1: Email/Password Registration
**GIVEN** a visitor on the registration page
**WHEN** they submit a valid email (RFC 5322, max 255 chars), password (8-128 chars, 1 uppercase, 1 lowercase, 1 number), display name, and handle
**THEN** a new user is created with the chosen handle, email normalized to lowercase, default locale=EN, theme=dark, and they are redirected to the home page with an active session

### AC2: Email/Password Registration — Duplicate Email
**GIVEN** a visitor on the registration page
**WHEN** they submit an email that already exists
**THEN** the system returns a 409 Conflict error with a user-friendly message (without revealing whether the email is registered — security best practice)

### AC2b: Email/Password Registration — Duplicate Handle
**GIVEN** a visitor on the registration page
**WHEN** they submit a handle that is already taken
**THEN** the system returns a 409 Conflict error indicating the handle is unavailable

### AC2c: Email/Password Registration — Invalid Handle Format
**GIVEN** a visitor on the registration page
**WHEN** they submit a handle that violates format rules (too short/long, invalid characters, starts/ends with hyphen)
**THEN** the system returns a 400 Bad Request with a validation error describing the rules

### AC3: Email/Password Login
**GIVEN** a registered user on the login page
**WHEN** they submit valid email and password
**THEN** they receive a JWT access token (15 min) and refresh token (7 days), and are redirected to the home page

### AC4: Email/Password Login — Invalid Credentials
**GIVEN** a visitor on the login page
**WHEN** they submit invalid email or password
**THEN** the system returns a 401 Unauthorized error with a generic message ("Invalid credentials")

### AC5: Google OAuth Login — Returning User
**GIVEN** a visitor on the login page who has previously registered via Google
**WHEN** they click "Sign in with Google" and complete the Google OAuth flow
**THEN** the existing user is matched and they receive JWT tokens and are redirected to the home page

### AC5b: Google OAuth Login — First Time
**GIVEN** a visitor on the login page who has never registered
**WHEN** they click "Sign in with Google" and complete the Google OAuth flow
**THEN** they are redirected to a "Choose your handle" step where they must pick a unique, valid handle before account creation completes

### AC5c: Google OAuth — Handle Selection Errors
**GIVEN** a visitor completing Google OAuth for the first time
**WHEN** they encounter an error during handle selection (invalid handle, token expiration, or abandonment)
**THEN** the system returns an appropriate error message and allows retry without forcing a new Google OAuth flow (if the temporary token is still valid)

### AC5d: Google OAuth — Email Already Registered via Email/Password
**GIVEN** a visitor completing Google OAuth
**WHEN** their Google email is already registered via email/password
**THEN** the system returns a 409 Conflict error with a message suggesting they log in with email/password instead

### AC6: Token Refresh
**GIVEN** an authenticated user whose access token has expired
**WHEN** the client sends a valid refresh token to the refresh endpoint
**THEN** a new access token is issued without requiring re-login, and the old refresh token is rotated (invalidated and replaced with a new one)

### AC7: Token Refresh — Expired Refresh Token
**GIVEN** an authenticated user whose refresh token has expired (>7 days)
**WHEN** the client sends the expired refresh token
**THEN** the system returns 401 and the user must re-authenticate

### AC8: Sign Out
**GIVEN** an authenticated user
**WHEN** they click "Sign out"
**THEN** the refresh token is soft-deleted server-side (marked with `revoked_at` timestamp), the client clears the access token from memory and the httpOnly refresh cookie, and the user is redirected to the login page

### AC9: Protected Route Access
**GIVEN** an unauthenticated visitor
**WHEN** they try to access any page other than login/register
**THEN** they are redirected to the login page

### AC10: Rate Limiting
**GIVEN** a client (any)
**WHEN** they send more than 10 requests per minute collectively across all auth endpoints (/register, /login, /google, /refresh, /logout) from the same IP
**THEN** the system returns 429 Too Many Requests

### AC11: Handle Availability Check
**GIVEN** a visitor on the registration page (or handle selection step for Google OAuth)
**WHEN** they type a handle into the handle field
**THEN** the UI provides real-time feedback on whether the handle is available and valid (debounced, ~300ms)

---

## Implementation Approach

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      WEB (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  Login   │  │ Register │  │ Auth Context/Provider │  │
│  │  Page    │  │  Page    │  │ (token mgmt, refresh) │  │
│  └────┬─────┘  └────┬─────┘  └───────────┬───────────┘  │
│       │              │                    │              │
│       └──────────────┼────────────────────┘              │
│                      │ API calls                        │
│  ┌───────────────────▼───────────────────┐              │
│  │          Next.js Middleware            │              │
│  │   (redirect unauthenticated users)    │              │
│  └───────────────────┬───────────────────┘              │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────┼──────────────────────────────────┐
│                 BACKEND (Spring Boot)                    │
│  ┌───────────────────▼───────────────────┐              │
│  │          AuthController               │              │
│  │  POST /auth/register                  │              │
│  │  POST /auth/login                     │              │
│  │  POST /auth/google                    │              │
│  │  POST /auth/google/complete           │              │
│  │  POST /auth/refresh                   │              │
│  │  POST /auth/logout                    │              │
│  │  GET  /auth/handle/available?h=       │              │
│  └───────────────────┬───────────────────┘              │
│  ┌───────────────────▼───────────────────┐              │
│  │          AuthService                  │              │
│  │  - register(email, pass, name, handle)│              │
│  │  - login(email, password)             │              │
│  │  - googleLogin(googleToken)           │              │
│  │  - completeGoogleSignup(token, handle)│              │
│  │  - refreshToken(refreshToken)         │              │
│  │  - logout(refreshToken)               │              │
│  │  - isHandleAvailable(handle)          │              │
│  └───────┬──────────────────┬────────────┘              │
│  ┌───────▼───────┐  ┌──────▼──────────┐                │
│  │ UserRepository│  │  JwtService     │                │
│  │ (Spring Data) │  │  (issue/verify) │                │
│  └───────┬───────┘  └─────────────────┘                │
│          │                                              │
│  ┌───────▼───────────────────────────────┐              │
│  │       Spring Security Filter Chain    │              │
│  │  JwtAuthenticationFilter              │              │
│  │  (validates Bearer token on requests) │              │
│  └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────┐
│              POSTGRESQL (Supabase)                       │
│  ┌───────────────────▼───────────────────┐              │
│  │  users (+ handle column)             │              │
│  │  + refresh_tokens (new table)         │              │
│  └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Custom JWT over Supabase Auth SDK** — The backend issues its own JWTs to maintain control over token claims, expiration, and validation. Supabase is used only as the Google OAuth identity provider (verifying Google tokens), not as the session manager. This keeps the backend independent of Supabase's auth API.

2. **Refresh token stored in DB** — Refresh tokens are stored in a `refresh_tokens` table, enabling server-side invalidation on logout and rotation on refresh.

3. **Bcrypt for password hashing** — Industry standard, Spring Security's default.

4. **Stateless API (JWT)** — No server-side sessions. JWT access token in Authorization header. Refresh token in httpOnly cookie (web) or secure storage (mobile, future).

5. **Handle as user identity** — Each user has a unique, immutable handle (e.g., `lucasxf`). Stored lowercase without `@` prefix. Validated as `^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$` (3-30 chars, alphanumeric + hyphens, no consecutive hyphens, cannot start/end with hyphen). The handle is included in JWT claims alongside userId for convenience. A `GET /auth/handle/available` endpoint supports real-time availability checks during registration. The `handle` column must have a unique index.

6. **Google OAuth two-step registration** — When a user signs in with Google for the first time, the backend returns a temporary token (not a full session) that requires the user to pick a handle before account creation completes. This avoids auto-generating handles from email prefixes, which could conflict or be undesirable.

### Handle Display Rules

- Display handles with `@` prefix in user-facing UI (e.g., `@lucasxf` in header, profile)
- Store handles without `@` prefix in database
- API responses return handle without `@` (frontend adds it for display)

### Refresh Token Storage (Web Only in this Spec)

- Refresh tokens stored in httpOnly, Secure, SameSite=Strict cookies
- Access tokens stored in memory (React state)
- Mobile refresh token storage deferred to Phase 3

### Logout Strategy

- Soft-delete refresh tokens (set `revoked_at` timestamp)
- Cleanup task runs periodically to hard-delete tokens revoked >30 days ago

### CORS Configuration

- Allow requests from production domain and `http://localhost:3000` (development)
- Allow credentials (httpOnly cookies for refresh tokens)
- Allow methods: GET, POST, PUT, DELETE

### Google OAuth Scopes

- `openid` (required for OAuth 2.0)
- `email` (required to match user accounts)
- `profile` (required to prefill display name)
- No additional scopes requested

### Test Strategy

- [x] Full TDD (tests first for all code)
  - Unit tests: AuthService, JwtService, AuthController (MockMvc)
  - Integration tests: Full auth flows with Testcontainers (PostgreSQL)
  - Web: Component tests with Vitest + React Testing Library for Login/Register pages, middleware redirect tests
  - Coverage target: >80% backend, >70% frontend auth components

### File Changes

**New (Backend):**
- `backend/src/main/java/com/lucasxf/ed/domain/User.java` — User JPA entity (includes handle field)
- `backend/src/main/java/com/lucasxf/ed/domain/RefreshToken.java` — Refresh token entity
- `backend/src/main/java/com/lucasxf/ed/repository/UserRepository.java` — User data access
- `backend/src/main/java/com/lucasxf/ed/repository/RefreshTokenRepository.java` — Token data access
- `backend/src/main/java/com/lucasxf/ed/service/AuthService.java` — Authentication business logic
- `backend/src/main/java/com/lucasxf/ed/service/JwtService.java` — JWT generation/validation
- `backend/src/main/java/com/lucasxf/ed/controller/AuthController.java` — REST endpoints
- `backend/src/main/java/com/lucasxf/ed/dto/RegisterRequest.java` — Registration DTO (email, password, name, handle)
- `backend/src/main/java/com/lucasxf/ed/dto/LoginRequest.java` — Login DTO
- `backend/src/main/java/com/lucasxf/ed/dto/AuthResponse.java` — Token response DTO (includes handle)
- `backend/src/main/java/com/lucasxf/ed/dto/GoogleLoginRequest.java` — Google OAuth DTO
- `backend/src/main/java/com/lucasxf/ed/dto/CompleteGoogleSignupRequest.java` — Handle selection after Google OAuth
- `backend/src/main/java/com/lucasxf/ed/dto/HandleAvailabilityResponse.java` — Handle check response
- `backend/src/main/java/com/lucasxf/ed/dto/RefreshTokenRequest.java` — Refresh DTO
- `backend/src/main/java/com/lucasxf/ed/security/JwtAuthenticationFilter.java` — Security filter
- `backend/src/main/java/com/lucasxf/ed/security/SecurityConfig.java` — Spring Security config
- `backend/src/main/java/com/lucasxf/ed/config/AuthProperties.java` — JWT config properties

**New (Backend — Migrations):**
- `backend/src/main/resources/db/migration/V2__create_users_table.sql`
- `backend/src/main/resources/db/migration/V3__create_refresh_tokens_table.sql`

**New (Backend — Tests):**
- `backend/src/test/java/com/lucasxf/ed/service/AuthServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/service/JwtServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/AuthControllerTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/AuthControllerIntegrationTest.java`

**New (Web):**
- `web/src/app/[locale]/login/page.tsx` — Login page
- `web/src/app/[locale]/register/page.tsx` — Registration page
- `web/src/app/[locale]/choose-handle/page.tsx` — Handle selection page (Google OAuth first-time flow)
- `web/src/components/auth/LoginForm.tsx` — Login form component
- `web/src/components/auth/RegisterForm.tsx` — Registration form component (includes handle field)
- `web/src/components/auth/GoogleLoginButton.tsx` — Google OAuth button
- `web/src/components/auth/HandleInput.tsx` — Handle input with real-time availability check
- `web/src/hooks/useAuth.ts` — Auth state hook
- `web/src/hooks/useHandleAvailability.ts` — Debounced handle availability check hook
- `web/src/lib/auth.ts` — Auth API client functions
- `web/src/lib/api.ts` — HTTP client with token interceptor

**Modified (Web):**
- `web/src/middleware.ts` — Add auth redirect logic
- `web/src/locales/en.json` — Add auth-related strings
- `web/src/locales/pt-BR.json` — Add auth-related strings

**Modified (Backend):**
- `backend/pom.xml` — Add jjwt dependency for JWT handling

---

## Dependencies

**Blocked by:**
- Backend scaffold must be merged (branch `feat/backend-scaffold`)
- Web scaffold must be merged (branch `feat/web-scaffold`)
- CI/CD pipeline should be merged (branch `chore/cicd-pipeline`)

**Blocks:**
- All Phase 1 features (POK Creation, POK Listing, UI/UX Polish)
- Every authenticated endpoint in the API

**External:**
- Supabase project must be created with Google OAuth configured
- Google Cloud Console OAuth client credentials (client ID + secret)
- JJWT library (io.jsonwebtoken:jjwt-api, jjwt-impl, jjwt-jackson)

---

## Post-Implementation Notes

### Commits (Backend PR)
- `c02acc0`: chore: add security and JWT dependencies
- `1b95143`: feat: add users and refresh_tokens database migrations
- `9eef8a8`: feat: add User and RefreshToken domain entities
- `68d5781`: feat: add UserRepository and RefreshTokenRepository
- `32c0369`: feat: add AuthProperties, JwtService, AuthService, and auth DTOs
- `57d476e`: test: add JwtService and AuthService unit tests
- `14102f7`: feat: add SecurityConfig, JwtAuthenticationFilter, and AuthController
- `973d14a`: test: add AuthController MockMvc tests
- `62e20f7`: fix: update HealthControllerTest for Spring Security context

### Architectural Decisions

**Decision: Refresh token storage format**
- **Options:** Store raw token, store bcrypt hash, store SHA-256 hash
- **Chosen:** SHA-256 hash (hex-encoded)
- **Rationale:** SHA-256 is deterministic (needed for lookup-by-hash), fast for comparison, and sufficient for opaque random tokens. Bcrypt is unnecessary since refresh tokens are high-entropy random values, not user-chosen passwords.

**Decision: Refresh token rotation strategy**
- **Options:** Hard-delete old token, soft-delete (revoke) old token
- **Chosen:** Soft-delete via `revoked_at` timestamp
- **Rationale:** Preserves audit trail. Allows detection of token reuse (potential compromise indicator). Cleanup can be done via scheduled batch deletion of expired/revoked tokens.

**Decision: Exception-to-HTTP-status mapping**
- **Options:** Custom exception hierarchy, single exception with message routing
- **Chosen:** `IllegalArgumentException` with message-based routing in `GlobalExceptionHandler`
- **Rationale:** Keeps service layer simple without custom exception classes. Message patterns ("already"/"taken" → 409, "Invalid" → 401) are clear enough for the current scope. Can be refactored to custom exceptions if the pattern grows.

### Deviations from Spec
- **Split into multiple PRs:** Spec covers full-stack (backend + web + Google OAuth). Implementation is split into 3 PRs: backend auth (this PR), web auth, and Google OAuth. This allows incremental review and reduces PR size.
- **Rate limiting (NFR4) deferred:** Not implemented in this PR. Will be added as a separate concern (e.g., Spring Boot rate limiter or API gateway) in a follow-up.
- **HTTPS enforcement (NFR3) deferred:** Infrastructure concern handled at the hosting layer (Railway/Render), not in application code.

### Lessons Learned
- `@MockBean` moved to `org.springframework.test.context.bean.override.mockito.MockitoBean` in Spring Boot 3.4+. The old import `org.springframework.boot.test.mock.bean.MockBean` no longer exists.
- Adding Spring Security requires updating ALL existing `@WebMvcTest` classes to include `@Import(SecurityConfig.class)` and mock the `JwtService` dependency, otherwise they fail to load the application context.
