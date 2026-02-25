# Tags Visualization

> **Status:** Implemented
> **Created:** 2026-02-25
> **Implemented:** 2026-02-25

---

## Context

Learnimo's feed currently presents all learnings as a flat chronological list. This model breaks down as the knowledge base grows: users cannot answer "What did I learn in January?" or "What have I captured about React?" without scrolling through everything.

The Visualization milestone adds structural affordances for **discovery**, **reflection**, and **accountability** — the core value propositions of a personal learning journal.

**Related:** Milestone 2.3 in `docs/ROADMAP.phase-2.md`. Builds on Milestone 2.2 (Tagging System) — tag data model and basic tag display are prerequisites.

---

## Requirements

### Functional

**2.3.1 — Timeline View**

- [ ] FR1 `[Must Have]` Timeline view is accessible at `/[locale]/poks/timeline`. Direct URL navigation (bookmark, back/forward) renders correctly for authenticated users.
- [ ] FR2 `[Must Have]` Learnings are grouped by **month and year** (e.g., "February 2026"), newest group first.
- [ ] FR3 `[Must Have]` Within each group, learnings are ordered by the active sort option (default: newest `createdAt` first).
- [ ] FR4 `[Must Have]` Month/year headers are visually distinct typographic separators, not cards.
- [ ] FR5 `[Must Have]` A view-switcher control on the feed page navigates to the timeline without extra clicks.
- [ ] FR6 `[Must Have]` Active search query carries over when switching to timeline (`?keyword=react` is preserved).
- [ ] FR7 `[Must Have]` Empty state (no learnings): prompt to create first learning; no "POK" text.
- [ ] FR8 `[Must Have]` Empty state (search returns nothing): "no results" message referencing the search term.

**2.3.2 — Tag-Grouped View**

- [ ] FR9 `[Must Have]` Tag-grouped view is toggled via `?view=tags` on `/[locale]/poks`. No dedicated sub-route.
- [ ] FR10 `[Must Have]` Learnings are grouped by tag, one section per tag.
- [ ] FR11 `[Must Have]` Tag sections are ordered alphabetically by tag name. Within each section, learnings follow the active sort option.
- [ ] FR12 `[Must Have]` A learning with multiple tags appears in each of its tag sections.
- [ ] FR13 `[Must Have]` Learnings with no tags appear in an "Untagged" / "Sem etiqueta" (PT-BR) section at the bottom.
- [ ] FR14 `[Must Have]` If all learnings are untagged, only the "Untagged" section renders, with a contextual nudge to add tags.
- [ ] FR15 `[Must Have]` The view-switcher is visible on the feed page without navigating elsewhere.
- [ ] FR16 `[Must Have]` Switching between tag-grouped and feed view preserves active search and sort state.
- [ ] FR17 `[Must Have]` Empty state (no learnings): same prompt as feed empty state.

**2.3.3 — Sort Options**

- [ ] FR18 `[Must Have]` Sort criteria: **Newest first** (default, `createdAt DESC`), **Oldest first** (`createdAt ASC`), **Recently updated** (`updatedAt DESC`).
  > ⚠️ **Behavioral change:** existing `SortDropdown` default is `updatedAt DESC`. This spec changes the default to `createdAt DESC` and consolidates the four-option model into three named options. Existing bookmarked URLs with `sortBy=updatedAt&sortDirection=DESC` should gracefully fall back to the new default.
- [ ] FR19 `[Must Have]` Active sort option persisted as URL params: default (`createdAt DESC`) omitted from URL; others explicit.
- [ ] FR20 `[Must Have]` Sort control visible on feed, tag-grouped view, and timeline. On timeline, sort affects ordering within month groups; groups remain newest-first regardless.
- [ ] FR21 `[Must Have]` Changing sort updates URL immediately; no "apply" button.
- [ ] FR22 `[Must Have]` Sort state preserved when switching views.
- [ ] FR23 `[Should Have]` "Relevance" sort option shown **only when a keyword is active**; hidden (not disabled) otherwise.

**2.3.4 — Search Result Highlighting**

- [ ] FR24 `[Could Have]` Matching text in learning **titles** is highlighted when a search is active.
- [ ] FR25 `[Could Have]` Content body is not highlighted (deferred to Phase 3).
- [ ] FR26 `[Could Have]` Highlighting is case-insensitive, matches substrings, uses bold or underline in addition to colour.
- [ ] FR27 `[Could Have]` Client-side only — no API changes required.

**Navigation**

- [ ] FR28 `[Must Have]` A persistent `ViewSwitcher` shows Feed | Tags | Timeline tabs on all poks views.
- [ ] FR29 `[Must Have]` Switching views carries current `keyword`, `sortBy`, `sortDirection` in the new URL.
- [ ] FR30 `[Must Have]` View-switcher is keyboard-navigable (`role="tablist"`, `role="tab"`, `aria-selected`).

**Scope: `web`**

### Non-Functional

- [ ] NFR1 Initial render for visualization views ≤ 1.5 s on broadband. No new backend endpoints — views use `GET /poks?size=1000` for client-side grouping (personal journal scale).
- [ ] NFR2 Client-side grouping/sorting of up to 500 learnings executes in < 200 ms. Grouping runs once on data load, not on every render.
- [ ] NFR3 Switching between feed and tag-grouped view feels instantaneous when data is already loaded — no spinner for the view toggle itself.
- [ ] NFR4 Month/year headers use `<h2>` (or equivalent) for screen reader heading navigation.
- [ ] NFR5 Tag section headers use the same semantic heading pattern.
- [ ] NFR6 View-switcher: `role="tablist"`, active tab `aria-selected="true"`, keyboard-operable.
- [ ] NFR7 Search highlights use bold/underline alongside colour (colour-blind safe).
- [ ] NFR8 No user-facing text exposes the internal term "POK".
- [ ] NFR9 All new strings added to both `locales/en.json` and `locales/pt-BR.json`.
- [ ] NFR10 Month/year headers use `Intl.DateTimeFormat` locale-aware formatting ("Fevereiro de 2026" in PT-BR).

---

## Technical Constraints

**Stack:** Web (Next.js 14+, TypeScript, Tailwind CSS, next-intl)

**Technologies:** Next.js App Router, `useSearchParams` / `useRouter` / `useParams`, Vitest + Playwright

**Integration Points:**
- `pokApi.getAll()` — existing paginated endpoint; visualization views call with `size=1000, page=0`; feed stays paginated (`size=20`)
- `SortOption` type (`sortBy`, `sortDirection`) — extended by new sort criteria; backward-compatible fallback for legacy URL params required
- `locales/en.json` and `locales/pt-BR.json` — new `poks.views.*`, `poks.timeline.*`, `poks.tagGroups.*`, `poks.sort.relevance` keys
- **`updateURL` bug fix included:** existing implementation uses stale `queryString` closure variable instead of `newParams.toString()`. Fixed as part of this feature.

**Out of Scope:**
- New backend API endpoints
- Tag management from visualization views (create/rename/delete)
- Content-body search highlighting (Phase 3)
- Infinite scroll / virtual rendering
- Drag-to-reorder within tag sections
- "Relevance" sort backend ranking algorithm (UI only)

---

## Acceptance Criteria

### AC-1 — Timeline renders at dedicated URL
**GIVEN** I am authenticated with learnings from multiple months
**WHEN** I navigate directly to `/en/poks/timeline`
**THEN** learnings are grouped by month/year, newest group first, with locale-formatted headers and `createdAt`-ordered cards within each group

### AC-2 — Timeline URL is bookmarkable
**GIVEN** I am authenticated
**WHEN** I paste `/en/poks/timeline` into the address bar
**THEN** the timeline renders; the browser does not redirect to the feed

### AC-3 — Search carries over to timeline
**GIVEN** I am on `/en/poks?keyword=react` with 3 matching learnings
**WHEN** I click "Timeline" in the view-switcher
**THEN** I land on `/en/poks/timeline?keyword=react` showing only the 3 matches, grouped by month

### AC-4 — Tag-grouped view toggled via query param
**GIVEN** I am on `/en/poks?sortBy=createdAt&sortDirection=ASC`
**WHEN** I click "Tags" in the view-switcher
**THEN** the URL becomes `/en/poks?view=tags&sortBy=createdAt&sortDirection=ASC` and learnings are grouped by tag

### AC-5 — Tags alphabetical, learnings respect sort within sections
**GIVEN** tags "React", "Architecture", "Testing" exist and sort is "Newest first"
**WHEN** I view `/en/poks?view=tags`
**THEN** sections appear in order: Architecture → React → Testing, each sorted newest-first by `createdAt`

### AC-6 — Multi-tag learnings appear in each section
**GIVEN** a learning is tagged with both "React" and "Testing"
**WHEN** I view tag-grouped view
**THEN** that learning appears in both the "React" and "Testing" sections

### AC-7 — Untagged learnings surface at bottom
**GIVEN** 3 learnings tagged "React" and 2 untagged
**WHEN** I view `/en/poks?view=tags`
**THEN** "React" section shows 3 learnings; "Untagged" section at the bottom shows 2; no learning is hidden

### AC-8 — All untagged: nudge shown
**GIVEN** all learnings have no tags
**WHEN** I view `/en/poks?view=tags`
**THEN** only "Untagged" section renders with a contextual message to add tags (no "POK" text)

### AC-9 — Sort updates URL immediately
**GIVEN** I am on `/en/poks`
**WHEN** I change sort to "Oldest first"
**THEN** URL becomes `/en/poks?sortBy=createdAt&sortDirection=ASC` without full reload; list re-orders to oldest first

### AC-10 — Sort state preserved across views
**GIVEN** I am on `/en/poks?sortBy=updatedAt&sortDirection=DESC`
**WHEN** I switch to Tags view, then back to Feed
**THEN** sort state is preserved in both directions

### AC-11 — Relevance sort: hidden without search, visible with search
**GIVEN** no active search
**WHEN** I open the sort dropdown
**THEN** "Relevance" is not present
**GIVEN** search keyword "react" is active
**WHEN** I open the sort dropdown
**THEN** "Relevance" is present and selectable

### AC-12 — Title highlighting (Could Have)
**GIVEN** I am on `/en/poks?keyword=react`
**WHEN** results render
**THEN** "react" (case-insensitive) in learning titles is highlighted with bold/underline (not colour alone)

### AC-13 — Empty state: no learnings on all views
**GIVEN** I am a new user with no learnings
**WHEN** I visit `/en/poks/timeline` or `/en/poks?view=tags`
**THEN** I see a prompt to create my first learning; no "POK" text is visible

### AC-14 — Empty state: search returns nothing on timeline
**GIVEN** learnings exist but none match `?keyword=xyznothing`
**WHEN** I view `/en/poks/timeline?keyword=xyznothing`
**THEN** no month groups render; a "no results" message referencing "xyznothing" appears

### AC-15 — View-switcher keyboard and ARIA
**GIVEN** I am on any poks view
**WHEN** I Tab to the view-switcher
**THEN** each option is focusable; active tab has `aria-selected="true"`; Enter/Space activates; screen reader announces the view name

### AC-16 — Timeline headers locale-formatted
**GIVEN** my locale is PT-BR and I have learnings from February 2026
**WHEN** I view `/pt-br/poks/timeline`
**THEN** the group header reads "Fevereiro de 2026" (no English text)

---

## Implementation Approach

### Architecture

Hybrid routing (decided pre-spec via specialist review — see session discussion):
- **Timeline:** dedicated sub-route `/[locale]/poks/timeline`
- **Tag-grouped:** query param `?view=tags` on existing feed page

Shared state logic extracted into a `usePoksData` hook used by both `poks/page.tsx` and `poks/timeline/page.tsx`. Avoids duplication of auth guard, data fetching, `updateURL`, and sort/keyword state.

Visualization views fetch `size=1000` for client-side grouping; feed stays at `size=20` (paginated). Known limitation: degrades at 5,000+ learnings; fix at that point is a dedicated backend endpoint.

### Test Strategy

- [ ] Partial TDD — tests first for: `usePoksData`, `ViewSwitcher`, `TagGroupedView`, `TimelineView`

### File Changes

**New:**
- `web/src/app/[locale]/poks/timeline/page.tsx` — timeline route; uses `usePoksData` + renders `ViewSwitcher` + `TimelineView`
- `web/src/hooks/usePoksData.ts` — shared hook: auth guard, `loadPoks`, `keyword`/`sortOption` state, `updateURL`
- `web/src/components/poks/ViewSwitcher.tsx` — `role="tablist"` tab control; builds hrefs preserving URL state across all views
- `web/src/components/poks/TagGroupedView.tsx` — groups `Pok[]` by tag alphabetically; untagged section last
- `web/src/components/poks/TimelineView.tsx` — groups `Pok[]` by `createdAt` month/year; newest group first
- `web/src/components/poks/MonthGroup.tsx` — single month/year section: `<h2>` header + `PokCard` list (`dateField="createdAt"`)
- `web/src/components/poks/TagGroup.tsx` — single tag section: tag heading + `PokCard` list

**Modified:**
- `web/src/app/[locale]/poks/page.tsx` — extract state logic to `usePoksData`; fix `updateURL` bug; add `view` param read; render `ViewSwitcher`; conditionally render `TagGroupedView` when `view=tags`
- `web/src/components/poks/PokCard.tsx` — add `dateField?: 'createdAt' | 'updatedAt'` prop (default `'updatedAt'`)
- `web/src/components/poks/SortDropdown.tsx` — align options with new 3-option model (FR18); handle legacy `sortBy=updatedAt&sortDirection=DESC` URL params gracefully
- `web/src/locales/en.json` — add `poks.views.*`, `poks.timeline.*`, `poks.tagGroups.*`, `poks.sort.relevance`
- `web/src/locales/pt-BR.json` — same keys in Portuguese

---

## Dependencies

**Blocked by:** Milestone 2.2 (Tagging System) ✅ already complete — tags present on all POK responses

**Blocks:** Milestone 2.4 (UX Delight) — homepage personalization reads learning count context

**External:** None

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `6fb9799` refactor: extract usePoksData hook from poks feed page
- `5b11b94` feat: add ViewSwitcher component
- `4ab4ead` feat: add TagGroupedView and TagGroup components
- `2812f4f` feat: add TimelineView and MonthGroup components
- `f56de4a` feat: add dateField prop to PokCard, update SortDropdown, add i18n keys
- `012394e` feat: wire poks feed page + add timeline route
- `32cf5b5` test: add E2E scenarios for visualization views

### Architectural Decisions

**Decision: Hybrid routing for visualization views**
- **Options:** All sub-routes (A), all query params (B), hybrid (C), hub page (D)
- **Chosen:** C — hybrid
- **Rationale:** Timeline is semantically a distinct page (different layout, data access pattern, bookmarkable destination). Tag-grouped is a presentation toggle on the same resource. Mixing both into the same mechanism creates either unnecessary navigation overhead (A) or an unmaintainable god-component (B). Reviewed by nexus (web engineering agent) before spec was written.

**Decision: `size=1000` for visualization views**
- **Options:** One-shot large fetch (A), paginated loop (B), new backend endpoint (C), load-more per group (D)
- **Chosen:** A — one-shot `size=1000`
- **Rationale:** Personal journal scale. Complexity of B/C not justified. D defeats the purpose of grouped views. Revisit if user approaches 1,000+ learnings.

### Deviations from Spec
- FR23 (Relevance sort shown only when keyword active) — deferred. The `SortDropdown` was simplified to 3 static options; Relevance was removed from the UI entirely as a `Could Have` item pending backend ranking support.
- FR24–FR27 (Search result highlighting) — deferred per spec (`Could Have`). Not implemented.
- AC-11 (Relevance sort in dropdown) — not implemented (FR23 deferred).
- AC-12 (Title highlighting) — not implemented (FR24–FR27 deferred).
- `playwright.config.ts` port changed from 3000 → 3001 in worktree to avoid conflict with main repo dev server. Should be reverted to 3000 before merging to develop unless the worktree port convention is adopted project-wide.

### Lessons Learned
- Worktrees don't share `node_modules` — symlink from main repo or `npm ci` in worktree.
- `reuseExistingServer: true` in Playwright config causes worktree E2E tests to hit the main repo's running dev server (stale code). Use a dedicated port for worktree testing.
- `vi.hoisted()` is required when mock variables need to be accessible inside `vi.mock()` factory closures — Vitest hoists `vi.mock()` before module initialization.
- `container.firstChild` is `null` when a React component returns `null`; use `expect(container).toBeEmptyDOMElement()` instead.
