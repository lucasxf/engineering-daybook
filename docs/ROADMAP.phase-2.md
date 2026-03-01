# Phase 2: Evolution

> Status: **🔄 Started** — Milestones 2.1, 2.2, and 2.3 complete; 2.4 planned

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

### Milestone 2.2: Tagging System ✅

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
| 2.2.7 | Tag management UI — add/remove tags from ViewPokPage and EditPokPage | ✅ `TagSection` reusable component; wired into ViewPokPage and EditPokPage (fix/tag-system-fixes, 2026-03-01) |
| 2.2.8 | Post-create redirect to view page for immediate tag access | ✅ NewPokPage redirects to `/{locale}/poks/{id}` after creation (fix/tag-system-fixes, 2026-03-01) |

**Notes (2026-02-25):**
- Backend: `Tag`, `UserTag`, `PokTag`, `PokTagSuggestion` entities; `TagService`, `TagSuggestionService`, `TagController`; `PokResponse`/`PokService` extended to include tags
- Web: `tagApi.ts`, `useTags` hook, `TagBadge`, `TagSuggestionPrompt`; `PokCard` updated; i18n keys added (EN/PT-BR)
- AC19 (edit suggestion before approve) deferred; approve/reject works, editing not yet exposed in UI

**Notes (2026-03-01, fix/tag-system-fixes):**
- `TagSection` component (`web/src/components/poks/TagSection.tsx`) — reusable tag management UI with a prominent "Add tag" pill button, dropdown picker for existing and new tags, and `TagSuggestionPrompt` integration
- `ViewPokPage` rewired to use `<TagSection>` (replaced the previously invisible inline picker)
- `EditPokPage` now renders `<TagSection>` below the form — tags were entirely absent from edit before this fix
- `NewPokPage` redirect changed from list (`/{locale}/poks`) to view page (`/{locale}/poks/{id}`) so users land directly on the tag UI after creating a learning
- All 256 unit tests pass; build clean; lint clean
- **Still deferred:** TagInput combobox (FR8/AC19 edit-before-approve) and TagFilter (FR10/FR11) — web components not yet implemented

**Notes (2026-03-01, PR #100 review fixes):**
- Accessibility: `aria-label` added to icon-only "create tag" button in `TagSection` (was unlabelled for screen readers)
- UX: tag input text is now preserved when tag creation fails — `setNewTagName`/`setShowPicker` moved inside the `if (tag)` success branch so the picker stays open and the typed name is not lost on failure
- Edit page stability: `onChanged` in `EditPokPage` now calls a targeted `refreshTags` helper instead of the full `loadPok`, preventing the loading gate from toggling and unmounting the form (losing unsaved edits) on every tag change

### Milestone 2.3: Visualization ✅

> **Spec:** `docs/specs/features/tags-visualization.md` — Status: Implemented (feat/tags-visualization, 2026-02-25)

| # | Feature | Status |
|---|---------|--------|
| 2.3.1 | Timeline view (chronological) | ✅ `TimelineView` + `MonthGroup` — month/year grouped, newest-first, locale-aware headers; `/poks/timeline` route |
| 2.3.2 | Tag-grouped view | ✅ `TagGroupedView` + `TagGroup` — alphabetical sections, untagged at bottom; integrated into `/poks` feed |
| 2.3.3 | Sort options (Newest/Oldest/Recently updated) | ✅ `SortDropdown` updated to 3-option model |
| 2.3.4 | Search result highlighting | ⏳ Deferred (Could Have) |

**Notes (2026-02-25):**
- `usePoksData` hook centralises auth guard, data fetching, and URL state — shared across Feed/Tags/Timeline views
- `ViewSwitcher` component provides Feed | Tags | Timeline tabs (`role="tablist"`) on the poks page
- `PokCard` extended with `dateField` prop to render "Updated" label for the recently-updated sort
- i18n keys added in `en.json` and `pt-BR.json` for all new UI strings
- `poks/page.tsx` refactored to use `usePoksData` hook; `poks/timeline/page.tsx` added as a dedicated route
- 6 E2E scenarios added to `web/e2e/poks.spec.ts` covering view switching, tag-grouped rendering, and timeline rendering
- `playwright.config.ts` port changed to 3001 to avoid conflict with the main worktree running on 3000
- All 239 unit tests pass; build clean; 6 E2E tests pass

---

## Planned

### Milestone 2.4: UX Delight

| # | Feature | Priority |
|---|---------|----------|
| 2.4.1 | Random inspirational prompt on "add new learning" page — e.g., "TIL (Today I learned...)" — from localised dictionary, changes on every page load | Should Have |
| 2.4.2 | Homepage personalization after first learning: persistent layout of (1) quick-entry textarea and (2) search bar | Must Have |

---

## Evolution Exit Criteria

- [x] Learner can edit and delete POKs
- [x] All changes are logged in audit trail
- [x] Tagging system works (manual creation + AI suggestions for explicit tags) — full web UI done; TagFilter + TagInput combobox deferred (not blocking core tagging)
- [x] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs
- [ ] Inspirational prompts appear on add-learning page
- [ ] Homepage adapts after first learning is recorded
