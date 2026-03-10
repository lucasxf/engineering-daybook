# Mobile — My Learnings Screen

> **Status:** Planned
> **Created:** 2026-03-09
> **Milestone:** 3.4 (App Store Publishing) — companion UX milestone

---

## Context

The mobile app's bottom tab bar currently contains three tabs: **Feed** (social discovery, `useSocialFeedData`), **New Learning** (compose screen), and **Profile**. There is no dedicated view for the authenticated user's own learnings.

The `useFeedData` hook (`mobile/src/hooks/useFeedData.ts`) is a fully-featured, paginated data hook that supports keyword search, search mode, tag filtering, sort order, pull-to-refresh, and infinite scroll — it was originally written for the personal learnings view but has never been consumed by any screen. The web equivalent is the `/poks` page: a `SearchBar` + `SortDropdown` + infinite-scroll list of the user's own learnings.

This spec delivers a **My Learnings** tab screen that gives mobile users parity with the web `/poks` page, and makes `useFeedData` the engine behind it.

**Related:**
- `mobile/src/hooks/useFeedData.ts` — existing hook, all params supported
- `mobile/src/hooks/useDebounce.ts` — existing 300 ms debounce hook
- `mobile/src/navigation/AppTabs.tsx` — bottom tab navigator (3 tabs today)
- `mobile/src/navigation/AppStack.tsx` — root stack wrapping `AppTabs`
- `mobile/src/screens/app/FeedScreen.tsx` — social feed screen (uses `useSocialFeedData`)
- `docs/specs/features/mobile-app.md` — original mobile app spec
- `docs/specs/features/discovery-feed.md` — FR13 explicitly called for own-learnings access from a "My Learnings" tab after the social feed milestone

---

## Navigation Decision: 4th Bottom Tab (not segment control)

### Options considered

**Option A — 4th bottom tab: Feed | My Learnings | New | Profile**

**Option B — Segment control inside the existing Feed tab: "Feed" / "My Learnings" toggle**

### Decision: Option A (4th tab)

**Rationale:**

1. **Distinct intent:** "Discovering what others are learning" (Feed) and "reviewing my own learnings" (My Learnings) are fundamentally different mental modes. Collapsing them behind a segment control forces the user to make an additional choice before starting either task — the opposite of the UX Mandate ("fewer clicks, fewer screens").

2. **No state interference:** Each tab preserves its own scroll position and search state. A segment control sharing one tab screen would reset My Learnings state every time the user checks the social feed.

3. **Consistency with web nav:** The web app exposes both `/feed` (social) and `/poks` (personal) as top-level nav links. The tab bar is the mobile equivalent of top-level navigation.

4. **Thumb reachability:** The 4th tab position (second from right, adjacent to New) is a natural slot. It sits between Feed and Profile, matching the rough left-to-right information flow: discovery → personal → compose → account.

5. **Tab count is still manageable:** 4 tabs is within the iOS/Android HIG recommendation of ≤5. A 5th tab (if added later for Discover) would be the limit — this is not a concern for this milestone.

**Trade-off acknowledged:** The New Learning action moves from position 2 to position 3. Users who have muscle memory for tapping the centre tab will notice. Mitigated by retaining the tab's prominent icon (plus sign) which makes it self-labelling.

**Final tab order:** Feed | My Learnings | New Learning | Profile

---

## Requirements

### Functional

#### Screen: My Learnings (3.X.1)

- [ ] **FR1** `[Must Have]` A new "My Learnings" bottom tab is added as the second tab in `AppTabs`, between Feed and New Learning. The tab icon and label are distinct from the Feed tab.
- [ ] **FR2** `[Must Have]` The My Learnings screen displays a paginated, infinite-scroll list of the authenticated user's own learnings, fetched via `useFeedData` with no initial filter params (defaults: `sortBy: 'createdAt'`, `sortDirection: 'DESC'`).
- [ ] **FR3** `[Must Have]` Each learning card shows: content preview (~120 chars, truncated), title if present, relative timestamp, and tag badges. This reuses the existing `LearningCard` component — no new card variant needed.
- [ ] **FR4** `[Must Have]` Tapping a learning card navigates to `LearningDetail` (via the `AppStack`, same as `FeedScreen`). The existing `LearningDetail` screen covers reading and editing.
- [ ] **FR5** `[Must Have]` Pull-to-refresh: the user can drag down to refresh the list. Uses the `refresh()` function from `useFeedData`.
- [ ] **FR6** `[Must Have]` Infinite scroll: the next page is fetched when the user scrolls to within 3 items of the end (`onEndReachedThreshold={0.3}`). Uses the `loadMore()` function from `useFeedData`.
- [ ] **FR7** `[Must Have]` A loading spinner (activity indicator) is shown during initial fetch. The list is not shown while `loading === true && !refreshing`.
- [ ] **FR8** `[Must Have]` An empty state is shown when the user has no learnings: a message ("No learnings yet") and a call-to-action directing the user to the New Learning tab.
- [ ] **FR9** `[Must Have]` If the API returns an error, an inline `ErrorMessage` component is shown. The user can pull-to-refresh to retry.
- [ ] **FR10** `[Must Have]` A `SearchBar` component (new, reusable) is rendered above the list. It is visible by default — not hidden behind an icon tap (Nielsen heuristic: recognition over recall). The search bar debounces user input via `useDebounce(keyword, 300)` and calls `setParams({ keyword: debouncedKeyword, page: 0 })` on `useFeedData`. Minimum query length is 1 character; clearing the input restores the unfiltered list.
- [ ] **FR11** `[Must Have]` A `SortPicker` component (new, reusable) renders a sort trigger button that opens a native action sheet (using `ActionSheetIOS` on iOS; `Alert.alert` with buttons on Android as a cross-platform fallback — see Technical Constraints). Sort options: "Newest first" (`createdAt DESC`), "Oldest first" (`createdAt ASC`), "Recently updated" (`updatedAt DESC`). Selecting an option calls `setParams({ sortBy, sortDirection })`.
- [ ] **FR12** `[Should Have]` When an active search query returns zero results, a "No results" empty state is shown with a "Clear search" button that resets the keyword to empty.
- [ ] **FR13** `[Should Have]` The sort selection is not persisted between app launches (per the original mobile app spec: "preference does not need to persist across sessions in this milestone").
- [ ] **FR14** `[Could Have — DEFERRED]` Tag filter. Covered by a separate `mobile-tag-management.md` spec. `useFeedData` already accepts `tagId` — no code changes needed when that spec is implemented.
- [ ] **FR15** `[Could Have — DEFERRED]` Tag-grouped view (visualisation mode). Lower priority — deferred to future polish milestone.

#### Component: SearchBar (new, reusable)

- [ ] **FR16** `[Must Have]` A `SearchBar` component at `mobile/src/components/ui/SearchBar.tsx` accepts: `value: string`, `onChangeText: (text: string) => void`, `placeholder?: string`, `onClear?: () => void`. It renders a `TextInput` with a magnifying glass prefix icon and a clear (✕) suffix button that appears when `value.length > 0`.
- [ ] **FR17** `[Must Have]` `SearchBar` applies theme tokens for colours and spacing (no hardcoded values). It supports both light and dark modes.
- [ ] **FR18** `[Must Have]` `SearchBar` has a minimum touch target of 44×44pt on the clear button. The text input has `accessibilityLabel` and `returnKeyType="search"`.

#### Component: SortPicker (new, reusable)

- [ ] **FR19** `[Must Have]` A `SortPicker` component at `mobile/src/components/ui/SortPicker.tsx` accepts: `value: SortOption`, `onChange: (option: SortOption) => void`, `options: SortOption[]` where `SortOption = { label: string; sortBy: 'createdAt' | 'updatedAt'; sortDirection: 'ASC' | 'DESC' }`.
- [ ] **FR20** `[Must Have]` On iOS, tapping the `SortPicker` trigger opens a native `ActionSheetIOS` (which respects the system's haptic feedback and dark mode). On Android, it opens an `Alert` with button options as a cross-platform fallback.
- [ ] **FR21** `[Must Have]` The `SortPicker` trigger button displays the currently selected option's label. It has a down-chevron icon to communicate interactivity. It has `accessibilityLabel` set to `"Sort: {currentLabel}"`.

---

### Non-Functional

#### Performance
- [ ] **NFR1** The My Learnings list must display the first page within 2 seconds on a 4G connection (same target as `FeedScreen`).
- [ ] **NFR2** `SearchBar` debounce is 300 ms — no API call fires until the debounce timer elapses after the user stops typing.
- [ ] **NFR3** `useFeedData`'s `AbortController` mechanism (already implemented in the hook) cancels in-flight requests when params change, preventing stale results from replacing newer ones.

#### Accessibility
- [ ] **NFR4** All interactive elements (tab, search bar, clear button, sort trigger, learning cards) have `accessibilityLabel` props. VoiceOver (iOS) and TalkBack (Android) can navigate the entire screen without sighted assistance.
- [ ] **NFR5** Sort options announced by the action sheet are native platform UI — accessibility handled by the OS.
- [ ] **NFR6** Empty state and error state messages use `accessibilityRole="text"` so they are announced to screen readers.

#### Internationalization
- [ ] **NFR7** All user-facing strings are defined in `mobile/src/i18n/locales/en.ts` and `pt-BR.ts` under the `learnings.myLearnings.*` namespace. No hardcoded strings in components.
- [ ] **NFR8** The word "POK" must not appear anywhere in the UI, labels, or placeholders.

#### Code Quality
- [ ] **NFR9** TypeScript `strict: true` — no `any` in production code paths. `SortOption` and component props are explicitly typed.
- [ ] **NFR10** `SearchBar` and `SortPicker` are reusable UI components with no dependency on `useFeedData` or business logic — they are pure presentation + callback components.

#### Testing
- [ ] **NFR11** Unit tests for `SearchBar`: renders with/without value, clear button visibility, `onClear` callback, `onChangeText` callback, accessibility labels.
- [ ] **NFR12** Unit tests for `SortPicker`: renders current label, `onChange` called with correct `SortOption`, accessibility label.
- [ ] **NFR13** Hook integration test: `useFeedData` called with correct `setParams` values when search text changes (debounced) and when sort option changes.
- [ ] **NFR14** `MyLearningsScreen` render tests: loading state, error state, empty state, populated list with at least one `LearningCard`, search bar and sort picker presence.

---

## Technical Constraints

**Stack:** Mobile (Expo SDK 53, React Native 0.79, managed workflow, TypeScript strict)

**Key integration points:**

| File | Role |
|------|------|
| `mobile/src/hooks/useFeedData.ts` | Data hook — keyword, sort, pagination, refresh, loadMore |
| `mobile/src/hooks/useDebounce.ts` | 300 ms debounce for search input |
| `mobile/src/navigation/AppTabs.tsx` | Add `MyLearnings` tab; update `AppTabsParamList` |
| `mobile/src/navigation/AppStack.tsx` | No changes — `LearningDetail` already in stack |
| `mobile/src/components/feed/LearningCard.tsx` | Existing card component — reused as-is |
| `mobile/src/components/ui/ErrorMessage.tsx` | Existing error component — reused as-is |
| `mobile/src/i18n/locales/en.ts` / `pt-BR.ts` | Add `learnings.myLearnings.*` keys |

**ActionSheet cross-platform approach:**

The `SortPicker` uses `ActionSheetIOS` on iOS (native, dark-mode-aware) and falls back to `Alert.alert` with button options on Android. This avoids pulling in a third-party action sheet library (Expo managed workflow keeps native modules minimal). If a future milestone needs a more polished Android picker, `@gorhom/bottom-sheet` can be adopted then.

```typescript
// SortPicker — platform dispatch
import { ActionSheetIOS, Alert, Platform } from 'react-native';

function showPicker(options: SortOption[], onChange: (o: SortOption) => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: [...options.map(o => o.label), cancelLabel], cancelButtonIndex: options.length },
      (idx) => { if (idx < options.length) onChange(options[idx]); }
    );
  } else {
    Alert.alert(sortLabel, undefined,
      [...options.map(o => ({ text: o.label, onPress: () => onChange(o) })),
       { text: cancelLabel, style: 'cancel' }]
    );
  }
}
```

**Navigation typing:**

`MyLearnings` is a new entry in `AppTabsParamList`. Screens within it use `BottomTabNavigationProp<AppTabsParamList, 'MyLearnings'>` for type-safe navigation. The existing `AppStack`'s `LearningDetail` route handles detail navigation — `MyLearningsScreen` navigates to it via `useNavigation<NativeStackNavigationProp<AppStackParamList>>()`.

**`useFeedData` param mapping:**

| UI action | `setParams` call |
|-----------|-----------------|
| User types search text (debounced) | `setParams({ keyword: debouncedText })` |
| User clears search | `setParams({ keyword: undefined })` |
| User picks "Newest first" | `setParams({ sortBy: 'createdAt', sortDirection: 'DESC' })` |
| User picks "Oldest first" | `setParams({ sortBy: 'createdAt', sortDirection: 'ASC' })` |
| User picks "Recently updated" | `setParams({ sortBy: 'updatedAt', sortDirection: 'DESC' })` |

Note: `setParams` in `useFeedData` merges onto existing params and resets `page` to 0 (see `useFeedData` implementation — `setParamsState(prev => ({ ...prev, ...newParams, page: 0 }))`), so callers do not need to pass `page: 0` explicitly.

---

## Acceptance Criteria

### AC-1 — My Learnings tab is visible and navigable
**GIVEN** I am authenticated
**WHEN** I open the app
**THEN** I see four bottom tabs: Feed | My Learnings | New Learning | Profile
**AND** tapping "My Learnings" renders the My Learnings screen

---

### AC-2 — My Learnings shows the user's own learnings
**GIVEN** I am authenticated as "alice" and have 5 learnings
**WHEN** I navigate to the My Learnings tab
**THEN** I see 5 `LearningCard` items, newest first (default sort)
**AND** none of the cards show social attribution metadata (no "re-learned by", no other author handle)

---

### AC-3 — Initial loading state
**GIVEN** I navigate to My Learnings
**WHEN** the API call is in-flight (first load)
**THEN** I see an `ActivityIndicator` and no list items
**AND** the indicator disappears once the first page of results arrives

---

### AC-4 — Pull-to-refresh
**GIVEN** My Learnings is showing a list of learnings
**WHEN** I drag down past the top of the list
**THEN** the pull-to-refresh spinner activates
**AND** the list is refreshed from page 0 after the API call completes

---

### AC-5 — Infinite scroll
**GIVEN** I have 25 learnings (page size 20)
**AND** page 0 is displayed (20 items)
**WHEN** I scroll to within 3 items of the bottom
**THEN** page 1 is fetched and 5 more items are appended
**AND** the list does not scroll to the top

---

### AC-6 — Empty state: no learnings
**GIVEN** I am a new user with 0 learnings
**WHEN** I navigate to My Learnings
**THEN** I see the empty state message ("No learnings yet")
**AND** I see a CTA directing me to the New Learning tab

---

### AC-7 — Error state
**GIVEN** the API returns a 5xx error on initial fetch
**WHEN** the My Learnings screen renders
**THEN** I see an inline error message (not a crash)
**AND** I can pull-to-refresh to retry

---

### AC-8 — SearchBar is always visible
**GIVEN** I am on My Learnings with at least one learning
**WHEN** the screen renders
**THEN** the `SearchBar` is visible above the list without any tap to reveal it
**AND** the search input shows the placeholder text from i18n

---

### AC-9 — Search filters the list (debounced)
**GIVEN** I have learnings containing "React" and "Kubernetes"
**WHEN** I type "react" in the `SearchBar`
**AND** 300 ms elapse without further keystrokes
**THEN** the list shows only learnings matching "react" (case-insensitive)
**AND** only one API call was made (debounce prevented intermediate calls)

---

### AC-10 — Clearing search restores full list
**GIVEN** an active search query "react" is filtering the list
**WHEN** I tap the clear (✕) button on the `SearchBar`
**THEN** the keyword is cleared
**AND** the full unfiltered list is shown

---

### AC-11 — Search with no results shows empty state
**GIVEN** no learnings match "xyzzy99nonexistent"
**WHEN** I type "xyzzy99nonexistent" in the `SearchBar` and wait 300 ms
**THEN** the "No results" empty state is shown with a "Clear search" button
**AND** tapping "Clear search" resets the search and restores the full list

---

### AC-12 — SortPicker changes sort order
**GIVEN** My Learnings is showing learnings in "Newest first" order
**WHEN** I tap the sort trigger and select "Oldest first"
**THEN** the list is re-fetched with `sortBy=createdAt&sortDirection=ASC`
**AND** the sort trigger label updates to "Oldest first"

---

### AC-13 — SortPicker trigger label reflects current selection
**GIVEN** I selected "Recently updated" in the `SortPicker`
**WHEN** I view the My Learnings header
**THEN** the sort trigger button label reads "Recently updated"

---

### AC-14 — Tapping a learning card opens detail screen
**GIVEN** My Learnings is showing a list
**WHEN** I tap any `LearningCard`
**THEN** the `LearningDetail` screen opens showing that learning's full content and tags
**AND** back navigation returns me to My Learnings with the same scroll position preserved (native stack behaviour)

---

### AC-15 — No "POK" in UI
**GIVEN** I am on any locale (EN or PT-BR)
**WHEN** I view the My Learnings screen, SearchBar placeholder, SortPicker labels, empty states, and error messages
**THEN** the string "POK" does not appear anywhere in the user-facing UI

---

### AC-16 — Dark mode
**GIVEN** the device is in dark mode
**WHEN** I navigate to My Learnings
**THEN** the screen, `SearchBar`, and `SortPicker` trigger all use dark theme tokens (no hardcoded colours)

---

### AC-17 — PT-BR i18n
**GIVEN** the device locale is "pt-BR"
**WHEN** I navigate to My Learnings
**THEN** the tab label, screen title, SearchBar placeholder, SortPicker options, and empty state messages are all in Brazilian Portuguese

---

## Screens

### Screen: My Learnings

**Route:** Tab route `MyLearnings` in `AppTabsParamList`

**Layout (top to bottom):**
1. `SafeAreaView` — full-screen container, theme background colour
2. Screen title row — `Text` heading ("My Learnings"), right-aligned `SortPicker` trigger
3. `SearchBar` — full-width, below title row, above the list
4. `FlatList` — learning cards with `LearningCard`, pull-to-refresh, infinite scroll footer
5. Loading overlay — `ActivityIndicator` centred (only on initial load, not on pull-to-refresh)
6. Empty state — centred message + CTA (when list is empty after load)
7. Error state — `ErrorMessage` inline below the search bar (when error present)

**States:**
- `loading === true && !refreshing` → show `ActivityIndicator` only (no list, no empty state)
- `loading === false && poks.length === 0 && !error && !keyword` → show no-learnings empty state
- `loading === false && poks.length === 0 && !error && keyword` → show no-results empty state with "Clear search"
- `loading === false && error` → show `ErrorMessage`
- `loading === false && poks.length > 0` → show `FlatList`
- `refreshing === true` → `FlatList` pull-to-refresh indicator (list remains visible)
- `loadingMore === true` → `ListFooterComponent` `ActivityIndicator` appended below list

**i18n keys (new, under `learnings.myLearnings.*`):**

| Key | EN | PT-BR |
|-----|----|-------|
| `learnings.myLearnings.title` | My Learnings | Meus Aprendizados |
| `learnings.myLearnings.searchPlaceholder` | Search your learnings… | Pesquisar aprendizados… |
| `learnings.myLearnings.sortLabel` | Sort | Ordenar |
| `learnings.myLearnings.sortNewest` | Newest first | Mais recentes |
| `learnings.myLearnings.sortOldest` | Oldest first | Mais antigos |
| `learnings.myLearnings.sortUpdated` | Recently updated | Atualizados recentemente |
| `learnings.myLearnings.empty` | No learnings yet | Nenhum aprendizado ainda |
| `learnings.myLearnings.emptyHint` | Tap New Learning to save your first one. | Toque em Novo Aprendizado para salvar seu primeiro. |
| `learnings.myLearnings.noResults` | No learnings found | Nenhum aprendizado encontrado |
| `learnings.myLearnings.noResultsHint` | Try different search terms. | Tente outros termos de busca. |
| `learnings.myLearnings.clearSearch` | Clear search | Limpar busca |
| `learnings.myLearnings.loadError` | Failed to load learnings | Falha ao carregar aprendizados |
| `learnings.myLearnings.cancel` | Cancel | Cancelar |

Note: the existing `learnings.feed.title` key ("My Learnings") was added before the social feed existed and its value is now stale — the social feed tab is titled "Feed" (via `learnings.socialFeed.title`). The new `learnings.myLearnings.title` key is the canonical label for this screen going forward.

**Accessibility:**
- Screen title `Text` has `accessibilityRole="header"`
- `SearchBar` `TextInput` has `accessibilityLabel={t('learnings.myLearnings.searchPlaceholder')}`
- `SortPicker` trigger button has `accessibilityLabel={\`${t('learnings.myLearnings.sortLabel')}: ${currentSortOption.label}\`}`
- Each `LearningCard` has `accessibilityLabel` derived from title or content preview (handled inside `LearningCard`)
- Empty state container has `accessibilityRole="text"`

---

## Implementation Approach

### Architecture

```
AppTabs (BottomTabs)
├── Feed (tab 1)             — existing FeedScreen (social, useSocialFeedData)
├── MyLearnings (tab 2) ←── NEW
│   └── MyLearningsScreen   — useFeedData + SearchBar + SortPicker + LearningList
├── NewLearning (tab 3)      — existing LearningNewScreen
└── Profile (tab 4)          — existing ProfileScreen

AppStack (NativeStack — wrapping AppTabs)
├── AppTabs
└── LearningDetail           — existing; reachable from MyLearningsScreen (no change needed)
```

**`MyLearningsScreen` state flow:**

```
Mount
  └── useFeedData({ sortBy: 'createdAt', sortDirection: 'DESC' }) → initial fetch

User types in SearchBar
  └── setKeyword(text)
      └── useDebounce(keyword, 300) → debouncedKeyword
          └── useEffect([debouncedKeyword]) → setParams({ keyword: debouncedKeyword })
              └── useFeedData triggers refetch (page 0)

User taps SortPicker option
  └── setParams({ sortBy, sortDirection })
      └── useFeedData triggers refetch (page 0)

User scrolls to bottom
  └── onEndReached → loadMore()
      └── useFeedData appends next page to poks[]

User pulls down
  └── onRefresh → refresh()
      └── useFeedData resets to page 0, refreshes list
```

**Component responsibilities (single responsibility principle):**

- `MyLearningsScreen` — composes `useFeedData`, `useDebounce`, `SearchBar`, `SortPicker`, `FlatList`. Owns all screen-level state (keyword, selectedSort). Passes callbacks down. Does not render card UI itself.
- `SearchBar` — pure UI. No knowledge of search state or hooks. Accepts `value` + `onChangeText` + `onClear`.
- `SortPicker` — pure UI. No knowledge of list state. Accepts `value` + `options` + `onChange`. Owns the platform-specific ActionSheet/Alert invocation.
- `LearningCard` — existing. No changes.

### Test Strategy

- [ ] TDD for `SearchBar` component tests (node/components jest project)
- [ ] TDD for `SortPicker` component tests (node/components jest project)
- [ ] `MyLearningsScreen` render tests: loading, error, empty (no learnings), empty (no results), populated list — mock `useFeedData` return values
- [ ] `useFeedData` is already tested; no new hook tests required unless new behaviour is added
- [ ] Manual testing: keyboard appearance/dismissal, ActionSheet on iOS, Alert fallback on Android, dark/light mode, PT-BR locale

### File Changes

**New:**
```
mobile/src/screens/app/MyLearningsScreen.tsx   — main screen component
mobile/src/components/ui/SearchBar.tsx         — reusable search input (debounce-free; debounce in caller)
mobile/src/components/ui/SortPicker.tsx        — reusable sort trigger (ActionSheetIOS / Alert)
mobile/src/components/ui/__tests__/SearchBar.test.tsx
mobile/src/components/ui/__tests__/SortPicker.test.tsx
mobile/src/screens/app/__tests__/MyLearningsScreen.test.tsx
```

**Modified:**
```
mobile/src/navigation/AppTabs.tsx
  — Add 'MyLearnings' to AppTabsParamList
  — Lazy-import MyLearningsScreen
  — Add Tab.Screen for 'MyLearnings' (position 2, between Feed and NewLearning)

mobile/src/i18n/locales/en.ts
  — Add learnings.myLearnings.* keys (see i18n table above)

mobile/src/i18n/locales/pt-BR.ts
  — Add learnings.myLearnings.* keys (PT-BR translations)
```

**No changes required:**
```
mobile/src/hooks/useFeedData.ts          — already complete, no modification needed
mobile/src/hooks/useDebounce.ts          — already complete, no modification needed
mobile/src/navigation/AppStack.tsx       — LearningDetail route already exists
mobile/src/screens/app/FeedScreen.tsx    — social feed; no changes
mobile/src/components/feed/LearningCard.tsx — reused as-is
```

---

## Dependencies

**Blocked by:** None. All prerequisites are already implemented:
- `useFeedData` — complete
- `useDebounce` — complete
- `LearningCard` — complete
- `LearningDetail` stack route — complete
- `AppTabs` + `AppStack` navigation infrastructure — complete

**Blocks:**
- `mobile-tag-management.md` — the `tagId` param on `useFeedData` and `SortPicker`-adjacent filter UI for tags will slot in alongside this screen. This spec leaves the `tagId` wiring for that milestone.

**External:** None — no new npm packages. `ActionSheetIOS` and `Alert` are built into React Native.

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits

### Architectural Decisions

### Deviations from Spec

### Lessons Learned
