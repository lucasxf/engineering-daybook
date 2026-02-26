# Semantic Search

> **Status:** Draft
> **Created:** 2026-02-26
> **Implemented:** _pending_

---

## Context

The current keyword search (ILIKE substring match on title + content) fails users in the most
common real-world recall scenario: they remember the *concept* but not the *exact words* they
used when writing the learning.

Examples of searches that fail today:
- Wrote "React re-renders when reference equality fails" — searches "component optimization" → zero results
- Wrote "db index on foreign key speeds up JOIN" — searches "slow queries" → zero results
- Wrote "useEffect cleanup prevents memory leaks" — searches "component unmount" → zero results

This is a fundamental limitation of lexical search: it matches tokens, not meaning. Users who
cannot recall their own phrasing are effectively locked out of their own knowledge base — the
exact opposite of the app's purpose.

**Why now:** Milestones 2.1–2.3 completed the organizational layer (tagging, timeline, grouped
views, sort). Users now have enough learnings stored that retrieval quality is the dominant
friction point. pgvector is available on Supabase at no additional infrastructure cost.
`paraphrase-multilingual-MiniLM-L12-v2` is free via HuggingFace's Inference API, produces
384-dimensional embeddings, and natively supports 50+ languages — including EN and PT-BR —
with no additional multilingual tuning.

**Phase/Milestone:** Phase 3 — AI & Mobile / Milestone 3.1

**Success indicator:** Search finds the relevant learning >80% of the time (measured by manual
spot-check on author's own data set of 30+ learnings across diverse topics).

**Related:**
- `docs/ROADMAP.phase-3.md` — Milestone 3.1
- `docs/ARCHITECTURE.md` — ADR to be added post-implementation

---

## Requirements

### Functional

**Scope:** `full-stack`

#### Must Have

- [ ] **FR1 — Embedding generation on create** `[Must Have]`
  When a POK is created with non-empty content, the system generates a vector embedding of the
  combined `title + ". " + content` text and stores it in the `embedding` column (`vector(384)`)
  on the `poks` table. This happens **asynchronously** after the HTTP response is returned to the
  client (same `@Async` pattern as `TagSuggestionService`). The POK is immediately available for
  keyword search; semantic search picks it up once the embedding lands (typically within 2 s).

- [ ] **FR2 — Embedding regeneration on content update** `[Must Have]`
  When a POK's `title` or `content` is updated, the `embedding` column is set to `NULL`
  immediately on update (atomic with the save), and a new embedding is generated asynchronously.
  The POK is temporarily absent from semantic results until the new embedding is stored.

- [ ] **FR3 — Backfill for existing POKs** `[Must Have]`
  A one-time backfill endpoint (`POST /api/v1/admin/poks/backfill-embeddings`, protected by
  `X-Internal-Key` header) generates embeddings for all POKs with `embedding IS NULL`, in batches
  of 20 with a 100 ms delay between batches. Returns `202 Accepted` with enqueued count. The job
  is idempotent and safe to re-run. It must not modify any field other than `embedding`.

- [ ] **FR4 — Hybrid search via extended existing endpoint** `[Must Have]`
  Extend `GET /api/v1/poks` with an optional `searchMode` parameter (`hybrid` | `semantic` |
  `keyword`). Default behavior (no `searchMode` param) is **unchanged keyword search** (backward
  compatible). When `searchMode=hybrid`:
  1. Embed the `keyword` query string.
  2. Run cosine similarity search (semantic candidates, top 20, threshold 0.60).
  3. Run existing ILIKE keyword search (up to 50 matches).
  4. Merge and rank using weighted scoring (semantic 70%, keyword presence 30%), dedup by POK ID.
  5. Return top `size` results in the standard `Page<PokResponse>` shape. `sortBy`/`sortDirection`
     params are ignored when `searchMode` is `hybrid` or `semantic` (results are sorted by
     combined relevance score).

- [ ] **FR5 — User data isolation** `[Must Have]`
  Every pgvector similarity query MUST include `WHERE user_id = :userId` predicate at the SQL
  layer. No POK from another user can appear in search results under any code path.

- [ ] **FR6 — Graceful degradation when embedding service unavailable** `[Must Have]`
  If the HuggingFace embedding API call fails during a search request (any `searchMode`), the
  system falls back silently to keyword-only search. The HTTP response is `200` with keyword
  results. A WARN-level structured log is written: `{ "event": "embedding_service_unavailable",
  "fallback": "keyword_only" }`. The query text is NOT logged in plaintext.

- [ ] **FR7 — POKs without embeddings handled correctly** `[Must Have]`
  POKs with `embedding IS NULL` are excluded from the semantic scoring component but remain
  eligible for keyword matching. The hybrid result set is the union of both sets, deduplicated.

#### Should Have

- [ ] **FR8 — Seamless search UX, no toggle** `[Should Have]`
  The frontend sends `searchMode=hybrid` as a hardcoded default on every search. There is no
  visible mode toggle. Users see one search bar; the experience silently improves. (Rationale:
  UX mandate — "reduce friction, minimum clicks"; a toggle adds cognitive overhead for zero
  user benefit since hybrid is strictly >= keyword in result quality.)

- [ ] **FR9 — Configurable hybrid weights** `[Should Have]`
  Semantic/keyword weights are externalized as `@ConfigurationProperties` (`search.hybrid
  .semantic-weight`, `search.hybrid.keyword-weight`) with defaults 0.7 / 0.3. Adjustable via
  environment variable without code change for relevance tuning (FR10).

- [ ] **FR10 — Admin relevance evaluation endpoint** `[Should Have]`
  `POST /api/v1/admin/search/evaluate` accepts `[{ query, expectedPokId }]` and returns
  precision-at-K metrics. Protected by `X-Internal-Key`. Not in OpenAPI public docs.

#### Won't Have (This Milestone)

- User-visible relevance explanations ("matched semantically" badge) — deferred to 3.1.4
- Custom/alternative embedding models — only HuggingFace `paraphrase-multilingual-MiniLM-L12-v2`
- Embedding tags — only POK title + content is embedded
- Mobile app search changes — web only for this milestone
- Query embedding caching — cost is zero at current scale (free tier), deferred

### Non-Functional

- [ ] **NFR1 — Latency** `[Must Have]`
  - `keyword`/`hybrid` fallback: p95 < 200 ms (no regression from current keyword search)
  - `hybrid` with available embedding service: p95 < 800 ms at the API layer
  - HuggingFace embedding call budget: 500 ms max; if exceeded, fall back to keyword (FR6)

- [ ] **NFR2 — Embedding cost** `[Should Have]`
  `paraphrase-multilingual-MiniLM-L12-v2` via HuggingFace Inference API free tier (rate-limited
  to ~100 req/s shared; sufficient for personal-scale journaling). No per-token cost. If rate
  limits become a bottleneck, HuggingFace Inference Endpoints (dedicated) can be provisioned.
  No cost guard or metering required for v1.

- [ ] **NFR3 — Privacy and isolation** `[Must Have]`
  - All pgvector queries enforce `WHERE user_id = :userId` at SQL layer, not application layer.
  - Query text not logged in plaintext (FR6). POK content sent to HuggingFace governed by
    HuggingFace's data processing terms (Inference API).
  - IVFFlat index is per-table (shared across users) — document as known limitation in ADR.

- [ ] **NFR4 — Scalability** `[Should Have]`
  IVFFlat index with `lists=100` supports sub-10 ms vector search up to ~100K vectors. Async
  embedding generation uses Spring `@Async` with bounded thread pool (max 5 threads, queue 100).

- [ ] **NFR5 — Resilience** `[Must Have]`
  Resilience4j circuit breaker wraps the HuggingFace client: opens after 3 consecutive failures
  within 30 s. In open state, all embedding requests fail immediately → fallback triggers
  instantly. Embedding failure on POK create/update does NOT prevent the POK being saved.

---

## Technical Constraints

**Stack:** Full-stack (Spring Boot 4 / Java 21 backend + Next.js 15 / TypeScript web)

**Technologies:**
- pgvector (PostgreSQL extension — already enabled via V1 migration)
- `com.pgvector:pgvector:0.1.6` (JDBC type mapping for vector column)
- Spring `RestClient` for HuggingFace HTTP call (no spring-ai; already in `spring-boot-starter-web`)
- Manual retry loop for HuggingFace call (avoid new dependency; 3 retries, exponential backoff)
- Resilience4j (already in Spring Boot 4 starter)
- HuggingFace `paraphrase-multilingual-MiniLM-L12-v2` model, **384 dimensions**
  - Endpoint: `https://router.huggingface.co/` (formerly `api-inference.huggingface.co`)
  - Request: `POST` with `{ "inputs": "<text>" }`, `Authorization: Bearer {HF_TOKEN}`
  - Response: `float[][]` — one embedding array per input; take `response[0]`

**Integration Points:**
- `PokService` — add embedding trigger after `create()` and `update()`
- `PokRepository` — add native SQL cosine similarity query
- `GET /api/v1/poks` — extend with `searchMode` param (backward compatible)
- `usePoksData` hook — hardcode `searchMode=hybrid` in API call
- `pokApi.ts` — add `SearchMode` type and `searchMode?` param to `PokSearchParams`

**Out of Scope:**
- spring-ai framework (too heavy; milestone builds only as of 2026-02)
- HNSW index (IVFFlat chosen; HNSW has higher build overhead for personal scale)
- Similarity scores exposed in `PokResponse` — v1 response shape unchanged
- Streaming search results
- New frontend pages or components (zero new frontend files)

---

## Acceptance Criteria

### AC1 — Semantic search finds conceptually relevant result that keyword search misses
**GIVEN** user "alice" has a learning: title "React render optimization", content "Avoid
unnecessary re-renders by memoizing components with React.memo and using useCallback for stable
function references", with a generated embedding
**WHEN** alice searches `GET /api/v1/poks?keyword=component+performance&searchMode=hybrid`
**THEN** the response includes the "React render optimization" learning within the top 5 results
**AND** a pure keyword ILIKE search for "component performance" would return zero results for
that learning (the hit is semantic-only)

### AC2 — Embedding generated on POK create
**GIVEN** the HuggingFace embedding service is available
**WHEN** a new learning is saved (POST /api/v1/poks) with title "JWT expiration handling" and
content "Always validate exp claim server-side"
**THEN** the HTTP response is returned immediately (not blocked on embedding)
**AND** within 5 seconds, `SELECT embedding FROM poks WHERE id = :id` returns a non-null value
**AND** the embedding has 384 dimensions and belongs to the correct `user_id`

### AC3 — Embedding regenerated on POK content update
**GIVEN** user "alice" has a learning with embedding `E1` stored
**WHEN** alice updates the learning content to "completely different topic about database indexing"
**THEN** immediately after the `PUT /api/v1/poks/{id}` response, `embedding IS NULL` in the DB
**AND** within 5 seconds, a new embedding `E2 != E1` is stored
**AND** a hybrid search for "database indexing" returns this learning
**AND** a hybrid search for the original content terms no longer returns this learning
via the semantic path

### AC4 — POKs without embeddings excluded from semantic results but included in keyword results
**GIVEN** user "alice" has a learning: title "Flyway migration pitfall", content
"baseline-on-migrate skips V1 on fresh schema", with `embedding IS NULL`
**WHEN** alice searches `?keyword=Flyway+migration&searchMode=hybrid`
**THEN** the learning IS returned (keyword match via ILIKE)
**WHEN** alice searches `?keyword=baseline+schema&searchMode=hybrid` (no ILIKE match but
semantically related)
**THEN** the learning is NOT returned (excluded from semantic component due to null embedding,
and no keyword match)

### AC5 — Cross-user isolation
**GIVEN** user "alice" has a learning about "Kubernetes pod scheduling with node affinity"
**AND** user "bob" has no learnings about Kubernetes
**WHEN** bob calls `GET /api/v1/poks?keyword=pod+scheduling&searchMode=hybrid`
**THEN** the response contains zero results belonging to alice
**AND** the SQL query executed includes `WHERE user_id = <bob's id>`

### AC6 — Graceful degradation when embedding service is down
**GIVEN** the circuit breaker for the HuggingFace client is in open state
**WHEN** user "alice" calls `GET /api/v1/poks?keyword=memory+leak&searchMode=hybrid`
**THEN** the response is `200 OK` within 800 ms
**AND** the response body contains keyword-match results (ILIKE on "memory leak")
**AND** no error message is visible in the response body
**AND** a WARN log entry is written: `event=embedding_service_unavailable,
fallback=keyword_only`
**AND** the query text "memory leak" does NOT appear in the log entry

### AC7 — Backfill job is idempotent and safe
**GIVEN** the database contains 50 learnings with `embedding IS NULL`
**AND** the embedding service is available
**WHEN** `POST /api/v1/admin/poks/backfill-embeddings` is called
**THEN** the response is `202 Accepted` with `{ "enqueued": 50 }`
**AND** within 120 seconds, all 50 learnings have non-null embeddings
**AND** no field other than `embedding` is modified on any learning
**WHEN** the endpoint is called a second time
**THEN** `{ "enqueued": 0 }` is returned (idempotent — already embedded)

### AC8 — Frontend always sends searchMode=hybrid on keyword search
**GIVEN** the web app is loaded by an authenticated user
**WHEN** the user types any text into the search bar
**THEN** the HTTP request to `GET /api/v1/poks` includes `searchMode=hybrid` in the query string
**AND** no search mode toggle is visible anywhere in the UI
**AND** the user sees no difference in the search experience (no extra clicks, no new UI)

### AC9 — i18n: search empty state copy in EN and PT-BR
**GIVEN** user locale is "en" and a search returns zero results
**WHEN** the no-results state is rendered
**THEN** the hint text contains semantic-aware guidance (e.g., "try rephrasing your search")
**AND** no internal term "POK" appears in the UI

**GIVEN** user locale is "pt-BR" and a search returns zero results
**WHEN** the no-results state is rendered
**THEN** the hint text is in Portuguese with equivalent semantic guidance

---

## Implementation Approach

### Architecture

```
[User types query]
       │
       ▼
  SearchBar (300ms debounce)
       │
       ▼
  usePoksData → pokApi.getAll({ keyword, searchMode: 'hybrid', ... })
       │
       ▼
  GET /api/v1/poks?keyword=X&searchMode=hybrid
       │
       ▼
  PokController.listOrSearch()
       │
       ▼
  PokService.hybridSearch(userId, keyword, threshold, limit)
       ├─► EmbeddingService.embed(keyword) ──── HuggingFace HTTP (RestClient)
       │       └─[on failure] throw EmbeddingUnavailableException
       │               └─► fallback to PokService.search(keyword) ← existing
       │
       ├─► PokRepository.semanticSearch(userId, queryVector, threshold, limit)
       │       └── native SQL: WHERE user_id=? AND deleted_at IS NULL
       │                        AND embedding IS NOT NULL
       │                        AND 1-(embedding<=>vector) >= threshold
       │                        ORDER BY embedding<=>vector LIMIT ?
       │
       ├─► PokRepository.searchPoks(userId, keyword, ...) ← existing
       │
       └─► merge + rank (weighted 0.7/0.3) → Page<PokResponse>

[POK create/update path]
  PokService.create() / update()
       ├── save Pok (embedding=NULL on update)
       └── embeddingService.generateAndSaveAsync(pokId)  ← @Async
               └── HuggingFace embed → pokRepository.save(pok.updateEmbedding(vector))
```

### Test Strategy

- [x] **Full TDD** for:
  - `EmbeddingService` (unit): mock RestClient; test happy path, retry, circuit breaker,
    HTTP 4xx no-retry, timeout → EmbeddingUnavailableException
  - `VectorAttributeConverter` (unit): serialization round-trip, null handling
  - `PokService` additions (unit): mock EmbeddingService + PokRepository; test hybridSearch
    with semantic available, fallback path, dedup/ranking
  - `PokController` additions (unit, `@WebMvcTest`): new `searchMode` param — 200, 400 on
    missing `keyword` with `searchMode=semantic`, 401 unauthenticated

- [x] **Partial TDD** for:
  - `EmbeddingBackfillService` (unit): batching, idempotency (already-embedded POKs skipped)
  - `SemanticSearchIntegrationTest` (integration): real pgvector container (Testcontainers
    `pgvector/pgvector:pg15`); `EmbeddingService` replaced with `FakeEmbeddingService`
    (`@TestConfiguration`); test ranked results, null-embedding exclusion, user isolation,
    graceful degradation

- [x] **Frontend** (unit + E2E):
  - Vitest: `pokApi.test.ts` — `searchMode` in query string; `usePoksData.test.ts` — passes
    `searchMode=hybrid`; `NoSearchResults.test.tsx` — updated hint copy
  - Playwright: verify wire request includes `searchMode=hybrid`; empty state renders correctly

### File Changes

**New — Backend:**
- `backend/src/main/resources/db/migration/V12__add_embedding_to_poks.sql` — add
  `embedding vector(384)` column + IVFFlat index (`WHERE embedding IS NOT NULL`)
- `backend/src/main/java/com/lucasxf/ed/config/VectorAttributeConverter.java` — JPA
  `AttributeConverter<float[], String>` for pgvector text format `[f1,f2,...]`
- `backend/src/main/java/com/lucasxf/ed/service/EmbeddingService.java` — interface:
  `float[] embed(String text)` + `HuggingFaceEmbeddingService` impl (RestClient, retry, circuit breaker)
- `backend/src/main/java/com/lucasxf/ed/service/EmbeddingBackfillService.java` — batch
  backfill logic; called by admin endpoint
- `backend/src/main/java/com/lucasxf/ed/dto/SemanticSearchResult.java` — `record(double score,
  PokResponse pok)` (used only in admin evaluation endpoint FR10)
- `backend/src/main/java/com/lucasxf/ed/config/SearchProperties.java` —
  `@ConfigurationProperties("search")` for hybrid weights and thresholds
- `backend/src/test/java/com/lucasxf/ed/service/EmbeddingServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/service/EmbeddingBackfillServiceTest.java`
- `backend/src/test/java/com/lucasxf/ed/integration/SemanticSearchIntegrationTest.java`
- `backend/src/test/java/com/lucasxf/ed/config/VectorAttributeConverterTest.java`

**Modified — Backend:**
- `backend/pom.xml` — add `com.pgvector:pgvector:0.1.6`
- `backend/src/main/java/com/lucasxf/ed/domain/Pok.java` — add `embedding float[]` with
  `@Column(columnDefinition = "vector(384)")` + `@Convert(converter =
  VectorAttributeConverter.class)`, `getEmbedding()`, `updateEmbedding(float[])`
- `backend/src/main/java/com/lucasxf/ed/repository/PokRepository.java` — add
  `semanticSearch()` native query; add `findByUserIdAndDeletedAtIsNullAndEmbeddingIsNull()`
- `backend/src/main/java/com/lucasxf/ed/service/PokService.java` — inject `EmbeddingService`;
  trigger async embedding after create/update; add `hybridSearch()` and `semanticSearch()`
  methods; add fallback logic (catch `EmbeddingUnavailableException` → keyword fallback)
- `backend/src/main/java/com/lucasxf/ed/controller/PokController.java` — add `searchMode`
  optional param to `listOrSearch()` endpoint; add admin backfill and evaluate endpoints
- `backend/src/main/resources/application.yml` — add `HUGGINGFACE_API_KEY` ref; `search.*` props
- `backend/src/test/java/com/lucasxf/ed/service/PokServiceTest.java` — add hybrid/semantic
  test cases, mock EmbeddingService
- `backend/src/test/java/com/lucasxf/ed/controller/PokControllerTest.java` — add searchMode
  param tests

**Modified — Web (zero new files):**
- `web/src/lib/pokApi.ts` — add `SearchMode` union type; add `searchMode?` to `PokSearchParams`;
  serialize it in `getAll()`
- `web/src/hooks/usePoksData.ts` — pass `searchMode: 'hybrid'` in `pokApi.getAll()` call
- `web/src/components/poks/NoSearchResults.tsx` — use `noResultsSemanticHint` i18n key
- `web/src/locales/en.json` — add `poks.search.noResultsSemantic`,
  `poks.search.noResultsSemanticHint`
- `web/src/locales/pt-BR.json` — same two keys in Portuguese
- `web/src/__tests__/lib/pokApi.test.ts` — searchMode serialization tests
- `web/src/__tests__/hooks/usePoksData.test.ts` — assert `searchMode=hybrid` forwarded
- `web/src/__tests__/components/poks/NoSearchResults.test.tsx` — updated hint copy
- `web/e2e/poks.spec.ts` — add semantic search E2E test cases

**Migrations:**
- `V12__add_embedding_to_poks.sql` — `ALTER TABLE poks ADD COLUMN embedding vector(384)`;
  IVFFlat index with `lists=100`, `vector_cosine_ops`, partial (`WHERE embedding IS NOT NULL`)

---

## Dependencies

**Blocked by:** None — POK CRUD is fully implemented; pgvector extension is already enabled in
production DB (V1 migration).

**Blocks:** Milestone 3.2 (AI Connections — "Related learnings" section) depends on embeddings
being generated (FR1/FR3 must be complete before 3.2 can use stored embeddings).

**External:**
- `HUGGINGFACE_API_KEY` environment variable must be set in Railway (backend) and `.env.local`
  for local development. This is a new secret — add to Railway env vars before deployment.
  Obtain from `https://huggingface.co/settings/tokens` (free account; read-only token sufficient).
- `com.pgvector:pgvector:0.1.6` Maven dependency — available on Maven Central.
- Supabase production DB: pgvector extension already enabled; `vector(384)` column can be
  added via Flyway migration without downtime.
- Test containers: `pgvector/pgvector:pg15` Docker image (has vector extension pre-installed).

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
_pending_

### Architectural Decisions

**Decision: No spring-ai dependency; HuggingFace over OpenAI**
- **Options:** spring-ai BOM (with HF or OpenAI provider), pgvector-java + raw RestClient,
  pgvector-java + official OpenAI Java SDK
- **Chosen:** HuggingFace `paraphrase-multilingual-MiniLM-L12-v2` via pgvector-java + raw RestClient
- **Rationale:** (1) HuggingFace free tier eliminates per-token cost entirely at personal scale.
  (2) `paraphrase-multilingual-MiniLM-L12-v2` has native multilingual support for EN + PT-BR,
  removing the cross-lingual limitation of OpenAI `text-embedding-3-small`. (3) spring-ai 1.x
  is milestone/RC as of 2026-02; heavy transitive footprint not warranted for a single API call.
  HuggingFace's feature-extraction endpoint is a single POST — RestClient handles it with zero
  new framework dependencies. `pgvector-java` is a single small jar for JDBC type mapping only.

**Decision: Extend existing endpoint vs. new endpoint**
- **Options:** New `GET /api/v1/poks/semantic-search`, extend `GET /api/v1/poks`
- **Chosen:** Extend `GET /api/v1/poks` with `searchMode` param
- **Rationale:** Frontend change is minimal (one new param), response shape unchanged
  (no new DTOs on the client side), backward compatible (no `searchMode` = existing keyword
  behavior). New dedicated endpoint reserved for admin evaluation only.

**Decision: No frontend search mode toggle**
- **Options:** Toggle switch, seamless hybrid (hardcoded), URL param
- **Chosen:** Hardcoded `searchMode=hybrid` in `usePoksData`, no UI change
- **Rationale:** UX mandate. Hybrid is strictly ≥ keyword in result quality. A toggle adds
  cognitive overhead, new i18n copy, and state management for zero user benefit.

### Deviations from Spec
_pending_

### Lessons Learned
_pending_
