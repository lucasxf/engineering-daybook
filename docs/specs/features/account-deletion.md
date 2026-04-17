# Account Deletion

> **Status:** Approved
> **Created:** 2026-04-17
> **Implemented:** _pending_

---

## Context

Apple rejected the learnimo iOS app (v1.0, build 28) on 2026-04-17 under **Guideline 5.1.1(v)** (App Privacy — Account Deletion). Apps that allow account creation must provide an in-app mechanism for users to permanently delete their accounts. Without this, every future submission will be rejected.

**Deletion semantics decided upfront:** anonymize user row + hard-delete all owned content. PII is nulled and replaced with non-identifiable values, `deleted_at` is set, unique indices become partial (active-only), and all owned content is cascaded away. Deletion is irreversible — no grace period, no recovery.

**Related:**
- `docs/plans/apple-rejection-2026-04-17.md` — full remediation plan (Spec C)
- `docs/specs/features/sign-in-with-apple.md` — shares `UserService` (merge conflict risk)

---

## Requirements

### Functional

- [ ] **FR1 — `DELETE /api/v1/users/me` endpoint** *(Must Have)*
  Auth-required REST endpoint. Returns `204 No Content` on success. Idempotent (second call on already-deleted user also returns 204, not 404).

- [ ] **FR2 — `UserService.deleteAccount(UUID userId)` transactional method** *(Must Have)*
  Cascade hard-delete in this order: PokShare (by user + by POK) → Follow (both directions) → PokTag (per POK) → PokAuditLog (per POK) → Pok → UserTag → RefreshToken → avatar blob → anonymize User row. Single `@Transactional(rollbackFor = Exception.class)` — all-or-nothing.

- [ ] **FR3 — User anonymization** *(Must Have)*
  Private helper called by `deleteAccount`. Nulls PII: `name`, `bio`, `avatarUrl`, `passwordHash`. Rewrites `email` → `deleted-{id}@deleted.learnimo.net`; `handle` → `deleted_{id}` where `{id}` is the UUID with hyphens replaced by underscores (e.g. `deleted_c1b5e3f5_1234_5678_abcd_ef1234567890`). Sets `deletedAt = Instant.now()`.

- [ ] **FR4 — Flyway migration V23** *(Must Have)*
  Add `users.deleted_at TIMESTAMPTZ`. Drop `idx_users_email` and `idx_users_handle`. Recreate both as partial unique indices `WHERE deleted_at IS NULL`. Extend `handle` column to `VARCHAR(64)` (anonymized handle embeds a UUID, exceeds current VARCHAR(30)).

- [ ] **FR5 — JPA `@Where` on User entity** *(Must Have)*
  Annotate User class with `@org.hibernate.annotations.Where(clause = "deleted_at IS NULL")` so all JPA queries silently exclude deleted users. Add `deletedAt` (`Instant`) field + getter.

- [ ] **FR6 — Mobile: Delete Account button in ProfileScreen** *(Must Have)*
  Destructive button (`variant="danger"`, `fullWidth`) below the Logout button. Pressing it starts the two-step confirmation (FR7).

- [ ] **FR7 — Mobile: Two-step confirmation flow** *(Must Have)*
  Step 1 — `Alert.alert` warning (Cancel | Continue). Step 2 — `DeleteAccountModal`: typed-handle text input; confirm button disabled until input exactly matches `user.handle` (case-sensitive, strict string equality `===`); on confirm calls `deleteAccountApi()`. The modal displays the user's exact handle so they know what to type.

- [ ] **FR8 — Mobile: i18n keys `profile.deleteAccount.*`** *(Must Have)*
  Both `mobile/src/i18n/locales/en.ts` and `pt-BR.ts`. Keys: `button`, `warningTitle`, `warningMessage`, `warningCancel`, `warningOk`, `modalTitle`, `modalDescription`, `modalWarning`, `confirmLabel`, `confirmPlaceholder`, `confirmMismatch`, `deleting`, `confirm`, `cancel`, `error`.

- [ ] **FR9 — Mobile: `deleteAccountApi()` in `userApi.ts`** *(Must Have)*
  `apiFetch<void>('/users/me', { method: 'DELETE' })`. No request body. Matches existing `deleteAvatar` pattern.

- [ ] **FR10 — Mobile: Post-deletion logout flow** *(Must Have)*
  On `deleteAccountApi()` success: `tokenStore.clear()` → `logout()` from AuthContext → navigation to LoginScreen handled automatically by RootNavigator's `status === 'unauthenticated'` gate.

- [ ] **FR11 — Mobile: Error handling in confirmation modal** *(Must Have)*
  On API error: show error message inside modal, re-enable confirm button, keep modal open. User can retry or cancel.

- [ ] **FR12 — Mobile: Cancellation at any step** *(Must Have)*
  Cancel from the warning alert or confirmation modal returns to ProfileScreen with no side effects and no state leak.

**Scope:** `full-stack (backend + mobile)`

### Non-Functional

- [ ] **NFR1 — Transactional integrity** *(Must Have)*: `@Transactional` wraps all cascade operations. Any failure rolls back completely — no partial deletion.

- [ ] **NFR2 — Idempotency** *(Must Have)*: A second `DELETE /api/v1/users/me` call with the same user ID returns `204`, not an error. (In practice the token is revoked on first deletion; the guard protects against token-replay edge cases.)

- [ ] **NFR3 — GDPR / right to be forgotten** *(Must Have)*: All PII nulled immediately. No soft-delete on content — everything is hard-deleted. `deleted_at` retained for audit only. Avatar blob removed from Supabase Storage.

- [ ] **NFR4 — Irreversibility** *(Must Have)*: No recovery mechanism, no grace period, no deactivation state. Typed-handle confirmation minimises accidental deletions.

- [ ] **NFR5 — Performance** *(Should Have)*: Full deletion of a user with 1 000 POKs and 100 tags completes under 5 seconds.

- [ ] **NFR6 — Security** *(Must Have)*: Auth required on the endpoint. User can only delete themselves (userId extracted from JWT, never from request body). All tokens revoked before the response is returned.

---

## Technical Constraints

**Stack:** Backend (Spring Boot 4 / Java 21) + Mobile (Expo / React Native)

**Technologies:**
- Backend: Spring Data JPA, Flyway, PostgreSQL 15, `@org.hibernate.annotations.Where`
- Mobile: Expo SDK 50+, React Native `Modal`, `Alert`, `apiFetch` wrapper, `tokenStore`

**Integration Points:**
- `UserSettingsController` — adds `DELETE /me` alongside existing `PATCH /settings`, `POST /avatar`, `DELETE /avatar`
- `AvatarService.delete(userId)` calls back into `UserService.updateAvatarUrl()` — **circular dependency risk**: in `deleteAccount()`, call `storageService.delete(userId)` directly instead of routing through `AvatarService`, since `avatarUrl` will be nulled in `anonymizeUser()` anyway. `StorageService.delete()` must be safe to call when no blob exists (no-op / does not throw); verify this contract before implementation and add a guard or catch if the implementation throws on a missing blob.
- `feat/sign-in-with-apple` will also modify `UserService` — known merge conflict; resolve on whichever branch lands second.

**Out of Scope:**
- Account-deletion UI on web (not required by Apple Guideline 5.1.1(v))
- Email notification to deleted user
- Account recovery / grace period
- Anonymous content preservation after deletion

---

## Acceptance Criteria

### AC1: Happy path — backend deletes and anonymizes
**GIVEN** an authenticated user with 5 POKs, 3 tags, and an avatar
**WHEN** `DELETE /api/v1/users/me` is called with a valid JWT
**THEN** response is `204 No Content` / all POKs, tags, PokTags, PokAuditLogs, PokShares, Follows, RefreshTokens are hard-deleted / avatar blob removed / `users.email` → `deleted-{id}@deleted.learnimo.net`, `handle` → `deleted_{id}`, `deleted_at` set, PII nulled

### AC2: Idempotency
**GIVEN** a user whose account was already deleted
**WHEN** `DELETE /api/v1/users/me` is called again
**THEN** response is `204 No Content` (no error, no state change)

### AC3: Unauthenticated request rejected
**GIVEN** no JWT (or invalid/expired token)
**WHEN** `DELETE /api/v1/users/me` is called
**THEN** response is `401 Unauthorized` and no data is touched

### AC4: Re-login fails after deletion
**GIVEN** user with email `alice@example.com` who is then deleted
**WHEN** a login attempt is made with `alice@example.com`
**THEN** login fails (email no longer exists in active users)

### AC5: Email and handle become reusable
**GIVEN** user `alice@example.com` / handle `alice` was deleted
**WHEN** a new user registers with the same email and handle
**THEN** registration succeeds (partial indices allow reuse)

### AC6: Full cascade — no orphaned rows
**GIVEN** user with POKs, PokShares, Follows, RefreshTokens
**WHEN** account is deleted
**THEN** zero rows referencing that userId remain in any dependent table

### AC7: Transactional rollback on failure
**GIVEN** a user with 10 POKs
**WHEN** `deleteAccount()` encounters a constraint violation mid-way
**THEN** the transaction rolls back entirely — user not anonymized, no POKs deleted

### AC8: @Where filters deleted users
**GIVEN** user `alice` is deleted and anonymized
**WHEN** `userRepository.findByHandle("alice")` is called
**THEN** returns empty (deleted user is invisible to JPA queries)

### AC9: Partial indices allow handle reuse
**GIVEN** deleted user whose original handle was `alice`
**WHEN** a new user registers with handle `alice`
**THEN** no uniqueness constraint error

### AC10: Mobile — delete button renders below logout
**GIVEN** authenticated user on ProfileScreen
**WHEN** screen loads
**THEN** a full-width red "Delete Account" button is visible below the Logout button

### AC11: Mobile — warning alert appears on press
**GIVEN** ProfileScreen is visible
**WHEN** user presses "Delete Account"
**THEN** `Alert.alert` warning fires with Cancel and Continue (destructive) buttons

### AC12: Mobile — cancel from warning returns to ProfileScreen
**GIVEN** warning alert is open
**WHEN** user presses Cancel
**THEN** alert closes, ProfileScreen unchanged, no API call made

### AC13: Mobile — Continue opens typed-handle modal
**GIVEN** user pressed Continue on the warning alert
**WHEN** the confirmation modal appears
**THEN** it shows a text input, a disabled "Delete Account" confirm button, and a Cancel button

### AC14: Mobile — confirm button gated by handle match
**GIVEN** confirmation modal is open and user's handle is `alice`
**WHEN** user types `alice` in the input
**THEN** confirm button becomes enabled; any other input keeps it disabled

### AC15: Mobile — successful deletion logs user out
**GIVEN** user typed correct handle and pressed confirm
**WHEN** `DELETE /api/v1/users/me` returns `204`
**THEN** `tokenStore.clear()` is called → `logout()` is called → RootNavigator shows LoginScreen

### AC16: Mobile — API failure keeps modal open
**GIVEN** user typed correct handle and pressed confirm
**WHEN** API returns an error (e.g. 500)
**THEN** error message shown inside modal / confirm button re-enabled / modal stays open

### AC17: Mobile — i18n keys resolve in both locales
**GIVEN** app running in `en` locale
**WHEN** ProfileScreen loads
**THEN** all `profile.deleteAccount.*` keys resolve to English text without errors
**AND GIVEN** locale is `pt-BR`, all keys resolve to Portuguese text

---

## Screens

### Screen: ProfileScreen (modified)

**Purpose:** Existing settings and profile screen — now also exposes account deletion.

**Route:** Mobile screen (no URL; accessed via bottom-tab or nav stack)

**Layout:**
1. Profile header (avatar, display name, handle) — unchanged
2. Settings sections (theme, language, privacy) — unchanged
3. Logout button — unchanged
4. **[New]** Delete Account button — full-width, danger variant, at the bottom of the screen

**Components:**
- `<ProfileScreen>` → `<Button label="Delete Account" variant="danger" />` → `<DeleteAccountModal />`

**States:**
- Default: All settings loaded, Delete Account button enabled
- Warning alert open: `Alert.alert` overlay; ProfileScreen beneath
- Confirmation modal open: `<DeleteAccountModal visible={true} />`

**i18n:**
| Key | EN | PT-BR |
|-----|----|-------|
| `profile.deleteAccount.button` | Delete Account | Deletar Conta |

**Interactions:**
- Tap "Delete Account" → `Alert.alert` warning fires (Step 1)
- Tap Cancel on alert → alert closes, ProfileScreen unchanged
- Tap Continue on alert → `DeleteAccountModal` appears (Step 2)

---

### Screen: DeleteAccountModal (new component)

**Purpose:** Step 2 of confirmation — user types their handle to confirm irreversible deletion.

**Route:** N/A — bottom-sheet `<Modal>` rendered over ProfileScreen

**Layout:**
1. Title — `profile.deleteAccount.modalTitle`
2. Description — `profile.deleteAccount.modalDescription`
3. Warning banner (red left-border) — `profile.deleteAccount.modalWarning`
4. Label + text input — user types their `@handle`
5. Inline mismatch error (shown when input is non-empty but wrong)
6. API error display (shown when delete call fails)
7. "Delete Account" confirm button (danger, disabled until handle matches)
8. "Cancel" secondary button

**Components:**
- `<DeleteAccountModal>` → `<Text>`, `<TextInput>`, `<ErrorMessage>`, `<Button variant="danger">`, `<Button variant="secondary">`

**States:**
- Input empty: confirm button disabled, no inline error
- Input non-empty + mismatch: confirm button disabled, mismatch error shown
- Input matches handle: confirm button enabled
- Loading (awaiting API): confirm button shows spinner, input disabled, cancel disabled
- API error: error message shown, confirm re-enabled, user can retry

**i18n:**
| Key | EN | PT-BR |
|-----|----|-------|
| `profile.deleteAccount.modalTitle` | Delete Account | Deletar Conta |
| `profile.deleteAccount.modalDescription` | Type your username (@handle) to confirm deletion… | Digite seu nome de usuário (@handle) para confirmar… |
| `profile.deleteAccount.modalWarning` | This action cannot be undone. Once deleted… | Esta ação não pode ser desfeita… |
| `profile.deleteAccount.confirmLabel` | Type your username to confirm | Digite seu nome de usuário para confirmar |
| `profile.deleteAccount.confirmMismatch` | Username does not match. Please check and try again. | Nome de usuário não corresponde. Verifique e tente novamente. |
| `profile.deleteAccount.deleting` | Deleting… | Deletando… |
| `profile.deleteAccount.confirm` | Delete Account | Deletar Conta |
| `profile.deleteAccount.cancel` | Cancel | Cancelar |
| `profile.deleteAccount.error` | Failed to delete account. Please try again. | Falha ao deletar conta. Tente novamente. |

**Interactions:**
- Type correct handle → confirm button enables
- Tap confirm → loading state → API call → success (modal closes, logout) or error (message shown)
- Tap Cancel → modal closes, ProfileScreen unchanged, state reset
- Hardware back (Android) → same as Cancel

**Accessibility:**
- TextInput has `accessibilityLabel={t('profile.deleteAccount.confirmLabel')}`
- Confirm button has `accessibilityState={{ disabled: isConfirmDisabled, busy: loading }}`
- Error messages have `accessibilityLiveRegion="polite"`

---

## Implementation Approach

### Architecture

**Backend:**
- New `DELETE /me` method in `UserSettingsController` — extracts `userId` from `authentication.getName()`, delegates to `UserService.deleteAccount(userId)`, returns `ResponseEntity.noContent().build()`.
- `UserService.deleteAccount()` is a single `@Transactional` method. To avoid the circular dependency with `AvatarService` (which calls back into `UserService.updateAvatarUrl`), inject `StorageService` directly into `UserService` and call `storageService.delete(userId)` — `avatarUrl` will be nulled in `anonymizeUser()` anyway.
- Cascade delete order respects FK dependencies: join/bridge tables first, then owned entities, then the user row last.
- `@Where(clause = "deleted_at IS NULL")` on the `User` entity ensures all existing lookups (login, registration duplicate checks, profile fetches) automatically exclude deleted users.

**Mobile:**
- `DeleteAccountModal` is a new standalone component (`mobile/src/components/account/DeleteAccountModal.tsx`). Keeps ProfileScreen manageable.
- The handle-match validation is purely client-side (`typedHandle === userHandle`).
- Logout sequence: `deleteAccountApi()` → `tokenStore.clear()` → `logout()` (which also clears the token store — idempotent). Navigation is passive — RootNavigator reacts to `status === 'unauthenticated'`.

### Test Strategy

- [x] **Partial TDD** — backend integration tests written alongside implementation; mobile tests alongside component

**Backend:**
- Unit: `UserServiceTest` — mock all repositories, verify cascade call order with `InOrder`, verify anonymization field values, verify `UserNotFoundException` when user not found, verify idempotency guard.
- Integration (`@SpringBootTest` + Testcontainers): create user with POKs/follows/tokens → call `deleteAccount()` → assert zero rows in dependent tables, user row anonymized with `deleted_at` set.
- `@WebMvcTest` for `UserSettingsController`: `DELETE /me` returns 204 with valid auth, 401 without, 404 when service throws `UserNotFoundException`.

**Mobile:**
- `ProfileScreen.test.tsx`: renders delete button, warning alert fires on press, cancel returns to screen unchanged.
- `DeleteAccountModal.test.tsx`: confirm disabled until handle matches, success triggers `deleteAccountApi` + `logout`, error message shown and button re-enabled on failure.

### File Changes

**New:**
- `backend/src/main/resources/db/migration/V23__add_deleted_at_to_users.sql`
- `mobile/src/components/account/DeleteAccountModal.tsx`
- `mobile/src/components/account/__tests__/DeleteAccountModal.test.tsx`

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/domain/User.java` — add `deletedAt` field + `@Where` annotation
- `backend/src/main/java/com/lucasxf/ed/service/UserService.java` — add `deleteAccount()` + inject `StorageService`
- `backend/src/main/java/com/lucasxf/ed/controller/UserSettingsController.java` — add `DELETE /me`
- `backend/src/main/java/com/lucasxf/ed/repository/RefreshTokenRepository.java` — add `deleteAllByUserId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/PokRepository.java` — add `deleteAllByUserId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/UserTagRepository.java` — add `deleteAllByUserId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/PokTagRepository.java` — add `deleteByPokId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/PokAuditLogRepository.java` — add `deleteByPokId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/FollowRepository.java` — add `deleteByFollowerId(UUID)`, `deleteByFollowedId(UUID)`
- `backend/src/main/java/com/lucasxf/ed/repository/PokShareRepository.java` — add `deleteBySharedByUserId(UUID)`, `deleteByOriginalPokIdIn(List<UUID>)`
- `backend/src/test/java/com/lucasxf/ed/service/UserServiceTest.java` — add deletion unit tests
- `backend/src/test/java/com/lucasxf/ed/controller/UserSettingsControllerTest.java` — add DELETE /me tests
- `backend/src/test/java/com/lucasxf/ed/integration/AccountDeletionIntegrationTest.java` — **new** integration test class
- `mobile/src/screens/app/ProfileScreen.tsx` — add state, handlers, modal, delete button
- `mobile/src/lib/userApi.ts` — add `deleteAccountApi()`
- `mobile/src/i18n/locales/en.ts` — add `profile.deleteAccount.*` keys
- `mobile/src/i18n/locales/pt-BR.ts` — add `profile.deleteAccount.*` keys
- `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx` — add deletion test cases

**Migrations:**
- `backend/src/main/resources/db/migration/V23__add_deleted_at_to_users.sql`:
  ```sql
  ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
  ALTER TABLE users ALTER COLUMN handle TYPE VARCHAR(64);
  DROP INDEX idx_users_email;
  DROP INDEX idx_users_handle;
  CREATE UNIQUE INDEX idx_users_email ON users (LOWER(email)) WHERE deleted_at IS NULL;
  CREATE UNIQUE INDEX idx_users_handle ON users (handle) WHERE deleted_at IS NULL;
  ```

---

## Implementation Plan

### Task 1: Flyway migration + User entity
- **Files:**
  - `backend/src/main/resources/db/migration/V23__add_deleted_at_to_users.sql`
  - `backend/src/main/java/com/lucasxf/ed/domain/User.java`
- **Depends on:** _none_
- **Commit:** `feat(backend): add deleted_at to users and partial unique indices`
- **Stack:** backend

### Task 2: Repository delete methods
- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/repository/RefreshTokenRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/PokRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/UserTagRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/PokTagRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/PokAuditLogRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/FollowRepository.java`
  - `backend/src/main/java/com/lucasxf/ed/repository/PokShareRepository.java`
- **Depends on:** Task 1
- **Commit:** `feat(backend): add cascade-delete repository methods for account deletion`
- **Stack:** backend

### Task 3: UserService.deleteAccount() + controller endpoint
- **Files:**
  - `backend/src/main/java/com/lucasxf/ed/service/UserService.java`
  - `backend/src/main/java/com/lucasxf/ed/controller/UserSettingsController.java`
- **Depends on:** Task 2
- **Commit:** `feat(backend): add DELETE /api/v1/users/me account deletion endpoint`
- **Stack:** backend

### Task 4: Backend tests
- **Files:**
  - `backend/src/test/java/com/lucasxf/ed/service/UserServiceTest.java`
  - `backend/src/test/java/com/lucasxf/ed/controller/UserSettingsControllerTest.java`
  - `backend/src/test/java/com/lucasxf/ed/integration/AccountDeletionIntegrationTest.java`
- **Depends on:** Task 3
- **Commit:** `test(backend): add unit and integration tests for account deletion`
- **Stack:** backend

### Task 5: Mobile API function + i18n keys
- **Files:**
  - `mobile/src/lib/userApi.ts`
  - `mobile/src/i18n/locales/en.ts`
  - `mobile/src/i18n/locales/pt-BR.ts`
- **Depends on:** _none_ (parallel with Tasks 1–4)
- **Commit:** `feat(mobile): add deleteAccountApi and i18n keys for account deletion`
- **Stack:** mobile

### Task 6: DeleteAccountModal component
- **Files:**
  - `mobile/src/components/account/DeleteAccountModal.tsx`
  - `mobile/src/components/account/__tests__/DeleteAccountModal.test.tsx`
- **Depends on:** Task 5
- **Commit:** `feat(mobile): add DeleteAccountModal with typed-handle confirmation`
- **Stack:** mobile

### Task 7: ProfileScreen integration
- **Files:**
  - `mobile/src/screens/app/ProfileScreen.tsx`
  - `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx`
- **Depends on:** Task 6
- **Commit:** `feat(mobile): add account deletion flow to ProfileScreen`
- **Stack:** mobile

---

## Dependencies

**Blocked by:** None — all infrastructure (Supabase, StorageService, apiFetch) already exists.

**Blocks:** App Store resubmission (tracked in `docs/plans/apple-rejection-2026-04-17.md`).

**External:**
- Physical-device screen recording of the full delete flow must be attached to the App Store Connect Review Information notes before resubmission.
- `feat/sign-in-with-apple` branch also modifies `UserService` — merge conflict expected; resolve on whichever branch lands second.

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
