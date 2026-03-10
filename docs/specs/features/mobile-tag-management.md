# Mobile Tag Management

> **Status:** Planned
> **Created:** 2026-03-09
> **Milestone:** 3.4 (App Store Publishing) — companion UX milestone

---

## Context

Tags are fully functional on the backend and partially visible on mobile. `LearningCard` renders up to three tag chips (read-only) and `LearningDetailScreen` shows all tags as plain chips. The full tag API already exists in `mobile/src/lib/tagApi.ts`: `list()`, `create()`, `assign()`, `remove()`, `getSuggestions()`, `approveSuggestion()`, `rejectSuggestion()`. None of those write operations are used anywhere in the mobile app today.

The web equivalent is fully built: `TagSection` (add/remove on existing learnings), `TagPicker` (tag at creation), `TagSuggestionPrompt` (AI suggestions with approve/reject), and `TagFilter` (horizontal chip bar to filter the feed). `useFeedData` already accepts a `tagId` parameter — the hook is filter-ready but no screen exposes it.

This spec closes the tag management gap, bringing mobile to feature parity with the web on four axes:

1. Add/remove tags on an existing learning (detail screen)
2. Tag at creation (new learning screen, post-save flow)
3. AI tag suggestion review on the detail screen
4. Tag filter on the My Learnings feed

**Related specs:**
- `docs/specs/features/tag-improvements.md` — FR9 (mobile tag input mask) and FR12 (mobile tag filter) originally deferred
- `docs/specs/features/tagging-system.md` — Phase 2.2: backend + web tag layer
- `docs/specs/features/mobile-my-learnings.md` — FR14 explicitly deferred tag filter to this spec; `useFeedData` `tagId` wiring documented there

**Phase/Milestone:** Phase 3 — AI & Mobile / Milestone 3.4

---

## Requirements

### Functional

#### Tag Management on LearningDetailScreen (TM-1)

- [ ] **FR1** `[Must Have]` The `LearningDetailScreen` tag section gains an "+ Add tag" button rendered inline after the existing tag chips. Tapping it opens a `TagPicker` modal (bottom sheet style). This button is always visible regardless of how many tags are already assigned.
- [ ] **FR2** `[Must Have]` The `TagPicker` modal displays: a search text input at the top, a scrollable list of the user's existing unassigned tags filtered by the search query, and a "Create new tag" row that appears when the search query does not exactly match an existing tag name.
- [ ] **FR3** `[Must Have]` Tapping an existing tag in the `TagPicker` modal assigns it to the learning via `tagApi.assign(pokId, tagId)`, closes the modal, and refreshes the tag list on the detail screen. The tag chip appears immediately without a full screen reload.
- [ ] **FR4** `[Must Have]` The "Create new tag" row in the modal creates a tag via `tagApi.create({ name })` (applying the spaces-to-dashes input mask per FR9 from `tag-improvements.md`), assigns it, closes the modal, and refreshes the tag list.
- [ ] **FR5** `[Must Have]` Each existing tag chip on `LearningDetailScreen` gains an inline "×" (remove) button. Tapping it calls `tagApi.remove(pokId, tagId)`, removes the chip immediately, and refreshes the tag list. A confirmation is NOT required (matches web TagSection behavior — removal is reversible by re-adding).
- [ ] **FR6** `[Must Have]` The tag input in `TagPicker` applies the same spaces-to-dashes mask as the web: `value.replace(/\s+/g, '-')`. This is enforced in the `TextInput`'s `onChangeText` handler.
- [ ] **FR7** `[Should Have]` If `tagApi.assign()` or `tagApi.remove()` fails, an inline error message is shown below the tag section. The tag list reverts to its pre-action state. The error is dismissible.
- [ ] **FR8** `[Should Have]` The `TagPicker` modal is dismissible by tapping outside its content area (backdrop tap) or pressing the device back button (Android).

#### AI Tag Suggestions on LearningDetailScreen (TM-2)

- [ ] **FR9** `[Must Have]` When `LearningDetailScreen` loads a POK that has `pendingSuggestions.length > 0`, a `TagSuggestionBanner` is rendered above the tag section. It lists each suggested tag name with two actions: "Approve" (checkmark) and "Reject" (×).
- [ ] **FR10** `[Must Have]` Tapping "Approve" on a suggestion calls `tagApi.approveSuggestion(pokId, suggestionId)`, removes that suggestion chip from the banner, and refreshes the tag list (the newly approved tag appears in the chip row immediately).
- [ ] **FR11** `[Must Have]` Tapping "Reject" on a suggestion calls `tagApi.rejectSuggestion(pokId, suggestionId)` and removes that suggestion chip from the banner.
- [ ] **FR12** `[Must Have]` When the last pending suggestion is resolved (approved or rejected), the `TagSuggestionBanner` disappears without a page reload.
- [ ] **FR13** `[Should Have]` The banner is visually distinct from the tag chip row (accent color background or border, e.g., blue-tinted, matching the web `TagSuggestionPrompt`). It includes a label: "Suggested tags" / "Etiquetas sugeridas".
- [ ] **FR14** `[Should Have]` While a suggestion action is in-flight, the approve and reject buttons for that suggestion are disabled (not the entire banner).

#### Tag-at-Creation on LearningNewScreen (TM-3)

- [ ] **FR15** `[Must Have]` After a learning is saved on `LearningNewScreen`, the navigation target changes from `Feed` to the new learning's `LearningDetail` screen. This gives the user an immediate opportunity to add tags (via the `TagPicker` + remove flow from TM-1) without a separate gesture. The `pokApi.create()` response already returns the new POK's `id`.
- [ ] **FR16** `[Could Have — DEFERRED]` Inline tag picker before save (pre-save tagging on the new screen, equivalent to web `TagPicker` in `QuickEntry`). Deferred: the post-save redirect to detail (FR15) provides the same capability in one more tap and avoids complicating the compose screen. Revisit if user research reveals friction.

#### Tag Filter on My Learnings Feed (TM-4)

- [ ] **FR17** `[Must Have]` The My Learnings screen (`MyLearningsScreen`) renders a horizontally-scrollable row of tag chips immediately below the `SearchBar` and above the `FlatList`. Each chip corresponds to one of the user's tags (fetched via `tagApi.list()`). The chip row is hidden when the user has no tags.
- [ ] **FR18** `[Must Have]` Tapping a tag chip sets it as the active filter: the chip becomes visually selected (filled/highlighted) and `setParams({ tagId: tag.tagId })` is called on `useFeedData`. The list re-fetches showing only learnings tagged with that tag.
- [ ] **FR19** `[Must Have]` Tapping the active chip again deselects it: `setParams({ tagId: undefined })` is called and the full unfiltered list is restored.
- [ ] **FR20** `[Must Have]` Only one tag can be active at a time (single-select, matching the web `TagFilter`). Tapping a different chip replaces the active filter.
- [ ] **FR21** `[Should Have]` An active tag filter and a keyword search are mutually exclusive: activating a tag filter clears the keyword (`setParams({ tagId: tag.tagId, keyword: undefined })`); typing in `SearchBar` clears the active tag filter (`setParams({ keyword: text, tagId: undefined })`).
- [ ] **FR22** `[Should Have]` The active tag filter chip is announced to screen readers via `accessibilityState={{ selected: true }}` and `accessibilityLabel` reflecting the tag name and filter state.
- [ ] **FR23** `[Could Have — DEFERRED]` Tag filter on the social/discovery Feed tab. Tags are per-user, so filtering someone else's feed by the authenticated user's tag IDs is not meaningful. Deferred indefinitely.

**Explicitly out of scope:**
- Tag-grouped view on mobile (web-only visualization; low mobile value — deferred to a future polish milestone)
- Tag rename or delete on mobile (web-only for now; not part of this spec)
- Tag filter on the social Feed tab or Discover tab (see FR23)
- Inline pre-save tagging on `LearningNewScreen` (see FR16)

---

### Non-Functional

#### Performance
- [ ] **NFR1** The `TagPicker` modal's tag list is fetched once at open time via `tagApi.list()`. Results are not re-fetched on each keystroke — filtering is done client-side against the in-memory list. This matches the web `useTags` cache pattern.
- [ ] **NFR2** Tag assign and remove operations complete within 1 second on a 4G connection (single API call with no complex joins). The optimistic UI (chip appears / disappears immediately) keeps perceived latency low.
- [ ] **NFR3** The tag filter chip row on `MyLearningsScreen` reuses the same `tagApi.list()` call already made by `TagPicker` whenever possible. If a `useTags` hook is introduced for mobile (mirroring web's `useTags`), it should cache the list and share it across components in the same screen session.

#### Accessibility
- [ ] **NFR4** The "+ Add tag" button has `accessibilityLabel={t('tags.addTag')}` and `accessibilityRole="button"`.
- [ ] **NFR5** Each tag chip remove button ("×") has `accessibilityLabel={t('tags.removeTag', { name: tag.displayName })}` — minimum touch target 44×44pt.
- [ ] **NFR6** The `TagPicker` modal's `TextInput` has `accessibilityLabel={t('tags.searchPlaceholder')}` and `returnKeyType="search"`.
- [ ] **NFR7** `TagSuggestionBanner` approve/reject buttons have descriptive `accessibilityLabel`: e.g., `t('tags.suggestions.approve', { name })` and `t('tags.suggestions.reject', { name })`.
- [ ] **NFR8** Tag filter chips have `accessibilityRole="button"` and `accessibilityState={{ selected: isActive }}`.

#### Internationalization
- [ ] **NFR9** All user-facing strings are defined under `tags.*` and `tags.suggestions.*` namespaces in `mobile/src/i18n/locales/en.ts` and `pt-BR.ts`. No hardcoded strings in components.
- [ ] **NFR10** The word "POK" must not appear anywhere in the mobile UI or labels.

#### Code Quality
- [ ] **NFR11** TypeScript `strict: true` — no `any` in production code paths.
- [ ] **NFR12** `TagPicker` and `TagSuggestionBanner` are reusable components with no hard coupling to a specific screen. They accept `pokId`, callbacks, and initial data as props.
- [ ] **NFR13** Tag input mask (`/\s+/g` → `'-'`) is applied identically to the web — tested in the `TagPicker` unit tests.

#### Testing
- [ ] **NFR14** Unit tests for `TagPicker`: renders existing tags, search filtering, "Create new" row visibility, `onAssign` callback, `onCreate` callback, spaces-to-dashes input mask, dismiss on backdrop tap.
- [ ] **NFR15** Unit tests for `TagSuggestionBanner`: renders suggestion chips, `onApprove` / `onReject` callbacks, banner disappears when all suggestions resolved, per-chip disabled state during in-flight action.
- [ ] **NFR16** `LearningDetailScreen` render tests: tag chips rendered, "× remove" button triggers `tagApi.remove`, "+ Add tag" opens `TagPicker`, `TagSuggestionBanner` rendered when `pendingSuggestions.length > 0`.
- [ ] **NFR17** `MyLearningsScreen` render tests: tag chip row hidden when no tags, chip appears when tags exist, tapping chip calls `setParams({ tagId })`, tapping active chip calls `setParams({ tagId: undefined })`.

---

## Technical Constraints

**Stack:** Mobile (Expo SDK 53, React Native 0.79, managed workflow, TypeScript strict)

**Key integration points:**

| File | Role |
|------|------|
| `mobile/src/lib/tagApi.ts` | All tag API calls — no changes needed; all operations exist |
| `mobile/src/screens/app/LearningDetailScreen.tsx` | Add TagPicker trigger, remove-chip buttons, TagSuggestionBanner |
| `mobile/src/screens/app/LearningNewScreen.tsx` | Navigate to `LearningDetail` instead of `Feed` after save (FR15) |
| `mobile/src/screens/app/MyLearningsScreen.tsx` | Add tag filter chip row (from `mobile-my-learnings.md` spec) |
| `mobile/src/hooks/useFeedData.ts` | Already accepts `tagId` in `PokSearchParams` — no changes needed |
| `mobile/src/navigation/AppStack.tsx` | `LearningDetail` route already present; no changes needed |
| `mobile/src/i18n/locales/en.ts` / `pt-BR.ts` | Add `tags.*` and `tags.suggestions.*` keys |

**`LearningDetailScreen` tag state pattern:**

The screen currently fetches the POK once on mount (`loadPok`). Tag operations (assign, remove, suggestion approve/reject) must NOT re-trigger `setLoading(true)` — that would unmount the scroll view and discard any unsaved state. A targeted partial refresh is required:

```typescript
const refreshTags = useCallback(async () => {
  const data = await pokApi.getById(pokId);
  setPok((prev) => prev ? { ...prev, tags: data.tags, pendingSuggestions: data.pendingSuggestions } : data);
}, [pokId]);
```

This pattern follows the "partial state refresh" principle documented in `web/CLAUDE.md`.

**`TagPicker` modal approach — `Modal` component (not bottom sheet library):**

Use React Native's built-in `<Modal animationType="slide" transparent>` with a white/dark card positioned at the bottom of the screen via absolute positioning + `KeyboardAvoidingView`. This avoids adding `@gorhom/bottom-sheet` to the dependency tree (not yet in the managed workflow). If a future milestone needs full bottom-sheet gesture physics, it can be adopted then.

```typescript
// TagPicker shell
<Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
  <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.sheet}>
      <TextInput ... />
      <FlatList ... />
      {showCreateRow && <TouchableOpacity ...>Create "{query}"</TouchableOpacity>}
    </View>
  </KeyboardAvoidingView>
</Modal>
```

**Post-save navigation in `LearningNewScreen`:**

`pokApi.create()` returns the full `Pok` object, which includes the `id`. After a successful save, navigate to `LearningDetail` using the stack navigator:

```typescript
const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

// After successful create:
const pok = await pokApi.create({ ... });
nav.replace('LearningDetail', { pokId: pok.id });
```

`replace` is preferred over `push` so the back button returns to the tab bar, not back to the compose screen.

**Tag filter chip row — `useTags` hook:**

Introduce a reusable `useTags` hook at `mobile/src/hooks/useTags.ts` that wraps `tagApi.list()` with in-memory caching (similar to the web's `useTags`). Both `TagPicker` and the `MyLearningsScreen` filter row call this hook, ensuring a single fetch per session rather than two separate API calls.

```typescript
export function useTags(): { tags: Tag[]; loading: boolean; reload: () => Promise<void> }
```

**`setParams` interaction — tag filter vs. keyword search:**

`useFeedData.setParams` merges onto existing params. To clear a param, pass `undefined`:

```typescript
// Activate tag filter — clear keyword
setParams({ tagId: tag.tagId, keyword: undefined });

// Activate keyword search — clear tag filter
setParams({ keyword: text, tagId: undefined });
```

This requires confirming that `PokSearchParams` in `pokApi.ts` types `tagId` and `keyword` as optional (they are — verified in `useFeedData.ts`).

---

## Acceptance Criteria

### AC-1 — Add tag to existing learning
**GIVEN** I am viewing a learning with no tags
**WHEN** I tap "+ Add tag"
**THEN** the `TagPicker` modal opens showing my existing tags and a search input
**WHEN** I tap an existing tag
**THEN** the modal closes and the tag chip appears on the learning without a full reload

---

### AC-2 — Create new tag from TagPicker and assign it
**GIVEN** the `TagPicker` modal is open and I type "react-native" (no match in my tags)
**WHEN** the "Create 'react-native'" row appears and I tap it
**THEN** the tag is created via `tagApi.create()`, assigned via `tagApi.assign()`, the modal closes, and "react-native" chip appears on the learning

---

### AC-3 — Spaces-to-dashes input mask in TagPicker
**GIVEN** the `TagPicker` search input is focused
**WHEN** I type "spring boot"
**THEN** the input displays "spring-boot" in real time (spaces are replaced as I type)

---

### AC-4 — Remove tag from existing learning
**GIVEN** a learning has the tags "java" and "spring-boot"
**WHEN** I tap the "×" on the "java" chip
**THEN** the "java" chip disappears immediately
**AND** the "spring-boot" chip remains
**AND** the tag still exists in my tag list (it is only unassigned, not deleted)

---

### AC-5 — Approve AI tag suggestion
**GIVEN** a learning has one pending suggestion "docker"
**WHEN** `LearningDetailScreen` loads
**THEN** the `TagSuggestionBanner` is visible with "docker" and an approve button
**WHEN** I tap the approve button
**THEN** `tagApi.approveSuggestion()` is called, "docker" chip appears in the tag row, and the banner disappears

---

### AC-6 — Reject AI tag suggestion
**GIVEN** a learning has two pending suggestions: "docker" and "kubernetes"
**WHEN** I tap the reject button on "docker"
**THEN** "docker" disappears from the banner
**AND** "kubernetes" remains in the banner
**AND** no tag is assigned to the learning

---

### AC-7 — Banner disappears when all suggestions resolved
**GIVEN** a learning has one pending suggestion
**WHEN** I approve (or reject) it
**THEN** the `TagSuggestionBanner` is no longer rendered

---

### AC-8 — Post-save navigation goes to LearningDetail
**GIVEN** I am on the New Learning screen
**WHEN** I fill in content and tap "Save"
**THEN** I am navigated to `LearningDetail` for the newly created learning (not to the Feed tab)
**AND** the back button returns me to the tab bar (not back to the compose screen)

---

### AC-9 — Tag filter chip row visible on My Learnings
**GIVEN** I have tags "java", "react-native", and "devops"
**WHEN** I navigate to My Learnings
**THEN** a horizontal chip row with three chips is visible below the search bar
**AND** all chips are in the unselected (outline/grey) state

---

### AC-10 — Tag filter chips filter the feed
**GIVEN** I have learnings tagged with "java" and "react-native"
**WHEN** I tap the "java" chip in the filter row
**THEN** the chip is visually selected (filled)
**AND** the list re-fetches showing only learnings tagged "java"
**AND** "react-native" learnings are excluded

---

### AC-11 — Deselect tag filter restores full list
**GIVEN** the "java" chip is the active filter
**WHEN** I tap the "java" chip again
**THEN** it becomes unselected
**AND** the full unfiltered list is restored

---

### AC-12 — Tag filter and search are mutually exclusive
**GIVEN** the "java" chip is the active filter
**WHEN** I type "spring" in the search bar
**THEN** the "java" chip becomes unselected
**AND** the list re-fetches with keyword="spring" and no tagId

---

### AC-13 — Tag chip row hidden when user has no tags
**GIVEN** I am a new user with zero tags
**WHEN** I navigate to My Learnings
**THEN** no tag chip row is rendered (the search bar sits directly above the list)

---

### AC-14 — No "POK" in UI
**GIVEN** I am on any screen (LearningDetail, LearningNew, My Learnings)
**WHEN** I interact with any tag-related UI element
**THEN** the string "POK" does not appear in any label, button text, placeholder, or error message

---

### AC-15 — Dark mode
**GIVEN** the device is in dark mode
**WHEN** I open the `TagPicker` modal or view the `TagSuggestionBanner`
**THEN** both use dark theme tokens (no hardcoded colours)

---

### AC-16 — PT-BR i18n
**GIVEN** the device locale is "pt-BR"
**WHEN** I view the tag section on `LearningDetailScreen` and the chip row on My Learnings
**THEN** all labels, button text, and placeholders are in Brazilian Portuguese

---

## Screen Layouts

### LearningDetailScreen — Tag Section (read view)

Current layout (tags block at line 188–207):
```
[tag chip] [tag chip] [tag chip]   ← existing, read-only chips
```

New layout:
```
[tag chip ×] [tag chip ×] [+ Add tag]   ← chips gain × button; Add tag always last
```

When `pendingSuggestions.length > 0`, above the tag row:
```
┌─────────────────────────────────────┐
│ Suggested tags                       │
│ [docker ✓ ×]  [kubernetes ✓ ×]     │
└─────────────────────────────────────┘
[tag chip ×] [+ Add tag]
```

### TagPicker Modal (bottom sheet style)

```
┌────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← backdrop (tap to dismiss)
│ ┌──────────────────────────────────┐   │
│ │ [🔍 Search tags…               ] │   │ ← TextInput with spaces→dashes mask
│ │──────────────────────────────────│   │
│ │ java                             │   │ ← existing unassigned tag (tap to assign)
│ │ spring-boot                      │   │
│ │ devops                           │   │
│ │──────────────────────────────────│   │
│ │ + Create "new-tag"               │   │ ← shown when query ≠ exact existing match
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### MyLearningsScreen — Tag Filter Row (new, below SearchBar)

```
[SearchBar                              ]
[java] [react-native] [devops]   ← horizontal scroll, single-select chips
[LearningCard                          ]
[LearningCard                          ]
...
```

Active chip:
```
[java (filled/primary)]  [react-native]  [devops]
```

---

## i18n Keys

New keys to add under `tags.*` and `tags.suggestions.*` in both `en.ts` and `pt-BR.ts`:

| Key | EN | PT-BR |
|-----|----|-------|
| `tags.addTag` | Add tag | Adicionar etiqueta |
| `tags.removeTag` | Remove {name} | Remover {name} |
| `tags.searchPlaceholder` | Search tags… | Pesquisar etiquetas… |
| `tags.createNew` | Create "{name}" | Criar "{name}" |
| `tags.noTags` | No tags yet | Nenhuma etiqueta |
| `tags.filterLabel` | Filter by tag | Filtrar por etiqueta |
| `tags.errors.assignFailed` | Failed to add tag | Falha ao adicionar etiqueta |
| `tags.errors.removeFailed` | Failed to remove tag | Falha ao remover etiqueta |
| `tags.errors.createFailed` | Failed to create tag | Falha ao criar etiqueta |
| `tags.suggestions.heading` | Suggested tags | Etiquetas sugeridas |
| `tags.suggestions.approve` | Add {name} | Adicionar {name} |
| `tags.suggestions.reject` | Dismiss {name} | Dispensar {name} |
| `tags.suggestions.approveFailed` | Failed to approve suggestion | Falha ao aprovar sugestão |
| `tags.suggestions.rejectFailed` | Failed to reject suggestion | Falha ao rejeitar sugestão |

---

## Implementation Approach

### Architecture

```
LearningDetailScreen (modified)
├── TagSuggestionBanner (new)          ← FR9–FR14; calls tagApi.approveSuggestion/rejectSuggestion
│   └── per-suggestion: [name] [✓] [×]
├── Tag chip row (modified)
│   └── [chip ×] ... [+ Add tag]      ← chips gain onRemove; + button opens TagPicker
└── TagPicker (new)                    ← FR1–FR8; Modal + search + list + create row

LearningNewScreen (modified)
└── pokApi.create() → nav.replace('LearningDetail', { pokId }) instead of nav.navigate('Feed')

MyLearningsScreen (modified, from mobile-my-learnings.md spec)
├── SearchBar (existing)
├── TagFilterRow (new — inline, not extracted)
│   └── useTags() → horizontal ScrollView of chip buttons
└── FlatList (existing, now also accepts tagId param)

New hooks:
└── useTags (new)                      ← tagApi.list() with in-memory cache; shared by TagPicker + TagFilterRow
```

### Component Responsibilities

**`TagPicker`** (`mobile/src/components/tags/TagPicker.tsx`)
- Props: `visible: boolean`, `pokId: string`, `assignedTagIds: string[]`, `onAssign: (tagId: string) => void`, `onCreate: (name: string) => void`, `onDismiss: () => void`
- Owns: `Modal`, search `TextInput`, `FlatList` of available tags, "Create new" row
- Uses: `useTags()` for the tag list
- Does NOT call `tagApi` directly — all mutations are delegated to callbacks so the parent screen controls the optimistic update and error handling

**`TagSuggestionBanner`** (`mobile/src/components/tags/TagSuggestionBanner.tsx`)
- Props: `pokId: string`, `suggestions: TagSuggestion[]`, `onResolved: () => void`
- Owns: local `pending` state, per-suggestion in-flight tracking
- Calls `tagApi.approveSuggestion` and `tagApi.rejectSuggestion` directly (same pattern as web's `TagSuggestionPrompt`)

**`useTags`** (`mobile/src/hooks/useTags.ts`)
- Fetches `tagApi.list()` once on mount; exposes `{ tags, loading, reload }`
- Shared between `TagPicker` and the My Learnings tag filter row

### Test Strategy

- [ ] TDD for `TagPicker` component tests (components jest project — `testEnvironment: 'node'` with native module stubs per `mobile/CLAUDE.md`)
- [ ] TDD for `TagSuggestionBanner` component tests (components jest project)
- [ ] TDD for `useTags` hook tests (lib jest project — pure TypeScript, no rendering)
- [ ] `LearningDetailScreen` render tests: tag chips + remove button + "+ Add tag" button + `TagSuggestionBanner` presence when `pendingSuggestions` non-empty
- [ ] `LearningNewScreen` render test: after successful save, `nav.replace` called with `'LearningDetail'` and correct `pokId`
- [ ] `MyLearningsScreen` render tests (extend existing): chip row hidden when no tags, chip row visible when tags exist, chip tap calls `setParams({ tagId })`, re-tap calls `setParams({ tagId: undefined })`

### File Changes

**New:**
```
mobile/src/components/tags/TagPicker.tsx
mobile/src/components/tags/TagSuggestionBanner.tsx
mobile/src/components/tags/__tests__/TagPicker.test.tsx
mobile/src/components/tags/__tests__/TagSuggestionBanner.test.tsx
mobile/src/hooks/useTags.ts
mobile/src/hooks/__tests__/useTags.test.ts
```

**Modified:**
```
mobile/src/screens/app/LearningDetailScreen.tsx
  — Import TagPicker, TagSuggestionBanner
  — Add refreshTags() partial-refresh helper
  — Add showPicker state + "+ Add tag" button wiring
  — Tag chips gain onRemove handler
  — TagSuggestionBanner rendered when pendingSuggestions.length > 0

mobile/src/screens/app/LearningNewScreen.tsx
  — Change post-save navigation from nav.navigate('Feed') to nav.replace('LearningDetail', { pokId: pok.id })
  — pokApi.create() must be awaited for the returned id

mobile/src/screens/app/MyLearningsScreen.tsx  (or created fresh per mobile-my-learnings.md spec)
  — Add horizontal tag filter chip row using useTags()
  — Add selectedTagId state
  — Chip tap → setParams({ tagId }) / setParams({ tagId: undefined })
  — SearchBar onChangeText clears tagId when keyword changes

mobile/src/i18n/locales/en.ts
  — Add tags.* and tags.suggestions.* keys

mobile/src/i18n/locales/pt-BR.ts
  — Add tags.* and tags.suggestions.* keys (PT-BR translations)
```

**No changes needed:**
```
mobile/src/lib/tagApi.ts          — all operations already exist
mobile/src/hooks/useFeedData.ts   — tagId param already supported
mobile/src/navigation/AppStack.tsx — LearningDetail route already present
```

---

## Dependencies

**Blocked by:** `mobile-my-learnings.md` — `MyLearningsScreen` must exist for FR17–FR22. The tag filter chip row is added to that screen. If `MyLearningsScreen` is not yet implemented, defer TM-4 and implement TM-1/2/3 first.

**Blocks:** None within this milestone.

**External:** None — no new npm packages. `Modal`, `KeyboardAvoidingView`, `ScrollView`, `FlatList` are all built into React Native.

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits

### Architectural Decisions

### Deviations from Spec

### Lessons Learned
