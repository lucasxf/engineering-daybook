# Mobile 4-Tier Visibility

> **Status:** Implemented
> **Created:** 2026-03-09
> **Reviewed:** 2026-03-17
> **Implemented:** 2026-03-17

---

## Context

The mobile app was built against the original 2-tier visibility model (`PRIVATE` / `PUBLIC`, Milestone 5.1). Since then, the backend and web app have been extended to a 4-tier model (`PRIVATE`, `FOLLOWERS_ONLY`, `COLLEAGUES_ONLY`, `PUBLIC`) in Milestone 6.1. Mobile has been partially updated — `pokApi.ts` already defines the correct 4-tier `PokVisibility` type — but there are three gaps:

1. **Type conflict:** `mobile/src/lib/auth.ts` independently defines `PokVisibility = 'PRIVATE' | 'PUBLIC'` (lines 8–9). This 2-tier shadow type is what `ProfileScreen` imports, meaning the settings visibility selectors can only ever persist `PRIVATE` or `PUBLIC` to the API.

2. **Picker UI is 2-option only:** `LearningNewScreen` and `LearningDetailScreen` each inline a hardcoded two-button row. No `FOLLOWERS_ONLY` or `COLLEAGUES_ONLY` option is offered to the user, so learnings created on mobile can never be set to those tiers. Users who set a `FOLLOWERS_ONLY` default on web will still see the picker default to `PRIVATE` on mobile (because the picker doesn't hold the full 4-tier value set).

3. **Visibility badge is 2-tier only:** The detail view's badge shows `🔒 Private` or `🌐 Public` with no branch for the intermediate tiers. The `FOLLOWERS_ONLY` and `COLLEAGUES_ONLY` tiers are only meaningful when the learner has follow/colleague relationships. This spec therefore depends on `mobile-social-discovery.md` — the follow relationship data that backs those tiers must be present before exposing the options makes sense. The dependency is soft from a backend perspective (the API already supports all 4 tiers) but firm from a UX perspective (showing "Followers only" to a user with zero followers is misleading).

**Related:**

- `docs/specs/features/pok-visibility-controls.md` — original 2-tier spec; defines the irreversible-public rule and backend access-control model
- `docs/specs/features/learner-profile-privacy.md` — `defaultPokVisibility` and `profileVisibility` settings; defines `PATCH /api/v1/users/me/settings`
- `docs/specs/features/mobile-social-discovery.md` — follow/colleague relationships needed for `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` tiers to be meaningful (blocks this spec)
- `web/src/components/poks/VisibilityPicker.tsx` — web reference implementation (2-tier; the mobile component designed here extends it to 4 tiers)
- `mobile/src/lib/pokApi.ts` — canonical 4-tier `PokVisibility` type (source of truth)
- `mobile/src/lib/auth.ts` — duplicate 2-tier type to remove

---

## Requirements

### Functional

**Scope:** Mobile only (no backend or web changes)

- [ ] **FR1** `[Must Have]` The duplicate `PokVisibility` type declaration in `mobile/src/lib/auth.ts` is removed. All consumers that currently import `PokVisibility` from `auth.ts` are updated to import it from `pokApi.ts` instead. No runtime behaviour changes.

- [ ] **FR2** `[Must Have]` A new shared `VisibilityPicker` component (`mobile/src/components/ui/VisibilityPicker.tsx`) renders a vertical list of 4 tappable option rows: `PRIVATE`, `COLLEAGUES_ONLY`, `FOLLOWERS_ONLY`, `PUBLIC` (ordered from most to least restrictive — colleagues = mutual follows = smaller set than followers). Each row shows an icon, a short label, and a one-line description. The currently selected option is visually highlighted.

- [ ] **FR3** `[Must Have]` `LearningNewScreen` replaces the inline 2-button row with the shared `VisibilityPicker`. The initial value is read from `user.defaultPokVisibility` (via `useAuth`). If `defaultPokVisibility` is absent or unrecognised it falls back to `'PRIVATE'`.

- [ ] **FR4** `[Must Have]` `LearningDetailScreen` replaces the inline 2-button row with the shared `VisibilityPicker` in the edit view. The irreversible-public rule is enforced:
  - When the learning's current visibility is `PUBLIC`, the picker is hidden and a locked badge is shown instead (no downgrade possible).
  - For all other current visibilities (`PRIVATE`, `FOLLOWERS_ONLY`, `COLLEAGUES_ONLY`) the picker is shown with only the tiers that are equal or higher in openness than the current value available as selectable options. Options that would be a downgrade are rendered but visually disabled and are not tappable.

- [ ] **FR5** `[Must Have]` `LearningDetailScreen` (read view) replaces the 2-tier badge with a 4-tier `VisibilityBadge` subcomponent that maps each value to an icon and translated label:
  - `PRIVATE` → 🔒 and label
  - `FOLLOWERS_ONLY` → 👥 and label
  - `COLLEAGUES_ONLY` → 🤝 and label
  - `PUBLIC` → 🌐 and label

- [ ] **FR6** `[Must Have]` `ProfileScreen` replaces the 2-option `defaultPokVisibility` selector (which currently maps through the `privacyOptions` array typed as `ProfileVisibility`) with the shared `VisibilityPicker` showing all 4 tiers. The `profileVisibility` selector remains 2-option  (`PRIVATE` / `PUBLIC`) — it is a separate control using a separate type.

- [ ] **FR7** `[Must Have]` When the user selects `PUBLIC` in a **new learning or edit learning** picker context, a warning message is shown immediately below the picker: "Once public, this cannot be made private again." The warning text comes from the existing i18n key `learnings.visibility.publicWarning`. This warning does **not** appear on `ProfileScreen` — the default visibility preference is always reversible, so the irreversibility rule does not apply there.

- [ ] **FR8** `[Should Have]` The `VisibilityPicker` accepts a `disabledValues` prop (`PokVisibility[]`) that renders specific options as visually faded and non-tappable. This is used by `LearningDetailScreen` to enforce the irreversibility constraint (see FR4).

- [ ] **FR9** `[Should Have]` New i18n keys are added for `followersOnly` and `colleaguesOnly` in both `en.ts` and `pt-BR.ts` under the existing `learnings.visibility.*` namespace, plus short descriptions for each tier used in the picker rows.

- [ ] **FR10** `[Could Have]` `LearningCard` (in the feed) shows the visibility badge icon next to each learning. This brings parity with the web `VisibilityBadge` shown on `PokCard`.

#### Explicitly Out of Scope

- Backend changes — all 4 tiers are already supported
- Web changes — the web `VisibilityPicker` is intentionally left as a 2-tier control until the web settings page and QuickEntry are updated in a separate feature pass
- `profileVisibility` 4-tier expansion — `User.ProfileVisibility` has a separate enum that is independently scoped; not covered here
- Gating `FOLLOWERS_ONLY`/`COLLEAGUES_ONLY` behind a "you have no followers" guard — deferred; the backend enforces access, not the picker
- Maestro E2E flows for the new tiers — deferred; the existing visibility E2E covers the 2-tier happy path; new flows would require a live multi-user setup

### Non-Functional

1. **Type safety:** After FR1, `tsc --noEmit` must pass with no new errors. No `any` escape hatches.
2. **No duplicate type declarations:** `PokVisibility` must be declared in exactly one place in the mobile codebase (`pokApi.ts`). The same rule applies to `ProfileVisibility` in `auth.ts` (that type is correctly scoped and must remain there — it covers `User.ProfileVisibility`).
3. **i18n:** All 4 tier labels and their descriptions are translated in both EN and PT-BR. Raw enum values (`PRIVATE`, `FOLLOWERS_ONLY`, etc.) must never be displayed directly to users.
4. **Accessibility:** `VisibilityPicker` rows use `accessibilityRole="button"` and `accessibilityState={{ selected: ... }}`. Disabled rows use `accessibilityState={{ disabled: true }}`.
5. **Test coverage:** The `VisibilityPicker` component and `VisibilityBadge` subcomponent have unit tests in the `components` jest project (node env, stubbed native modules).

---

## Technical Constraints

**Stack:** Mobile only

**Technologies:**

- Expo SDK 53, React Native 0.79+, TypeScript strict mode
- i18n-js 4 (`useI18n` / `t()`)
- jest 29 — `components` project for component tests, `lib` project for pure logic

**Key files:**

| File | Change |
|------|--------|
| `mobile/src/lib/auth.ts` | Remove lines 8–9 (`export type PokVisibility`) |
| `mobile/src/lib/pokApi.ts` | Canonical `PokVisibility` — no change needed |
| `mobile/src/components/ui/VisibilityPicker.tsx` | New shared component |
| `mobile/src/screens/app/LearningNewScreen.tsx` | Replace inline picker |
| `mobile/src/screens/app/LearningDetailScreen.tsx` | Replace inline picker + upgrade badge |
| `mobile/src/screens/app/ProfileScreen.tsx` | Replace defaultPokVisibility selector |
| `mobile/src/i18n/locales/en.ts` | Add `followersOnly`, `colleaguesOnly` + descriptions |
| `mobile/src/i18n/locales/pt-BR.ts` | Same keys in PT-BR |

**Type reconciliation — the conflict in detail:**

```typescript
// BEFORE — auth.ts line 8 (2-tier, conflicts with pokApi.ts):
export type PokVisibility = 'PRIVATE' | 'PUBLIC';

// AFTER — removed from auth.ts entirely.
// All callers switch to:
import type { PokVisibility } from '@/lib/pokApi';
// pokApi.ts already declares:
export type PokVisibility = 'PRIVATE' | 'COLLEAGUES_ONLY' | 'FOLLOWERS_ONLY' | 'PUBLIC';
```

`ProfileVisibility` stays in `auth.ts` — it is a distinct type (`'PRIVATE' | 'PUBLIC'` only) that
mirrors `User.ProfileVisibility` on the backend, which has not been extended to 4 tiers.

**`VisibilityPicker` component contract:**

```typescript
// mobile/src/components/ui/VisibilityPicker.tsx

import type { PokVisibility } from '@/lib/pokApi';

interface VisibilityPickerProps {
  /** Currently selected visibility value. */
  value: PokVisibility;
  /** Called when the user taps a non-disabled option row. */
  onChange: (value: PokVisibility) => void;
  /**
   * Values to render as faded and non-tappable.
   * Used by LearningDetailScreen to enforce irreversibility.
   */
  disabledValues?: PokVisibility[];
}
```

Rendering contract:
- 4 rows in order: `PRIVATE`, `COLLEAGUES_ONLY`, `FOLLOWERS_ONLY`, `PUBLIC`
- Each row: icon (emoji or vector) + translated label + translated description
- Selected row: highlighted border + background (`theme.colors.primary` / `theme.colors.surfaceAlt`)
- Disabled row: `opacity: 0.4`, `accessibilityState={{ disabled: true }}`, no `onPress`

**`VisibilityBadge` subcomponent:**

A small inline component (can live in the same file as `VisibilityPicker`) that renders a single
row of icon + label for a given `PokVisibility` value. Used by `LearningDetailScreen` read view
and optionally by `LearningCard`.

```typescript
interface VisibilityBadgeProps {
  visibility: PokVisibility;
}

// Icon map:
// PRIVATE       → 🔒
// FOLLOWERS_ONLY → 👥
// COLLEAGUES_ONLY → 🤝
// PUBLIC        → 🌐
```

**`ProfileScreen` change — `defaultPokVisibility` selector:**

The current `defaultPokVisibility` selector reuses `privacyOptions` (a 2-item array typed as
`ProfileVisibility`). After this change, the `defaultPokVisibility` block uses `VisibilityPicker`
instead of a `Button` row, while the `profileVisibility` block keeps the existing `Button` row
(2-option only, because `ProfileVisibility` remains 2-tier).

```tsx
// BEFORE — ProfileScreen.tsx (simplified)
{privacyOptions.map((opt) => (
  <Button
    key={opt.value}
    label={opt.label}
    variant={defaultPokVisibility === opt.value ? 'primary' : 'secondary'}
    onPress={() => handleDefaultPokVisibilityChange(opt.value)}
    style={{ flex: 1 }}
  />
))}

// AFTER
<VisibilityPicker
  value={defaultPokVisibility}
  onChange={handleDefaultPokVisibilityChange}
/>
```

---

## Screens

### Component: VisibilityPicker

**Purpose:** Shared 4-tier picker used in LearningNewScreen, LearningDetailScreen (edit), and ProfileScreen (default visibility).

**Layout:** Vertical list of 4 tappable rows in order: PRIVATE, COLLEAGUES_ONLY, FOLLOWERS_ONLY, PUBLIC. Each row: `[icon] [label]\n[description]`. Selected row has highlighted border + background. Disabled rows are faded (`opacity: 0.4`).

**Components:** `TouchableOpacity` per row, `Text` (label + description), `VisibilityBadge` (icon).

**States:**
- Default: all 4 rows enabled, one highlighted as selected
- With `disabledValues`: specified rows faded and non-tappable
- `PUBLIC` selected: warning text rendered below picker (in new/edit contexts only)

**i18n:** `learnings.visibility.{private,followersOnly,colleaguesOnly,public}` + `{…}Desc` keys.

**Interactions:**
- Tap enabled row → `onChange(value)` called
- Tap disabled row → no-op (no `onPress`)

**Accessibility:** `accessibilityRole="button"`, `accessibilityState={{ selected, disabled }}` per row.

---

### Screen: LearningNewScreen

**Purpose:** Capture a new learning. The visibility picker determines the visibility of the learning being saved.

**Layout:** Existing form; the inline 2-button row is replaced with `<VisibilityPicker>`. Public warning renders between picker and submit button when `PUBLIC` is selected.

**Components:** `VisibilityPicker` (full 4-tier, no `disabledValues`).

**States:**
- Default: picker pre-selected to `user.defaultPokVisibility ?? 'PRIVATE'`
- `PUBLIC` selected: warning banner visible beneath picker

**i18n:** `learnings.visibility.publicWarning`.

**Interactions:** Tap option → updates local `visibility` state → included in create API call on save.

**Accessibility:** Inherits from `VisibilityPicker`.

---

### Screen: LearningDetailScreen (edit view)

**Purpose:** Edit an existing learning's visibility. Enforces irreversibility rule.

**Layout:** Existing edit form; inline 2-button row replaced with conditional rendering:
- `pok.visibility === 'PUBLIC'` → picker hidden, locked badge shown (`learnings.visibility.lockedPublic`)
- All other visibilities → `<VisibilityPicker disabledValues={getDisabledValues(pok.visibility)} />`

**Components:** `VisibilityPicker`, `VisibilityBadge` (locked state).

**States:**
- Current visibility `PRIVATE`: all 4 options enabled
- Current visibility `COLLEAGUES_ONLY`: `PRIVATE` disabled
- Current visibility `FOLLOWERS_ONLY`: `PRIVATE`, `COLLEAGUES_ONLY` disabled
- Current visibility `PUBLIC`: picker hidden; locked badge shown

**i18n:** `learnings.visibility.lockedPublic`, `learnings.visibility.publicWarning`.

**Interactions:** Tap enabled option → updates draft visibility → saved on form submit.

**Accessibility:** Inherits from `VisibilityPicker`; locked badge has `accessibilityRole="text"`.

---

### Screen: LearningDetailScreen (read view)

**Purpose:** Display the visibility of a learning in read mode.

**Layout:** Replaces the 2-branch ternary badge with `<VisibilityBadge visibility={pok.visibility} />`.

**Components:** `VisibilityBadge` (icon + translated label).

**States:** Single render state — badge always shown for the 4-tier value.

**i18n:** `learnings.visibility.{private,followersOnly,colleaguesOnly,public}`.

**Interactions:** None (display only).

**Accessibility:** `accessibilityRole="text"`.

---

### Screen: ProfileScreen (default visibility section)

**Purpose:** Set the user's default learning visibility preference. Preference is always reversible — no irreversibility warning is shown here.

**Layout:** The `defaultPokVisibility` button row (currently 2-option) is replaced with `<VisibilityPicker>`. The `profileVisibility` 2-option button row is unchanged.

**Components:** `VisibilityPicker` (no `disabledValues`; no public warning).

**States:**
- Default: picker pre-selected to `user.defaultPokVisibility ?? 'PRIVATE'`

**i18n:** Picker labels and descriptions only; no `publicWarning`.

**Interactions:** Tap option → optimistic update → `PATCH /api/v1/users/me/settings` with `{ "defaultPokVisibility": value }`.

**Accessibility:** Inherits from `VisibilityPicker`.

---

## i18n Keys

### New keys in `learnings.visibility.*`

| Key | EN | PT-BR |
|-----|----|-------|
| `followersOnly` | `Followers only` | `Apenas seguidores` |
| `followersOnlyDesc` | `Visible to people who follow you` | `Visível para quem te segue` |
| `colleaguesOnly` | `Colleagues only` | `Apenas colegas` |
| `colleaguesOnlyDesc` | `Visible to mutual followers` | `Visível para seguidores mútuos` |
| `privateDesc` | `Only you can see this` | `Apenas você pode ver` |
| `publicDesc` | `Anyone on learnimo can see this` | `Qualquer pessoa no learnimo pode ver` |
| `lockedPublic` | `This learning is public and cannot be made private` | `Este aprendizado é público e não pode ser tornado privado` |

Existing keys that remain unchanged: `private`, `public`, `pickerLabel`, `publicWarning`.

---

## Acceptance Criteria

### AC1: Type conflict removed — no compile errors
**GIVEN** `PokVisibility` is declared only in `pokApi.ts`
**WHEN** `tsc --noEmit` runs across the mobile codebase
**THEN** the compiler reports zero errors related to duplicate or incompatible `PokVisibility` types

### AC2: `ProfileScreen` imports from `pokApi.ts`
**GIVEN** the `PokVisibility` removal from `auth.ts`
**WHEN** `ProfileScreen.tsx` is opened
**THEN** its `PokVisibility` import references `@/lib/pokApi`, not `@/lib/auth`

### AC3: New learning defaults to user's `defaultPokVisibility`
**GIVEN** my `defaultPokVisibility` is `FOLLOWERS_ONLY` (set from web or backend)
**WHEN** I open the "Save Learning" screen on mobile
**THEN** the `VisibilityPicker` shows `FOLLOWERS_ONLY` pre-selected

### AC4: New learning can be created with `FOLLOWERS_ONLY`
**GIVEN** I am on the "Save Learning" screen
**WHEN** I select `FOLLOWERS_ONLY` and save
**THEN** the API receives `{ ..., visibility: "FOLLOWERS_ONLY" }` and the learning is created

### AC5: New learning can be created with `COLLEAGUES_ONLY`
**GIVEN** I am on the "Save Learning" screen
**WHEN** I select `COLLEAGUES_ONLY` and save
**THEN** the API receives `{ ..., visibility: "COLLEAGUES_ONLY" }` and the learning is created

### AC6: Public warning shown when `PUBLIC` selected in new learning
**GIVEN** I am on the "Save Learning" screen
**WHEN** I select `PUBLIC`
**THEN** the warning "Once public, this cannot be made private again." is visible beneath the picker

### AC7: Edit learning — all 4 options shown when current visibility is `PRIVATE`
**GIVEN** I have a `PRIVATE` learning and enter edit mode
**WHEN** the visibility picker is shown
**THEN** all 4 tier options are selectable

### AC8: Edit learning — `PRIVATE` disabled when current is `COLLEAGUES_ONLY`
**GIVEN** I have a `COLLEAGUES_ONLY` learning and enter edit mode
**WHEN** the visibility picker is shown
**THEN** the `PRIVATE` option is rendered as disabled and non-tappable
**AND** `COLLEAGUES_ONLY`, `FOLLOWERS_ONLY`, and `PUBLIC` options are selectable

### AC9: Edit learning — picker hidden and locked badge shown when current visibility is `PUBLIC`
**GIVEN** I have a `PUBLIC` learning and enter edit mode
**WHEN** the edit screen renders
**THEN** the `VisibilityPicker` is not shown
**AND** a locked badge with the message from `learnings.visibility.lockedPublic` is shown instead

### AC10: Detail view shows correct badge for `FOLLOWERS_ONLY`
**GIVEN** I am viewing a `FOLLOWERS_ONLY` learning in read mode
**WHEN** the detail screen renders
**THEN** the badge shows the 👥 icon and the translated "Followers only" label

### AC11: Detail view shows correct badge for `COLLEAGUES_ONLY`
**GIVEN** I am viewing a `COLLEAGUES_ONLY` learning in read mode
**WHEN** the detail screen renders
**THEN** the badge shows the 🤝 icon and the translated "Colleagues only" label

### AC12: Settings — `defaultPokVisibility` can be set to `FOLLOWERS_ONLY`
**GIVEN** I am on the Profile settings screen
**WHEN** I tap `FOLLOWERS_ONLY` in the default learning visibility picker
**THEN** `PATCH /api/v1/users/me/settings` is called with `{ "defaultPokVisibility": "FOLLOWERS_ONLY" }`
**AND** the selection is reflected immediately (optimistic update)

### AC13: Settings — `defaultPokVisibility` can be set to `COLLEAGUES_ONLY`
**GIVEN** I am on the Profile settings screen
**WHEN** I tap `COLLEAGUES_ONLY` in the default learning visibility picker
**THEN** `PATCH /api/v1/users/me/settings` is called with `{ "defaultPokVisibility": "COLLEAGUES_ONLY" }`

### AC14: Settings — `profileVisibility` selector remains 2-option
**GIVEN** I am on the Profile settings screen
**WHEN** I view the profile visibility control
**THEN** only `PRIVATE` and `PUBLIC` options are presented (no `FOLLOWERS_ONLY` or `COLLEAGUES_ONLY`)

### AC15: PT-BR translations present for new keys
**GIVEN** the device locale is `pt-BR`
**WHEN** I view the visibility picker on any screen
**THEN** `Apenas seguidores`, `Apenas colegas`, and their descriptions are displayed (not raw keys)

### AC16: LearningCard shows visibility badge icon for all 4 tiers
**GIVEN** I am viewing my own feed and a learning in my list has visibility `FOLLOWERS_ONLY`
**WHEN** the `LearningCard` renders
**THEN** the 👥 icon is shown next to the learning (matching the icon map in `VisibilityBadge`)
**AND** the same applies for `PRIVATE` (🔒), `COLLEAGUES_ONLY` (🤝), and `PUBLIC` (🌐)

---

## Implementation Approach

### Architecture

Additive, mobile-only. The change is a UI refactor and type cleanup — no backend calls change, no new API endpoints, no new storage.

**Step 1 — Type cleanup (FR1):**

Remove lines 8–9 from `auth.ts` (the 2-tier `PokVisibility` export). Find all import sites via: `grep -r "from '@/lib/auth'" src/ | grep PokVisibility` and update each to `@/lib/pokApi`. The only known consumer is `ProfileScreen.tsx` (line 12: `import type { ProfileVisibility, PokVisibility } from '@/lib/auth'`).

**Step 2 — New `VisibilityPicker` component (FR2, FR8):**

```tsx
// mobile/src/components/ui/VisibilityPicker.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import type { PokVisibility } from '@/lib/pokApi';
import { Text } from '@/components/ui/Text';

// Ordered from most restrictive to most open
const VISIBILITY_OPTIONS: Array<{ value: PokVisibility; icon: string; labelKey: string; descKey: string }> = [
  { value: 'PRIVATE',         icon: '🔒', labelKey: 'learnings.visibility.private',       descKey: 'learnings.visibility.privateDesc' },
  { value: 'COLLEAGUES_ONLY', icon: '🤝', labelKey: 'learnings.visibility.colleaguesOnly', descKey: 'learnings.visibility.colleaguesOnlyDesc' },
  { value: 'FOLLOWERS_ONLY',  icon: '👥', labelKey: 'learnings.visibility.followersOnly',  descKey: 'learnings.visibility.followersOnlyDesc' },
  { value: 'PUBLIC',          icon: '🌐', labelKey: 'learnings.visibility.public',         descKey: 'learnings.visibility.publicDesc' },
];
```

Each row is a `TouchableOpacity` with `accessibilityRole="button"` and
`accessibilityState={{ selected: value === opt.value, disabled: disabledValues?.includes(opt.value) }}`.

**Step 3 — `LearningNewScreen` refactor (FR3, FR7):**

Replace the inline two-button row (lines 48–88 of the current file) with:
```tsx
import { VisibilityPicker } from '@/components/ui/VisibilityPicker';
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
const [visibility, setVisibility] = useState<PokVisibility>(
  user?.defaultPokVisibility ?? 'PRIVATE'
);
// ...
<VisibilityPicker value={visibility} onChange={setVisibility} />
{visibility === 'PUBLIC' && (
  <Text variant="bodySm" style={{ color: theme.colors.warning }}>
    {t('learnings.visibility.publicWarning')}
  </Text>
)}
```

**Step 4 — `LearningDetailScreen` refactor (FR4, FR5, FR7):**

In edit mode, compute `disabledValues` from current `pok.visibility`:

```typescript
const TIER_ORDER: PokVisibility[] = ['PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY', 'PUBLIC'];

function getDisabledValues(currentVisibility: PokVisibility): PokVisibility[] {
  const currentIndex = TIER_ORDER.indexOf(currentVisibility);
  // Disable all tiers with a lower index (more restrictive) than current
  return TIER_ORDER.slice(0, currentIndex);
}
```

When `pok.visibility === 'PUBLIC'`, hide the picker entirely and show the locked badge.

In read mode, replace the 2-branch ternary with `<VisibilityBadge visibility={pok.visibility} />`.

**Step 5 — `ProfileScreen` refactor (FR6):**

Remove `privacyOptions` mapping for `defaultPokVisibility`. Use `<VisibilityPicker>` for that field. Leave the `profileVisibility` button row unchanged (2-option, `ProfileVisibility` type).

**Step 6 — i18n (FR9):**

Add keys to both locale files under `learnings.visibility`:
- EN: `followersOnly`, `followersOnlyDesc`, `colleaguesOnly`, `colleaguesOnlyDesc`, `privateDesc`, `publicDesc`, `lockedPublic`
- PT-BR: same keys with Portuguese translations

### Test Strategy

- [ ] **`VisibilityPicker` unit tests** (`components` jest project):
  - Renders all 4 options
  - Calls `onChange` with the correct value when a non-disabled option is tapped
  - Does NOT call `onChange` when a disabled option is tapped
  - Applies `accessibilityState={{ selected: true }}` to the selected option
  - Applies `accessibilityState={{ disabled: true }}` to disabled options
  - Shows the PUBLIC warning when value is `'PUBLIC'` (if included in component; otherwise test in screen)

- [ ] **`VisibilityBadge` unit tests** (`components` jest project):
  - Renders the correct icon and label for each of the 4 values

- [ ] **`getDisabledValues` unit tests** (`lib` jest project — pure function, no RN):
  - `PRIVATE` → `[]` (nothing disabled)
  - `COLLEAGUES_ONLY` → `['PRIVATE']`
  - `FOLLOWERS_ONLY` → `['PRIVATE', 'COLLEAGUES_ONLY']`
  - `PUBLIC` → irrelevant (picker is hidden)

### File Changes

**New:**
- `mobile/src/components/ui/VisibilityPicker.tsx` — `VisibilityPicker` + `VisibilityBadge`
- `mobile/src/components/ui/__tests__/VisibilityPicker.test.tsx`

**Modified:**
- `mobile/src/lib/auth.ts` — remove `export type PokVisibility` (lines 8–9)
- `mobile/src/screens/app/LearningNewScreen.tsx` — replace inline picker; import `defaultPokVisibility` from `useAuth`
- `mobile/src/screens/app/LearningDetailScreen.tsx` — replace inline picker; upgrade badge; add `getDisabledValues` helper (or import from utils)
- `mobile/src/screens/app/ProfileScreen.tsx` — replace `defaultPokVisibility` button row; fix import
- `mobile/src/i18n/locales/en.ts` — add 7 new keys under `learnings.visibility`
- `mobile/src/i18n/locales/pt-BR.ts` — same keys in PT-BR

---

## Implementation Plan

### Task 1: Remove duplicate `PokVisibility` from `auth.ts` (type cleanup)
- **Files:** `mobile/src/lib/auth.ts`, `mobile/src/screens/app/ProfileScreen.tsx` (import fix only)
- **Depends on:** _none_
- **Commit:** `fix(mobile): remove duplicate PokVisibility from auth.ts; import from pokApi.ts`
- **Stack:** mobile

### Task 2: Add `VisibilityPicker` and `VisibilityBadge` components
- **Files:** `mobile/src/components/ui/VisibilityPicker.tsx`, `mobile/src/components/ui/__tests__/VisibilityPicker.test.tsx`
- **Depends on:** Task 1 (imports `PokVisibility` from `pokApi.ts`)
- **Commit:** `feat(mobile): add VisibilityPicker and VisibilityBadge components with 4-tier support`
- **Stack:** mobile

### Task 3: Refactor `LearningNewScreen` to use 4-tier `VisibilityPicker`
- **Files:** `mobile/src/screens/app/LearningNewScreen.tsx`
- **Depends on:** Task 2
- **Commit:** `feat(mobile): expand LearningNewScreen visibility picker to 4 tiers`
- **Stack:** mobile

### Task 4: Refactor `LearningDetailScreen` — 4-tier picker and badge
- **Files:** `mobile/src/screens/app/LearningDetailScreen.tsx`
- **Depends on:** Task 2
- **Commit:** `feat(mobile): expand LearningDetailScreen visibility picker and badge to 4 tiers`
- **Stack:** mobile

### Task 5: Refactor `ProfileScreen` `defaultPokVisibility` selector
- **Files:** `mobile/src/screens/app/ProfileScreen.tsx`
- **Depends on:** Task 2
- **Commit:** `feat(mobile): expand ProfileScreen default learning visibility to 4-tier picker`
- **Stack:** mobile

### Task 6: Add i18n keys for new visibility tiers
- **Files:** `mobile/src/i18n/locales/en.ts`, `mobile/src/i18n/locales/pt-BR.ts`
- **Depends on:** _none_ (can run in parallel with Tasks 2–5)
- **Commit:** `feat(mobile/i18n): add followersOnly and colleaguesOnly visibility keys in EN and PT-BR`
- **Stack:** mobile

---

## Dependencies

**Blocked by:**

- `docs/specs/features/mobile-social-discovery.md` — follow/colleague relationships must be meaningful to users before `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` tiers are surfaced in the picker. The type cleanup (FR1) and badge upgrade (FR5) can proceed independently, but the full picker UI  (FR2–FR4, FR6) should ship together with or after social discovery.

**Blocks:** None — this is a parity feature. No downstream spec depends on mobile having 4-tier pickers.

**External:** None — backend already supports all 4 tiers.

---

## Post-Implementation Notes

_To be filled in after implementation._

### Commits

| # | Hash | Description |
|---|------|-------------|
| 1 | c27547c | `fix(mobile): remove duplicate PokVisibility from auth.ts; import from pokApi.ts` |
| 2 | 41ab2af | `feat(mobile/i18n): add followersOnly and colleaguesOnly visibility keys in EN and PT-BR` |
| 3 | 23ae5ca | `feat(mobile): add VisibilityPicker and VisibilityBadge components with 4-tier support` |
| 4 | ca5f432 | `feat(mobile): expand LearningNewScreen visibility picker to 4 tiers` |
| 5 | 7f27246 | `feat(mobile): expand LearningDetailScreen visibility picker and badge to 4 tiers` |
| 6 | 518c498 | `feat(mobile): expand ProfileScreen default learning visibility to 4-tier picker` |
| 7 | 883bf58 | `fix(mobile): remove unnecessary PokVisibility cast in LearningNewScreen` |

### Architectural Decisions

- `VisibilityPicker` and `VisibilityBadge` are co-located in one file (`VisibilityPicker.tsx`) since `VisibilityBadge` is a simple inline subcomponent with no standalone use case outside the picker context.
- `getDisabledValues` exported as a standalone pure function from the same file, making it testable in the `lib` jest project if needed and usable directly by screen code.
- `showPublicWarning` prop defaults `false` — only `LearningNewScreen` and `LearningDetailScreen` pass it as `true`; `ProfileScreen` omits it since the default visibility preference is always reversible.

### Deviations from Spec

- **Task 6 (i18n) committed before Task 2 (component)** — spec plan ordered i18n as parallel with Tasks 2–5 but with no dependency. Committed as Task 6 before Task 2 for atomic commit hygiene (i18n keys must exist before components reference them at runtime).
- **`accessibilityRole="button"` retained on picker rows** — spec explicitly specifies `"button"`; post-implementation review suggested `"radio"` would be more semantically accurate, but since the spec mandates `"button"` it was preserved for now.
- **Cast removed** — `(user?.defaultPokVisibility as PokVisibility)` was an unnecessary cast (type is already correct after Task 1 changes); removed in a follow-up commit after post-implementation review.
