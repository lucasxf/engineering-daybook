# Password Reset Flow

> **Status:** Implemented
> **Created:** 2026-02-21
> **Implemented:** 2026-02-21

---

## Context

Learnimo uses email/password as its primary authentication mechanism. There is currently no way for a user to recover access if they forget their password — they are permanently locked out with no self-service recovery path. This is a blocking usability gap now that the app is live at learnimo.net and the author is in the active daily-use phase (Phase 1 exit criterion). A lost password at this stage would interrupt the 1-week usage requirement entirely.

This spec implements a secure, time-limited, self-service reset flow: the user provides their registered email, receives a one-time reset link, follows it, and sets a new password. The flow is fully stateless from the user's perspective and requires no support intervention.

**Key constraints:**
- **Email/password users only.** Google OAuth users (`auth_provider = 'google'`, `password_hash IS NULL`) have no password to reset; they must be silently handled (no email sent, same generic response).
- **No email enumeration.** The API response must be identical regardless of whether the email is registered, unregistered, or a Google-only account.
- **Custom JWT infrastructure.** Reset tokens follow the same pattern as refresh tokens: stored in the DB as SHA-256 hashes, raw value transmitted only via email.

**Related:**
- [REQUIREMENTS.md — AUTH-03](../../REQUIREMENTS.md)
- [ROADMAP.md — Milestone 1.1.5](../../ROADMAP.md)
- [docs/specs/features/authentication.md](./authentication.md)

---

## Requirements

### Functional

- [ ] FR1: `POST /auth/password-reset/request` accepts an email and initiates the reset flow. Always returns `200 OK` with the same generic body, regardless of whether the email is registered. *(Must Have)*
- [ ] FR2: When a reset request is received for a known email/password account, the system generates a cryptographically secure token (32 bytes from `SecureRandom`, URL-safe Base64-encoded), stores its SHA-256 hash in the DB alongside the user ID and expiration timestamp, and sends the raw token to the user's email in a reset link. *(Must Have)*
- [ ] FR3: The reset email is sent in the user's registered locale (`users.locale`). It contains a link of the form `https://learnimo.net/{locale}/reset-password?token={raw_token}`, a 1-hour expiry notice, and a note that if the user did not request this they can safely ignore the email. *(Must Have)*
- [ ] FR4: Reset tokens expire 1 hour after generation. Expired tokens are rejected with a generic "link invalid or expired" error. *(Must Have)*
- [ ] FR5: Each reset token is invalidated immediately upon successful password change (set `used_at` timestamp). Used tokens are rejected with the same generic error as expired tokens — no distinction between the two. *(Must Have)*
- [ ] FR6: `GET /auth/password-reset/validate?token={token}` validates a token (exists, not expired, not used) without consuming it. The web UI calls this on page load so the user sees an immediate error for stale links rather than discovering it only after submitting a new password. *(Must Have)*
- [ ] FR7: `POST /auth/password-reset/confirm` accepts the raw token and a new password. On success: (a) hashes the new password with bcrypt, (b) updates `users.password_hash`, (c) marks the reset token as used (`used_at`), (d) revokes all existing refresh tokens for that user (forces re-authentication on all devices), and (e) returns `200 OK`. *(Must Have)*
- [ ] FR8: The new password must satisfy the same rules as registration: 8–128 characters, at least one uppercase letter, one lowercase letter, and one number. Validated on the backend; frontend may provide inline feedback as a convenience. *(Must Have)*
- [ ] FR9: If a reset request is received for a Google OAuth account (`auth_provider = 'google'`), no email is sent and the system returns the same generic `200 OK` response. No information about the account type is disclosed. *(Must Have)*
- [ ] FR10: When a user requests a new reset before using a previous link, all prior pending tokens for that user are invalidated. Only the most recently issued token is valid. *(Should Have)*
- [ ] FR11: The login page includes a visible "Forgot password?" link (no interaction required to reveal it) that navigates to `/{locale}/forgot-password`. *(Must Have)*
- [ ] FR12: `/{locale}/forgot-password` — email input, submit button, and a generic confirmation message displayed after submission (same regardless of email status). *(Must Have)*
- [ ] FR13: `/{locale}/reset-password?token={token}` — calls the validate endpoint on load; shows error state if token is invalid/expired with a "Request a new link" button; renders the new-password form if valid; redirects to login with a success message after confirming. *(Must Have)*
- [ ] FR14: `POST /auth/password-reset/request` is rate-limited: included in the existing 10-req/min-per-IP global auth rate limit, plus a per-email cap of 3 reset requests per hour (no new token generated, no email sent, same `200 OK` response). *(Should Have)*

### Non-Functional

- [ ] NFR1 (SEC): Identical response for all email cases — registered, unregistered, Google-only. No email enumeration. *(Must Have)*
- [ ] NFR2 (SEC): Token entropy: 32 bytes from `SecureRandom`, URL-safe Base64-encoded. Stored as SHA-256 hex hash. *(Must Have)*
- [ ] NFR3 (SEC): Token expiry: 1 hour. Single-use: `used_at` set immediately on successful confirm. *(Must Have)*
- [ ] NFR4 (SEC): All active refresh tokens revoked on successful password reset. *(Must Have)*
- [ ] NFR5 (SEC): Used vs expired tokens return the same generic error — no oracle attack surface. *(Must Have)*
- [ ] NFR6 (SEC): Raw token never logged, never stored, never returned by any API endpoint. Transmitted only in the email. *(Must Have)*
- [ ] NFR7 (PERF): `POST /request` < 500ms (consistent regardless of email validity — prevents timing-based enumeration). *(Must Have)*
- [ ] NFR8 (PERF): `GET /validate` < 200ms. `POST /confirm` < 500ms (includes bcrypt). *(Must Have)*
- [ ] NFR9 (ACC): All form fields have associated `<label>` elements. Error and success messages use `role="alert"` or `aria-live="polite"`. Focus moves to the message after submission. Password fields have show/hide toggles with accessible labels. *(Must Have)*
- [ ] NFR10 (I18N): All user-facing strings defined in both `en.json` and `pt-BR.json` under `auth.passwordReset.*`. Reset email sent in the user's registered locale. *(Must Have)*
- [ ] NFR11 (TEST): Backend test coverage > 80% on new reset classes (unit + integration with Testcontainers). Web: component tests for `ForgotPasswordPage` and `ResetPasswordPage`. *(Must Have)*

---

## Technical Constraints

**Stack:** Backend (Java 21 / Spring Boot 4) + Web (Next.js 14 / TypeScript)

**Technologies:**
- Backend: Spring Boot 4, Spring Security 6, Flyway, JJWT 0.13.0, `spring-boot-starter-mail` (to be added)
- Web: Next.js 14, TypeScript 5, Tailwind CSS, next-intl
- Email provider: SMTP relay (Resend recommended — supports SMTP, no SDK needed, generous free tier)
- Database: PostgreSQL 15 (Supabase), new `password_reset_tokens` table (Flyway V7)

**Integration Points:**
- `UserRepository` — `findByEmail` to look up the account
- `RefreshTokenRepository.revokeAllByUserId` — used on successful reset (FR7d); already exists
- `JwtService` — token generation/hashing pattern already established; extend with reset token helpers OR handle directly in `PasswordResetService` using the same `SecureRandom` + SHA-256 approach
- `SecurityConfig` — must permit `/api/v1/auth/password-reset/**` as public endpoints
- `AuthProperties` / `application.yml` — add `password-reset-token-expiry` and SMTP config

**Out of Scope:**
- Password change while authenticated (separate `PUT /users/me/password` endpoint, Phase 2+)
- Account linking (add password to Google-only account)
- Email verification after registration
- SMS / OTP reset
- Mobile app reset flow (Phase 3)
- Admin-initiated password reset
- Password history enforcement (new password may equal old password)
- CAPTCHA / bot protection (rate limiting is sufficient for MVP)
- Audit trail entry for password reset events

---

## Acceptance Criteria

### AC1 — Happy path: request reset
**GIVEN** a user registered with email/password (`auth_provider = 'local'`)
**WHEN** they submit their email on the forgot-password page
**THEN** the system creates a reset token (SHA-256 hash stored, 1h expiry), sends a reset email in the user's registered locale, and the page displays the generic confirmation message

### AC2 — Happy path: set new password
**GIVEN** a user with a valid (unused, non-expired) reset token
**WHEN** they open the reset link, the page loads the new-password form, they enter a valid password, and submit
**THEN** the password is updated (bcrypt hash), the token is marked used, all active refresh tokens are revoked, and the user is redirected to login with a success message

### AC3 — New password works immediately
**GIVEN** a user who just completed a successful password reset
**WHEN** they submit their email and new password on the login page
**THEN** they receive a valid JWT session and are authenticated

### AC4 — No enumeration: unknown email
**GIVEN** an email with no account in learnimo
**WHEN** a reset is requested for that email
**THEN** the API returns `200 OK` with the same generic body; no email is sent; no observable difference from a successful request

### AC5 — No enumeration: Google OAuth email
**GIVEN** an email registered with `auth_provider = 'google'`
**WHEN** a reset is requested for that email
**THEN** the API returns `200 OK` with the same generic body; no email is sent; no hint about the account type is disclosed

### AC6 — Expired token rejected
**GIVEN** a reset token generated more than 1 hour ago
**WHEN** the user opens the reset link (GET validate) or submits the confirm form (POST confirm)
**THEN** the response is `400 Bad Request` with a generic "link invalid or expired" message; the reset-password page shows the error state with a "Request a new link" button

### AC7 — Used token rejected
**GIVEN** a reset token that was already used to change a password
**WHEN** the user attempts to use the same link again (GET validate or POST confirm)
**THEN** the response is `400 Bad Request` with the same generic "link invalid or expired" message as AC6 (no distinction between expired and used)

### AC8 — Malformed token rejected
**GIVEN** a URL with a token that has no matching DB record
**WHEN** GET validate or POST confirm is called with that token
**THEN** the response is `400 Bad Request` with the same generic "link invalid or expired" message

### AC9 — New password fails validation
**GIVEN** a user on the reset-password page with a valid token
**WHEN** they submit a password that violates validation rules (e.g., no uppercase, fewer than 8 characters)
**THEN** the server returns `400 Bad Request` with a validation error; the token remains valid; the form can be resubmitted with a correct password

### AC10 — Multiple requests invalidate previous tokens
**GIVEN** a user who has a pending reset token (token A)
**WHEN** they request another reset before using token A
**THEN** token B is generated; token A is invalidated; only token B returns a valid GET validate response

### AC11 — Sessions invalidated after reset
**GIVEN** a user logged in on two devices (two active refresh tokens) who resets their password
**WHEN** either device attempts to use its refresh token after the reset
**THEN** the refresh endpoint returns `401 Unauthorized` for both, forcing re-authentication

### AC12 — IP rate limit
**GIVEN** a client IP that has sent 10 auth requests within the last minute
**WHEN** they send an 11th request to `POST /auth/password-reset/request`
**THEN** the server returns `429 Too Many Requests`

### AC13 — Per-email rate limit
**GIVEN** a specific email that has had 3 reset requests within the last hour
**WHEN** a 4th request is made for that email within the same hour
**THEN** no new token is generated, no email is sent, and the API still returns `200 OK` with the generic body

### AC14 — "Forgot password?" link visible on login page
**GIVEN** a user on the login page
**WHEN** they view the page without any interaction
**THEN** the "Forgot password?" / "Esqueceu a senha?" link is visible and navigates to `/{locale}/forgot-password`

### AC15 — Invalid token: reset page shows error state, not form
**GIVEN** a user navigating to a reset link with an expired or invalid token
**WHEN** the page loads and calls `GET /auth/password-reset/validate`
**THEN** the error state is rendered ("Link expired or invalid" + "Request a new link" button) — the new-password form is not shown

### AC16 — i18n EN
**GIVEN** the application locale is EN
**WHEN** any password reset page or email is rendered
**THEN** all strings are displayed in English per `auth.passwordReset.*` keys in `en.json`

### AC17 — i18n PT-BR
**GIVEN** the application locale is PT-BR
**WHEN** any password reset page or email is rendered
**THEN** all strings are in Brazilian Portuguese per `auth.passwordReset.*` keys in `pt-BR.json`; the reset email is sent in PT-BR if `users.locale = 'pt-BR'`

---

## Implementation Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       WEB (Next.js)                         │
│  ┌───────────────────────┐  ┌──────────────────────────┐   │
│  │  ForgotPasswordPage   │  │   ResetPasswordPage      │   │
│  │  /forgot-password     │  │   /reset-password?token= │   │
│  └───────────┬───────────┘  └──────────────┬───────────┘   │
└──────────────┼──────────────────────────────┼───────────────┘
               │ POST /request                │ GET /validate
               │                              │ POST /confirm
┌──────────────┼──────────────────────────────┼───────────────┐
│              │    BACKEND (Spring Boot)      │               │
│  ┌───────────▼──────────────────────────────▼───────────┐   │
│  │               PasswordResetController                 │   │
│  │  POST /api/v1/auth/password-reset/request             │   │
│  │  GET  /api/v1/auth/password-reset/validate?token=     │   │
│  │  POST /api/v1/auth/password-reset/confirm             │   │
│  └───────────────────────┬───────────────────────────────┘   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │               PasswordResetService                    │   │
│  │  + requestReset(email): void                          │   │
│  │  + validateToken(rawToken): void  (throws if invalid) │   │
│  │  + confirmReset(rawToken, newPassword): void          │   │
│  └───┬──────────────────┬───────────────────┬────────────┘   │
│      │                  │                   │                │
│  ┌───▼──────────┐ ┌─────▼──────────┐ ┌─────▼────────────┐   │
│  │UserRepository│ │PwdResetToken   │ │ EmailService     │   │
│  │(findByEmail) │ │Repository      │ │ (sendResetEmail) │   │
│  └──────────────┘ └────────────────┘ └────────┬─────────┘   │
│                                               │              │
│  RefreshTokenRepository.revokeAllByUserId ◄───┘ (on confirm) │
│  (already exists)                            │              │
│                                         ┌────▼───────────┐  │
│                                         │ JavaMailSender │  │
│                                         └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼────────────────────┐
              │  PostgreSQL   │  (Supabase)         │
              │  password_reset_tokens (V7)         │
              │  users.password_hash (updated)      │
              └────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   SMTP Provider    │
                    │   (Resend via      │
                    │   SMTP relay)      │
                    └────────────────────┘
```

### Key Design Decisions

1. **Separate `PasswordResetService`** — not added to `AuthService`. Keeps `AuthService` focused and follows SRP. The reset flow is sufficiently distinct to warrant its own service.

2. **Token pattern mirrors `RefreshToken`** — 32-byte `SecureRandom`, URL-safe Base64, SHA-256 hex hash stored in DB. Raw value sent only in the email. The pattern is already established in `JwtService.generateRefreshToken()` and `JwtService.hashRefreshToken()` — reuse those methods.

3. **Email via `JavaMailSender` + SMTP relay (Resend)** — `spring-boot-starter-mail` provides `JavaMailSender`. Resend supports SMTP out-of-the-box with no SDK required. Configuration is provider-agnostic (just SMTP host/port/credentials), making it trivial to switch providers later. Email bodies as simple HTML strings in the service (no template engine needed for MVP).

4. **`password_reset_tokens` table** — new Flyway V7 migration. Columns: `id`, `user_id` (FK → users, ON DELETE CASCADE), `token_hash` (UNIQUE), `expires_at`, `used_at` (nullable), `created_at`. Index on `user_id` for the "invalidate all previous tokens" operation (FR10).

5. **FR10 implementation** — On each new `requestReset`, the service marks all existing non-used tokens for that user as used (`used_at = NOW()`), then creates the new token. One query, atomic.

6. **Consistent response timing** — `requestReset` always performs the same work path (DB lookup + optional token insert + optional email send) to avoid timing attacks. If the email is not found or is Google-only, the method returns immediately but may add a small sleep to equalize latency if needed.

### i18n Keys (namespace `auth.passwordReset`)

| Key | EN | PT-BR |
|-----|----|-------|
| `pageTitle` | "Forgot your password?" | "Esqueceu sua senha?" |
| `pageSubtitle` | "Enter your email and we'll send a reset link" | "Informe seu e-mail e enviaremos um link para redefinir sua senha" |
| `emailLabel` | "Email" | "E-mail" |
| `submitButton` | "Send reset link" | "Enviar link de redefinição" |
| `submitting` | "Sending..." | "Enviando..." |
| `confirmationTitle` | "Check your inbox" | "Verifique seu e-mail" |
| `confirmationMessage` | "If an account with that email exists, we've sent a password reset link. Check your inbox (and spam folder)." | "Se houver uma conta com esse e-mail, enviamos um link de redefinição. Verifique sua caixa de entrada (e a pasta de spam)." |
| `newPasswordTitle` | "Set a new password" | "Defina uma nova senha" |
| `newPasswordLabel` | "New password" | "Nova senha" |
| `confirmNewPasswordLabel` | "Confirm new password" | "Confirmar nova senha" |
| `confirmButton` | "Set new password" | "Redefinir senha" |
| `confirming` | "Setting password..." | "Redefinindo senha..." |
| `successMessage` | "Password updated. Please sign in with your new password." | "Senha atualizada. Faça login com sua nova senha." |
| `linkInvalidTitle` | "Link expired or invalid" | "Link expirado ou inválido" |
| `linkInvalidMessage` | "This reset link is no longer valid. Please request a new one." | "Este link de redefinição não é mais válido. Solicite um novo." |
| `requestNewLink` | "Request a new link" | "Solicitar um novo link" |
| `forgotPassword` | "Forgot password?" | "Esqueceu a senha?" |
| `backToLogin` | "Back to sign in" | "Voltar para o login" |
| `errors.emailRequired` | "Email is required" | "E-mail é obrigatório" |
| `errors.emailInvalid` | "Invalid email format" | "Formato de e-mail inválido" |
| `errors.tokenInvalid` | "This reset link is no longer valid. Please request a new one." | "Este link de redefinição não é mais válido. Solicite um novo." |
| `errors.unexpected` | "Something went wrong. Please try again." | "Algo deu errado. Tente novamente." |

### Test Strategy

- [x] Full TDD (tests first for all code)
  - `PasswordResetServiceTest` — unit tests for `requestReset`, `validateToken`, `confirmReset` (happy path + all error branches)
  - `PasswordResetControllerTest` — MockMvc tests for all 3 endpoints (valid/invalid/expired/used token, rate limit response)
  - Integration test — full flow: request → extract token hash from DB → validate → confirm → verify password updated + refresh tokens revoked
  - Web: Vitest + React Testing Library for `ForgotPasswordPage` (submit, loading, confirmation state) and `ResetPasswordPage` (valid token → form, invalid token → error state, successful confirm → redirect)

### File Changes

**New (Backend):**
- `backend/src/main/java/com/lucasxf/ed/domain/PasswordResetToken.java` — JPA entity
- `backend/src/main/java/com/lucasxf/ed/repository/PasswordResetTokenRepository.java` — data access
- `backend/src/main/java/com/lucasxf/ed/service/PasswordResetService.java` — business logic
- `backend/src/main/java/com/lucasxf/ed/service/EmailService.java` — `JavaMailSender` wrapper
- `backend/src/main/java/com/lucasxf/ed/controller/PasswordResetController.java` — REST endpoints
- `backend/src/main/java/com/lucasxf/ed/dto/ForgotPasswordRequest.java` — `@Email @NotBlank String email`
- `backend/src/main/java/com/lucasxf/ed/dto/ResetPasswordRequest.java` — `@NotBlank String token`, `@NotBlank @Size(8-128) @Pattern String newPassword`

**New (Backend — Tests):**
- `backend/src/test/java/com/lucasxf/ed/service/PasswordResetServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/PasswordResetControllerTest.java`

**New (Backend — Migration):**
- `backend/src/main/resources/db/migration/V7__create_password_reset_tokens_table.sql`

**Modified (Backend):**
- `backend/pom.xml` — add `spring-boot-starter-mail`
- `backend/src/main/resources/application.yml` — add `spring.mail.*` SMTP config + `auth.password-reset-token-expiry: 1h`
- `backend/src/main/java/com/lucasxf/ed/security/SecurityConfig.java` — permit `/api/v1/auth/password-reset/**`
- `backend/src/main/java/com/lucasxf/ed/config/AuthProperties.java` — add `Duration passwordResetTokenExpiry`

**New (Web):**
- `web/src/app/[locale]/forgot-password/page.tsx` — reset request page
- `web/src/app/[locale]/reset-password/page.tsx` — set new password page
- `web/src/components/auth/ForgotPasswordForm.tsx` — email input form
- `web/src/components/auth/ResetPasswordForm.tsx` — new password form

**Modified (Web):**
- `web/src/app/[locale]/login/page.tsx` — add "Forgot password?" link
- `web/src/components/auth/LoginForm.tsx` — add "Forgot password?" link
- `web/src/lib/auth.ts` — add `requestPasswordReset`, `validateResetToken`, `confirmPasswordReset`
- `web/src/locales/en.json` — add `auth.passwordReset.*` keys
- `web/src/locales/pt-BR.json` — add `auth.passwordReset.*` keys

---

## Dependencies

**Blocked by:** None — all Phase 1 auth is complete and the reset flow is standalone.

**Blocks:** None currently. (Session persistence spec, if/when written, is independent.)

**External:**
- Resend account + SMTP credentials (free tier sufficient for personal use)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` environment variables on Railway

---

## Post-Implementation Notes

### Commits

| Commit | Description |
|--------|-------------|
| `fa83214` | feat: add V7 Flyway migration for password_reset_tokens table |
| `5dc9609` | feat: add password reset domain, exception, and configuration |
| `4ce0921` | feat: add EmailService and PasswordResetService (TDD, 12 tests) |
| `5835953` | feat: add PasswordResetController with MockMvc tests (12 tests green) |
| `6e1877c` | feat: add password reset web pages (forgot-password, reset-password) |
| `f3e76f6` | test: add Vitest tests for password reset web pages (19 new assertions) |

### Architectural Decisions

- **Token reuse pattern:** Reused `JwtService.generateRefreshToken()` (32-byte SecureRandom, URL-safe Base64) and `JwtService.hashRefreshToken()` (SHA-256 hex) for reset tokens — same cryptographic pattern as refresh tokens, no new infrastructure.
- **Rate limiting via DB count:** Chose DB-level rate limiting (`countByUserIdAndCreatedAtAfter`) over Redis/in-memory to keep the implementation simple and infrastructure-free. 3 requests per hour per email.
- **No IP-level rate limiting (AC12):** Deferred — no existing infrastructure for IP tracking in the codebase.
- **`MissingServletRequestParameterException` → 400:** Added to `GlobalExceptionHandler` as a general improvement triggered by the missing-token test case.
- **Frontend token validation on page load:** `reset-password` page calls `GET /validate` on mount (non-consuming) so stale links show an immediate error rather than a failed form submission.
- **No-enumeration on frontend:** `ForgotPasswordForm` always shows the success message even when the API call throws — prevents email enumeration via UI timing attacks.

### Deviations from Spec

- **IP rate limiting (NFR5/AC12):** Not implemented — no existing infrastructure. Documented as deferred.
- **Email integration test:** Integration test with Testcontainers was planned but not implemented — the service unit tests with Mockito cover all branches. Email delivery is an infrastructure concern not suited to unit/integration tests without an SMTP mock server.

### Lessons Learned

- **Duplicate YAML `spring:` keys:** Adding `spring.mail.*` as a separate top-level `spring:` block causes SnakeYAML parse failure at context load time. Always merge under a single `spring:` block.
- **Java record expansion:** Adding a field to an existing record (`AuthProperties`) breaks all constructor calls in tests — update all callers immediately after the change.
- **`MissingServletRequestParameterException` needs explicit handler:** Spring doesn't automatically map this to 400 in `@RestControllerAdvice` setups without `ResponseEntityExceptionHandler` — add explicit handler.

### Commits

### Architectural Decisions

### Deviations from Spec

### Lessons Learned
