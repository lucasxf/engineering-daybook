# Settings Persistence (Theme + Locale)

> **Status:** Implemented
> **Created:** 2026-03-29
> **Implemented:** 2026-03-31

---

## Context

Users can change their theme (light / dark / system) and locale (EN / PT-BR) on the Profile screen. These settings currently exist only in React state — they reset to defaults on every app restart. This is a closed-testing issue (#3 + #4 in the v1.0.19 triage).

The fix is minimal: the backend `User` table already has `locale` (VARCHAR 10) and `theme` (VARCHAR 10) columns. They just need to be wired into the existing `PATCH /users/me/settings` endpoint and exposed via `/auth/me`. Bundled with this is #4 — the ProfileScreen has no visual feedback after theme/locale changes, which this feature also adds.

**Related:**
- Triage plan: `docs/plans/closed-testing-triage-v1.0.19.md` — items #3 and #4
- `ROADMAP.phase-1.md` — Milestone 1.8 Closed Testing Fixes

---

## Requirements

### Functional

- [ ] **FR1:** When an authenticated user changes the theme (light / dark / system) on the Profile screen, the app auto-saves the new value via `PATCH /users/me/settings` without requiring a separate Save action. `mobile`
- [ ] **FR2:** When an authenticated user changes the locale (EN / PT-BR) on the Profile screen, the app auto-saves the new value via `PATCH /users/me/settings` without requiring a separate Save action. `mobile`
- [ ] **FR3:** On session initialisation, the app restores the user's saved theme and locale from the `/auth/me` response and applies them before the first screen renders. `mobile`
- [ ] **FR4:** A first-time user's `theme` and `locale` are `null` in the `/auth/me` response (DB columns have no default); the mobile client treats `null` as "unset" and falls through to system/device defaults — system theme (tracks OS appearance) and locale derived from the device locale. `mobile` `backend`
- [ ] **FR5:** After an auto-save completes (success or failure), the Profile screen displays a brief, non-blocking visual confirmation in the active locale. `mobile`
- [ ] **FR6:** If the `PATCH /users/me/settings` request fails, the UI reverts the picker to the previous value and shows an error message; the locally active setting is not permanently changed. `mobile`
- [ ] **FR7:** Theme and locale pickers are disabled while a save is in flight, preventing concurrent conflicting requests. `mobile`

### Non-Functional

- [ ] **NFR1:** Settings restoration must be a zero-cost byproduct of the existing `/auth/me` call — no additional network request or loading gate introduced on session init. `mobile`
- [ ] **NFR2:** Theme and locale must be applied before the first meaningful frame renders — no visible flash of wrong theme or untranslated strings on launch. `mobile`
- [ ] **NFR3:** All new user-facing strings must have translations in both `en.ts` and `pt-BR.ts`. `mobile`
- [ ] **NFR4:** No `AsyncStorage` dependency — persistence is backend-only (Option B from triage analysis). `mobile`

---

## Technical Constraints

**Stack:** Full-stack (Backend Java/Spring + Mobile Expo/React Native)

**Technologies:** Spring Boot 4, Java records, Flyway (no new migration needed), Expo SDK 53, React Native 0.79.6, TypeScript 5

**Integration Points:**
- `UserSettingsController.java` — `PATCH /users/me/settings` — extend request DTO
- `AuthController.java` / `AuthResponse` — `/auth/me` — extend response DTO
- `UserService.java` — add `updateTheme()` and `updateLocale()` methods
- `mobile/src/lib/userApi.ts` — extend `UpdateUserSettingsPayload`
- `mobile/src/lib/auth.ts` — extend `AuthResponse` type + `getMeApi()` return
- `mobile/src/contexts/AuthContext.tsx` — pass `theme`/`locale` to ThemeContext and I18nContext on init
- `mobile/src/contexts/ThemeContext.tsx` — accept initial override from user object
- `mobile/src/contexts/I18nContext.tsx` — accept initial locale from user object
- `mobile/src/screens/app/ProfileScreen.tsx` — wire auto-save + feedback for theme/locale

**Flyway migration required:** `V22__make_theme_locale_nullable.sql` drops the `NOT NULL` defaults from `User.locale` and `User.theme` so both columns accept `null` for first-time users (FR4). The columns already exist from a prior migration; no new columns are added.

**Out of Scope:**
- Web app settings persistence (separate concern, different auth architecture)
- AsyncStorage / local cache (Option A/C from triage — deferred)
- Push notification settings
- Any new Profile screen fields

---

## Acceptance Criteria

### AC1: Theme persists across sessions
**GIVEN** an authenticated user has set their theme to `dark` and the auto-save request succeeds
**WHEN** the user force-quits the app and relaunches it
**THEN** the app restores `dark` from the `/auth/me` response before any screen renders, with no flash of the default theme

### AC2: Locale persists across sessions
**GIVEN** an authenticated user has set their locale to `pt-BR` and the auto-save request succeeds
**WHEN** the user force-quits the app and relaunches it
**THEN** all UI strings are rendered in Portuguese before the first screen is visible

### AC3: New user receives default theme and locale
**GIVEN** a user signs in for the first time with no saved `theme` or `locale` on their account (both are `null` in the API response)
**WHEN** the app completes session initialisation
**THEN** the active theme is `system` (tracks OS appearance) and locale defaults to `pt-BR` if the device locale tag starts with `pt`, otherwise `en`

### AC4: Save feedback is displayed on successful change
**GIVEN** an authenticated user changes the theme picker from `light` to `system`
**WHEN** the `PATCH /users/me/settings` request returns 204
**THEN** a non-blocking success indicator appears on the Profile screen within 300 ms, localised to the active locale, and disappears automatically

### AC5: Failed save reverts the picker and shows an error
**GIVEN** an authenticated user taps the locale picker to change from `en` to `pt-BR`
**AND** the save request fails (network error or 5xx)
**WHEN** the error is returned
**THEN** the locale picker reverts to `en`, the previously active locale remains in effect, and a localised error message is shown

### AC6: Picker is disabled while a save is in flight
**GIVEN** an authenticated user taps the theme picker triggering a `PATCH` request
**WHEN** the request has not yet completed
**THEN** both theme and locale pickers are in a disabled/non-interactive state

### AC7: Unauthenticated state — no settings request is made
**GIVEN** the user is not authenticated
**WHEN** the app launches
**THEN** no `PATCH /users/me/settings` request is issued; theme defaults to `system`; locale defaults to device locale

---

## Screens

### Screen: Profile Settings (modified)

**Purpose:** Persist user theme and locale preferences to the backend immediately on selection, replacing the previous in-memory-only behavior. Also adds visual save feedback.

**Route:** N/A (native bottom-tab screen)

**Layout:**
1. [Theme Row] — unchanged visually; tapping an option now triggers a save + shows `<SettingsSaveIndicator>` below the row
2. [Locale Row] — unchanged visually; same save + indicator behavior

**Components:**
- `<ProfileScreen>` → theme row and locale row each gain a `<SettingsSaveIndicator>` rendered below the row — a brief inline text that fades out after ~2 s on success, or persists on error

**States:**
- Saving (theme): selected option shows activity indicator; row is `accessibilityState={{ busy: true }}` and non-interactive
- Saving (locale): same as saving (theme)
- Save success: `<SettingsSaveIndicator>` shows success message for ~2 s then auto-hides
- Save error: `<SettingsSaveIndicator>` shows error message; previously selected option restored
- Populated: no visible change from current state

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `profile.themeSaved` | Theme saved | Tema salvo |
| `profile.localeSaved` | Language saved | Idioma salvo |
| `profile.saveError` | Couldn't save, try again | Não foi possível salvar, tente novamente |

**Interactions:**
- Theme option tap → optimistically update local state + call `updateUserSettings({ theme })` → on success show `themeSaved` indicator; on error rollback + show `saveError`
- Locale option tap → optimistically update local state + call `updateUserSettings({ locale })` → on success show `localeSaved` indicator + call `setAppLocale()` to apply immediately; on error rollback + show `saveError`

**Accessibility:**
- Rows in saving state: `accessibilityState={{ busy: true }}`
- `<SettingsSaveIndicator>` uses `accessibilityLiveRegion="polite"` so TalkBack/VoiceOver announces success/error without stealing focus

---

## Implementation Approach

### Architecture

**Backend (minimal extension):**
1. `UpdateUserSettingsRequest` record: add `String theme` and `String locale` fields
2. `UserService`: add `updateTheme(UUID, String)` and `updateLocale(UUID, String)` methods (identical pattern to `updateBio` / `updateDisplayName`)
3. `UserSettingsController.updateSettings()`: add null-guarded calls for the two new fields
4. `AuthResponse`: add `String theme` and `String locale` fields
5. `AuthController.me()`: populate `theme` and `locale` from the `User` entity in the response

**Mobile (context wiring):**
1. `userApi.ts`: extend `UpdateUserSettingsPayload` with `theme?: string` and `locale?: string`
2. `auth.ts` / `AuthResponse` type: add `theme?: string | null` and `locale?: string | null`
3. `AuthContext`: after `setUserState(me)` in `initSession()`, call `onSettingsRestored(me.theme, me.locale)` callback
4. `App.tsx`: wire `onSettingsRestored` prop on `<AuthProvider>` → calls `setOverride(theme ?? 'system')` and `setAppLocale(locale ?? getDeviceLocale())`
5. `ProfileScreen`: wrap `handleThemeChange` and `handleLocaleChange` to call `updateUserSettings()`, manage `isSavingTheme` / `isSavingLocale` state, implement optimistic rollback on error, render `<SettingsSaveIndicator>`

**Context init pattern:** `App.tsx` already renders `<ThemeProvider><I18nProvider><AuthProvider>`. `AuthContext` cannot directly import `setOverride` from `ThemeContext` (circular scope). Solution: `AuthProvider` accepts an `onSettingsRestored?: (theme: string | null, locale: string | null) => void` callback prop, wired in `App.tsx`.

### Test Strategy

- [ ] Partial TDD — tests first for: backend service methods, mobile ProfileScreen save flows
- Backend: extend `UserServiceTest` for `updateTheme` + `updateLocale`; extend `AuthIntegrationTest` to assert `theme` + `locale` in `/me` response
- Mobile: `ProfileScreen.test.tsx` — theme-change auto-save, locale-change auto-save, error rollback, disabled state during save

### File Changes

**Backend — Modified:**
- `backend/src/main/java/com/lucasxf/ed/dto/UpdateUserSettingsRequest.java` — add `theme`, `locale` fields
- `backend/src/main/java/com/lucasxf/ed/service/UserService.java` — add `updateTheme()`, `updateLocale()`
- `backend/src/main/java/com/lucasxf/ed/controller/UserSettingsController.java` — add null-guarded calls for new fields
- `backend/src/main/java/com/lucasxf/ed/dto/AuthResponse.java` — add `theme`, `locale` fields
- `backend/src/main/java/com/lucasxf/ed/controller/AuthController.java` — populate `theme`, `locale` in `/me` response
- `backend/src/test/java/com/lucasxf/ed/service/UserServiceTest.java` — add tests for `updateTheme`, `updateLocale`
- `backend/src/test/java/com/lucasxf/ed/integration/AuthIntegrationTest.java` — assert `theme` + `locale` in `/me` response

**Mobile — Modified:**
- `mobile/src/lib/userApi.ts` — extend `UpdateUserSettingsPayload`
- `mobile/src/lib/auth.ts` — extend `AuthResponse` type
- `mobile/src/contexts/AuthContext.tsx` — add `onSettingsRestored` callback prop
- `mobile/src/App.tsx` — wire `onSettingsRestored` → `setOverride` + `setAppLocale`
- `mobile/src/screens/app/ProfileScreen.tsx` — auto-save theme/locale + `<SettingsSaveIndicator>` + disabled state
- `mobile/src/i18n/locales/en.ts` — add `profile.themeSaved`, `profile.localeSaved`, `profile.saveError`
- `mobile/src/i18n/locales/pt-BR.ts` — same keys in Portuguese

**Mobile — New:**
- `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx` — auto-save theme/locale, error rollback, saving state

---

## Implementation Plan

### Task 1: Extend backend settings endpoint and `/auth/me` response

- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/dto/UpdateUserSettingsRequest.java`
  - `backend/src/main/java/com/lucasxf/ed/service/UserService.java`
  - `backend/src/main/java/com/lucasxf/ed/controller/UserSettingsController.java`
  - `backend/src/main/java/com/lucasxf/ed/dto/AuthResponse.java`
  - `backend/src/main/java/com/lucasxf/ed/controller/AuthController.java`
  - `backend/src/test/java/com/lucasxf/ed/service/UserServiceTest.java`
  - `backend/src/test/java/com/lucasxf/ed/integration/AuthIntegrationTest.java`
- **Depends on:** _none_
- **Commit:** `feat(backend): expose theme and locale in settings and /auth/me endpoints`
- **Stack:** backend

### Task 2: Extend mobile API types and restore settings on session init

- **Files:**
  - `mobile/src/lib/userApi.ts`
  - `mobile/src/lib/auth.ts`
  - `mobile/src/contexts/AuthContext.tsx`
  - `mobile/src/App.tsx`
- **Depends on:** Task 1
- **Commit:** `feat(mobile): restore theme and locale from /auth/me on session init`
- **Stack:** mobile

### Task 3: Wire ProfileScreen auto-save with feedback and tests

- **Files:**
  - `mobile/src/screens/app/ProfileScreen.tsx`
  - `mobile/src/i18n/locales/en.ts`
  - `mobile/src/i18n/locales/pt-BR.ts`
  - `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx`
- **Depends on:** Task 2
- **Commit:** `feat(mobile): auto-save theme and locale on ProfileScreen with feedback`
- **Stack:** mobile

---

## Dependencies

**Blocked by:** None — backend columns already exist

**Blocks:** None

**External:** None

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits

- `1f0613d` — feat(backend): expose theme and locale in settings and /auth/me endpoints
- `8f71e8c` — feat(mobile): restore theme and locale from /auth/me on session init
- `a97e2cf` — feat(mobile): auto-save theme and locale on ProfileScreen with feedback

### Architectural Decisions

- **Callback prop pattern for context wiring** — `AuthProvider` accepts `onSettingsRestored` callback rather than importing `ThemeContext`/`I18nContext` directly, avoiding circular scope since `AppContent` lives inside both providers.
- **Backend-only persistence (Option B)** — No `AsyncStorage` dependency; `theme` and `locale` are stored in the `users` table (columns already existed) and restored via the existing `/auth/me` call at zero extra cost.
- **Locale normalization on mobile** — Backend stores `"EN"` (uppercase default); mobile normalizes with `startsWith('pt')` check to map to the `Locale` type (`'en'` | `'pt-BR'`).

### Deviations from Spec

- `UserSettingsControllerTest` also required updating (8 constructor call-sites for `UpdateUserSettingsRequest` now need 2 extra `null` args for `theme` and `locale`) — not listed in spec's File Changes but was a necessary fix.

### Lessons Learned

- **Java record expansion always breaks test constructors** — Adding fields to a DTO record requires updating every test that constructs it. Consider adding a builder or a convenience factory if the record has many optional fields.
