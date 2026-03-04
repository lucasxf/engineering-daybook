# Learner Profile Privacy

> **Status:** In Progress
> **Created:** 2026-03-02
> **Implemented:** _pending_

---

## Context

Once POK visibility controls (5.1) exist, learners need two additional capabilities: a public
profile page that other authenticated users can view, and the ability to control whether their
profile is publicly discoverable. This spec delivers the minimal version of both, giving Phase 5
end-to-end value while providing the stable foundation Phase 6.3 enhances (avatar, bio, upload).

Without this, there is no way for `PUBLIC` learnings (introduced in 5.1) to actually reach other
users — the visibility flag would exist in the DB with no surface to present it.

**Design principles:**
- Private by default — learners opt in to sharing
- No vanity metrics to others — ever; owner can always see their own counts privately
- Private profile existence is not hidden — a minimal shell (handle only) is shown to non-owners

**Phase/Milestone:** Phase 5 — Privacy / Milestone 5.2

**Related:**
- `docs/ROADMAP.phase-5.md` — Milestone 5.2
- `docs/specs/features/pok-visibility-controls.md` — 5.1 (this spec is blocked by it)
- Phase 6.3 (Learner Profiles) — enhances the minimal page introduced here (avatar, bio, upload)
- Phase 6.1 (Following & Colleagues) — adds `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` profile tiers
- Phase 6.5 (Discovery Feed) — adds discovery by handle/name, which depends on profiles existing

---

## Requirements

### Functional

#### Profile Visibility

- [ ] **FR1** *(Must Have)* — A `profileVisibility` field is added to the `users` table with
  values `PUBLIC` and `PRIVATE`. Default is `PRIVATE`. All existing users are migrated to
  `PRIVATE` via the Flyway migration.

- [ ] **FR2** *(Must Have)* — `PUBLIC` profile: any authenticated user who navigates to
  `/learners/{handle}` can view the profile page (display name + public learnings). The
  profile does not expose follower counts, colleague counts, or total learning counts.

- [ ] **FR3** *(Must Have)* — `PRIVATE` profile: the `/learners/{handle}` page returns a
  minimal shell to non-owners — only the handle and a "This profile is private" message.
  No display name, no learnings, no counts, no avatar. This intentionally confirms that the
  handle is registered (consistent with `GET /auth/handle/available` already doing the same)
  while revealing zero personal information.

- [ ] **FR4** *(Must Have)* — Profile owner can always view their own profile regardless of
  visibility setting (useful for previewing before making it public).

- [ ] **FR5** *(Must Have)* — A `GET /api/v1/learners/{handle}` endpoint returns:
  - `200` with full profile (`{ handle, displayName, learningCount }`) for `PUBLIC` profiles
    (non-owner) or the owner's own profile regardless of visibility
  - `200` with minimal profile (`{ handle, profileVisibility: "PRIVATE" }`) for `PRIVATE`
    profiles visited by non-owners — no display name, no learning count, nothing else
  - `404` if the handle does not exist

- [ ] **FR6** *(Must Have)* — A `GET /api/v1/learners/{handle}/poks` endpoint returns the
  paginated list of `PUBLIC` learnings for that learner. Requires authentication. Returns
  `403` if the target profile is `PRIVATE` and the requester is not the owner. The owner
  always sees all their own learnings (including `PRIVATE` ones) on their own profile.

#### Privacy Settings

- [ ] **FR7** *(Must Have)* — A learner can update `profileVisibility` (and also
  `defaultPokVisibility` from 5.1) via a `PATCH /api/v1/users/me/settings` endpoint. This
  requires a new `UserController`.

- [ ] **FR8** *(Must Have)* — The `GET /auth/me` response is extended to include
  `profileVisibility` and `defaultPokVisibility` so the frontend can pre-fill settings
  and visibility pickers on load without an extra roundtrip.

- [ ] **FR9** *(Must Have)* — Web: a `/[locale]/settings` page is added with an inline
  privacy section for updating `profileVisibility` and `defaultPokVisibility`. Minimal
  design — no modal, no extra navigation steps (UX Mandate).

- [ ] **FR10** *(Must Have)* — Mobile: `ProfileScreen` (the existing tab) is extended with a
  privacy section showing `profileVisibility` and `defaultPokVisibility` controls inline.

#### Minimal Profile Page

- [ ] **FR11** *(Must Have)* — Web: a `/[locale]/learners/[handle]` page is added with
  three distinct views:
  - **Public profile (non-owner):** display name + paginated list of `PUBLIC` learnings.
    No follower count, colleague count, or learning count shown to visitors.
  - **Private profile (non-owner):** handle + "This profile is private" message only.
    No other information visible.
  - **Own profile (owner):** display name + all learnings (private + public, with visibility
    badges) + own learning count. Follower and colleague counts will appear here in Phase 6.

- [ ] **FR12** *(Must Have)* — The owner's profile view shows their own learning count
  privately. This count is visible only to the owner — never to visitors.

- [ ] **FR13** *(Should Have)* — A "View my profile" link is accessible from the settings
  page or from the user menu/header. One click to preview the public profile.

- [ ] **FR14** *(Should Have)* — If a learner navigates to a handle that does not exist,
  they see a `404` page with a friendly message.

#### Anti-Vanity Rule

- [ ] **FR15** *(Must Have)* — Non-owners visiting any profile (public or private) see NO
  numerical counts: no learning count, no follower count, no colleague count, no tag count.
  The owner, when viewing their own profile, sees their own counts privately. In Phase 5 this
  means learning count only; follower and colleague counts will be added in Phase 6.

#### Explicitly Out of Scope

- Avatar upload / display — Phase 6.3
- Bio field — Phase 6.3
- `@handle` avatar thumbnail in the header nav — Phase 6.3
- `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` profile visibility tiers — Phase 6.1
- Discoverable public learner directory (search by handle/name) — Phase 6.5
- Unauthenticated access to profiles — Phase 6 (requires public URL / sharing model)
- Profile-level `handle` changes — separate feature, not planned

### Non-Functional

1. **Security — Minimal shell for private profiles:** `GET /api/v1/learners/{handle}` for a
   private profile visited by a non-owner returns `200` with only `{ handle, profileVisibility }`.
   Unknown handles return `404`. This intentionally allows confirming handle existence, consistent
   with the already-public `GET /auth/handle/available` endpoint.
2. **Security — Owner-only write gate:** `PATCH /api/v1/users/me/settings` is gated by the
   authenticated user's own identity — no user can update another's settings.
3. **Data integrity — Backfill:** V15 migration uses `DEFAULT 'PRIVATE'` at SQL level. All
   existing users become `PRIVATE` after migration, requiring no manual intervention.
4. **Performance — Profile learnings query:** `GET /api/v1/learners/{handle}/poks` must add
   an index on `poks(user_id, visibility, deleted_at)` to avoid full-table scans for
   learners with many learnings.
5. **Anti-vanity — two response shapes:**
   - Non-owner (public profile): `{ handle, displayName, learnings[] }` — no count fields, not even as `0`
   - Non-owner (private profile): `{ handle, profileVisibility }` — nothing else
   - Owner (own profile): `{ handle, displayName, learnings[], learningCount }` — counts visible only to self
6. **i18n:** All new UI labels (settings page headings, profile page labels, visibility
   option labels, privacy explanations) are available in EN and PT-BR.
7. **Accessibility:** Settings controls are keyboard-navigable and announce current values to
   screen readers.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web + Mobile)

**Technologies:**
- Backend: Java 21, Spring Boot, Spring Data JPA, Flyway
- Web: Next.js 14+, TypeScript 5+, Tailwind CSS, next-intl, Vitest
- Mobile: Expo SDK 53, React Native 0.76, TypeScript strict, i18n-js

**Integration Points:**

- `User.java` — add `ProfileVisibility` inner enum (`PUBLIC`, `PRIVATE`); add `profileVisibility` field
- `AuthResponse.java` / `GET /auth/me` — extended to return `profileVisibility` and `defaultPokVisibility`
- New `UserController.java` — settings endpoint (no UserController currently exists)
- New `LearnerController.java` — public profile endpoints (no LearnerController currently exists)
- New `UserRepository.java` method — `findByHandle(String handle)` (or check if it exists)
- New `PokRepository` method — `findByUserIdAndVisibilityAndDeletedAtIsNull(UUID, Pok.Visibility, Pageable)`
- `web/src/contexts/AuthContext.tsx` — `AuthUser` type extended with `profileVisibility`, `defaultPokVisibility`
- `web/src/lib/auth.ts` — new `updateUserSettings()` function
- `mobile/src/screens/app/ProfileScreen.tsx` — extended with privacy settings section
- `pok-visibility-controls.md` (5.1) — `PATCH /api/v1/users/me/settings` first introduced there;
  this spec adds `profileVisibility` to the same endpoint

**Design decision — ProfileVisibility enum location:** `User.ProfileVisibility` as an inner enum
(matching project pattern). Kept separate from `Pok.Visibility` because profile visibility tiers
will differ from POK tiers in Phase 6 (e.g. profile could be `FOLLOWERS_ONLY` without all its
POKs being `FOLLOWERS_ONLY`).

**Design decision — `GET /auth/me` extension vs. new endpoint:** Extend the existing
`GET /auth/me` response to include `profileVisibility` and `defaultPokVisibility`. Rationale:
the web app already calls `/auth/me` on every page load to restore session; returning settings
in the same call avoids a second roundtrip and keeps context restoration atomic. No new endpoint
is needed for reading settings.

**Out of Scope:**
- Unauthenticated profile access
- Avatar / image upload (Supabase Storage) — Phase 6.3
- Search / discovery of learners by handle — Phase 6.5

---

## Acceptance Criteria

### AC1: Public profile is accessible to other authenticated users
**GIVEN** learner Alice has `profileVisibility = PUBLIC`
**WHEN** authenticated learner Bob navigates to `/learners/alice`
**THEN** Bob sees Alice's display name and a list of Alice's `PUBLIC` learnings

### AC2: Private profile returns minimal shell to non-owner
**GIVEN** learner Alice has `profileVisibility = PRIVATE`
**WHEN** authenticated learner Bob calls `GET /api/v1/learners/alice`
**THEN** the response is `200 OK` with only `{ "handle": "alice", "profileVisibility": "PRIVATE" }`
**AND** no display name, no learnings, no counts are included

### AC3: Private profile page shows empty shell to non-owner
**GIVEN** learner Alice has `profileVisibility = PRIVATE`
**WHEN** authenticated learner Bob navigates to `/learners/alice`
**THEN** Bob sees only the handle `@alice` and a "This profile is private" message
**AND** no other information is visible

### AC4: Owner can view own private profile
**GIVEN** Alice has `profileVisibility = PRIVATE`
**WHEN** Alice navigates to `/learners/alice` (her own profile)
**THEN** she sees her profile page with all her learnings (private + public)

### AC5: Public profile does not show counts to visitors
**GIVEN** learner Alice has a `PUBLIC` profile with 50 learnings
**WHEN** Bob views Alice's profile
**THEN** there is no learning count, follower count, colleague count, or any numerical metric visible

### AC5b: Owner sees own learning count on their own profile
**GIVEN** Alice has 5 learnings (3 public, 2 private)
**WHEN** Alice views her own profile at `/learners/alice`
**THEN** Alice sees her total learning count (5) displayed privately

### AC6: Public profile only shows PUBLIC learnings to non-owner
**GIVEN** Alice has 3 `PUBLIC` and 2 `PRIVATE` learnings, and a `PUBLIC` profile
**WHEN** Bob views Alice's profile
**THEN** Bob sees 3 learnings (only the public ones)

### AC7: Owner profile shows all own learnings
**GIVEN** Alice has 3 `PUBLIC` and 2 `PRIVATE` learnings
**WHEN** Alice views her own profile at `/learners/alice`
**THEN** Alice sees all 5 learnings (with visibility badges)

### AC8: Public profile learnings endpoint returns only PUBLIC learnings
**GIVEN** Alice has a `PUBLIC` profile with 3 `PUBLIC` and 2 `PRIVATE` learnings
**WHEN** Bob calls `GET /api/v1/learners/alice/poks`
**THEN** the response contains exactly 3 learnings

### AC9: Profile learnings endpoint returns 403 for private profile
**GIVEN** Alice has `profileVisibility = PRIVATE`
**WHEN** Bob calls `GET /api/v1/learners/alice/poks`
**THEN** the response is `403 Forbidden`

### AC10: Change profile visibility to PUBLIC
**GIVEN** Alice has `profileVisibility = PRIVATE`
**WHEN** Alice calls `PATCH /api/v1/users/me/settings` with `{ "profileVisibility": "PUBLIC" }`
**THEN** the response is `200 OK` and subsequent requests to `/learners/alice` succeed for other users

### AC11: Change profile visibility to PRIVATE
**GIVEN** Alice has `profileVisibility = PUBLIC`
**WHEN** Alice sets it back to `PRIVATE` via settings
**THEN** other users immediately see only the private shell on `/learners/alice` (handle + "This profile is private")

### AC12: Settings returned in /auth/me response
**GIVEN** Alice has `profileVisibility = PUBLIC` and `defaultPokVisibility = PRIVATE`
**WHEN** Alice calls `GET /auth/me`
**THEN** the response includes `"profileVisibility": "PUBLIC"` and `"defaultPokVisibility": "PRIVATE"`

### AC13: Non-existent handle returns 404
**GIVEN** no learner with handle "ghost" exists
**WHEN** any authenticated user navigates to `/learners/ghost`
**THEN** a `404` page with a friendly message is shown

### AC14: Existing users default to PRIVATE after migration
**GIVEN** a user was registered before the V15 migration
**THEN** their `profileVisibility` is `PRIVATE`

### AC15: Settings page accessible from web
**GIVEN** I am logged in on the web
**WHEN** I navigate to `/settings`
**THEN** I see controls for `profileVisibility` and `defaultPokVisibility`

### AC16: Privacy settings editable from mobile
**GIVEN** I am logged in on mobile
**WHEN** I open the Profile tab
**THEN** I see privacy controls for `profileVisibility` and `defaultPokVisibility` inline

---

## Implementation Approach

### Architecture

Three independent additions: a new settings endpoint, a new public profile endpoint, and a new
web page + mobile screen.

**Domain model addition:**

```sql
-- V15: users table
ALTER TABLE users ADD COLUMN profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE';
```

**New index for performant profile learnings query:**

```sql
-- Added in V15 or a separate V16
CREATE INDEX idx_poks_user_visibility ON poks (user_id, visibility, deleted_at);
```

**New `UserController` (replacing the settings endpoint sketched in 5.1):**

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    // GET /api/v1/users/me/settings  → returns current user settings
    @GetMapping("/me/settings")
    public UserSettingsResponse getSettings(Authentication auth) { ... }

    // PATCH /api/v1/users/me/settings  → partial update (defaultPokVisibility + profileVisibility)
    @PatchMapping("/me/settings")
    public UserSettingsResponse updateSettings(Authentication auth,
                                               @RequestBody UpdateUserSettingsRequest request) { ... }
}
```

`UpdateUserSettingsRequest` is a record with nullable fields (null = no change):

```java
public record UpdateUserSettingsRequest(
    @Nullable Pok.Visibility defaultPokVisibility,
    @Nullable User.ProfileVisibility profileVisibility
) {}
```

**New `LearnerController`:**

```java
@RestController
@RequestMapping("/api/v1/learners")
public class LearnerController {

    // GET /api/v1/learners/{handle}           → public profile
    // GET /api/v1/learners/{handle}/poks      → public learnings (paginated)
}
```

**Profile response strategy — two shapes from one endpoint:**

```java
// LearnerController.getProfile():
public LearnerProfileResponse getProfile(String handle, Authentication auth) {
    User target = userService.findByHandle(handle)
        .orElseThrow(LearnerNotFoundException::new);  // → 404

    boolean isOwner = target.getId().equals(currentUserId(auth));

    if (!isOwner && target.getProfileVisibility() == PRIVATE) {
        // Minimal shell — confirms handle exists, reveals nothing else
        return LearnerProfileResponse.privateShell(target.getHandle());
    }

    // Full response — owner always; non-owner for PUBLIC profiles
    List<Pok> learnings = isOwner
        ? pokService.findAllByUserId(target.getId())
        : pokService.findPublicByUserId(target.getId());

    return LearnerProfileResponse.full(target, learnings, isOwner);
    // isOwner=true → includes learningCount; isOwner=false → no counts
}
```

`LearnerProfileResponse` has a factory pattern with two shapes:
- `privateShell(handle)` — `{ handle, profileVisibility: PRIVATE }` only
- `full(user, learnings, isOwner)` — `{ handle, displayName, learnings[] }` + `learningCount` if `isOwner`

`LearnerAccessDeniedException` is no longer needed for the main profile endpoint (private profiles return 200). It remains for `GET /api/v1/learners/{handle}/poks` which still returns `403` for private profiles.

**`GET /auth/me` extension:**

`AuthResponse` (or a new `MeResponse` if we prefer not to pollute the auth DTO) is extended:

```java
public record AuthResponse(
    String handle,
    UUID userId,
    String email,
    Pok.Visibility defaultPokVisibility,          // new
    User.ProfileVisibility profileVisibility,     // new
    @JsonInclude(NON_NULL) String accessToken,
    @JsonInclude(NON_NULL) String refreshToken
) {}
```

**Web — `AuthUser` context extension:**

```typescript
interface AuthUser {
  userId: string;
  email: string;
  handle: string;
  defaultPokVisibility: 'PRIVATE' | 'PUBLIC';    // new
  profileVisibility: 'PRIVATE' | 'PUBLIC';       // new
}
```

**Web — Settings page structure:**

`/[locale]/settings/page.tsx` — a single page with two settings cards:
1. **Privacy** — profileVisibility toggle + defaultPokVisibility toggle
2. *(Phase 6: Account — handle, display name)*

Uses the existing `Select` component; no new UI primitives needed.

### Test Strategy

- [ ] **Full TDD** for:
  - `LearnerService.verifyProfileAccess()` (unit) — 4 cases matching the access matrix
  - `LearnerController` (MockMvc) — AC1 (200 full profile for public), AC2 (200 minimal shell for private non-owner),
    AC4 (200 full profile for owner on private), AC5b (learningCount in owner response), AC6 (only PUBLIC poks returned),
    AC9 (403 on poks for private profile), AC13 (404 on unknown handle)
  - `UserController.updateSettings()` (unit + MockMvc) — AC10, AC11
  - `AuthService.me()` extension (unit) — AC12

- [ ] **Partial TDD** for:
  - Web settings page (Vitest/jsdom) — renders controls, calls PATCH on change
  - Mobile ProfileScreen (React Native Testing Library) — renders privacy section

### File Changes

**New — Migrations:**
- `backend/src/main/resources/db/migration/V15__add_profile_visibility_to_users.sql`

**New — Backend:**
- `controller/UserController.java` — `GET/PATCH /api/v1/users/me/settings`
- `controller/LearnerController.java` — `GET /api/v1/learners/{handle}` and `/{handle}/poks`
- `service/LearnerService.java` — profile access logic, public learnings query
- `service/UserService.java` — `updateSettings(UUID userId, UpdateUserSettingsRequest)` and `findByHandle(String handle)` (or extract to repo)
- `dto/LearnerProfileResponse.java` — two factory methods: `privateShell(handle)` and `full(user, learnings, isOwner)`; `learningCount` only serialised when `isOwner=true`
- `dto/UserSettingsResponse.java` — `{ defaultPokVisibility, profileVisibility }`
- `dto/UpdateUserSettingsRequest.java` — `{ defaultPokVisibility?, profileVisibility? }`
- `exception/LearnerAccessDeniedException.java` — extends RuntimeException → 403
- `exception/LearnerNotFoundException.java` — extends RuntimeException → 404

**Modified — Backend:**
- `domain/User.java` — add `ProfileVisibility` inner enum (`PUBLIC`, `PRIVATE`); add `profileVisibility` field with `@Enumerated(EnumType.STRING)`
- `repository/UserRepository.java` (create if missing) — add `findByHandle(String handle): Optional<User>`
- `repository/PokRepository.java` — add `findByUserIdAndVisibilityAndDeletedAtIsNull(UUID, Pok.Visibility, Pageable)`
- `dto/AuthResponse.java` — add `defaultPokVisibility`, `profileVisibility` fields
- `service/AuthService.java` — `me()` method populates new fields in `AuthResponse`
- `exception/GlobalExceptionHandler.java` — handle `LearnerAccessDeniedException` (403) and `LearnerNotFoundException` (404)
- `config/SecurityConfig.java` — ensure `/api/v1/learners/**` routes require authentication

**New — Web:**
- `web/src/app/[locale]/settings/page.tsx` — settings page with privacy controls
- `web/src/app/[locale]/learners/[handle]/page.tsx` — minimal public profile page
- `web/src/lib/userApi.ts` — `updateUserSettings(payload)` function
- `web/src/lib/learnerApi.ts` — `getLearnerProfile(handle)`, `getLearnerPoks(handle, page)` functions

**Modified — Web:**
- `web/src/contexts/AuthContext.tsx` — extend `AuthUser` with `defaultPokVisibility` and `profileVisibility`; update `login`, `register`, `completeGoogleSignup` and mount restore to populate these fields
- `web/src/locales/en.json` — add `settings.*` and `learners.*` keys
- `web/src/locales/pt-BR.json` — same keys in PT-BR

**Modified — Mobile:**
- `mobile/src/screens/app/ProfileScreen.tsx` — add privacy settings section (profileVisibility + defaultPokVisibility controls)
- `mobile/src/i18n/locales/en.ts` — add `profile.privacy.*` keys
- `mobile/src/i18n/locales/pt-BR.ts` — same keys in PT-BR

---

## Dependencies

**Blocked by:**
- `docs/specs/features/pok-visibility-controls.md` (5.1) — depends on `Pok.Visibility` enum,
  `defaultPokVisibility` on `User`, and `PATCH /api/v1/users/me/settings` being introduced there.
  This spec adds `profileVisibility` to the same endpoint and `User` entity.

**Blocks:**
- Phase 6.3 (Learner Profiles) — enhances the minimal profile page introduced here (avatar, bio, upload, `@handle` in header)
- Phase 6.5 (Discovery Feed) — depends on profile pages existing and public profiles being queryable

**External:** None

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _(pending)_

### Architectural Decisions

_(pending — record key decisions, e.g. whether `AuthResponse` extension vs. new `MeResponse` DTO
was the right call, and whether `LearnerService` vs. extending `PokService` for public pok queries)_

### Deviations from Spec
- _(pending)_

### Lessons Learned
- _(pending)_
