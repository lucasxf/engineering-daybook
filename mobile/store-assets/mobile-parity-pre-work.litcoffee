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
