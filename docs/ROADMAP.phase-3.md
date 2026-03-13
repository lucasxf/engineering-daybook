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
