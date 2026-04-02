# Android Closed Testing Triage — v1.0.19 (2026-03-26)

## Context

Closed testing review surfaced 9 product issues (items #1–#9: 2 bugs, 7 features/UX) across the learnimo Android app, plus 2 follow-on/process items (#10 notifications, #11 test effectiveness). This plan triages all 11 items, sequences implementation, and identifies which require SDD vs direct fixes.

---

## Progress Tracker

| Session | Items | Branch | Status | PR |
|---------|-------|--------|--------|----|
| S1 | #1 Tag creation bug | `fix/tag-creation-flow` | ✅ Done | #252 |
| S2 | #2 Avatar + #5 Emojis | `fix/avatar-upload` | ✅ Done | #253 |
| S3 | #3+#4 Settings persistence | `feat/settings-persistence` | 🔲 Pending | — |
| S4 | #3+#4 continued (if needed) | `feat/settings-persistence` | 🔲 Pending | — |
| S5 | #6 Tag sort/collapse | `feat/tag-sort-collapse` | 🔲 Pending | — |
| S6 | #8+#9 Auto-resize textarea | `feat/auto-resize-textarea` | ✅ Done | — |
| S7 | #11 Test effectiveness | `chore/test-effectiveness` | 🔲 Pending | — |
| S8 | #7 Social feed own POKs | `feat/social-feed-own-poks` | 🔲 Pending | — |

### Execution Workflow (per session)

```
1. Start on develop
2. Create branch (fix/xxx or feat/xxx)
3. /start-session
4. @docs/plans/closed-testing-triage-v1.0.19.md — "Executing item #N"
5. Direct-fix items → implement directly (steps already detailed below)
   SDD items → /write-spec → /review-spec → /implement-spec
6. /finish-session → PR
7. Update this tracker: Status → ✅ Done, PR → link
```

---

## 1. Triage Table

| # | Issue | Priority | SDD? | Branch Name | Agent(s) | Top 3 Files Affected | Roadmap File |
|---|-------|----------|------|-------------|----------|----------------------|--------------|
| 1 | Tag creation bug (3 sub-bugs) | CRITICAL | No | `fix/tag-creation-flow` | hedy | `LearningDetailScreen.tsx`, `tagApi.ts`, `en.ts` / `pt-BR.ts` | `ROADMAP.phase-1.md` |
| 2 | Avatar upload non-functional | HIGH | No | `fix/avatar-upload` | hedy | `AvatarPicker.tsx`, `ProfileScreen.tsx`, `userApi.ts` | `ROADMAP.phase-1.md` |
| 3 | Settings persistence (theme + locale) | CRITICAL | Yes | `feat/settings-persistence` | hedy, pixl | `ThemeContext.tsx`, `I18nContext.tsx`, `ProfileScreen.tsx` | `ROADMAP.phase-1.md` |
| 4 | Profile save UX (button + feedback) | CRITICAL | No (bundled with #3) | `feat/settings-persistence` | pixl | `ProfileScreen.tsx`, `en.ts`, `pt-BR.ts` | `ROADMAP.phase-1.md` |
| 5 | Skin-tone emojis → neutral symbols | HIGH | No | `chore/neutral-emojis` | pixl | `VisibilityPicker.tsx`, `FeedScreen.tsx`, `LearningDetailScreen.tsx` | `ROADMAP.phase-1.md` |
| 6 | Tags: sort by frequency + collapse/expand top 3 | HIGH | No | `feat/tag-sort-collapse` | pixl, hedy | `LearningDetailScreen.tsx`, `tagApi.ts`, `en.ts` / `pt-BR.ts` | `ROADMAP.phase-1.md` |
| 7 | Social feed: include user's own recent POKs | MEDIUM | Yes | `feat/social-feed-own-poks` | hedy | `useSocialFeedData.ts`, `FeedScreen.tsx`, `learnerApi.ts` | `ROADMAP.phase-1.md` |
| 8 | Auto-resizing content textarea | MEDIUM | No | `feat/auto-resize-textarea` | pixl | `LearningForm.tsx`, `TextInput.tsx` | `ROADMAP.phase-1.md` |
| 9 | Larger default input size | LOW | No | (bundled with #8) | pixl | `LearningForm.tsx` | `ROADMAP.phase-1.md` |
| 10 | Profile activity notifications | MEDIUM | Yes | `feat/profile-notifications` | hedy | TBD (new feature) | `ROADMAP.md` (Phase 4 or 7) |
| 11 | Improve test effectiveness (per-screen enforcement, flow tests, i18n smoke) | HIGH | No | `chore/test-effectiveness` | — | `mobile/jest.config.js`, `mobile/CLAUDE.md`, `web/vitest.config.ts` | `ROADMAP.phase-1.md` |

---

## 2. Settings Persistence Analysis

**Options evaluated:**

| Approach | Pros | Cons |
|----------|------|------|
| A. `AsyncStorage` (device-local) | Simple, fast, no backend change, works offline | Lost on app reinstall; not synced across devices |
| B. Backend `PATCH /users/me/settings` | Already exists for other fields; syncs across devices; survives reinstall | Needs backend schema change (`locale`, `themeOverride` columns); requires network |
| C. Both (backend + local cache) | Best UX: instant local read, eventual backend sync | Most complex; conflict resolution needed |

**Recommendation: Option B — backend-persisted.**

Rationale:
- `PATCH /users/me/settings` already exists and handles `displayName`, `bio`, `profileVisibility`, `defaultPokVisibility`. Adding `locale` and `themeOverride` is a minimal schema extension.
- `AuthContext` already calls `/auth/me` on session init, which returns the user profile. Adding `locale` + `themeOverride` to that response means settings are available immediately after login.
- The `updateUser()` function in `AuthContext` already patches in-memory state — theme/locale contexts can read from `user` object.
- No `AsyncStorage` dependency needed (currently not used anywhere in the app).
- Device locale (`ExpoLocalization.getLocales()`) remains the **fallback default** when the user has no saved preference (first login).
- Theme defaults to `'system'` (matching the device preference) when the user has no saved preference. No change needed in `ThemeContext.tsx` initial state — it already defaults to `'system'`.

**Flow after implementation:**
1. App starts → `AuthContext` loads tokens → calls `/auth/me` → response includes `locale` + `themeOverride`
2. `ThemeContext` reads `user.themeOverride ?? 'system'` (keeps current default — system preference)
3. `I18nContext` reads `user.locale ?? getDeviceLocale()` instead of always using device locale
4. User changes setting on ProfileScreen → `PATCH /users/me/settings` → `updateUser()` → contexts react to updated `user`

---

## 3. Profile Settings Screen Investigation

**Finding:** ProfileScreen has **mixed save semantics** — some fields auto-save, some have explicit Save buttons, and theme/locale have NO save at all.

| Field | Current behavior | What's missing |
|-------|-----------------|----------------|
| Display name | Explicit Save button → `PATCH /users/me/settings` | ✅ Working |
| Bio | Explicit Save button → `PATCH /users/me/settings` | ✅ Working |
| Profile visibility | Auto-save on change → `PATCH /users/me/settings` | ✅ Working |
| Default POK visibility | Auto-save on change → `PATCH /users/me/settings` | ✅ Working |
| Avatar | Auto-upload on pick → `POST /users/me/avatar` | ❓ Needs investigation (see #2) |
| Theme | `setOverride()` → React state only | ❌ No persistence — add auto-save to backend |
| Locale | `setAppLocale()` → React state only | ❌ No persistence — add auto-save to backend |

**Design intent:** The screen was designed for **auto-save on change** for selection-based fields (visibility, theme, locale) and **explicit Save for text fields** (name, bio). Theme and locale were wired to their contexts but the backend persistence step was never implemented.

**Fix approach (bundled in #3):**
- Wire `handleThemeChange` and `handleLocaleChange` to call `updateUserSettings({ themeOverride })` / `updateUserSettings({ locale })` + `updateUser()`, matching the existing auto-save pattern for visibility fields.
- Add success toast/feedback after save (pixl to design).
- Backend: add `locale VARCHAR(5)` and `theme_override VARCHAR(10)` columns to the `users` table via Flyway migration.

---

## 4. Tag Creation Bug — Root Cause Hypothesis

### Sub-bug 1: "Tags created but not attached to POK"

**Hypothesis:** `tagApi.create()` succeeds (returns `newTag`), but `tagApi.assign(pok.id, newTag.tagId)` fails silently or throws. The tag exists globally but is never linked to the POK.

**Most likely cause:** The `tagApi.create()` response shape may not match the `Tag` type — specifically, `newTag.tagId` could be `undefined` if the backend returns `id` but not `tagId`. The assign call then sends `POST /poks/{pokId}/tags/undefined`, which fails.

**Files to verify:**
- Backend `TagController` — what does `POST /tags` return? Does it include `tagId`?
- `tagApi.ts` line where response is typed as `Tag`

### Sub-bug 2: "Error thrown on tag creation"

**Hypothesis:** Same root cause as sub-bug 1. The `tagApi.assign()` call with an invalid `tagId` throws, caught by the generic `catch` block at line 183, which shows `Alert.alert(t('learnings.detail.tagCreateError'))`.

### Sub-bug 3: "Raw i18n placeholder `{tag/name}` displayed"

**Hypothesis:** i18n-js v4 uses `%{name}` syntax for interpolation, not `{name}`. The key `tagCreateNew: 'Create "{name}"'` uses single-brace syntax which i18n-js does NOT interpolate — it renders the literal string `Create "{name}"`. The user likely saw `{name}` (not `{tag/name}` — probable misquote in the issue).

**Fix:** Change the i18n key to `'Create "%{name}"'` in both `en.ts` and `pt-BR.ts`.

**Files to confirm:**
- `mobile/src/i18n/i18n.ts` — verify i18n-js version and interpolation config
- Backend `TagController.java` / `TagService.java` — verify POST /tags response shape

---

## 5. Testing Gap Analysis

| # | Issue | Why tests missed it | Missing test |
|---|-------|---------------------|-------------|
| 1 | Tag creation bug | No `LearningDetailScreen.test.tsx` exists. Tag creation flow (create → assign → state update) is completely untested at the screen level. | Screen-level test: mock `tagApi.create` + `tagApi.assign`, verify tag appears in local state after both succeed; verify error alert when assign fails after create succeeds. |
| 2 | Avatar upload | `AvatarPicker.test.tsx` exists but may not test the full upload→ProfileScreen integration. `ProfileScreen.test.tsx` exists but unclear if it covers avatar flow. | Integration test: mock `expo-image-picker`, verify `uploadAvatar` called with correct params, verify `updateUser({ avatarUrl })` called on success. |
| 3-4 | Settings persistence | `ProfileScreen.test.tsx` likely tests existing save flows but theme/locale have no save logic to test. No test for "settings survive logout/login". | Test: change theme → call `updateUserSettings` with `themeOverride` → verify `updateUser` called. E2E: change theme → logout → login → verify theme persisted. |
| 5 | Skin-tone emojis | Not a functional bug — cosmetic. No test would catch this. | N/A (manual review / snapshot test). |
| 6 | Tag sort/collapse | No test for tag ordering or collapse behavior because the feature doesn't exist yet. | After implementation: test that tags render in frequency-descending order; test collapse shows only 3; test expand shows all. |
| 7 | Social feed own POKs | `useSocialFeedData.test.ts` tests the hook but verifies the current behavior (followed users only). | After implementation: test that feed response includes user's own recent POKs when mixed into social feed. |
| 8-9 | Auto-resize textarea | No `LearningForm.test.tsx`. TextInput wrapper has no auto-resize to test. | After implementation: test that `onContentSizeChange` updates height; verify minimum height. |
| 10 | Notifications | Feature doesn't exist. | TBD with spec. |

---

## 5b. Test Effectiveness Analysis

**The real problem isn't coverage quantity — it's test quality.**

Mobile enforces an 80% global line-coverage threshold in Jest, and every bug in this triage shipped on mobile. The 80% threshold passed because well-tested utility files (`tokenStore`, `api.ts`, `stripMarkdown`, hooks) mask zero-coverage screens. Coverage measures lines executed, not behaviors verified.

**What failed for each bug:**

| Bug | Coverage status | Why it shipped |
|-----|----------------|----------------|
| Tag creation (3 sub-bugs) | `LearningDetailScreen` has **0% coverage** — no test file exists | Global 80% hides it because `lib/` and `hooks/` are heavily tested |
| Avatar upload | `AvatarPicker.test.tsx` exists, coverage passes | The Android skip-permission path is covered (`it('skips permission check on Android and launches picker directly')`), but the **upload→ProfileScreen integration** (image picked → upload API called → avatar state updated) is not tested end-to-end |
| Settings persistence | `ProfileScreen.test.tsx` exists, coverage passes | Tests verify UI rendering and existing save handlers, but **theme/locale have no save logic to test** — the gap is in the code, not just the tests |

**Root causes:**
1. **No per-screen coverage enforcement** — a screen with 0 tests passes CI as long as the global average holds
2. **Happy-path-only testing** — tests verify "it works when everything is right" but not "it fails gracefully when the platform behaves differently" (Android 13+ permission model)
3. **No multi-step flow tests** — tag creation is a two-API-call sequence (create → assign); no test verifies the full chain, including partial failure (create succeeds, assign fails)
4. **Missing i18n interpolation tests** — the `%{name}` vs `{name}` syntax bug would be caught by a single assertion: `expect(t('learnings.detail.tagCreateNew', { name: 'foo' })).toBe('Create "foo"')`

**Proposal — improve test effectiveness, not just thresholds:**

### A. Mandatory screen test files (enforcement)
Add a lint rule or CI check: every file in `mobile/src/screens/` must have a corresponding `__tests__/*.test.tsx`. A screen with 0 tests should fail CI regardless of global coverage. Implementation: a simple shell script in CI that diffs screen files against test files.

### B. Per-directory coverage thresholds (Jest)
Jest supports per-path `coverageThreshold`. Add minimums for the weakest areas:
```js
coverageThreshold: {
  global: { lines: 80 },
  './src/screens/': { lines: 80 },
  './src/components/': { lines: 80 },
}
```
This prevents high-coverage libs from subsidizing untested screens. All directories held to the same 80% standard.

### C. Multi-step flow test pattern (new convention)
For any screen with sequential API calls (create → assign, upload → update, save → refresh), require at least:
1. Happy path (both calls succeed)
2. Partial failure (first succeeds, second fails — verify rollback/error UX)
3. Full failure (first fails — verify no side effects)

Add this as a convention in `mobile/CLAUDE.md` "Testing" section.

### D. Platform-conditional test cases
For any code guarded by `Platform.OS`, require test variants for each platform. Jest supports `jest.mock('react-native/Libraries/Utilities/Platform', ...)` to switch platforms per test.

### E. i18n interpolation smoke tests
Add a test file `mobile/src/i18n/__tests__/interpolation.test.ts` that calls `t()` with every interpolated key and asserts the placeholder is resolved (no raw `%{...}` or `{...}` in output). This is a one-time setup that catches syntax mismatches forever.

### F. Web threshold (secondary)
The web 50% threshold should still be raised — but as a byproduct of writing better tests, not as the goal. Raise to 65% now (conservative), targeting 80% as screens get tested.

**Implementation (branch `chore/test-effectiveness`):**
1. Write the screen-test-file audit script (`scripts/check-screen-tests.sh`)
2. Add per-directory `coverageThreshold` to `mobile/jest.config.js`
3. Create `mobile/src/i18n/__tests__/interpolation.test.ts` with smoke tests for all interpolated keys
4. Add multi-step flow test convention to `mobile/CLAUDE.md`
5. Raise `web/vitest.config.ts` threshold from 50% → 65%
6. Write any gap-closing tests needed for per-directory thresholds to pass

---

## 6. Recommended Implementation Sequence

1. **`fix/tag-creation-flow`** (CRITICAL, no deps, ~1 session)
   - Unblocks core CRUD. Direct bug fix, no SDD needed.

2. **`fix/avatar-upload`** (HIGH, no deps, ~0.5 session)
   - Investigate whether the Android 13+ permission issue (`requestMediaLibraryPermissionsAsync` returning `denied` without `READ_MEDIA_IMAGES`) is the cause. Memory note already documents this exact pattern.

3. **`feat/settings-persistence`** (CRITICAL, needs backend migration, ~2 sessions)
   - SDD required: backend schema change + multi-context wiring + save UX.
   - Includes #4 (profile save feedback) — same branch.
   - Blocks: nothing, but improves UX for all subsequent testing.

4. **`chore/neutral-emojis`** (HIGH, no deps, ~0.5 session)
   - Mechanical replacement. Can be done in parallel with #3.

5. **`feat/tag-sort-collapse`** (HIGH, depends on #1 being fixed, ~1 session)
   - Direct fix. Needs tag creation working first to test properly.

6. **`feat/auto-resize-textarea`** (MEDIUM, no deps, ~0.5 session)
   - Bundles #9 (larger default). Simple `onContentSizeChange` handler.

7. **`feat/social-feed-own-poks`** (MEDIUM, needs SDD, ~1-2 sessions)
   - Requires backend API change or client-side merge of two feeds.

8. **`chore/test-effectiveness`** (HIGH, no deps, ~1-2 sessions)
   - Per-screen coverage enforcement, multi-step flow test convention, i18n interpolation smoke tests, per-directory thresholds. Can be done in parallel with #6 or #7.

9. **`feat/profile-notifications`** (MEDIUM, needs SDD, future phase)
   - Not Phase 1. Route to Phase 4 (Growth) or Phase 7 (Gamification).

---

## 7. SDD Items

| Branch | Spec Path | Feature Goal | Highest-Risk AC |
|--------|-----------|--------------|-----------------|
| `feat/settings-persistence` | `docs/specs/features/settings-persistence.md` | Persist user theme and locale preferences across sessions via backend storage | AC: User sets theme to dark → logs out → logs back in → theme is still dark; new user with no saved preference sees system theme (requires backend migration + context init from `/auth/me` response) |
| `feat/social-feed-own-poks` | `docs/specs/features/social-feed-own-poks.md` | Intermix user's own recent learnings into the social feed tab | AC: Social feed shows the user's 5 most recent POKs mixed chronologically with followed users' POKs (requires either backend feed endpoint change or client-side merge with dedup) |
| `feat/profile-notifications` | `docs/specs/features/profile-notifications.md` | Notify users of activity on their profile (follows, re-learnings) | AC: User receives in-app notification when another user follows them (requires new notification entity, backend event system, mobile polling or push) |

---

## 8. Direct-Fix Items

### #1 — `fix/tag-creation-flow` (hedy)
1. **Verify backend response shape:** Read `TagController.java` POST /tags — confirm whether response includes `tagId` field matching `Tag` TypeScript type
2. **Fix i18n interpolation:** Change `tagCreateNew` from `'Create "{name}"'` to `'Create "%{name}"'` in both `en.ts` and `pt-BR.ts` (i18n-js v4 uses `%{}` syntax)
3. **Fix assign call:** If `tagId` is missing from create response, map `newTag.id` → `newTag.tagId` or fix the backend DTO
4. **Add error discrimination:** In `handleCreateTag` catch block, distinguish create-failure from assign-failure to show appropriate message
5. **Add test:** Create `LearningDetailScreen.test.tsx` with tests for create-tag-and-assign happy path and failure paths

### #2 — `fix/avatar-upload` (hedy) ✅ Done — PR #253

1. ~~**Check Android 13+ permission path:** `AvatarPicker.tsx` calls `requestMediaLibraryPermissionsAsync()` — on Android 13+ without `READ_MEDIA_IMAGES` in manifest, this returns `denied` and aborts.~~ → **Already implemented:** `AvatarPicker.tsx` gates `requestMediaLibraryPermissionsAsync()` behind `Platform.OS === 'ios'`; Android uses Photo Picker without requesting media permissions.
2. ~~**Fix:** Gate permission request behind `Platform.OS === 'ios'`. Android 13+ Photo Picker needs no permissions.~~ → **Already landed** in `AvatarPicker.tsx`. `AvatarPicker.test.tsx` covers the Android skip-permission path.
3. ~~**Verify `expo-image-picker` plugin registration:** Check `app.json` for `["expo-image-picker", { "microphonePermission": false }]`~~ → **Done:** plugin registered in `app.json` with `microphonePermission: false`.
4. **Remaining investigation:** If avatar upload is still broken after the above, trace the upload→persistence flow: `AvatarPicker` → upload request → API response → `ProfileScreen` state update. Confirm (a) image is uploaded, (b) backend returns new avatar URL, (c) UI state is updated and persists after app restart.

### #5 — `chore/neutral-emojis` (pixl)
1. **Audit:** `VisibilityPicker.tsx` uses 🔒🤝👥🌐; `FeedScreen.tsx` uses 🔍; `LearningDetailScreen.tsx` uses 🔒
2. **Replace:** 🤝 → handshake icon or text label; 👥 → group icon; 🔍 → magnifying glass icon. Use `@expo/vector-icons` (Ionicons/MaterialIcons) instead of emoji literals.
3. **Note:** 🔒 and 🌐 are object emojis without skin tones — may be fine to keep. Confirm with user.
4. **Update tests:** Update `VisibilityPicker.test.tsx` assertions if icon rendering changes

### #6 — `feat/tag-sort-collapse` (pixl + hedy)
1. **Backend:** Check if `GET /tags` returns usage count. If not, add `pokCount` field to tag response (or compute client-side from POK data).
2. **Sort:** In `LearningDetailScreen.tsx` tag display, sort `pok.tags` by usage frequency descending
3. **Collapse:** Show only top 3 tags by default. Add "Show all (N)" / "Show less" toggle below the 3rd tag pill.
4. **i18n:** Add `showAllTags` / `showLessTags` keys to `en.ts` and `pt-BR.ts`
5. **Test:** Verify sort order and collapse/expand behavior

### #11 — `chore/test-effectiveness`
1. **Screen-test audit script:** Create `scripts/check-screen-tests.sh` — for every `*.tsx` in `mobile/src/screens/`, assert a corresponding `__tests__/*.test.tsx` exists. Fail CI if missing.
2. **Per-directory coverage thresholds:** Add to `mobile/jest.config.js`: `'./src/screens/': { lines: 80 }`, `'./src/components/': { lines: 80 }`. Run coverage to identify gaps.
3. **i18n interpolation smoke tests:** Create `mobile/src/i18n/__tests__/interpolation.test.ts` — iterate all keys with `%{...}` placeholders, call `t()` with test values, assert no raw placeholders in output.
4. **Multi-step flow convention:** Add testing convention to `mobile/CLAUDE.md` — any screen with sequential API calls must have happy-path, partial-failure, and full-failure tests.
5. **Platform-conditional convention:** Add to `mobile/CLAUDE.md` — any `Platform.OS` branching must have per-platform test variants.
6. **Web threshold bump:** Raise `web/vitest.config.ts` from 50% → 65%. Write gap-closing tests if needed.
7. **Gap-closing tests:** Write minimal tests for screens with 0 coverage to pass the new per-directory thresholds.

### #8+9 — `feat/auto-resize-textarea` (pixl)
1. **Increase default:** Change `minHeight: 160` → `minHeight: 200` and `numberOfLines: 8` → `numberOfLines: 10` in `LearningForm.tsx`
2. **Add auto-resize:** Add `onContentSizeChange` handler to content `TextInput` that dynamically sets height: `onContentSizeChange={(e) => setContentHeight(Math.max(200, e.nativeEvent.contentSize.height))}`
3. **Cap max height:** Set `maxHeight: 400` to prevent the textarea from consuming the entire screen
4. **Test:** Verify textarea grows as user types and respects min/max bounds

---

## 9. Roadmap Entries

### `docs/ROADMAP.phase-1.md` — Add new milestone section

```markdown
### Milestone 1.8 — Closed Testing Fixes (2026-03-26)

| Item | Status | Branch |
|------|--------|--------|
| Fix tag creation flow (create + attach + i18n) | 🔲 Planned | `fix/tag-creation-flow` |
| Fix avatar upload on Android 13+ | 🔲 Planned | `fix/avatar-upload` |
| Persist theme + locale settings (backend + contexts) | 🔲 Planned | `feat/settings-persistence` |
| Profile save UX (feedback on setting changes) | 🔲 Planned | `feat/settings-persistence` |
| Replace skin-tone emojis with neutral symbols | 🔲 Planned | `chore/neutral-emojis` |
| Tag sort by frequency + collapse/expand top 3 | 🔲 Planned | `feat/tag-sort-collapse` |
| Social feed: include user's own recent learnings | 🔲 Planned | `feat/social-feed-own-poks` |
| Auto-resizing + larger content textarea | 🔲 Planned | `feat/auto-resize-textarea` |
| Test effectiveness: per-screen enforcement, flow tests, i18n smoke | 🔲 Planned | `chore/test-effectiveness` |
```

### `docs/ROADMAP.md` — Add to future phase placeholder

```markdown
#### Phase 4 — Growth (or Phase 7 — Gamification)
- [ ] Profile activity notifications (follows, re-learnings) — `feat/profile-notifications`
```

---

## Verification

After all branches are merged:
1. Create a new learning → open tag modal → create a new tag → verify tag is attached and displayed with correct label
2. Go to Profile → tap avatar → pick image → verify upload succeeds and avatar updates
3. Change theme to light → change locale to pt-BR → logout → login → verify both persist
4. Check all visibility pickers — no skin-tone emojis visible
5. On detail screen, verify tags sorted by frequency, only 3 shown, expand/collapse works
6. On social feed tab, verify user's own recent learnings appear intermixed
7. On Save Learning screen, type a long note → verify textarea grows automatically
8. Run `cd mobile && npm test -- --no-coverage` — all tests pass
