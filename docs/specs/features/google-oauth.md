# Google OAuth Authentication

> **Status:** In Progress
> **Created:** 2026-02-13
> **Implemented:** _pending_

---

## Context

Engineering Daybook currently supports email/password authentication (backend PR #15 + web PR #17). While functional, requiring manual registration adds friction for users who already have Google accounts. Google OAuth provides a faster onboarding path — one click to authenticate instead of filling out a registration form.

This feature is **Milestone 1.1.3** in the roadmap (Must Have) and was planned in the original authentication spec (`docs/specs/features/authentication.md`, FR2, FR13, AC5-AC5d). The backend database schema already supports OAuth: `users.auth_provider` defaults to `'local'` but accepts `'google'`, and `users.password_hash` is nullable for OAuth-only accounts.

**Design approach:** Google Identity Services (Sign In With Google) on the frontend sends a Google ID token to the backend, which verifies it using Google's public keys (JWKS). No Supabase Auth SDK dependency — the backend remains the sole issuer of JWT session tokens.

**Two-step first-time flow:** When a new user signs in with Google, they must choose a unique handle before account creation completes. This avoids auto-generating handles from email prefixes.

**Related:**
- Parent spec: `docs/specs/features/authentication.md` (FR2, FR13, AC5-AC5d)
- Web auth spec: `docs/specs/features/web-auth.md` (auth context, forms, i18n)
- [ROADMAP.md — Milestone 1.1.3](../../ROADMAP.md)

---

## Requirements

### Functional

#### Backend

- [ ] FR1 [Must Have]: `POST /api/v1/auth/google` endpoint accepts `{ idToken }`, verifies the Google ID token using Google's public keys (JWKS), and extracts `sub`, `email`, `name` claims
- [ ] FR2 [Must Have]: If the Google email matches an existing user with `auth_provider = 'google'`, issue JWT access + refresh tokens and return `AuthResponse`
- [ ] FR3 [Must Have]: If the Google email is new (no existing user), return `{ requiresHandle: true, tempToken: "..." }` where `tempToken` is a short-lived JWT (5 min) containing the Google `sub`, `email`, and `name`
- [ ] FR4 [Must Have]: If the Google email matches an existing user with `auth_provider = 'local'`, return 409 Conflict with message "This email is already registered with a password. Please sign in with email and password."
- [ ] FR5 [Must Have]: `POST /api/v1/auth/google/complete` endpoint accepts `{ tempToken, handle, displayName }`, verifies the temp token, validates the handle, checks uniqueness, and creates the user with `auth_provider = 'google'`, `password_hash = NULL`
- [ ] FR6 [Must Have]: On successful user creation via FR5, issue JWT access + refresh tokens and return `AuthResponse`
- [ ] FR7 [Must Have]: Reject invalid, expired, or tampered Google ID tokens with 401 Unauthorized
- [ ] FR8 [Must Have]: Reject invalid or expired temp tokens with 401 Unauthorized and message "Session expired. Please try again."
- [ ] FR9 [Must Have]: Handle validation on `/google/complete` follows the same pattern as registration: `^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$` (3-30 chars)
- [ ] FR10 [Must Have]: Handle uniqueness check on `/google/complete` returns 409 Conflict if taken
- [ ] FR11 [Should Have]: Cache Google's JWKS public keys to avoid fetching on every request (cache TTL aligned with key rotation, ~24h)
- [ ] FR12 [Must Have]: Google OAuth users can use existing `/api/v1/auth/refresh` and `/api/v1/auth/logout` endpoints (no changes needed — same token format)

#### Web (Frontend)

- [ ] FR13 [Must Have]: Login page displays a "Sign in with Google" button following Google's branding guidelines
- [ ] FR14 [Must Have]: Register page displays a "Sign up with Google" button (same flow as login)
- [ ] FR15 [Must Have]: Clicking the Google button triggers the Google Identity Services consent flow
- [ ] FR16 [Must Have]: On receiving a Google ID token, the frontend sends it to `POST /api/v1/auth/google`
- [ ] FR17 [Must Have]: If the backend returns `{ requiresHandle: true, tempToken }`, redirect to `/[locale]/choose-handle` page
- [ ] FR18 [Must Have]: Choose-handle page displays: pre-filled display name (editable), empty handle input with real-time availability check, and "Complete Registration" button
- [ ] FR19 [Must Have]: On successful handle submission, store tokens in memory and redirect to home (`/[locale]`)
- [ ] FR20 [Must Have]: Display localized error messages for all error scenarios (409 conflict, 401 expired, cancellation)
- [ ] FR21 [Should Have]: Loading states on Google button and Complete Registration button during async operations
- [ ] FR22 [Must Have]: All Google OAuth UI text is localized in EN and PT-BR

#### Out of Scope (Deferred)

- Account linking (adding Google to existing email/password account, or vice versa)
- Google session revocation on logout
- Multiple OAuth providers (GitHub, Microsoft, Apple)
- OAuth profile sync (auto-update name/email on Google profile change)
- Mobile Google OAuth (Phase 3)

### Non-Functional

- [ ] NFR1: Backend MUST verify Google ID tokens server-side using Google's public JWKS — never trust the frontend token without verification
- [ ] NFR2: `tempToken` MUST expire after 5 minutes and be signed with the application's JWT secret
- [ ] NFR3: Google ID token verification SHOULD complete within 500ms (JWKS caching helps)
- [ ] NFR4: "Sign in with Google" button MUST have `aria-label` for screen readers
- [ ] NFR5: Choose-handle form MUST meet WCAG 2.1 AA (keyboard navigation, focus indicators, error announcements via `aria-live`)
- [ ] NFR6: All user-facing text MUST be available in EN and PT-BR
- [ ] NFR7: Backend MUST log OAuth events at INFO level: successful authentication, new user creation, email conflicts, token verification failures
- [ ] NFR8: Google OAuth configuration (client ID) MUST be externalized via environment variables, not hardcoded

---

## Technical Constraints

**Stack:** Backend + Web (full-stack)

**Technologies:**
- Backend: Java 21, Spring Boot 3.4.1, Spring Security 6+
- New backend dependency: `google-api-client` (Google's official Java library for ID token verification)
- Web: Next.js 14.2, TypeScript 5+, Tailwind CSS 3+
- New web dependency: `@react-oauth/google` (React wrapper for Google Identity Services)
- Database: PostgreSQL 15+ (Supabase) — no schema changes needed (existing `auth_provider` and nullable `password_hash` columns)

**Integration Points:**
- Google Cloud Console: OAuth 2.0 client credentials (Client ID required for both frontend and backend)
- Existing `AuthService` — add `googleLogin()` and `completeGoogleSignup()` methods
- Existing `AuthController` — add `POST /google` and `POST /google/complete` endpoints
- Existing `JwtService` — reuse for temp token generation/verification
- Existing `SecurityConfig` — `/api/v1/auth/**` already public, no changes needed
- Existing web `AuthContext` — add Google login action
- Existing `HandleInput` component — reuse on choose-handle page
- Existing `LoginForm` / `RegisterForm` — add Google OAuth button

**Google OAuth Configuration:**
- Scopes: `openid`, `email`, `profile`
- Google Client ID: environment variable `GOOGLE_CLIENT_ID`
- Authorized JavaScript origins: `http://localhost:3000` (dev), production domain
- Authorized redirect URIs: not needed (using Google Identity Services popup/One Tap, not server-side redirect)

**Out of Scope:**
- Database migrations (schema already supports OAuth)
- Mobile authentication (Phase 3)
- Rate limiting (deferred from auth spec — applies to all auth endpoints)

---

## Acceptance Criteria

### AC1: Google OAuth — Returning User (Happy Path)
**GIVEN** a user with email `alice@gmail.com` and `auth_provider = 'google'` exists
**WHEN** they click "Sign in with Google" on the login page and complete Google consent
**THEN** the backend verifies the ID token and returns `AuthResponse` with JWT + refresh token
**AND** the frontend stores tokens in memory and redirects to `/[locale]`
**AND** the header shows `@{handle}`

### AC2: Google OAuth — First-Time User (Handle Selection)
**GIVEN** no user with email `bob@gmail.com` exists
**WHEN** they click "Sign in with Google" and complete Google consent
**THEN** the backend returns `{ requiresHandle: true, tempToken: "..." }`
**AND** the frontend redirects to `/[locale]/choose-handle`
**AND** the display name field is pre-filled with the Google profile name
**AND** the handle input is empty and focused

### AC3: Google OAuth — Complete Registration (Happy Path)
**GIVEN** the user is on the choose-handle page with a valid temp token
**WHEN** they enter an available handle `bobsmith` and click "Complete Registration"
**THEN** the backend creates a user with `auth_provider = 'google'`, `password_hash = NULL`
**AND** returns `AuthResponse` with JWT + refresh token
**AND** the frontend stores tokens and redirects to `/[locale]`

### AC4: Google OAuth — Handle Already Taken
**GIVEN** handle `alice` is already taken
**AND** the user is on the choose-handle page
**WHEN** they type `alice` in the handle field and wait for the availability check
**THEN** the HandleInput shows "Handle is already taken" inline
**AND** the "Complete Registration" button remains disabled

### AC5: Google OAuth — Handle Submission Conflict (Race Condition)
**GIVEN** the user submits handle `alice` which was available during the check
**WHEN** another user registers `alice` simultaneously
**THEN** the backend returns 409 Conflict
**AND** the frontend shows an inline error below the handle input
**AND** the user can retry with a different handle

### AC6: Google OAuth — Email Already Registered with Password
**GIVEN** a user with email `carol@gmail.com` and `auth_provider = 'local'` exists
**WHEN** someone clicks "Sign in with Google" with Google email `carol@gmail.com`
**THEN** the backend returns 409 Conflict with "This email is already registered with a password"
**AND** the frontend displays the error on the login page

### AC7: Google OAuth — Temp Token Expired
**GIVEN** the user received a temp token and waited more than 5 minutes
**WHEN** they submit the handle selection form
**THEN** the backend returns 401 Unauthorized with "Session expired. Please try again."
**AND** the frontend redirects to the login page

### AC8: Google OAuth — Invalid ID Token
**GIVEN** an attacker sends a manipulated or expired Google ID token
**WHEN** the backend receives `POST /api/v1/auth/google`
**THEN** ID token verification fails and returns 401 Unauthorized
**AND** no user is created or authenticated

### AC9: Google OAuth — User Cancels Consent
**GIVEN** the user clicks "Sign in with Google"
**WHEN** they close the Google consent popup without completing it
**THEN** the frontend shows a dismissible "Sign-in cancelled" message
**AND** the user remains on the login page

### AC10: Google OAuth — Localization
**GIVEN** the locale is PT-BR
**WHEN** the user visits `/pt-BR/login`
**THEN** the Google button shows "Entrar com Google"
**AND** all error messages and the choose-handle page are in Portuguese

### AC11: Google OAuth — Loading States
**GIVEN** the user clicks "Sign in with Google"
**THEN** the button shows a loading state and is disabled
**WHEN** the OAuth flow completes (success or failure)
**THEN** the button returns to its normal state

### AC12: Google OAuth — Display Name Editable
**GIVEN** the user is on the choose-handle page with Google name "Bob Smith" pre-filled
**WHEN** they change the display name to "Bobby S" and submit
**THEN** the user is created with `display_name = 'Bobby S'`

---

## Implementation Approach

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       WEB (Next.js)                           │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────────┐ │
│  │  Login   │  │ Register │  │   /[locale]/choose-handle   │ │
│  │  Page    │  │  Page    │  │   (new page)                │ │
│  │ +Google  │  │ +Google  │  │   HandleInput + displayName │ │
│  │  Button  │  │  Button  │  │   + Complete Registration   │ │
│  └────┬─────┘  └────┬─────┘  └──────────┬──────────────────┘ │
│       │              │                   │                    │
│  ┌────▼──────────────▼───────────────────▼──────────────────┐ │
│  │     GoogleLoginButton (uses @react-oauth/google)         │ │
│  │     → Gets Google ID token from consent flow             │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │              AuthContext (extended)                       │ │
│  │  + googleLogin(idToken) → calls /auth/google             │ │
│  │  + completeGoogleSignup(tempToken, handle, displayName)  │ │
│  └────────────────────────┬─────────────────────────────────┘ │
└───────────────────────────┼───────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼───────────────────────────────────┐
│                    BACKEND (Spring Boot)                       │
│                                                               │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │              AuthController (extended)                    │ │
│  │  POST /api/v1/auth/google          → GoogleLoginRequest  │ │
│  │  POST /api/v1/auth/google/complete → CompleteGoogleReq   │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │              AuthService (extended)                       │ │
│  │  + googleLogin(idToken)                                  │ │
│  │  + completeGoogleSignup(tempToken, handle, displayName)  │ │
│  └───────┬──────────────────┬───────────────────────────────┘ │
│          │                  │                                 │
│  ┌───────▼───────┐  ┌──────▼──────────────────────────────┐  │
│  │GoogleTokenVeri-│  │  JwtService (reused)                │  │
│  │fier (new)     │  │  + generateTempToken(sub,email,name) │  │
│  │ verifies via  │  │  + parseTempToken(token)             │  │
│  │ Google JWKS   │  │  (reuses existing HMAC-SHA256 key)   │  │
│  └───────────────┘  └─────────────────────────────────────┘  │
│                                                               │
│  Existing: UserRepository, RefreshTokenRepository, Security   │
│  (no changes needed — /api/v1/auth/** already public)         │
└───────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Google ID token verification on backend** — The frontend obtains a Google ID token via Google Identity Services. The backend verifies it using Google's public keys (JWKS endpoint). This prevents token forgery and ensures the email/name claims are trustworthy.

2. **Temp token for two-step registration** — Instead of creating a partial user record, the backend issues a short-lived JWT (5 min) containing the Google user's claims (`sub`, `email`, `name`). The frontend passes this back along with the chosen handle to complete registration. This keeps the flow stateless and avoids orphaned user records.

3. **Reuse existing JwtService** — Temp tokens are signed with the same HMAC-SHA256 key as access tokens but with a distinct `type: "google_signup"` claim and 5-minute expiry. No new signing infrastructure needed.

4. **GoogleTokenVerifier as a separate service** — Encapsulates Google's ID token verification logic. Uses `google-api-client` library which handles JWKS fetching, caching, and signature verification. Configured with the Google Client ID from environment variables.

5. **No database migration** — The existing `users` table already has `auth_provider VARCHAR(20)` (default `'local'`) and nullable `password_hash`. Google OAuth users simply have `auth_provider = 'google'` and `password_hash = NULL`.

### Test Strategy

- [x] Full TDD (tests first for all code)
  - Unit tests: `GoogleTokenVerifier` (mocked Google API), `AuthService.googleLogin()`, `AuthService.completeGoogleSignup()`
  - Controller tests: MockMvc tests for `POST /google` and `POST /google/complete` (all scenarios)
  - Web: Component tests for `GoogleLoginButton`, `ChooseHandlePage`, updated `LoginForm`/`RegisterForm`
  - Coverage target: >80% backend, >70% frontend Google OAuth code

### File Changes

**New (Backend):**
- `backend/src/main/java/com/lucasxf/ed/service/GoogleTokenVerifier.java` — Verifies Google ID tokens using JWKS
- `backend/src/main/java/com/lucasxf/ed/dto/GoogleLoginRequest.java` — `{ idToken }` request DTO
- `backend/src/main/java/com/lucasxf/ed/dto/GoogleLoginResponse.java` — `{ requiresHandle, tempToken, accessToken, refreshToken, ... }` response DTO
- `backend/src/main/java/com/lucasxf/ed/dto/CompleteGoogleSignupRequest.java` — `{ tempToken, handle, displayName }` request DTO

**New (Backend — Tests):**
- `backend/src/test/java/com/lucasxf/ed/service/GoogleTokenVerifierTest.java`
- `backend/src/test/java/com/lucasxf/ed/service/AuthServiceGoogleTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/AuthControllerGoogleTest.java`

**New (Web):**
- `web/src/app/[locale]/choose-handle/page.tsx` — Handle selection page for first-time Google OAuth users
- `web/src/components/auth/GoogleLoginButton.tsx` — Google OAuth button using `@react-oauth/google`
- `web/src/components/auth/ChooseHandleForm.tsx` — Handle selection form component

**Modified (Backend):**
- `backend/pom.xml` — Add `google-api-client` dependency
- `backend/src/main/java/com/lucasxf/ed/service/AuthService.java` — Add `googleLogin()` and `completeGoogleSignup()` methods
- `backend/src/main/java/com/lucasxf/ed/service/JwtService.java` — Add `generateTempToken()` and `parseTempToken()` methods
- `backend/src/main/java/com/lucasxf/ed/controller/AuthController.java` — Add `POST /google` and `POST /google/complete` endpoints
- `backend/src/main/java/com/lucasxf/ed/config/AuthProperties.java` — Add `google.clientId` property
- `backend/src/main/resources/application.yml` — Add `auth.google.client-id` config
- `backend/src/main/resources/application-test.yml` — Add test Google client ID

**Modified (Web):**
- `web/package.json` — Add `@react-oauth/google` dependency
- `web/src/app/layout.tsx` — Wrap with `GoogleOAuthProvider` (requires client ID)
- `web/src/app/[locale]/login/page.tsx` — Add `GoogleLoginButton` below login form
- `web/src/app/[locale]/register/page.tsx` — Add `GoogleLoginButton` below register form
- `web/src/contexts/AuthContext.tsx` — Add `googleLogin()` and `completeGoogleSignup()` actions
- `web/src/lib/auth.ts` — Add `googleLoginApi()` and `completeGoogleSignupApi()` functions
- `web/src/locales/en.json` — Add Google OAuth strings
- `web/src/locales/pt-BR.json` — Add Google OAuth strings

**Migrations:** None (existing schema supports OAuth)

---

## Dependencies

**Blocked by:** None (backend auth PR #15 merged, web auth PR #17 in review)

**Blocks:**
- No direct blockers — POK CRUD can proceed in parallel once web auth merges

**External:**
- Google Cloud Console project with OAuth 2.0 Client ID configured
- Environment variable `GOOGLE_CLIENT_ID` set in dev/production
- Backend dependency: `com.google.api-client:google-api-client` (Maven)
- Web dependency: `@react-oauth/google` (npm)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `hash`: message

### Architectural Decisions

**Decision: [Title]**
- **Options:** [A, B, C]
- **Chosen:** [B]
- **Rationale:** [Why]

### Deviations from Spec
- [Any changes from original plan and why]

### Lessons Learned
- [What worked, what to do differently]
