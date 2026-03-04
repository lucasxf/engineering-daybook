# POK Visibility Controls

> **Status:** Implemented
> **Created:** 2026-03-02
> **Implemented:** 2026-03-04

---

## Context

Currently all learnings are strictly private — only the owner can access them. This works for a
single-user tool but blocks all social and sharing features planned in Phase 5+. This spec
introduces a two-tier visibility model: `PRIVATE` (default) and `PUBLIC`. It is the foundational
privacy infrastructure for learnimo; higher tiers (`FOLLOWERS_ONLY`, `COLLEAGUES_ONLY`) and
share-cascade mechanics unlock in Phase 6 when social concepts (follows, profiles) exist.

**Design principles:**
- Private by default — learners opt in to sharing
- The default visibility setting is freely adjustable at any time (PRIVATE → PUBLIC → PRIVATE)
- A learning made `PUBLIC` cannot be reverted to `PRIVATE` — once shared, it stays shared
- Exception: a public learning CAN be soft-deleted; deletion propagates and removes all
  downstream shares (Phase 6.4 implements the cascade; Phase 5 handles the deletion itself)

**Phase/Milestone:** Phase 5 — Privacy / Milestone 5.1

**Related:**
- `docs/ROADMAP.phase-5.md` — Milestone 5.1
- `docs/specs/features/learner-profile-privacy.md` — Milestone 5.2 (blocked by this spec)
- Phase 6.1 (Following & Colleagues) — adds `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` tiers built on the `Visibility` enum introduced here
- Phase 6.4 (Share / Re-Learning) — share-cascade enforcement depends on `visibility` field

---

## Requirements

### Functional

- [ ] **FR1** *(Must Have)* — A `visibility` field is added to the `poks` table with two values:
  `PRIVATE` and `PUBLIC`. All existing learnings are migrated to `PRIVATE` via the Flyway
  migration (safe, zero-data-loss, column default).

- [ ] **FR2** *(Must Have)* — Each learner has a `defaultPokVisibility` preference on their
  account (`PRIVATE` by default). This value is used to pre-fill the visibility picker when
  creating a learning, so the learner's choice carries forward automatically.

- [ ] **FR3** *(Must Have)* — Visibility can be set at creation time. Both the QuickEntry
  inline form and the full `/poks/new` page include a visibility picker.

- [ ] **FR4** *(Must Have)* — Visibility on an existing learning can be changed from `PRIVATE`
  to `PUBLIC` at any time via the edit page. This transition is **irreversible** — a learning
  made `PUBLIC` cannot be reverted to `PRIVATE`. The learning must not be soft-deleted for a
  visibility change to be valid. The UI makes the irreversibility clear before confirming.

- [ ] **FR5** *(Must Have)* — `PRIVATE` learnings are accessible only by the owner. Any
  authenticated non-owner requesting a private learning receives `403 Forbidden`. The response
  is always `403` — never `404` — to prevent enumeration (confirming a resource's existence).

- [ ] **FR6** *(Must Have)* — `PUBLIC` learnings are accessible by any authenticated user who
  knows the learning's ID via `GET /api/v1/poks/{id}`. Public learnings do **not** appear in
  other users' feeds — discovery and social feeds are Phase 6.5.

- [ ] **FR7** *(Must Have)* — Write operations (`update`, `delete`, `get history`) remain
  ownership-gated regardless of visibility. A non-owner cannot mutate a public learning.

- [ ] **FR8** *(Must Have)* — A learner can update their `defaultPokVisibility` setting at
  any time (e.g. via account settings). The change affects only future learnings — existing
  learnings are not retroactively changed.

- [ ] **FR9** *(Should Have)* — A visual indicator is shown on POK cards and detail views:
  a lock icon for `PRIVATE`, a globe icon for `PUBLIC`.

- [ ] **FR10** *(Must Have)* — The visibility picker is compact and inline — it does not
  require navigating to a separate page (UX Mandate: minimum clicks). The label visible to
  users must read "Visibility" or "Learning visibility" — never "POK visibility".

#### Explicitly Out of Scope

- `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` tiers — Phase 6.1
- Share-cascade ("going private removes shares") — Phase 6.4 (shares don't exist yet)
- "Shared learning visibility ≤ original's" — Phase 6.4
- Public discovery feed of other users' learnings — Phase 6.5
- Unauthenticated access to public learnings — Phase 6 (requires profile / public pages)
- Profile-level visibility (`profileVisibility`) — covered in `learner-profile-privacy.md` (5.2)

### Non-Functional

1. **Security — 403 over 404:** A `PRIVATE` learning accessed by a non-owner MUST return
   `403 Forbidden`, never `404`. `404` would leak information about resource existence.
2. **Security — Write gate:** Visibility on a POK does not grant write access. Ownership
   is always required for mutations, regardless of visibility value.
3. **Data integrity — Backfill:** V13 migration uses `DEFAULT 'PRIVATE'` at the SQL level.
   No NULL states exist after the migration — the column is `NOT NULL`.
4. **Performance:** The visibility check is a post-fetch field comparison in the service
   layer — O(1), no additional DB query. No measurable impact on latency.
5. **i18n:** All new UI labels (picker options, icon aria-labels, settings labels) are
   available in EN and PT-BR. Visibility values themselves (`PRIVATE`, `PUBLIC`) are never
   displayed as raw enums — always translated.
6. **Accessibility:** The visibility picker is keyboard-navigable and announces the current
   selection to screen readers. Visibility icons include `aria-label` attributes.
7. **No regression:** Existing access control behavior on list, create, update, delete, and
   search endpoints is unchanged — they still filter by or enforce ownership.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web + Mobile)

**Technologies:**
- Backend: Java 21, Spring Boot, Spring Data JPA, Flyway
- Web: Next.js 14+, TypeScript 5+, Tailwind CSS, next-intl, Vitest
- Mobile: Expo SDK 53, React Native 0.76, TypeScript strict, i18n-js

**Integration Points:**
- `Pok.java` — add `Visibility` inner enum + `visibility` field with `@Enumerated(EnumType.STRING)`
- `User.java` — add `defaultPokVisibility` field using same `Pok.Visibility` type
- `PokService.verifyOwnership()` → refactored to `verifyAccess()` for reads only
- `PokService.create()` — reads `user.defaultPokVisibility` when `visibility` is omitted in request
- `UserService` — new `updateDefaultVisibility()` method
- `UserController` — `PATCH /api/v1/users/me/settings` endpoint (new or extended)
- `web/src/components/ui/Select.tsx` — reused as the base for the visibility picker
- `pokApi.ts` (web + mobile) — `Pok` type and create/update DTOs extended with `visibility`

**Design decision — enum location:** `Pok.Visibility` as an inner enum (matching project pattern
of `PokAuditLog.Action`, `PokTag.Source`). `User.defaultPokVisibility` references `Pok.Visibility`
since it represents the same concept. Phase 6 profile visibility will be a separate enum
(`User.ProfileVisibility`) because profile tiers differ from POK tiers.

**Out of Scope:**
- New Spring Security filter configuration (existing auth guards remain; only service-layer logic changes)
- New DB tables (visibility is a column addition to existing tables)
- Unauthenticated endpoints for public learnings

---

## Acceptance Criteria

### AC1: Create learning with explicit visibility
**GIVEN** I am logged in
**WHEN** I create a learning and select `PUBLIC` in the visibility picker
**THEN** the learning is saved with `visibility = PUBLIC` and I see it in my feed with a globe icon

### AC2: Create learning with default visibility (private)
**GIVEN** my `defaultPokVisibility` is `PRIVATE` (the initial default)
**WHEN** I create a learning without changing the visibility picker
**THEN** the learning is saved with `visibility = PRIVATE` and shows a lock icon

### AC3: Visibility picker pre-fills from user preference
**GIVEN** I have set my default visibility to `PUBLIC`
**WHEN** I open the new learning form (QuickEntry or /poks/new)
**THEN** the visibility picker is pre-selected to `PUBLIC`

### AC4: Update default visibility setting
**GIVEN** my default is `PRIVATE`
**WHEN** I change it to `PUBLIC` in account settings
**THEN** all subsequent new learning forms open with `PUBLIC` pre-selected
**AND** no existing learnings are affected

### AC5: Edit visibility of existing learning (PRIVATE → PUBLIC)
**GIVEN** I have a `PRIVATE` learning
**WHEN** I edit it and change visibility to `PUBLIC`, then save
**THEN** the learning is saved as `PUBLIC` and the indicator updates immediately

### AC5b: PUBLIC learning cannot be reverted to PRIVATE
**GIVEN** I have a `PUBLIC` learning
**WHEN** I attempt to change its visibility back to `PRIVATE` via the edit form
**THEN** the UI prevents the action (the PRIVATE option is disabled or absent) and the API
returns `409 Conflict` if the request reaches the backend

### AC5c: UI makes irreversibility clear before publish
**GIVEN** I have a `PRIVATE` learning and am about to change it to `PUBLIC`
**WHEN** I select `PUBLIC` in the visibility picker
**THEN** a confirmation warning is shown explaining that this action cannot be undone

### AC6: Private learning is inaccessible to non-owner
**GIVEN** user Alice has a `PRIVATE` learning with id `pok-123`
**WHEN** authenticated user Bob calls `GET /api/v1/poks/pok-123`
**THEN** the response is `403 Forbidden`

### AC7: Private access denied as 403, not 404
**GIVEN** user Alice has a `PRIVATE` learning with id `pok-123`
**WHEN** authenticated user Bob calls `GET /api/v1/poks/pok-123`
**THEN** the response status is `403` (not `404`, which would confirm existence)

### AC8: Public learning is accessible to any authenticated user
**GIVEN** user Alice has a `PUBLIC` learning with id `pok-456`
**WHEN** authenticated user Bob calls `GET /api/v1/poks/pok-456`
**THEN** the response is `200 OK` with the learning content

### AC9: Owner can always access their own private learning
**GIVEN** user Alice has a `PRIVATE` learning
**WHEN** Alice calls `GET /api/v1/poks/{id}`
**THEN** the response is `200 OK`

### AC10: Existing learnings are private after migration
**GIVEN** a learning was created before this feature was deployed (no `visibility` column)
**THEN** after migration its `visibility` is `PRIVATE`

### AC11: Feed shows only own learnings regardless of visibility
**GIVEN** Alice has `PRIVATE` and `PUBLIC` learnings; Bob also has `PUBLIC` learnings
**WHEN** Alice calls `GET /api/v1/poks` (her feed)
**THEN** only Alice's learnings are returned — Bob's are never included

### AC12: Non-owner cannot update a public learning
**GIVEN** user Alice has a `PUBLIC` learning
**WHEN** user Bob calls `PUT /api/v1/poks/{alice-learning-id}`
**THEN** the response is `403 Forbidden`

### AC13: Non-owner cannot delete a public learning
**GIVEN** user Alice has a `PUBLIC` learning
**WHEN** user Bob calls `DELETE /api/v1/poks/{alice-learning-id}`
**THEN** the response is `403 Forbidden`

### AC14: Visibility indicators shown on cards
**GIVEN** I have a mix of private and public learnings in my feed
**THEN** each card shows a lock icon (private) or globe icon (public)

### AC15: Visibility indicator shown on detail view
**GIVEN** I am viewing a learning's detail page
**THEN** the visibility indicator (lock or globe) is visible

---

## Implementation Approach

### Architecture

Additive change — two new columns, one refactored method, and a thin UI layer.

**Domain model additions:**

```sql
-- V13: poks table
ALTER TABLE poks ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE';

-- V14: users table
ALTER TABLE users ADD COLUMN default_pok_visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE';
```

**Core service-layer change — access check refactor:**

```java
// PokService.java — BEFORE (used for ALL operations):
private void verifyOwnership(Pok pok, UUID userId) {
    if (!pok.getUserId().equals(userId))
        throw new PokAccessDeniedException("...");
}

// PokService.java — AFTER:

// For READ operations (getById): allow public access
private void verifyAccess(Pok pok, UUID requestingUserId) {
    if (pok.getVisibility() == Pok.Visibility.PUBLIC) return;   // public: any auth user
    if (pok.getUserId().equals(requestingUserId)) return;        // private: owner only
    throw new PokAccessDeniedException("You do not have permission to access this learning");
}

// For WRITE operations (update, softDelete, getHistory): ownership unchanged
private void verifyOwnership(Pok pok, UUID userId) {
    if (!pok.getUserId().equals(userId))
        throw new PokAccessDeniedException("You do not have permission to modify this learning");
}
```

**Irreversible-public enforcement in update flow:**

```java
// PokService.update() — visibility change guard:
if (existing.getVisibility() == Pok.Visibility.PUBLIC
        && request.visibility() == Pok.Visibility.PRIVATE) {
    throw new PokVisibilityImmutableException(
        "A public learning cannot be reverted to private");
    // → HTTP 409 Conflict
}
```

New exception: `PokVisibilityImmutableException` → `409 Conflict` via `GlobalExceptionHandler`.

**Default visibility in create flow:**

```java
// PokService.create() — simplified:
public PokResponse create(CreatePokRequest request, UUID userId) {
    Pok.Visibility visibility = request.visibility() != null
        ? request.visibility()
        : userService.findById(userId).getDefaultPokVisibility();
    Pok pok = new Pok(userId, request.title(), request.content(), visibility);
    // ... rest unchanged
}
```

**Web visibility picker:**
Reuses `web/src/components/ui/Select.tsx` (already has keyboard nav + accessibility). Wraps it in
a `VisibilityPicker` component with two options: `PRIVATE` ("Private" / "Privado") and `PUBLIC`
("Public" / "Público"). Used in `PokForm` via the existing `afterContent` slot pattern.

**Settings endpoint:**
New `PATCH /api/v1/users/me/settings` accepts `{ "defaultPokVisibility": "PUBLIC" }`. Can be
extended in 5.2 with `profileVisibility`. Returns the updated user settings object.

### Test Strategy

- [ ] **Full TDD** for:
  - `PokService.verifyAccess()` (unit) — 4 cases: private+owner=OK, private+non-owner=403,
    public+owner=OK, public+non-owner=OK
  - `PokService.verifyOwnership()` (unit) — confirm writes still reject non-owners on public POKs
  - `PokService.create()` (unit) — visibility from request, fallback to user default
  - `PokService.update()` (unit) — visibility change persisted; non-owner still 403
  - `UserService.updateDefaultVisibility()` (unit)
  - `PokController` (MockMvc) — AC6, AC7, AC8, AC9, AC12, AC13

- [ ] **Partial TDD** for:
  - `VisibilityPicker.tsx` (Vitest/jsdom) — renders options, calls onChange, keyboard nav
  - `VisibilityBadge.tsx` (Vitest/jsdom) — renders correct icon per visibility value

### File Changes

**New — Migrations:**
- `backend/src/main/resources/db/migration/V13__add_visibility_to_poks.sql`
- `backend/src/main/resources/db/migration/V14__add_default_pok_visibility_to_users.sql`

**New — Backend exceptions:**
- `exception/PokVisibilityImmutableException.java` — extends RuntimeException → 409 Conflict

**New — Web:**
- `web/src/components/poks/VisibilityPicker.tsx` — compact visibility selector (wraps Select)
- `web/src/components/poks/VisibilityBadge.tsx` — lock / globe icon with aria-label

**Modified — Backend:**
- `domain/Pok.java` — add `Visibility` inner enum (`PRIVATE`, `PUBLIC`); add `visibility` field with `@Enumerated(EnumType.STRING)` and `@Column(nullable = false, length = 20)`
- `domain/User.java` — add `defaultPokVisibility` field of type `Pok.Visibility`; defaults to `Pok.Visibility.PRIVATE`
- `service/PokService.java` — add `verifyAccess()` (reads); keep `verifyOwnership()` (writes); update `create()` for default visibility; add irreversible-public guard in `update()`
- `exception/GlobalExceptionHandler.java` — handle `PokVisibilityImmutableException` → 409
- `service/UserService.java` — add `updateDefaultVisibility(UUID userId, Pok.Visibility visibility)`
- `dto/CreatePokRequest.java` — add optional `Pok.Visibility visibility` field
- `dto/PokResponse.java` — add `Pok.Visibility visibility` field
- `dto/UpdatePokRequest.java` — add optional `Pok.Visibility visibility` field (or create if not yet existing)
- `controller/UserController.java` — add `PATCH /api/v1/users/me/settings` endpoint

**Modified — Web:**
- `lib/pokApi.ts` — add `visibility: 'PRIVATE' | 'PUBLIC'` to `Pok` type, `CreatePokDto`, `UpdatePokDto`
- `components/poks/PokForm.tsx` — add `VisibilityPicker` (via `afterContent` slot or direct)
- `components/poks/QuickEntry.tsx` — add compact `VisibilityPicker` inline
- `components/poks/PokCard.tsx` — add `VisibilityBadge`
- `app/[locale]/poks/[id]/page.tsx` — add `VisibilityBadge` to detail view
- `locales/en.json` — add `poks.visibility.private`, `poks.visibility.public`, `poks.visibility.label`, `poks.visibility.ariaPrivate`, `poks.visibility.ariaPublic`
- `locales/pt-BR.json` — same keys in PT-BR

**Modified — Mobile:**
- `screens/app/LearningNewScreen.tsx` — add visibility picker (Picker or segmented control)
- `screens/app/LearningDetailScreen.tsx` — show visibility indicator; allow editing
- `i18n/locales/en.ts` — add `learnings.visibility.*` keys
- `i18n/locales/pt-BR.ts` — same keys in PT-BR
- `lib/pokApi.ts` (mobile) — add `visibility` to learning type and create DTO

---

## Dependencies

**Blocked by:** None — all pok-crud, pok-editing, and tagging work is merged.

**Blocks:**
- `docs/specs/features/learner-profile-privacy.md` (5.2) — depends on `visibility` on `Pok`
  and `defaultPokVisibility` on `User`
- Phase 6.1 (Following & Colleagues) — depends on `Pok.Visibility` being extendable to
  `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY`
- Phase 6.4 (Share / Re-Learning) — must implement deletion cascade: when a public POK is
  soft-deleted, all downstream shares are removed. The soft-delete hook point in `PokService`
  introduced here is the integration point.

**External:** None

---

## Post-Implementation Notes

### Commits

| # | Hash | Description |
|---|------|-------------|
| 1 | (V13/V14 migrations) | chore: add migrations V13 (pok visibility) and V14 (user default visibility) |
| 2 | (domain model) | feat: add Visibility enum to Pok, defaultPokVisibility to User, update DTOs |
| 3 | (exception) | feat: add PokVisibilityImmutableException and GlobalExceptionHandler mapping |
| 4 | (UserService) | feat: add UserService with findById and updateDefaultVisibility |
| 5 | 58e28fc | feat: refactor PokService with verifyAccess, visibility-aware create and update |
| 6 | 861f999 | feat: add UserController PATCH /api/v1/users/me/settings |
| 7 | 431f51a | test: add PokController tests for visibility-based access control |
| 8 | 4e413be | feat: add VisibilityPicker and VisibilityBadge components (web) |
| 9 | ffbdf34 | feat: integrate visibility into web POK forms, cards, and detail page |
| 10 | 6ec8885 | feat: add visibility picker and badge to mobile learning screens |
| 11 | 1527d68 | test: add E2E tests for visibility flows |

### Architectural Decisions

- **`Pok.Visibility` stays as inner enum** — keeping it nested in `Pok` is correct for now; Phase 6 may introduce a top-level `Visibility` shared with `ProfileVisibility` if they converge.
- **`verifyAccess()` pattern** — reads use `verifyAccess(userId, pok)` (PUBLIC → any authenticated user; PRIVATE → owner only); writes continue to use `verifyOwnership`. This separation is intentional and prevents unintentional public writes.
- **PUBLIC → PRIVATE is permanently forbidden** — enforced by `PokVisibilityImmutableException` (409 Conflict) at the service layer. Decision: irreversibility prevents confusing downstream consumers who bookmarked or referenced a public URL.
- **Mobile uses inline toggle buttons** instead of a native `Picker` — avoids the complexity of RN's native picker API while matching the visual language of the existing RN `Button` components.
- **Web `PokForm` manages visibility as `useState`** separate from react-hook-form — visibility is not a text input and doesn't need Zod validation; keeping it out of the form schema avoids schema drift. The `PokFormSubmitData` type unions both.

### Deviations from Spec

- **`GET /api/v1/learners/{handle}/poks` endpoint deferred** — listed in the spec as a Phase 5.1 item but belongs to Milestone 5.2 (Learner Profile Privacy), which depends on the profile page. Deferred to the learner-profile-privacy spec.
- **`defaultVisibility` UI not implemented in web/mobile** — the `PATCH /api/v1/users/me/settings` endpoint is implemented, but no settings screen yet. Deferred to Milestone 5.2 or a dedicated UX pass.

### Lessons Learned

- **Mockito `lenient()` for shared `@BeforeEach` stubs**: When a stub is needed by most but not all tests, `lenient().when(...)` prevents UnnecessaryStubbingException without requiring per-test setup.
- **Windows Playwright E2E `--grep` flag can't use `|` operator with pipe in Git Bash** — the pipe is intercepted by the shell. Use separate `--grep` runs or wrap in quotes carefully.
- **`getByText(/🔒/)` in E2E matches the VisibilityPicker dropdown trigger** too, not just badge elements — be specific about which element you expect to NOT be visible, or use a container-scoped locator.
