# Tagging System

> **Status:** Draft
> **Created:** 2026-02-24
> **Implemented:** _pending_

---

## Context

Learners capture entries in bursts and later struggle to locate related ones. Without
structure, the feed is a flat chronological list with no way to browse by topic, identify
knowledge gaps, or group related entries. Tags provide a lightweight, user-driven
organizational layer that works alongside search.

**User problem:** "I know I wrote something about Spring Boot last month, but I can't find
it without scrolling through everything."

**Phase/Milestone:** Phase 2 — Organization & Discovery / Milestone 2.2

**What this milestone delivers:**
- Manual tag creation, assignment, and management
- Filtering the feed by tag
- AI-suggested tags (explicit extraction only — e.g., "I learned about Spring Boot
  transactions" → `#springboot`, `#transactions`), with mandatory user approval

**Related:**
- ROADMAP.md — Milestone 2.2
- Phase 7 / Milestone 7.1 — Intent-based AI tag suggestions (deferred; conceptual
  inference beyond explicit text extraction, e.g., identifying a Singleton pattern and
  suggesting `#designpatterns`)

---

## Requirements

### Functional

#### Tag Management

- [ ] **FR1** *(Must Have)* — A user can create a new tag by entering a free-text name.
  Tag names are trimmed of whitespace and stored case-preserved (case-insensitive for
  uniqueness within the same user's tag set).
- [ ] **FR2** *(Must Have)* — Duplicate tag creation is rejected. If a tag with the same
  name already exists (case-insensitive) for the same user, the system returns an error.
- [ ] **FR3** *(Should Have)* — A user can rename an existing tag. The rename propagates
  to all learnings currently assigned that tag. The rename is rejected if the new name
  conflicts with an existing tag name (case-insensitive).
- [ ] **FR4** *(Should Have)* — A user can delete a tag. Deleting a tag removes it from
  all learnings it was assigned to — the learning content is unaffected. The user sees a
  warning indicating how many learnings will be affected before confirming.
- [ ] **FR5** *(Must Have)* — Tags are strictly per-user (private). A user can only see,
  create, assign, rename, or delete tags they own.

#### Tag Assignment

- [ ] **FR6** *(Should Have)* — A user can assign one or more existing tags to a learning
  from the learning detail view or the learning editor. Manual assignments are stored with
  `source = MANUAL`.
- [ ] **FR7** *(Should Have)* — A user can remove a tag from a learning without deleting
  the tag itself. The tag remains in the user's tag list.
- [ ] **FR8** *(Should Have)* — The tag input supports autocomplete: as the user types,
  matching tags from their existing set are suggested. Selecting a suggestion assigns the
  existing tag; completing an entry with no match creates and assigns a new tag in one step.
- [ ] **FR9** *(Should Have)* — A learning may have zero or more tags. The UI handles
  learnings with many tags gracefully (no layout breakage).

#### Filtering

- [ ] **FR10** *(Must Have)* — A user can filter their feed by one or more tags. Only
  learnings assigned **all** selected tags are shown (AND semantics). The active filter is
  visible and clearable.
- [ ] **FR11** *(Must Have)* — The tag filter is accessible from the main feed without
  navigating to a separate page (inline or sidebar — consistent with the UX Mandate).
- [ ] **FR12** *(Should Have)* — When a filter is active, selected tag(s) are reflected in
  the URL so the view can be bookmarked. Access control is still enforced server-side — a
  different user visiting the URL sees only their own learnings.

#### AI Tag Suggestions

- [ ] **FR13** *(Must Have)* — After a learning is saved, the system asynchronously
  generates explicit tag suggestions by analysing the text content via an AI API. Explicit
  means the suggestion is directly supported by terms named in the text — semantic
  inference is out of scope here (Phase 7).
- [ ] **FR14** *(Must Have)* — AI-suggested tags are surfaced as a labelled, non-blocking
  prompt (e.g., "Suggested tags"). They are **never** applied silently or automatically.
- [ ] **FR15** *(Must Have)* — A user can approve suggested tags individually or all at
  once. Approved suggestions are assigned with `source = AI`.
- [ ] **FR16** *(Must Have)* — A user can reject suggested tags individually or all at
  once. Rejected suggestions are discarded and not re-suggested for the same learning.
- [ ] **FR17** *(Must Have)* — A user can edit a suggested tag name before approving.
  Edited-then-approved suggestions are stored with `source = MANUAL`.
- [ ] **FR18** *(Should Have)* — If a suggestion name matches an existing user tag
  (case-insensitive), approval resolves to the existing tag rather than creating a
  duplicate.
- [ ] **FR19** *(Could Have)* — The suggestion prompt is non-modal, deferrable, and does
  not interrupt the user's primary workflow.

#### Explicitly Out of Scope (This Milestone)

- **Phase 7** — Intent-based / semantic AI tag suggestions (conceptual inference).
- **Phase 7** — Shared or global tag taxonomies across users.
- **Phase 7** — Tag hierarchies or parent/child relationships.

### Non-Functional

1. **Performance — Autocomplete:** Tag autocomplete must return results within 200 ms
   (p95) for users with up to 500 tags. Filter client-side against a locally cached list;
   fall back to a debounced API call only when the cache is stale.
2. **Performance — Feed filter query:** Filtering by one or more tags must return results
   within 500 ms (p95) for up to 10,000 learnings and 500 tags. Requires DB indices on
   `pok_tags(tag_id)` and `pok_tags(pok_id)`.
3. **Performance — AI suggestion latency:** Suggestions are generated asynchronously. The
   save confirmation must appear immediately; suggestions should surface within 5 seconds
   for content up to 2,000 words.
4. **Security — Tag isolation:** All tag endpoints must enforce ownership. Any request
   referencing a tag or learning ID not owned by the requesting user returns
   `403 Forbidden` (not `404`, to avoid confirming resource existence).
5. **Security — AI pipeline:** The AI suggestion service receives only content belonging
   to the authenticated user. Suggestions are scoped to that user and never readable by
   another.
6. **Accessibility — Tag input:** Operable by keyboard alone (arrow keys to navigate
   suggestions, Enter to select, Backspace/Delete to remove assigned tags). Uses
   `role="combobox"` / `role="listbox"` / `role="option"` so screen readers announce
   options.
7. **Accessibility — Tag filter:** Reachable via keyboard tab order. Active filters
   announced to assistive technology (e.g., "Filtered by: springboot, transactions — 3
   results").
8. **i18n — UI labels:** All UI chrome (buttons, prompts, error messages, empty states,
   suggestion banners) is available in EN and PT-BR via `next-intl`. Tag names themselves
   are user-entered free text and are not translated. Examples: "Add tag" / "Adicionar
   etiqueta", "Suggested tags" / "Etiquetas sugeridas", "Approve" / "Aprovar",
   "Reject" / "Rejeitar", "Delete tag?" / "Excluir etiqueta?".
9. **i18n — Pluralisation:** Strings referencing counts (e.g., "This tag is used in 3
   learnings") use ICU plural syntax for correct EN and PT-BR plural forms.
10. **Data integrity — Tag deletion:** Deleting a tag is transactional. The `tags` row and
    all associated `pok_tags` rows are removed atomically.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web)

**Technologies:**
- Backend: Java 21, Spring Boot 4.0+, Spring Data JPA, Spring `@Async` for suggestion
  pipeline, Anthropic Messages API (for explicit tag extraction)
- Web: Next.js 14+, TypeScript 5+, Tailwind CSS 3+, next-intl, Vitest

**Integration Points:**
- `PokService` — triggers async suggestion after `create()`
- `PokResponse` — extended with `List<TagResponse> tags` and
  `List<TagSuggestionResponse> pendingSuggestions`
- `GlobalExceptionHandler` — handles `TagNotFoundException`, `TagConflictException`
- `SecurityConfig` — new `/api/v1/tags/**` and `/api/v1/poks/*/tags/**` routes require
  authentication

**AI Suggestion Design Decision (to resolve during implementation):**
- **Option A — Anthropic Claude API** (recommended): `POST /v1/messages` with a system
  prompt instructing explicit keyword extraction. Natural fit — learnimo already aligns
  with Anthropic. Add `ANTHROPIC_API_KEY` env var. Requires `spring-webflux` or
  `spring-boot-starter-web` `RestClient` for HTTP.
- **Option B — Simple keyword extraction** (no external API): regex + stop-word filtering.
  No cost, no latency risk, but lower quality. Acceptable MVP if API integration is
  deferred.
- Decision: record in Post-Implementation Notes.

**Out of Scope:**
- Mobile app tag support (Phase 3+)
- Tag analytics / usage counts surfaced to the user
- AI semantic inference (Phase 7)

---

## Acceptance Criteria

### AC1: Create a tag

**GIVEN** I am logged in and have no tag named "docker"
**WHEN** I create a tag named "docker"
**THEN** "docker" appears in my tag list and can be assigned to learnings

### AC2: Duplicate tag rejected

**GIVEN** I already have a tag named "Docker"
**WHEN** I attempt to create a tag named "docker" (case-insensitive match)
**THEN** I see an error indicating the tag already exists and no new tag is created

### AC3: Tag name is trimmed

**GIVEN** I create a tag with name "  spring boot  "
**THEN** the stored name is "spring boot"

### AC4: Assign an existing tag to a learning

**GIVEN** I have a tag "java" and a learning "Understanding generics"
**WHEN** I add the tag "java" to that learning
**THEN** the learning displays "java" and the assignment is stored with `source = MANUAL`

### AC5: Autocomplete suggests existing tags

**GIVEN** I have tags "kotlin", "kubernetes", "kafka"
**WHEN** I type "k" in the tag input on a learning
**THEN** the dropdown shows "kafka", "kotlin", "kubernetes"

### AC6: New tag created and assigned in one step via autocomplete

**GIVEN** I have no tag "graphql"
**WHEN** I type "graphql" in the tag input and confirm
**THEN** a new tag "graphql" is created and assigned with `source = MANUAL`

### AC7: Remove a tag from a learning

**GIVEN** a learning has the tag "java"
**WHEN** I remove "java" from that learning
**THEN** the learning no longer shows "java" but the tag still exists in my tag list

### AC8: Filter feed by single tag

**GIVEN** I have 10 learnings, 3 of which are tagged "docker"
**WHEN** I select "docker" in the feed filter
**THEN** only the 3 "docker" learnings are shown and the active filter is visible

### AC9: Filter feed by multiple tags (AND semantics)

**GIVEN** learning A is tagged "java" and "spring", B is "java" only, C is "spring" only
**WHEN** I filter by "java" and "spring"
**THEN** only learning A is shown

### AC10: Clear active filter

**GIVEN** the feed is filtered by "docker"
**WHEN** I clear the filter
**THEN** all my learnings are shown

### AC11: Empty state when no learnings match tag

**GIVEN** the tag "rust" is assigned to no learnings
**WHEN** I filter by "rust"
**THEN** an empty-state message is shown (e.g., "No learnings tagged rust yet")

### AC12: Rename a tag

**GIVEN** I have a tag "k8s" assigned to 2 learnings
**WHEN** I rename "k8s" to "kubernetes"
**THEN** both learnings show "kubernetes" and "k8s" no longer exists in my tag list

### AC13: Rename rejected on name conflict

**GIVEN** I have tags "k8s" and "kubernetes"
**WHEN** I attempt to rename "k8s" to "kubernetes"
**THEN** an error is shown and both tags remain unchanged

### AC14: Delete a tag with warning

**GIVEN** I have tag "legacy" assigned to 4 learnings
**WHEN** I initiate deletion of "legacy"
**THEN** I see "This tag is used in 4 learnings. Deleting it will remove it from all of them."
**WHEN** I confirm
**THEN** "legacy" is removed from the tag list and from all 4 learnings; learning content unchanged

### AC15: Cancel tag deletion

**GIVEN** I initiate deletion of tag "legacy"
**WHEN** I cancel
**THEN** the tag and all its assignments are unchanged

### AC16: AI suggestion — approve all

**GIVEN** I save a learning "Today I learned about Spring Boot transactions and @Transactional propagation"
**WHEN** the suggestion engine processes it
**THEN** a non-blocking prompt shows suggested tags (e.g., "springboot", "transactions")
**WHEN** I approve all
**THEN** both tags are assigned with `source = AI`

### AC17: AI suggestion — reject all

**GIVEN** the suggestion prompt shows "springboot" and "transactions"
**WHEN** I reject all
**THEN** no tags are assigned and the prompt is dismissed

### AC18: AI suggestion — partial approve/reject

**GIVEN** the prompt shows "springboot" and "transactions"
**WHEN** I approve "springboot" and reject "transactions"
**THEN** only "springboot" is assigned with `source = AI`

### AC19: AI suggestion — edit before approve

**GIVEN** the prompt shows suggested tag "springboot"
**WHEN** I edit it to "spring-boot" and approve
**THEN** "spring-boot" is assigned with `source = MANUAL` and "springboot" is not created

### AC20: AI suggestion resolves to existing tag on approval

**GIVEN** I already have a tag "Spring Boot"
**AND** the AI suggests "springboot"
**WHEN** I approve the suggestion
**THEN** the existing "Spring Boot" tag is assigned (case-insensitive match) and no duplicate is created

### AC21: AI suggestion does not block save confirmation

**WHEN** I save a learning
**THEN** the save confirmation appears immediately
**AND** the suggestion prompt appears separately afterward (never before the confirmation)

### AC22: Tag isolation — user cannot see another user's tags

**GIVEN** user alice has tag "alice-private"
**WHEN** user bob opens the tag input
**THEN** "alice-private" does not appear

### AC23: Tag isolation — cross-user API assignment returns 403

**GIVEN** user alice has a tag with id `tag-alice-001`
**WHEN** user bob POSTs to assign `tag-alice-001` to one of bob's learnings
**THEN** response is `403 Forbidden` and no assignment is created

### AC24: Tag isolation — filtered feed shows only own learnings

**GIVEN** alice and bob each have learnings tagged with their own separate "java" tags
**WHEN** bob filters by "java"
**THEN** only bob's learnings are shown; alice's are never included

---

## Implementation Approach

### Architecture

Three new layers added in parallel to the existing POK pattern:

**Backend:**
- `Tag` entity (id, userId, name, createdAt) — per-user, no global tags
- `PokTag` join entity (pokId, tagId, source enum: MANUAL | AI) — replaces a simple
  join table to carry the `source` metadata
- `PokTagSuggestion` entity (id, pokId, userId, suggestedName, status: PENDING |
  APPROVED | REJECTED) — stores AI suggestions pending user decision
- `TagService` — CRUD + ownership validation + duplicate detection (case-insensitive)
- `TagSuggestionService` — async pipeline: receive content → call AI API → persist
  PENDING suggestions
- `TagController` — REST endpoints at `/api/v1/tags` and nested
  `/api/v1/poks/{id}/tags`
- `PokResponse` extended: `List<TagResponse> tags`, `List<TagSuggestionResponse>
  pendingSuggestions`

**Web:**
- `TagInput` component — combobox with autocomplete, create-on-type
- `TagBadge` component — display chip for an assigned tag
- `TagFilter` component — inline filter panel on the feed page
- `TagSuggestionPrompt` component — non-modal suggestion review UI
- `tagApi.ts` — all tag-related API calls
- `useTags` hook — cached tag list, invalidation on create/delete

### Test Strategy

**Full TDD** for:
- `TagService` (unit, Mockito) — all CRUD paths, ownership enforcement, duplicate logic
- `TagSuggestionService` (unit, Mockito) — async trigger, AI response parsing, suggestion
  persistence
- `TagController` (MockMvc) — all endpoints, auth required, 403 on cross-user access
- Integration test (Testcontainers) — full flow: create tag → assign → filter → suggest
  → approve

**Partial TDD** for:
- Web components (Vitest/jsdom) — render, keyboard interaction, accessibility attributes

### File Changes

**New — Backend:**
- `backend/src/main/java/com/lucasxf/ed/domain/Tag.java`
- `backend/src/main/java/com/lucasxf/ed/domain/PokTag.java`
- `backend/src/main/java/com/lucasxf/ed/domain/PokTagSuggestion.java`
- `backend/src/main/java/com/lucasxf/ed/repository/TagRepository.java`
- `backend/src/main/java/com/lucasxf/ed/repository/PokTagRepository.java`
- `backend/src/main/java/com/lucasxf/ed/repository/PokTagSuggestionRepository.java`
- `backend/src/main/java/com/lucasxf/ed/service/TagService.java`
- `backend/src/main/java/com/lucasxf/ed/service/TagSuggestionService.java`
- `backend/src/main/java/com/lucasxf/ed/controller/TagController.java`
- `backend/src/main/java/com/lucasxf/ed/dto/TagResponse.java`
- `backend/src/main/java/com/lucasxf/ed/dto/CreateTagRequest.java`
- `backend/src/main/java/com/lucasxf/ed/dto/UpdateTagRequest.java`
- `backend/src/main/java/com/lucasxf/ed/dto/TagSuggestionResponse.java`
- `backend/src/main/java/com/lucasxf/ed/exception/TagNotFoundException.java`
- `backend/src/main/java/com/lucasxf/ed/exception/TagConflictException.java`

**New — Migrations:**
- `backend/src/main/resources/db/migration/V8__create_tags_table.sql`
- `backend/src/main/resources/db/migration/V9__create_pok_tags_table.sql`
- `backend/src/main/resources/db/migration/V10__create_pok_tag_suggestions_table.sql`

**New — Web:**
- `web/src/components/poks/TagInput.tsx`
- `web/src/components/poks/TagBadge.tsx`
- `web/src/components/poks/TagFilter.tsx`
- `web/src/components/poks/TagSuggestionPrompt.tsx`
- `web/src/lib/tagApi.ts`
- `web/src/hooks/useTags.ts`

**Modified — Backend:**
- `dto/PokResponse.java` — add `tags`, `pendingSuggestions` fields
- `service/PokService.java` — trigger async suggestion after `create()`
- `exception/GlobalExceptionHandler.java` — handle new exceptions

**Modified — Web:**
- `components/poks/PokCard.tsx` — render tag badges
- `components/poks/PokForm.tsx` — add TagInput
- `app/[locale]/poks/page.tsx` — add TagFilter + tag URL param
- `locales/en.json` — add `tags.*` and `suggestions.*` keys
- `locales/pt-BR.json` — add same keys in PT-BR

---

## Dependencies

**Blocked by:** None — all Phase 1 and Milestone 2.1 work is merged to develop.

**Blocks:**
- Milestone 2.3 (Visualization — Tag-grouped view) depends on tags existing
- Milestone 7.1 (AI-Assisted Tag Suggestions) extends the suggestion pipeline built here

**External:**
- `ANTHROPIC_API_KEY` env var (Railway + local `.env`) if Option A is chosen for AI
  suggestions
- No new library dependencies anticipated (Spring's `RestClient` or `WebClient` handles
  the API call; both are already on the classpath)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
_pending_

### Architectural Decisions

**Decision: AI suggestion backend (Option A vs B)**
- **Options:** A — Anthropic Claude API, B — keyword regex/NLP (no external API)
- **Chosen:** _TBD during implementation_
- **Rationale:** _TBD_

### Deviations from Spec
_none yet_

### Lessons Learned
_none yet_
