# Following & Colleagues

> **Status:** Implemented
> **Created:** 2026-03-06
> **Implemented:** 2026-03-07

---

## Context

learnimo is adding social capabilities (Phase 6). Milestone 6.1 is the foundation: follow/unfollow mechanics, automatic colleague detection (mutual follows), new visibility tiers (FOLLOWERS_ONLY, COLLEAGUES_ONLY), and private social counts for the profile owner.

Phase 5 delivered POK visibility (PUBLIC/PRIVATE) and learner profile privacy (PUBLIC/PRIVATE), explicitly deferring the follower/colleague tiers to Phase 6. The existing `VARCHAR(20)` columns accept new enum values without schema changes.

**Design Principles:**
- No follower/colleague/learning counts on public profiles (anti-vanity)
- Learners see their own counts privately only
- Mutual follows = colleagues (automatic — no request flow)
- Kindness is a first-class principle

**Related:**
- `docs/ROADMAP.phase-6.md` — Milestone 6.1
- `docs/specs/features/pok-visibility-controls.md` — Phase 5, deferred FOLLOWERS_ONLY/COLLEAGUES_ONLY
- `docs/specs/features/learner-profile-privacy.md` — Phase 5, deferred follower tiers
- `docs/GLOSSARY.md` — Colleague, Learner definitions

---

## Requirements

### Functional

**Scope:** Full-stack (backend + web)

- [ ] FR1: **Follow a learner** — authenticated learner can follow another learner by handle. Self-follow is rejected. _(Must Have)_
- [ ] FR2: **Unfollow a learner** — authenticated learner can unfollow a learner they currently follow. _(Must Have)_
- [ ] FR3: **Colleague detection** — mutual follows are automatically identified as colleagues. No separate request flow. _(Must Have)_
- [ ] FR4: **Relationship status on profiles** — when viewing another learner's profile, the viewer sees their relationship (None / Following / Followed By / Colleague) reflected in the Follow button state. _(Must Have)_
- [ ] FR5: **FOLLOWERS_ONLY visibility tier** — POKs and profiles with this tier are visible to anyone who follows the author. _(Must Have)_
- [ ] FR6: **COLLEAGUES_ONLY visibility tier** — POKs and profiles with this tier are visible only to mutual follows (colleagues). _(Must Have)_
- [ ] FR7: **Visibility tier ordering** — PRIVATE < COLLEAGUES_ONLY < FOLLOWERS_ONLY < PUBLIC. POK visibility can only be widened, never narrowed (extends existing irreversibility rule). _(Must Have)_
- [ ] FR8: **Private social counts** — profile owner privately sees: learnings, followers, following, colleagues counts on their own profile. Non-owners see none of these. _(Must Have)_
- [ ] FR9: **Settings page updated** — visibility selectors (default POK visibility, profile visibility) offer all 4 tiers. _(Must Have)_
- [ ] FR10: **Profile visibility enforcement** — FOLLOWERS_ONLY profiles show full content to followers; COLLEAGUES_ONLY profiles show full content to colleagues; others see private shell. _(Must Have)_
- [ ] FR11: **POK access control** — FOLLOWERS_ONLY POKs accessible to followers; COLLEAGUES_ONLY POKs accessible to colleagues; others get 403. _(Must Have)_
- [ ] FR12: **Learner POK listing respects tiers** — when viewing another learner's POKs, results are filtered by the viewer's access level (e.g., a follower sees PUBLIC + FOLLOWERS_ONLY POKs). _(Must Have)_

**Deferred / Out of Scope:**
- 6.1.6 Follow notification — separate notification spec
- 6.1.7 Unfollow notification — separate notification spec
- Follower/following list pages — deferred (counts only for now)
- Block/mute — Phase 6.6

### Non-Functional

- [ ] NFR1: Follow/unfollow operations complete in < 200ms (single DB write + index lookup)
- [ ] NFR2: Colleague count query uses efficient JOIN (not N+1)
- [ ] NFR3: Self-follow prevented at both service and database levels (CHECK constraint)
- [ ] NFR4: All new i18n keys added in both EN and PT-BR
- [ ] NFR5: Follow button accessible via keyboard (focusable, Enter/Space to activate)

---

## Technical Constraints

**Stack:** Full-stack (Backend: Java 21 / Spring Boot 3 / JPA / Flyway | Web: Next.js 14 / TypeScript / Tailwind)

**Technologies:** PostgreSQL (Supabase), pgvector image for Testcontainers, next-intl for i18n

**Integration Points:**
- `LearnerService` — extended with follow checks and counts
- `PokService.verifyAccess()` — extended with FOLLOWERS_ONLY/COLLEAGUES_ONLY checks
- `LearnerProfileResponse` — extended with relationship status and owner-only counts
- Settings page — 4-option visibility selectors
- `AuthContext` types — extended with new visibility values

**Out of Scope:**
- Notification infrastructure (6.1.6, 6.1.7)
- Follower/following list endpoints and pages
- Mobile app changes (deferred to after web)
- Block/mute functionality (6.6)
- Classes & Study Groups (6.2)

---

## Acceptance Criteria

### AC1: Follow a learner
**GIVEN** learner Alice is authenticated and views learner Bob's public profile
**WHEN** Alice clicks "Follow"
**THEN** the button changes to "Following", and Bob's profile shows the updated relationship

### AC2: Unfollow a learner
**GIVEN** Alice follows Bob
**WHEN** Alice clicks "Unfollow" on Bob's profile
**THEN** the relationship reverts to "None" and the button shows "Follow"

### AC3: Self-follow prevented
**GIVEN** Alice views her own profile
**THEN** no Follow button is displayed

### AC4: Colleague detection
**GIVEN** Alice follows Bob, and Bob follows Alice
**WHEN** Alice views Bob's profile
**THEN** the button shows "Colleague" (mutual follow detected automatically)

### AC5: Follow back
**GIVEN** Bob follows Alice, but Alice does not follow Bob
**WHEN** Alice views Bob's profile
**THEN** the button shows "Follow back"

### AC6: Private counts on own profile
**GIVEN** Alice views her own profile
**THEN** she sees her follower count, following count, colleague count, and learning count
**AND** these counts are not visible to any other viewer

### AC7: Anti-vanity on public profiles
**GIVEN** Bob views Alice's public profile
**THEN** no follower, following, colleague, or learning counts are displayed

### AC8: FOLLOWERS_ONLY POK access
**GIVEN** Alice has a POK with visibility FOLLOWERS_ONLY
**WHEN** Bob (who follows Alice) views the POK
**THEN** Bob can see the content
**WHEN** Charlie (who does not follow Alice) tries to view the POK
**THEN** Charlie receives a 403 error

### AC9: COLLEAGUES_ONLY POK access
**GIVEN** Alice has a POK with visibility COLLEAGUES_ONLY
**WHEN** Bob (Alice's colleague) views the POK
**THEN** Bob can see the content
**WHEN** Dave (who follows Alice but is not followed back) tries to view the POK
**THEN** Dave receives a 403 error

### AC10: FOLLOWERS_ONLY profile
**GIVEN** Alice sets her profile visibility to FOLLOWERS_ONLY
**WHEN** Bob (who follows Alice) views her profile
**THEN** Bob sees the full profile with learnings
**WHEN** Charlie (non-follower) views her profile
**THEN** Charlie sees the private shell (handle + "This profile is private")

### AC11: POK visibility widening only
**GIVEN** Alice has a POK with visibility COLLEAGUES_ONLY
**WHEN** Alice tries to change it to PRIVATE
**THEN** the operation is rejected (visibility can only be widened)
**WHEN** Alice changes it to FOLLOWERS_ONLY or PUBLIC
**THEN** the operation succeeds

### AC12: Settings page 4-tier selectors
**GIVEN** Alice opens the Settings page
**THEN** both "Default learning visibility" and "Profile visibility" show 4 options: Private, Colleagues only, Followers only, Public

### AC13: Learner POK listing filtered by access
**GIVEN** Alice has POKs at all 4 visibility tiers
**WHEN** Bob (a follower, not colleague) views Alice's profile
**THEN** Bob sees PUBLIC and FOLLOWERS_ONLY POKs only (not COLLEAGUES_ONLY or PRIVATE)

---

## Implementation Approach

### Architecture

#### Database — `follows` table (V18)

```sql
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id),
    followed_id UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> followed_id)
);
CREATE INDEX idx_follows_followed_id ON follows (followed_id);
```

Composite PK (no surrogate). Hard delete on unfollow (no soft delete). Self-follow CHECK constraint at DB level.

#### Domain — `Follow` entity + `FollowId` composite key

JPA entity with `@IdClass(FollowId.class)`. Fields: `followerId`, `followedId`, `createdAt`.

#### Visibility tier ordering

```
PRIVATE (0) < COLLEAGUES_ONLY (1) < FOLLOWERS_ONLY (2) < PUBLIC (3)
```

Enum ordinal comparison for widening-only rule: `newVisibility.ordinal() >= current.ordinal()`.

#### `FollowService` — core operations

- `follow(followerId, followedId)` — insert, reject self-follow and duplicates
- `unfollow(followerId, followedId)` — delete, reject if not following
- `getRelationship(requesterId, targetId)` → `NONE | FOLLOWING | FOLLOWED_BY | COLLEAGUE`
- `isFollowing(followerId, followedId)` → boolean
- `areColleagues(a, b)` → boolean
- Count queries: `countFollowers`, `countFollowing`, `countColleagues`

Colleague count via efficient single query:
```sql
SELECT COUNT(DISTINCT f1.followed_id)
FROM follows f1 JOIN follows f2
  ON f1.follower_id = f2.followed_id AND f1.followed_id = f2.follower_id
WHERE f1.follower_id = :userId
```

#### Extended access control

- `PokService.verifyAccess()` — switch on visibility, check `followService.isFollowing()` or `areColleagues()`
- `LearnerService.getProfile()` — check profile visibility against follow relationship
- `LearnerService.getLearnerPoks()` — filter POKs by viewer's access level

#### `LearnerProfileResponse` — extended DTO

New fields (all `@JsonInclude(NON_NULL)`):
- `relationshipStatus` — NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE (null in private shell, null for owner)
- `followerCount`, `followingCount`, `colleagueCount` — owner-only (null for non-owners)

#### API endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `POST` | `/api/v1/learners/{handle}/follow` | Follow | 204 |
| `DELETE` | `/api/v1/learners/{handle}/follow` | Unfollow | 204 |

Errors: 404 (handle not found), 409 (already/not following), 400 (self-follow)

#### Frontend

- **`FollowButton` component** — renders based on `relationshipStatus`: Follow / Following / Follow back / Colleague
- **Profile page** — integrates FollowButton, shows private counts for owner
- **Settings page** — 4-option selectors for both visibility settings
- **API module** — `followLearner()`, `unfollowLearner()` in `learnerApi.ts`
- **Types** — extend `PokVisibility` and `ProfileVisibility` with new values
- **i18n** — new keys in `en.json` and `pt-BR.json`

### Test Strategy

- [x] Full TDD (tests first for all code)

**Backend unit tests:**
- `FollowServiceTest` — follow, unfollow, self-follow, duplicates, relationship, counts, colleague detection
- `LearnerServiceTest` (extend) — relationship status, owner counts, visibility tier access control
- `PokServiceTest` (extend) — FOLLOWERS_ONLY and COLLEAGUES_ONLY access checks, widening-only rule

**Backend controller tests:**
- `LearnerControllerTest` (extend) — follow/unfollow endpoints, error cases

**Backend integration tests:**
- `FollowIntegrationTest` — full flow through controller → DB, composite PK, CHECK constraint

**Frontend tests:**
- `FollowButton.test.tsx` — all relationship states, click handlers
- Settings page test — 4-option selectors
- Profile page test — counts display for owner, hidden for non-owner

**E2E tests (Playwright):**
- Follow/unfollow flow, button state changes, private counts visibility

### File Changes

**New:**
- `backend/src/main/java/com/lucasxf/ed/domain/Follow.java`
- `backend/src/main/java/com/lucasxf/ed/domain/FollowId.java`
- `backend/src/main/java/com/lucasxf/ed/repository/FollowRepository.java`
- `backend/src/main/java/com/lucasxf/ed/service/FollowService.java`
- `backend/src/main/java/com/lucasxf/ed/dto/RelationshipStatus.java` (enum)
- `backend/src/main/resources/db/migration/V18__create_follows_table.sql`
- `backend/src/test/java/com/lucasxf/ed/service/FollowServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/controller/FollowEndpointTest.java`
- `backend/src/test/java/com/lucasxf/ed/integration/FollowIntegrationTest.java`
- `web/src/components/FollowButton.tsx`
- `web/src/components/__tests__/FollowButton.test.tsx`

**Modified:**
- `backend/.../domain/Pok.java` — add COLLEAGUES_ONLY, FOLLOWERS_ONLY to Visibility enum; add `widenVisibility()` method
- `backend/.../domain/User.java` — add COLLEAGUES_ONLY, FOLLOWERS_ONLY to ProfileVisibility enum
- `backend/.../service/PokService.java` — inject FollowService, extend `verifyAccess()`
- `backend/.../service/LearnerService.java` — inject FollowService, return relationship + counts, extend visibility checks
- `backend/.../controller/LearnerController.java` — add follow/unfollow endpoints
- `backend/.../dto/LearnerProfileResponse.java` — add relationship, count fields
- `backend/.../exception/GlobalExceptionHandler.java` — add handler if new exceptions needed
- `backend/src/test/.../service/LearnerServiceTest.java` — extend with follow-related tests
- `backend/src/test/.../service/PokServiceTest.java` — extend with visibility tier tests
- `backend/src/test/.../controller/LearnerControllerTest.java` — extend with follow endpoint tests
- `web/src/app/[locale]/learners/[handle]/page.tsx` — FollowButton, private counts
- `web/src/app/[locale]/settings/page.tsx` — 4-option visibility selectors
- `web/src/lib/learnerApi.ts` — follow/unfollow functions, extended types
- `web/src/lib/pokApi.ts` — extend PokVisibility type
- `web/src/lib/auth.ts` — extend ProfileVisibility type
- `web/src/locales/en.json` — new social keys
- `web/src/locales/pt-BR.json` — new social keys

**Migrations:**
- `V18__create_follows_table.sql` — follows table with composite PK, CHECK, index

---

## Dependencies

**Blocked by:** Phase 5 (POK Visibility + Learner Profile Privacy) — ✅ Complete

**Blocks:** Milestone 6.2 (Classes & Study Groups), 6.3 (Learner Profiles — extended), 6.4 (Share), 6.5 (Discovery Feed)

**External:** None

---

## Post-Implementation Notes

### Commits
- `e74439c` feat: add V18 follows table migration
- `45b4aec` feat: add Follow entity, FollowId composite key, and FollowRepository
- `5cb66bf` feat: add RelationshipStatus enum and FollowService with TDD tests
- `6395ff0` feat: extend Pok.Visibility and User.ProfileVisibility with FOLLOWERS_ONLY and COLLEAGUES_ONLY
- `b244d9c` feat: extend PokService and LearnerService with 4-tier access control
- `682751a` feat: add follow/unfollow endpoints, extend LearnerProfileResponse with social fields
- `316b758` test: extend backend tests for 4-tier visibility and follow endpoints
- `7896ddd` feat: extend frontend with follow/unfollow, 4-tier visibility, social counts

### Architectural Decisions

- **Composite PK over surrogate ID on `follows`**: The (follower_id, followed_id) pair is naturally unique and the primary access pattern — using it directly as the PK avoids an extra index and simplifies duplicate detection at the DB level.
- **`@IdClass(FollowId)` over `@EmbeddedId`**: `@IdClass` with a record type results in less boilerplate and cleaner field access in JPQL queries.
- **Ordinal-based widening-only rule for visibility**: `PRIVATE(0) < COLLEAGUES_ONLY(1) < FOLLOWERS_ONLY(2) < PUBLIC(3)` allows a single `ordinal()` comparison to enforce the widening rule across all 4 tiers.
- **`FollowService` injected into `PokService` (no circular dependency)**: Both services only depend in one direction, so no `@Lazy` was needed.
- **Anti-vanity enforced in DTO factory**: `followerCount/followingCount/colleagueCount` are null for non-owners in `LearnerProfileResponse.full()`, preventing accidental exposure.
- **`useState` at top of component for `relationshipStatus`**: React's rules of hooks require `useState` before any conditional return; state is updated in the `useEffect` load callback after the profile is fetched.

### Deviations from Spec

- **Mobile app not updated**: The spec mentions mobile as out of scope for this milestone. Mobile app types and UI for follow/unfollow were not implemented.
- **No pagination on followers/following lists**: Spec deferred list endpoints to a future milestone. Only counts are exposed.

### Lessons Learned

- `PokServiceSemanticSearchTest` manually constructs `PokService` — every constructor parameter change requires updating that test's `setUp()`. Added to known pitfalls checklist.
- Cookie name must match exactly: using `auth_token` instead of `access_token` caused all integration test requests to get 401s. Always verify against `CookieHelper.ACCESS_TOKEN_COOKIE`.
- E2E: `aria-label` on a button overrides the accessible name used by `getByRole({ name: ... })`. Tests expecting visible text should use `getByText()`, not `getByRole()` with the visible label.
