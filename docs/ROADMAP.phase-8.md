# Phase 8: Knowledge Enrichment

> Status: **⏳ Planned**

---

**Goal:** Make captured knowledge richer, better organized, and more navigable — through markdown rendering, a stronger tagging system, and a graph-based visualization of learning connections.

**Design Principles:**
- Content is sacred — markdown support enhances display, never modifies user-authored content
- Tag normalization is automatic and transparent — the learner sees their input, the system handles canonicalization
- Knowledge Paths are personal maps, not social rankings — no vanity metrics, no public comparisons
- Build on existing infrastructure — reuse Phase 3.2 AI Connections as graph edges for Knowledge Paths

---

## Milestone 8.2: Tag Improvements — `docs/specs/features/tag-improvements.md`

> Tags currently have no search/filter, store only the original casing of the first creator, and allow multi-word tags with spaces. This milestone fixes all three. **SDD: spec required before implementation.**

### 8.2.1: Tag Casing and Canonical Storage

| # | Feature | Priority |
|---|---------|----------|
| 8.2.1 | DB migration: add `display_name VARCHAR(100) NOT NULL` column to `tags` table | Must Have |
| 8.2.2 | Backfill migration: `display_name = REPLACE(name, ' ', '-')`, then `name = LOWER(REPLACE(name, ' ', '-'))` | Must Have |
| 8.2.3 | Update `Tag` entity: `name` = canonical lowercase+dashes, `displayName` = as-typed with dashes | Must Have |
| 8.2.4 | Update `TagService.createOrReuse()`: apply spaces→dashes + lowercase to `name`, spaces→dashes only to `displayName` | Must Have |
| 8.2.5 | Simplify `TagRepository`: `name` column is canonical — drop the `LOWER()` wrapper from queries | Must Have |
| 8.2.6 | Update all API responses to return `displayName` for UI rendering | Must Have |
| 8.2.7 | Update frontend components (`TagBadge`, `TagPicker`, `TagSection`, `TagGroupedView`) to render `displayName` | Must Have |

**Transformation chain:** user types `"Claude Code"` → mask shows `"Claude-Code"` → stored as `displayName = "Claude-Code"`, `name = "claude-code"`

**Backfill applies both rules:** existing `"Claude code"` → `displayName = "claude-code"`, `name = "claude-code"`

**DB note:** the unique index `idx_tags_name_lower ON tags (LOWER(name))` can be replaced with a plain `UNIQUE` constraint on `name` after migration, since `name` is already canonical.

### 8.2.2: Tag Naming — Spaces to Dashes

| # | Feature | Priority |
|---|---------|----------|
| 8.2.8 | Backend: `replace(" ", "-")` enforcement in `TagService.createOrReuse()` (and `renameTag()`) | Must Have |
| 8.2.9 | Frontend: input mask auto-replacing spaces with dashes as user types (web + mobile) | Should Have |

**Note:** Backend enforcement is the source of truth. Frontend mask is UX polish — prevents seeing the transformation as a surprise on save.

### 8.2.3: Tag Search / Feed Filtering

| # | Feature | Priority |
|---|---------|----------|
| 8.2.10 | Backend endpoint: `GET /api/v1/poks?tagId={id}` filter by tag (DB index on `pok_tags.tag_id` already exists) | Must Have |
| 8.2.11 | Web: `TagFilter` component for the feed (deferred from Phase 2.2) | Must Have |
| 8.2.12 | Mobile: tag filter UI | Should Have |

**Tests**

| # | Feature | Priority |
|---|---------|----------|
| 8.2.13 | Unit + integration tests for casing, naming, and search changes | Must Have |

---

## Milestone 8.1: Markdown Support

> POK content renders as plain text today. This milestone adds full markdown rendering across web and mobile. **No spec required — mechanical pattern application (install libs, create wrapper components, swap render sites).**

| # | Feature | Priority | Platform |
|---|---------|----------|----------|
| 8.1.1 | Add `react-markdown` + `remark-gfm` to web dependencies | Must Have | Web |
| 8.1.2 | Add `rehype-sanitize` for HTML sanitization (XSS prevention) | Must Have | Web |
| 8.1.3 | Create `MarkdownContent` component (web) | Must Have | Web |
| 8.1.4 | Replace plain text rendering on ViewPokPage, PokCard preview, LearnerProfilePage | Must Have | Web |
| 8.1.5 | Add `react-native-markdown-display` to mobile dependencies | Must Have | Mobile |
| 8.1.6 | Create `MarkdownContent` component (mobile) | Must Have | Mobile |
| 8.1.7 | Replace plain text rendering on LearningDetailScreen, LearningCard preview | Must Have | Mobile |
| 8.1.8 | Markdown rendering for POK titles (web + mobile) | Should Have | Both |
| 8.1.9 | Unit tests for markdown components (web + mobile) | Must Have | Both |

**Implementer notes:**
- Web detail page (`web/src/app/[locale]/poks/[id]/page.tsx` line 132): `prose prose-gray` Tailwind classes already wrap the content div — swapping the inner `<p>` for `<MarkdownContent>` will make headings, lists, code blocks, and bold/italic render automatically
- Web: `rehype-sanitize` integrates as a plugin inside `react-markdown`'s pipeline — no separate DOMPurify wrapper needed
- Mobile: `react-native-markdown-display` renders to native `<Text>`/`<View>` components; styled via a `style` prop object
- Remove `whitespace-pre-wrap` class when switching to markdown — markdown handles paragraph spacing natively
- Learner profile page (`web/src/app/[locale]/learners/[handle]/page.tsx` line 118): needs `prose` wrapper added (missing today)
- LearningCard preview (web + mobile): strip markdown syntax before truncating, or render with height/line clamp

---

## Milestone 8.3: Knowledge Paths — ⏸️ Postponed

> Deferred to after Phase 6 (Social capabilities). Visual map of POK connections and tag relationships — grouped by major learning category.

**i18n:** "Knowledge Paths" (EN) / "Caminhos de Aprendizado" (PT-BR)

When resumed, this milestone will require its own `/write-spec` session before implementation.

---

## Milestone Dependencies

- 8.2 and 8.1 are fully independent and parallelizable
- Execution order: **8.2 → 8.1** (tag data quality first, then richer content display)
- 8.3 resumes after Phase 6 completes

---

## Exit Criteria

- [ ] Tags are stored with canonical lowercase+dashes `name` and a `display_name` column
- [ ] Tags are displayed as the learner typed them (with dashes instead of spaces)
- [ ] Tag-based filtering works in the feed (web, at minimum)
- [ ] POK content renders markdown in all views (web + mobile): headings, bold, italics, code blocks, lists
