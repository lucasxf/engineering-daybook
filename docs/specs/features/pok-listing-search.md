# POK Listing & Search

> **Status:** In Progress
> **Created:** 2026-02-14
> **Implemented:** _pending_

---

## Context

### User Problem

Users need to find specific learnings quickly and browse their knowledge collection efficiently. After implementing POK CRUD (Milestone 1.2), users can create, read, update, and delete individual learnings. However, the current list implementation only supports basic pagination with hardcoded sorting (most recently updated).

This feature enhances the existing list endpoint to support:
- **Keyword search** across title and content
- **Flexible sorting** by creation/update date in ascending/descending order
- **Date range filtering** to find learnings from specific time periods
- **Empty and loading states** for better UX

This addresses the core user need: "I want to quickly find what I learned about X last week" or "Show me my oldest learnings first."

### Roadmap Reference
- **Milestone:** [1.3 POK Listing & Search](../../../ROADMAP.md#milestone-13-pok-listing--search-weeks-5-6) (Weeks 5-6)
- **Phase:** Phase 1 — MVP
- **Dependencies:** Milestone 1.2 (POK CRUD) — ✅ Complete

### Scope

**In Scope:**
- Keyword search (case-insensitive, searches title AND content)
- Sort by createdAt or updatedAt (ASC/DESC)
- Filter by creation date range
- Filter by update date range
- Empty states (no POKs, no search results)
- Loading states
- i18n support (EN/PT-BR)
- URL state management (bookmarkable searches)
- Debounced search input
- Backend API + Web UI

**Out of Scope (Deferred):**
- Semantic search with embeddings (Phase 3, Milestone 3.1)
- Tag filtering (Phase 2, Milestone 2.2)
- Full-text search with ranking/relevance scoring (Phase 3)
- Advanced search operators (AND, OR, NOT) (Phase 3)
- Search highlighting in results (Phase 2)
- Saved searches/filters (Phase 3)

---

## Requirements

### Functional

#### Backend API Enhancements

- [ ] **FR1** *(Must Have)* — The backend MUST accept a `keyword` query parameter (optional, string) that searches **both** title and content fields using case-insensitive partial matching (PostgreSQL `ILIKE`)
- [ ] **FR2** *(Must Have)* — The backend MUST accept a `sortBy` query parameter (optional, enum: `createdAt` | `updatedAt`) with default value `updatedAt`
- [ ] **FR3** *(Must Have)* — The backend MUST accept a `sortDirection` query parameter (optional, enum: `ASC` | `DESC`) with default value `DESC`
- [ ] **FR4** *(Should Have)* — The backend MUST accept `createdFrom` and `createdTo` query parameters (optional, ISO 8601 date strings) to filter POKs by creation date range (inclusive)
- [ ] **FR5** *(Should Have)* — The backend MUST accept `updatedFrom` and `updatedTo` query parameters (optional, ISO 8601 date strings) to filter POKs by update date range (inclusive)
- [ ] **FR6** *(Must Have)* — The backend MUST validate query parameters:
  - `keyword`: max 500 characters
  - `sortBy`: only accept `createdAt` or `updatedAt`
  - `sortDirection`: only accept `ASC` or `DESC`
  - Date parameters: valid ISO 8601 format
- [ ] **FR7** *(Must Have)* — The backend MUST prevent SQL injection by using parameterized queries (Spring Data JPA/Hibernate)
- [ ] **FR8** *(Must Have)* — The backend MUST return an empty page (content: []) when no POKs match the search/filter criteria
- [ ] **FR9** *(Must Have)* — Search MUST only include active (non-deleted) POKs (`deleted_at IS NULL`)
- [ ] **FR10** *(Must Have)* — Search MUST enforce user ownership (users can only search their own POKs)

#### Web Frontend

- [ ] **FR11** *(Must Have)* — The POKs list page MUST display a search input field with placeholder text `poks.search.placeholder` ("Search your learnings...")
- [ ] **FR12** *(Must Have)* — The search input MUST trigger a search when the user presses Enter or clicks a search button/icon
- [ ] **FR13** *(Must Have)* — The POKs list page MUST display a sort dropdown with options:
  - "Newest first" (updatedAt DESC) — default
  - "Oldest first" (updatedAt ASC)
  - "Recently created" (createdAt DESC)
  - "First created" (createdAt ASC)
- [ ] **FR14** *(Should Have)* — The POKs list page MUST display a date range filter UI with:
  - Two date picker inputs: "Created from" and "Created to"
  - Two date picker inputs: "Updated from" and "Updated to"
  - A "Clear filters" button
- [ ] **FR15** *(Must Have)* — The POKs list page MUST display a loading spinner (`<Spinner />`) while fetching data
- [ ] **FR16** *(Must Have)* — The POKs list page MUST display an empty state when no POKs exist (existing behavior)
- [ ] **FR17** *(Must Have)* — The POKs list page MUST display a "no results" empty state when search/filter returns 0 POKs:
  - Message: `poks.search.noResults` ("No learnings found matching your search")
  - Subtext: `poks.search.noResultsHint` ("Try adjusting your search terms or filters")
  - Button: "Clear search" (clears keyword and filters)
- [ ] **FR18** *(Must Have)* — Search, sort, and filter parameters MUST be reflected in the URL query string for bookmarkability and browser back/forward support
- [ ] **FR19** *(Must Have)* — All search/filter UI text MUST support i18n (EN/PT-BR)
- [ ] **FR20** *(Must Have)* — The search input MUST debounce user input (300ms delay) to avoid excessive API calls

#### Pagination

- [ ] **FR21** *(Must Have)* — Pagination MUST be preserved when applying search/sort/filter (e.g., searching resets to page 0, but pagination controls remain visible)
- [ ] **FR22** *(Must Have)* — The pagination controls MUST display current page, total pages, Previous/Next buttons, disabled state when on first/last page

### Non-Functional

#### Performance

- **NFR1** *(Must Have)* — Search queries MUST return results in <500ms for collections up to 10,000 POKs (95th percentile)
- **NFR2** *(Must Have)* — The existing database index on `(user_id, updated_at DESC)` MUST be leveraged for default sorting
- **NFR3** *(Should Have)* — Create a database index on `(user_id, created_at DESC)` to optimize sorting by creation date
- **NFR4** *(Should Have)* — For keyword search, PostgreSQL's `ILIKE` is acceptable for MVP. Full-text search (tsvector/tsquery) is deferred to Phase 3

#### Security

- **NFR5** *(Must Have)* — All search/filter endpoints MUST require JWT authentication
- **NFR6** *(Must Have)* — Keyword search MUST be SQL injection safe (use parameterized queries)
- **NFR7** *(Must Have)* — Search MUST enforce row-level security (users can only search their own POKs)
- **NFR8** *(Should Have)* — Sanitize/truncate search keywords in logs to prevent log injection attacks (max 100 chars logged)

#### Accessibility

- **NFR9** *(Must Have)* — Search input MUST have a proper `<label>` or `aria-label` for screen readers
- **NFR10** *(Must Have)* — Sort dropdown MUST be keyboard navigable (arrow keys to select, Enter to confirm)
- **NFR11** *(Should Have)* — Date picker inputs MUST support keyboard input (manual date entry, not just clicking)
- **NFR12** *(Should Have)* — Empty states MUST have semantic HTML (`role="status"` or `role="alert"` where appropriate)

#### Internationalization

- **NFR13** *(Must Have)* — All new UI text MUST be externalized to `en.json` and `pt-BR.json`
- **NFR14** *(Must Have)* — Date formats MUST respect user locale (e.g., MM/DD/YYYY for EN, DD/MM/YYYY for PT-BR)

#### Error Handling

- **NFR15** *(Must Have)* — Invalid query parameters (e.g., malformed dates) MUST return HTTP 400 with clear error messages
- **NFR16** *(Must Have)* — Network errors during search MUST display a user-friendly error message: `poks.search.error`
- **NFR17** *(Should Have)* — Log search queries (keyword, filters, userId, timestamp) for debugging and future relevance tuning

---

## Technical Constraints

**Stack:** Backend (Java/Spring Boot) + Web (Next.js/TypeScript)

**Technologies:**
- **Backend:** Java 21, Spring Boot 3.4+, Spring Data JPA, PostgreSQL 15+, Jakarta Validation
- **Web:** Next.js 14+, TypeScript 5+, Tailwind CSS 3+, next-intl, React Hook Form (optional for filters)
- **Testing:** JUnit 5, Mockito, Testcontainers (backend), React Testing Library (web)

**Integration Points:**
- Existing `PokController.getAll()` endpoint (will be enhanced with query parameters)
- Existing `PokRepository.findByUserIdAndDeletedAtIsNull()` (will be replaced with custom query)
- Existing `pokApi.getAll()` client method (will be enhanced with optional parameters)
- Existing `/[locale]/poks/page.tsx` (will be enhanced with search/filter UI)
- Spring Security + JWT (existing auth system)
- next-intl for i18n (existing setup)

**Out of Scope:**
- Semantic search with embeddings (Phase 3, Milestone 3.1)
- Tag filtering (Phase 2, Milestone 2.2)
- Full-text search with ranking (Phase 3)
- Advanced search operators (Phase 3)
- Search highlighting (Phase 2)

---

## Acceptance Criteria

### Backend API

**AC1: List POKs with default sorting (updatedAt DESC)**
```gherkin
Given I am an authenticated user with 5 POKs
When I GET /api/v1/poks
Then I receive HTTP 200
And the response contains 5 POKs
And the POKs are sorted by updatedAt DESC (most recent first)
```

**AC2: Search by keyword (finds in title)**
```gherkin
Given I am an authenticated user
And I have a POK with title "PostgreSQL indexing strategies"
And I have a POK with title "React state management"
When I GET /api/v1/poks?keyword=postgresql
Then I receive HTTP 200
And the response contains 1 POK
And the POK title contains "PostgreSQL"
```

**AC3: Search by keyword (finds in content)**
```gherkin
Given I am an authenticated user
And I have a POK with content "Learned about Spring Boot virtual threads today"
And I have a POK with content "React hooks are great"
When I GET /api/v1/poks?keyword=virtual threads
Then I receive HTTP 200
And the response contains 1 POK
And the POK content contains "virtual threads"
```

**AC4: Search is case-insensitive**
```gherkin
Given I am an authenticated user
And I have a POK with title "Docker Compose"
When I GET /api/v1/poks?keyword=docker compose
Then I receive HTTP 200
And the response contains 1 POK
```

**AC5: Sort by createdAt ASC**
```gherkin
Given I am an authenticated user with 3 POKs created on different dates
When I GET /api/v1/poks?sortBy=createdAt&sortDirection=ASC
Then I receive HTTP 200
And the first POK is the oldest created
And the last POK is the most recently created
```

**AC6: Filter by creation date range**
```gherkin
Given I am an authenticated user
And I have POK A created on 2026-01-01
And I have POK B created on 2026-02-01
And I have POK C created on 2026-03-01
When I GET /api/v1/poks?createdFrom=2026-01-15&createdTo=2026-02-15
Then I receive HTTP 200
And the response contains only POK B
```

**AC7: Filter by update date range**
```gherkin
Given I am an authenticated user
And I have POK A updated on 2026-01-01
And I have POK B updated on 2026-02-01
When I GET /api/v1/poks?updatedFrom=2026-01-15&updatedTo=2026-03-01
Then I receive HTTP 200
And the response contains only POK B
```

**AC8: Empty search results**
```gherkin
Given I am an authenticated user with 5 POKs
And none of them contain the word "Kubernetes"
When I GET /api/v1/poks?keyword=kubernetes
Then I receive HTTP 200
And the response content is an empty array
And the totalElements is 0
```

**AC9: Search with special characters does not break**
```gherkin
Given I am an authenticated user with 2 POKs
When I GET /api/v1/poks?keyword=%27OR%201=1--
Then I receive HTTP 200 or 400 (validation error)
And no SQL injection occurs
And the database remains intact
```

**AC10: Invalid date format returns 400**
```gherkin
Given I am an authenticated user
When I GET /api/v1/poks?createdFrom=not-a-date
Then I receive HTTP 400
And the error message indicates invalid date format
```

**AC11: Pagination with search**
```gherkin
Given I am an authenticated user with 30 POKs containing "Spring"
When I GET /api/v1/poks?keyword=spring&page=0&size=10
Then I receive HTTP 200
And the response contains 10 POKs
And the totalElements is 30
And the totalPages is 3
```

**AC12: User isolation (search only own POKs)**
```gherkin
Given User A has POK with title "My secret learning"
And User B is authenticated
When User B GETs /api/v1/poks?keyword=secret
Then User B receives HTTP 200
And the response contains 0 POKs (User A's POK is not visible)
```

**AC13: Deleted POKs excluded from search**
```gherkin
Given I am an authenticated user
And I have a POK with title "Deleted POK" (soft-deleted)
And I have a POK with title "Active POK"
When I GET /api/v1/poks?keyword=POK
Then I receive HTTP 200
And the response contains only "Active POK"
And "Deleted POK" is not in the results
```

### Web Frontend

**AC14: Search form renders**
```gherkin
Given I am on the POKs list page
Then I see a search input with placeholder "Search your learnings..." (localized)
And I see a sort dropdown with default "Newest first" selected
And I see a "New Learning" button
```

**AC15: Search triggers on Enter key**
```gherkin
Given I am on the POKs list page
When I type "react" in the search input
And I press Enter
Then the page displays a loading spinner
And the API is called with keyword=react
And the results update to show matching POKs
```

**AC16: Search triggers on button click**
```gherkin
Given I am on the POKs list page
When I type "docker" in the search input
And I click the search button (magnifying glass icon)
Then the page displays a loading spinner
And the API is called with keyword=docker
```

**AC17: Sort changes trigger API call**
```gherkin
Given I am on the POKs list page with 5 POKs
When I select "Oldest first" from the sort dropdown
Then the API is called with sortBy=updatedAt&sortDirection=ASC
And the POKs list re-renders with oldest first
```

**AC18: Date filter triggers API call**
```gherkin
Given I am on the POKs list page
When I select "Created from: 2026-01-01" and "Created to: 2026-01-31"
And I click "Apply filters"
Then the API is called with createdFrom=2026-01-01&createdTo=2026-01-31
And the results update to show only POKs created in January 2026
```

**AC19: No results empty state**
```gherkin
Given I am on the POKs list page with 5 POKs
When I search for "xyz123nonexistent"
And the API returns 0 results
Then I see the text "No learnings found matching your search" (localized)
And I see a "Clear search" button
And the "New Learning" button is still visible
```

**AC20: Clear search button resets state**
```gherkin
Given I searched for "docker" and got 0 results
And I see the "No results" empty state
When I click "Clear search"
Then the search input is cleared
And all filters are cleared
And the API is called without keyword/filters
And the full POK list is displayed
```

**AC21: Loading state displays**
```gherkin
Given I am on the POKs list page
When the page is loading POKs
Then I see a centered spinner
And I do NOT see the POK list or empty state
And the "New Learning" button is visible
```

**AC22: URL reflects search/filter state**
```gherkin
Given I am on the POKs list page
When I search for "react"
And I select "Oldest first"
Then the URL is /en/poks?keyword=react&sortBy=updatedAt&sortDirection=ASC
And refreshing the page preserves the search state
```

**AC23: Debounced search input**
```gherkin
Given I am on the POKs list page
When I type "d" then "o" then "c" then "k" then "e" then "r" rapidly (within 300ms)
Then the API is called only ONCE after 300ms
And the keyword parameter is "docker"
```

**AC24: Keyboard navigation on sort dropdown**
```gherkin
Given I am on the POKs list page
When I Tab to the sort dropdown
And I press Arrow Down
And I press Enter
Then the sort option changes
And the API is called with the new sort parameters
```

**AC25: Error state displays**
```gherkin
Given I am on the POKs list page
When the search API returns HTTP 500
Then I see an error message "Failed to search learnings. Please try again." (localized)
And I see a "Retry" button
And the POK list is hidden
```

**AC26: i18n - EN locale**
```gherkin
Given I am viewing the app in English (EN)
When I am on the POKs list page
Then I see "Search your learnings..." in the search input
And I see "Newest first" in the sort dropdown
And I see "New Learning" button
```

**AC27: i18n - PT-BR locale**
```gherkin
Given I am viewing the app in Portuguese (PT-BR)
When I am on the POKs list page
Then I see "Pesquisar seus aprendizados..." in the search input
And I see "Mais recentes primeiro" in the sort dropdown
And I see "Novo Aprendizado" button
```

---

## Implementation Approach

### Architecture

#### Backend (Java/Spring Boot)

**Layers:**
1. **Controller:** Enhance `PokController.getAll()` with new query parameters
2. **Service:** Add search/filter logic to `PokService`
3. **Repository:** Add custom query method with Spring Data JPA Specifications or @Query
4. **DTOs:** Create `PokSearchRequest` (optional) for validation, reuse `PokResponse` and `Page<PokResponse>`

**Key Design Decisions:**
- **Query Parameters:** Use `@RequestParam` for keyword, sortBy, sortDirection, date filters
- **Validation:** Use Jakarta Validation (`@Size`, `@Pattern`) on request params or custom validator
- **Dynamic Query:** Use Spring Data JPA Specifications or JPQL with dynamic WHERE clauses
- **Sorting:** Map sortBy/sortDirection to Spring Data `Sort` object
- **Date Filtering:** Accept ISO 8601 strings, parse to `LocalDate`, filter using `BETWEEN` in SQL
- **Security:** Extract userId from `Authentication` context (existing pattern)
- **Pagination:** Reuse existing `Pageable` and `Page<T>` pattern

**Database Changes:**
- Add index on `(user_id, created_at DESC)` for sorting by creation date (V5 migration)

**Example Repository Method:**
```java
@Query("SELECT p FROM Pok p WHERE p.userId = :userId AND p.deletedAt IS NULL " +
       "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "                      OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
       "AND (:createdFrom IS NULL OR p.createdAt >= :createdFrom) " +
       "AND (:createdTo IS NULL OR p.createdAt <= :createdTo) " +
       "AND (:updatedFrom IS NULL OR p.updatedAt >= :updatedFrom) " +
       "AND (:updatedTo IS NULL OR p.updatedAt <= :updatedTo)")
Page<Pok> searchPoks(
    @Param("userId") UUID userId,
    @Param("keyword") String keyword,
    @Param("createdFrom") Instant createdFrom,
    @Param("createdTo") Instant createdTo,
    @Param("updatedFrom") Instant updatedFrom,
    @Param("updatedTo") Instant updatedTo,
    Pageable pageable
);
```

#### Web (Next.js/TypeScript)

**Components:**
- `components/poks/SearchBar.tsx` — Search input with debounce
- `components/poks/SortDropdown.tsx` — Sort selector
- `components/poks/DateRangeFilter.tsx` — Date filter UI (optional for MVP, can defer)
- `components/poks/NoSearchResults.tsx` — Empty state for no results
- Enhance existing `PokList.tsx` to accept loading/error states

**State Management:**
- Use URL query params as source of truth (`useSearchParams` from Next.js)
- Use `useState` for local UI state (input value before debounce)
- Use `useEffect` to trigger API calls when URL params change

**API Client Enhancement:**
```typescript
// pokApi.ts
interface PokSearchParams {
  keyword?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  createdFrom?: string; // ISO 8601
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  size?: number;
}

async getAll(params?: PokSearchParams): Promise<PokPage> {
  const queryString = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, v]) => v != null)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  return apiFetch<PokPage>(`/poks${queryString ? `?${queryString}` : ''}`);
}
```

**Debounce Implementation:**
```typescript
import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**i18n Keys (locales/en.json, locales/pt-BR.json):**
```json
{
  "poks": {
    "search": {
      "placeholder": "Search your learnings...",
      "button": "Search",
      "noResults": "No learnings found matching your search",
      "noResultsHint": "Try adjusting your search terms or filters",
      "clearButton": "Clear search",
      "error": "Failed to search learnings. Please try again."
    },
    "sort": {
      "label": "Sort by",
      "newestFirst": "Newest first",
      "oldestFirst": "Oldest first",
      "recentlyCreated": "Recently created",
      "firstCreated": "First created"
    },
    "filter": {
      "label": "Filter",
      "createdFrom": "Created from",
      "createdTo": "Created to",
      "updatedFrom": "Updated from",
      "updatedTo": "Updated to",
      "applyButton": "Apply filters",
      "clearButton": "Clear filters"
    }
  }
}
```

### Test Strategy

**Approach:** ✅ Full TDD (tests first for all code)

#### Backend Tests

**Unit Tests (`PokServiceTest`):**
- Search by keyword: finds in title, finds in content, case-insensitive, special characters
- Sort: by createdAt ASC/DESC, by updatedAt ASC/DESC
- Filter: by creation date range, by update date range, combined filters
- Pagination with search/filter
- User isolation (only own POKs)
- Soft-deleted POKs excluded
- Empty results

**Integration Tests (`PokControllerTest`):**
- Use `@WebMvcTest(PokController.class)` with mocked `PokService`
- Test all query parameter combinations
- Test validation errors (400): invalid dates, keyword too long
- Test auth errors (401)
- Verify OpenAPI annotations

**Repository Tests (`PokRepositoryTest`):**
- Use Testcontainers with PostgreSQL
- Test custom search query with all parameter combinations
- Test index usage (verify EXPLAIN plans if needed)
- Test edge cases (null keyword, empty strings, date boundaries)

**Coverage Target:** > 80%

#### Web Tests

**Component Tests (React Testing Library):**
- `SearchBar.test.tsx`: renders input, triggers on Enter, triggers on button click, debounces input
- `SortDropdown.test.tsx`: renders options, changes sort, updates URL params
- `DateRangeFilter.test.tsx`: renders inputs, applies filters, clears filters
- `NoSearchResults.test.tsx`: displays message, clear button works
- Enhanced `PokList.test.tsx`: handles loading state, error state, empty state, no results state

**Integration Tests (E2E - optional, Phase 2):**
- Search flow: type keyword → see results → clear → see all POKs
- Sort flow: change sort → see reordered list
- Filter flow: apply date filter → see filtered results

### File Changes

#### Backend

**New:**
- `backend/src/main/resources/db/migration/V5__add_poks_created_at_index.sql` — Index on (user_id, created_at DESC)

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/controller/PokController.java` — Add query params to `getAll()` method
- `backend/src/main/java/com/lucasxf/ed/service/PokService.java` — Add search/filter logic
- `backend/src/main/java/com/lucasxf/ed/repository/PokRepository.java` — Add `searchPoks()` custom query
- `backend/src/test/java/com/lucasxf/ed/controller/PokControllerTest.java` — Add search/filter tests
- `backend/src/test/java/com/lucasxf/ed/service/PokServiceTest.java` — Add search/filter tests
- `backend/src/test/java/com/lucasxf/ed/repository/PokRepositoryTest.java` — Add search query tests

#### Web

**New:**
- `web/src/components/poks/SearchBar.tsx` — Search input with debounce
- `web/src/components/poks/SortDropdown.tsx` — Sort selector
- `web/src/components/poks/DateRangeFilter.tsx` — Date filter UI (optional for MVP)
- `web/src/components/poks/NoSearchResults.tsx` — Empty state for no results
- `web/src/hooks/useDebounce.ts` — Debounce hook
- `web/src/__tests__/components/poks/SearchBar.test.tsx` — Component tests
- `web/src/__tests__/components/poks/SortDropdown.test.tsx` — Component tests
- `web/src/__tests__/components/poks/DateRangeFilter.test.tsx` — Component tests
- `web/src/__tests__/components/poks/NoSearchResults.test.tsx` — Component tests

**Modified:**
- `web/src/app/[locale]/poks/page.tsx` — Add search/filter UI, URL state management
- `web/src/lib/pokApi.ts` — Enhance `getAll()` with optional search params
- `web/src/locales/en.json` — Add search/filter translations
- `web/src/locales/pt-BR.json` — Add search/filter translations

---

## Dependencies

**Blocked by:**
- Milestone 1.2 (POK CRUD) — ✅ Complete

**Blocks:**
- Milestone 2.2 (Tagging System) — Tag filtering will extend search functionality
- Milestone 3.1 (Semantic Search) — Will replace keyword search with embedding-based search

**External:** None

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _TBD_

### Architectural Decisions

**Decision: PostgreSQL ILIKE vs Full-Text Search**
- **Options:**
  - A) `ILIKE` for case-insensitive partial matching
  - B) Full-text search with `tsvector` and `tsquery`
  - C) External search service (Elasticsearch, Algolia)
- **Chosen:** A) `ILIKE` for MVP
- **Rationale:** Simple, adequate for MVP collections (<10K POKs), no additional infrastructure. Full-text search deferred to Phase 3 when relevance ranking becomes critical.

**Decision: Date Filter UI in MVP**
- **Options:**
  - A) Include date range filters in MVP
  - B) Defer to Phase 2
- **Chosen:** TBD (recommend B for MVP simplicity)
- **Rationale:** Search + sort cover 80% of use cases. Date filters add UI complexity. Can be added post-MVP based on user feedback.

**Decision: Debounce Delay (300ms)**
- **Options:**
  - A) 150ms (fast but more API calls)
  - B) 300ms (balanced)
  - C) 500ms (slower UX)
- **Chosen:** B) 300ms
- **Rationale:** Industry standard (Google uses 300ms). Balances perceived responsiveness with API efficiency.

### Deviations from Spec
- _TBD_

### Lessons Learned
- _TBD_
