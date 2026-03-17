# Mobile — Re-Learning (Share)

> **Status:** Implemented
> **Reviewed:** 2026-03-17
> **Created:** 2026-03-09
> **Milestone:** 3.4 (App Store Publishing) — parity with web Milestone 6.4

---

## Context

The web app (Milestone 6.4) allows a learner to **re-learn** any PUBLIC learning from another user: they choose a visibility tier and add an optional personal note, and the re-learned card appears in their own feed attributed clearly to the original author. The mobile app has no equivalent — the `FeedScreen` already _renders_ `PokShare` items received from the social feed, but users cannot create or remove their own re-learnings.

The backend endpoints are complete and stable:
- `POST /api/v1/poks/{id}/share` — create a re-learning (201, 400, 401, 404, 409)
- `DELETE /api/v1/poks/shared/{shareId}` — remove a re-learning (204, 401, 403, 404)

The mobile `learnerApi.ts` exposes the `FeedItem` / `PokShare` types for rendering but has no functions for creating or removing shares. This spec closes the gap by adding two API functions and the UI surfaces that call them.

**Design constraints (inherited from web spec):**
- Re-learning is scoped to PUBLIC originals only (MVP)
- Own learnings cannot be re-learned (no Re-learn button on own content)
- The re-learning's visibility tier cannot be looser than the original's tier
- No re-learning counts are shown publicly (anti-vanity)
- The personal note is the sharer's own voice — it does not modify the original content
- "POK" must never appear in the UI (use "learning" everywhere)

**Related:**
- `docs/specs/features/re-learning.md` — full web spec (backend, web frontend, acceptance criteria, API contract)
- `docs/specs/features/mobile-social-discovery.md` — provides `LearnerProfileScreen` and `AppStackParamList` extensions; **this spec depends on it**
- `docs/specs/features/following-and-colleagues.md` — visibility tiers, RelationshipStatus
- `mobile/src/lib/learnerApi.ts` — existing `PokShare` and `FeedItem` types
- `mobile/src/screens/app/FeedScreen.tsx` — already renders `PokShare` items (re-learning header + card)
- `mobile/src/screens/app/LearningDetailScreen.tsx` — detail view for owned learnings; extended here for others' PUBLIC learnings
- `web/src/components/learnings/ReLearningModal.tsx` — web reference implementation

---

## Requirements

### Functional

**Scope:** Mobile only (no backend or web changes)

- [ ] **FR1** `[Must Have]` `mobile/src/lib/learnerApi.ts` exposes `shareLearning(pokId: string, body: ShareLearningRequest): Promise<PokShare>` that POSTs to `POST /api/v1/poks/{pokId}/share`.
- [ ] **FR2** `[Must Have]` `mobile/src/lib/learnerApi.ts` exposes `unshareLearning(shareId: string): Promise<void>` that DELETEs `DELETE /api/v1/poks/shared/{shareId}`.
- [ ] **FR3** `[Must Have]` A new `ReLearningModal` component renders a bottom-sheet-style modal with: an optional personal note field (max 500 chars with live character counter), a 4-tier visibility picker, and Share / Cancel buttons.
- [ ] **FR4** `[Must Have]` The visibility picker in `ReLearningModal` only offers tiers ≤ the original learning's visibility tier (e.g., if the original is `FOLLOWERS_ONLY`, `PUBLIC` is not offered). Default selected tier is the original's visibility.
- [ ] **FR5** `[Must Have]` A **Re-learn** action button appears on `LearnerProfileScreen` for each PUBLIC learning card that belongs to another user. Tapping it opens `ReLearningModal`.
- [ ] **FR6** `[Must Have]` A **Re-learn** action button appears on `LearningDetailScreen` when the authenticated user is viewing another user's PUBLIC learning. Tapping it opens `ReLearningModal`. The button is absent when viewing one's own learning.
- [ ] **FR7** `[Must Have]` When `ReLearningModal` is submitted successfully, the modal closes and an optimistic success indication is shown (the Re-learn button changes state to reflect the learning has been shared).
- [ ] **FR8** `[Must Have]` On `FeedScreen`, a **Remove** action is available on `PokShare` items created by the authenticated user. Tapping Remove shows a confirmation alert; confirming calls `unshareLearning` and removes the card from the list.
- [ ] **FR9** `[Must Have]` The Re-learn button is absent on any learning authored by the authenticated user (own learnings cannot be re-learned).
- [ ] **FR10** `[Must Have]` The Re-learn button is absent on learnings that are not PUBLIC (PRIVATE, COLLEAGUES_ONLY, FOLLOWERS_ONLY originals cannot be re-learned in this spec).
- [ ] **FR11** `[Should Have]` After a successful re-learn, if the user navigates to their own `FeedScreen` (social feed), the new `PokShare` item appears on next refresh or pull-to-refresh (no real-time push required; the social feed shows followed-user content, so this applies if the user's own re-learnings appear there by design).
- [ ] **FR12** `[Should Have]` Duplicate re-learning is handled gracefully: if the backend returns 409 Conflict, `ReLearningModal` shows an inline error "You have already re-learned this" without closing the modal.
- [ ] **FR13** `[Should Have]` `LearningDetailScreen` knows whether the authenticated user has already re-learned a given learning (e.g., the `PokShare` id is returned in a future API enrichment — deferred; for now, button is always shown and 409 is handled inline).
- [ ] **FR14** `[Could Have]` After removing a re-learning from `FeedScreen`, the item is removed optimistically from the in-memory list without requiring a full refresh.

### Non-Functional

- [ ] **NFR1** All user-facing strings are defined in `mobile/src/i18n/locales/en.ts` and `pt-BR.ts` under the `relearnings.*` namespace. No hardcoded strings.
- [ ] **NFR2** All new API functions have unit tests in the `lib` jest project.
- [ ] **NFR3** `ReLearningModal` has unit tests in the `components` jest project.
- [ ] **NFR4** The `ReLearningModal` respects the active theme (light/dark); no hardcoded colour values.
- [ ] **NFR5** The note `TextInput` has `accessibilityLabel`, `maxLength={500}`, and `multiline`. The character counter is accessible via `accessibilityLabel`.
- [ ] **NFR6** The Re-learn and Remove action buttons have `accessibilityRole="button"` and descriptive `accessibilityLabel` values.
- [ ] **NFR7** Navigation typing: all new screens and components use typed navigation props from `AppStackParamList` — no `useNavigation<any>()`.
- [ ] **NFR8** The word "POK" must not appear in any user-facing string, label, placeholder, or accessibility label.

---

## Technical Constraints

**Stack:** Mobile only (Expo SDK 53, React Native 0.79, managed workflow, TypeScript strict)

**Technologies:**
- Existing `apiFetch` from `mobile/src/lib/api.ts` — handles auth + refresh automatically
- Existing `Button` component at `mobile/src/components/ui/Button.tsx`
- Existing `Text` component at `mobile/src/components/ui/Text.tsx`
- Existing `TextInput` component at `mobile/src/components/ui/TextInput.tsx`
- Existing `PokShare` and `FeedItem` types in `mobile/src/lib/learnerApi.ts`
- Existing `PokVisibility` type in `mobile/src/lib/pokApi.ts`
- React Native `Modal` (built-in) for the bottom sheet overlay — no third-party modal library
- React Native `Alert` for the Remove re-learning confirmation

**4-tier visibility picker — implementation approach:**

The picker renders a vertical list of tappable options (PRIVATE / COLLEAGUES_ONLY / FOLLOWERS_ONLY / PUBLIC) capped to the original's tier. **Reuse the `VisibilityPicker` component from `mobile-4-tier-visibility.md`** (`mobile/src/components/ui/VisibilityPicker.tsx`), which accepts `value: PokVisibility`, `onChange: (v: PokVisibility) => void`, and `disabledValues?: PokVisibility[]`. To enforce the tier cap, pass `disabledValues={visibilityOptionsAbove(originalVisibility)}` — options above the original's tier are rendered faded and non-tappable. If the sibling spec has not been implemented yet, build a simpler inline component with the same `disabledValues` interface for forward compatibility.

**Integration points:**

| File | Role |
|------|------|
| `mobile/src/lib/learnerApi.ts` | Add `ShareLearningRequest`, `shareLearning()`, `unshareLearning()` |
| `mobile/src/lib/__tests__/learnerApi.test.ts` | Tests for the 2 new API functions |
| `mobile/src/screens/app/FeedScreen.tsx` | Add Remove button to own `PokShare` items |
| `mobile/src/screens/app/LearningDetailScreen.tsx` | Add Re-learn button for others' PUBLIC learnings |
| `mobile/src/screens/app/LearnerProfileScreen.tsx` | Add Re-learn button per learning card (from mobile-social-discovery.md) |
| `mobile/src/i18n/locales/en.ts` | Add `relearnings.*` keys |
| `mobile/src/i18n/locales/pt-BR.ts` | PT-BR translations |

**Navigation dependency:** `LearnerProfileScreen` is defined in `mobile-social-discovery.md`. This spec extends its learning list items to include a Re-learn button — it does NOT define the screen itself. If `mobile-social-discovery.md` has not been implemented yet, the FR5 surface must be deferred.

**Out of Scope:**
- Backend changes (all APIs exist)
- Web changes (web has this feature already)
- Re-learning from non-PUBLIC originals
- Re-learning own learnings
- Editing a re-learning after creation (unshare and re-share is the mechanism)
- Re-learning counts on public profiles (anti-vanity — never displayed)
- Notification to original author (requires notification infrastructure — deferred)

---

## Acceptance Criteria

### AC-1 — Re-learn from LearnerProfileScreen
**GIVEN** alice is authenticated and views bob's `LearnerProfileScreen`
**AND** bob has a PUBLIC learning "Rust Lifetimes"
**WHEN** alice taps the Re-learn button on that card
**THEN** `ReLearningModal` opens showing "Rust Lifetimes" preview, a note field, and a visibility picker defaulting to PUBLIC
**WHEN** alice taps "Re-learn" (confirming)
**THEN** `POST /api/v1/poks/{id}/share` is called, the modal closes, and the Re-learn button state reflects that the learning has been shared

---

### AC-2 — Re-learn from LearningDetailScreen
**GIVEN** alice navigates to `LearningDetail` for a PUBLIC learning by bob
**WHEN** the screen renders
**THEN** a "Re-learn" button is visible in the screen actions area
**WHEN** alice taps it
**THEN** `ReLearningModal` opens

---

### AC-3 — No Re-learn on own learning
**GIVEN** alice views her own learning in `LearningDetail`
**THEN** no "Re-learn" button is shown

---

### AC-4 — No Re-learn on non-PUBLIC learning
**GIVEN** alice views a PRIVATE or FOLLOWERS_ONLY learning by bob (if accessible at all)
**THEN** no "Re-learn" button is shown

---

### AC-5 — Visibility tier capping
**GIVEN** the original learning has visibility `FOLLOWERS_ONLY`
**WHEN** `ReLearningModal` opens
**THEN** the visibility picker only shows PRIVATE, COLLEAGUES_ONLY, and FOLLOWERS_ONLY (PUBLIC is absent)
**AND** the default selection is FOLLOWERS_ONLY

---

### AC-6 — Optional note with character counter
**GIVEN** `ReLearningModal` is open
**WHEN** alice types a personal note
**THEN** a character counter below the field shows the current count and the 500 limit (e.g., "23 / 500")
**AND** the field stops accepting input at 500 characters

---

### AC-7 — Duplicate re-learning handled
**GIVEN** alice has already re-learned bob's learning
**WHEN** alice somehow opens `ReLearningModal` and taps "Re-learn" again
**THEN** the modal shows an inline error "You have already re-learned this" (from 409 Conflict)
**AND** the modal does not close

---

### AC-8 — Remove own re-learning from FeedScreen
**GIVEN** alice's social feed contains a `PokShare` item that alice created
**WHEN** alice taps the Remove button on that item
**THEN** a confirmation alert appears ("Remove this re-learning?")
**WHEN** alice confirms
**THEN** `DELETE /api/v1/poks/shared/{shareId}` is called and the card is removed from the feed

---

### AC-9 — Remove button absent on others' re-learnings
**GIVEN** alice's social feed contains a `PokShare` item created by bob
**THEN** no Remove button is shown (alice is not the sharer)

---

### AC-10 — Cancel dismisses modal without side effects
**GIVEN** `ReLearningModal` is open with a note typed
**WHEN** alice taps "Cancel"
**THEN** the modal closes with no API call made and no state change

---

### AC-11 — API error handled inline
**GIVEN** the backend returns a 5xx error when alice submits `ReLearningModal`
**THEN** the modal shows an inline error message
**AND** the modal does not close
**AND** the Share button is re-enabled

---

### AC-12 — No "POK" in UI
**GIVEN** any screen locale (EN or PT-BR)
**WHEN** the user views `ReLearningModal`, the Re-learn button, or the Remove confirmation
**THEN** the string "POK" does not appear in any user-facing text

---

### AC-13 — PT-BR i18n
**GIVEN** the device locale is "pt-BR"
**WHEN** the user opens `ReLearningModal`
**THEN** all labels (title, note placeholder, char counter, visibility label, Share button, Cancel button) are in Brazilian Portuguese

---

### AC-14 — Re-learn appears on FeedScreen after pull-to-refresh
**GIVEN** alice has just successfully re-learned bob's PUBLIC learning
**WHEN** alice navigates to her social `FeedScreen` and pulls-to-refresh
**THEN** the new `PokShare` item is visible in the feed

---

## Screens / Components

### Component: ReLearningModal (new)

**Purpose:** Collect note (optional) and visibility before confirming a re-learn action.

**File:** `mobile/src/components/relearnings/ReLearningModal.tsx`

**Props:**
```typescript
interface ReLearningModalProps {
  visible: boolean;
  originalPokId: string;
  originalTitle: string | null;
  originalContentPreview: string;
  originalVisibility: PokVisibility;   // caps the available visibility options
  onSuccess: (share: PokShare) => void;
  onDismiss: () => void;
}
```

**Layout (top to bottom inside a `Modal` with a semi-transparent backdrop):**
1. Modal container — white/dark-surface panel, rounded top corners, bottom-anchored (sheet style)
2. Header row — "Re-learn this learning" title + close (×) button
3. Original preview — read-only card-like surface showing `originalTitle` (or first 120 chars of content), labelled "Original learning"
4. Note section — `Text` label "Personal note (optional)", multiline `TextInput` (max 500 chars), character counter below
5. Visibility section — `Text` label "Who can see your re-learning?", `VisibilityPicker` (filtered to ≤ original tier)
6. Action row — "Cancel" (secondary) and "Re-learn" (primary, loading while submitting)
7. Inline error message (shown below action row when submission fails)

**States:**
- Default: note empty, visibility = original's visibility
- Typing note: char counter updates live
- Submitting: Re-learn button shows spinner, disabled; Cancel button disabled
- Error: inline `ErrorMessage` below buttons, Re-learn button re-enabled
- 409 Conflict: specific message "You have already re-learned this"

**i18n:** Uses `relearnings.modal.*` and `relearnings.*` keys (see i18n table below).

**Accessibility:**
- `Modal` wraps content in `accessibilityViewIsModal={true}`
- Header title has `accessibilityRole="header"`
- Note `TextInput` has `accessibilityLabel={t('relearnings.modal.noteLabel')}`
- Character counter `Text` has `accessibilityLabel={t('relearnings.modal.charCounterLabel', { current, max: 500 })}`
- Re-learn button: `accessibilityLabel={t('relearnings.modal.confirm')}`, `accessibilityRole="button"`
- Cancel button: `accessibilityLabel={t('relearnings.modal.cancel')}`, `accessibilityRole="button"`
- Close (×) button: `accessibilityLabel={t('relearnings.modal.close')}`, `accessibilityRole="button"`

---

### Modified Screen: LearningDetailScreen

**Changes:**
- When `pok.userId !== currentUser.id` (another user's learning) **AND** `pok.visibility === 'PUBLIC'`:
  - Show a "Re-learn" `Button` in the actions area (alongside Edit/Delete which are absent for others' learnings)
  - Tapping opens `ReLearningModal` with the current pok's details
  - On `onSuccess`: button reflects completion (disabled or replaced with "Re-learned" label)
- When `pok.userId === currentUser.id`: no Re-learn button (unchanged; Edit/Delete remain)
- When `pok.visibility !== 'PUBLIC'`: no Re-learn button (non-public learnings cannot be re-learned)

**New state:**
```typescript
const [reLearningModalVisible, setReLearningModalVisible] = useState(false);
const [hasRelearned, setHasRelearned] = useState(false);
```

---

### Modified Screen: LearnerProfileScreen (from mobile-social-discovery.md)

**Changes:**
- The learning list (`FlatList` of `LearningCard`) gains a per-item Re-learn action button
- The button is rendered below each `LearningCard` when:
  - The authenticated user is NOT the profile owner, AND
  - The learning's `visibility === 'PUBLIC'`
- Tapping the Re-learn button opens `ReLearningModal` for that learning
- On `onSuccess`: the specific card's Re-learn button is disabled or labelled "Re-learned"

**Implementation note:** Since `LearnerProfileScreen` renders a flat list of the profile owner's learnings, the Re-learn button can be included as a pressable row below each card in the `renderItem` function, without a separate card wrapper component.

---

### Modified Screen: FeedScreen

**Changes:**
- In the `shared` item render path: add a Remove button when `item.sharedByHandle === currentUser.handle`
- Remove button triggers `Alert.alert` for confirmation, then calls `unshareLearning(item.id)`
- On confirmation and API success: remove the item from the `items` list (optimistic removal via `setItems` or by triggering a `refresh()`)

**Remove button placement:** In the existing re-learning footer area (`learnings.socialFeed.by @handle` row), add a small "Remove" text button or icon button aligned to the right.

---

## Implementation Approach

### Architecture

**Layer 1 — API (pure TypeScript, `lib` jest project):**

Extend `mobile/src/lib/learnerApi.ts`:

```typescript
export interface ShareLearningRequest {
  note?: string | null;     // max 500 chars, optional
  visibility: PokVisibility; // required; backend validates tier ≤ original's tier
}

/**
 * Create a re-learning of another user's PUBLIC learning.
 * POST /api/v1/poks/{pokId}/share
 * Returns the created PokShare (201).
 * Throws ApiRequestError on 400 (bad visibility), 404 (not found), 409 (already shared).
 */
export function shareLearning(
  pokId: string,
  body: ShareLearningRequest
): Promise<PokShare> {
  return apiFetch<PokShare>(`/poks/${pokId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Remove a re-learning.
 * DELETE /api/v1/poks/shared/{shareId}
 * Returns void (204).
 * Throws ApiRequestError on 403 (not owner), 404 (not found).
 */
export function unshareLearning(shareId: string): Promise<void> {
  return apiFetch<void>(`/poks/shared/${shareId}`, { method: 'DELETE' });
}
```

**Layer 2 — Component (`components` jest project):**
- `ReLearningModal` at `mobile/src/components/relearnings/ReLearningModal.tsx`
- `VisibilityPicker` at `mobile/src/components/relearnings/VisibilityPicker.tsx` (if not already from a sibling spec)

**Layer 3 — Screen modifications:**
- `LearningDetailScreen` — conditional Re-learn button + modal wiring
- `LearnerProfileScreen` — per-card Re-learn button + modal wiring
- `FeedScreen` — Remove button on own `PokShare` items

### Visibility Tier Ordering

The 4 tiers in order from most to least restrictive:
1. PRIVATE
2. COLLEAGUES_ONLY
3. FOLLOWERS_ONLY
4. PUBLIC

When the original visibility is `tier`, available options are `tiers[0..index(tier)]` inclusive. A helper:

```typescript
const VISIBILITY_ORDER: PokVisibility[] = [
  'PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY', 'PUBLIC'
];

function visibilityOptionsUpTo(max: PokVisibility): PokVisibility[] {
  const maxIdx = VISIBILITY_ORDER.indexOf(max);
  return VISIBILITY_ORDER.slice(0, maxIdx + 1);
}
```

### Test Strategy

- [ ] TDD for `shareLearning()` — success (201), 409 Conflict, 400 Bad Request (lib jest project)
- [ ] TDD for `unshareLearning()` — success (204), 403 Forbidden, 404 Not Found (lib jest project)
- [ ] `ReLearningModal` unit tests (components jest project):
  - Renders with correct initial state (default visibility = original's, note empty)
  - Visibility options capped to original's tier (FOLLOWERS_ONLY original → no PUBLIC option)
  - Char counter updates as user types; note capped at 500 chars
  - Cancel calls `onDismiss` with no API call
  - Submit calls `shareLearning` with correct payload; on success calls `onSuccess`
  - 409 response shows "You have already re-learned this" inline; modal stays open
  - 5xx response shows generic error inline; Re-learn button re-enabled
  - Submitting state: Re-learn button shows loading; both buttons disabled
- [ ] `visibilityOptionsUpTo` helper — unit test for all 4 original visibility tiers (lib jest project)
- [ ] `LearningDetailScreen` render tests (components or rn jest project): Re-learn button shown for PUBLIC other-user learning; absent for own learning; absent for non-PUBLIC

**Maestro E2E flows (new):**
- `mobile/e2e/re-learning-create.yaml` — alice re-learns bob's PUBLIC learning from LearnerProfileScreen; card appears in alice's feed after refresh
- `mobile/e2e/re-learning-remove.yaml` — alice removes her re-learning from FeedScreen; card disappears

### File Changes

**New:**
```
mobile/src/components/relearnings/ReLearningModal.tsx
mobile/src/components/relearnings/VisibilityPicker.tsx     (if not from sibling spec)
mobile/src/components/relearnings/__tests__/ReLearningModal.test.tsx
mobile/e2e/re-learning-create.yaml
mobile/e2e/re-learning-remove.yaml
```

**Modified:**
```
mobile/src/lib/learnerApi.ts
  — Add ShareLearningRequest interface
  — Add shareLearning(pokId, body) function
  — Add unshareLearning(shareId) function

mobile/src/lib/__tests__/learnerApi.test.ts
  — Add tests for shareLearning and unshareLearning

mobile/src/screens/app/LearningDetailScreen.tsx
  — Add Re-learn button + ReLearningModal wiring (own vs. other, PUBLIC only)

mobile/src/screens/app/LearnerProfileScreen.tsx      (from mobile-social-discovery.md)
  — Add Re-learn button per PUBLIC learning card from other users

mobile/src/screens/app/FeedScreen.tsx
  — Add Remove button to own PokShare items with confirmation alert

mobile/src/i18n/locales/en.ts
  — Add relearnings.* namespace

mobile/src/i18n/locales/pt-BR.ts
  — Add relearnings.* namespace (PT-BR translations)
```

---

## i18n Keys

All keys live under the `relearnings.*` namespace, mirroring the web `relearnings.*` namespace.

| Key | EN | PT-BR |
|-----|----|-------|
| `relearnings.relearn` | Re-learn | Re-aprender |
| `relearnings.relearned` | Re-learned | Re-aprendido |
| `relearnings.remove` | Remove re-learning | Remover re-aprendizado |
| `relearnings.removeConfirmTitle` | Remove re-learning? | Remover re-aprendizado? |
| `relearnings.removeConfirmMessage` | This will remove your re-learning from your feed. | Isso removerá seu re-aprendizado do seu feed. |
| `relearnings.removeConfirmOk` | Remove | Remover |
| `relearnings.removeConfirmCancel` | Cancel | Cancelar |
| `relearnings.attributedTo` | Originally by @{handle} | Originalmente por @{handle} |
| `relearnings.modal.title` | Re-learn this learning | Re-aprender este aprendizado |
| `relearnings.modal.originalPreview` | Original learning | Aprendizado original |
| `relearnings.modal.noteLabel` | Personal note (optional) | Nota pessoal (opcional) |
| `relearnings.modal.notePlaceholder` | Add your own context… | Adicione seu contexto… |
| `relearnings.modal.noteHint` | This won't modify the original | Isso não modifica o original |
| `relearnings.modal.charCounter` | {current} / {max} | {current} / {max} |
| `relearnings.modal.charCounterLabel` | {current} of {max} characters | {current} de {max} caracteres |
| `relearnings.modal.visibilityLabel` | Who can see your re-learning? | Quem pode ver seu re-aprendizado? |
| `relearnings.modal.confirm` | Re-learn | Re-aprender |
| `relearnings.modal.cancel` | Cancel | Cancelar |
| `relearnings.modal.close` | Close | Fechar |
| `relearnings.modal.errorDuplicate` | You have already re-learned this | Você já re-aprendeu isso |
| `relearnings.modal.errorGeneric` | Something went wrong. Try again. | Algo deu errado. Tente novamente. |
| `relearnings.visibility.private` | Private | Privado |
| `relearnings.visibility.colleaguesOnly` | Colleagues only | Apenas colegas |
| `relearnings.visibility.followersOnly` | Followers only | Apenas seguidores |
| `relearnings.visibility.public` | Public | Público |

---

## Implementation Plan

### Task 1: Extend learnerApi.ts with share/unshare functions
- **Files:** `mobile/src/lib/learnerApi.ts`, `mobile/src/lib/__tests__/learnerApi.test.ts`
- **Depends on:** _none_
- **Commit:** `feat: add shareLearning and unshareLearning to mobile learnerApi`
- **Stack:** mobile

### Task 2: Add VisibilityPicker component
- **Files:** `mobile/src/components/relearnings/VisibilityPicker.tsx`
- **Depends on:** _none_ (can proceed in parallel with Task 1)
- **Commit:** `feat: add mobile VisibilityPicker component for re-learning modal`
- **Stack:** mobile
- **Note:** Skip if a `VisibilityPicker` already exists from `mobile-4-tier-visibility.md`; reuse that instead.

### Task 3: Add ReLearningModal component
- **Files:** `mobile/src/components/relearnings/ReLearningModal.tsx`, `mobile/src/components/relearnings/__tests__/ReLearningModal.test.tsx`
- **Depends on:** Task 1, Task 2
- **Commit:** `feat: add mobile ReLearningModal component`
- **Stack:** mobile

### Task 4: Wire Re-learn button into LearningDetailScreen
- **Files:** `mobile/src/screens/app/LearningDetailScreen.tsx`
- **Depends on:** Task 3
- **Commit:** `feat: add Re-learn button and modal to LearningDetailScreen`
- **Stack:** mobile

### Task 5: Wire Re-learn button into LearnerProfileScreen
- **Files:** `mobile/src/screens/app/LearnerProfileScreen.tsx`
- **Depends on:** Task 3 and `mobile-social-discovery.md` implementation
- **Commit:** `feat: add per-card Re-learn button to LearnerProfileScreen`
- **Stack:** mobile

### Task 6: Add Remove button for own re-learnings on FeedScreen
- **Files:** `mobile/src/screens/app/FeedScreen.tsx`
- **Depends on:** Task 1
- **Commit:** `feat: add Remove action for own re-learnings on mobile FeedScreen`
- **Stack:** mobile

### Task 7: Add i18n keys
- **Files:** `mobile/src/i18n/locales/en.ts`, `mobile/src/i18n/locales/pt-BR.ts`
- **Depends on:** Task 3 (to finalise the key list)
- **Commit:** `feat: add relearnings i18n keys for mobile (EN + PT-BR)`
- **Stack:** mobile

### Task 8: Add Maestro E2E flows
- **Files:** `mobile/e2e/re-learning-create.yaml`, `mobile/e2e/re-learning-remove.yaml`
- **Depends on:** Task 4, Task 5, Task 6, Task 7
- **Commit:** `test: add Maestro E2E flows for mobile re-learning`
- **Stack:** mobile

---

## Dependencies

**Blocked by:**
- `mobile-social-discovery.md` — `LearnerProfileScreen` must exist (Task 5 depends on it); Tasks 1-4, 6-7 can proceed independently
- Milestone 6.4 (Re-Learning) — ✅ Backend endpoints complete; web implementation done

**Blocks:**
- Milestone 3.4 App Store publishing — full mobile parity with web social features

**External:** None — no new npm packages required.

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `f2f21e9` feat: add relearnings i18n keys for mobile (EN + PT-BR)
- `0b9b55f` feat: add shareLearning and unshareLearning to mobile learnerApi
- `ba4611c` feat: add mobile ReLearningModal component
- `b0da39e` feat: add Re-learn button and modal to LearningDetailScreen
- `98dedb4` feat: add per-card Re-learn button to LearnerProfileScreen
- `f032e23` feat: add Remove action for own re-learnings on mobile FeedScreen
- `e554ce7` test: add Maestro E2E flows for mobile re-learning
- `91cce38` fix: apply review fixes — document any cast, align handleRelearnSuccess signature

### Architectural Decisions
- Task 2 (VisibilityPicker) skipped — component already existed from Wave 4 (`mobile/src/components/ui/VisibilityPicker.tsx`). Reused as-is.
- `visibilityOptionsUpTo` helper exported from `learnerApi.ts` (spec architecture). `visibilityOptionsAbove` (inverse) defined locally in `ReLearningModal` since it is only needed there.
- i18n keys added in a dedicated first commit (before modal component) to avoid hardcoded strings anywhere.
- Re-learn button in `LearnerProfileScreen` uses a plain `TouchableOpacity` inline (not `Button` component) to keep the action lightweight and right-aligned below each card.
- `FeedScreen` Remove action uses optimistic removal via a `Set<string>` of removed IDs rather than triggering a full refresh, satisfying FR14.

### Deviations from Spec
- Task ordering adjusted: Task 7 (i18n) done first (before Task 3) since key list was fully pre-specified in spec — no finalization needed after Task 3.
- `handleRelearnSuccess` in `LearningDetailScreen` ignores the returned `PokShare` (no local feed to update on this screen). Signature accepts `_share: PokShare` to satisfy TypeScript prop type.

### Lessons Learned
- `VISIBILITY_ORDER` const is duplicated between `ReLearningModal` and `learnerApi.ts`. If a future spec needs the inverse helper elsewhere, export `VISIBILITY_ORDER` from `learnerApi.ts` and import it.
