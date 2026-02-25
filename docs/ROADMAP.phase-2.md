# Phase 2: Evolution

> Status: **🔄 Started** — Milestone 2.1 complete; 2.2 partially implemented; 2.3–2.4 planned

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

### Milestone 2.2: Tagging System 🔄

> **Spec:** `docs/specs/features/tagging-system.md` — Status: Implemented
> **Note:** Intent-based related-concept tag suggestions (e.g., singleton → #designpatterns) ship in Phase 7.

| # | Feature | Status |
|---|---------|--------|
| 2.2.1 | Manual tag creation (learner creates new tags freely) | ✅ Backend + Web (feat/tagging-system, 2026-02-25) |
| 2.2.2 | Assign tags to POKs | ✅ Backend + TagBadge/TagSuggestionPrompt web layer (feat/tagging-system, 2026-02-25) |
| 2.2.3 | Filter POKs by tag | ⏳ Backend ✅ (`GET /api/v1/poks?tagId=`); web TagFilter component deferred |
| 2.2.4 | Tag management (rename, delete) | ⏳ Backend ✅ (PATCH/DELETE `/api/v1/tags/{id}`); web UI deferred |
| 2.2.5 | Basic AI auto-tag suggestions (keyword extraction from content) | ✅ Backend — `TagSuggestionService` keyword extraction (feat/tagging-system, 2026-02-25) |
| 2.2.6 | Approve/reject/modify suggested tags | ✅ Backend + `TagSuggestionPrompt` web component (feat/tagging-system, 2026-02-25) |

**Notes (2026-02-25):**
- Backend: `Tag`, `UserTag`, `PokTag`, `PokTagSuggestion` entities; `TagService`, `TagSuggestionService`, `TagController`; `PokResponse`/`PokService` extended to include tags
- Web: `tagApi.ts`, `useTags` hook, `TagBadge`, `TagSuggestionPrompt`; `PokCard` updated; i18n keys added (EN/PT-BR)
- **Deferred:** TagInput combobox (FR8/AC19 edit-before-approve) and TagFilter (FR10/FR11) — web components deferred to a follow-up
- AC19 (edit suggestion before approve) deferred; approve/reject works, editing not yet exposed in UI

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
- [~] Tagging system works (manual creation + AI suggestions for explicit tags) — backend + basic web done; TagFilter + TagInput combobox deferred
- [ ] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs
- [ ] Inspirational prompts appear on add-learning page
- [ ] Homepage adapts after first learning is recorded
