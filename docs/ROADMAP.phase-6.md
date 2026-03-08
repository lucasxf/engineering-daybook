# Phase 6: Social Capabilities (TBD)

> Status: **🔄 In Progress** (6.1 done — 2026-03-07; 6.3 done — 2026-03-07; 6.4 done — 2026-03-07)

---

**Goal:** Enable learners to connect, follow each other, discover public learnings, and share content — without rewarding vanity metrics.

**Design Principles:**
- No follower, colleague, or learning counts visible on public profiles (anti-vanity)
- Learners can see their own counts privately
- Mutual follows = **colleagues** (automatic — no separate request flow)
- Social connections named for the learning context: colleagues, class, study group
- Kindness is a first-class principle — humiliation and harassment not tolerated

---

## Milestone 6.1: Following & Colleagues ✅ Done (2026-03-07)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 6.1.1 | Follow a learner | Must Have | ✅ Done |
| 6.1.2 | Unfollow a learner | Must Have | ✅ Done |
| 6.1.3 | Mutual follow = colleague (automatic) | Must Have | ✅ Done |
| 6.1.4 | Followers-only and colleagues-only visibility tiers (from Phase 5 model) | Must Have | ✅ Done |
| 6.1.5 | Learner can privately see own counts: learnings, followers, following, colleagues | Must Have | ✅ Done |
| 6.1.6 | Follow notification copy | Should Have | ⏳ Deferred |
| 6.1.7 | Unfollow notification | Could Have | ⏳ Deferred |

**Implementation notes (2026-03-07):**
- V18 Flyway migration adds `follows` table with composite PK (`follower_id`, `followed_id`)
- `Follow` entity + `FollowId` composite key + `FollowRepository` (Spring Data JPA)
- `RelationshipStatus` enum: `NONE`, `FOLLOWING`, `FOLLOWED_BY`, `COLLEAGUE`
- `FollowService`: `follow()`, `unfollow()`, `getRelationshipStatus()`, `isColleague()` — self-follow and duplicate-follow guarded
- `Pok.Visibility` and `User.ProfileVisibility` extended with `FOLLOWERS_ONLY` and `COLLEAGUES_ONLY`
- `PokService` and `LearnerService` enforce 4-tier access control on every read path
- `LearnerProfileResponse` extended: `relationshipStatus`, `followerCount`, `followingCount`, `colleagueCount`, `learningCount` (counts visible to profile owner only — anti-vanity)
- `POST /api/v1/learners/{handle}/follow` and `DELETE /api/v1/learners/{handle}/follow` endpoints (204 / 400 / 401 / 404 / 409)
- Frontend: `FollowButton` component, 4-tier visibility selectors on Settings page, social counts on own profile
- Test coverage: 115 backend tests + 347 frontend unit tests + 8 E2E tests
- Items 6.1.6 and 6.1.7 (notification copy/mechanics) deferred — do not block 6.2+

## Milestone 6.2: Classes & Study Groups

| # | Feature | Priority |
|---|---------|----------|
| 6.2.1 | Learners can form an opt-in named group (Class / Study Group) with colleagues | Could Have |
| 6.2.2 | Groups are never auto-created — always deliberate | Must Have (constraint) |
| 6.2.3 | Group visibility and membership rules respect individual privacy settings | Must Have |

## Milestone 6.3: Learner Profiles ✅ Done (2026-03-07)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 6.3.1 | Public profile page at `/learners/{handle}` | Must Have | ✅ Done |
| 6.3.2 | Profile shows avatar and display name | Must Have | ✅ Done |
| 6.3.3 | Optional short bio (no external links or social media redirects) | Should Have | ✅ Done |
| 6.3.4 | Avatar upload (Supabase Storage, size limits, format validation, resizing) | Must Have | ✅ Done |
| 6.3.5 | Profile respects visibility settings | Must Have | ✅ Done |
| 6.3.6 | No vanity metrics on public profiles | Must Have | ✅ Done |
| 6.3.7 | Clickable `@handle` in header links to own profile; avatar thumbnail displayed | Should Have | ✅ Done |

**Implementation notes (2026-03-07):**
- V19 Flyway migration adds `bio` and `avatar_url` columns to `users` table, plus indexes on `follows`
- `UserService`: `updateBio()`, `updateDisplayName()`, `updateAvatarUrl()`, `findByHandle()`
- `AvatarService`: validates size (≤ 2 MB), validates MIME type (JPEG/PNG/WebP), resizes to 200×200 JPEG via Thumbnailator
- `StorageService` interface + `SupabaseStorageService` implementation: Supabase Storage REST API (PUT upsert, DELETE)
- `AuthController`: `/auth/me` now returns `avatarUrl`, `bio`, `displayName` fields
- `UserSettingsController`: `POST /api/v1/users/me/avatar` (upload), `DELETE /api/v1/users/me/avatar` (remove); both with full OpenAPI annotations
- `PATCH /api/v1/users/me/settings` extended to handle `bio` and `displayName` fields
- Web: `Avatar` component, learner profile page (avatar + bio display), settings page (avatar upload/remove, display name, bio editing), header `UserMenu` (avatar display + link to profile)
- Mobile: `Avatar` component, `ProfileScreen` updates (avatar + bio display), `userApi` (`uploadAvatar`, `deleteAvatar`)
- Test coverage: 415 backend tests, 357 web tests, 55 mobile tests — all passing

## Milestone 6.4: Share (Re-Learning) ✅ Done (2026-03-07)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 6.4.1 | Share a public POK (reference in learner's feed, attributed to original author) | Should Have | ✅ Done |
| 6.4.2 | Shared POK in sharer's feed and profile, linked to original | Should Have | ✅ Done |
| 6.4.3 | Original author notified when their POK is shared | Should Have | ⏳ Deferred |
| 6.4.4 | Shared POK visibility ≤ original's | Must Have | ✅ Done |
| 6.4.5 | Original POK going private removes all downstream shares | Must Have | ✅ Done |

**Implementation notes (2026-03-07):**
- V20 Flyway migration adds `pok_shares` table; `PokShare` entity with `PokShareRepository` (Spring Data JPA)
- Exception hierarchy: `SelfShareException` (400), `PokShareConflictException` (409), `PokShareAccessDeniedException` (403), `PokShareNotFoundException` (404) — all registered in global exception handler
- `PokShareService` (TDD): `share()`, `unshare()`, `getShareById()`, `getSharesForPok()` — enforces visibility cascade (shared visibility ≤ original's) and cascades private reversion to remove downstream shares
- `PokService` extended with cascade delete of shares on POK deletion/privatisation; `LearnerService` feed union support for mixed owned/shared `FeedItem` results
- `PokShareController`: `POST /api/v1/poks/{id}/share`, `DELETE /api/v1/poks/shared/{shareId}`, `GET /api/v1/poks/shared/{shareId}`
- Frontend: `pokApi.share()`, `pokApi.unshare()`, `pokApi.getShareById()`, `FeedItem` union type distinguishing owned vs. shared learnings
- `ReLearningModal` component: modal for creating a re-learning from another learner's public POK
- `ReLearningCard` component: card for rendering shared learnings in feed — **intentionally deferred to Milestone 6.5 (Discovery Feed)**
- Re-learn button on `PokCard` and `PokList`; wired on learner profile page for non-owner visitors
- i18n: `poks.share.*` namespace added to EN (`en.json`) and PT-BR (`pt-BR.json`)
- Test coverage: 46 backend tests (21 service + 15 controller + 10 integration, 93.9% JaCoCo line coverage) + 29 web tests (24 component + 5 API) + 4 E2E scenarios in `learners.spec.ts`
- Item 6.4.3 (share notification) deferred — does not block 6.5+

## Milestone 6.5: Discovery Feed

| # | Feature | Priority |
|---|---------|----------|
| 6.5.1 | Feed of public POKs from learners you follow | Must Have |
| 6.5.2 | Discover public learners (search by handle or name) | Should Have |

## Milestone 6.6: Community Principles & Content Moderation

| # | Feature | Priority |
|---|---------|----------|
| 6.6.1 | Publish learnimo Manifest / Community Principles — kindness rule included | Must Have |
| 6.6.2 | Report/flag mechanism for inappropriate content | Must Have |
| 6.6.3 | AI moderation agent for harmful/abusive language in shared content | Should Have |
| 6.6.4 | Community guidelines linked from onboarding and profile pages | Should Have |

## Active / Pending

- **Next up:** Milestone 6.5 — Discovery Feed (feed of public POKs from followed learners; `ReLearningCard` component lands here)
- **Pending:** Milestone 6.2 (Classes & Study Groups), 6.6 (Community Principles & Content Moderation)

## Exit Criteria

- [x] Learners can follow/unfollow others
- [x] Mutual follows correctly identified as colleagues
- [x] Profiles display correctly with visibility enforcement
- [x] Share feature works with attribution and visibility cascade
- [x] No vanity metrics visible on public profiles
- [ ] Community Principles published and linked in-app
- [ ] Report mechanism functional
