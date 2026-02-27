# Mobile App (Expo/React Native)

> **Status:** Approved
> **Created:** 2026-02-27
> **Reviewed:** 2026-02-27
> **Implemented:** _pending_

---

## Context

learnimo exists to reduce the friction of capturing what you learn. The web app solves this on desktop and mobile browsers, but a native mobile experience unlocks a fundamentally different capture pattern: the user is on their phone, reads something useful, and wants to record it in under 10 seconds before the context is lost.

A browser-based PWA does not meet this bar. Native apps provide:
- Home screen presence (no URL bar, no browser chrome)
- OS-level keyboard handling optimised for quick text entry
- Access to native share sheets (future: "share to learnimo" from any app)
- Push notifications (future milestone)

**User problem:** A learner encounters something worth capturing — while reading, commuting, or in a meeting — and the current capture path requires opening a browser, navigating to learnimo.net, and logging in if the session expired. Every extra step is a captured thought lost.

**Milestone reference:** `docs/ROADMAP.phase-3.md` → Milestone 3.3 — Mobile App (Expo/React Native)

This milestone is scoped to a functional MVP: authentication, creating and browsing learnings, dark mode, and i18n. It deliberately mirrors the web app's core loop without attempting feature parity.

**Related:**
- ROADMAP.phase-3.md — Milestone 3.3
- `docs/specs/features/web-auth.md` — auth patterns reused here
- `docs/specs/features/pok-crud.md` — API contract reused here
- `docs/specs/features/session-persistence.md` — AUTH-04 (web); mobile uses SecureStore equivalent

---

## Requirements

### Functional

#### Project Setup (3.3.1)

- [ ] **FR1** `[Must Have]` The Expo project is initialised inside `mobile/` using Expo SDK 53 (managed workflow). The workflow choice (managed vs bare) is documented in an ADR.
- [ ] **FR2** `[Must Have]` The API base URL is sourced from environment variables via `expo-constants` / `app.config.ts` — no hardcoded URLs.
- [ ] **FR3** `[Must Have]` The app is runnable locally on Android emulator and iOS simulator with `npx expo start`.
- [ ] **FR4** `[Must Have]` EAS Build is configured (`eas.json`) as the CI/CD target for internal distribution (TestFlight / Play Store internal track). Public App Store and Play Store publishing are a separate milestone — see Dependencies.

#### Authentication (3.3.2)

- [ ] **FR5** `[Must Have]` The app must support email/password login. On successful login, the authenticated user is taken directly to the Learning Feed without any intermediate welcome screen.
- [ ] **FR6** `[Must Have]` The app must support Google OAuth sign-in using `expo-auth-session` (PKCE flow). On success, the user lands on the Learning Feed.
- [ ] **FR7** `[Must Have]` JWT access and refresh tokens must be stored in `expo-secure-store` only — not in AsyncStorage or memory alone.
- [ ] **FR8** `[Must Have]` The app must silently refresh the access token when a 401 is received. If refresh fails, the user is redirected to the login screen and all tokens are cleared.
- [ ] **FR9** `[Must Have]` Logout clears all tokens from SecureStore and returns the user to the login screen. Back navigation must not return to the feed.
- [ ] **FR10** `[Should Have]` "Forgot password?" on the login screen opens the web-based password reset flow via `expo-web-browser`. No native password reset form in this milestone.

#### Create Learning (3.3.3)

- [ ] **FR11** `[Must Have]` A FAB is persistently visible on the feed. A single tap opens the Create Learning screen — no intermediate screen or dialog.
- [ ] **FR12** `[Must Have]` The Create Learning screen has a multi-line content field (mandatory, auto-focused on open) and an optional title field. The keyboard appears without a second tap.
- [ ] **FR13** `[Must Have]` The Save button is disabled when content is empty or whitespace-only.
- [ ] **FR14** `[Must Have]` On successful save, the user is returned to the feed and the new learning appears at the top — no full reload.
- [ ] **FR15** `[Must Have]` If save fails (network error or server error), an inline error message is shown and the typed content is preserved. User can retry without re-typing.
- [ ] **FR16** `[Should Have]` Swipe-down dismissal is supported. If content has been typed, a discard confirmation is shown. If content is empty, dismissal is immediate.

#### Learning Feed — List and Search (3.3.4)

- [ ] **FR17** `[Must Have]` Authenticated users land on the Learning Feed as the first screen after login or app open (if tokens are valid).
- [ ] **FR18** `[Must Have]` The feed displays learnings in reverse-chronological order. Each card shows: content preview (~120 chars, truncated), title if present, relative timestamp ("2 hours ago"), tag badges. Cards use a neutral background — colour lives on tag badges only (see NFR15).
- [ ] **FR19** `[Must Have]` Infinite scroll: next page is fetched automatically when the user scrolls within 3 items of the bottom of the list. Does not fire until the first page is fully displayed.
- [ ] **FR20** `[Must Have]` The feed displays a visible search bar with a magnifying glass icon (Nielsen's heuristic #6 — recognition over recall). Calls the hybrid search API. Minimum query length: 2 characters. Clearing the search input restores the full feed.
- [ ] **FR21** `[Must Have]` A loading indicator (skeleton loader or activity spinner) is shown during initial fetch and search. No empty state is shown while loading.
- [ ] **FR22** `[Must Have]` If the feed is empty, show an empty state with a CTA to create the first learning.
- [ ] **FR23** `[Should Have]` Sort by "Newest first" / "Oldest first". Preference does not need to persist across sessions in this milestone.
- [ ] **FR24** `[Must Have]` When the device has no network connectivity, show an inline banner ("No internet connection") and keep the currently loaded feed visible. Do not crash or show an unhandled error.

#### View Learning Detail

- [ ] **FR25** `[Should Have]` Tapping a learning card opens a detail screen showing full content, title (if any), all tags, and timestamps. Read-only in this milestone.

#### Dark Mode (3.3.5)

- [ ] **FR26** `[Must Have]` The app defaults to dark mode. It respects the device's system appearance setting.
- [ ] **FR27** `[Should Have]` The user can override the system preference from within the app (settings, ≤2 taps from feed). The preference persists across restarts via AsyncStorage.

#### i18n — EN / PT-BR (3.3.6)

- [ ] **FR28** `[Must Have]` All user-facing strings are externalised in `mobile/src/locales/en.json` and `mobile/src/locales/pt-BR.json`. No hardcoded strings in UI components.
- [ ] **FR29** `[Must Have]` Device locale determines the app language on first launch (EN or PT-BR; fallback EN). The word "POK" must not appear anywhere in the UI, error messages, or placeholders.
- [ ] **FR30** `[Should Have]` The user can manually override the language from within the app. The preference persists across restarts.

#### Push Notifications (3.3.7)

- [ ] **FR31** `[Could Have — DEFERRED]` Push notifications are explicitly out of scope for Milestone 3.3. No permission request, no Expo Push Token registration, no notification-triggered navigation.

---

### Non-Functional

#### Performance
- [ ] **NFR1** Learning Feed must display the first page within 2 seconds on a 4G connection.
- [ ] **NFR2** Create Learning screen must open with keyboard visible within 300ms of FAB tap.

#### Security
- [ ] **NFR3** JWT tokens must be stored exclusively in `expo-secure-store`. AsyncStorage is forbidden for token or credential storage.
- [ ] **NFR4** Google OAuth must use PKCE (`expo-auth-session`). No client secret in the app bundle.
- [ ] **NFR5** All API communication uses HTTPS. Plain HTTP is rejected.
- [ ] **NFR6** No debug logging of tokens, email, or learning content in production builds (`__DEV__` guard required).
- [ ] **NFR7** All tokens are cleared from SecureStore on logout — not on uninstall.

#### Accessibility
- [ ] **NFR8** All interactive elements have a minimum touch target of 44×44pt.
- [ ] **NFR9** All interactive elements must have `accessibilityLabel` and/or `accessibilityHint` props set. VoiceOver (iOS) and TalkBack (Android) must be able to navigate the feed, open a learning, and create a new learning without sighted assistance.
- [ ] **NFR10** Text contrast ratio ≥ 4.5:1 in both dark and light modes (WCAG AA). `allowFontScaling` must not be `false` on any `Text` component.

#### Visual & UX
- [ ] **NFR11** Offline write queue is deferred. The app must communicate clearly that saving requires a connection.
- [ ] **NFR12** The mobile app must maintain visual and interaction parity with the web app: same dark mode default, same colour token values (`background`, `surface`, `accent`, `textPrimary`, etc.), same typographic hierarchy. Learners switching between platforms should feel no visual discontinuity.
- [ ] **NFR13** Tag badges display the user-assigned tag colour. Learning cards use a neutral surface colour — no per-card random colours. Colour lives on tags, not cards, to avoid visual noise and maintain web/mobile consistency.

#### Code Quality
- [ ] **NFR14** TypeScript `strict: true`. No `any` in production code paths.
- [ ] **NFR15** The app must work correctly on both Android and iOS. Platform-specific behaviour (keyboard handling, OAuth flow, safe area insets) must be explicitly handled for each platform — no iOS-only assumptions.

#### Testing
- [ ] **NFR16** Unit tests for auth logic (`tokenStore`, `useAuth`, refresh flow) and utility functions. Target: 80% line coverage on `mobile/src/auth/` and `mobile/src/lib/`.
- [ ] **NFR17** E2E tests using Maestro covering critical user journeys: auth redirect, login (email/password), create learning, feed display, search. Tests must pass on both Android emulator and iOS simulator.

---

**Scope:** Mobile

**Explicitly OUT OF SCOPE for Milestone 3.3:**
- Tag creation, management, or AI suggestions from mobile
- Editing or deleting learnings from mobile
- Native password reset flow (redirects to web)
- Audit trail / change history view
- Timeline or tag-grouped visualisation
- AI Connections / related learnings
- Native Google Sign-In SDK (`@react-native-google-signin/google-signin`) — Phase 4 polish
- Biometric authentication (Face ID / fingerprint)
- Offline write queue (create while offline, sync when reconnected)
- Push notifications (FR31 — deferred)
- Public App Store / Play Store publishing (separate milestone — see Dependencies)

---

## Technical Constraints

**Stack:** Mobile (Expo SDK 53, React Native 0.76, managed workflow)

**Technologies:**
- Expo SDK 53, React Native 0.76, TypeScript 5+ (`strict: true`)
- React Navigation 6+ (Stack + BottomTabs)
- `expo-secure-store` (tokens), `@react-native-async-storage/async-storage` (preferences)
- `expo-auth-session` (Google OAuth, PKCE)
- `expo-localization` + `i18n-js` v4 (i18n)
- `react-hook-form` + `zod` + `@hookform/resolvers`
- `react-native-keyboard-aware-scroll-view`
- `@react-native-community/netinfo` (offline detection)
- `react-native-error-boundary` (crash boundary)
- Maestro (E2E tests)
- EAS Build (cloud CI/CD)

**Integration Points:**
- Backend REST API (`/api/v1/*`) — same endpoints as web. **Backend prerequisite (RISK-1):** `/auth/login`, `/auth/register`, `/auth/google`, `/auth/google/complete`, and `/auth/refresh` must return `accessToken` and `refreshToken` fields in the JSON response body (in addition to existing cookies). Web continues to use cookies — no breaking change.
- HuggingFace embeddings — no mobile change; hybrid search already supported by the existing `/poks` endpoint.

**Out of Scope (technical):**
- Next.js / web app changes (except backend auth response — see RISK-1 above)
- Database schema changes
- Expo Router (React Navigation chosen — see ADR below)
- Native Google Sign-In SDK (deferred to Phase 4)

---

## Acceptance Criteria

### AC1 — Email/password login success
**GIVEN** the user is on the Login screen
**WHEN** the user enters valid credentials and taps "Sign In"
**THEN** tokens are stored in SecureStore, and the app navigates directly to the Learning Feed (no welcome screen)

### AC2 — Login failure
**GIVEN** the user enters invalid credentials
**WHEN** the user taps "Sign In"
**THEN** an inline error message is shown in the user's locale, no token is stored, and the user remains on Login

### AC3 — Google OAuth success
**GIVEN** the user taps "Sign in with Google"
**WHEN** the OAuth consent flow via `expo-auth-session` completes
**THEN** tokens are stored in SecureStore and the user lands on the Learning Feed

### AC4 — Tokens in SecureStore only
**GIVEN** the user successfully logs in
**WHEN** the login response is processed
**THEN** the access token and refresh token are stored in `expo-secure-store` under named keys, and no token appears in AsyncStorage

### AC5 — Silent token refresh
**GIVEN** the access token is expired and a valid refresh token is in SecureStore
**WHEN** any API call returns 401
**THEN** the app POSTs to `/auth/refresh` with the refresh token in the request body, stores the new access token, and retries the original request — the user sees no login screen

### AC6 — Redirect to login when refresh fails
**GIVEN** both access and refresh tokens are expired
**WHEN** a 401 triggers a refresh attempt that also returns 401
**THEN** all tokens are cleared from SecureStore and the app navigates to the Login screen

### AC7 — Logout
**GIVEN** the user is authenticated
**WHEN** logout is triggered
**THEN** tokens are removed from SecureStore, the app navigates to Login, and back navigation does not return to the feed

### AC8 — Authenticated user lands on feed
**GIVEN** valid tokens are present in SecureStore
**WHEN** the user opens the app
**THEN** the Learning Feed is the first visible screen — no login screen shown

### AC9 — Single tap to create
**GIVEN** the user is on the feed
**WHEN** the FAB is tapped
**THEN** the Create Learning screen opens with the content field focused and keyboard visible — one tap, no dialog

### AC10 — Save disabled on empty content
**GIVEN** the Create Learning screen is open
**WHEN** the content field is empty or whitespace-only
**THEN** the Save button is disabled

### AC11 — Successful save
**GIVEN** non-empty content is entered
**WHEN** the user taps Save
**THEN** `POST /poks` is called; on 201, the user returns to the feed and the new learning appears at the top

### AC12 — Save failure preserves content
**GIVEN** the user has typed content
**WHEN** Save is tapped and the API call fails (5xx or network timeout)
**THEN** an inline error is shown and the typed content is still present

### AC13 — Swipe dismiss with content
**GIVEN** the Create Learning screen has content typed
**WHEN** the user swipes down
**THEN** a discard confirmation dialog appears; confirming discards and closes; cancelling keeps content

### AC14 — Swipe dismiss without content
**GIVEN** the content field is empty
**WHEN** the user swipes down
**THEN** the screen closes immediately with no confirmation dialog

### AC15 — Learning card content
**GIVEN** the server returns learnings
**WHEN** the feed renders
**THEN** each card shows content preview (truncated at ~120 chars), title if present, relative timestamp, and tag badges with their assigned colours. Card backgrounds are neutral (not coloured).

### AC16 — Search bar recognition
**GIVEN** the user is on the Learning Feed
**WHEN** the feed renders
**THEN** a search bar is visible with a magnifying glass icon, without requiring the user to discover it through interaction

### AC17 — Search calls hybrid endpoint
**GIVEN** the user types ≥2 characters in the search bar
**WHEN** the debounce delay elapses
**THEN** the app calls `GET /poks?keyword=<query>&searchMode=hybrid` and replaces the feed with results

### AC18 — Clearing search restores feed
**GIVEN** an active search query
**WHEN** the user clears the search input
**THEN** the full unfiltered feed is shown

### AC19 — Infinite scroll
**GIVEN** the feed is showing page 0 and more pages exist
**WHEN** the user scrolls to within 3 items of the bottom
**THEN** page 1 is fetched and appended — the list does not scroll to the top

### AC20 — Infinite scroll does not fire immediately
**GIVEN** the feed has just loaded page 0
**WHEN** the items fit within the screen height without scrolling
**THEN** `handleLoadMore` is not triggered

### AC21 — Empty state
**GIVEN** the server returns an empty list
**WHEN** the feed renders
**THEN** an empty state message with a CTA is shown — no error, no skeleton

### AC22 — Offline banner
**GIVEN** the device has no network
**WHEN** the user is on the feed
**THEN** an inline banner ("No internet connection") appears, the existing feed remains visible, and no crash occurs

### AC23 — Dark mode by default
**GIVEN** the device system appearance is dark
**WHEN** the app launches
**THEN** all screens render with the dark colour scheme, matching the web app's visual appearance

### AC24 — Device locale determines language
**GIVEN** the device primary locale is "pt-BR"
**WHEN** the user opens the app
**THEN** all user-facing strings are in Brazilian Portuguese and the string "POK" does not appear anywhere in the UI

### AC25 — English fallback for unsupported locales
**GIVEN** the device locale is not EN or PT-BR (e.g. "fr-FR")
**WHEN** the app launches
**THEN** the app displays in English

### AC26 — No hardcoded strings
**GIVEN** the codebase is reviewed
**WHEN** all `.tsx` files under `mobile/src/` are scanned
**THEN** no user-facing string literals appear outside of i18n translation files

### AC27 — Screen reader navigation (VoiceOver / TalkBack)
**GIVEN** VoiceOver (iOS) or TalkBack (Android) is enabled
**WHEN** the user navigates through the feed, opens a learning, and creates a new learning
**THEN** all interactive elements announce a meaningful label, focus order is logical, and no action requires sighted assistance

### AC28 — Maestro E2E: auth redirect
**GIVEN** no tokens in SecureStore
**WHEN** the app is launched
**THEN** the Maestro flow asserts the Login screen is visible

### AC29 — Maestro E2E: login and feed
**GIVEN** valid credentials
**WHEN** the Maestro flow submits the login form
**THEN** the Learning Feed is visible with at least one learning card

### AC30 — Maestro E2E: create learning
**GIVEN** the user is on the feed
**WHEN** the Maestro flow taps the FAB, enters content, and taps Save
**THEN** the feed is visible and the new learning appears at the top

---

## Implementation Approach

### Architecture

```
RootNavigator (Stack)
├── AuthStack (Stack)      — rendered when !isAuthenticated
│   ├── Login
│   ├── Register
│   ├── ChooseHandle       (Google OAuth new-user flow, receives tempToken param)
│   ├── ForgotPassword
│   └── ResetPassword      (deep link: learnimo://reset-password?token=...)
└── AppTabs (BottomTabs)   — rendered when isAuthenticated
    ├── FeedTab (Stack)
    │   ├── Feed           (root; FAB navigates to LearningNew)
    │   ├── LearningDetail
    │   └── LearningNew
    ├── SearchTab (Stack)
    │   └── Search
    └── ProfileTab (Stack)
        └── Profile
```

**Auth guard:** Conditional rendering in `RootNavigator` — never redirects inside screens.

```typescript
// src/navigation/RootNavigator.tsx
if (authLoading || themeLoading) return <SplashScreen />;
return isAuthenticated ? <AppTabs /> : <AuthStack />;
```

**Session initialisation:**
```
App launch
  └── Read SecureStore 'learnimo:access_token'
      ├── Found → GET /auth/me { Authorization: Bearer <token> }
      │           ├── 200 → setUser(data)
      │           └── 401 → POST /auth/refresh { refreshToken: <refresh_token> }
      │                       ├── 200 → store new access_token, retry /auth/me
      │                       └── fail → clear tokens, setUser(null)
      └── Not found → setUser(null)
```

**AppState listener:** When the app transitions from background to active, proactively call `/auth/me` to detect expired tokens before the first user-triggered API call.

**Token storage module:**
```typescript
// src/lib/tokenStore.ts
// In-memory cache for fast synchronous reads; SecureStore for persistence.
// All auth code reads/writes tokens through this module only.
let accessToken: string | null = null;
let refreshToken: string | null = null;
export const tokenStore = {
  getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clear
};
```

**apiFetch (mobile adaptation):**
- Reads Bearer token from `tokenStore` (sync, in-memory)
- Injects `Authorization: Bearer <token>` header
- On 401: POSTs to `/auth/refresh` with `{ refreshToken }` in body, stores new token, retries once
- On refresh failure: emits auth event → `AuthContext` clears state → `RootNavigator` renders `AuthStack`
- Uses `AbortController` signal for cancellation

**Optimistic create flow:** `LearningNew` owns the full API call. On success it navigates back with a confirmed `Pok` object as a route param. `Feed` receives it and prepends to the list. No speculative prepend before confirmation (MVP — add optimistic in a polish pass).

**Offline detection:** `@react-native-community/netinfo` subscription in a global `useNetworkStatus` hook. Drives a persistent banner in `Feed` and blocks Save in `LearningNew` with a clear error.

**Error boundary:** `react-native-error-boundary` wraps the navigator root with a fallback UI and retry button.

**Deep links:** `scheme: "learnimo"` in `app.json`. React Navigation `linking` prop on `NavigationContainer` maps `learnimo://reset-password` → `ResetPassword` screen in `AuthStack`. `expo-linking` handles incoming URLs.

**Theme loading gate:** `ThemeProvider` reads AsyncStorage async on mount. `themeLoading` stays `true` until resolved. `RootNavigator` gates on both `authLoading` and `themeLoading` to prevent colour flicker on cold launch.

**Theme token parity with web:** `darkTokens` and `lightTokens` in `src/theme/tokens.ts` must match the web's Tailwind colour values exactly (background, surface, accent, text, border, error, success). This is the mechanism for NFR12 — same visual language, one source of truth per platform, kept in sync manually until a shared package is introduced.

**Keyboard handling — LearningNew:** `react-native-keyboard-aware-scroll-view` for auth screens. For `LearningNew`: multiline `TextInput` with `onContentSizeChange` for auto-height (min 200, max 60% screen height). `KeyboardToolbar` component pinned above keyboard contains Save button. Android: `windowSoftInputMode: "adjustResize"` in `app.json`.

**Data fetching — AbortController:** All data-fetching hooks use `AbortController` for cleanup:
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, [deps]);
```

**i18n:** Translation files copied from `web/src/locales/` to `mobile/src/locales/`. Sync via `npm run sync-locales`. `useTranslations(namespace)` hook mirrors next-intl API shape. Locale falls back to EN for unsupported device locales.

**Windows/Metro note:** Set `EXPO_USE_METRO_WORKSPACE_ROOT=1` or configure `watchFolders` in `metro.config.js` if Metro misses file changes in the monorepo.

### Architectural Decisions

**ADR: React Navigation over Expo Router**
- Options: React Navigation 6, Expo Router
- Chosen: React Navigation 6
- Rationale: Conditional auth guard via conditional rendering is cleaner than Expo Router's `(auth)` group layouts, which have known gotchas. Team has Next.js familiarity but not Expo Router. Deep links can be configured explicitly via the `linking` prop.

**ADR: expo-auth-session for Google OAuth (not native SDK)**
- Options: `expo-auth-session` (PKCE, browser tab), `@react-native-google-signin/google-signin` (native sheet)
- Chosen: `expo-auth-session` for Milestone 3.3
- Rationale: Works with Expo Go for development iteration. No native module setup, no `google-services.json` / `GoogleService-Info.plist` required. The backend receives the same ID token either way. Upgrade to native SDK in Phase 4 for polish.

**ADR: Expo SDK 53 (managed workflow)**
- Chosen: Expo SDK 53 (latest stable as of 2026-02)
- Rationale: SDK 50 is outdated. Managed workflow avoids native module configuration overhead at MVP stage.

**ADR: Maestro for E2E tests (not Detox)**
- Options: Maestro, Detox
- Chosen: Maestro
- Rationale: Maestro requires minimal setup — YAML-based flows run directly on emulator/simulator with no native build configuration. Detox is more mature and grey-box (closer integration with the React Native runtime), but requires native builds, complex CI configuration, and significant setup overhead that is not justified at MVP stage. If the app scales to many more features, or Maestro proves insufficiently reliable for critical regressions, revisit Detox at that point.

**ADR: Colours on tags, not cards**
- Options: (1) tag badges coloured only, cards neutral; (2) cards tinted by dominant tag colour; (3) cards randomly coloured (post-it style)
- Chosen: Option 1 — tag badges coloured, cards neutral
- Rationale: Tag colours are already part of the data model (`UserTag.color`). Adding independent card colours creates two competing colour systems and visual noise. Keeping cards neutral maintains web/mobile consistency (NFR12) and lets tag colours stand out clearly.

### Test Strategy

- [ ] Partial TDD — tests first for: auth logic (`tokenStore`, `useAuth`, refresh flow), `useFeedData`, `useSearchData`, form validation (Zod schemas)
- [ ] Component tests with `@testing-library/react-native` for `LearningCard`, `LearningForm`, `LoginForm`
- [ ] Maestro E2E flows: auth redirect (AC28), login + feed (AC29), create learning (AC30)
- [ ] Manual testing required for keyboard behaviour (LearningNew) and screen reader navigation (AC27) on both Android and iOS

### File Changes

**New — `mobile/`:**

```
app.json                          — Expo config, scheme, iOS/Android identifiers
app.config.ts                     — Dynamic config (API_URL, GOOGLE_CLIENT_ID env vars)
eas.json                          — EAS Build profiles (development, preview, production)
package.json                      — All dependencies
tsconfig.json                     — TypeScript, strict: true, path aliases (@/ → src/)
babel.config.js                   — Expo preset + module-resolver
.env.example                      — EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_CLIENT_ID
metro.config.js                   — Monorepo watchFolders config

src/App.tsx                       — Root: wraps AuthProvider, ThemeProvider, I18nProvider, NavigationContainer

src/navigation/
  RootNavigator.tsx               — Conditional auth/app navigator + deep link config
  AuthStack.tsx                   — Login/Register/ChooseHandle/ForgotPassword/ResetPassword
  AppTabs.tsx                     — Feed/Search/Profile bottom tabs
  types.ts                        — Route param types for all navigators

src/screens/auth/
  LoginScreen.tsx
  RegisterScreen.tsx
  ChooseHandleScreen.tsx
  ForgotPasswordScreen.tsx
  ResetPasswordScreen.tsx

src/screens/feed/
  FeedScreen.tsx                  — Feed with FAB, SearchBar (with magnifying glass icon), SortSheet
  LearningDetailScreen.tsx        — Read-only detail
  LearningNewScreen.tsx           — Compose; KeyboardToolbar; owns full API call

src/screens/search/
  SearchScreen.tsx                — Dedicated search tab

src/screens/profile/
  ProfileScreen.tsx               — Theme toggle, language selector, logout

src/contexts/
  AuthContext.tsx                 — Adapted from web; SecureStore + Bearer token
  ThemeContext.tsx                — dark/light, AsyncStorage, themeLoading gate
  I18nContext.tsx                 — locale, AsyncStorage, expo-localization

src/hooks/
  useAuth.ts                      — Port of web useAuth (identical)
  useFeedData.ts                  — Mobile adaptation of usePoksData (no URL, AbortController)
  useLearningDetail.ts
  useSearchData.ts                — Isolated search state
  useTags.ts                      — Port of web useTags (identical)
  useHandleAvailability.ts        — Port of web (identical)
  useDebounce.ts                  — Port of web (identical)
  useNetworkStatus.ts             — @react-native-community/netinfo subscription
  useTheme.ts                     — Returns tokens + isDark + toggle
  useI18n.ts                      — Returns locale, setLocale, t
  useTranslations.ts              — Scoped t(key), mirrors next-intl API shape

src/lib/
  api.ts                          — Mobile adaptation: Bearer token injection, AbortController
  auth.ts                         — Port of web auth.ts (identical)
  pokApi.ts                       — Port of web pokApi.ts (identical)
  tagApi.ts                       — Port of web tagApi.ts (identical)
  tokenStore.ts                   — In-memory cache + SecureStore persistence (new)
  validations.ts                  — Port of web validations.ts (identical)
  validations/pokSchema.ts        — Port of web pokSchema.ts (identical)
  i18n.ts                         — i18n-js instance, EN + PT-BR, enableFallback=true

src/theme/
  tokens.ts                       — darkTokens, lightTokens — values match web Tailwind colours

src/locales/
  en.json                         — Copied from web/src/locales/en.json
  pt-BR.json                      — Copied from web/src/locales/pt-BR.json

src/components/
  auth/LoginForm.tsx
  auth/RegisterForm.tsx
  auth/PasswordInput.tsx          — SecureTextEntry toggle
  auth/HandleInput.tsx            — Input + availability indicator
  auth/GoogleSignInButton.tsx     — expo-auth-session PKCE flow
  learnings/LearningCard.tsx      — Pressable, neutral background, title/preview/tags/date
  learnings/LearningList.tsx      — FlatList, pull-to-refresh, load-more, empty state
  learnings/LearningForm.tsx      — react-hook-form + Zod, keyboard-aware
  learnings/DeleteConfirmSheet.tsx
  search/SearchInput.tsx          — TextInput + magnifying glass icon + clear button
  search/SearchBar.tsx            — Visible search bar for feed header
  ui/Button.tsx
  ui/Input.tsx                    — TextInput wrapper, label, error, theme tokens
  ui/FormField.tsx
  ui/FAB.tsx
  ui/KeyboardToolbar.tsx          — Pinned above keyboard, Save/Cancel
  ui/Spinner.tsx
  ui/Toast.tsx
  ui/SortSheet.tsx
  ui/NetworkBanner.tsx            — Offline indicator banner
  ui/ErrorBoundary.tsx            — react-native-error-boundary wrapper

e2e/
  auth-redirect.yaml              — Maestro: AC28
  login-feed.yaml                 — Maestro: AC29
  create-learning.yaml            — Maestro: AC30
```

**Modified — `mobile/`:**
- `mobile/package.json` — populated with all dependencies
- `mobile/CLAUDE.md` — updated with tech decisions, key commands, sync-locales note

**Modified — `backend/`:**
- Auth endpoints (`/auth/login`, `/auth/register`, `/auth/google`, `/auth/google/complete`, `/auth/refresh`) — add `accessToken` and `refreshToken` fields to JSON response bodies alongside existing `Set-Cookie` headers. Web behaviour unchanged.

---

## Dependencies

**Blocked by:**
- Backend auth response body change (RISK-1) — tokens must be in JSON body for mobile to read them. Must be resolved before 3.3.2 can be tested end-to-end.

**Blocks:**
- Milestone 3.3.7 (Push Notifications) — deferred to a future milestone
- Phase 4 polish: native Google Sign-In SDK upgrade
- **Public App Store / Play Store publishing** — internal distribution (TestFlight / Play Store internal track) is in scope via EAS Build (FR4). Public publishing requires Apple Developer Program membership ($99/year), App Store review, Play Store release management, and app store metadata (screenshots, descriptions). This is a dedicated future milestone, not part of 3.3.

**External:**
- Expo account + EAS Build setup (free tier sufficient for internal distribution)
- Google Cloud Console: OAuth client IDs for iOS and Android (in addition to existing web client)
- Apple Developer account (for TestFlight internal distribution)
- Google Play Console (for Play Store internal track)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits

### Architectural Decisions

### Deviations from Spec

### Lessons Learned
