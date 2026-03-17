# Mobile-Web Feature Parity — Execution Plan

> Persistent cross-session plan. Reference via `@mobile/store-assets/mobile-parity-execution-plan.md` in future sessions.
> Created: 2026-03-16 | Branch: develop | Parity table: `mobile/store-assets/web-mobile-feature-parity.md`

## Context

The mobile app is targeting Play Store internal track (Milestone 3.4). Library at Dusk design system migration (Waves 0–2) is complete. The next bottleneck is **feature completeness**. All backend APIs exist; this is purely mobile frontend work.

**Submission gate:** Waves 3, 4, and 6 are **required** before Play Store internal track submission.
**Post-submission updates:** Waves 5 and 7 ship as app updates after initial submission.

---

## Parity Table Corrections (stale as of 2026-03-11)

Three items marked ❌ were implemented on 2026-03-10 via `mobile-social-discovery` spec:
- Social: Discover page → **now ✅** (`DiscoverScreen.tsx`)
- Social: Follow/unfollow → **now ✅** (`FollowButton.tsx`, `learnerApi`)
- Social: Learner profiles → **now ✅** (`LearnerProfileScreen.tsx`)

Update the parity table before starting any wave.

---

## Pre-Work (single session, before any wave)

1. **Update parity table** — fix 3 stale ❌ entries
2. **Write 2 missing specs:**
   - `docs/specs/features/mobile-google-oauth.md` — Google Sign-In on Expo (library evaluation: `expo-auth-session` vs `@react-native-google-signin/google-signin`; LoginScreen button; `googleLoginApi` already exists in `auth.ts`)
   - `docs/specs/features/mobile-sort-options.md` — SortPicker component for My Learnings tab (`useFeedData` already accepts `sortBy`)
3. **Review all 6 specs** via `/review-spec` (can run 2–3 reviews in parallel):

| Spec | Status | Review Priority |
|------|--------|:--------------:|
| `mobile-profile-editing.md` | Planned | High — Wave 3 (required) |
| `mobile-4-tier-visibility.md` | Draft | High — Wave 4 (required) |
| `mobile-re-learning.md` | Draft | High — Wave 6 (required) |
| `mobile-tag-management.md` | Planned (3 tasks left) | Medium — Wave 5 (update) |
| `mobile-google-oauth.md` | New | Medium — Wave 7 (update) |
| `mobile-sort-options.md` | New | Medium — Wave 7 (update) |

---

## Parallel Session Map

```
              ┌─────────────────────────────────────────────┐
              │           PRE-WORK (single session)          │
              │  Update parity table + write 2 specs +       │
              │  /review-spec all 6 specs                    │
              └──────────┬──────────┬──────────┬────────────┘
                         │          │          │
          ┌──────────────┘          │          └──────────────┐
          ▼                         ▼                         ▼
   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
   │  SESSION A   │          │  SESSION B   │          │  SESSION C   │
   │  Wave 3      │          │  Wave 4      │          │  Wave 5      │
   │  Profile     │          │  Visibility  │          │  Tags        │
   │  Editing     │          │  4-tier      │          │  Completion  │
   │  REQUIRED    │          │  REQUIRED    │          │  (update)    │
   │  NO DEPS     │          │  NO DEPS     │          │  NO DEPS     │
   └──────┬───────┘          └──────┬───────┘          └─────────────┘
          │                         │
          │                         ▼
          │                  ┌─────────────┐
          │                  │  SESSION D   │
          │                  │  Wave 6      │
          │                  │  Re-Learning │
          │                  │  REQUIRED    │
          │                  │  DEPENDS ON  │
          │                  │  Wave 4 (B)  │
          │                  └──────┬───────┘
          │                         │
          ▼                         ▼
   ┌────────────────────────────────────────┐
   │         PLAY STORE SUBMISSION          │
   │  Gate: Waves 3 + 4 + 6 merged         │
   └────────────────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  SESSION E   │
                  │  Wave 7      │
                  │  Polish      │
                  │  (Sort +     │
                  │   Google     │
                  │   OAuth)     │
                  │  (update)    │
                  │  NO DEPS     │
                  └─────────────┘
```

### Parallelism Rules

- **Sessions A + B + C** can run simultaneously (no shared files, no deps)
- **Session D** must wait for **Session B** to merge — Re-Learning needs VisibilityPicker
- **Session E** can run any time after specs are written/reviewed
- **Critical path:** Pre-work → A+B parallel → D sequential → Submit

---

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
| Pre-work | — | ⏳ Pending | develop | — |
| 3 — Profile | A | ⏳ Pending | — | — |
| 4 — Visibility | B | ⏳ Pending | — | — |
| 5 — Tags | C | ⏳ Pending | — | — |
| 6 — Re-Learning | D | ⏳ Pending | — | — |
| 7 — Polish | E | ⏳ Pending | — | — |
| **Play Store Submit** | — | ⏳ Blocked by 3+4+6 | — | — |
