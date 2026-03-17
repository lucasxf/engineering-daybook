# Mobile Sort Options

> **Status:** Approved
> **Created:** 2026-03-17
> **Reviewed:** 2026-03-17
> **Implemented:** _pending_

---

## Context

Without a sort control, users with growing learning collections have no way to surface older entries or find recently updated ones — they must scroll through everything in creation order. The "My Learnings" tab in `FeedScreen` currently displays learnings sorted by `createdAt DESC` (newest first) with no way to change it. The web app has had a `SortDropdown` component since Milestone 2.3, offering three sort options. This is a gap in the parity table.

The hook (`useFeedData`) already accepts `sortBy` / `sortDirection` via `PokSearchParams` and the `setParams()` method resets to page 0 and re-fetches — the API layer is fully ready. This spec only adds the UI control.

**Related:**
- Parity table: `mobile/store-assets/web-mobile-feature-parity.md` — "Sort options" row
- Web reference: `web/src/components/poks/SortDropdown.tsx`
- Wave 7 (Polish) in `mobile/store-assets/mobile-parity-execution-plan.md`

---

## Requirements

### Functional

- [ ] FR1 (Must Have): A `SortPicker` component renders the current sort label and a chevron icon as a tappable button.
- [ ] FR2 (Must Have): Tapping the `SortPicker` opens a bottom sheet modal with three sort options: "Newest first" (`createdAt DESC`), "Oldest first" (`createdAt ASC`), "Recently updated" (`updatedAt DESC`).
- [ ] FR3 (Must Have): Selecting an option closes the modal, updates the active sort label, and calls `useFeedData.setParams()` to reload the feed from page 0.
- [ ] FR4 (Must Have): "Newest first" is the default sort and is pre-selected on first render.
- [ ] FR5 (Must Have): The currently active sort option is visually highlighted in the picker (e.g. primary colour or bold label).
- [ ] FR6 (Must Have): The modal can be dismissed without changing selection by tapping the backdrop.
- [ ] FR7 (Must Have): All labels use i18n keys; EN and PT-BR locales are both provided.
- [ ] FR8 (Must Have): `SortPicker` is rendered in `MyLearningsContent` on `FeedScreen`, positioned to the right of the search bar (or below it on narrow screens).
- [ ] FR9 (Should Have): Changing the sort option preserves any active keyword filter; both params are sent together on the next request (page reset to 0).

**Scope:** `mobile`

### Non-Functional

- [ ] NFR1: No new third-party libraries — use React Native's built-in `Modal` component.
- [ ] NFR2: The picker must use Library at Dusk design tokens (`theme.colors.*`, `theme.spacing.*`, `theme.radii.*`, `theme.typography.*`) — no hardcoded colours or sizes.
- [ ] NFR3: All touchable elements must have `accessibilityRole` and `accessibilityLabel`.
- [ ] NFR4: Unit tests cover the `SortPicker` component (option selection, modal open/close, active highlight) in the `components` jest project.
- [ ] NFR5: The sort state must reset to default (`createdAt DESC`) when the user navigates away from the My Learnings tab and returns. Implement via `useFocusEffect(useCallback(() => { setSortOption(DEFAULT_SORT); }, []))` in `MyLearningsContent` — this fires on every tab focus event regardless of whether the component unmounts.

---

## Technical Constraints

**Stack:** Mobile

**Technologies:** Expo SDK 53, React Native 0.79, TypeScript 5 (strict), React Native `Modal`, Library at Dusk tokens (`theme/tokens.ts`)

**Integration Points:**
- `mobile/src/hooks/useFeedData.ts` — `setParams({ sortBy, sortDirection })` already exists; `PokSearchParams.sortBy` is `'createdAt' | 'updatedAt'`
- `mobile/src/screens/app/FeedScreen.tsx` — `MyLearningsContent` component is the target
- `mobile/src/i18n/locales/en.ts` and `pt-BR.ts` — add keys under `learnings.feed.sort.*`

**Out of Scope:**
- Sorting the social (following) feed — not supported by the backend's feed endpoint
- Sort direction toggle outside of the three pre-set options
- Persisting sort preference across sessions (deferred)
- Sort options on the web (already implemented)

---

## Acceptance Criteria

### AC1: Default sort — Newest first
**GIVEN** the user is on the My Learnings tab
**WHEN** the screen first renders
**THEN** the `SortPicker` button displays "Newest first" and the feed is ordered `createdAt DESC`

### AC2: Opening the picker
**GIVEN** the `SortPicker` button is visible
**WHEN** the user taps it
**THEN** a bottom sheet modal appears with three options: "Newest first", "Oldest first", "Recently updated", and the current option is visually highlighted

### AC3: Changing sort to Oldest first
**GIVEN** the sort picker modal is open
**WHEN** the user taps "Oldest first"
**THEN** the modal closes, the button label updates to "Oldest first", and the feed reloads with `sortBy=createdAt&sortDirection=ASC`

### AC4: Changing sort to Recently updated
**GIVEN** the sort picker modal is open
**WHEN** the user taps "Recently updated"
**THEN** the modal closes, the button label updates to "Recently updated", and the feed reloads with `sortBy=updatedAt&sortDirection=DESC`

### AC5: Backdrop dismiss
**GIVEN** the sort picker modal is open
**WHEN** the user taps the backdrop outside the sheet
**THEN** the modal closes without changing the active sort

### AC6: Search + sort composition
**GIVEN** the user has typed a keyword in the search bar
**WHEN** the user changes the sort option
**THEN** both the keyword and the new sort params are sent together in the API request (page reset to 0)

### AC7: PT-BR locale
**GIVEN** the app locale is PT-BR
**WHEN** the sort picker is displayed
**THEN** all labels are in Portuguese: "Mais recentes", "Mais antigos", "Atualizados recentemente"

---

## Screens

### Screen: FeedScreen — My Learnings tab (modified)

**Purpose:** User views, searches, and now sorts their personal learning feed.

**Route:** Native screen — `AppTabs > Feed > MyLearnings` tab

**Layout:**
1. Search + Sort row — `TextInput` (search, flex: 1) + `SortPicker` button (fixed width, right-aligned)
2. Feed list — `FlatList` with pull-to-refresh and infinite scroll (unchanged)

**Components:**
- `MyLearningsContent` → `TextInput` (search), `SortPicker`, `FlatList` → `LearningCard`

**States:**
- Loading: spinner centered, sort picker visible but inert
- Populated: feed cards + sort button showing active option
- Empty (no results): "No learnings yet" message (unchanged)
- Empty (filtered): no special state; existing empty message

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `learnings.feed.sortLabel` | Sort | Ordenar |
| `learnings.feed.sort.newestFirst` | Newest first | Mais recentes |
| `learnings.feed.sort.oldestFirst` | Oldest first | Mais antigos |
| `learnings.feed.sort.recentlyUpdated` | Recently updated | Atualizados recentemente |

**Interactions:**
- Tapping `SortPicker` button → opens bottom sheet modal
- Tapping an option in the modal → select + close modal + reload feed
- Tapping backdrop → close modal, no change

**Accessibility:**
- `SortPicker` button: `accessibilityRole="button"`, `accessibilityLabel={t('learnings.feed.sortLabel') + ': ' + currentLabel}`
- Each option row: `accessibilityRole="radio"`, `accessibilityState={{ checked: isActive }}`
- Modal backdrop: `accessibilityRole="none"` with `onAccessibilityEscape` to close

---

### Screen: SortPicker (new component)

**Purpose:** Cross-platform bottom sheet for selecting a sort option from a fixed list.

**Route:** N/A — modal overlay rendered within `FeedScreen`

**Layout:**
1. Backdrop — full-screen `Pressable` (semi-transparent) that closes on tap
2. Sheet — bottom-anchored `View` with rounded top corners, white/dark surface background
3. Sheet title — "Sort" label in `body` variant
4. Option rows — one per sort option; label in `bodySm`, active option has primary colour text + checkmark

**Components:**
- `SortPicker` → `Modal` → backdrop `Pressable`, sheet `View` → option rows

**States:**
- Closed: component renders nothing visible (Modal `visible={false}`)
- Open: backdrop + sheet with 3 options

**i18n:** See FeedScreen table above.

**Interactions:**
- Backdrop tap → component sets `modalVisible = false` internally (no prop needed)
- Option row tap → calls `onSelect(sortOption)` on the parent, then sets `modalVisible = false` internally

**Accessibility:**
- Focus trap: first option receives focus when modal opens (RN Modal handles this via `visible` prop)

---

## Implementation Approach

### Architecture

Three-file change set with co-located tests:

1. **`SortPicker.tsx`** — new presentational component. Accepts `value: SortOption`, `options: SortOptionConfig[]`, `onSelect: (v: SortOption) => void`. Internally manages `modalVisible` state — **no `onClose` prop**; the component opens and closes itself. Uses RN `Modal` (transparent, animationType "slide"). Bottom sheet anchored via `justifyContent: 'flex-end'` on the Modal's inner wrapper.

2. **`FeedScreen.tsx`** — `MyLearningsContent` gains a `sortOption` state (default `createdAt DESC`), a `useEffect` that calls `setParams({ sortBy, sortDirection })` when it changes, and renders `SortPicker` to the right of the search `TextInput`. To fulfil NFR5, reset `sortOption` to default using `useFocusEffect(useCallback(() => { setSortOption(DEFAULT_SORT); }, []))` so the state is reset each time the tab comes into focus.

3. **i18n** — 5 new keys added to both `en.ts` and `pt-BR.ts` under `learnings.feed.sort.*` (and one key at `learnings.feed.sortLabel`).

### Types

Both types are defined and exported from `mobile/src/components/feed/SortPicker.tsx`:

```typescript
/** The sort parameters sent to the API — mirrors PokSearchParams sortBy/sortDirection fields. */
export type SortOption = {
  sortBy: 'createdAt' | 'updatedAt';
  sortDirection: 'ASC' | 'DESC';
};

/** One displayable option in the picker — bundles a SortOption value with its i18n key. */
export type SortOptionConfig = {
  key: string;       // unique key for React list, e.g. 'createdAt-DESC'
  value: SortOption;
  labelKey: string;  // i18n key, e.g. 'learnings.feed.sort.newestFirst'
};
```

The three hard-coded configs are defined as a module-level constant in `SortPicker.tsx` and also exported so `FeedScreen.tsx` can pass them as the `options` prop without duplicating the data:

```typescript
export const SORT_OPTIONS: SortOptionConfig[] = [
  { key: 'createdAt-DESC', value: { sortBy: 'createdAt', sortDirection: 'DESC' }, labelKey: 'learnings.feed.sort.newestFirst' },
  { key: 'createdAt-ASC',  value: { sortBy: 'createdAt', sortDirection: 'ASC'  }, labelKey: 'learnings.feed.sort.oldestFirst' },
  { key: 'updatedAt-DESC', value: { sortBy: 'updatedAt', sortDirection: 'DESC' }, labelKey: 'learnings.feed.sort.recentlyUpdated' },
];

export const DEFAULT_SORT: SortOption = SORT_OPTIONS[0].value;
```

### Test Strategy

- [ ] Partial TDD — unit tests written alongside `SortPicker.tsx` in `src/components/feed/__tests__/SortPicker.test.tsx` (components jest project, node env)
- Tests cover: renders trigger button with current label; tapping button sets `modalVisible=true` (assert via `Modal` `visible` prop); tapping option calls `onSelect` with correct `SortOption` value and sets `modalVisible=false`; active option has primary colour text; backdrop tap sets `modalVisible=false` without calling `onSelect`
- `Modal` is testable in node env via the `components` jest project's `moduleNameMapper` which stubs native modules; assert `visible` prop directly on the rendered `Modal` element using `findAllByType`

### File Changes

**New:**
- `mobile/src/components/feed/SortPicker.tsx` — sort picker component; exports `SortOption`, `SortOptionConfig`, `SortPicker`, `SORT_OPTIONS`, `DEFAULT_SORT`
- `mobile/src/components/feed/__tests__/SortPicker.test.tsx` — unit tests

**Modified:**
- `mobile/src/screens/app/FeedScreen.tsx` — add `SortPicker` to `MyLearningsContent`
- `mobile/src/i18n/locales/en.ts` — add `learnings.feed.sortLabel` + `learnings.feed.sort.*`
- `mobile/src/i18n/locales/pt-BR.ts` — same keys in Portuguese

---

## Implementation Plan

### Task 1: SortPicker component + unit tests
- **Files:**
  - `mobile/src/components/feed/SortPicker.tsx`
  - `mobile/src/components/feed/__tests__/SortPicker.test.tsx`
- **Depends on:** _none_
- **Commit:** `feat(mobile): add SortPicker component for My Learnings sort control`
- **Stack:** mobile

### Task 2: i18n keys (EN + PT-BR)
- **Files:**
  - `mobile/src/i18n/locales/en.ts`
  - `mobile/src/i18n/locales/pt-BR.ts`
- **Depends on:** _none_
- **Commit:** `feat(mobile): add i18n keys for sort options`
- **Stack:** mobile

### Task 3: Wire SortPicker into FeedScreen My Learnings tab
- **Files:**
  - `mobile/src/screens/app/FeedScreen.tsx`
- **Depends on:** Task 1, Task 2
- **Commit:** `feat(mobile): wire SortPicker into My Learnings feed tab`
- **Stack:** mobile

---

## Dependencies

**Blocked by:** None — `useFeedData.setParams()` is already implemented.

**Blocks:** Wave 7 completion in the mobile parity execution plan.

**External:** None.

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits

### Architectural Decisions

### Deviations from Spec

### Lessons Learned
