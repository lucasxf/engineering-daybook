# Mobile Google OAuth Sign-In

> **Status:** Implemented
> **Created:** 2026-03-17
> **Reviewed:** 2026-03-17
> **Implemented:** 2026-03-19

---

## Context

The learnimo mobile app (Expo/React Native) supports email/password login only. The web app has had Google OAuth since Milestone 1.1.3. Mobile users who created their account via Google Sign-In on the web cannot sign in on mobile — they must use "Forgot Password" to set a password first, adding unwanted friction.

All backend infrastructure for mobile Google OAuth is already complete and tested. The `expo-auth-session` and `expo-web-browser` packages are installed. The API client functions, navigation routes, and i18n keys all exist. **The only missing piece is the UI layer** — no Google button is rendered on the login or register screens.

**Related:**
- Milestone 3.4: App Store Publishing (mobile feature parity)
- `mobile/store-assets/web-mobile-feature-parity.md` (parity gap analysis)

---

## Requirements

### Functional

- [ ] **FR1** _(Must Have)_ — A "Continue with Google" button appears on `LoginScreen` below the email/password form, separated by an "Or continue with" divider
- [ ] **FR2** _(Must Have)_ — Tapping the button launches the Google OAuth consent screen via `expo-auth-session`; on success the returned `idToken` is sent to `POST /auth/mobile/google`
- [ ] **FR3** _(Must Have)_ — For existing Google users (backend returns `requiresHandle: false`): `setUser` is called, app navigates to Feed
- [ ] **FR4** _(Must Have)_ — For new Google users (backend returns `requiresHandle: true`): app navigates to `ChooseHandle` screen with `{ tempToken, email }` params (screen is already implemented)
- [ ] **FR5** _(Must Have)_ — OAuth cancellation (user dismisses the consent screen) shows no error and returns to the login screen silently
- [ ] **FR6** _(Must Have)_ — A Google-side OAuth error (network failure, permission denied during consent) shows `auth.errors.googleFailed` inline; the button re-enables
- [ ] **FR6b** _(Must Have)_ — A backend API error (e.g. 409 email already registered with password, 500) shows `auth.errors.googleFailed` inline; the button re-enables
- [ ] **FR7** _(Should Have)_ — "Continue with Google" button also appears on `RegisterScreen` with the same flow (web parity, reduces friction for new users)
- [ ] **FR8** _(Should Have)_ — While the OAuth flow is in progress the button shows a loading indicator and is disabled (prevents double-tap)
- [ ] **FR9** _(Could Have)_ — When `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is absent the Google button is hidden rather than crashing

**Scope:** `mobile`

### Non-Functional

- [ ] **NFR1** — OAuth logic lives in a `useGoogleAuth` hook; the hook is unit-testable in the `lib` jest project (no RN rendering dependency)
- [ ] **NFR2** — Platform client IDs (Android, iOS, web/Expo Go) are driven by env vars; no hardcoded values
- [ ] **NFR3** — The `GoogleSignInButton` component is self-contained and reusable across `LoginScreen` and `RegisterScreen`
- [ ] **NFR4** — No new backend endpoints or schema migrations needed

---

## Technical Constraints

**Stack:** Mobile

**Technologies:**
- Expo SDK 53 / React Native 0.79 / TypeScript strict
- `expo-auth-session@~6.2.1` — already installed; use `Google.useAuthRequest()` from `expo-auth-session/providers/google`
- `expo-web-browser@~14.2.0` — already installed; call `WebBrowser.warmUpAsync()` on Android for faster cold-start
- Env vars: `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (web/Expo Go), `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

**Integration Points:**
- `mobile/src/lib/auth.ts` — `googleLoginApi(idToken)` + `completeGoogleSignupApi()` — **no changes needed**
- `mobile/src/navigation/AuthStack.tsx` — `ChooseHandle` route already defined — **no changes needed**
- `mobile/src/contexts/AuthContext.tsx` — `setUser()` — **no changes needed**
- `mobile/src/i18n/locales/en.ts` + `pt-BR.ts` — all keys exist — **no changes needed**
- `mobile/app.config.ts` — add `androidClientId` + `iosClientId` env var read alongside existing `googleClientId`
- Google Cloud Console — Android and iOS OAuth 2.0 client IDs must be created (infra pre-work, outside code scope)

**Out of Scope:**
- Backend changes (all endpoints already exist)
- Web OAuth changes
- Maestro E2E flow (Google consent screen cannot be automated in CI)
- Apple Sign-In

---

## Acceptance Criteria

### AC1: Existing Google user — sign in on LoginScreen
**GIVEN** a user who previously signed up with Google on web
**WHEN** they tap "Continue with Google" on the LoginScreen and complete the consent screen
**THEN** they are logged in and land on the Feed screen; no handle selection screen appears

### AC2: New Google user — directed to ChooseHandle
**GIVEN** a user whose Google email has no learnimo account
**WHEN** they tap "Continue with Google" on the LoginScreen and complete the consent screen
**THEN** the ChooseHandle screen is shown with the `tempToken` and `email` pre-loaded; completing it creates their account and navigates to Feed

### AC3: OAuth cancellation — silent no-op
**GIVEN** the Google consent screen is open
**WHEN** the user dismisses it (back button or swipe)
**THEN** they are returned to LoginScreen with no error message shown

### AC4: Backend error — inline error message
**GIVEN** the Google consent screen completes successfully
**WHEN** the backend returns an error (e.g. 409 email already registered with password)
**THEN** the `auth.errors.googleFailed` message appears inline; the button re-enables

### AC5: Loading state — button disabled during flow
**GIVEN** the user has tapped "Continue with Google"
**WHEN** the OAuth flow and/or API call is in progress
**THEN** the button shows a loading indicator and cannot be tapped again

### AC6: RegisterScreen parity
**GIVEN** a user on the RegisterScreen
**WHEN** they tap "Continue with Google"
**THEN** the same flow as AC1/AC2 occurs (existing user → Feed; new user → ChooseHandle)

### AC7: Missing client ID — button hidden
**GIVEN** `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is not set
**WHEN** the LoginScreen renders
**THEN** the "Or continue with" divider and Google button are not visible; no crash occurs

---

## Screens

### Screen: LoginScreen (modified)

**Purpose:** Primary sign-in screen — now supports both email/password and Google OAuth

**Route:** AuthStack `Login`

**Layout:**
1. Title + subtitle — "Welcome back" / "Sign in to continue learning"
2. Inline error message (ErrorMessage component)
3. Email field
4. Password field
5. "Sign in" primary button
6. "Forgot password?" ghost button
7. "Or continue with" divider (horizontal line + text)
8. `<GoogleSignInButton>` — "Continue with Google"
9. "Don't have an account? Sign up" link row

**Components:**
- `<LoginScreen>` → existing fields + `<GoogleSignInButton loading={googleLoading} onPress={handleGoogleSignIn} />`

**States:**
- Default: form fields enabled, Google button enabled
- Submitting (email): form disabled + spinner on Sign in button
- Google in progress: Google button shows loading indicator + disabled; form still accessible
- Error: `ErrorMessage` visible above fields

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `auth.login.orContinueWith` | Or continue with | Ou continue com |
| `auth.login.googleButton` | Continue with Google | Continuar com Google |
| `auth.errors.googleFailed` | Google sign-in failed. Please try again. | Falha no login com Google. Tente novamente. |

*(All keys already exist in both locale files — no new keys needed)*

**Interactions:**
- Google button tap → `handleGoogleSignIn()` → `promptAsync()` → existing user: `setUser` + navigate Feed; new user: navigate ChooseHandle

**Accessibility:**
- Google button has `accessibilityLabel={t('auth.login.googleButton')}`
- Loading state sets `accessibilityState={{ disabled: true, busy: true }}`

---

### Screen: RegisterScreen (modified)

**Purpose:** Account creation screen — Google button offers a faster path that skips the full form

**Route:** AuthStack `Register`

**Layout:**
1. Title + subtitle
2. Full form fields (email, password, confirm, displayName, handle)
3. "Create account" primary button
4. "Or continue with" divider
5. `<GoogleSignInButton>` — "Continue with Google"
6. "Already have an account? Sign in" link

**i18n:** Same keys as LoginScreen — no additions needed

**Interactions:**
- Google button tap → same `handleGoogleSignIn()` logic as LoginScreen (extract to shared hook)

---

## Implementation Approach

### Architecture

A `useGoogleAuth` hook encapsulates all OAuth state and logic. `GoogleSignInButton` is a thin presentational wrapper around the existing `Button` component. Both auth screens import the hook and component — no logic duplication.

```
useGoogleAuth(onSuccess, onError)
  └── Google.useAuthRequest({ ... clientIds, responseType: 'id_token' })
  └── on response → googleLoginApi(idToken)
  └── on ExistingUser → onSuccess({ type: 'existing', user })
  └── on NewUser → onSuccess({ type: 'new', tempToken, email })

GoogleSignInButton
  └── Button variant="secondary" + Google icon + loading prop

LoginScreen / RegisterScreen
  └── const { loading, handlePress } = useGoogleAuth(...)
  └── <GoogleSignInButton loading={loading} onPress={handlePress} />
```

### `useGoogleAuth` design notes

- Uses `Google.useAuthRequest()` with `responseType: ResponseType.IdToken`
- `webClientId` from `EXPO_PUBLIC_GOOGLE_CLIENT_ID`; `androidClientId` from `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`; `iosClientId` from `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- Returns `null` request when all client IDs are absent (FR9)
- `WebBrowser.maybeCompleteAuthSession()` must be called at module top-level (required by expo-auth-session)
- `WebBrowser.warmUpAsync()` is called in a `useEffect` on hook mount (Android cold-start optimization); `WebBrowser.coolDownAsync()` is called in the cleanup to release the browser connection
- **`promptAsync()` response type branching:**
  - `response.type === 'success'` → extract `params.id_token`, call `googleLoginApi(idToken)`, handle result (FR3/FR4)
  - `response.type === 'cancel'` or `response.type === 'dismiss'` → silent no-op; return without setting error (FR5)
  - `response.type === 'error'` → set error state, show `auth.errors.googleFailed` (FR6)
- The hook returns `{ loading, handlePress }` — `handlePress` calls `promptAsync()` then handles the response

### Test Strategy

- [ ] Partial TDD — unit tests for `useGoogleAuth` first (mock `Google.useAuthRequest` + `googleLoginApi`); component tests for `GoogleSignInButton`
- `useGoogleAuth.test.ts` in `lib` jest project (node env — no RN setup)
- `GoogleSignInButton.test.tsx` in `components` jest project (node env with native module stubs)

### File Changes

**New:**
- `mobile/src/hooks/useGoogleAuth.ts` — OAuth hook
- `mobile/src/hooks/__tests__/useGoogleAuth.test.ts` — unit tests
- `mobile/src/components/auth/GoogleSignInButton.tsx` — button component
- `mobile/src/components/auth/__tests__/GoogleSignInButton.test.tsx` — component tests
- `mobile/.env.example` — document the three Google client ID env vars

**Modified:**
- `mobile/src/screens/auth/LoginScreen.tsx` — add divider + `<GoogleSignInButton>`
- `mobile/src/screens/auth/LoginScreen.test.tsx` — add tests for Google button render, loading state, and hidden state when client ID absent
- `mobile/src/screens/auth/RegisterScreen.tsx` — add divider + `<GoogleSignInButton>`
- `mobile/src/screens/auth/RegisterScreen.test.tsx` — add tests for Google button render and same flow as LoginScreen
- `mobile/app.config.ts` — read `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

---

## Implementation Plan

### Task 1: Add `useGoogleAuth` hook + unit tests
- **Files:** `mobile/src/hooks/useGoogleAuth.ts`, `mobile/src/hooks/__tests__/useGoogleAuth.test.ts`
- **Depends on:** _none_
- **Commit:** `feat(mobile): add useGoogleAuth hook with expo-auth-session`
- **Stack:** mobile

### Task 2: Add `GoogleSignInButton` component + tests
- **Files:** `mobile/src/components/auth/GoogleSignInButton.tsx`, `mobile/src/components/auth/__tests__/GoogleSignInButton.test.tsx`
- **Depends on:** Task 1
- **Commit:** `feat(mobile): add GoogleSignInButton component`
- **Stack:** mobile

### Task 3: Wire Google button into LoginScreen and RegisterScreen
- **Files:** `mobile/src/screens/auth/LoginScreen.tsx`, `mobile/src/screens/auth/LoginScreen.test.tsx`, `mobile/src/screens/auth/RegisterScreen.tsx`, `mobile/src/screens/auth/RegisterScreen.test.tsx`
- **Depends on:** Task 2
- **Commit:** `feat(mobile): wire Google OAuth into auth screens`
- **Stack:** mobile

### Task 4: Extend app config for platform client IDs + env example
- **Files:** `mobile/app.config.ts`, `mobile/.env.example`
- **Depends on:** Task 1
- **Commit:** `chore(mobile): add Google OAuth platform client ID env vars`
- **Stack:** mobile

---

## Dependencies

**Blocked by:** Google Cloud Console — Android and iOS OAuth 2.0 client IDs must be created before testing on real devices/EAS builds (Play Store SHA-1 fingerprint required for Android)

**Blocks:** None

**External:**
- `expo-auth-session@~6.2.1` — already installed
- `expo-web-browser@~14.2.0` — already installed
- Google Cloud Console project with OAuth credentials (existing project used for web)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `9438c57` — docs: mark spec mobile-google-oauth as in progress
- `ebff326` — feat(mobile): add useGoogleAuth hook with expo-auth-session
- `2ae2c74` — chore(mobile): add Google OAuth platform client ID env vars
- `f6a774e` — feat(mobile): add GoogleSignInButton component
- `4d7f881` — feat(mobile): wire Google OAuth into auth screens

### Architectural Decisions

**Decision: `useGoogleAuth` returns `disabled` flag instead of null**
The hook returns `{ loading, handlePress, disabled }` where `disabled === true` when all client IDs are absent. `GoogleSignInButton` renders `null` when `disabled === true` (FR9).

**Decision: `WebBrowser.maybeCompleteAuthSession()` at module top-level**
Required by expo-auth-session for the redirect flow. Called outside the hook body so it runs once on module load.

**Decision: Error message passed as i18n key string**
`onError` is called with `'auth.errors.googleFailed'` (the key). The screen wraps it: `(msg) => setServerError(t(msg))`. Keeps the hook free from i18n context dependency (unit-testable in node env, NFR1).

### Deviations from Spec
None. All FRs and NFRs implemented as specified.

### Lessons Learned
- `maybeCompleteAuthSession()` runs at module load time — test mock must use an inline `jest.fn()` in the factory, not a module-scope variable.
- `jest.config.js` `lib` project needed `transformIgnorePatterns` extended to transpile `expo-auth-session`, `expo-web-browser`, and `expo-modules-core` ES modules.
