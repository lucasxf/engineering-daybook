# Phase 3: AI & Mobile

> Status: **🔄 In Progress** (3.1, 3.3 complete; 3.4 in progress)

---

**Goal:** Add semantic search, AI insights, and mobile app.

---

## Completed

### Milestone 3.1: Semantic Search ✅ (2026-02-26)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 3.1.1 | Generate embeddings for POKs | Must Have | ✅ Done |
| 3.1.2 | pg_vector similarity search | Must Have | ✅ Done |
| 3.1.3 | Hybrid search (keyword + semantic) | Should Have | ✅ Done |
| 3.1.4 | Search relevance tuning | Should Have | ✅ Done (cosine distance tuning via hybrid weight) |

**Implementation notes:**
- `pgvector-java` dependency + Flyway V12 migration enabling `vector` extension and `embedding` column (384 dims)
- `VectorAttributeConverter` — custom JPA converter: `float[]` ↔ PostgreSQL `vector` via `@ColumnTransformer`
- `HuggingFaceEmbeddingService` — calls Inference API with configurable retry (no backoff; retries on 5xx/network, fails fast on 4xx); guarded by `@ConditionalOnMissingBean` to allow test overrides
- `@EnableAsync` on `EdApplication`; embedding generation is `@Async` on POK create/update — non-blocking, backfill-safe
- Semantic search uses cosine distance (`<=>` operator) in `PokRepository` native query; hybrid search blends keyword `ILIKE` + vector similarity ranking
- Admin backfill endpoint: `POST /api/v1/admin/poks/backfill-embeddings` (protected by `X-Internal-Key` header, `@Hidden` from public OpenAPI)
- Web: `SearchMode` type + `searchMode: 'hybrid'` hardcoded in `usePoksData`; semantic-aware `NoSearchResults` hint text; i18n keys EN + PT-BR
- 4 integration tests (`SemanticSearchIntegrationTest`) + unit tests for `pokApi`, `usePoksData`, `NoSearchResults`; 2 new Playwright E2E scenarios

---

### Milestone 3.3: Mobile App ✅ (2026-02-27)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 3.3.1 | Expo project setup | Must Have | ✅ Done |
| 3.3.2 | Authentication (reuse web logic) | Must Have | ✅ Done |
| 3.3.3 | List and search learnings (feed) | Must Have | ✅ Done |
| 3.3.4 | Create learning (mobile-optimized) | Must Have | ✅ Done |
| 3.3.5 | Dark mode | Must Have | ✅ Done |
| 3.3.6 | i18n (EN/PT-BR) | Must Have | ✅ Done |
| 3.3.7 | Push notifications | Could Have | ⏳ Deferred to Milestone 3.4+ |

**Implementation notes:**
- Expo SDK 53, React Native 0.76, TypeScript strict mode, managed workflow
- `tokenStore.ts` — in-memory cache + `expo-secure-store` JWT persistence; survives app restart
- `apiFetch` — Bearer header injection, 401 → silent refresh → retry; double-401 fires `authFailureListener` to clear tokens and set unauthenticated state
- Two-project jest config (`lib` node env + `rn` jest-expo) required due to Node 22 + RN 0.76 incompatibility: `jest-expo`'s setup file calls `Object.defineProperty` on RN internals that fail under Node 22
- `testRegex` instead of `testMatch` — `<rootDir>` glob substitution breaks in `.claude/worktrees/` paths on Windows (the `\.claude` segment causes micromatch to fail); `testRegex` is path-relative and avoids the issue
- 39 unit tests across `tokenStore`, `api`, `authContext`, `useFeedData`, `useDebounce`
- 3 Maestro E2E YAML flows: `auth-login.yaml`, `learning-create.yaml`, `session-persistence.yaml`

---

### Milestone 3.4: App Store Publishing — Android (In Progress, 2026-03-08)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 3.4.1 | Apple Developer Program enrollment + provisioning profiles | Must Have | ⏳ Deferred (iOS-second strategy) |
| 3.4.2 | Google Play Console setup + signing keystore | Must Have | ✅ Done (2026-03-08) |
| 3.4.3 | App store metadata: screenshots, descriptions, privacy policy (EN + PT-BR) | Must Have | ✅ Done (2026-03-08) |
| 3.4.4 | EAS Build production profile — Android `.aab` | Must Have | ✅ Done — Android (2026-03-08); iOS deferred |
| 3.4.5 | TestFlight internal distribution (iOS) | Must Have | ⏳ Deferred (no Apple Developer enrollment yet) |
| 3.4.6 | Play Store internal track distribution (Android) | Must Have | 🔄 In Progress — Play Console forms being filled |
| 3.4.7 | Apple App Store Review submission + approval | Should Have | ⏳ Deferred |
| 3.4.8 | Google Play Store public release | Should Have | ⏳ Deferred |

**Implementation notes:**
- EAS Build cloud service (Expo Application Services) used for managed signing and CI builds — no local Gradle invocation needed
- `appVersionSource: remote` in `eas.json` — EAS manages Android `versionCode` automatically; do not set it in `app.json`
- Root `mobile/App.tsx` required by `expo/AppEntry.js` — `node_modules/expo/AppEntry.js` resolves `../../App` (two levels up from inside `node_modules/expo/`). Project has `src/App.tsx`; root `App.tsx` re-exports it: `export { default } from './src/App';`
- `mobile/.npmrc` with `legacy-peer-deps=true` required — EAS runs `npm ci` in strict mode; without `.npmrc`, peer dep conflicts (e.g. `react-test-renderer` version mismatch) cause `ERESOLVE` failures on the build server
- Package upgrades applied for SDK 53 compatibility: React 18→19, React Native 0.76→0.79, all Expo SDK 53 packages; `npm install --legacy-peer-deps` used (not `expo install --check`, which itself fails with ERESOLVE)
- Privacy policy deployed at `https://learnimo.net/en/privacy` (and `/pt-BR/privacy`); includes `#delete-account` anchor as required by Play Store data safety form
- Android package name: `net.learnimo.app`; EAS project: `@lucasxf/learnimo` (UUID `9c453fb8-107d-40db-bb84-4cd9ca18c3a7`)
- Production `.aab` artifact: `https://expo.dev/artifacts/eas/2svV1cBny8Fri4ULvGYnC5.aab`
- Android-first strategy: iOS deferred pending Apple Developer Program enrollment

**Progress update (2026-03-09):**
- Mobile feature parity table (`mobile/store-assets/web-mobile-feature-parity.md`) audited and updated: social discovery feed row corrected (split into social following feed ✅/✅ and Discover page ✅/❌); 3 new rows added (My Learnings personal feed, Search bar UI, Social: Discover page learner search); gap descriptions sharpened for follow/unfollow, learner profiles, and re-learning.
- Six mobile feature parity specs written and ready for implementation via `/implement-spec`:
  1. `docs/specs/features/mobile-profile-editing.md` — edit displayName, bio, and avatar on ProfileScreen
  2. `docs/specs/features/mobile-my-learnings.md` — personal feed tab with search and sort controls
  3. `docs/specs/features/mobile-social-discovery.md` — follow/unfollow, LearnerProfileScreen, DiscoverScreen, FollowButton
  4. `docs/specs/features/mobile-tag-management.md` — tag add/remove, tag-at-creation, AI suggestions, tag filter
  5. `docs/specs/features/mobile-4-tier-visibility.md` — expand 2-tier to 4-tier visibility on mobile (FOLLOWERS_ONLY, COLLEAGUES_ONLY)
  6. `docs/specs/features/mobile-re-learning.md` — share/unshare learnings, ReLearningModal, attribution display
- Recommended implementation order: (1) mobile-profile-editing → (2) mobile-my-learnings → (3) mobile-4-tier-visibility → (4) mobile-tag-management → (5) mobile-social-discovery → (6) mobile-re-learning. Social discovery depends on follow/unfollow wiring that lands in step 5; re-learning depends on visibility cascade enforcement from step 3.

**Progress update (2026-03-10 — spec orchestration prep):**
- Added `## Implementation Plan` sections (orchestrator/subagent task breakdown) to two mobile specs that were previously in legacy mode, making them ready for `/implement-spec` dispatch:
  - `docs/specs/features/mobile-tag-management.md` — 7-task implementation plan (useTags hook → TagPicker → TagSuggestionBanner → post-save navigation → tag operations on detail → tag filter on My Learnings → i18n keys)
  - `docs/specs/features/mobile-4-tier-visibility.md` — 6-task implementation plan (type cleanup → VisibilityPicker/Badge components → 4-tier pickers on new/detail/profile screens → i18n keys)
- Other two specs (`mobile-social-discovery.md` and `mobile-re-learning.md`) already had proper Implementation Plan sections and required no changes.

**Progress update (2026-03-13 — mobile visual parity strategy):**
- Mobile stack development strategy documented at `.claude/plans/mobile-stack-dev-strategy.md` (branch: `chore/mobile-stack-dev-strategy`).
- Analyzed "Library at Dusk" design language from the v0-redesigned web app and evaluated 4 approaches to bringing the mobile app to visual parity.
- Recommended approach: **Skill-driven (Approach D)** — build a `mobile-design-system` skill, update `tokens.ts` first, then patch (not rebuild) all 8 existing screens incrementally. Avoids a full screen rebuild while establishing a reusable design token foundation.

**Progress update (2026-03-17 — pre-work complete, all specs approved):**
- Parity table (`mobile/store-assets/web-mobile-feature-parity.md`) corrected: 3 stale ❌ → ✅ (Discover page, Follow/unfollow, Learner profiles — implemented 2026-03-10 via mobile-social-discovery).
- 2 new specs written, reviewed, and approved: `mobile-google-oauth.md` (Wave 7), `mobile-sort-options.md` (Wave 7).
- All 6 mobile feature parity specs reviewed via `/review-spec` + fixed via `/fix-spec` and marked **Approved**:
  - `mobile-profile-editing.md` ✅ Approved (Wave 3 — REQUIRED)
  - `mobile-4-tier-visibility.md` ✅ Approved (Wave 4 — REQUIRED)
  - `mobile-re-learning.md` ✅ Approved (Wave 6 — REQUIRED)
  - `mobile-tag-management.md` ✅ Approved (Wave 5)
  - `mobile-google-oauth.md` ✅ Approved (Wave 7)
  - `mobile-sort-options.md` ✅ Approved (Wave 7)
- Execution plan rewritten to leaner wave-focused format (`mobile/store-assets/mobile-parity-execution-plan.md`); parallel session map archived to `mobile/store-assets/mobile-parity-pre-work.litcoffee`.
- `/fix-spec` and `/review-spec` commands improved: closing banners (`✅ /fix-spec complete`, `✅ /review-spec complete`) added.
- **Wave 3 done (2026-03-17):** `mobile-profile-editing.md` implemented — `feat/mobile-profile-editing` branch; AvatarPicker component, AuthContext.updateUser, inline displayName/bio editing on ProfileScreen; 297 tests passing, 83.05% coverage.
- **Wave 4 done (2026-03-17):** `mobile-4-tier-visibility.md` implemented — `feat/mobile-4-tier-visibility` branch; VisibilityPicker + VisibilityBadge components, 4-tier visibility wired into LearningNewScreen / LearningDetailScreen / ProfileScreen settings, i18n keys.
- **Wave 6 done (2026-03-17):** `mobile-re-learning.md` implemented — `feat/mobile-re-learning` branch; `shareLearning()`/`unshareLearning()` API functions, `ReLearningModal` component (note + visibility picker), Re-learn button on LearningDetailScreen and LearnerProfileScreen (others' PUBLIC learnings only), Remove action for own re-learnings in FeedScreen, i18n keys (EN + PT-BR), 2 Maestro E2E flows (create + remove re-learning); 345 tests passing, 84.35% line coverage.
- **Next:** Wave 5 (`mobile-tag-management`), Wave 7 (`mobile-sort-options` + `mobile-google-oauth`).

**Progress update (2026-03-20 — Wave 7 backend fix: Google OAuth Android audience):**
- Backend `GoogleIdTokenVerifier` updated to accept both the web client ID and the Android client ID as valid token audiences. Previously, tokens minted by the Android app (which carry the Android OAuth client ID as the audience) were rejected with `403 Google sign-in failed` because the verifier only trusted the web client ID.
- `AuthProperties.GoogleProperties` record gained an `androidClientId` field; `application.yml` added `android-client-id: ${GOOGLE_ANDROID_CLIENT_ID:}`.
- `GoogleOAuthConfig.java` filters both IDs (skipping blank values) and passes the resulting list to `GoogleIdTokenVerifier.Builder.setAudience()`.
- `PasswordResetServiceTest.java` updated to match new 2-arg `GoogleProperties` constructor.
- Fix committed and pushed to `develop`. `GOOGLE_ANDROID_CLIENT_ID` env var set in Railway dashboard.
- **✅ Wave 7 Google OAuth confirmed working** — user successfully authenticated with Google Sign-In on a physical Android device (2026-03-21).

**Progress update (2026-03-21 — mobile UX polish: TSA-P01, TSA-P02, TSA-P03/TMA-01):**
Three client-side UX fixes shipped on branch `chore/mobile-ui-improvements-tsa-tma`. No backend changes.

| ID | Fix | Files Changed | Status |
|----|-----|--------------|--------|
| TSA-P01 | Compact visibility picker — 4 emoji pills in one horizontal row (~50px) instead of 4 stacked full-height rows (~280px); selected tier's label + description shown below; `compact?: boolean` prop added to `VisibilityPicker`; `LearningNewScreen` uses `compact` + `ScrollView` wrapper | `VisibilityPicker.tsx`, `LearningNewScreen.tsx` | ✅ Done |
| TSA-P02 | Form reset on save — `formKey` state incremented on successful save forces `LearningForm` to remount with clean defaults; unsaved drafts are preserved (key only increments in the success path) | `LearningNewScreen.tsx` | ✅ Done |
| TSA-P03 / TMA-01 | Correct tab + auto-refresh after save — `AppTabsParamList.Feed` now accepts `{ tab?: 'mine' \| 'social' } \| undefined`; `LearningNewScreen` navigates with `{ tab: 'mine' }` after save; both `SocialContent` and `MyLearningsContent` have `useFocusEffect` with `hasMountedRef` guard for auto-refresh on focus without double-fetching on mount | `FeedScreen.tsx`, `AppTabs.tsx`, `LearningNewScreen.tsx` | ✅ Done |

- 7 new compact-mode tests added to `VisibilityPicker.test.tsx`; `radii.full` added to test mock.
- Test results: 391 tests pass, 84.18% line coverage (above 80% threshold).

**Progress update (2026-03-21 — inline tag creation):**
- Tag modal on `LearningDetailScreen` gains a search input with spaces-to-dashes mask and a "Create `{name}`" row — users can now create a new tag and assign it without leaving the detail screen (FR4 from TM-1; closes the "Create tags on the web" dead end).
- `LearningNewScreen` now navigates to `LearningDetail` after save (TM-3 / FR15), so users land directly on the new learning and can tag it in one flow.
- 384 tests passing, lint clean; branch: `feat/mobile-save-pok-with-tags`.

**Progress update (2026-03-13 — mobile-design-system skill):**
- ✅ Step 1 of execution sequence complete: `mobile-design-system` skill created at `.claude/skills/mobile-design-system/`.
- Skill encodes: Library at Dusk palette mapped to RN tokens (light + dark), 7 component recipes (Button/Card/Text/TextInput/ErrorMessage/MarkdownContent/Avatar), screen layout patterns, font loading (DM Sans + Sora via expo-font), shadow/animation translations, 5 known gotchas.
- Full hex mapping tables in `references/tokens-reference.md` (ember-CTA scale, brand accents, new palette definition, 23-token buildTheme target).

### Wave 0 — DS Tokens + Fonts (feat/ds-tokens-fonts, 2026-03-14) ✅

- ✅ Step 2 of execution sequence complete: Library at Dusk design tokens and font loading wired into the mobile app.
- `mobile/src/theme/tokens.ts` — full palette replaced with Library at Dusk values (parchment `#F5F0E8`, ember-CTA `#D4854A`, deep navy `#0F1B2D`, mid-blue `#2B4A78`, ink `#1A1A2E`); `brandAccents` export added (8 static brand colors); `typography.fontFamily` added (DM Sans for body, Sora for headings); 8 new semantic keys added to `buildTheme()` (`inputBg`, `inputBorder`, `inputPlaceholder`, `disabledBg`, `disabledText`, `tagPillBg`, `tagPillText`, `contentBody`); `errorBackground` made properly theme-switched for dark mode.
- `mobile/src/App.tsx` — `useFonts()` added (DMSans_400Regular, DMSans_500Medium, Sora_600SemiBold); `SplashScreen.preventAutoHideAsync()` called at module level; splash hidden via `useEffect` when fonts are ready; renders null until fonts loaded.
- `mobile/app.json` — splash.backgroundColor and android.adaptiveIcon.backgroundColor updated to `#0F1B2D` (deep navy).
- `mobile/package.json` — added: `expo-font`, `@expo-google-fonts/dm-sans`, `@expo-google-fonts/sora`, `expo-splash-screen`.
- Test results: 174 passing, 80.53% line coverage (above 80% threshold).
- **Next:** Step 3 — patch existing screens with Library at Dusk component styles using the `mobile-design-system` skill.

### Wave 1 — DS Component Patches (step 3)

**S1.1 (feat/ds-text-button-error, 2026-03-14) ✅**
- `Text.tsx` — `fontFamily` wired per variant: Sora_600SemiBold for title/heading/subheading; DMSans_500Medium for label; DMSans_400Regular for body/bodySm/caption. Removed unused StyleSheet import.
- `Button.tsx` — disabled state now uses `colors.disabledBg` / `colors.disabledText` (was `colors.border` / `colors.textDisabled`); replaced spacing arithmetic with literal `10`; secondary variant gets `borderWidth: 1, borderColor: colors.border`. Removed unused StyleSheet import.
- `ErrorMessage.tsx` — verified clean; no changes needed.
- Tests: `Text.test.tsx` extended (fontFamily assertions for Sora/DM Sans per variant); `Button.test.tsx` extended (disabledBg/disabledText token + secondary border); `ErrorMessage.test.tsx` created (5 new tests covering null renders and theme color usage).
- Test results: 179 passing, 80.92% line coverage (above 80% threshold).

**S1.2 (feat/ds-input-card-avatar, 2026-03-15) ✅** (PR #202)
- `TextInput.tsx` — Library at Dusk token wiring: `inputBg`, `inputBorder`, `inputPlaceholder` applied; DM Sans font family set; focused border uses `colors.primary`; error state border uses `colors.error`.
- `Card.tsx` — background uses `colors.surface`; shadow tokens applied for elevation; border radius updated to match design language.
- `Avatar.tsx` — initials font updated to Sora_600SemiBold; `fontWeight` conflict removed (weight baked into variant name); placeholder uses `colors.tagPillBg` / `colors.tagPillText`.
- Tests extended with token assertions; test results: 204 passing, 81.2% line coverage (above 80% threshold).

**S1.3 (feat/ds-markdown-feedcomps, 2026-03-15) ✅**
- `MarkdownContent.tsx` — `contentBody` token wired for prose text color; heading font updated to Sora_600SemiBold; `fontWeight` conflict removed per Android font synthesis fix; code block background uses `colors.inputBg`.
- Feed components (`LearningCard`, `LearningForm`) — Library at Dusk tokens applied throughout; `StyleSheet.create` blocks replaced with inline style objects per convention; all values remain token-derived.
- Tests extended; all 3 Wave 1 PRs (#201 S1.1, #202 S1.2, S1.3 merged — 2026-03-15).

### Wave 2 — DS Screen Patches (step 4)

Three branches run in parallel, each targeting a screen cluster:

| Branch | Screens | Status |
|--------|---------|--------|
| `feat/ds-auth-screens` | LoginScreen, RegisterScreen, ForgotPasswordScreen, ChooseHandleScreen | ✅ Done (2026-03-15) |
| `feat/ds-feed-detail` | FeedScreen, LearningDetailScreen, LearningNewScreen | ✅ Done (2026-03-15) |
| `feat/ds-profile-discover` | ProfileScreen, DiscoverScreen, LearnerProfileScreen | ✅ Done (2026-03-15) |

**S2.1 (feat/ds-auth-screens, 2026-03-15) ✅**
- Auth screen design system audit: all 4 screens (`LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ChooseHandleScreen`) patched with Library at Dusk tokens, DM Sans / Sora typography, and component-recipe layouts.
- Tests: 4 auth screen test files written covering theme token usage, form validation, and API interaction. All 271 tests pass; 83.45% line coverage (above 80% threshold).
- Session fix-pr 206 (2026-03-16): removed unused `mockSetServerError`, renamed misleading test in LoginScreen, replaced `'Pass123!'` fixture with `'mock-p4ssword'` in all auth tests (resolved GitGuardian CI false positive), extracted shared `mockTheme` + `findAllByType` helper to `mobile/src/screens/auth/__tests__/test-utils.ts` (eliminated ~120 lines of duplication across 4 test files).

**S2.2 (feat/ds-feed-detail, 2026-03-15) ✅**
- `FeedScreen.tsx` — tab pill weight toggled via `fontFamily` (`bodyMedium`/`body`) to avoid Android font synthesis rather than `fontWeight` override; `spacing.xs + 2` magic number replaced with literal `6` (with comment).
- `LearningDetailScreen.tsx` — tag pills now use `tagPillBg`/`tagPillText` semantic tokens (was `surfaceAlt`); tag text uses `caption` variant (was `bodySm`); padding matches canonical LearningCard pattern; spacing arithmetic `sm + 2` replaced with literal `10` (with comment); add-tag and remove-tag labels both use `caption` variant.
- `LearningNewScreen.tsx` — audited; no changes needed (already token-compliant).
- Test results: 229 passing, lint clean (0 errors).

**S2.3 (feat/ds-profile-discover, 2026-03-15) ✅**
- Audited 4 files against the Library at Dusk design system skill.
- `ProfileScreen.tsx` — fully conformant, no changes needed.
- `AppTabs.tsx` — fully conformant, matches tab bar recipe exactly.
- `DiscoverScreen.tsx` — fixed: replaced `StyleSheet.create` block with inline style objects (kept `StyleSheet.hairlineWidth`); all values remain token-derived.
- `LearnerProfileScreen.tsx` — fixed: replaced `marginTop` on retry Button with `gap` on parent View (convention alignment).
- Test results: 230 passing, 84.21% line coverage (above 80% threshold). Commit: `18dda74`.

---

## Milestone 3.2: AI Connections

| # | Feature | Priority |
|---|---------|----------|
| 3.2.1 | Identify related POKs | Should Have |
| 3.2.2 | "Related learnings" section on POK view | Should Have |
| 3.2.3 | Connection strength indicators | Could Have |

## Exit Criteria

- [ ] Semantic search returns relevant results
- [ ] Related POKs are surfaced automatically
- [ ] Mobile app is on Play Store internal track (Android) *(3.4.6 in progress — Play Console forms being filled)*
- [ ] Mobile app is on TestFlight (iOS) *(deferred — no Apple Developer enrollment yet)*
- [ ] Author uses mobile app to capture learnings on-the-go

---

*Last updated: 2026-03-21 (session: chore/mobile-ui-improvements-tsa-tma — mobile UX polish: TSA-P01 compact visibility picker, TSA-P02 form reset on save, TSA-P03/TMA-01 correct tab + auto-refresh)*
