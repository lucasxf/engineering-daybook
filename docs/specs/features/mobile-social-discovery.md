# Mobile Social Discovery

> **Status:** Draft
> **Created:** 2026-03-09
> **Implemented:** _pending_

---

## Context

The mobile app (Milestone 3.3) supports viewing a social feed of learnings from followed learners, but provides no way to discover, follow, or navigate to other learners. The web app has full social discovery:

- **Discover page** (`/[locale]/discover`) — search PUBLIC learners by name/handle
- **LearnerProfile page** (`/[locale]/learners/[handle]`) — avatar, bio, learnings list, FollowButton
- **FollowButton component** — 4 states (NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE)
- **Feed cards** — author name/avatar tappable, linking to the learner profile

The backend APIs are complete and stable (Milestones 6.1, 6.3, 6.5):
- `GET /api/v1/learners/{handle}` → `LearnerProfileResponse`
- `POST /api/v1/learners/{handle}/follow` → 204
- `DELETE /api/v1/learners/{handle}/follow` → 204
- `GET /api/v1/learners/search?q=&page=&size=` → `Page<LearnerSearchResult>`

The mobile `learnerApi.ts` currently only exposes `getFeed()`. This spec covers mobile-only UI work to close the parity gap.

**Related:**
- `docs/specs/features/following-and-colleagues.md` — backend APIs and web FollowButton reference
- `docs/specs/features/discovery-feed.md` — web Discover page and LearnerProfile reference
- `docs/specs/features/learner-profiles.md` — LearnerProfileResponse shape, Avatar component
- `mobile/CLAUDE.md` — navigation patterns, typed hooks, known pitfalls

---

## Requirements

### Functional

**Scope:** Mobile only (no backend or web changes)

- [ ] **FR1** `[Must Have]` Mobile `learnerApi.ts` exposes `getLearnerProfile(handle)`, `followLearner(handle)`, `unfollowLearner(handle)`, and `searchLearners(query, params?)` matching the web API module signatures.
- [ ] **FR2** `[Must Have]` A new `LearnerProfileScreen` (stack screen) renders: avatar, display name, handle, bio, and a scrollable list of the learner's public learnings.
- [ ] **FR3** `[Must Have]` `LearnerProfileScreen` shows a `FollowButton` for other learners reflecting the current `relationshipStatus` (NONE/FOLLOWING/FOLLOWED_BY/COLLEAGUE). The button is absent when viewing one's own profile.
- [ ] **FR4** `[Must Have]` Tapping a learning on `LearnerProfileScreen` navigates to `LearningDetail`.
- [ ] **FR5** `[Must Have]` A new `DiscoverScreen` provides a search bar for finding PUBLIC learners by name or handle.
- [ ] **FR6** `[Must Have]` `DiscoverScreen` shows learner result cards: avatar, display name, handle, bio snippet, and a `FollowButton`. Tapping the card body (not the button) navigates to `LearnerProfileScreen`.
- [ ] **FR7** `[Must Have]` Search in `DiscoverScreen` is debounced (300 ms) and fires only when the query is at least 2 characters. Queries shorter than 2 characters show a prompt instead of results.
- [ ] **FR8** `[Must Have]` `FeedScreen` makes author name and avatar tappable, navigating to `LearnerProfileScreen` for the corresponding handle.
- [ ] **FR9** `[Must Have]` `AppStack` gains a `LearnerProfile: { handle: string }` route.
- [ ] **FR10** `[Must Have]` `DiscoverScreen` is reachable from the Feed header (search/compass icon) and from the Feed empty-state CTA ("Find Learners").
- [ ] **FR11** `[Should Have]` A new `FollowButton` component (React Native) mirrors the web component's 4-state logic: NONE ("Follow"), FOLLOWING ("Following"), FOLLOWED_BY ("Follow back"), COLLEAGUE ("Colleague"). Tapping FOLLOWING or COLLEAGUE unfollows; tapping NONE or FOLLOWED_BY follows.
- [ ] **FR12** `[Should Have]` `FollowButton` shows an inline loading indicator while the API call is in flight and an error message if the call fails.
- [ ] **FR13** `[Should Have]` `LearnerProfileScreen` shows an appropriate empty state when the learner has no visible learnings.
- [ ] **FR14** `[Should Have]` `DiscoverScreen` shows a neutral "No learners found" message when the search returns no results (no handle enumeration).
- [ ] **FR15** `[Should Have]` `LearnerProfileScreen` shows a "private profile" shell (handle only, private message) when the backend returns a profile with `profileVisibility` set and no `learnings` array.
- [ ] **FR16** `[Could Have]` `DiscoverScreen` is accessible as a 4th bottom tab ("Discover") in addition to the header icon entry point. Navigation decision deferred — see Technical Constraints.

### Non-Functional

- [ ] **NFR1** All new user-facing strings have keys in both `mobile/src/i18n/locales/en.ts` and `pt-BR.ts` under `learnerProfile.*` and `discover.*` namespaces.
- [ ] **NFR2** All new components have unit tests (jest, `components` project). All new hooks have unit tests (`lib` project).
- [ ] **NFR3** Navigation types use typed hooks (`NativeStackNavigationProp<AppStackParamList>`) — no `useNavigation<any>()`. Route params derive from `AppStackParamList` via `RouteProp`, not inline types.
- [ ] **NFR4** `FollowButton` is keyboard/accessibility-friendly: `accessibilityRole="button"`, `accessibilityLabel` reflects current state and target handle.
- [ ] **NFR5** Search results list is scrollable and handles 0-to-many items without layout breakage.

---

## Technical Constraints

**Stack:** Mobile only (Expo / React Native, TypeScript)

**Technologies:**
- React Navigation 6 (`native-stack` + `bottom-tabs`)
- `useDebounce` hook already exists at `mobile/src/hooks/useDebounce.ts`
- `Avatar` component already exists at `mobile/src/components/ui/Avatar.tsx`
- `Button` component already exists at `mobile/src/components/ui/Button.tsx`
- Existing `apiFetch` from `mobile/src/lib/api.ts` handles auth + refresh

**Integration Points:**
- `mobile/src/lib/learnerApi.ts` — extend with 4 new API functions + types
- `mobile/src/navigation/AppStack.tsx` — add `LearnerProfile` route to `AppStackParamList`
- `mobile/src/navigation/AppTabs.tsx` — optional: add `Discover` tab (see FR16)
- `mobile/src/screens/app/FeedScreen.tsx` — make author attribution tappable
- `mobile/src/i18n/locales/en.ts` and `pt-BR.ts` — new keys

**Navigation decision — Discover entry point:**
The primary entry point for `DiscoverScreen` is a header icon (search/compass) on `FeedScreen` rather than a 4th bottom tab. Rationale: adding a tab changes the tab bar layout and shifts the existing 3 tabs, which is a larger UX impact than this spec warrants. A header icon is sufficient for an exploratory feature. FR16 records the tab option as a "Could Have" for future consideration. The `DiscoverScreen` is a stack screen in `AppStack`, not a tab.

**Out of Scope:**
- Backend changes (all APIs exist)
- Web changes (web already has this feature)
- Follower/following list screens (counts only, consistent with web)
- Blocking/muting (Milestone 6.6)
- Learner search within the `LearnerProfileScreen` (this screen shows one profile only)
- Notifications for follow events

---

## Acceptance Criteria

### AC-1 — View another learner's profile
**GIVEN** I am authenticated as "alice"
**AND** "bob" has a PUBLIC profile with displayName "Bob Smith", bio "Learning in public", and 3 PUBLIC learnings
**WHEN** I navigate to `LearnerProfile` with handle "bob"
**THEN** I see "Bob Smith", "@bob", "Learning in public", and all 3 learnings listed
**AND** I see a "Follow" button (alice does not follow bob)

---

### AC-2 — Follow a learner from their profile
**GIVEN** alice views bob's profile and the button shows "Follow"
**WHEN** alice taps "Follow"
**THEN** the button changes to "Following"
**AND** the API call `POST /api/v1/learners/bob/follow` was made

---

### AC-3 — Unfollow from profile
**GIVEN** alice already follows bob and views bob's profile ("Following" button)
**WHEN** alice taps "Following"
**THEN** the button changes to "Follow"
**AND** the API call `DELETE /api/v1/learners/bob/follow` was made

---

### AC-4 — Colleague state
**GIVEN** alice and bob mutually follow each other (colleagues)
**WHEN** alice views bob's profile
**THEN** the button shows "Colleague"
**WHEN** alice taps "Colleague"
**THEN** the button transitions to "Follow back" (alice unfollowed; bob still follows alice)

---

### AC-5 — Own profile: no FollowButton
**GIVEN** I am authenticated as "alice"
**WHEN** I navigate to `LearnerProfile` with my own handle
**THEN** no Follow button is displayed
**AND** I see my own profile content

---

### AC-6 — Private profile shell
**GIVEN** "carol" has `profileVisibility: PRIVATE` and alice does not follow carol
**WHEN** alice navigates to `LearnerProfile` with handle "carol"
**THEN** she sees carol's handle and a message like "This profile is private"
**AND** no learnings list is shown

---

### AC-7 — Empty learnings on profile
**GIVEN** "dan" has a PUBLIC profile with 0 learnings
**WHEN** alice views dan's profile
**THEN** she sees dan's avatar/bio and an empty-state message ("No learnings yet")
**AND** the Follow button is still displayed

---

### AC-8 — Tap learning on profile → LearningDetail
**GIVEN** alice is viewing bob's profile with a learning titled "Rust Lifetimes"
**WHEN** alice taps that learning card
**THEN** the app navigates to `LearningDetail` with the learning's id

---

### AC-9 — Discover: search happy path
**GIVEN** "bob-smith" has displayName "Bob Smith" and profileVisibility PUBLIC
**WHEN** alice types "bob" in the Discover search input and waits 300 ms
**THEN** a result card appears showing bob's avatar, "Bob Smith", "@bob-smith", bio snippet, and a "Follow" button

---

### AC-10 — Discover: follow from search results
**GIVEN** a result card for "bob-smith" shows "Follow"
**WHEN** alice taps "Follow" on that card
**THEN** the button changes to "Following"
**AND** `POST /api/v1/learners/bob-smith/follow` was called

---

### AC-11 — Discover: tap result card → LearnerProfile
**GIVEN** a result card for "bob-smith" is visible
**WHEN** alice taps the card body (not the Follow button)
**THEN** the app navigates to `LearnerProfile` with handle "bob-smith"

---

### AC-12 — Discover: private profiles excluded
**GIVEN** "hidden-dan" has profileVisibility PRIVATE
**WHEN** alice searches for "dan"
**THEN** "hidden-dan" does not appear in the results

---

### AC-13 — Discover: minimum 2 characters
**GIVEN** the search input is empty or has 1 character
**THEN** no API request is fired and a prompt "Type at least 2 characters" is shown
**WHEN** alice types "bo" (2 characters) and waits 300 ms
**THEN** a search request fires

---

### AC-14 — Discover: no-results state
**GIVEN** no PUBLIC learner matches "xyzzy99"
**WHEN** alice searches for "xyzzy99"
**THEN** a neutral "No learners found" message appears
**AND** the message does NOT confirm or deny whether "xyzzy99" is a registered handle

---

### AC-15 — Feed: tappable author attribution
**GIVEN** the social feed shows a learning by "bob" with bob's display name visible
**WHEN** alice taps bob's name or avatar in the feed card attribution row
**THEN** the app navigates to `LearnerProfile` with handle "bob"

---

### AC-16 — Discover reachable from Feed header
**GIVEN** alice is on the FeedScreen
**WHEN** she taps the search/discover icon in the feed header
**THEN** the app navigates to `DiscoverScreen`

---

### AC-17 — Discover reachable from Feed empty state
**GIVEN** alice follows nobody and the feed shows the empty state
**WHEN** she taps "Find Learners"
**THEN** the app navigates to `DiscoverScreen`

---

## Screens

### Screen: LearnerProfileScreen

**Purpose:** View another learner's public profile — avatar, bio, public learnings — and follow/unfollow them.

**Route:** Stack screen `LearnerProfile`, params: `{ handle: string }`

**Layout:**
1. Header — back button (native stack), screen title = learner's displayName (or handle fallback)
2. Profile section — Avatar (size 64), displayName, "@handle", bio; FollowButton (absent for own profile)
3. Learnings section heading — "Learnings"
4. Learnings list — scrollable `FlatList` of `LearningCard` items

**Components:**
- `LearnerProfileScreen`
  - `Avatar` (reuse existing, size 64)
  - `FollowButton` (new — see below)
  - `FlatList` of `LearningCard` (reuse existing)
  - `Text` (reuse existing)
  - `ErrorMessage` (reuse existing)
  - `ActivityIndicator` (loading state)

**States:**
- Loading: `ActivityIndicator` centered (profile data not yet fetched)
- Private shell: avatar placeholder, handle, "This profile is private" message, no learnings
- Populated (own profile): avatar, displayName, handle, bio, learnings; no FollowButton
- Populated (other learner): avatar, displayName, handle, bio, learnings; FollowButton
- Empty learnings: profile header visible, "No learnings yet" below the section heading
- Error: `ErrorMessage` with retry button

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `learnerProfile.title` | Profile | Perfil |
| `learnerProfile.learnings` | Learnings | Aprendizados |
| `learnerProfile.noLearnings` | No learnings yet | Nenhum aprendizado ainda |
| `learnerProfile.privateProfile` | This profile is private | Este perfil é privado |
| `learnerProfile.loadError` | Failed to load profile | Erro ao carregar perfil |
| `learnerProfile.retry` | Retry | Tentar novamente |

**Interactions:**
- Back button → pop stack (native)
- `FollowButton` → follow/unfollow (see FollowButton component)
- Learning card tap → `nav.navigate('LearningDetail', { pokId })`

**Accessibility:**
- `Avatar` `accessibilityLabel`: `"{displayName}'s avatar"`
- `FollowButton` `accessibilityRole="button"`, `accessibilityLabel` reflects state + handle: "Follow bob", "Unfollow bob", "Follow bob back", "Colleague: bob"
- Learnings `FlatList` items have `accessibilityRole="button"` via `PressableCard`

---

### Screen: DiscoverScreen

**Purpose:** Search for PUBLIC learners by name or handle; follow them from results.

**Route:** Stack screen `Discover` (no params), navigated to from `FeedScreen` header icon

**Layout:**
1. Header — screen title "Discover Learners"
2. Search input — text input at top, debounced 300 ms
3. Content area — one of: prompt (< 2 chars), loading skeleton, results list, no-results message, error

**Components:**
- `DiscoverScreen`
  - `TextInput` (reuse existing `ui/TextInput`)
  - `FlatList` of `LearnerResultCard` (new)
  - `Text` (reuse existing)
  - `ActivityIndicator` (loading state)
  - `ErrorMessage` (error state)

**`LearnerResultCard` layout:**
- `Avatar` (size 40, left side)
- Right column: displayName (or handle fallback), "@handle" in muted text, bio snippet (2 lines max, truncated)
- `FollowButton` (right edge, vertically centered)
- Entire card is pressable (navigates to `LearnerProfile`), FollowButton press is separate (no navigation)

**States:**
- Pre-search (query < 2 chars): centered prompt "Type at least 2 characters to search"
- Loading: `ActivityIndicator` (fires after debounce, while request in flight)
- Results: `FlatList` of `LearnerResultCard`
- Empty (query >= 2 chars, no results): "No learners found"
- Error: `ErrorMessage` with retry

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `discover.title` | Discover Learners | Descobrir Aprendizes |
| `discover.searchPlaceholder` | Search by name or handle | Buscar por nome ou @usuário |
| `discover.minCharsPrompt` | Type at least 2 characters to search | Digite pelo menos 2 caracteres |
| `discover.noResults` | No learners found | Nenhum aprendiz encontrado |
| `discover.loadError` | Something went wrong. Try again. | Algo deu errado. Tente novamente. |

**Interactions:**
- Search input (debounced 300 ms) → fires `searchLearners(query)` when length >= 2
- Result card press → `nav.navigate('LearnerProfile', { handle })`
- `FollowButton` press → follow/unfollow (stays on Discover, no navigation)

**Accessibility:**
- Search `TextInput` has `accessibilityLabel="Search learners"`
- Result cards have `accessibilityRole="button"`, `accessibilityLabel="{displayName}, @{handle}"`
- `FollowButton` on result card: `accessibilityLabel="Follow {displayName}"` / `"Unfollow {displayName}"`

---

### Component: FollowButton (Mobile)

**Purpose:** Follow/unfollow control reflecting the authenticated user's relationship to a target learner.

**Props:**
```typescript
interface FollowButtonProps {
  handle: string;
  relationshipStatus: RelationshipStatus;   // 'NONE' | 'FOLLOWING' | 'FOLLOWED_BY' | 'COLLEAGUE'
  onRelationshipChange?: (newStatus: RelationshipStatus) => void;
}
```

**States and labels:**
| `relationshipStatus` | Button label | Variant | Tap action |
|----------------------|--------------|---------|------------|
| `NONE` | Follow | primary | `followLearner(handle)` → callback with `FOLLOWING` |
| `FOLLOWING` | Following | secondary | `unfollowLearner(handle)` → callback with `NONE` |
| `FOLLOWED_BY` | Follow back | primary | `followLearner(handle)` → callback with `COLLEAGUE` |
| `COLLEAGUE` | Colleague | secondary | `unfollowLearner(handle)` → callback with `FOLLOWED_BY` |

**Loading:** `Button` `loading` prop set `true` while API call is in flight. Tap is ignored while loading.

**Error:** Inline `ErrorMessage` below the button on failure. Cleared on next tap.

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `learners.social.follow` | Follow | Seguir |
| `learners.social.following` | Following | Seguindo |
| `learners.social.followBack` | Follow back | Seguir de volta |
| `learners.social.colleague` | Colleague | Colega |
| `learners.social.unexpectedError` | Something went wrong | Algo deu errado |

---

### Modified Screen: FeedScreen

**Changes:**
- Author attribution row (displayName + handle) in owned feed items becomes a `TouchableOpacity` or `Pressable` that navigates to `LearnerProfile` for `authorHandle`.
- Re-learning card sharer header ("re-learned by @handle") becomes tappable, navigating to `LearnerProfile` for `sharedByHandle`.
- Feed header gains a discover icon button (e.g., search/compass icon) that navigates to `Discover`.
- Empty-state adds a "Find Learners" button navigating to `Discover`.

---

## Implementation Approach

### Architecture

**Layer 1 — API (pure TypeScript, `lib` jest project):**
Extend `mobile/src/lib/learnerApi.ts` with:
- `RelationshipStatus` type (`'NONE' | 'FOLLOWING' | 'FOLLOWED_BY' | 'COLLEAGUE'`)
- `LearnerProfileResponse` interface (mirrors web shape: handle, displayName?, avatarUrl?, bio?, profileVisibility?, learnings?, relationshipStatus?, followerCount?, followingCount?, colleagueCount?)
- `LearnerPokSummary` interface (id, title?, content, createdAt)
- `LearnerSearchResult` interface (handle, displayName, avatarUrl?, bio?, relationship?)
- `LearnerSearchPage` interface (content, totalElements, totalPages, number, size)
- `getLearnerProfile(handle: string): Promise<LearnerProfileResponse>`
- `followLearner(handle: string): Promise<void>`
- `unfollowLearner(handle: string): Promise<void>`
- `searchLearners(q: string, params?: { page?: number; size?: number }): Promise<LearnerSearchPage>`

**Layer 2 — Hooks (`lib` jest project):**
- `useLearnerProfile(handle: string)` — fetches profile, manages loading/error state
- `useLearnerSearch(query: string)` — debounced search (reuses `useDebounce`), fires on >= 2 chars

**Layer 3 — Components (`components` jest project):**
- `FollowButton` (`mobile/src/components/learners/FollowButton.tsx`)
- `LearnerResultCard` (`mobile/src/components/discover/LearnerResultCard.tsx`)

**Layer 4 — Screens (integration; `rn` jest project if needed):**
- `LearnerProfileScreen` (`mobile/src/screens/app/LearnerProfileScreen.tsx`)
- `DiscoverScreen` (`mobile/src/screens/app/DiscoverScreen.tsx`)

**Navigation wiring:**
- `AppStackParamList` gains `LearnerProfile: { handle: string }` and `Discover: undefined`
- `AppStack` gains two new `Stack.Screen` entries (lazy-loaded)
- `FeedScreen` updated with tappable attribution and header icon

### Test Strategy

- [ ] Full TDD for API layer (`learnerApi.ts` additions — `lib` jest project)
- [ ] Full TDD for hooks (`useLearnerProfile`, `useLearnerSearch` — `lib` jest project)
- [ ] Full TDD for `FollowButton` component (`components` jest project, node env + native module stubs)
- [ ] Full TDD for `LearnerResultCard` component (`components` jest project)
- [ ] Screens: basic render + navigation tests where possible; deep integration tests deferred to Maestro E2E

**Maestro E2E flows (new):**
- `e2e/discover-search.yaml` — search happy path, tap result → profile
- `e2e/learner-profile.yaml` — view profile, follow, tap learning
- `e2e/feed-author-tap.yaml` — tap author in feed → profile

### File Changes

**New:**
- `mobile/src/components/learners/FollowButton.tsx` — 4-state follow/unfollow button
- `mobile/src/components/learners/__tests__/FollowButton.test.tsx`
- `mobile/src/components/discover/LearnerResultCard.tsx` — single learner search result card
- `mobile/src/components/discover/__tests__/LearnerResultCard.test.tsx`
- `mobile/src/screens/app/LearnerProfileScreen.tsx`
- `mobile/src/screens/app/DiscoverScreen.tsx`
- `mobile/src/hooks/useLearnerProfile.ts`
- `mobile/src/hooks/useLearnerSearch.ts`
- `mobile/src/hooks/__tests__/useLearnerProfile.test.ts`
- `mobile/src/hooks/__tests__/useLearnerSearch.test.ts`
- `mobile/e2e/discover-search.yaml`
- `mobile/e2e/learner-profile.yaml`
- `mobile/e2e/feed-author-tap.yaml`

**Modified:**
- `mobile/src/lib/learnerApi.ts` — add `RelationshipStatus`, `LearnerProfileResponse`, `LearnerPokSummary`, `LearnerSearchResult`, `LearnerSearchPage`, `getLearnerProfile`, `followLearner`, `unfollowLearner`, `searchLearners`
- `mobile/src/lib/__tests__/learnerApi.test.ts` — add tests for 4 new functions
- `mobile/src/navigation/AppStack.tsx` — add `LearnerProfile` and `Discover` to `AppStackParamList` + lazy screen registrations
- `mobile/src/screens/app/FeedScreen.tsx` — tappable author attribution, header discover icon, empty-state "Find Learners" CTA
- `mobile/src/i18n/locales/en.ts` — add `learnerProfile.*`, `discover.*`, `learners.social.*` keys
- `mobile/src/i18n/locales/pt-BR.ts` — matching PT-BR keys

---

## Implementation Plan

### Task 1: Extend learnerApi.ts with social discovery functions
- **Files:** `mobile/src/lib/learnerApi.ts`, `mobile/src/lib/__tests__/learnerApi.test.ts`
- **Depends on:** _none_
- **Commit:** `feat: add getLearnerProfile, follow/unfollow, searchLearners to mobile learnerApi`
- **Stack:** mobile

### Task 2: Add useLearnerProfile and useLearnerSearch hooks
- **Files:** `mobile/src/hooks/useLearnerProfile.ts`, `mobile/src/hooks/useLearnerSearch.ts`, `mobile/src/hooks/__tests__/useLearnerProfile.test.ts`, `mobile/src/hooks/__tests__/useLearnerSearch.test.ts`
- **Depends on:** Task 1
- **Commit:** `feat: add useLearnerProfile and useLearnerSearch hooks`
- **Stack:** mobile

### Task 3: Add FollowButton component
- **Files:** `mobile/src/components/learners/FollowButton.tsx`, `mobile/src/components/learners/__tests__/FollowButton.test.tsx`
- **Depends on:** Task 1
- **Commit:** `feat: add mobile FollowButton component with 4-state relationship logic`
- **Stack:** mobile

### Task 4: Add LearnerResultCard component
- **Files:** `mobile/src/components/discover/LearnerResultCard.tsx`, `mobile/src/components/discover/__tests__/LearnerResultCard.test.tsx`
- **Depends on:** Task 3
- **Commit:** `feat: add LearnerResultCard component for discover search results`
- **Stack:** mobile

### Task 5: Add LearnerProfileScreen
- **Files:** `mobile/src/screens/app/LearnerProfileScreen.tsx`
- **Depends on:** Task 2, Task 3
- **Commit:** `feat: add LearnerProfileScreen with profile, learnings, and FollowButton`
- **Stack:** mobile

### Task 6: Add DiscoverScreen
- **Files:** `mobile/src/screens/app/DiscoverScreen.tsx`
- **Depends on:** Task 2, Task 4
- **Commit:** `feat: add DiscoverScreen with debounced learner search`
- **Stack:** mobile

### Task 7: Wire navigation and update FeedScreen
- **Files:** `mobile/src/navigation/AppStack.tsx`, `mobile/src/screens/app/FeedScreen.tsx`, `mobile/src/i18n/locales/en.ts`, `mobile/src/i18n/locales/pt-BR.ts`
- **Depends on:** Task 5, Task 6
- **Commit:** `feat: wire LearnerProfile and Discover routes; make feed author attribution tappable`
- **Stack:** mobile

### Task 8: Add Maestro E2E flows
- **Files:** `mobile/e2e/discover-search.yaml`, `mobile/e2e/learner-profile.yaml`, `mobile/e2e/feed-author-tap.yaml`
- **Depends on:** Task 7
- **Commit:** `test: add Maestro E2E flows for social discovery`
- **Stack:** mobile

---

## Dependencies

**Blocked by:**
- Milestone 6.1 (Following & Colleagues) — backend follow/unfollow APIs ✅ Done
- Milestone 6.3 (Learner Profiles) — `GET /api/v1/learners/{handle}` and `Avatar` component ✅ Done
- Milestone 6.5 (Discovery Feed) — `GET /api/v1/learners/search` ✅ Done

**Blocks:**
- Milestone 3.4 App Store publishing (this feature is required for a complete mobile UX)

**External:** None — no new npm packages required. All native capabilities needed (`TouchableOpacity`, `FlatList`, `TextInput`) are part of React Native core.

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
