# POK CRUD (Create, Read, Update, Delete)

> **Status:** Approved
> **Created:** 2026-02-14
> **Implemented:** _pending_

---

## Context

### User Problem
Engineers using Engineering Daybook need a way to capture their daily learnings with **maximum ease and minimal friction**. The POK (Piece of Knowledge) CRUD feature is the **core** of the MVP — without it, users cannot record, retrieve, edit, or remove their knowledge entries.

This feature enables the fundamental user journey:
1. User has a learning they want to preserve (e.g., "whenever facing X problem, prefer BFS over DFS")
2. User creates a POK with content (title optional to reduce friction)
3. User can view all their POKs or a specific POK
4. User can update a POK as their understanding evolves (with visual diff feedback)
5. User can delete a POK if it's no longer relevant (soft delete for safety)

**Design Philosophy:** Minimize bureaucracy. Quick learnings shouldn't require forced categorization or titles. Capture first, organize later.

### Roadmap Reference
- **Milestone:** [1.2 POK Creation](../ROADMAP.md#milestone-12-pok-creation-week-4) (Week 4)
- **Phase:** Phase 1 — MVP
- **Dependencies:** Milestone 1.1 (Authentication) — ✅ Complete

### Scope
**In Scope:**
- Create, Read, Update, Delete operations for POKs
- **Title optional, content mandatory** (reduce friction)
- User ownership and authorization
- Input validation
- Automatic timestamp management
- **Soft delete** (mark as deleted, no restore UI in MVP)
- **Visual diff during edit** (original gray, changes highlighted)
- i18n support (EN/PT-BR)
- Backend API + Web UI (card-based layout)

**Out of Scope (Deferred):**
- Restore UI for soft-deleted POKs (Phase 2, Milestone 2.1 with audit logging)
- Tags (Phase 2, Milestone 2.2)
- Embeddings and vector search (Phase 3, Milestone 3.1)
- AI-powered features (AI auto-title suggestions, connections) (Phase 3)
- Multiple visualization modes (carousel, connected cards, timeline) (Phase 2, Milestone 2.3)
- Mobile UI (Phase 3)
- Rich text editing (Phase 2)
- Attachments/media (Phase 3)
- Custom undo logic (relying on browser native Ctrl+Z for MVP)

---

## Requirements

### Functional

#### POK Creation
- [ ] **FR1:** System shall allow authenticated users to create a new POK with content **(Must Have)**
- [ ] **FR2:** System shall validate title is 0-200 characters (optional, can be empty) **(Must Have)**
- [ ] **FR3:** System shall validate content is 1-50,000 characters (mandatory, cannot be empty) **(Must Have)**
- [ ] **FR4:** System shall auto-generate a unique POK ID (UUID) **(Must Have)**
- [ ] **FR5:** System shall auto-set `created_at` and `updated_at` to current UTC timestamp on creation **(Must Have)**
- [ ] **FR6:** System shall associate the POK with the authenticated user's ID **(Must Have)**
- [ ] **FR7:** System shall return the created POK with all fields (id, userId, title, content, created_at, updated_at) **(Must Have)**
- [ ] **FR8:** Web UI shall provide a form with title input (text field with "Optional" placeholder) and content input (textarea) **(Must Have)**
- [ ] **FR9:** Web UI shall display validation errors inline in user's locale (EN/PT-BR) **(Must Have)**
- [ ] **FR10:** Web UI shall display success feedback after POK creation **(Must Have)**

#### POK Reading
- [ ] **FR11:** System shall allow authenticated users to retrieve a single POK by ID **(Must Have)**
- [ ] **FR12:** System shall return 404 if POK does not exist or is soft-deleted **(Must Have)**
- [ ] **FR13:** System shall return 403 if POK belongs to a different user **(Must Have)**
- [ ] **FR14:** System shall allow authenticated users to list all their active (non-deleted) POKs **(Must Have)**
- [ ] **FR15:** POK list shall be sorted by `updated_at` descending (most recent first) by default **(Must Have)**
- [ ] **FR16:** POK list shall include pagination (page size: 20 items) **(Should Have)**
- [ ] **FR17:** Web UI shall display POKs in a card-based layout with title (if present) and preview of content (first 100 chars) **(Must Have)**
- [ ] **FR18:** Web UI shall display empty state message when user has no POKs **(Must Have)**

#### POK Update
- [ ] **FR19:** System shall allow authenticated users to update title and/or content of their POKs **(Must Have)**
- [ ] **FR20:** System shall validate updated title/content using same rules as creation (FR2, FR3) **(Must Have)**
- [ ] **FR21:** System shall auto-update `updated_at` to current UTC timestamp on update **(Must Have)**
- [ ] **FR22:** System shall NOT modify `created_at` on update **(Must Have)**
- [ ] **FR23:** System shall return 404 if POK does not exist or is soft-deleted **(Must Have)**
- [ ] **FR24:** System shall return 403 if POK belongs to a different user **(Must Have)**
- [ ] **FR25:** Web UI shall pre-populate form with existing title and content **(Must Have)**
- [ ] **FR26:** Web UI shall display success feedback after POK update **(Must Have)**
- [ ] **FR27:** Web UI shall show visual diff during editing: original content in gray, changed text highlighted **(Must Have)**

#### POK Deletion
- [ ] **FR28:** System shall allow authenticated users to soft delete their POKs (set `deleted_at` timestamp) **(Must Have)**
- [ ] **FR29:** Soft-deleted POKs shall NOT appear in list queries or single retrieval **(Must Have)**
- [ ] **FR30:** System shall return 404 if POK does not exist or is already soft-deleted **(Must Have)**
- [ ] **FR31:** System shall return 403 if POK belongs to a different user **(Must Have)**
- [ ] **FR32:** Web UI shall prompt for confirmation before deleting **(Must Have)**
- [ ] **FR33:** Web UI shall display success feedback after POK deletion **(Must Have)**

#### Security & Authorization
- [ ] **FR34:** All POK operations shall require valid JWT authentication **(Must Have)**
- [ ] **FR35:** Users shall only access their own POKs (enforce userId match) **(Must Have)**
- [ ] **FR36:** System shall return 401 for unauthenticated requests **(Must Have)**

### Non-Functional

#### Performance
- **NFR1:** POK creation shall complete in < 500ms (p95) **(Must Have)**
- **NFR2:** POK retrieval (single) shall complete in < 200ms (p95) **(Must Have)**
- **NFR3:** POK list (20 items) shall complete in < 300ms (p95) **(Should Have)**

#### Security
- **NFR4:** All API endpoints shall be protected by Spring Security + JWT **(Must Have)**
- **NFR5:** User IDs shall be extracted from JWT, never from request body **(Must Have)**
- **NFR6:** Database queries shall use parameterized statements (prevent SQL injection) **(Must Have)**
- **NFR7:** Content shall be sanitized on display (prevent XSS) **(Should Have)**

#### Accessibility
- **NFR8:** Web UI forms shall have proper labels and ARIA attributes (screen reader support) **(Should Have)**
- **NFR9:** Web UI shall support keyboard navigation (Tab, Enter, Escape) **(Should Have)**
- **NFR10:** Error messages shall be screen reader accessible **(Should Have)**

#### Internationalization (i18n)
- **NFR11:** All UI text (labels, buttons, errors, success messages) shall be translatable **(Must Have)**
- **NFR12:** System shall support English (EN) and Brazilian Portuguese (PT-BR) **(Must Have)**
- **NFR13:** Timestamps shall be displayed in user's locale format **(Must Have)**
- **NFR14:** Validation error messages shall be localized **(Must Have)**

#### Usability
- **NFR15:** Web UI shall provide clear visual distinction between Create and Edit modes **(Should Have)**
- **NFR16:** Web UI shall support browser native undo (Ctrl+Z) in textareas **(Must Have)**
- **NFR17:** Title field shall clearly indicate it's optional via placeholder text **(Must Have)**

#### Testability
- **NFR18:** All backend endpoints shall have unit + integration tests (coverage > 80%) **(Must Have)**
- **NFR19:** All validation rules shall have explicit test cases **(Must Have)**
- **NFR20:** Web UI components shall have React Testing Library tests for key interactions **(Should Have)**

---

## Technical Constraints

**Stack:** Backend (Java/Spring Boot) + Web (Next.js/TypeScript)

**Technologies:**
- **Backend:** Java 21, Spring Boot 3.2+, Spring Data JPA, PostgreSQL 15+, Flyway, Lombok, Jakarta Validation
- **Web:** Next.js 14+, TypeScript 5+, Tailwind CSS 3+, next-intl, Zod, React Hook Form
- **Testing:** JUnit 5, Mockito, Testcontainers (backend), React Testing Library (web)

**Integration Points:**
- Spring Security + JWT (existing auth system)
- `JwtAuthenticationFilter` extracts userId from JWT claims
- SecurityConfig: POK endpoints require authentication (NOT in permitAll list)
- next-intl for i18n (existing setup in web)
- Existing API client pattern in `web/src/lib/api.ts`

**Out of Scope:**
- Tags, embeddings, vector search (deferred to later milestones)
- Restore UI for soft-deleted POKs (deferred to Phase 2)
- Multiple visualization modes (carousel, connections, timeline) (deferred to Phase 2)
- Rich text editor (deferred to Phase 2)
- File attachments (deferred to Phase 3)
- Custom undo logic (relying on browser native for MVP)
- AI auto-title suggestions (deferred to Phase 3)

---

## Acceptance Criteria

### AC1: Create POK — Happy Path (Content + Title)
```gherkin
Given I am authenticated as user "lucas@example.com"
When I POST to /api/v1/poks with:
  {
    "title": "Java Virtual Threads",
    "content": "Virtual threads in Java 21 allow for lightweight concurrency..."
  }
Then I receive HTTP 201 Created
And the response contains:
  - id (UUID)
  - userId (matches my user ID)
  - title: "Java Virtual Threads"
  - content: "Virtual threads in Java 21 allow for lightweight concurrency..."
  - deletedAt: null
  - createdAt (ISO 8601 UTC timestamp)
  - updatedAt (ISO 8601 UTC timestamp, same as createdAt)
```

### AC2: Create POK — Content Only (No Title)
```gherkin
Given I am authenticated
When I POST to /api/v1/poks with:
  {
    "title": "",
    "content": "Whenever facing graph problems, prefer BFS over DFS for shortest path."
  }
Then I receive HTTP 201 Created
And the response contains:
  - id (UUID)
  - userId (matches my user ID)
  - title: "" (empty string)
  - content: "Whenever facing graph problems, prefer BFS over DFS for shortest path."
  - deletedAt: null
  - createdAt (ISO 8601 UTC timestamp)
  - updatedAt (ISO 8601 UTC timestamp)
```

### AC3: Create POK — Title Only (No Content) → Validation Error
```gherkin
Given I am authenticated
When I POST to /api/v1/poks with:
  {
    "title": "Some Title",
    "content": ""
  }
Then I receive HTTP 400 Bad Request
And the response contains validation error:
  - field: "content"
  - message (EN): "Content is required and must be between 1 and 50,000 characters"
  - message (PT-BR): "O conteúdo é obrigatório e deve ter entre 1 e 50.000 caracteres"
```

### AC4: Create POK — Title Too Long
```gherkin
Given I am authenticated
When I POST to /api/v1/poks with a title of 201 characters
Then I receive HTTP 400 Bad Request
And the response contains validation error:
  - field: "title"
  - message (EN): "Title must be 200 characters or less"
  - message (PT-BR): "O título deve ter no máximo 200 caracteres"
```

### AC5: Create POK — Content Too Long
```gherkin
Given I am authenticated
When I POST to /api/v1/poks with content of 50,001 characters
Then I receive HTTP 400 Bad Request
And the response contains validation error:
  - field: "content"
  - message (EN): "Content must be between 1 and 50,000 characters"
  - message (PT-BR): "O conteúdo deve ter entre 1 e 50.000 caracteres"
```

### AC6: Create POK — Unauthenticated
```gherkin
Given I am NOT authenticated (no JWT token)
When I POST to /api/v1/poks
Then I receive HTTP 401 Unauthorized
```

### AC7: Read Single POK — Happy Path
```gherkin
Given I am authenticated as user "lucas@example.com"
And I have created a POK with id "123e4567-e89b-12d3-a456-426614174000"
When I GET /api/v1/poks/123e4567-e89b-12d3-a456-426614174000
Then I receive HTTP 200 OK
And the response contains all POK fields (id, userId, title, content, createdAt, updatedAt)
And deletedAt is null
```

### AC8: Read Single POK — Not Found
```gherkin
Given I am authenticated
And no POK exists with id "non-existent-id"
When I GET /api/v1/poks/non-existent-id
Then I receive HTTP 404 Not Found
And the response contains error:
  - message (EN): "POK not found"
  - message (PT-BR): "POK não encontrado"
```

### AC9: Read Single POK — Soft Deleted (Not Found)
```gherkin
Given I am authenticated as user "lucas@example.com"
And I have created and soft-deleted a POK with id "deleted-pok-id"
When I GET /api/v1/poks/deleted-pok-id
Then I receive HTTP 404 Not Found
And the response contains error:
  - message (EN): "POK not found"
  - message (PT-BR): "POK não encontrado"
```

### AC10: Read Single POK — Unauthorized (Different User)
```gherkin
Given I am authenticated as user "lucas@example.com"
And user "other@example.com" owns POK with id "other-pok-id"
When I GET /api/v1/poks/other-pok-id
Then I receive HTTP 403 Forbidden
And the response contains error:
  - message (EN): "You do not have permission to access this POK"
  - message (PT-BR): "Você não tem permissão para acessar este POK"
```

### AC11: List POKs — Happy Path
```gherkin
Given I am authenticated as user "lucas@example.com"
And I have created 3 active POKs at different times
When I GET /api/v1/poks
Then I receive HTTP 200 OK
And the response contains an array of 3 POKs
And the POKs are sorted by updatedAt descending (most recent first)
And all POKs have deletedAt = null
```

### AC12: List POKs — Excludes Soft Deleted
```gherkin
Given I am authenticated
And I have created 5 POKs
And I have soft-deleted 2 of them
When I GET /api/v1/poks
Then I receive HTTP 200 OK
And the response contains an array of 3 POKs (only active ones)
And soft-deleted POKs are NOT included
```

### AC13: List POKs — Empty State
```gherkin
Given I am authenticated
And I have NOT created any POKs
When I GET /api/v1/poks
Then I receive HTTP 200 OK
And the response contains an empty array
And the Web UI displays:
  - message (EN): "No POKs yet. Create your first one!"
  - message (PT-BR): "Nenhum POK ainda. Crie o primeiro!"
```

### AC14: List POKs — Pagination
```gherkin
Given I am authenticated
And I have created 25 active POKs
When I GET /api/v1/poks?page=0&size=20
Then I receive HTTP 200 OK
And the response contains:
  - content: array of 20 POKs
  - page: 0
  - totalPages: 2
  - totalElements: 25
When I GET /api/v1/poks?page=1&size=20
Then I receive HTTP 200 OK
And the response contains:
  - content: array of 5 POKs
  - page: 1
```

### AC15: Update POK — Happy Path
```gherkin
Given I am authenticated as user "lucas@example.com"
And I have created a POK with:
  - id: "pok-123"
  - title: "Original Title"
  - content: "Original Content"
  - createdAt: "2026-02-14T10:00:00Z"
  - updatedAt: "2026-02-14T10:00:00Z"
When I PUT /api/v1/poks/pok-123 with:
  {
    "title": "Updated Title",
    "content": "Updated Content"
  }
Then I receive HTTP 200 OK
And the response contains:
  - id: "pok-123" (unchanged)
  - title: "Updated Title"
  - content: "Updated Content"
  - createdAt: "2026-02-14T10:00:00Z" (unchanged)
  - updatedAt: "2026-02-14T10:05:00Z" (updated to current time)
  - deletedAt: null
```

### AC16: Update POK — Remove Title (Make Empty)
```gherkin
Given I am authenticated
And I own a POK with title "Old Title" and content "Some content"
When I PUT /api/v1/poks/{id} with:
  {
    "title": "",
    "content": "Some content"
  }
Then I receive HTTP 200 OK
And the response contains:
  - title: "" (empty string)
  - content: "Some content"
```

### AC17: Update POK — Validation Failure (Empty Content)
```gherkin
Given I am authenticated
And I own POK with id "pok-123"
When I PUT /api/v1/poks/pok-123 with:
  {
    "title": "Valid Title",
    "content": ""
  }
Then I receive HTTP 400 Bad Request
And the response contains validation error for "content"
```

### AC18: Update POK — Not Found
```gherkin
Given I am authenticated
When I PUT /api/v1/poks/non-existent-id
Then I receive HTTP 404 Not Found
```

### AC19: Update POK — Soft Deleted (Not Found)
```gherkin
Given I am authenticated
And I have soft-deleted POK with id "deleted-pok-id"
When I PUT /api/v1/poks/deleted-pok-id
Then I receive HTTP 404 Not Found
```

### AC20: Update POK — Unauthorized
```gherkin
Given I am authenticated as user "lucas@example.com"
And user "other@example.com" owns POK with id "other-pok-id"
When I PUT /api/v1/poks/other-pok-id
Then I receive HTTP 403 Forbidden
```

### AC21: Delete POK — Happy Path (Soft Delete)
```gherkin
Given I am authenticated as user "lucas@example.com"
And I have created a POK with id "pok-123"
When I DELETE /api/v1/poks/pok-123
Then I receive HTTP 204 No Content
And subsequent GET /api/v1/poks/pok-123 returns HTTP 404 Not Found
And the POK still exists in the database with deletedAt = current timestamp
And the POK does NOT appear in GET /api/v1/poks (list)
```

### AC22: Delete POK — Not Found
```gherkin
Given I am authenticated
When I DELETE /api/v1/poks/non-existent-id
Then I receive HTTP 404 Not Found
```

### AC23: Delete POK — Already Soft Deleted
```gherkin
Given I am authenticated
And I have soft-deleted POK with id "deleted-pok-id"
When I DELETE /api/v1/poks/deleted-pok-id
Then I receive HTTP 404 Not Found
```

### AC24: Delete POK — Unauthorized
```gherkin
Given I am authenticated as user "lucas@example.com"
And user "other@example.com" owns POK with id "other-pok-id"
When I DELETE /api/v1/poks/other-pok-id
Then I receive HTTP 403 Forbidden
```

### AC25: Web UI — Create POK Form (Content Only)
```gherkin
Given I am on the POK creation page
Then I see:
  - A text input labeled "Title" (EN) / "Título" (PT-BR) with placeholder "Optional" (EN) / "Opcional" (PT-BR)
  - A textarea labeled "Content" (EN) / "Conteúdo" (PT-BR)
  - A "Create POK" button (EN) / "Criar POK" button (PT-BR)
When I leave title empty
And I enter valid content
And I click "Create POK"
Then I see a success message: "POK created successfully!" (EN) / "POK criado com sucesso!" (PT-BR)
And I am redirected to the POK list page
```

### AC26: Web UI — Validation Feedback (Empty Content)
```gherkin
Given I am on the POK creation page
When I submit the form with empty content
Then I see an inline error below the content field:
  - "Content is required" (EN) / "Conteúdo é obrigatório" (PT-BR)
And the form is NOT submitted
```

### AC27: Web UI — Visual Diff During Edit
```gherkin
Given I am editing a POK with original content "Original text"
When I type new text "Original text with additions"
Then I see:
  - "Original text" displayed in gray color
  - "with additions" highlighted in blue/accent color
When I save the POK
And I view it again later
Then I see the full content "Original text with additions" without any highlighting
```

### AC28: Web UI — Delete Confirmation
```gherkin
Given I am viewing a POK
When I click the "Delete" button (EN) / "Excluir" button (PT-BR)
Then I see a confirmation dialog:
  - "Are you sure you want to delete this POK? It will be hidden from your list." (EN)
  - "Tem certeza que deseja excluir este POK? Ele será ocultado da sua lista." (PT-BR)
When I click "Confirm"
Then the POK is soft deleted
And I see a success message: "POK deleted successfully!" (EN) / "POK excluído com sucesso!" (PT-BR)
And I am redirected to the POK list page
```

### AC29: Web UI — Card Layout Display
```gherkin
Given I am on the POK list page
And I have POKs with and without titles
Then I see:
  - POKs with titles: Display title as card header
  - POKs without titles: Display first 50 chars of content as card header
  - All cards show content preview (first 100 chars)
  - Cards are displayed in a responsive grid layout
```

### AC30: Web UI — Timestamp Locale Formatting
```gherkin
Given I am viewing a POK created at "2026-02-14T15:30:00Z"
And my locale is EN
Then I see the timestamp formatted as "Feb 14, 2026, 3:30 PM" (or similar EN format)
When I change my locale to PT-BR
Then I see the timestamp formatted as "14 de fev. de 2026, 15:30" (or similar PT-BR format)
```

---

## Implementation Approach

### Architecture

#### Backend (Java/Spring Boot)

**Layers:**
1. **Domain:** `Pok` entity (JPA) with soft delete support
2. **Repository:** `PokRepository extends JpaRepository<Pok, UUID>`
3. **Service:** `PokService` with business logic + authorization checks
4. **Controller:** `PokController` with REST endpoints
5. **DTOs:** `CreatePokRequest`, `UpdatePokRequest`, `PokResponse`
6. **Exception:** `PokNotFoundException`, `PokAccessDeniedException` (custom domain exceptions)

**Key Design Decisions:**
- **Title Optional:** `title` column is nullable in DB, validation allows 0-200 chars
- **Content Mandatory:** `content` column is NOT NULL, validation requires 1-50,000 chars
- **Soft Delete:** `deleted_at` column (nullable timestamp), queries filter `WHERE deleted_at IS NULL`
- **Authorization:** Extract `userId` from Spring Security `Authentication` context (JWT claims), never from request body
- **Validation:** Use Jakarta Validation annotations (`@Size`, `@NotBlank`) on DTOs
- **Timestamps:** Use `@PreUpdate` lifecycle hook in `Pok` entity for automatic `updatedAt`
- **Pagination:** Use Spring Data `Pageable` and `Page<T>` for list endpoint
- **Error Handling:** GlobalExceptionHandler intercepts custom exceptions → ApiError responses

**Database Schema (PostgreSQL):**
```sql
CREATE TABLE poks (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(200),  -- NULLABLE (optional)
    content    TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 50000),
    deleted_at TIMESTAMP WITH TIME ZONE,  -- SOFT DELETE
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for active POKs (excludes soft-deleted)
CREATE INDEX idx_poks_user_id_updated_at
    ON poks (user_id, updated_at DESC)
    WHERE deleted_at IS NULL;

-- Index for soft delete queries (if needed for restore UI in Phase 2)
CREATE INDEX idx_poks_deleted_at ON poks (deleted_at);
```

#### Web (Next.js/TypeScript)

**Pages (App Router):**
- `/[locale]/poks/page.tsx` — POK list (card-based layout, empty state)
- `/[locale]/poks/new/page.tsx` — Create POK form
- `/[locale]/poks/[id]/page.tsx` — View single POK
- `/[locale]/poks/[id]/edit/page.tsx` — Edit POK form (with visual diff)

**Components:**
- `components/poks/PokList.tsx` — List of POK cards
- `components/poks/PokCard.tsx` — Single POK card (title as header if present, content preview)
- `components/poks/PokForm.tsx` — Reusable form for create/edit (title with "Optional" placeholder)
- `components/poks/PokEditForm.tsx` — Edit form with visual diff (original gray, changes highlighted)
- `components/poks/DeletePokButton.tsx` — Delete with confirmation dialog
- `components/poks/EmptyState.tsx` — "No POKs yet" message

**API Client (`lib/pokApi.ts`):**
```typescript
export const pokApi = {
  create: (data: CreatePokDto) => POST('/api/v1/poks', data),
  getAll: (page?: number) => GET('/api/v1/poks', { page }),
  getById: (id: string) => GET(`/api/v1/poks/${id}`),
  update: (id: string, data: UpdatePokDto) => PUT(`/api/v1/poks/${id}`, data),
  delete: (id: string) => DELETE(`/api/v1/poks/${id}`)
}
```

**Validation (Zod):**
```typescript
const pokSchema = z.object({
  title: z.string().max(200).optional().or(z.literal('')),  // optional
  content: z.string().min(1).max(50000)  // mandatory
})
```

**Visual Diff Implementation:**
- Simple approach for MVP: Store original content in component state
- During editing, compare current textarea value with original
- Render side-by-side or inline comparison (original gray, new text highlighted)
- After save, clear diff state (show unified content)
- Rely on browser native Ctrl+Z for undo functionality

**i18n Keys (locales/en.json, locales/pt-BR.json):**
- `poks.create.title`, `poks.list.title`, `poks.edit.title`, `poks.view.title`
- `poks.form.titleLabel`, `poks.form.titlePlaceholder` ("Optional")
- `poks.form.contentLabel`, `poks.form.contentPlaceholder`
- `poks.form.createButton`, `poks.form.updateButton`
- `poks.emptyState.message`, `poks.emptyState.cta`
- `poks.delete.confirmTitle`, `poks.delete.confirmMessage`
- `poks.success.created`, `poks.success.updated`, `poks.success.deleted`
- `poks.errors.notFound`, `poks.errors.forbidden`, `poks.errors.contentRequired`

---

### Test Strategy

**Approach:** ✅ Full TDD (tests first for all code)

#### Backend Tests

**Unit Tests (`PokServiceTest`):**
- Create POK: valid input (with/without title), userId association, timestamp generation, content mandatory validation
- Get POK: happy path, not found, soft-deleted returns 404, forbidden (different user)
- List POKs: empty list, multiple POKs, excludes soft-deleted, pagination, sorting by updatedAt DESC
- Update POK: happy path, remove title (make empty), not found, soft-deleted returns 404, forbidden, validation
- Soft Delete POK: happy path, verify deleted_at set, not found, already deleted, forbidden

**Integration Tests (`PokControllerTest`):**
- Use `@WebMvcTest(PokController.class)` with mocked `PokService`
- Test all REST endpoints (POST, GET, GET by ID, PUT, DELETE)
- Test validation errors (400): empty content, content too long, title too long
- Test auth errors (401), authorization errors (403), not found (404)
- Verify OpenAPI annotations are present
- Test soft delete behavior (deleted POKs return 404)

**Repository Tests (`PokRepositoryTest`):**
- Use Testcontainers with PostgreSQL
- Test queries exclude soft-deleted POKs by default
- Test custom queries (findByUserIdAndDeletedAtIsNull, sorting, pagination)
- Test soft delete (verify deleted_at is set, POK still in DB)

**Coverage Target:** > 80%

#### Web Tests

**Component Tests (React Testing Library):**
- `PokForm.test.tsx`: renders title (with "Optional" placeholder) and content fields, validates input (content required, title optional), calls onSubmit with correct data
- `PokEditForm.test.tsx`: shows visual diff (original gray, changes highlighted), supports browser Ctrl+Z
- `PokList.test.tsx`: renders POK cards, shows empty state when no POKs, displays title as header if present
- `PokCard.test.tsx`: displays title as header if present, displays content preview as header if no title
- `DeletePokButton.test.tsx`: shows confirmation dialog, calls delete API on confirm

**Integration Tests (E2E with Playwright - optional, Phase 2):**
- Create POK flow: login → navigate to create → fill content only → submit → see success
- Delete POK flow: login → view POK → click delete → confirm → see success → verify hidden from list

---

### File Changes

#### Backend

**New:**
- `backend/src/main/java/com/lucasxf/ed/domain/Pok.java` — JPA entity (title nullable, deletedAt field)
- `backend/src/main/java/com/lucasxf/ed/repository/PokRepository.java` — Spring Data repository (queries filter out soft-deleted)
- `backend/src/main/java/com/lucasxf/ed/service/PokService.java` — Business logic + authorization + soft delete
- `backend/src/main/java/com/lucasxf/ed/controller/PokController.java` — REST endpoints
- `backend/src/main/java/com/lucasxf/ed/dto/CreatePokRequest.java` — Create DTO (record, title optional)
- `backend/src/main/java/com/lucasxf/ed/dto/UpdatePokRequest.java` — Update DTO (record, title optional)
- `backend/src/main/java/com/lucasxf/ed/dto/PokResponse.java` — Response DTO (record)
- `backend/src/main/java/com/lucasxf/ed/exception/PokNotFoundException.java` — Custom exception
- `backend/src/main/java/com/lucasxf/ed/exception/PokAccessDeniedException.java` — Custom exception
- `backend/src/main/resources/db/migration/V4__create_poks_table.sql` — Database schema (title nullable, deleted_at)
- `backend/src/test/java/com/lucasxf/ed/service/PokServiceTest.java` — Unit tests
- `backend/src/test/java/com/lucasxf/ed/controller/PokControllerTest.java` — Integration tests
- `backend/src/test/java/com/lucasxf/ed/repository/PokRepositoryTest.java` — Repository tests

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/exception/GlobalExceptionHandler.java` — Add handlers for `PokNotFoundException`, `PokAccessDeniedException`

#### Web

**New:**
- `web/src/app/[locale]/poks/page.tsx` — POK list page (card layout)
- `web/src/app/[locale]/poks/new/page.tsx` — Create POK page
- `web/src/app/[locale]/poks/[id]/page.tsx` — View POK page
- `web/src/app/[locale]/poks/[id]/edit/page.tsx` — Edit POK page (with visual diff)
- `web/src/components/poks/PokList.tsx` — POK list component
- `web/src/components/poks/PokCard.tsx` — POK card component (title header if present)
- `web/src/components/poks/PokForm.tsx` — Reusable create/edit form (title "Optional" placeholder)
- `web/src/components/poks/PokEditForm.tsx` — Edit form with visual diff
- `web/src/components/poks/DeletePokButton.tsx` — Delete button with confirmation
- `web/src/components/poks/EmptyState.tsx` — Empty state component
- `web/src/lib/pokApi.ts` — API client for POK operations
- `web/src/lib/validations/pokSchema.ts` — Zod validation schema (title optional, content mandatory)
- `web/src/__tests__/components/poks/PokForm.test.tsx` — Component tests
- `web/src/__tests__/components/poks/PokEditForm.test.tsx` — Component tests (visual diff)
- `web/src/__tests__/components/poks/PokList.test.tsx` — Component tests
- `web/src/__tests__/components/poks/PokCard.test.tsx` — Component tests
- `web/src/__tests__/components/poks/DeletePokButton.test.tsx` — Component tests

**Modified:**
- `web/src/locales/en.json` — Add POK-related translations
- `web/src/locales/pt-BR.json` — Add POK-related translations
- `web/src/lib/api.ts` — Add base API helpers if needed (or reuse existing)

**Migrations:**
- `backend/src/main/resources/db/migration/V4__create_poks_table.sql` — Create poks table (title nullable, deleted_at column, user_id FK, indexes)

---

## Dependencies

**Blocked by:** None (Authentication is complete ✅)

**Blocks:**
- Milestone 1.3: POK Listing & Search (extends POK list with filters, keyword search)
- Milestone 2.2: Tagging System (requires POKs to exist)
- Milestone 3.1: Semantic Search (requires POKs + embeddings)

**External:** None

**Future Preparation:**
- Database schema ready for tags (many-to-many relationship via `pok_tags` table in Phase 2)
- Soft delete enables future restore UI (Phase 2, Milestone 2.1)
- Card-based layout enables future visualization modes (carousel, connections - Phase 2, Milestone 2.3)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _TBD_

### Architectural Decisions

**Decision 1: Title Optional, Content Mandatory**
- **Options:**
  - A) Both mandatory
  - B) Title optional, content mandatory
  - C) At least one required
- **Chosen:** B) Title optional, content mandatory
- **Rationale:** Minimizes friction for quick learnings. Content is the essence of a POK; title is organizational sugar. Users can capture "whenever facing X, use Y" without forced categorization. Aligns with "frictionless experience" goal.

**Decision 2: Soft Delete (MVP) Without Restore UI**
- **Options:**
  - A) Hard delete (permanent)
  - B) Soft delete with restore UI
  - C) Soft delete without restore UI (restore in Phase 2)
- **Chosen:** C) Soft delete without restore UI for MVP
- **Rationale:** Safety net against accidental deletion without scope creep. Restore UI deferred to Phase 2 (Milestone 2.1) with full audit logging. MVP complexity stays manageable.

**Decision 3: Card Layout (MVP), Defer Advanced Visualizations**
- **Options:**
  - A) Simple list/grid
  - B) Card-based layout
  - C) Full vision (carousel, connections, timeline)
- **Chosen:** B) Card-based layout for MVP, C) deferred to Milestone 2.3
- **Rationale:** Cards provide better visual hierarchy and accommodate variable content (with/without titles). Advanced visualizations (carousel, connections) add significant complexity—better to validate core CRUD first, iterate on visualization later.

**Decision 4: Browser Native Undo + Visual Diff**
- **Options:**
  - A) Custom undo stack
  - B) Browser native Ctrl+Z + visual diff
  - C) No undo, just visual diff
- **Chosen:** B) Browser native + visual diff
- **Rationale:** Browsers already handle textarea undo/redo. Visual diff provides context awareness (see what changed). Custom undo stack is overkill for MVP—deferred to Phase 2 if needed.

### Deviations from Spec
- _TBD_

### Lessons Learned
- _TBD_
