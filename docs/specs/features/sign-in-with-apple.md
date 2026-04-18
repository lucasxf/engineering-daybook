# Sign in with Apple

> **Status:** In Progress
> **Created:** 2026-04-17
> **Reviewed:** 2026-04-17
> **Implemented:** _pending_

---

## Context

Apple rejected the learnimo iOS submission on 2026-04-17 under **Guideline 4.8 (Sign in with Apple)**: an app that offers a third-party login option (Google Sign-In) must also offer Sign in with Apple as an equivalent option for users who prefer it. This is a hard App Store gate — no waiver is available.

Sign in with Apple also provides a meaningful UX benefit: users can hide their real email address behind Apple's private relay, reducing the friction of sharing personal data with a new app.

This spec covers the full implementation: backend identity-token verification, new API endpoints (mirroring the existing Google OAuth flow), iOS mobile UI using Apple's mandatory native button, and a privacy-policy update.

**Related:**
- App Store rejection report: `mobile/store-assets/reviews/2026-04-17-app-store-connect-review.md`
- Remediation plan: `docs/plans/apple-rejection-2026-04-17.md`
- Mirror spec (Google OAuth, mobile): `docs/specs/features/mobile-google-oauth.md`

---

## Requirements

### Functional

- [ ] **FR1** *(Must Have)* — The backend verifies Apple identity tokens (JWTs) by fetching Apple's JWK set from `https://appleid.apple.com/auth/keys`, caching it for 15 minutes, and validating `iss`, `aud`, expiry, and RS256 signature.
- [ ] **FR2** *(Must Have)* — `POST /api/v1/auth/mobile/apple` accepts `{ identityToken }`. If the `apple_sub` matches an existing user, returns a JWT pair (same `AuthResponse` shape as login). If the user is new, returns `{ requiresHandle: true, tempToken, email }`.
- [ ] **FR3** *(Must Have)* — `POST /api/v1/auth/mobile/apple/complete` accepts `{ tempToken, handle, displayName }`, creates the user account with `auth_provider='apple'`, and returns a JWT pair.
- [ ] **FR4** *(Must Have)* — A Flyway V23 migration adds `apple_sub VARCHAR(255) UNIQUE NULL` to the `users` table.
- [ ] **FR5** *(Must Have)* — Returning users are looked up by `apple_sub` first (more reliable than email, since Apple relay addresses can change). Email lookup is a fallback only.
- [ ] **FR6** *(Must Have)* — Apple's "Hide My Email" relay addresses (format `random@privaterelay.appleid.com`) are stored as-is; no special normalization. The flow is identical to real email.
- [ ] **FR7** *(Must Have)* — If the provided email already belongs to a `local` or `google` account, respond 409 Conflict with a user-readable message.
- [ ] **FR8** *(Must Have)* — On iOS, the `AppleSignInButton` is shown above the Google Sign-In button on both `LoginScreen` and `RegisterScreen`, using Apple's mandatory native `AppleAuthenticationButton` component.
- [ ] **FR9** *(Must Have)* — On Android (and any non-iOS platform), the `AppleSignInButton` renders `null` — no button, no divider, no error.
- [ ] **FR10** *(Must Have)* — `ChooseHandleScreen` handles Apple signup completion alongside the existing Google path with no UI changes. `AuthStackParamList` for `ChooseHandle` gains a `provider: 'google' | 'apple'` param; both `useGoogleAuth` and `useAppleAuth` pass it on navigation; `ChooseHandleScreen` uses it to call either `completeGoogleSignupApi` or `completeAppleSignupApi`.
- [ ] **FR11** *(Must Have)* — i18n keys for Apple sign-in labels in both `en.ts` and `pt-BR.ts`.
- [ ] **FR12** *(Should Have)* — The privacy policy page (`web/src/app/[locale]/privacy/page.tsx`) gains a paragraph describing what data Sign in with Apple shares with learnimo and how it is used.

**Scope:** `backend + mobile` (privacy policy touches `web` but is a minor content edit, not a new feature)

### Non-Functional

- [ ] **NFR1** — JWK cache TTL is 15 minutes; a cache miss must not block the request for more than 3 seconds.
- [ ] **NFR2** — No Apple ID, Team ID, Key ID, or `.p8` key material is ever committed to any git-tracked file. All secrets are injected via environment variables.
- [ ] **NFR3** — `AppleAuthenticationButton` uses Apple's native rendering; no custom colors, borders, or icon replacement is applied (custom styling = App Store rejection risk).
- [ ] **NFR4** — Identity token validation is stateless — no Apple-side network call after initial JWK fetch.
- [ ] **NFR5** — Backend unit test coverage must remain ≥ 90% (JaCoCo threshold); mobile coverage ≥ 80%.
- [ ] **NFR6** — All user-facing strings are i18n-keyed; no hardcoded English in component JSX.

---

## Technical Constraints

**Stack:** Backend (Java 21, Spring Boot 4) + Mobile (Expo SDK 53, React Native 0.79.6, TypeScript)

**Technologies:**
- Backend: Spring `RestClient` for JWK fetch; `java.security` (`KeyFactory`, `RSAPublicKeySpec`, `Signature`) for RS256 verification; JJWT 0.12.6 for temp-token generation/parsing (existing pattern). No new library dependencies.
- Mobile: `expo-apple-authentication` (new package, iOS only); `Platform.OS === 'ios'` guard.

**Integration Points:**
- `AuthMobileController` — add two new endpoints mirroring the Google pair.
- `AuthService` — add `appleLogin(identityToken)` and `completeAppleSignup(tempToken, handle, displayName)` methods.
- `User` entity — add `apple_sub` field.
- `UserRepository` — add `findByAppleSub(String)` and `existsByAppleSub(String)`.
- Mobile `auth.ts` — add `appleLoginApi` and `completeAppleSignupApi` mirroring the Google pair.
- Mobile `AuthStack.tsx` / `ChooseHandleScreen.tsx` — `AuthStackParamList['ChooseHandle']` gains `provider: 'google' | 'apple'`. Both `useGoogleAuth` and `useAppleAuth` pass this param when navigating to `ChooseHandleScreen`. The screen reads `route.params.provider` and calls `completeGoogleSignupApi` or `completeAppleSignupApi` accordingly. No UI changes — the param is invisible to the user.

**Apple Developer Console prerequisites (user-driven, before on-device verification):**
- Sign in with Apple capability enabled on App ID `net.learnimo.app`.
- `.p8` signing key downloaded; Team ID + Key ID recorded.
- `APPLE_TEAM_ID`, `APPLE_KEY_ID` available as env vars (backend config reference only — not used for token verification, which is JWKS-based).

**Out of Scope:**
- Sign in with Apple on web (Apple 4.8 is iOS-only; web is a separate future feature).
- Sign in with Apple on Android.
- Server-side authorization code validation (this spec uses the identity token path only, consistent with the Google approach).
- Account linking (connecting an existing email/password account to Apple — deferred).

---

## Acceptance Criteria

### AC1: New user, full email
**GIVEN** a user taps "Sign in with Apple" on `LoginScreen` or `RegisterScreen` on iOS  
**AND** the user has never signed into learnimo before  
**AND** the user allows sharing their real email  
**WHEN** the iOS authentication sheet completes and the app sends the identity token to `POST /api/v1/auth/mobile/apple`  
**THEN** the backend responds 200 with `{ requiresHandle: true, tempToken, email }`  
**AND** the app navigates to `ChooseHandleScreen` with `tempToken` and `email`

### AC2: New user, "Hide My Email"
**GIVEN** the same setup as AC1  
**AND** the user chooses "Hide My Email"  
**WHEN** the app sends the identity token  
**THEN** the backend responds 200 with `{ requiresHandle: true, tempToken, email }` where `email` is an `@privaterelay.appleid.com` address  
**AND** the relay address is stored in `users.email` after `completeAppleSignup`

### AC3: Returning user
**GIVEN** a user has previously completed Apple sign-in  
**WHEN** the user taps "Sign in with Apple" and the identity token is sent to `POST /api/v1/auth/mobile/apple`  
**THEN** the backend responds 200 with a full JWT pair (`accessToken`, `refreshToken`)  
**AND** the app calls `setUser()` and navigates to the Feed

### AC4: iOS-only rendering
**GIVEN** the app is running on Android  
**WHEN** `LoginScreen` or `RegisterScreen` renders  
**THEN** no "Sign in with Apple" button or divider is visible

### AC5: User cancels Apple sheet
**GIVEN** the user taps "Sign in with Apple"  
**WHEN** the user cancels the iOS authentication sheet  
**THEN** no error message is shown and the auth screen remains unchanged

### AC6: Invalid / expired identity token
**GIVEN** the app sends a malformed or expired Apple identity token  
**WHEN** `POST /api/v1/auth/mobile/apple` receives it  
**THEN** the backend responds 401  
**AND** the mobile app shows `auth.errors.appleFailed`

### AC7: Email conflict — existing local or Google account
**GIVEN** a user's Apple email is already registered with `auth_provider='local'` or `auth_provider='google'`  
**WHEN** `POST /api/v1/auth/mobile/apple` receives the identity token  
**THEN** the backend responds 409 Conflict  
**AND** the mobile app shows an error directing the user to sign in with email/password or Google

### AC8: Handle registration via Apple temp token
**GIVEN** a new Apple user is on `ChooseHandleScreen` with a valid Apple temp token  
**WHEN** the user submits a handle  
**THEN** `POST /api/v1/auth/mobile/apple/complete` is called  
**AND** a user is created with `auth_provider='apple'` and `apple_sub` stored  
**AND** the app navigates to the Feed

### AC9: Backend JWK caching
**GIVEN** the Apple JWK endpoint has been called once in the last 15 minutes  
**WHEN** a second Apple identity token is verified  
**THEN** no outbound HTTP call to `https://appleid.apple.com/auth/keys` is made

### AC10: Privacy policy disclosure
**GIVEN** a user visits the privacy policy page  
**WHEN** they look for Sign in with Apple information  
**THEN** a paragraph describes what data Apple shares (name, email or relay, stable sub) and how learnimo uses it

---

## Screens

> _Mobile-only. No new screens — existing auth screens are modified._

### Screen: LoginScreen (modified)

**Purpose:** User signs in to an existing account. Apple button added above the Google button.

**Route:** Mobile nav stack — `AuthStack > Login`

**Layout (additions only):**
1. After the primary submit button and before the Google divider: `<AppleSignInButton>` — iOS only, renders null on Android.

**Components (additions):**
- `LoginScreen` → `<AppleSignInButton>` (new, iOS-gated) → `AppleAuthenticationButton` (native)
- `LoginScreen` → `useAppleAuth` (new hook)

**States:**
- iOS: Apple button renders above Google button
- Android / non-iOS: Apple button absent (renders null, no gap)
- Loading: native button uses Apple's built-in loading state

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `auth.login.appleButton` | Sign in with Apple | Entrar com Apple |
| `auth.errors.appleFailed` | Sign in with Apple failed. Try again. | Falha ao entrar com Apple. Tente novamente. |

**Interactions:**
- Tap "Sign in with Apple" → iOS system sheet → success → Feed (existing user) or ChooseHandle (new user)
- Cancel sheet → no-op, screen stays

---

### Screen: RegisterScreen (modified)

**Purpose:** Same Apple button wiring as LoginScreen.

**Layout / Components / i18n:** Identical additions to LoginScreen.

---

### Screen: ChooseHandleScreen (no changes)

**Purpose:** Accepts `{ tempToken, email, provider }` params. `provider: 'google' | 'apple'` is new — added to `AuthStackParamList['ChooseHandle']`. The screen uses it to route the completion call: `provider === 'apple'` → `completeAppleSignupApi`; otherwise → `completeGoogleSignupApi`. No UI change — the routing is invisible to the user.

---

## Implementation Approach

### Architecture

The feature mirrors the existing Google OAuth flow exactly:

```
Mobile (iOS)
  └─ useAppleAuth hook
       └─ expo-apple-authentication (native ASAuthorizationAppleIDRequest)
            └─ identityToken (JWT signed by Apple)
                 └─ appleLoginApi() → POST /auth/mobile/apple
                      └─ AppleIdentityTokenVerifier.verify(identityToken)
                           └─ AppleJwkCache (RestClient, 15 min TTL)
                                └─ java.security RSAPublicKeySpec + JJWT parser
                      └─ AuthService.appleLogin(identityToken)
                           ├─ existing user (by apple_sub) → issueTokens()
                           └─ new user → jwtService.generateTempToken()
                                └─ mobile: ChooseHandleScreen
                                     └─ completeAppleSignupApi() → POST /auth/mobile/apple/complete
                                          └─ AuthService.completeAppleSignup()
```

**Apple JWK verification (pure-Java, no new dependencies):**
1. `AppleJwkCache` fetches `https://appleid.apple.com/auth/keys` via Spring `RestClient` on first call and every 15 minutes thereafter. Returns a `Map<String, RSAPublicKey>` keyed by `kid`.
2. `AppleIdentityTokenVerifier.verify(identityToken)`:
   - Decode JWT header (Base64 URL decode, parse JSON) to extract `kid` and `alg`.
   - Look up matching `RSAPublicKey` from cache by `kid`.
   - Use JJWT `Jwts.parser().verifyWith(publicKey).build().parseSignedClaims(token)` for signature + expiry.
   - Assert `iss == "https://appleid.apple.com"`.
   - Assert `aud` contains `"net.learnimo.app"` (bundle ID).
   - Return `AppleUserInfo(sub, email)` — `name` is optional (Apple only sends it on first login).

**UserRepository lookup order (FR5):**
```java
// 1. Try apple_sub — stable, never changes even if relay email rotates
userRepository.findByAppleSub(userInfo.sub())
  .orElseGet(() ->
    // 2. Fall back to email — covers edge case of first login before sub was stored
    userRepository.findByEmail(normalizedEmail).orElse(null)
  )
```

**`auth_provider` values:** `"local"` | `"google"` | `"apple"` — string column, consistent with existing design.

### Test Strategy

- [ ] **Partial TDD** — `AppleIdentityTokenVerifier` unit tests written first; integration tests written alongside endpoint implementation.

**Backend:**
- `AppleIdentityTokenVerifierTest` — valid token, expired token, wrong `iss`, wrong `aud`, tampered signature, unknown `kid`, JWK cache hit vs miss.
- `AuthServiceAppleTest` — existing user by `apple_sub`, new user → temp token, email conflict (local), email conflict (google).
- `AuthMobileControllerAppleTest` — `POST /apple`: 200 existing, 200 new, 401 invalid token, 409 conflict. `POST /apple/complete`: 200, 409 handle taken.
- `AuthIntegrationTest` (extend) — Apple new user end-to-end, returning user, conflict.

**Mobile:**
- `useAppleAuth.test.ts` — cancelled, error, existing user success (`setUser` called), new user success (navigate to ChooseHandle).
- `AppleSignInButton.test.tsx` — renders on iOS, returns null on Android.
- `LoginScreen.test.tsx` — Apple button present on iOS, absent on Android.
- `RegisterScreen.test.tsx` — same.
- `ChooseHandleScreen.test.tsx` — `provider='apple'` calls `completeAppleSignupApi`; `provider='google'` calls `completeGoogleSignupApi`.

### File Changes

**New (backend):**
- `backend/src/main/java/com/lucasxf/ed/service/AppleJwkCache.java`
- `backend/src/main/java/com/lucasxf/ed/service/AppleIdentityTokenVerifier.java`
- `backend/src/main/java/com/lucasxf/ed/service/AppleLoginResult.java`
- `backend/src/main/java/com/lucasxf/ed/dto/AppleLoginRequest.java`
- `backend/src/main/java/com/lucasxf/ed/dto/AppleLoginResponse.java`
- `backend/src/main/java/com/lucasxf/ed/dto/CompleteAppleSignupRequest.java`
- `backend/src/main/resources/db/migration/V23__add_apple_sub_to_users.sql`
- `backend/src/test/java/com/lucasxf/ed/service/AppleIdentityTokenVerifierTest.java`
- `backend/src/test/java/com/lucasxf/ed/service/AuthServiceAppleTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/AuthMobileControllerAppleTest.java`

**Modified (backend):**
- `backend/src/main/java/com/lucasxf/ed/domain/User.java`
- `backend/src/main/java/com/lucasxf/ed/repository/UserRepository.java`
- `backend/src/main/java/com/lucasxf/ed/service/AuthService.java`
- `backend/src/main/java/com/lucasxf/ed/controller/AuthMobileController.java`
- `backend/src/test/java/com/lucasxf/ed/integration/AuthIntegrationTest.java`

**New (mobile):**
- `mobile/src/hooks/useAppleAuth.ts`
- `mobile/src/components/auth/AppleSignInButton.tsx`
- `mobile/src/hooks/__tests__/useAppleAuth.test.ts`
- `mobile/src/components/auth/__tests__/AppleSignInButton.test.tsx`

**Modified (mobile):**
- `mobile/package.json`
- `mobile/app.json`
- `mobile/src/lib/auth.ts`
- `mobile/src/navigation/AuthStack.tsx`
- `mobile/src/screens/auth/LoginScreen.tsx`
- `mobile/src/screens/auth/RegisterScreen.tsx`
- `mobile/src/screens/auth/ChooseHandleScreen.tsx`
- `mobile/src/i18n/locales/en.ts`
- `mobile/src/i18n/locales/pt-BR.ts`
- `mobile/src/screens/auth/__tests__/LoginScreen.test.tsx`
- `mobile/src/screens/auth/__tests__/RegisterScreen.test.tsx`
- `mobile/src/screens/auth/__tests__/ChooseHandleScreen.test.tsx`

**Modified (web):**
- `web/src/app/[locale]/privacy/page.tsx`

**Migrations:**
- `backend/src/main/resources/db/migration/V23__add_apple_sub_to_users.sql`

```sql
ALTER TABLE users
  ADD COLUMN apple_sub VARCHAR(255) NULL;

CREATE UNIQUE INDEX users_apple_sub_unique
  ON users (apple_sub)
  WHERE apple_sub IS NOT NULL;
```

---

## Implementation Plan

### Task 1: Flyway migration + User entity + UserRepository
- **Files:**
  - `backend/src/main/resources/db/migration/V23__add_apple_sub_to_users.sql`
  - `backend/src/main/java/com/lucasxf/ed/domain/User.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/UserRepository.java`
- **Depends on:** _none_
- **Commit:** `feat(backend): add apple_sub column to users (V23 migration)`
- **Stack:** backend

### Task 2: AppleJwkCache + AppleIdentityTokenVerifier + unit tests
- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/service/AppleJwkCache.java`
  - `backend/src/main/java/com/lucasxf/ed/service/AppleIdentityTokenVerifier.java`
  - `backend/src/test/java/com/lucasxf/ed/service/AppleIdentityTokenVerifierTest.java`
- **Depends on:** _none_
- **Commit:** `feat(backend): add Apple identity token verifier with JWK cache`
- **Stack:** backend

### Task 3: DTOs + AppleLoginResult + AuthService apple methods + unit tests
- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/dto/AppleLoginRequest.java`
  - `backend/src/main/java/com/lucasxf/ed/dto/AppleLoginResponse.java`
  - `backend/src/main/java/com/lucasxf/ed/dto/CompleteAppleSignupRequest.java`
  - `backend/src/main/java/com/lucasxf/ed/service/AppleLoginResult.java`
  - `backend/src/main/java/com/lucasxf/ed/service/AuthService.java`
  - `backend/src/test/java/com/lucasxf/ed/service/AuthServiceAppleTest.java`
- **Depends on:** Task 1, Task 2
- **Commit:** `feat(backend): add appleLogin and completeAppleSignup to AuthService`
- **Stack:** backend

### Task 4: AuthMobileController endpoints + controller tests + integration tests
- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/controller/AuthMobileController.java`
  - `backend/src/test/java/com/lucasxf/ed/controller/AuthMobileControllerAppleTest.java`
  - `backend/src/test/java/com/lucasxf/ed/integration/AuthIntegrationTest.java`
- **Depends on:** Task 3
- **Commit:** `feat(backend): add POST /auth/mobile/apple and /apple/complete endpoints`
- **Stack:** backend

### Task 5: Mobile — install expo-apple-authentication + app.json plugin
- **Files:**
  - `mobile/package.json`
  - `mobile/app.json`
- **Depends on:** _none_
- **Commit:** `feat(mobile): install expo-apple-authentication and register plugin`
- **Stack:** mobile

### Task 6: Mobile — auth.ts API functions + useAppleAuth hook + i18n + hook tests
- **Files:**
  - `mobile/src/lib/auth.ts`
  - `mobile/src/hooks/useAppleAuth.ts`
  - `mobile/src/i18n/locales/en.ts`
  - `mobile/src/i18n/locales/pt-BR.ts`
  - `mobile/src/hooks/__tests__/useAppleAuth.test.ts`
- **Depends on:** Task 5
- **Commit:** `feat(mobile): add appleLoginApi, useAppleAuth hook, and i18n keys`
- **Stack:** mobile

### Task 7: Mobile — AppleSignInButton + LoginScreen + RegisterScreen + ChooseHandleScreen wiring + tests
- **Files:**
  - `mobile/src/navigation/AuthStack.tsx`
  - `mobile/src/components/auth/AppleSignInButton.tsx`
  - `mobile/src/components/auth/__tests__/AppleSignInButton.test.tsx`
  - `mobile/src/screens/auth/LoginScreen.tsx`
  - `mobile/src/screens/auth/RegisterScreen.tsx`
  - `mobile/src/screens/auth/ChooseHandleScreen.tsx`
  - `mobile/src/screens/auth/__tests__/LoginScreen.test.tsx`
  - `mobile/src/screens/auth/__tests__/RegisterScreen.test.tsx`
  - `mobile/src/screens/auth/__tests__/ChooseHandleScreen.test.tsx`
- **Depends on:** Task 6
- **Commit:** `feat(mobile): add AppleSignInButton, wire auth screens, add provider routing in ChooseHandleScreen`
- **Stack:** mobile

### Task 8: Privacy policy update
- **Files:**
  - `web/src/app/[locale]/privacy/page.tsx`
- **Depends on:** _none_
- **Commit:** `docs(web): add Sign in with Apple data-handling section to privacy policy`
- **Stack:** web

---

## Dependencies

**Blocked by:**
- Apple Developer Console setup (before on-device verification): Sign in with Apple capability enabled on `net.learnimo.app`, `.p8` key generated, Team ID + Key ID added to Railway env vars. Implementation and unit tests can proceed without this; on-device smoke test requires it.

**Blocks:**
- App Store resubmission (along with account-deletion, support page, and photo string fixes from the remediation plan)

**External:**
- `expo-apple-authentication` npm package (install with `--legacy-peer-deps`)
- Apple JWK endpoint: `https://appleid.apple.com/auth/keys`
- Sign in with Apple capability on App ID `net.learnimo.app` (Apple Developer Console)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
_pending_

### Architectural Decisions
_pending_

### Deviations from Spec
_pending_

### Lessons Learned
_pending_
