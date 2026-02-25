# Phase 2: Evolution

> Status: **🔄 Started** — Milestone 2.1 complete; 2.2–2.4 planned

---

**Goal:** Enhance the core experience with editing, tagging, and better visualization.

---

## Completed

### Milestone 2.1: POK Editing & Deletion ✅

| # | Feature | Status |
|---|---------|--------|
| 2.1.1 | Edit POK content | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.2 | Edit POK title | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.3 | Soft delete POK | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.4 | Audit trail logging | ✅ Backend — V6 Flyway migration, `PokAuditLog` entity + repository |
| 2.1.5 | View POK history (FR18-FR20) | ✅ Backend endpoint ships (`GET /api/v1/poks/{id}/history`); frontend UI deferred |

**Notes:**
- `Toast` component added (accessible, `role="status"`, `aria-live="polite"`)
- All tests pass: PokServiceTest 26/26, PokControllerTest 33/33, web 164/164
- Frontend history view deferred — backend available for future implementation

---

## Planned

### Milestone 2.2: Tagging System

| # | Feature | Priority |
|---|---------|----------|
| 2.2.1 | Manual tag creation (learner creates new tags freely) | Must Have |
| 2.2.2 | Assign tags to POKs | Should Have |
| 2.2.3 | Filter POKs by tag | Must Have |
| 2.2.4 | Tag management (rename, delete) | Should Have |
| 2.2.5 | Basic AI auto-tag suggestions (explicit tags from content) | Must Have |
| 2.2.6 | Approve/reject/modify suggested tags | Must Have |

> **Note:** Intent-based related-concept tag suggestions (e.g., singleton → #designpatterns) ship in Phase 7.

### Milestone 2.3: Visualization

| # | Feature | Priority |
|---|---------|----------|
| 2.3.1 | Timeline view (chronological) | Must Have |
| 2.3.2 | Tag-grouped view | Must Have |
| 2.3.3 | Sort options (date, relevance) | Must Have |
| 2.3.4 | Search result highlighting | Could Have |

### Milestone 2.4: UX Delight

| # | Feature | Priority |
|---|---------|----------|
| 2.4.1 | Random inspirational prompt on "add new learning" page — e.g., "TIL (Today I learned...)" — from localised dictionary, changes on every page load | Should Have |
| 2.4.2 | Homepage personalization after first learning: persistent layout of (1) quick-entry textarea and (2) search bar | Must Have |

---

## Evolution Exit Criteria

- [x] Learner can edit and delete POKs
- [x] All changes are logged in audit trail
- [ ] Tagging system works (manual creation + AI suggestions for explicit tags)
- [ ] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs
- [ ] Inspirational prompts appear on add-learning page
- [ ] Homepage adapts after first learning is recorded
