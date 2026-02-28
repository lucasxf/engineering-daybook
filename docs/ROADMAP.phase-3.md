# Phase 3: AI & Mobile

> Status: **🔄 In Progress** (3.1, 3.3 complete)

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

## Milestone 3.2: AI Connections

| # | Feature | Priority |
|---|---------|----------|
| 3.2.1 | Identify related POKs | Should Have |
| 3.2.2 | "Related learnings" section on POK view | Should Have |
| 3.2.3 | Connection strength indicators | Could Have |

## Milestone 3.4: App Store Publishing

| # | Feature | Priority |
|---|---------|----------|
| 3.4.1 | Apple Developer Program enrollment + provisioning profiles | Must Have |
| 3.4.2 | Google Play Console setup + signing keystore | Must Have |
| 3.4.3 | App store metadata: screenshots, descriptions, privacy policy (EN + PT-BR) | Must Have |
| 3.4.4 | EAS Build production profile — iOS `.ipa` + Android `.aab` | Must Have |
| 3.4.5 | TestFlight internal distribution (iOS) | Must Have |
| 3.4.6 | Play Store internal track distribution (Android) | Must Have |
| 3.4.7 | Apple App Store Review submission + approval | Should Have |
| 3.4.8 | Google Play Store public release | Should Have |

**Notes:**
- 3.4.5 and 3.4.6 (internal distribution) are the immediate goal — real devices, real testing, no public commitment yet
- 3.4.7 and 3.4.8 (public publishing) require stable UX, store review compliance, and Apple/Google policy adherence
- Android-first is reasonable (Lucas is an Android user, Play Store review is faster than App Store review)
- Spec: `docs/specs/features/app-store-publishing.md` (to be written)

## Exit Criteria

- [ ] Semantic search returns relevant results
- [ ] Related POKs are surfaced automatically
- [x] Mobile app is on TestFlight (iOS) and Play Store internal track (Android) *(Milestone 3.4 in progress)*
- [ ] Author uses mobile app to capture learnings on-the-go
