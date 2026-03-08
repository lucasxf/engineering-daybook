# Discovery Feed

> **Status:** Implemented
> **Created:** 2026-03-08
> **Implemented:** 2026-03-08

---

## Context

Learners on learnimo currently have no way to see what the people they follow are learning. The home feed (`/poks`) shows only the authenticated user's own learnings — a purely personal journal view. This makes the social graph from Milestone 6.1 (Following & Colleagues) inert: you can follow someone, but following them produces no observable value.

The Re-Learning mechanic (Milestone 6.4) built attribution-preserving resharing and a fully implemented `ReLearningCard` component, but that component has no consumer yet. The Discovery Feed is its natural home.

There is also no path to find new learners to follow. The learner profile at `/learners/{handle}` exists, but requires knowing someone's exact handle.

**Related:**
- `docs/ROADMAP.phase-6.md` — Milestone 6.5 (6.5.1: social feed, 6.5.2: learner search)
- Milestone 6.1: Following & Colleagues (prerequisite — follow graph)
- Milestone 6.4: Share / Re-Learning (prerequisite — `PokShare`, `ReLearningCard`)

---

## Requirements

### Functional

#### 6.5.1 — Social Feed

- [ ] **FR1** `[Must Have]` Authenticated users have a dedicated `/[locale]/feed` route rendering a chronological feed of learnings from learners they follow.
- [ ] **FR2** `[Must Have]` Feed includes original learnings (`PUBLIC`, `FOLLOWERS_ONLY`) from followed learners. `COLLEAGUES_ONLY` learnings are shown only when the viewer is a colleague (mutual follow). `PRIVATE` learnings are never shown.
- [ ] **FR3** `[Must Have]` Feed includes re-learnings (`PokShare`) posted by followed learners. Each re-learning card shows: resharing learner's identity, attribution to original author, and original content.
- [ ] **FR4** `[Must Have]` Feed items are sorted newest-first by creation/reshare timestamp (not original POK creation timestamp for re-learnings).
- [ ] **FR5** `[Must Have]` Feed is paginated (offset-based, `page`/`size` params, default page size 20) — consistent with existing endpoints.
- [ ] **FR6** `[Must Have]` When the authenticated user follows nobody, or followed learners have no visible content, the feed shows a helpful empty state linking to learner search.
- [ ] **FR7** `[Must Have]` Feed is reachable from primary navigation (header nav link labelled "Feed" / "Feed").
- [ ] **FR8** `[Must Have]` Each feed card links to the author's profile at `/learners/{handle}`.
- [ ] **FR9** `[Must Have]` Each feed card shows the author's display name (or handle fallback) and avatar. No follower/following counts displayed anywhere in the feed (anti-vanity).
- [ ] **FR10** `[Must Have]` The authenticated user's own learnings are excluded from the discovery feed (they are already visible at "My Learnings" / `/poks`).
- [ ] **FR11** `[Must Have]` Unauthenticated access to `/feed` redirects to `/login`. The `GET /api/v1/feed` endpoint returns `401` for unauthenticated callers.
- [ ] **FR12** `[Should Have]` Each feed card exposes a "Re-learn" action that opens the existing `ReLearningModal`, allowing resharing without leaving the feed.
- [ ] **FR13** `[Should Have]` Mobile FeedScreen updated to display the social feed. Own learnings remain accessible via "My Learnings" tab.
- [ ] **FR14** `[Could Have]` Feed ordering is strictly chronological — no algorithmic ranking in this milestone.

#### 6.5.2 — Learner Search / Discover

- [ ] **FR15** `[Should Have]` A "Discover" entry point is accessible from the primary navigation and from the feed empty state.
- [ ] **FR16** `[Should Have]` Learners can search for other learners by handle or display name (case-insensitive, substring match, minimum 2 characters).
- [ ] **FR17** `[Should Have]` Search results show: avatar, display name (or handle fallback), handle, bio snippet, and a Follow/Unfollow button reflecting current relationship state. No follower/following counts (anti-vanity).
- [ ] **FR18** `[Should Have]` Only learners with `profileVisibility = PUBLIC` appear in search results.
- [ ] **FR19** `[Should Have]` Search results link to `/learners/{handle}`.
- [ ] **FR20** `[Should Have]` Search is debounced (300 ms) and fires automatically on input change (no submit button).
- [ ] **FR21** `[Should Have]` No-results state does not confirm or deny whether a specific handle exists (prevents account enumeration).
- [ ] **FR22** `[Could Have]` Backend search endpoint requires authentication (`401` for unauthenticated callers).
- [ ] **FR23** `[Could Have]` Mobile: "Find Learners" entry point from empty FeedScreen.

#### Out of Scope

- Algorithmic/interest-based feed ranking (strictly chronological in this milestone)
- Notifications for new content in the feed
- Blocking or muting learners (Milestone 6.6)
- "People you may know" suggestions (future — requires graph traversal infrastructure)
- Unauthenticated public feed (deferred until content moderation in 6.6)
- Cursor-based (keyset) pagination (future enhancement; offset pagination used for codebase consistency)

### Non-Functional

- [ ] **NFR1** Feed query must use a database-level `UNION ALL` with `ORDER BY + LIMIT/OFFSET` — not in-memory aggregation. The existing `getLearnerPoks` in-memory approach does not scale across multiple followed learners.
- [ ] **NFR2** Feed query must avoid N+1 queries. Author profile data (`displayName`, `avatarUrl`, `handle`) must be fetched via the same SQL join, not lazy-loaded per card.
- [ ] **NFR3** Visibility enforcement must occur at the SQL query level (not application-layer post-filtering). See NFR1.
- [ ] **NFR4** V21 Flyway migration must add: (a) `pg_trgm` extension, (b) compound indexes on `poks(user_id, created_at DESC)` and `poks(visibility, user_id, created_at DESC)`, (c) trigram GIN indexes on `users(handle)` and `users(display_name)` for learner search.
- [ ] **NFR5** `GET /api/v1/feed` requires a valid JWT; `401` otherwise.
- [ ] **NFR6** `GET /api/v1/learners/search` requires a valid JWT; `401` otherwise.
- [ ] **NFR7** Learner search query must include `WHERE profile_visibility = 'PUBLIC'` enforced at the data layer.
- [ ] **NFR8** Search rate-limiting: 60 requests/min per authenticated user (prevents learner directory scraping).
- [ ] **NFR9** All user-facing strings have keys in both `en.json` and `pt-BR.json`; new keys live under `feed.*` and `discover.*` namespaces.
- [ ] **NFR10** Feed cards are keyboard-navigable; each has a unique, descriptive `aria-label`.
- [ ] **NFR11** Search input has a visible label and an `aria-live` region announcing result changes.

---

## Technical Constraints

**Stack:** Full-stack (Backend + Web + Mobile)

**Technologies:**
- Backend: Spring Boot (Java), Spring Data JPA, `JdbcTemplate` (for native SQL UNION), PostgreSQL, Flyway
- Web: Next.js 14+ (App Router), React, TypeScript, next-intl, Tailwind CSS
- Mobile: Expo / React Native, TypeScript

**Integration Points:**
- `follows` table (6.1): source of truth for who the viewer follows
- `poks` + `pok_shares` tables (6.4): feed content
- `FeedItemResponse` sealed interface (`PokResponse` + `PokShareResponse`): existing backend DTO
- `FeedItem` discriminated union type: existing frontend type in `pokApi.ts`
- `ReLearningCard` component: complete, tested, deferred since 6.4 — wired in this milestone
- `FollowButton` component: reused in learner search result cards

**Pre-work blocker — `PokShareResponse` shape:** The current `PokShareResponse` record contains `sharedByHandle` but lacks the original author's details (`originalAuthorHandle`, `originalAuthorDisplayName`, `originalAuthorAvatarUrl`). The social feed renders mixed content from multiple authors; re-learning cards in the feed require the original author's identity for attribution. **This field must be added before the frontend feed page can be implemented.** The SQL projection in `FeedService` will need to join `users` twice (once for the sharer, once for the original author).

**Out of Scope:**
- Cursor-based pagination (deferred; offset pagination used for consistency)
- The existing `getLearnerPoks` in-memory merge is not being refactored (deferred — file a follow-up tech debt ticket)
- Mobile native learner search screen beyond a basic empty-state CTA (scope risk — do not block 6.5.1 on this)

---

## Acceptance Criteria

### AC-1 — Social feed shows followed learners' public learnings
**Maps to:** FR1, FR2, FR4, FR9, FR10

**GIVEN** I am authenticated as "alice" and follow "bob"
**AND** "bob" has 3 PUBLIC learnings created in the past week
**AND** "alice" has her own learnings
**WHEN** I navigate to `/feed`
**THEN** I see "bob"'s 3 learnings, newest first
**AND** each card shows "bob"'s display name and avatar — no follower/following counts
**AND** alice's own learnings do NOT appear in the feed

---

### AC-2 — FOLLOWERS_ONLY visible to follower
**Maps to:** FR2

**GIVEN** "alice" follows "carol"
**AND** "carol" has a FOLLOWERS_ONLY learning
**WHEN** I am authenticated as "alice" and navigate to `/feed`
**THEN** "carol"'s FOLLOWERS_ONLY learning appears in alice's feed

---

### AC-3 — FOLLOWERS_ONLY NOT visible to non-follower
**Maps to:** FR2, NFR3

**GIVEN** "alice" does NOT follow "carol"
**AND** "carol" has a FOLLOWERS_ONLY learning
**WHEN** the backend builds alice's feed (`GET /api/v1/feed`)
**THEN** "carol"'s learning is absent from all pages of the response

---

### AC-4 — COLLEAGUES_ONLY: visible to colleague, hidden from non-colleague
**Maps to:** FR2, NFR3

**GIVEN** "alice" and "dan" mutually follow (colleagues)
**AND** "dan" has a COLLEAGUES_ONLY learning
**WHEN** I am authenticated as "alice" and navigate to `/feed`
**THEN** "dan"'s COLLEAGUES_ONLY learning is visible

**GIVEN** "eve" follows "dan" but "dan" does NOT follow "eve" back (not colleagues)
**AND** "dan" has a COLLEAGUES_ONLY learning
**WHEN** I am authenticated as "eve" and navigate to `/feed`
**THEN** "dan"'s COLLEAGUES_ONLY learning does NOT appear

---

### AC-5 — PRIVATE learnings never appear
**Maps to:** FR2, NFR3

**GIVEN** "alice" follows "frank" (they are also colleagues)
**AND** "frank" has a PRIVATE learning
**WHEN** `GET /api/v1/feed` is called by alice
**THEN** "frank"'s PRIVATE learning is absent from all pages of the response

---

### AC-6 — Re-learning in social feed
**Maps to:** FR3, FR4

**GIVEN** "alice" follows "bob"
**AND** "carol" (not followed by alice) has a PUBLIC learning titled "My Rust Notes"
**AND** "bob" has re-learned "carol"'s learning
**WHEN** I navigate to `/feed`
**THEN** I see a ReLearningCard showing:
- "bob"'s display name as the resharer
- "carol"'s handle/name as the original author
- The content of "My Rust Notes"
**AND** the card's sort position reflects bob's reshare timestamp, not carol's original creation time

---

### AC-7 — Empty feed: not following anyone
**Maps to:** FR6

**GIVEN** "alice" follows nobody
**WHEN** I navigate to `/feed`
**THEN** I see an empty state message (e.g. "Nothing here yet — follow other learners to see their learnings")
**AND** I see a "Find Learners" call-to-action that navigates to `/discover`

---

### AC-8 — Empty feed: following learners with no visible content
**Maps to:** FR6

**GIVEN** "alice" follows "ghost"
**AND** "ghost" has no learnings visible to alice (all PRIVATE, or zero learnings)
**WHEN** I navigate to `/feed`
**THEN** I see the same empty state as AC-7

---

### AC-9 — Pagination
**Maps to:** FR5

**GIVEN** followed learners have 45 visible learnings in total
**WHEN** I request `GET /api/v1/feed?page=0&size=20`
**THEN** I receive 20 items, `totalElements: 45`, `totalPages: 3`
**WHEN** I request `page=2`
**THEN** I receive 5 items with `totalPages: 3`
**AND** items across all pages are in strict newest-first order with no duplicates

---

### AC-10 — Unauthenticated access redirected
**Maps to:** FR11

**GIVEN** I have no session
**WHEN** I navigate to `/feed`
**THEN** I am redirected to `/login`

**GIVEN** I have no valid JWT
**WHEN** I call `GET /api/v1/feed`
**THEN** the response is `401 Unauthorized`

---

### AC-11 — Nav item present and labelled
**Maps to:** FR7

**GIVEN** I am authenticated
**WHEN** I view the primary navigation
**THEN** I see a "Feed" link in the header nav (EN locale)
**AND** I see a "Discover" link in the header nav (EN locale)
**AND** clicking "Feed" navigates to `/[locale]/feed`

---

### AC-12 — Learner search happy path
**Maps to:** FR15, FR16, FR17, FR19, FR20

**GIVEN** "bob-smith" has displayName "Bob Smith" and profileVisibility PUBLIC
**WHEN** I type "bob" in the discover search input and wait 300 ms
**THEN** a result card for "Bob Smith" appears with avatar, displayName, handle, bio snippet, and Follow button
**AND** clicking the card navigates to `/learners/bob-smith`

---

### AC-13 — Follow state reflected in search results
**Maps to:** FR17

**GIVEN** "alice" already follows "bob-smith"
**WHEN** "alice" searches for "bob"
**THEN** the result card shows "Unfollow" (not "Follow")
**WHEN** "alice" clicks "Unfollow" on the result card
**THEN** the button changes to "Follow" and the follow relationship is removed

---

### AC-14 — Private profiles excluded from search
**Maps to:** FR18, NFR7

**GIVEN** "hidden-dan" has profileVisibility PRIVATE
**AND** "semi-open" has profileVisibility FOLLOWERS_ONLY
**WHEN** any authenticated user searches for "dan" or "semi"
**THEN** neither "hidden-dan" nor "semi-open" appears in results

---

### AC-15 — Search empty state does not enumerate accounts
**Maps to:** FR21

**GIVEN** no PUBLIC learner matches "xyzzy99"
**WHEN** I search for "xyzzy99"
**THEN** I see a neutral "No learners found" message
**AND** the message does NOT confirm or deny whether "xyzzy99" is a registered handle

---

### AC-16 — Search minimum character enforcement
**Maps to:** FR16, FR20

**GIVEN** the search input is focused
**WHEN** I type "a" (1 character)
**THEN** no API request is fired
**WHEN** I type "al" (2 characters) and wait 300 ms
**THEN** a search request fires to the backend

---

### AC-17 — Re-learn action on feed card
**Maps to:** FR12

**GIVEN** alice's feed shows a PUBLIC learning by "bob" titled "Rust Lifetimes"
**WHEN** I click the "Re-learn" button on that card
**THEN** the `ReLearningModal` opens pre-populated with "bob"'s learning
**AND** confirming creates a re-learning attributed to "bob" posted by "alice"

---

### AC-18 — Mobile: FeedScreen shows social feed
**Maps to:** FR13

**GIVEN** I am authenticated in the mobile app as "alice"
**AND** "alice" follows "bob" who has 2 PUBLIC learnings
**WHEN** I navigate to the FeedScreen
**THEN** I see "bob"'s 2 learnings, newest first, with "bob"'s avatar and display name

---

## Screens

### Screen: Social Feed

**Purpose:** Chronological feed of learnings from followed learners. The authenticated user's primary social/discovery surface.

**Route:** `/[locale]/feed`

**Layout:**
1. Header — existing app header (with `NavLinks` updated to highlight "Feed" as active)
2. Feed content area — vertically scrolled list of `FeedItem` cards, newest first
3. Pagination controls — "Previous / Next" page controls below the list (consistent with `/poks` pattern)

**Components:**
- `FeedPage` (server component shell, Suspense boundary)
  - `FeedContent` (client component)
    - `QuickEntry` (reuse as-is — user can capture new learnings without leaving the feed)
    - `FeedList` (new) → `PokCard` (for `type: 'owned'`) | `ReLearningCard` (for `type: 'shared'`, now wired)
    - `FeedEmptyState` (new) — distinct from the generic `EmptyState` component

**States:**
- Loading: skeleton cards (consistent with `/poks` loading pattern)
- Empty (no follows or no visible content): `FeedEmptyState` with "Find Learners" CTA
- Populated: `FeedList` with mixed `PokCard` / `ReLearningCard` items
- Error: inline error message with retry option

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `feed.title` | Feed | Feed |
| `feed.emptyState.message` | Nothing here yet — follow other learners to see their learnings. | Nada aqui ainda — siga outros aprendizes para ver seus aprendizados. |
| `feed.emptyState.cta` | Find Learners | Encontrar Aprendizes |
| `feed.error` | Something went wrong loading your feed. Try again. | Algo deu errado ao carregar seu feed. Tente novamente. |

**Interactions:**
- Feed card (owned learning) → links to `/poks/{id}` (via `PokCard` behaviour — no change)
- Feed card (re-learning) → original POK link handled by `ReLearningCard`
- Author avatar/name → links to `/learners/{handle}`
- "Re-learn" button on owned-card → opens `ReLearningModal`
- "Find Learners" in empty state → navigates to `/[locale]/discover`
- Pagination: Previous/Next page buttons (existing `Pagination` component reused)

**Accessibility:**
- Each `FeedList` item has a unique `aria-label` ("Learning by {displayName}: {title}")
- `FeedEmptyState` has a prominent landmark heading (`<h2>`)
- "Re-learn" button has `aria-label="Re-learn this learning by {displayName}"`

---

### Screen: Discover Learners

**Purpose:** Search for other learners by handle or display name; follow them from results.

**Route:** `/[locale]/discover`

**Layout:**
1. Header — app header (with "Discover" nav link highlighted as active)
2. Search bar — labelled text input at the top of the content area (not the existing POK search bar)
3. Results list — scrollable list of learner result cards below the input
4. States: pre-search, loading, results, empty

**Components:**
- `DiscoverPage` (server component shell)
  - `DiscoverContent` (client component)
    - `LearnerSearchBar` (new) — debounced search input, visible label, `aria-live` region
    - `LearnerResultsList` (new) → `LearnerResultCard` (new) × N

**`LearnerResultCard` layout:**
- `Avatar` (reuse existing component)
- Display name (or handle fallback if no display name)
- `@handle` in muted text
- Bio snippet (1–2 lines, truncated with ellipsis)
- `FollowButton` (reuse existing component, positioned as a sibling to the link area — NOT nested inside `<Link>`, per the `relative`/`absolute` pattern used in `PokCard`)
- Whole card is a `<Link>` to `/learners/{handle}` (except FollowButton area)

**States:**
- Pre-search (query < 2 chars): prompt "Type at least 2 characters to search"
- Loading: skeleton result cards (3–5 placeholders)
- Results: `LearnerResultsList`
- Empty (query ≥ 2 chars, no results): neutral message "No learners found" (no handle enumeration)
- Error: inline error message

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `discover.title` | Discover Learners | Descobrir Aprendizes |
| `discover.search.label` | Search learners | Buscar aprendizes |
| `discover.search.placeholder` | Search by name or handle | Buscar por nome ou @usuário |
| `discover.search.minChars` | Type at least 2 characters | Digite pelo menos 2 caracteres |
| `discover.search.noResults` | No learners found | Nenhum aprendiz encontrado |
| `discover.search.error` | Something went wrong. Try again. | Algo deu errado. Tente novamente. |

**Interactions:**
- Search input (debounced 300 ms) → fires `GET /api/v1/learners/search?q=&page=0&size=20`
- Result card body → navigates to `/learners/{handle}`
- `FollowButton` on result card → follow/unfollow (optimistic UI, existing `FollowButton` behaviour)

**Accessibility:**
- Search input has a `<label>` (visible, not placeholder-only)
- Result count announced via `aria-live="polite"` region when results update
- `FollowButton` has `aria-label="Follow {displayName}"` / `"Unfollow {displayName}"`
- Each result card has a keyboard-focusable primary link action

---

## Implementation Approach

### Architecture

#### Backend

**`FeedService`** (new class) — owns the cross-learner discovery feed:
- `getDiscoveryFeed(UUID requesterId, int page, int size): Page<FeedItemResponse>`
- Uses `JdbcTemplate` with a native SQL `UNION ALL` query (not in-memory merge) to join `poks` and `pok_shares` against `follows` in a single database round-trip
- Visibility filtering encoded in SQL (see query design below)

**Feed SQL query structure (UNION ALL):**

```sql
-- Branch 1: owned POKs from followed learners
SELECT 'owned' AS item_type, p.id, p.user_id AS author_id, p.created_at AS sort_ts,
       p.title, p.content, p.visibility, p.created_at, p.updated_at,
       u.handle AS author_handle, u.display_name AS author_display_name, u.avatar_url AS author_avatar_url,
       NULL AS share_id, NULL AS sharer_handle, NULL AS share_note, NULL AS share_visibility,
       NULL AS original_author_handle, NULL AS original_author_display_name, NULL AS original_author_avatar_url
FROM poks p
JOIN follows f ON f.followed_id = p.user_id AND f.follower_id = :requesterId
JOIN users u   ON u.id = p.user_id
WHERE p.deleted_at IS NULL
  AND p.user_id <> :requesterId
  AND (  p.visibility = 'PUBLIC'
      OR p.visibility = 'FOLLOWERS_ONLY'
      OR (p.visibility = 'COLLEAGUES_ONLY'
          AND EXISTS (SELECT 1 FROM follows fb
                      WHERE fb.follower_id = p.user_id AND fb.followed_id = :requesterId)))

UNION ALL

-- Branch 2: re-learnings (PokShares) from followed learners
SELECT 'shared' AS item_type, ps.id, ps.shared_by_user_id AS author_id, ps.created_at AS sort_ts,
       p.title, p.content, ps.visibility, p.created_at, p.updated_at,
       sharer.handle, sharer.display_name, sharer.avatar_url,
       ps.id AS share_id, sharer.handle AS sharer_handle, ps.note AS share_note, ps.visibility AS share_visibility,
       orig_author.handle, orig_author.display_name, orig_author.avatar_url
FROM pok_shares ps
JOIN follows f     ON f.followed_id = ps.shared_by_user_id AND f.follower_id = :requesterId
JOIN poks p        ON p.id = ps.original_pok_id AND p.deleted_at IS NULL
JOIN users sharer  ON sharer.id = ps.shared_by_user_id
JOIN users orig_author ON orig_author.id = p.user_id
WHERE ps.shared_by_user_id <> :requesterId
  AND (  ps.visibility = 'PUBLIC'
      OR ps.visibility = 'FOLLOWERS_ONLY'
      OR (ps.visibility = 'COLLEAGUES_ONLY'
          AND EXISTS (SELECT 1 FROM follows fb
                      WHERE fb.follower_id = ps.shared_by_user_id AND fb.followed_id = :requesterId)))

ORDER BY sort_ts DESC
LIMIT :size OFFSET :offset
```

**`LearnerService.searchLearners`** (new method):
- `Page<LearnerSearchResult> searchLearners(String query, UUID requesterId, int page, int size)`
- Backed by `UserRepository` `@Query(nativeQuery = true)` with `ILIKE '%:query%'` on `handle` and `display_name` (trigram index from V21 makes this efficient)
- Filters `WHERE profile_visibility = 'PUBLIC' AND id <> :requesterId`

**`LearnerSearchResult`** (new DTO record):
```java
public record LearnerSearchResult(
    String handle,
    String displayName,
    String avatarUrl,
    String bio,
    RelationshipStatus relationshipStatus  // derived for the requesting user
)
```

**`PokShareResponse` extension (pre-work):**
Add `originalAuthorHandle`, `originalAuthorDisplayName`, `originalAuthorAvatarUrl` fields before implementing the feed. These are needed to render re-learning cards in the multi-author feed context.

**`FeedController`** (new class):
- `GET /api/v1/feed?page=0&size=20` → `FeedService.getDiscoveryFeed()` → `Page<FeedItemResponse>`
- Requires `@AuthenticationPrincipal`; returns `200` with Spring's `Page`-wrapped `FeedItemResponse`

**`LearnerController`** (extend):
- Add `GET /api/v1/learners/search?q=&page=0&size=20` → `LearnerService.searchLearners()` → `Page<LearnerSearchResult>`

#### Web Frontend

**Home redirect:** `page.tsx` → redirect to `/[locale]/feed` (was `/[locale]/poks`). `LogoLink` updated similarly.

**`NavLinks`** (new component, `web/src/components/ui/NavLinks.tsx`):
- Renders only when authenticated
- Three links: "My learnings" → `/poks`, "Feed" → `/feed`, "Discover" → `/discover`
- Active state via `pathname.startsWith(href)`
- Slotted into `layout.tsx` header between `LogoLink` and right controls

**`FeedList`** (new, `web/src/components/poks/FeedList.tsx`):
```typescript
// Discriminated union dispatch — do NOT modify PokList
items.map(item =>
  item.type === 'shared'
    ? <ReLearningCard key={item.id} share={item} isOwner={item.sharedByHandle === currentUserHandle} onRemoved={...} />
    : <PokCard key={item.id} pok={item} dateField="createdAt" />
)
```

**`useFeedData`** (new hook, `web/src/hooks/useFeedData.ts`):
- Calls `learnerApi.getSocialFeed({ page, size })`
- Returns `{ items, totalElements, loading, error, page, handlePageChange, handleItemRemoved }`
- No keyword/sort params (feed is chronological-only)

**`useLearnerSearch`** (new hook, `web/src/hooks/useLearnerSearch.ts`):
- Wraps `learnerApi.searchLearners(query, page)` with `useDebounce(query, 300)` (existing `useDebounce` hook reused)
- Fires only when `debouncedQuery.length >= 2`

**New API functions in `learnerApi.ts`:**
- `getSocialFeed(params?: { page?, size? }): Promise<FeedPage>`
- `searchLearners(query: string, page?: number, size?: number): Promise<LearnerSearchPage>`
- New type: `LearnerSearchResult { handle, displayName?, avatarUrl?, bio?, relationshipStatus }`

#### Mobile

- Add `PokShare`, `FeedItem`, `FeedPage` types to `mobile/src/lib/pokApi.ts`
- Add `PokVisibility` values `FOLLOWERS_ONLY` and `COLLEAGUES_ONLY` (currently only `PRIVATE` / `PUBLIC`)
- Add `getSocialFeed()` function to mobile API layer
- Update `useFeedData.ts` to call `getSocialFeed()` instead of `pokApi.getAll()`
- Update `FeedScreen` to handle mixed `FeedItem[]` (render `LearningCard` for owned; render a `ReLearningCard` mobile variant or a simplified shared-card for type: 'shared')

### Test Strategy

- [x] Full TDD (tests first for all backend code: `FeedService`, `FeedController`, `LearnerService.searchLearners`, `LearnerController` search endpoint)
- [x] Full TDD for new frontend hooks (`useFeedData`, `useLearnerSearch`) and components (`FeedList`, `FeedEmptyState`, `LearnerSearchBar`, `LearnerResultCard`, `NavLinks`)
- [x] E2E scenarios for: feed happy path, feed empty state, re-learning card in feed, discover search happy path, discover follow from search results

### File Changes

**Backend — New:**
- `backend/src/main/java/.../service/FeedService.java` — discovery feed logic (JdbcTemplate UNION query)
- `backend/src/main/java/.../controller/FeedController.java` — `GET /api/v1/feed`
- `backend/src/main/java/.../dto/LearnerSearchResult.java` — search result DTO
- `backend/src/main/resources/db/migration/V21__add_discovery_feed_indexes.sql` — `pg_trgm` + 4 indexes
- `backend/src/test/java/.../service/FeedServiceTest.java`
- `backend/src/test/java/.../controller/FeedControllerTest.java`
- `backend/src/test/java/.../integration/FeedIntegrationTest.java`

**Backend — Modified:**
- `backend/src/main/java/.../dto/PokShareResponse.java` — add `originalAuthorHandle`, `originalAuthorDisplayName`, `originalAuthorAvatarUrl`
- `backend/src/main/java/.../repository/UserRepository.java` — add `searchByHandleOrDisplayName(@Query)`
- `backend/src/main/java/.../service/LearnerService.java` — add `searchLearners()` method
- `backend/src/main/java/.../controller/LearnerController.java` — add `GET /api/v1/learners/search`
- Existing controller + service tests updated for new fields/endpoints

**Web — New:**
- `web/src/app/[locale]/feed/page.tsx` — social feed page
- `web/src/app/[locale]/discover/page.tsx` — learner search page
- `web/src/components/poks/FeedList.tsx` — mixed FeedItem renderer
- `web/src/components/poks/FeedEmptyState.tsx` — feed-specific empty state
- `web/src/components/ui/NavLinks.tsx` — authenticated nav links
- `web/src/components/discover/LearnerSearchBar.tsx` — debounced search input
- `web/src/components/discover/LearnerResultCard.tsx` — single learner result card
- `web/src/components/discover/LearnerResultsList.tsx` — list of result cards
- `web/src/hooks/useFeedData.ts` — feed data hook
- `web/src/hooks/useLearnerSearch.ts` — search data hook
- `web/src/e2e/feed.spec.ts` — E2E: feed page
- `web/src/e2e/discover.spec.ts` — E2E: discover page
- Unit tests for all new components and hooks

**Web — Modified:**
- `web/src/app/[locale]/page.tsx` — redirect to `/feed` (was `/poks`)
- `web/src/components/ui/LogoLink.tsx` — link to `/feed` when authenticated
- `web/src/app/[locale]/layout.tsx` — slot `NavLinks` into header
- `web/src/lib/learnerApi.ts` — add `getSocialFeed`, `searchLearners`, new types
- `web/src/locales/en.json` — add `nav.*`, `feed.*`, `discover.*` keys
- `web/src/locales/pt-BR.json` — add `nav.*`, `feed.*`, `discover.*` keys
- `web/src/components/poks/ReLearningCard.tsx` — remove `// TODO(6.5)` deferral comment

**Mobile — Modified:**
- `mobile/src/lib/pokApi.ts` — add `PokShare`, `FeedItem`, `FeedPage` types; extend `PokVisibility`; add `getSocialFeed()`
- `mobile/src/hooks/useFeedData.ts` — update to call `getSocialFeed()`
- `mobile/src/screens/FeedScreen.tsx` — handle `FeedItem[]` mixed render

---

## Dependencies

**Blocked by:**
- Milestone 6.1 (Following & Colleagues) ✅ Done
- Milestone 6.4 (Share / Re-Learning) ✅ Done — `ReLearningCard` and `PokShare` model ready

**Pre-work blocker (within this milestone):**
- `PokShareResponse` must be extended with original author fields before the social feed frontend can be completed. Backend feeds task 1; frontend starts after that field is confirmed.

**Blocks:**
- Milestone 6.6 (Community Principles & Content Moderation) — the social feed creates the content surface that moderation tools operate on

**External:**
- `pg_trgm` PostgreSQL extension (included in Supabase standard distributions — no extra provisioning needed)
- No new npm packages expected

---

## Post-Implementation Notes

### Commits
- `6370c95` fix: extend PokShareResponse with original author fields
- `5de6aef` chore: add V21 Flyway migration for discovery feed indexes
- `e754554` feat: add FeedService with UNION ALL discovery feed query (TDD)
- `5e0df6f` feat: add FeedController GET /api/v1/feed (TDD)
- `ae48791` feat: add learner search endpoint (TDD)
- `77d4b4f` feat: update home redirect and nav for discovery feed (web)
- `7fe41a2` feat: add social feed page (web)
- `f2b215f` feat: add Discover page with learner search (web)
- `7bb3216` test: add E2E tests for feed and discover pages
- `c837fd3` feat: update mobile FeedScreen for social feed

### Architectural Decisions

- **Separate `learnerApi.ts` on mobile:** Rather than adding social feed types to `pokApi.ts`, a new `learnerApi.ts` module was created to mirror the web structure. This keeps the learner-facing API client separate from the POK CRUD client.
- **New `useSocialFeedData` hook instead of updating `useFeedData`:** `useFeedData` is used by `FeedScreen` for own-learnings search with `PokSearchParams`. The social feed has no search params. A separate hook keeps both hooks simple with a single responsibility.
- **Client-side auth guard on `/feed` and `/discover` (web):** Next.js middleware in this project only handles i18n routing. Auth redirects are done client-side via `useAuth() → router.push('/login')`, consistent with `usePoksData` and all other protected pages.
- **Route ordering in E2E mock-api.ts:** `/learners/search` check must precede the `/learners/{handle}` regex match, otherwise "search" is treated as a handle and returns 404.

### Deviations from Spec

- **`useFeedData` was not updated** — created `useSocialFeedData` instead to avoid breaking the existing personal-learnings hook. `FeedScreen` was updated to use the new hook.
- **Mobile types in `learnerApi.ts`, not `pokApi.ts`** — cleaner separation; spec referenced `pokApi.ts` as the destination but the implementation pattern is better served by a separate module.
- **AC-17 (Re-learn button on feed card)** — the mobile `ReLearningCard` variant was implemented as an inline renderer in `FeedScreen` rather than a dedicated component, as the mobile UI is simpler and a full modal was out of scope for this milestone.

### Lessons Learned

- Playwright strict mode violations (multiple elements matching a locator) are common when cards have duplicate links (avatar + text). Use `.first()` or more specific selectors.
- `input[type="search"]` has ARIA role `searchbox`, not `textbox` — always verify ARIA roles before writing Playwright locators.
- Mock API route handlers must be ordered most-specific first (e.g. `/learners/search` before `/learners/{handle}`) to avoid false path matches.
