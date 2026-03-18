# Mobile Parity Execution Plan - Waves 3-7

## Wave 3 — Profile & Identity (Session A) — REQUIRED

**Spec:** `docs/specs/features/mobile-profile-editing.md` (5 tasks)
**Branch:** `feat/mobile-profile-editing`
**Command:** `/implement-spec docs/specs/features/mobile-profile-editing.md`

| Task | Description |
|------|-------------|
| 1 | `AuthContext.updateUser(patch)` for immediate state sync |
| 2 | `AvatarPicker` component (`expo-image-picker` + upload/remove) |
| 3 | i18n keys (EN + PT-BR) |
| 4 | ProfileScreen inline editing (displayName, bio, avatar) |
| 5 | Maestro E2E flow |

**Key files:** `AuthContext.tsx`, `ProfileScreen.tsx`, new `AvatarPicker.tsx`, `userApi.ts` (existing), i18n locales

---

## Wave 4 — Visibility Upgrade (Session B) — REQUIRED

**Spec:** `docs/specs/features/mobile-4-tier-visibility.md` (6 tasks)
**Branch:** `feat/mobile-4-tier-visibility`
**Command:** `/implement-spec docs/specs/features/mobile-4-tier-visibility.md`

| Task | Description |
|------|-------------|
| 1 | Clean up duplicate `PokVisibility` type (consolidate in `pokApi.ts`) |
| 2 | `VisibilityPicker` + `VisibilityBadge` shared components |
| 3 | Wire into `LearningNewScreen` |
| 4 | Wire into `LearningDetailScreen` |
| 5 | Wire into `ProfileScreen` settings |
| 6 | i18n keys |

**Key files:** `pokApi.ts`, new `VisibilityPicker.tsx`, new `VisibilityBadge.tsx`, `LearningNewScreen.tsx`, `LearningDetailScreen.tsx`, `ProfileScreen.tsx`, i18n locales

---

## Wave 5 — Tag Completion (Session C) — POST-SUBMISSION UPDATE

**Spec:** `docs/specs/features/mobile-tag-management.md` (remaining tasks TM-2, TM-3, TM-4)
**Branch:** `feat/mobile-tag-completion`
**Command:** `/implement-spec docs/specs/features/mobile-tag-management.md` (partial — TM-2/3/4 only)

| Task | Description |
|------|-------------|
| TM-2 | `TagSuggestionBanner` on LearningDetailScreen |
| TM-3 | Post-save redirect from LearningNewScreen → LearningDetailScreen |
| TM-4 | Tag filter chip row on FeedScreen My Learnings tab |

**Key files:** new `TagSuggestionBanner.tsx`, `LearningNewScreen.tsx`, `LearningDetailScreen.tsx`, `FeedScreen.tsx`, i18n locales

---

## Wave 6 — Re-Learning (Session D) — REQUIRED, depends on Wave 4

**Spec:** `docs/specs/features/mobile-re-learning.md` (8 tasks)
**Branch:** `feat/mobile-re-learning`
**Command:** `/implement-spec docs/specs/features/mobile-re-learning.md`
**Prerequisite:** Wave 4 (Session B) must be merged — `VisibilityPicker` component is imported.

| Task | Description |
|------|-------------|
| 1 | `shareLearning()`/`unshareLearning()` in learnerApi |
| 2 | Import `VisibilityPicker` from Wave 4 |
| 3 | `ReLearningModal` (note field + visibility picker) |
| 4 | Re-learn button on `LearningDetailScreen` (for others' public learnings) |
| 5 | Re-learn button on `LearnerProfileScreen` |
| 6 | Remove button on own re-learnings in `FeedScreen` |
| 7 | i18n keys |
| 8 | Maestro E2E flow |

---

## Wave 7 — Polish (Session E) — POST-SUBMISSION UPDATE

**Specs:** `mobile-sort-options.md` + `mobile-google-oauth.md` (written in pre-work)
**Branch:** `feat/mobile-polish`

| Task | Description |
|------|-------------|
| 1 | `SortPicker` component wired to `useFeedData.sortBy` |
| 2 | Google OAuth button on LoginScreen |

---

## Deferred (post-launch, no spec needed)

| Gap | Justification |
|-----|--------------|
| **Quick Entry** | NewLearning tab is 1 tap from feed. Adequate for launch. |
| **Timeline view** | Feed already shows chronological order with date headers. |
| **Tag-grouped view** | Power-user feature. Low ROI for launch. |
| **Reset password (native)** | Deep link to web reset page works. |

---

## Verification (per wave)

1. `cd mobile && npm test -- --no-coverage --selectProjects lib` (unit tests)
2. `cd mobile && npm run test:coverage` (coverage ≥ 80%)
3. Manual smoke test on Expo Go (Android)
4. Update `web-mobile-feature-parity.md` to flip ❌ → ✅
5. `/finish-session` to record outcomes

---

## Progress Tracker

Update this section as waves complete:

| Wave | Session | Status | Branch | PR |
|------|---------|--------|--------|----|
| Pre-work | — | ✅ Done (2026-03-17) | develop | — |
| 3 — Profile | A | ⏳ Pending | — | — |
| 4 — Visibility | B | ⏳ Pending | — | — |
| 5 — Tags | C | ⏳ Pending | — | — |
| 6 — Re-Learning | D | ✅ Done (2026-03-17) | feat/mobile-re-learning | — |
| 7 — Polish | E | ⏳ Pending | — | — |
| **Play Store Submit** | — | ⏳ Blocked by 3+4+6 | — | — |
