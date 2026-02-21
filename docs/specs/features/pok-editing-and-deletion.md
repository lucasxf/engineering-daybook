# POK Editing & Deletion (Milestone 2.1)

> **Status:** In Progress
> **Created:** 2026-02-20
> **Implemented:** _pending_

---

## Context

Phase 1 shipped a working POK creation, listing, and search flow. The core edit and delete mechanics (API endpoints, frontend pages, soft-delete schema) were built alongside Phase 1 CRUD but were never formally speced or acceptance-tested as a milestone.

Phase 2.1 has two goals:

1. **Verify and polish** the existing edit/delete implementation (already functional but missing success feedback and a few edge cases).
2. **Implement the audit trail** — the `PokAuditLog` entity and the history view — which are the only parts of the milestone not yet built.

> **Critical invariant:** POK content is SACRED. The audit trail records what changed but the implementation must never auto-modify or "improve" learner-written content.

**Related:**
- ROADMAP.md — Phase 2, Milestone 2.1 (POK Editing & Deletion)
- `docs/ARCHITECTURE.md` — Data model: User, POK, PokAuditLog
- Phase 1 implementation: `feat/pok-crud` (backend + web)

---

## Requirements

### Functional

#### Editing (2.1.1 — Edit content, 2.1.2 — Edit title)

Already implemented (see codebase state). Spec records these as verified requirements:

- [x] FR1 **(Must Have):** Authenticated user can update the `content` of a POK they own.
- [x] FR2 **(Must Have):** Authenticated user can update the `title` of a POK they own (title remains optional).
- [x] FR3 **(Must Have):** Backend validates: `content` 1–50,000 chars; `title` max 200 chars (or null/empty).
- [x] FR4 **(Must Have):** `updatedAt` timestamp is updated on every successful edit.
- [x] FR5 **(Must Have):** A user cannot edit another user's POK (returns 403 Forbidden).
- [x] FR6 **(Must Have):** A user cannot edit a soft-deleted POK (returns 404 Not Found).
- [x] FR7 **(Must Have):** Frontend pre-populates the edit form with current title and content.
- [ ] FR8 **(Should Have):** Successful edit shows a success notification (toast) in the UI.

#### Deletion (2.1.3 — Soft delete)

Already implemented. Spec records as verified:

- [x] FR9 **(Should Have):** Authenticated user can soft-delete a POK they own. The POK is marked with `deleted_at` timestamp; no data is destroyed.
- [x] FR10 **(Should Have):** Soft-deleted POKs no longer appear in the learner's list or search results.
- [x] FR11 **(Should Have):** A user cannot delete another user's POK (returns 403 Forbidden).
- [x] FR12 **(Should Have):** Frontend shows a confirmation dialog before deleting.
- [ ] FR13 **(Should Have):** Successful delete shows a success notification (toast) in the UI. After deletion, the learner is redirected to the learnings list.

#### Audit Trail (2.1.4 — Audit trail logging) — **Not yet built**

- [ ] FR14 **(Must Have):** Every create, update, and delete operation on a POK is recorded in a `pok_audit_logs` table.
- [ ] FR15 **(Must Have):** Each audit log entry records: `id`, `pok_id`, `user_id`, `action` (CREATE / UPDATE / DELETE), `old_content`, `new_content`, `old_title`, `new_title`, `occurred_at`.
- [ ] FR16 **(Must Have):** Audit log entries are immutable once written — no update or delete allowed.
- [ ] FR17 **(Must Have):** Audit log entries are written within the same transaction as the POK change (atomic).

#### View History (2.1.5 — View POK history) — **Not yet built**

- [ ] FR18 **(Could Have):** Learner can view the change history of a POK they own (list of audit log entries with action, timestamp, and before/after content).
- [ ] FR19 **(Could Have):** History is displayed on the POK detail page (collapsible section or separate tab — UX TBD).
- [ ] FR20 **(Could Have):** History view is read-only — no restore or revert functionality in this milestone.

### Non-Functional

- [ ] NFR1 **(Must Have):** Audit log writes must never fail silently — any persistence error must propagate and roll back the parent transaction.
- [ ] NFR2 **(Must Have):** Audit log entries are only readable by the POK owner (same ownership check as POK endpoints).
- [ ] NFR3 **(Should Have):** `GET /api/v1/poks/{id}/history` response time < 500 ms for POKs with up to 500 audit entries.
- [ ] NFR4 **(Should Have):** Success notifications (toasts) are accessible: announced to screen readers via `aria-live` region.
- [ ] NFR5 **(Must Have):** All new user-facing strings (history view, toast messages) provided in EN and PT-BR.
- [ ] NFR6 **(Must Have):** No new security surface — history endpoint requires JWT auth and ownership verification.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web)

**Technologies:**
- Java 21, Spring Boot 4.0+, Maven 3.9+
- JPA / Hibernate (entity mapping), Flyway (migration)
- Next.js 14+, TypeScript 5+, Tailwind CSS
- Vitest + React Testing Library (frontend tests)
- JUnit 5, Mockito (backend unit tests)
- Testcontainers (backend integration tests)

**Integration Points:**
- `PokService` — add audit log writes to `create`, `update`, `softDelete`
- `PokController` — add `GET /api/v1/poks/{id}/history` endpoint
- `PokAuditLog` — new entity, repository, and Flyway migration
- Frontend: `pokApi.ts` — add `getHistory(id)` method
- Frontend: POK detail page — add history section and success toast

**Out of Scope:**
- Hard (permanent) delete — not in roadmap for this milestone
- Restore/revert from audit log — deferred to future milestone
- Admin-level audit log access across all users
- Audit log pagination (first implementation can return all entries; pagination if needed)
- Automated content diffing / highlighted diff view

---

## Acceptance Criteria

### AC1: Edit content — happy path
**GIVEN** an authenticated learner owns a POK
**WHEN** they submit the edit form with valid new content
**THEN** the POK's content is updated, `updatedAt` is refreshed, and a success toast ("Learning updated successfully" / "Aprendizado atualizado com sucesso") appears

### AC2: Edit title — clear title (set to null)
**GIVEN** an authenticated learner owns a POK with a title
**WHEN** they clear the title field and submit
**THEN** the POK title is set to null/empty and the content is unchanged

### AC3: Edit — unauthorized (wrong owner)
**GIVEN** an authenticated learner does not own POK X
**WHEN** they call `PUT /api/v1/poks/{X}/...`
**THEN** the response is 403 Forbidden and no changes are persisted

### AC4: Edit — soft-deleted POK
**GIVEN** a POK has been soft-deleted
**WHEN** any user calls `PUT /api/v1/poks/{id}` for that POK
**THEN** the response is 404 Not Found

### AC5: Edit — content validation failure
**GIVEN** an authenticated learner owns a POK
**WHEN** they submit empty content or content exceeding 50,000 characters
**THEN** the backend returns 400 Bad Request with a validation error message; the POK is not modified

### AC6: Delete — happy path with confirmation
**GIVEN** an authenticated learner owns a POK
**WHEN** they click "Delete", confirm in the dialog, and the API call succeeds
**THEN** the POK is soft-deleted, the learner is redirected to the learnings list, and a success toast appears

### AC7: Delete — cancel confirmation
**GIVEN** an authenticated learner clicks "Delete"
**WHEN** they click "Cancel" in the confirmation dialog
**THEN** the POK is NOT deleted and the learner remains on the detail page

### AC8: Delete — unauthorized (wrong owner)
**GIVEN** an authenticated learner does not own POK X
**WHEN** they call `DELETE /api/v1/poks/{X}`
**THEN** the response is 403 Forbidden and the POK is not soft-deleted

### AC9: Audit log — create operation
**GIVEN** a learner creates a new POK
**WHEN** the create request succeeds
**THEN** a `PokAuditLog` entry is persisted with `action=CREATE`, `new_content` equal to the POK content, `old_content=null`, and `occurred_at` equal to the POK's `createdAt`

### AC10: Audit log — update operation
**GIVEN** a learner edits a POK's content or title
**WHEN** the update request succeeds
**THEN** a `PokAuditLog` entry is persisted with `action=UPDATE`, `old_content` equal to the value BEFORE the edit, `new_content` equal to the value AFTER, and `occurred_at` equal to the POK's new `updatedAt`

### AC11: Audit log — delete operation
**GIVEN** a learner soft-deletes a POK
**WHEN** the delete request succeeds
**THEN** a `PokAuditLog` entry is persisted with `action=DELETE`, `old_content` equal to the last known content, `new_content=null`, and `occurred_at` equal to `deletedAt`

### AC12: Audit log — atomicity
**GIVEN** the audit log write fails (e.g., DB error)
**WHEN** a create, update, or delete is attempted
**THEN** the entire transaction is rolled back — the POK change and the audit log entry are either both persisted or both absent

### AC13: View history — happy path (FR18–FR20)
**GIVEN** a learner owns a POK with 3 audit log entries (CREATE, UPDATE, DELETE)
**WHEN** they call `GET /api/v1/poks/{id}/history`
**THEN** the response contains 3 entries ordered by `occurred_at` DESC with correct action, old/new content, and timestamp for each

### AC14: View history — unauthorized
**GIVEN** a learner does not own POK X
**WHEN** they call `GET /api/v1/poks/{id}/history`
**THEN** the response is 403 Forbidden

### AC15: Success notifications — accessibility
**GIVEN** a learner successfully edits or deletes a POK
**WHEN** the toast appears
**THEN** the toast message is announced by screen readers (via `role="status"` or `aria-live="polite"`)

---

## Implementation Approach

### Architecture

**Backend — new layer: PokAuditLog**

```
PokAuditLog entity (com.lucasxf.ed.domain)
    ↓
PokAuditLogRepository (com.lucasxf.ed.repository)
    ↓
PokService — inject PokAuditLogRepository, add logCreate / logUpdate / logDelete private helpers
    ↓
PokController — add GET /api/v1/poks/{id}/history endpoint
    ↓
PokAuditLogResponse DTO (com.lucasxf.ed.dto)
```

**Backend — PokAuditLog entity design:**

```java
@Entity
@Table(name = "pok_audit_logs")
public class PokAuditLog {
    @Id UUID id;                    // uuid_generate_v4()
    @Column UUID pokId;             // FK → poks.id (NO cascade delete — audit is permanent)
    @Column UUID userId;            // denormalized for query efficiency
    @Enumerated(STRING) Action action; // CREATE | UPDATE | DELETE
    @Column(columnDefinition = "TEXT") String oldTitle;
    @Column(columnDefinition = "TEXT") String newTitle;
    @Column(columnDefinition = "TEXT") String oldContent;
    @Column(columnDefinition = "TEXT") String newContent;
    @Column Instant occurredAt;     // set at write time, immutable
}
```

**FK strategy:** `pok_id` references `poks(id)` with `ON DELETE RESTRICT` — prevents hard-deleting a POK that has audit entries. Protects audit integrity without cascade-deleting history.

**Frontend — additions:**

```
pokApi.ts         → add getHistory(id: string): Promise<PokAuditLogEntry[]>
ViewPokPage       → add history section (collapsible, shows audit entries)
EditPokPage       → add success toast on update
ViewPokPage       → add success toast on delete (before redirect)
Toast component   → reuse existing or add lightweight accessible toast
i18n (en / pt-BR) → add keys: poks.history.*, poks.success.updated, poks.success.deleted
```

### Test Strategy

- [x] **Partial TDD:** Write tests first for:
  - `PokAuditLogRepository` (custom queries)
  - `PokService` changes (verify audit log calls on create/update/delete)
  - `PokController` history endpoint
  - Frontend: updated page tests (toast assertions, history section render)
- [ ] Unit tests cover: atomicity (mock repo to throw, verify POK not changed), ownership on history endpoint
- [ ] Integration test: extend `AuthIntegrationTest` or create `PokAuditLogIntegrationTest` to verify end-to-end audit log persistence

### File Changes

**New:**
- `backend/src/main/java/com/lucasxf/ed/domain/PokAuditLog.java` — entity
- `backend/src/main/java/com/lucasxf/ed/repository/PokAuditLogRepository.java` — JPA repository
- `backend/src/main/java/com/lucasxf/ed/dto/PokAuditLogResponse.java` — response DTO
- `backend/src/test/java/com/lucasxf/ed/service/PokAuditLogServiceTest.java` — unit tests for audit log behavior
- `web/src/components/ui/Toast.tsx` — accessible toast component (if no toast exists yet)
- `web/src/components/poks/PokHistory.tsx` — history list component (if FR18–FR20 in scope)

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/service/PokService.java` — inject audit log repo, add log* helpers, call on create/update/softDelete
- `backend/src/main/java/com/lucasxf/ed/controller/PokController.java` — add `GET /{id}/history` endpoint
- `backend/src/test/java/com/lucasxf/ed/service/PokServiceTest.java` — assert audit log writes
- `backend/src/test/java/com/lucasxf/ed/controller/PokControllerTest.java` — add history endpoint tests
- `web/src/lib/pokApi.ts` — add `getHistory()` method
- `web/src/app/[locale]/poks/[id]/page.tsx` — add success toast on delete, add history section
- `web/src/app/[locale]/poks/[id]/edit/page.tsx` — add success toast on update
- `web/src/locales/en.json` — add `poks.history.*`, `poks.success.updated`, `poks.success.deleted`
- `web/src/locales/pt-BR.json` — same keys in PT-BR

**Migrations:**
- `backend/src/main/resources/db/migration/V6__create_pok_audit_logs_table.sql`
  - Creates `pok_audit_logs` table with all fields
  - FK: `pok_id REFERENCES poks(id) ON DELETE RESTRICT`
  - Index on `(pok_id, occurred_at DESC)` for history queries

---

## Dependencies

**Blocked by:** None — Phase 1 CRUD is complete and deployed.

**Blocks:**
- Phase 2.2 (Tagging System) — when tags are added/changed, audit trail will need to capture tag changes too. This milestone establishes the `PokAuditLog` pattern that 2.2 can extend.

**External:** None — no new libraries or infrastructure required.

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _pending_

### Architectural Decisions

_pending_

### Deviations from Spec
- _none yet_

### Lessons Learned
- _pending_
