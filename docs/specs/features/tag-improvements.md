# Tag Improvements

> **Status:** In Progress
> **Created:** 2026-03-06
> **Implemented:** _pending_

---

## Context

The tagging system (Phase 2.2, `tagging-system.md`) delivered manual tag creation, assignment, and AI suggestions. Three quality gaps remain:

1. **No canonical storage:** Tag `name` is stored as typed by the first creator. `"Claude Code"` and `"claude code"` resolve to the same tag (via `LOWER()` index), but the display name is frozen at first-creator casing — subsequent users see a name they didn't choose.
2. **Spaces in tag names:** Multi-word tags with spaces (`"Claude Code"`) create UX problems — they look like two separate concepts and break URL/query-string conventions.
3. **No feed filtering:** Clicking a tag on a POK does nothing. Feed filtering by tag was deferred from Phase 2.2.

**User problem:** "I tagged everything with 'claude code' but my colleague tagged it 'Claude Code' — they appear identical but could diverge. And I can't click a tag to see all learnings with that tag."

**Phase/Milestone:** Phase 8 — Knowledge Enrichment / Milestone 8.2

**Related:**
- `docs/specs/features/tagging-system.md` — Phase 2.2 implementation (implemented)
- `docs/ROADMAP.phase-8.md` — Milestone 8.2

---

## Requirements

### Functional

**8.2.1 — Tag Casing and Canonical Storage**

- [ ] FR1: *(Must Have)* The `tags` table gains a `display_name VARCHAR(100) NOT NULL` column. The existing `name` column becomes the canonical form: lowercase + spaces replaced by dashes (e.g., `claude-code`).
- [ ] FR2: *(Must Have)* A backfill migration populates `display_name` and normalises `name` for all existing rows: spaces → dashes for `display_name`; spaces → dashes + lowercase for `name`.
- [ ] FR3: *(Must Have)* `TagService.createOrReuse()` stores the user's input with spaces replaced by dashes as `display_name`, and the same string lowercased as `name`.
- [ ] FR4: *(Must Have)* `TagService.renameTag()` applies the same transformation rules.
- [ ] FR5: *(Must Have)* All API responses return `displayName` (the `display_name` column) instead of `name` for UI rendering. The canonical `name` remains internal.
- [ ] FR6: *(Must Have)* The unique index on `LOWER(name)` is replaced by a plain `UNIQUE` constraint on `name`, since `name` is now pre-canonicalised.

**8.2.2 — Spaces to Dashes**

- [ ] FR7: *(Must Have)* Backend enforces the spaces → dashes rule at the service layer — it is the source of truth regardless of what the frontend sends.
- [ ] FR8: *(Should Have)* Web tag input auto-replaces spaces with dashes as the user types, so the transformation is visible and not a surprise on save.
- [ ] FR9: *(Should Have)* Mobile tag input applies the same real-time replacement.

**8.2.3 — Tag Search / Feed Filtering**

- [ ] FR10: *(Must Have)* `GET /api/v1/poks` accepts an optional `tagId` query parameter. When present, only POKs associated with that tag (via `pok_tags`) are returned. The existing `idx_pok_tags_tag_id` index makes this efficient.
- [ ] FR11: *(Must Have)* Web feed renders a `TagFilter` component (list of the user's tags). Selecting a tag filters the feed; deselecting restores the full feed.
- [ ] FR12: *(Should Have)* Mobile feed exposes equivalent tag filter UX.

**Scope:** `full-stack` (backend + web + mobile)

### Non-Functional

- [ ] NFR1: Tag lookup (`findByName`) must remain O(1) via a unique index — no full-table scans.
- [ ] NFR2: Backfill migration must be idempotent and safe to run against a populated production database.
- [ ] NFR3: The `displayName` field must be returned in every API response that currently returns `name`, to avoid breaking existing frontend consumers.
- [ ] NFR4: No XSS surface — tag names are plain text; `displayName` must be validated to contain only alphanumeric characters, hyphens, and dots (no HTML).
- [ ] NFR5: Tag filter on the feed must not introduce a separate network request per tag click — filter state managed client-side with a single parameterised fetch.
- [ ] NFR6: All user-visible tag strings must respect the `displayName` value (not `name`) — this applies to EN and PT-BR locales alike (tags are user-defined strings, not translated).

---

## Technical Constraints

**Stack:** Full-stack — Java/Spring Boot backend, Next.js web, Expo/React Native mobile

**Technologies:**
- Flyway migrations (V16, V17)
- Spring Data JPA
- Next.js 14, TypeScript
- Expo / React Native

**Integration Points:**
- `backend/src/main/java/com/lucasxf/ed/domain/Tag.java` — entity
- `backend/src/main/java/com/lucasxf/ed/repository/TagRepository.java` — primary tag query
- `backend/src/main/java/com/lucasxf/ed/repository/UserTagRepository.java` — user-tag join query
- `backend/src/main/java/com/lucasxf/ed/service/TagService.java` — `createOrReuse()`, `renameTag()`
- `backend/src/main/java/com/lucasxf/ed/dto/TagResponse.java` — API DTO
- `backend/.../PokService.java` or POK controller — must accept `tagId` filter param
- `web/src/lib/tagApi.ts` — `Tag` interface
- `mobile/src/lib/tagApi.ts` — `Tag` interface (mirror of web)
- `web/src/components/poks/TagBadge.tsx` — renders `tag.name` → must switch to `tag.displayName`
- `web/src/components/poks/TagPicker.tsx` — renders `tag.name` in dropdown
- `web/src/components/poks/TagGroupedView.tsx` — uses `tag.name` as Map key and label
- `web/src/components/poks/TagGroup.tsx` — renders `label` (from `TagGroupedView`)
- `web/src/components/poks/PokCard.tsx` — passes tags to `TagBadge`
- `mobile/src/screens/app/LearningDetailScreen.tsx` line 201 — inline `tag.name` Text
- `mobile/src/components/feed/LearningCard.tsx` line 65 — inline `tag.name` Text

**Out of Scope:**
- AI tag suggestion changes (Phase 7 / `TagSuggestionPrompt` — unaffected by this spec)
- Tag deletion or merging workflows
- Tag rename by name (the existing `renameTag()` flow already exists; only transformation rules are updated)
- Mobile tag filter UI (FR12 is Should Have — can be deferred within this milestone without blocking completion)

---

## Acceptance Criteria

### AC1: New tag with multi-word name is stored canonically
**GIVEN** a user creates a tag with name `"Claude Code"`
**WHEN** the backend processes `TagService.createOrReuse()`
**THEN** the `tags` row has `name = "claude-code"` and `display_name = "Claude-Code"`

### AC2: Existing tag is reused by canonical name
**GIVEN** a tag `claude-code` already exists
**WHEN** a second user creates a tag `"claude code"` or `"Claude Code"` or `"CLAUDE-CODE"`
**THEN** no new row is inserted; the existing tag is reused

### AC3: API response includes displayName
**GIVEN** a tag with `display_name = "Claude-Code"`
**WHEN** `GET /api/v1/poks/{id}` is called
**THEN** the response body contains `"displayName": "Claude-Code"` in the tags array

### AC4: Feed filtering by tag returns only matching POKs
**GIVEN** user has POKs tagged with `"claude-code"` and `"java"`
**WHEN** `GET /api/v1/poks?tagId={claude-code-id}` is called
**THEN** only POKs tagged with `claude-code` are returned; java-only POKs are excluded

### AC5: Feed filtering by tag returns empty list when no POKs match
**GIVEN** a valid `tagId` that exists but has no POKs
**WHEN** `GET /api/v1/poks?tagId={id}` is called
**THEN** response is `200 OK` with an empty list

### AC6: Web TagFilter selects and clears correctly
**GIVEN** the web feed is showing all learnings
**WHEN** the user clicks a tag in `TagFilter`
**THEN** the feed rerenders with only learnings tagged with that tag
**AND** clicking the same tag again (or a "clear" control) restores the full feed

### AC7: Web input mask replaces spaces with dashes
**GIVEN** the tag input field in `TagPicker` is focused
**WHEN** the user types `"Spring Boot"`
**THEN** the input displays `"Spring-Boot"` in real time (spaces auto-replaced)

### AC8: Backfill migration is correct
**GIVEN** an existing tag with `name = "Claude code"` and no `display_name`
**WHEN** V17 backfill migration runs
**THEN** `display_name = "Claude-code"` and `name = "claude-code"` for that row

### AC9: Tags are displayed using displayName across all views
**GIVEN** a tag with `display_name = "React-Native"`
**WHEN** it appears in `TagBadge` (web), tag list in `LearningDetailScreen` (mobile)
**THEN** the rendered text is `"React-Native"` — not the canonical `"react-native"`

---

## Implementation Approach

### Architecture

Three-layer change flowing from DB outward:

1. **DB (V16 + V17 migrations):** Add `display_name` column → backfill → swap index
2. **Backend (entity → repository → service → DTO):** Add `displayName` field, apply transformation in service, expose in responses
3. **Frontend (types → components):** Add `displayName` to TypeScript interfaces, switch all render sites, add `TagFilter` component and feed filter state

The `pok_tags.tag_id` index (`idx_pok_tags_tag_id`, from V10) already exists — no new index needed for the feed filter endpoint.

**Tag grouping in `TagGroupedView`:** Currently uses `tag.name` as the Map key. After this change, use `tag.tagId` as the Map key (stable, opaque ID) and `tag.displayName` as the rendered label. This avoids collisions if two user-tag subscriptions share a canonical name but have different display names.

**`TagFilter` design:** Renders the current user's tag list (already fetched via `useTags` hook) as a horizontal chip list above the feed. Selected tag ID is held in React state; passed as `tagId` query param to the POK fetch hook. No new API beyond the `?tagId` param.

### Test Strategy

- [ ] Full TDD for: `TagService` (transformation logic, `createOrReuse`, `renameTag`), POK controller filter endpoint
- [ ] Partial TDD for: `TagRepository` query simplification (verify via integration test), `TagFilter` component (unit test with React Testing Library)
- [ ] Migration tests: verify V16 adds column with correct constraint; verify V17 backfill produces correct `name`/`display_name` for representative cases

### File Changes

**New:**
- `backend/src/main/resources/db/migration/V16__add_display_name_to_tags.sql` — add `display_name` column
- `backend/src/main/resources/db/migration/V17__backfill_tag_display_name.sql` — backfill + replace index
- `web/src/components/poks/TagFilter.tsx` — horizontal chip list for feed filtering

**Modified:**
- `backend/src/main/java/com/lucasxf/ed/domain/Tag.java` — add `displayName` field + column mapping
- `backend/src/main/java/com/lucasxf/ed/repository/TagRepository.java` — replace `findByNameIgnoreCase` with `findByName` (name is now canonical)
- `backend/src/main/java/com/lucasxf/ed/repository/UserTagRepository.java` — remove `LOWER()` from name comparison query
- `backend/src/main/java/com/lucasxf/ed/service/TagService.java` — add `normalise(input)` helper; apply to `createOrReuse()` and `renameTag()`
- `backend/src/main/java/com/lucasxf/ed/dto/TagResponse.java` — add `displayName` field; populate from `tag.getDisplayName()`
- Backend POK controller or service — add `tagId` optional filter to `GET /api/v1/poks`
- `web/src/lib/tagApi.ts` — add `displayName: string` to `Tag` interface
- `mobile/src/lib/tagApi.ts` — same
- `web/src/components/poks/TagBadge.tsx` — render `tag.displayName` (line 19, 29)
- `web/src/components/poks/TagPicker.tsx` — render `tag.displayName` in list items (line 106); add spaces→dashes input mask on the creation input
- `web/src/components/poks/TagGroupedView.tsx` — use `tag.tagId` as Map key; `tag.displayName` as label
- `mobile/src/screens/app/LearningDetailScreen.tsx` line 201 — render `tag.displayName`
- `mobile/src/components/feed/LearningCard.tsx` line 65 — render `tag.displayName`
- Web feed page — integrate `TagFilter` component + pass `tagId` state to fetch hook

**Migrations:**
- `V16__add_display_name_to_tags.sql` — `ALTER TABLE tags ADD COLUMN display_name VARCHAR(100) NOT NULL DEFAULT ''`
- `V17__backfill_tag_display_name.sql` — `UPDATE tags SET display_name = REPLACE(name, ' ', '-'), name = LOWER(REPLACE(name, ' ', '-'))` then `DROP INDEX idx_tags_name_lower` + `ALTER TABLE tags ADD CONSTRAINT tags_name_key UNIQUE (name)`

---

## Dependencies

**Blocked by:** None — this milestone is self-contained.

**Blocks:** None within Phase 8. Milestone 8.1 (Markdown Support) is fully independent.

**External:** None — `pok_tags.tag_id` index already exists (V10 migration).

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _(pending)_

### Architectural Decisions

_(pending)_

### Deviations from Spec
- _(none yet)_

### Lessons Learned
- _(pending)_
