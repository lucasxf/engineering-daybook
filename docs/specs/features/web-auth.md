# Web Authentication

> **Status:** In Progress
> **Created:** 2026-02-13
> **Implemented:** _pending_

---

## Context

The backend authentication system (implemented in PR #15, merged) provides JWT-based authentication with email/password registration, login, token refresh, and logout. However, users currently have no way to interact with these endpoints from the web application.

**User Problem:** Engineers need to create accounts and securely access the Engineering Daybook web application to capture and organize their knowledge. Without authentication UI, the product is unusable.

**Related:**
- Backend auth spec: `docs/specs/features/authentication.md` (status: Implemented, backend only)
- [ROADMAP.md — Milestone 1.1: Authentication](../../ROADMAP.md)
- [REQUIREMENTS.md — AUTH-01 through AUTH-04](../../REQUIREMENTS.md)
- [ARCHITECTURE.md — Section 7: Security Architecture](../../ARCHITECTURE.md)

**Backend API Base URL:** `/api/v1/auth`

**Backend Endpoints (already implemented):**
- `POST /api/v1/auth/register` — Register with email, password, displayName, handle → `AuthResponse`
- `POST /api/v1/auth/login` — Login with email, password → `AuthResponse`
- `POST /api/v1/auth/refresh` — Refresh token rotation → `AuthResponse`
- `POST /api/v1/auth/logout` — Logout with refreshToken → `204 No Content`
- `GET /api/v1/auth/handle/available?h={handle}` — Handle availability check → `HandleAvailabilityResponse`

**AuthResponse shape:**
```json
{
  "accessToken": "jwt...",
  "refreshToken": "token_value",
  "handle": "lucasxf",
  "userId": "uuid",
  "expiresIn": 900
}
```

---

## Requirements

### Functional

#### Registration Page (`/[locale]/register`)

- [ ] FR1.1 [Must Have]: Display registration form with fields: email, password, confirm password, display name, handle
- [ ] FR1.2 [Must Have]: Validate email format client-side (basic RFC 5322)
- [ ] FR1.3 [Must Have]: Validate password strength: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
- [ ] FR1.4 [Must Have]: Validate confirm password matches password
- [ ] FR1.5 [Must Have]: Validate handle format client-side: 3-30 chars, lowercase alphanumeric + hyphens, pattern `^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$`
- [ ] FR1.6 [Must Have]: Check handle availability in real-time via `GET /api/v1/auth/handle/available?h={value}` (debounced 500ms)
- [ ] FR1.7 [Must Have]: Display inline validation feedback for each field (error messages below fields)
- [ ] FR1.8 [Must Have]: Disable submit button while form is invalid or submitting
- [ ] FR1.9 [Must Have]: Show loading spinner on submit button during registration
- [ ] FR1.10 [Must Have]: On successful registration (returns AuthResponse directly), store tokens and redirect to home/dashboard
- [ ] FR1.11 [Must Have]: Display server-side error messages (409: "Email already in use" / "Handle taken", 400: validation errors)
- [ ] FR1.12 [Should Have]: Show password strength indicator (weak/medium/strong)
- [ ] FR1.13 [Should Have]: Toggle password visibility (eye icon)
- [ ] FR1.14 [Must Have]: Link to login page: "Already have an account? Log in"

#### Login Page (`/[locale]/login`)

- [ ] FR2.1 [Must Have]: Display login form with fields: email, password
- [ ] FR2.2 [Must Have]: Validate email format and password not empty client-side
- [ ] FR2.3 [Must Have]: Disable submit button while form is invalid or submitting
- [ ] FR2.4 [Must Have]: Show loading spinner on submit button during login
- [ ] FR2.5 [Must Have]: On successful login, store access token in memory, refresh token securely (see Technical Constraints)
- [ ] FR2.6 [Must Have]: Parse JWT access token to extract user data (userId, email, handle) and populate auth context
- [ ] FR2.7 [Must Have]: Redirect to home/dashboard after successful login
- [ ] FR2.8 [Must Have]: Display server-side error messages (401: "Invalid email or password")
- [ ] FR2.9 [Should Have]: Toggle password visibility (eye icon)
- [ ] FR2.10 [Must Have]: Link to register page: "Don't have an account? Sign up"

#### Auth Middleware & Protected Routes

- [ ] FR3.1 [Must Have]: Protect all routes except `/login`, `/register`, and root landing page
- [ ] FR3.2 [Must Have]: Redirect unauthenticated users to `/login?redirect={original-path}`
- [ ] FR3.3 [Must Have]: After successful login, redirect to `?redirect` param if present, otherwise home
- [ ] FR3.4 [Must Have]: If access token expired but refresh token valid, call `/api/v1/auth/refresh` transparently
- [ ] FR3.5 [Must Have]: If refresh fails (401), clear tokens and redirect to `/login`
- [ ] FR3.6 [Should Have]: Prevent authenticated users from accessing `/login` and `/register` (redirect to home)

#### Token Management

- [ ] FR4.1 [Must Have]: Store access token in memory only (React context/state — never localStorage/sessionStorage)
- [ ] FR4.2 [Must Have]: Store refresh token securely (see Technical Constraints for storage decision)
- [ ] FR4.3 [Must Have]: Attach access token to all API requests via `Authorization: Bearer {token}` header
- [ ] FR4.4 [Must Have]: On 401 response from any API call, attempt token refresh once, then retry original request
- [ ] FR4.5 [Must Have]: If token refresh fails, clear auth state and redirect to `/login`
- [ ] FR4.6 [Must Have]: On logout, call `POST /api/v1/auth/logout`, clear all tokens, redirect to `/login`
- [ ] FR4.7 [Should Have]: Proactively refresh access token when <2 minutes remain before expiry

#### Auth State Management

- [ ] FR5.1 [Must Have]: Create AuthContext providing: `user` (userId, email, handle, displayName), `isAuthenticated`, `isLoading`
- [ ] FR5.2 [Must Have]: Create `useAuth()` hook to access auth state and actions (`login`, `register`, `logout`)
- [ ] FR5.3 [Must Have]: On app initialization, check for existing refresh token and attempt silent refresh
- [ ] FR5.4 [Should Have]: Set `isLoading: true` during initial token check to prevent flash of login page

#### UI & Internationalization

- [ ] FR6.1 [Must Have]: All form labels, buttons, error messages in EN and PT-BR via next-intl
- [ ] FR6.2 [Must Have]: Display LanguageToggle and ThemeToggle on auth pages
- [ ] FR6.3 [Should Have]: Responsive design: centered form on desktop, full-width on mobile
- [ ] FR6.4 [Should Have]: Accessible forms: proper `<label>`, `aria-describedby` for errors, keyboard navigation, focus indicators

#### Authenticated Header

- [ ] FR7.1 [Must Have]: Display `@{handle}` in header when authenticated
- [ ] FR7.2 [Must Have]: Logout button/link in header when authenticated
- [ ] FR7.3 [Could Have]: Dropdown menu with "Profile", "Settings", "Logout" (can start with just logout)

### Non-Functional

#### Security

- [ ] NFR1: Access tokens MUST NOT be stored in localStorage or sessionStorage (XSS risk)
- [ ] NFR2: Refresh token storage must minimize XSS exposure (see Technical Constraints)
- [ ] NFR3: Password fields must use `autoComplete="new-password"` (register) or `autoComplete="current-password"` (login)
- [ ] NFR4: All API calls must use HTTPS in production

#### Performance

- [ ] NFR5: Handle availability check debounced at 500ms
- [ ] NFR6: Initial auth check (silent refresh) must complete within 1 second
- [ ] NFR7: Loading state shown after 200ms delay (avoid flash for fast responses)

#### Accessibility

- [ ] NFR8: Forms must meet WCAG 2.1 AA (keyboard navigation, focus indicators, screen reader support)
- [ ] NFR9: Error messages announced to screen readers via `aria-live` regions
- [ ] NFR10: Password toggle must have accessible label ("Show password" / "Hide password")

#### Internationalization

- [ ] NFR11: All user-facing text in EN and PT-BR via next-intl
- [ ] NFR12: Backend error messages (English) mapped to translated frontend messages

### Deferred (Out of Scope)

- Google OAuth login (separate spec/PR)
- Password reset/recovery flow (separate spec)
- Mobile authentication (Phase 3)
- Email verification flow
- Multi-factor authentication (Phase 2+)
- "Remember me" extended session
- User avatar display

---

## Technical Constraints

**Stack:** Web (Next.js frontend only — backend already implemented)

**Technologies:**
- Next.js 14.2+ (App Router)
- TypeScript 5+
- Tailwind CSS 3+
- next-intl 3.x (i18n)
- next-themes 0.4+ (dark mode)
- New dependencies needed: form validation library (react-hook-form + zod recommended), JWT decode library

**Integration Points:**
- Backend REST API at `/api/v1/auth/*` (CORS configured for `localhost:3000`)
- Existing i18n middleware (`web/src/middleware.ts`) — must be extended for auth
- Existing locale layout (`web/src/app/[locale]/layout.tsx`) — header updates for auth state
- Existing UI components: `Button`, `ThemeToggle`, `LanguageToggle`, `cn()` utility

**Key Architectural Decision: Refresh Token Storage**

The backend currently returns refresh tokens **in the JSON response body** (not as httpOnly cookies). This creates a storage challenge on the web client:

| Option | Security | Complexity | Recommendation |
|--------|----------|------------|----------------|
| A. httpOnly cookie (backend sets `Set-Cookie` header) | Best — JS can't access | Medium — requires backend change | Preferred long-term |
| B. localStorage | Vulnerable to XSS | Low | Not recommended |
| C. In-memory only (like access token) | Good — but lost on page refresh/tab close | Low | Acceptable for MVP |

**Recommended approach for this PR:** **Option C (in-memory)** — Store both tokens in React context. On page refresh, the user will need to re-authenticate. This avoids a backend change and keeps the PR scoped to frontend-only. A follow-up PR can add httpOnly cookie support (Option A) by adjusting the backend `/login` and `/refresh` endpoints to set `Set-Cookie` headers.

**Out of Scope:**
- Backend code changes (this spec is frontend-only)
- Google OAuth UI (separate spec)
- Mobile auth (Phase 3)

---

## Acceptance Criteria

### AC1: Registration — Happy Path
**GIVEN** a visitor on the `/register` page
**WHEN** they enter valid email "user@example.com", password "SecurePass1", confirm "SecurePass1", display name "John Doe", and available handle "johndoe"
**AND** click "Sign Up"
**THEN** `POST /api/v1/auth/register` is called with the correct payload
**AND** the user is redirected to the home page
**AND** the header shows `@johndoe`
**AND** auth context contains the user data

### AC2: Registration — Handle Availability Check
**GIVEN** a visitor on the `/register` page
**WHEN** they type "johndoe" in the handle field and wait 500ms
**THEN** `GET /api/v1/auth/handle/available?h=johndoe` is called
**AND** "Handle available" or "Handle taken" feedback is shown inline

### AC3: Registration — Client-Side Validation
**GIVEN** a visitor on the `/register` page
**WHEN** they enter invalid email "notanemail"
**THEN** inline error "Invalid email format" is shown
**WHEN** they enter password "weak"
**THEN** inline error about password requirements is shown
**WHEN** confirm password doesn't match
**THEN** inline error "Passwords do not match" is shown
**WHEN** handle is "AB" (too short, uppercase)
**THEN** inline error about handle format is shown
**AND** the submit button remains disabled

### AC4: Registration — Server Error (Duplicate Email/Handle)
**GIVEN** a visitor submits the registration form
**WHEN** `POST /api/v1/auth/register` returns 409 "Email already in use"
**THEN** the error message is displayed
**AND** the form remains on the register page with the submit button re-enabled

### AC5: Login — Happy Path
**GIVEN** a registered user on the `/login` page
**WHEN** they enter valid email and password and click "Log In"
**THEN** `POST /api/v1/auth/login` is called
**AND** access token and refresh token are stored in memory
**AND** user data (from JWT) is stored in auth context
**AND** the user is redirected to the home page

### AC6: Login — Invalid Credentials
**GIVEN** a visitor on the `/login` page
**WHEN** they submit with wrong credentials
**AND** `POST /api/v1/auth/login` returns 401
**THEN** error message "Invalid email or password" is displayed
**AND** the password field is cleared

### AC7: Protected Route — Unauthenticated
**GIVEN** a visitor who is not logged in
**WHEN** they navigate to a protected route (e.g., `/dashboard`)
**THEN** they are redirected to `/login?redirect=/dashboard`

### AC8: Login — Redirect After Auth
**GIVEN** a visitor redirected to `/login?redirect=/dashboard`
**WHEN** they log in successfully
**THEN** they are redirected to `/dashboard` (not the default home)

### AC9: Authenticated Route — Valid Session
**GIVEN** a logged-in user with valid access token
**WHEN** they navigate to a protected route
**THEN** the page renders without redirect
**AND** the header shows their `@handle`

### AC10: Token Refresh — Transparent Renewal
**GIVEN** a logged-in user whose access token has expired
**WHEN** an API call returns 401
**THEN** `POST /api/v1/auth/refresh` is called automatically
**AND** the original request is retried with the new access token
**AND** the user sees no interruption

### AC11: Token Refresh — Failure (Session Expired)
**GIVEN** a logged-in user whose refresh token is also expired
**WHEN** token refresh returns 401
**THEN** auth state is cleared
**AND** the user is redirected to `/login`

### AC12: Logout
**GIVEN** a logged-in user
**WHEN** they click "Logout" in the header
**THEN** `POST /api/v1/auth/logout` is called with the refresh token
**AND** all tokens are cleared from memory
**AND** the user is redirected to `/login`
**AND** accessing a protected route requires re-authentication

### AC13: Internationalization — PT-BR
**GIVEN** the locale is set to PT-BR
**WHEN** the user visits `/pt-BR/login` or `/pt-BR/register`
**THEN** all labels, buttons, and error messages are displayed in Portuguese

### AC14: Accessibility — Keyboard Navigation
**GIVEN** a user on the `/login` page
**WHEN** they navigate using Tab
**THEN** focus moves through all interactive elements with visible focus indicators
**AND** the form can be submitted with Enter

### AC15: Password Visibility Toggle
**GIVEN** a user on the `/login` page
**WHEN** they click the password visibility toggle
**THEN** the password field alternates between `type="password"` and `type="text"`
**AND** the toggle has an accessible label

### AC16: Auth Pages — Already Authenticated
**GIVEN** a logged-in user
**WHEN** they navigate to `/login` or `/register`
**THEN** they are redirected to the home page

---

## Implementation Approach

### Architecture

```
web/src/
├── app/[locale]/
│   ├── login/page.tsx              # Login page (public)
│   ├── register/page.tsx           # Register page (public)
│   └── layout.tsx                  # Updated: conditional header (auth state)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Login form with validation
│   │   ├── RegisterForm.tsx        # Registration form with validation
│   │   ├── HandleInput.tsx         # Handle field with availability check
│   │   └── PasswordInput.tsx       # Password field with visibility toggle
│   └── ui/
│       ├── Input.tsx               # Reusable text input component
│       ├── Label.tsx               # Reusable label component
│       ├── FormField.tsx           # Field wrapper (label + input + error)
│       └── Spinner.tsx             # Loading spinner
├── contexts/
│   └── AuthContext.tsx             # Auth state provider
├── hooks/
│   ├── useAuth.ts                  # Auth state + actions hook
│   └── useHandleAvailability.ts    # Debounced handle check hook
├── lib/
│   ├── api.ts                      # HTTP client (fetch wrapper with auth interceptor)
│   ├── auth.ts                     # Auth API functions (login, register, refresh, logout)
│   └── validations.ts             # Shared validation schemas (zod)
├── locales/
│   ├── en.json                     # Updated: auth strings
│   └── pt-BR.json                  # Updated: auth strings
└── middleware.ts                   # Updated: auth + i18n middleware
```

### Key Patterns

1. **API Client (`lib/api.ts`):** Fetch wrapper that attaches `Authorization: Bearer` header, handles 401 with automatic refresh-and-retry, and provides typed request/response helpers.

2. **Auth Context (`contexts/AuthContext.tsx`):** React context with provider that holds user state, tokens (in memory), and exposes `login`, `register`, `logout`, `refresh` actions. Wraps the app at the root layout level.

3. **Middleware (`middleware.ts`):** Extended to check for auth state. Since tokens are in-memory only (MVP), middleware can only check if the user is on a public route. Client-side protection via AuthContext handles the actual redirect logic.

4. **Form Validation:** react-hook-form + zod for client-side validation. Schemas in `lib/validations.ts` mirror backend validation rules.

### Test Strategy

- [ ] Partial TDD (tests first for: auth context, API client, validation logic, form components)
- Testing tools: Vitest + React Testing Library (to be added as dev dependencies)
- Coverage target: >70% for auth-related code
- Key test areas:
  - Auth context: login/logout/refresh flows, state transitions
  - API client: token attachment, 401 retry logic
  - Form components: validation, submit, error display
  - Middleware: redirect logic for public/protected routes

### File Changes

**New:**
- `web/src/app/[locale]/login/page.tsx` — Login page
- `web/src/app/[locale]/register/page.tsx` — Registration page
- `web/src/components/auth/LoginForm.tsx` — Login form component
- `web/src/components/auth/RegisterForm.tsx` — Registration form component
- `web/src/components/auth/HandleInput.tsx` — Handle input with availability check
- `web/src/components/auth/PasswordInput.tsx` — Password input with toggle
- `web/src/components/ui/Input.tsx` — Reusable input component
- `web/src/components/ui/Label.tsx` — Reusable label component
- `web/src/components/ui/FormField.tsx` — Field wrapper (label + input + error)
- `web/src/components/ui/Spinner.tsx` — Loading spinner component
- `web/src/contexts/AuthContext.tsx` — Auth state provider and context
- `web/src/hooks/useAuth.ts` — Auth hook
- `web/src/hooks/useHandleAvailability.ts` — Debounced handle availability hook
- `web/src/lib/api.ts` — HTTP client with auth interceptor
- `web/src/lib/auth.ts` — Auth API functions
- `web/src/lib/validations.ts` — Zod validation schemas

**Modified:**
- `web/src/middleware.ts` — Extend with auth route logic (public vs protected)
- `web/src/app/[locale]/layout.tsx` — Update header to show auth state (handle + logout)
- `web/src/app/layout.tsx` — Wrap with AuthProvider
- `web/src/locales/en.json` — Add auth-related strings
- `web/src/locales/pt-BR.json` — Add auth-related strings
- `web/package.json` — Add new dependencies

**New Dependencies:**
- `react-hook-form` — Form state management
- `@hookform/resolvers` — Zod resolver for react-hook-form
- `zod` — Schema validation
- `jwt-decode` — JWT payload extraction (lightweight, no verification)

**Dev Dependencies:**
- `vitest` — Test runner
- `@testing-library/react` — Component testing
- `@testing-library/jest-dom` — DOM assertions
- `@testing-library/user-event` — User interaction simulation
- `jsdom` — Browser environment for tests

---

## Dependencies

**Blocked by:** None (backend auth is implemented and merged)

**Blocks:**
- POK CRUD frontend (needs auth context to identify user)
- Google OAuth UI (needs auth pages and context as foundation)
- All authenticated frontend features

**External:**
- Backend must be running locally for integration testing (`localhost:8080`)
- No infrastructure changes needed

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `hash`: message

### Architectural Decisions

**Decision: Refresh Token Storage (MVP)**
- **Options:** httpOnly cookie (backend change), localStorage, in-memory only
- **Chosen:** _pending_
- **Rationale:** _pending_

### Deviations from Spec
- [Any changes from original plan and why]

### Lessons Learned
- [What worked, what to do differently]
