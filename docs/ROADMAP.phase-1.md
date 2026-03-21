# Phase 1: MVP

> Status: **🔄 Active** — exit criterion pending (1+ week usage)

---

**Goal:** Functional web app for personal use with core POK management features.

---

## Completed Milestones

### Milestone 1.1: Authentication ✅

| # | Feature | Status |
|---|---------|--------|
| 1.1.1 | User registration (email/password) | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.2 | User login (email/password) | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.3 | Google OAuth login | ✅ Backend + Web (PR #20) |
| 1.1.4 | JWT session management | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.5 | Password reset flow | ✅ Implemented (2026-02-21) |

### Milestone 1.2: POK CRUD ✅

| # | Feature | Status |
|---|---------|--------|
| 1.2.1 | Create POK endpoint (backend) | ✅ Backend (feat/pok-crud) |
| 1.2.2 | Read POK endpoints (backend) | ✅ Backend (feat/pok-crud) |
| 1.2.3 | Update POK endpoint (backend) | ✅ Backend (feat/pok-crud) |
| 1.2.4 | Delete POK endpoint (backend) | ✅ Backend (feat/pok-crud) |
| 1.2.5 | POK CRUD UI (web) | ✅ Web (feat/pok-crud) |
| 1.2.6 | Input validation | ✅ Backend + Web (feat/pok-crud) |
| 1.2.7 | Success/error feedback UI | ✅ Web (feat/pok-crud) |

### Milestone 1.3: POK Listing & Search ✅

| # | Feature | Status |
|---|---------|--------|
| 1.3.1 | List all POKs (paginated) | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.2 | Keyword search | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.3 | Filter by date range | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.4 | Sort by date created/updated | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.5 | Empty states and loading UI | ✅ Web (feat/pok-listing-search) |

### Milestone 1.4: UI/UX Polish ✅

| # | Feature | Status |
|---|---------|--------|
| 1.4.1 | Dark mode (default) | ✅ Web (feat/dark-mode-i18n) |
| 1.4.2 | Light mode toggle | ✅ Web (feat/dark-mode-i18n) |
| 1.4.3 | Responsive design (mobile-friendly web) | ✅ Web (feat/dark-mode-i18n) |
| 1.4.4 | i18n: English support | ✅ Web (feat/dark-mode-i18n) |
| 1.4.5 | i18n: Portuguese (BR) support | ✅ Web (feat/dark-mode-i18n) |
| 1.4.6 | Accessibility basics (contrast, focus states) | ✅ Web (feat/dark-mode-i18n) |

### Milestone 1.5: Deployment (learnimo.net) ✅

| # | Task | Status |
|---|------|--------|
| 1.5.1 | Supabase DB setup | ✅ Done |
| 1.5.2 | Railway backend deployment | ✅ Done (engineering-daybook-production.up.railway.app) |
| 1.5.3 | Vercel web deployment + learnimo.net domain (learnimo.com.br alias added 2026-02-25) | ✅ Done (learnimo.net · learnimo.com.br) |
| 1.5.4 | Google OAuth production redirect URIs | ✅ Done |

### Production Bug Fix (2026-02-20) ✅

| Task | Status |
|------|--------|
| Diagnose Google Sign-Up 500 — root cause: `SPRING_DATASOURCE_URL` pointing to PgBouncer pooler | ✅ Done |
| Auth integration tests (Testcontainers) — email/password + Google OAuth (`AuthIntegrationTest`) | ✅ Done |
| Add `spring-boot-starter-flyway` to `pom.xml` (required in Spring Boot 4) | ✅ Done |
| Switch `DB_HOST` to Supabase IPv4 session-mode pooler (Railway IPv6 incompatibility) | ✅ Done |
| Added explicit `driver-class-name: org.postgresql.Driver` to `application.yml` | ✅ Done |
| Removed `database-platform` from `application.yml` | ✅ Done |
| Disabled Flyway in test profile (`application-test.yml`) | ✅ Done |
| Fixed HomeCta auth-aware navigation | ✅ Done |

### Production Bug Fix — Learnings Feed Invisible (2026-02-25) ✅

Root cause: three combined bugs prevented logged-in users from seeing their learnings (empty state shown instead of POKs).

| Task | Status |
|------|--------|
| `SameSite=Strict` cookie blocked cross-origin requests (learnimo.net → railway.app) — changed to `SameSite=None` in `CookieHelper.java` | ✅ Done |
| `/error` path not in Spring Security `permitAll()` — caused 401 response with empty body on Spring error dispatch — added to `SecurityConfig.java` | ✅ Done |
| `!error` falsy check in `page.tsx` treated empty-string error (HTTP/2 always has `statusText=""`) as "no error" — fixed to `error === null` | ✅ Done |

### Milestone 1.6: Web Testing Quality (partial)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.6.1 | Page-level behavior tests (Vitest) — all pages, both auth states | Should Have | ✅ Done (2026-02-20) |
| 1.6.2 | E2E tests with Playwright — 4 critical user journeys | Should Have | ✅ Done (2026-02-25, chore/web-e2e-integration-tests) |

> **Phase B (Playwright E2E):** Completed. `@playwright/test` installed; `web/e2e/` has 5 passing tests covering all 4 journeys. Uses `page.route()` to mock all backend API calls — no live backend needed. Also added auth redirect to poks list page (unauthenticated users redirected to /login).
>
> **2026-03-11 — E2E quality gates expansion:** Suite grown to 46 tests across 6 spec files covering all major flows (create/edit/delete/timeline/tags/visibility/search/semantic search/profile/settings). Fixed 5 previously-broken tests (were never run as quality gates). Added `@vitest/coverage-v8` with 50% line threshold (baseline ~54%; target 80%). CI now enforces Playwright E2E + Vitest coverage on every PR. `/finish-session` and `/fix-pr` commands run E2E as a blocking gate.

### Milestone 1.7: MVP UX Review ✅

| # | Issue | Status |
|---|-------|--------|
| 1.7.1 | Session lost on F5/refresh — JWT in `useRef` (in-memory only) | ✅ Done (feat/persistent-user-sessions) |
| 1.7.2 | Home page was an empty "Get Started" screen | ✅ Done (chore/mvp-ux-review) |
| 1.7.3 | Post-login landed on home, not feed | ✅ Done (chore/mvp-ux-review) |
| 1.7.4 | "learnimo" title not clickable | ✅ Done (chore/mvp-ux-review) |
| 1.7.5 | Feed used multi-column grid | ✅ Done (chore/mvp-ux-review) |
| 1.7.6 | General visual quality — UI design pass | ✅ Done (chore/visual-quality, 2026-03-01) |
| 1.7.7 | No inline quick-entry (Phase A content-only textarea) | ✅ Done (chore/mvp-ux-review) |
| 1.7.8 | Google login button styling | ✅ Done (chore/mvp-ux-review) |
| 1.7.9 | My Learnings screen bug fixes (EmptyState on errors, QuickEntry title field, label casing) | ✅ Done (fix/my-learnings-screen) |

> **1.7.6 — General Visual Quality (chore/visual-quality, 2026-03-01):** 6 phases of work across 6 commits. Standardized palette to `slate-*`, added `fadeIn`/`slideUp` animation tokens, replaced raw `blue-*` with `primary-*` token in 6 components, extracted `ui/Alert.tsx` / `ui/Textarea.tsx` / `ui/Card.tsx` (eliminated 12 inline-alert copies), added `ui/Select.tsx` (accessible keyboard-nav dropdown replacing native `<select>`), removed double padding from 5 content pages, polished 404 page/LogoLink/SearchBar/PokCard/QuickEntry. 33 test files, 286 tests passing, production build clean.

### PR #104 Review Fixes (chore/fix-home-and-create-pok-screens, 2026-03-01) ✅

Code quality and correctness fixes addressing 10 review items from PR #104 (develop → main). No new features; all changes are correctness, spec compliance, and defensive coding.

| Area | Fix |
|------|-----|
| `CreatePokRequest.java` | `String content` type moved to its own line below stacked annotations; added `@Size(max = 50)` on `tagIds` to guard against N+1 exhaustion |
| `TagService.java` | Added null guard on `userTag.getTag()` with `log.warn` in `assignTagsToNewPok` loop |
| `PokServiceTest.java` | Applied `ReflectionTestUtils.setField` for non-null `pokId` in delegation tests (avoids NPE from `@GeneratedValue` fields being null outside JPA context) |
| `PokCard.tsx` | Fixed `<button>` nested inside `<Link>` (invalid HTML) — outer `<div relative>`, `<Link>` wraps article, edit button is an absolute-positioned sibling |
| `poks/[id]/page.tsx` | Fixed `<Button>` nested inside `<Link>` — replaced with styled `<span>` inside `<Link>` |
| `PokForm.tsx` | Renamed prop `renderAfterContent` → `afterContent` (`render*` prefix implies a function, not a ReactNode slot) |
| `poks/new/page.tsx` | Updated prop name to match `PokForm` rename |
| `TagPicker.tsx` | Added `disabled={isBusy}` to available-tag buttons during async tag creation |
| `.claude/settings.json` | Removed machine-specific absolute paths |
| `CLAUDE.md` | Added directive: machine-specific paths must go in `settings.local.json`, not `settings.json` |

### Infrastructure / Tooling (chore/git-cleanup, 2026-03-04) ✅

Housekeeping session: GitHub Actions CI tooling added and repository cleaned up.

| Task | Status |
|------|--------|
| Investigated Claude GitHub integration — confirmed never set up (repo uses Copilot + Codex for PR reviews) | ✅ Done |
| Installed Claude Code GitHub Action — created `.github/workflows/claude.yml` using `anthropics/claude-code-action@v1` with auto-PR-review and `@claude` mention support (PR #119 → `develop`) | ✅ Done |
| Removed 31 local merged branches and 38 remote merged branches | ✅ Done |
| Deleted 9 stale worktrees | ✅ Done |
| Added branch-deletion safety directive to `CLAUDE.md` Git Workflow section | ✅ Done |

### Hook Metrics Cleanup (chore/hook-metrics-cleanup, 2026-03-04) ✅

Automation/tooling chore: `track-usage.py` PostToolUse hook extended and usage stats reorganized.

| Task | Status |
|------|--------|
| Added `Skill` tool handler to `.claude/scripts/track-usage.py` so slash commands invoked via the Skill tool are tracked correctly | ✅ Done |
| Added `fix-pr` to `KNOWN_COMMANDS` list in `track-usage.py` | ✅ Done |
| Added `Skill` to PostToolUse hook matcher in `.claude/settings.json` | ✅ Done |
| Reorganized `.claude/metrics/usage-stats.toml` — pre-seeded missing commands, cleaned up test entries | ✅ Done |

### Cross-Session Metrics Safety (chore/cross-session-metrics, 2026-03-06) ✅

Tooling fix: resolved a concurrency bug where parallel Claude Code sessions in separate worktrees would conflict on `usage-stats.toml` by writing to it simultaneously. (PR review: collision-safe encoding + --only flag fix)

| Task | Status |
|------|--------|
| Modified `.claude/scripts/track-usage.py` to write per-session delta files to `.claude/metrics/sessions/{branch}.toml` instead of updating `usage-stats.toml` in-place | ✅ Done |
| Created `.claude/commands/compile-metrics.md` — new `/compile-metrics` slash command that aggregates session delta files into the canonical `usage-stats.toml` on `develop` | ✅ Done |
| Updated `.claude/commands/finish-session.md` and `.claude/commands/create-pr.md` to stage session delta files instead of the canonical file | ✅ Done |
| Added 15 unit tests in `.claude/scripts/test_track_usage.py` (all passing) | ✅ Done |

### v0.dev Prompt Generation + Spec-to-Screen Workflow (chore/generate-v0-prompt-command, 2026-03-07) ✅

Tooling enhancement: added `/generate-v0-prompt` slash command and redesigned the spec-to-screen workflow so UI/UX is a first-class, structured section in specs rather than re-extracted each time.

| Task | Status |
|------|--------|
| Created `.claude/commands/generate-v0-prompt.md` with YAML frontmatter | ✅ Done |
| Registered in `KNOWN_COMMANDS` (track-usage.py) via sync script | ✅ Done |
| Added entry to `usage-stats.toml`, bumped `total_commands` to 21 | ✅ Done |
| Updated `commands/README.md` table | ✅ Done |
| Added `## Screens` section to `docs/specs/template.md` (tool-agnostic, self-contained screen blocks) | ✅ Done |
| Updated `/write-spec` to delegate to `pixl` agent for screen definition (Phase 2.1); removed phantom `frontend-ux-specialist` reference | ✅ Done |
| Simplified `/generate-v0-prompt` Rule 2 to read `## Screens` directly; added legacy fallback for old specs; removed hard-coded screen mapping table | ✅ Done |
| Updated `/implement-spec` to recognize `## Screens` as optional section for component planning | ✅ Done |

### Automation Registry Sync (chore/tooling, 2026-03-06) ✅

Tooling chore: improved custom-agent tracking accuracy and automated registry maintenance for `.claude/` commands and agents.

| Task | Status |
|------|--------|
| Fixed `track-usage.py` custom-agent tracking — added `KNOWN_AGENTS` set with marker comments; when `subagent_type == "general-purpose"`, hook now scans `tool_input["description"]` for known agent names so `tech-writer`, `steward`, etc. are tracked correctly instead of falling through as generic subagents | ✅ Done |
| Created `.claude/scripts/sync-automation-registry.py` — auto-sync script that scans frontmatter from `.claude/agents/*.md` and `.claude/commands/*.md` and regenerates `KNOWN_AGENTS`/`KNOWN_COMMANDS` blocks in `track-usage.py`, commands table in `commands/README.md`, and agents table in `agents-readme.md` | ✅ Done |
| Updated `.claude/agents-readme.md` — removed archived `pulse` agent row, added auto-generated table markers, added Name Origins table, renumbered sections 8–11 | ✅ Done |
| Updated `.claude/agents/automation-sentinel.md` — added `Type` column (Built-in/Custom) requirement to report template; updated data source reference from `pulse` to `/compile-metrics` | ✅ Done |
| Updated `.claude/commands/compile-metrics.md` — added Step 0 to run sync script before compilation; updated Step 8 to require `Type` column in sentinel Agent Usage table | ✅ Done |

### Automation Ecosystem Housecleaning (chore/automation-workflow-housecleaning, 2026-03-08) ✅

Tooling chore: audited the full `.claude/` automation ecosystem based on an automation-sentinel critical review report and archived redundant / low-value artifacts.

| Task | Status |
|------|--------|
| Archived `session-optimizer` agent (redundant with `/start-session`) | ✅ Done |
| Archived 10 slash commands: `quick-test`, `build-quiet`, `verify-quiet`, `test-service`, `update-roadmap`, `review-code`, `api-doc`, `docker-start`, `docker-stop`, `resume-session` | ✅ Done |
| Added delegated invocation tracking limitation note to `automation-sentinel.md` | ✅ Done |
| Removed archived entries from `usage-stats.toml`; updated health counters | ✅ Done |
| Regenerated `KNOWN_AGENTS` / `KNOWN_COMMANDS` in `track-usage.py` | ✅ Done |
| Regenerated `agents-readme.md` and `commands/README.md` tables | ✅ Done |
| Removed stale `/update-roadmap` reference from `CLAUDE.md` Task Management section | ✅ Done |

### PR #177 Review Fixes (fix-pr/177, 2026-03-11) ✅

PR review fixes for PR #177 (feat: Library at Dusk login redesign + mobile social discovery, develop → main). No new features. Three Copilot review comments approved in triage, two pre-existing CI failures resolved.

| Area | Fix |
|------|-----|
| `web/RegisterFormV2.tsx` | Replaced undefined CSS custom properties (`--input-bg`, `--input-text`, `--error`) with established Tailwind design tokens (`bg-input`, `text-foreground`, `border-destructive`) |
| `web/tailwind.config.ts` | Restored primary numeric scale (50–950) mapped to ember-cta palette (had been accidentally dropped in an earlier commit) |
| `mobile/useLearnerProfile.ts` | Wired `controller.signal` through to `getLearnerProfile()` call; removed stale `cancelled` flag pattern |
| `web/RegisterPage.test.tsx` | Updated mock target from `RegisterForm` → `RegisterFormV2`; removed stale login-link assertion matching old component |
| `mobile/` — coverage 57% → 80.4% | Added `Button.test.tsx` (100% line coverage) and `Text.test.tsx` (100% line coverage) to `src/components/ui/__tests__/`; expanded `LearnerResultCard.test.tsx` with direct function-call tests |
| Claude GitHub Action follow-ups | 10 additional auto-committed fixes: CSS token cleanup in `RegisterFormV2`, `Alert.tsx`, `layout.tsx`, `globals.css` |

### Command Context Optimization (chore/command-context-optimization, 2026-03-10) ✅

Tooling chore: reduced token footprint across three slash commands by moving repeated inline logic into agents.

| Task | Status |
|------|--------|
| Added `keepr` agent (`.claude/agents/keepr.md`) — owns PR review evaluation framework (4-axis rubric: correctness, consistency, proportionality, timing; Accept/Reject/Defer/Question verdicts) | ✅ Done |
| Slimmed `review-pr` Step 4 from ~70 lines to ~15 lines — evaluation logic delegated to keepr | ✅ Done |
| Replaced 45-line inline JaCoCo analysis in `fix-pr` with steward delegation; Docker gate reinstated before delegation (guard for Testcontainers silent-skip) | ✅ Done |
| Removed duplicated tech-writer routing tables from `fix-pr` and `finish-session` — routing now lives in tech-writer agent | ✅ Done |
| Added Learning Routing section to `tech-writer` agent | ✅ Done |
| Registered keepr in `sync-automation-registry.py` and `agents-readme.md` | ✅ Done |
| Net reduction: ~140 lines / ~1,100 tokens across three commands | ✅ Done |

### SDD Automation Workflow Enhancement (chore/enhance-spec-driven-development-automation-workflow, 2026-03-08) ✅

Tooling session: refactored the Spec-Driven Development workflow to eliminate context rot during multi-task implementations.

| Task | Status |
|------|--------|
| Added optional `## Implementation Plan` section to `docs/specs/template.md` — structured task list specifying files to touch, dependencies, commit message, and stack label per task | ✅ Done |
| Extended `/write-spec` Phase 3.4 to auto-generate ordered `## Implementation Plan` task breakdowns in the spec output | ✅ Done |
| Rewrote `/implement-spec` with dual-mode orchestrator + subagent pattern — specs with `## Implementation Plan` dispatch one subagent per task (fresh context window each); specs without it fall back to legacy monolithic mode for backward compatibility | ✅ Done |
| Updated `docs/CLAUDE.md` SDD section — documented orchestrator + subagent pattern, `## Implementation Plan` section shape, and the "context rot" problem it solves | ✅ Done |
| Added output truncation guidance to `/finish-session` Step 1 to prevent oversized session summaries | ✅ Done |

### Anthropic Skills Adoption (feat/improving-automation-workflow-with-skills, 2026-03-11) ✅

Tooling session: evaluated the Anthropic open-source skills library (17 skills) and adopted 2 into the project.

| Task | Status |
|------|--------|
| Analyzed all 17 Anthropic skills against our 12 commands + 11 agents; produced audit table with adopt/redundant/adapt/skip verdicts | ✅ Done |
| Installed `frontend-design` skill (`.claude/skills/frontend-design/`) — production-grade UI with intentional aesthetics; fills our weakest area | ✅ Done |
| Evaluated `skill-creator` skill — omitted: companion files required by the skill are not present in the open-source release | ⏭️ Skipped |
| Installed `doc-coauthoring` skill (`.claude/skills/doc-coauthoring/`) — 3-stage collaborative document creation workflow | ✅ Done |
| Enhanced `/review-spec` with new Phase 5 (Reader Testing) adapted from `doc-coauthoring` Stage 3 — spawns sub-agent with spec content only to catch blind spots | ✅ Done |

### PR #186 Review Fixes (fix-pr/186, 2026-03-12) ✅

Web-only fix-pr session for PR #186 (feat: redesign password reset page). No new features. Four correctness/accessibility fixes addressing test failures and an HTML nesting violation.

| Area | Fix |
|------|-----|
| `web/src/test/page-test-utils.ts` | Added missing i18n keys to `authMessages` fixture (`validatingResetLink`, `resetPasswordExpired`); updated `resetPasswordTitle` to match component copy (`'Set a new password'`) |
| `web/src/components/auth/ResetPasswordForm.tsx` | Removed unused `useRef` import; updated stale inline comment |
| `web/src/components/ui/FormField.tsx` | Changed hint wrapper from `<p>` to `<div>` — `<p>` cannot contain block-level content (HTML nesting violation) |
| `web/src/app/[locale]/reset-password/page.tsx` | Added `role="alert"` to invalid-token container (accessibility fix — screen readers now announce the error state) |
| `web/src/__tests__/pages/ResetPasswordPage.test.tsx` | Dropped vacuous `getAllByRole('img')` assertion that never failed regardless of rendered output |

### Automation Sentinel Recommendations 2, 3, 4 (chore/automation-sentinel-recs, 2026-03-11) ✅

Tooling session: applied three recommendations from the automation-sentinel audit report.

| Task | Status |
|------|--------|
| **Rec 2** — Extended agent tracking heuristic in `track-usage.py`: added `resolve_agent_key()` helper that searches `description` + `prompt` fields across all subagent types (not just `general-purpose`); unified duplicate Task/Agent branches into one | ✅ Done |
| **Rec 4** — `/review-spec` auto-sets Status=Approved when verdict is READY; `/implement-spec` trusts Approved specs and adds a 12-point structural completeness gate when bypassing Draft status | ✅ Done |
| **Rec 3** — `/review-pr` Step 6.5 extracts keepr verdict counts into session delta; `/compile-metrics` Step 4C aggregates `[pr_review_quality]` deltas; `usage-stats.toml` `[pr_review_quality]` scaffold added | ✅ Done |

### Automation Sentinel Recommendation Record (chore/sentinel-rec-tracking, 2026-03-12) ✅

Tooling session: added a persistent recommendation record table to prevent sentinel from re-recommending the same items and reduce token waste in future runs.

| Task | Status |
|------|--------|
| Created `.claude/metrics/recommendations.md` — markdown table with `#`, `Date`, `Category`, `Title`, `Status`, `Status Date` columns; pre-seeded with 10 historical recs from two past sentinel reports (7 implemented, 3 deferred) | ✅ Done |
| Updated `automation-sentinel.md` — added Section 6 "Recommendation Record Management": reads table at analysis start, deduplicates semantically, auto-appends new `open` rows, never modifies existing rows | ✅ Done |
| Updated `compile-metrics.md` — moved sentinel to Step 4E (before commit) so appended recs are included in the same commit; added `recommendations.md` to git staging step | ✅ Done |
| Updated `.claude/metrics/README.md` — removed stale `pulse` references; documented all current files and updated "How It Works" section | ✅ Done |

### PR #194 Review Fixes — view-learning Design Preview (fix-pr/194, develop, 2026-03-13) ✅

Web-only fix-pr session for PR #194 (feat: view-learning design preview components). No new milestones completed — the `view-learning` screen is a design-preview component deferred from milestone integration until it is wired into the actual `/poks/[id]` page.

| Area | Fix |
|------|-----|
| `view-learning-screen.tsx` | Removed hydration guard; converted props to discriminated union (`state: 'loading' \| 'loaded' \| 'error'`) |
| `learning-content.tsx` | Removed duplicate `Learning` type; guarded edit button behind ownership check; replaced `LearningMarkdown` with canonical `MarkdownContent` renderer |
| `learning-breadcrumb.tsx` | Fixed `href="#"` placeholder → locale-aware `<Link>` |
| `learning-error.tsx` | Fixed `href="#"` placeholder → `router.back()` call |
| `learning-markdown.tsx` + `learning-markdown.test.tsx` | Deleted — duplicate renderer superseded by `MarkdownContent` |
| `view-learning.test.tsx` | Removed empty test |
| `view-learning-components.test.tsx` | Updated mock target from `LearningMarkdown` → `MarkdownContent` |
| `app/page.tsx` | Fixed broken import, wrong prop names, invalid `STATE_LABELS` references |
| `tsconfig.json` (root) | Added `./web/src/*` to `@/*` path alias so root-level app can resolve web components |
| `.claude/metrics/sessions/` | Deleted two stale session delta files (`develop.toml`, `v0%2Flucasxf-61cf9218.toml`) |

### CI Fix + /review-pr Interactive Metadata (fix + feat, develop, 2026-03-12) ✅

Two-commit tooling session: one CI fix and one automation enhancement.

| Area | Change |
|------|--------|
| `web/CreateLearningForm.test.tsx` | Fixed next-intl mock to support `{current}` interpolation — resolved CI failure |
| `web/CreateLearningForm.tsx` | Added `disabled={isSubmitting}` to Title Input (PR #189 review feedback) |
| `web/README.md` (usage example) | Removed incorrect `locale` prop from `CreateLearningForm` usage example |
| `.claude/commands/finish-session.md` | Added `|| true` to `git add .claude/metrics/sessions/` to silence non-fatal exit code when directory is absent |
| `.claude/commands/review-pr.md` | Steps 1B and 1C now prompt before overwriting PR title/description — only fires when metadata is inadequate; triage report gains `## PR Metadata` section |

### prompt-optimizer Skill (chore/prompt-optimizer-skill, develop, 2026-03-13) ✅

Added the `prompt-optimizer` skill to `.claude/skills/prompt-optimizer/`. Transforms raw intent or existing prompts into mode-optimized versions for Claude Code — plan mode (Opus) or execution mode (Sonnet). No backend/web/mobile code changed.

| Task | Status |
|------|--------|
| Created `SKILL.md` — mode detection, optimize workflow, review workflow, output format | ✅ Done |
| Created `references/plan-patterns.md` — 7 task-type templates for Opus plan mode | ✅ Done |
| Created `references/exec-patterns.md` — 7 task-type templates for Sonnet execution mode | ✅ Done |
| Created `references/anti-patterns.md` — 10 common prompt mistakes with before/after examples | ✅ Done |

### skill-creator Skill Installation (chore/skill-creator, develop, 2026-03-13) ✅

Added the `skill-creator` skill from Anthropic's open-source skills repo to `.claude/skills/skill-creator/`. This meta-skill enables creating and iterating on new Claude Code skills. 18 files installed. No backend/web/mobile code changed.

| Task | Status |
|------|--------|
| Installed `skill-creator` skill (18 files) to `.claude/skills/skill-creator/` | ✅ Done |

### Git Cleanup + Pre-existing Test Fixes (chore/git-cleanup-and-test-fixes, 2026-03-12) ✅

Maintenance session: repository housekeeping and pre-existing CI failures resolved. No new features.

| Task | Status |
|------|--------|
| Updated `.gitignore` to cover `.run/`, `.claude/reviews/`, `.claude/worktrees/`, `/target/`, `/backend-test-results/`, `/failed_logs.txt`, `/metrics/`, `/qodana.yaml` | ✅ Done |
| Committed tracked untracked files: v0 prompts, spec reviews, prompts archive, `agents-readme.md`, `next-env.d.ts` | ✅ Done |
| Reverted stale `UserController.java` + `UserControllerTest.java` commit — pre-rename artifacts superseded by `UserSettingsController` | ✅ Done |
| Fixed pre-existing pgvector failures in `AuthIntegrationTest` and `FollowIntegrationTest` — added `enablePgVector()` helper to `@DynamicPropertySource` in both test classes; all tests now pass | ✅ Done |
| Improved `/finish-session` command — added explicit session TOML staging verification step | ✅ Done |

### S1.3 — Library at Dusk Feed Components (feat/ds-markdown-feedcomps, 2026-03-15) ✅

Mobile Wave 1 step 3: wired new Library at Dusk semantic tokens into markdown, feed, and social components.

| Area | Change |
|------|--------|
| `mobile/src/components/ui/MarkdownContent.tsx` | Body color `textPrimary` → `contentBody`; `fontFamily` added (Sora headings, DM Sans body); `buildStyles` exported for testability |
| `mobile/src/components/feed/LearningCard.tsx` | Tag pills `surfaceAlt` → `tagPillBg`/`tagPillText`; `gap: 4` → `spacing.xs`; removed hardcoded `lineHeight: 22` |
| `mobile/src/components/learners/FollowButton.tsx` | Added `useTheme`; replaced hardcoded `color="red"` → `theme.colors.error` |
| `mobile/src/components/feed/LearningForm.tsx` | Verified clean — no changes needed |
| `mobile/src/components/discover/LearnerResultCard.tsx` | Verified clean — no changes needed |
| Tests | 187 tests, 81.25% line coverage (above 80% threshold); new `LearningCard.test.tsx` (10 tests, function-call style); expanded `MarkdownContent.test.tsx` with 3 font/color assertions |

Wave 1 complete: S1.1 (PR #201) + S1.2 (PR #202) + S1.3 (this branch) all done. Next: Wave 2 screen patches.

### S2.1 — Auth Screens Design System Audit (feat/ds-auth-screens, 2026-03-15) ✅

Wave 2 screen patches (S2.1): auth screens confirmed conformant with Library at Dusk tokens.

| Area | Change |
|------|--------|
| `ChooseHandleScreen.tsx` | Removed unused `useNavigation` import (ESLint fix) |
| `ForgotPasswordScreen.tsx` | Added success message border (`borderWidth: 1, borderColor: theme.colors.success`) |
| `jest.config.js` | Added `screens` jest project (node env); excluded `screens/` from `rn` project |
| `src/__mocks__/react-native.js` | Extended with ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal |
| `src/__mocks__/react-native-safe-area-context.js` | New mock for SafeAreaView |
| Tests | 42 new tests across 4 auth screen test files (LoginScreen, RegisterScreen, ForgotPasswordScreen, ChooseHandleScreen); 271 total, 82.82% coverage |

### PR #205 Review Fixes (fix-pr/205, 2026-03-15) ✅

Mobile-only fix-pr session for PR #205 (feat(mobile): Wave 1 design system — Library at Dusk primitives migration). No new milestones. Three correctness fixes addressing font synthesis, magic number documentation, and fragile test mock paths.

| Area | Fix |
|------|-----|
| `Text.tsx` | Removed `fontWeight` from `title` and `subheading` variants — Sora_600SemiBold has weight baked in; conflicting value triggers Android font synthesis |
| `MarkdownContent.tsx` | Removed `fontWeight` from all heading styles for same reason; added explanatory comment block |
| `Avatar.tsx` | Changed initials `fontWeight` from `semibold (600)` → `medium (500)` to match `DMSans_500Medium` |
| `Button.tsx`, `TextInput.tsx` | Added comment explaining `paddingVertical: 10` is intentional optical balance between `spacing.sm` (8) and `spacing.md` (16) |
| `Button.test.tsx`, `ErrorMessage.test.tsx` | Changed `jest.mock('@/components/ui/Text', ...)` → `jest.mock('../Text', ...)` to match component's actual import path |
| `Avatar.test.tsx` | Updated `fontWeight` assertion: `'600'` → `'500'` |

### PR #195 Review Fixes + Web Test Correction (fix, develop, 2026-03-13) ✅

Automation/tooling maintenance session. Two commits; no backend or new page changes.

| Area | Fix |
|------|-----|
| `.claude/scripts/session_delta.py` | Moved `--exclude=<file>` flag before `--` separator in grep subprocess call — was treated as a positional argument, not a flag |
| `.gitignore` | Added `.claude/metrics/sessions/` to prevent transient session delta files from being committed |
| `.claude/skills/prompt-optimizer/references/plan-patterns.md` | Rephrased "chain-of-thought encouragement" → "structured reasoning" |
| `.claude/skills/prompt-optimizer/references/exec-patterns.md` | Fixed inaccurate JPA null collection root cause description |
| `.claude/commands/review-pr.md` | Added section headers to `cat` output for source boundaries |
| `.claude/commands/review-pr-presentation.md` | Added `@Nullable` qualifier to `getTags()` null-check example |
| `.claude/skills/prompt-optimizer/references/anti-patterns.md` | Corrected Spring Boot version in example: reverted erroneous "Spring Boot 3" back to "Spring Boot 4" (backend/pom.xml is 4.0.3) |
| `web/src/components/view-learning/view-learning.test.tsx` | Fixed stale aria-label assertions — mocks return raw i18n keys; aligned assertions with mock behavior |

### S1.2 — TextInput, Card, and Avatar Token Migration (feat/ds-input-card-avatar, 2026-03-14) ✅

Wave 1, step 2 of the Library at Dusk mobile visual migration. No domain logic changes.

| Component | Change | Tests |
|-----------|--------|-------|
| `TextInput` | `surface→inputBg`, `border→inputBorder`, `textDisabled→inputPlaceholder`, `spacing.sm+2→10`, add `fontFamily.body` | 10 new tests |
| `Card` | Verify only — already uses correct semantic tokens | 12 new tests |
| `Avatar` | Add `useTheme()`, replace 8 hardcoded Tailwind hex values with `palette`/`brandAccents` brand colors, add `typography.weights.medium`/`fontFamily.bodyMedium`, use `colors.textInverse` | 15 new tests |

Total: 211 tests passing (up from 174), 83.52% line coverage (above 80% threshold).

### PR #187 Review Fixes (fix-pr/187, 2026-03-12) ✅

Web-only fix-pr session for PR #187 (feat: implement View Learning screen with design system and i18n support). Restored coverage above CI threshold by adding 36 unit tests; removed dead code.

| Area | Fix |
|------|-----|
| `web/src/components/view-learning/learning-error.tsx` | Removed unused `cta` variable (ESLint dead code warning) |
| `web/src/components/view-learning/view-learning.test.tsx` | Added 13 tests — LearningError (2 variants + alert role), LearningLoading (aria-busy + label), ViewLearningScreen (all states + delete/edit interactions) |
| `web/src/components/view-learning/view-learning-components.test.tsx` | Added 12 tests — LearningBreadcrumb, LearningNavBar, LearningContent (title/derived-title/delete/tags/markdown), DeleteConfirmDialog (render/confirm/Escape) |
| `web/src/components/view-learning/learning-markdown.test.tsx` | Added 11 tests — LearningMarkdown (plain text, bold, italic, inline-code, fenced code, h1/h2/h3, bullet list, blockquote, spacers) |
| Line coverage | Restored from 48.1% → above 50% CI threshold (all 462 tests passing) |

### Mobile 4-Tier Visibility (feat/mobile-4-tier-visibility, 2026-03-17)

Wave 4 of the mobile parity execution plan: upgraded visibility model from 2-tier (PRIVATE/PUBLIC) to 4-tier (PRIVATE/COLLEAGUES_ONLY/FOLLOWERS_ONLY/PUBLIC) across all mobile screens.

| Area | Change |
|------|--------|
| `mobile/src/lib/auth.ts` | Removed duplicate 2-tier `PokVisibility` type; added import from `pokApi.ts` (canonical 4-tier source) |
| `mobile/src/components/ui/VisibilityPicker.tsx` | New shared component: `VisibilityPicker` (4-row picker with disabled state + public warning), `VisibilityBadge` (icon + label for any tier), `getDisabledValues` helper |
| `mobile/src/components/ui/__tests__/VisibilityPicker.test.tsx` | 27 unit tests: all 4 badge values, onChange, disabled no-press, selected state, public warning, getDisabledValues |
| `mobile/src/screens/app/LearningNewScreen.tsx` | Replaced 2-button picker with `VisibilityPicker`; initial value from `user.defaultPokVisibility ?? 'PRIVATE'` |
| `mobile/src/screens/app/LearningDetailScreen.tsx` | Edit mode: `VisibilityPicker` with `getDisabledValues(pok.visibility)` + PUBLIC locked badge; read mode: `VisibilityBadge` |
| `mobile/src/screens/app/ProfileScreen.tsx` | `defaultPokVisibility` selector replaced with `VisibilityPicker`; `profileVisibility` 2-option row unchanged |
| `mobile/src/i18n/locales/en.ts`, `pt-BR.ts` | 7 new keys: `followersOnly`, `followersOnlyDesc`, `colleaguesOnly`, `colleaguesOnlyDesc`, `privateDesc`, `publicDesc`, `lockedPublic` |
| Tests | 299 total (27 new), 84.42% line coverage |

### Android App Launch Crash + Icon Fix (chore/mobile-fix-open-app-bug, 2026-03-18) ✅

Post-publish hotfix for two Play Store issues discovered after first Android release.

| Area | Fix |
|------|-----|
| `mobile/android/app/src/main/res/xml/` | Added `secure_store_backup_rules.xml` + `secure_store_data_extraction_rules.xml` — missing from committed android/ dir, causing `Resources.NotFoundException` crash before any JS loaded |
| `mobile/android/app/src/main/AndroidManifest.xml` | Removed spurious RECORD_AUDIO + SYSTEM_ALERT_WINDOW permissions added by fresh prebuild; restored `maxSdkVersion="28"` on storage permissions |
| `mobile/src/lib/tokenStore.ts` | Changed SecureStore keys from colon-separated to underscore-separated (Android rejects colons) |
| `mobile/assets/` + `mobile/android/` | Replaced all icon/splash assets with correct lighter mascot (1024×1024); regenerated 20 native density variants via clean prebuild |

### SPACE Productivity Toolset (develop, 2026-03-19)

Meta-infrastructure session: no product features delivered; no phase milestones progressed. All changes confined to `.claude/` automation tooling and `docs/ARCHITECTURE.md`.

| Task | Status |
|------|--------|
| Consolidated 6 duplicate Python scripts (LOC counters, PR quality, spec pipeline) | ✅ Done |
| Created `dc_counter.py` — parses ROADMAP phase files, counts and weights Delivered Capabilities | ✅ Done |
| Created `dc_timeline.py` — weekly DC velocity chart from git history | ✅ Done |
| Created `dora_metrics.py` — deployment frequency, lead time, change fail rate from git log | ✅ Done |
| Created `loc_churn.py` — LOC delta per commit (add/remove/net) | ✅ Done |
| Created `/productivity-report` slash command — SPACE dashboard (Satisfaction/Performance/Activity/Communication/Efficiency) | ✅ Done |
| Created `productivity-metrics` skill — interpretive layer over raw SPACE numbers | ✅ Done |
| Enhanced `automation-sentinel` with Productivity Dashboard section | ✅ Done |
| Updated `compile-metrics.md` — wired Steps 4F/4G/4H for new scripts; canonicalized 4B/4C/4D references | ✅ Done |
| Added ADR-008 to `docs/ARCHITECTURE.md` — DC metric definition, SPACE framework, rejected alternatives | ✅ Done |
| Rewrote `.claude/metrics/README.md` — full schema, data flow, MoSCoW weight table | ✅ Done |
| Registered `productivity-report` command and `productivity-metrics` skill in `usage-stats.toml` and registry | ✅ Done |

### Android Release Signing Automation (tooling, develop, 2026-03-19)

Infrastructure/tooling session supporting Milestone 3.4 (App Store Publishing). No phase milestone completed.

| Area | Change |
|------|--------|
| `mobile/plugins/withReleaseSigning.js` | Rewrote plugin to inject a full `signingConfigs.release` block (reads `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` env vars) in addition to removing debug signing from the release buildType — previously only removed debug signing but never injected release signing |
| `mobile/scripts/build-release.sh` | New fully automated release build script: copies `release.keystore` to `android/app/`, bumps `android.versionCode` + `version` patch in `app.json` (the source of truth — NOT `build.gradle`), runs `expo prebuild --clean`, then `./gradlew bundleRelease` |
| `mobile/.env.signing.example` | New template documenting all required signing env vars |
| `mobile/emulator-setup.md` | Rewrote Release Builds section with script-based flow and credential recovery guide |
| Root `.gitignore` | Added `mobile/.env.signing` to prevent accidental credential commit |
| `app.json` | `android.versionCode` and `version` are now maintained here as the durable source of truth; survived the session at versionCode 13 / version 1.0.3 |

**Key learning:** `expo prebuild --clean` regenerates `android/app/build.gradle` from `app.json`, resetting `versionCode` to 1. Always store `android.versionCode` in `app.json` and bump it there before prebuild. See MEMORY.md → Android Play Store / Local Builds for the full entry.

### Mobile Google OAuth Sign-In (feat/mobile-google-sign-in, 2026-03-19)

Wave 7 of the mobile parity execution plan: Google OAuth sign-in for mobile (LoginScreen + RegisterScreen).

| Area | Change |
|------|--------|
| `mobile/src/hooks/useGoogleAuth.ts` | New hook — `Google.useAuthRequest` from expo-auth-session, handles existing/new user branching, loading/disabled states, WebBrowser warm-up |
| `mobile/src/components/auth/GoogleSignInButton.tsx` | New reusable component — secondary button + divider, renders null when no client ID configured (FR9) |
| `mobile/src/screens/auth/LoginScreen.tsx` | Added `<GoogleSignInButton>` + wired `useGoogleAuth` — existing users setUser, new users navigate to ChooseHandle |
| `mobile/src/screens/auth/RegisterScreen.tsx` | Same Google OAuth wiring as LoginScreen |
| `mobile/app.config.ts` | Added `googleAndroidClientId` + `googleIosClientId` env var reads |
| `mobile/.env.example` | Documented all 3 Google client ID env vars with usage notes |
| Tests | 381 total (up from ~299), 82%+ line coverage; all passing |

### Android Crash-on-Launch — Recurring Fix via Config Plugins (fix/android-crash-regen, 2026-03-19) ✅

Bugfix session: eliminated the recurring Android crash-on-launch root cause permanently. The crash (`Resources.NotFoundException` before any JS loads) recurred after `expo prebuild --clean` wiped manually-patched files in `android/`. Four Expo config plugins now automate all patches so they survive future prebuilds. Also resolved a JS crash caused by a React version mismatch, configured env-var-based local signing, and published versionCode 11 to the Play Store internal track.

| Area | Fix |
|------|-----|
| `mobile/plugins/withSecureStoreBackupRules.js` | New config plugin — generates `secure_store_backup_rules.xml` and `secure_store_data_extraction_rules.xml` in `res/xml/` after every prebuild |
| `mobile/plugins/withCleanPermissions.js` | New config plugin — removes spurious `RECORD_AUDIO` and `SYSTEM_ALERT_WINDOW` permissions; restores `maxSdkVersion="28"` on storage permissions; adds `tools:replace="android:maxSdkVersion"` to prevent manifest merger failure with expo-image-picker |
| `mobile/plugins/withReleaseSigning.js` | New config plugin — removes `signingConfig signingConfigs.debug` from release buildType (EAS injects the correct keystore at build time); sanity check scoped to release block only to avoid false-positive on the debug block |
| `mobile/plugins/withActivityPin.js` | New config plugin — forces `androidx.activity:1.9.3` (compileSdk 35 / AGP 8.8.x compat; 1.11.0+ requires compileSdk 36) |
| `mobile/app.json` | Registered all 4 plugins in the `plugins` array |
| `mobile/src/App.tsx` | Added `ErrorBoundary` wrapper for JS crash resilience |
| `mobile/package.json` | Pinned `react` and `react-test-renderer` to `19.0.0` — mismatch between `react@19.2.4` and `react-native-renderer@19.0.0` caused JS crash on launch in release builds |
| `mobile/android/app/build.gradle` | Configured env-var-based signing (`ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`); bumped `versionCode` to 11, `versionName` to 1.0.1 |
| `mobile/eas.json` | Fixed `cache` field format — must be an object, not a boolean |
| `mobile/android/.gitignore` | Added `release.keystore` to prevent accidental commit of signing credentials |
| `mobile/CLAUDE.md` | Documented Android Release Workflow (5-step process: prebuild → unit tests → EAS Preview smoke test → EAS production build → submit); added `local.properties` Windows path pitfall; updated 3 existing prebuild pitfall entries with "(automated 2026-03-19)"; added "Testing Gap: Release Build Smoke Test" retrospective section |

**Milestone 3.4 status after this session:** Play Store internal track updated to versionCode 11 (1.0.1). Config plugins prevent crash recurrence across future prebuilds. Google OAuth for mobile still pending — Milestone 3.4 remains open.

### Mobile Parity Gap Analysis + Execution Plan (develop, 2026-03-16)

Planning session: no code implemented. Analyzed web-mobile feature parity and produced a cross-session execution plan for closing all remaining gaps before Play Store submission.

**Analysis scope:**
- Reviewed `mobile/store-assets/web-mobile-feature-parity.md` (last updated 2026-03-11)
- Reviewed all 6 existing mobile parity specs in `docs/specs/features/`
- Explored mobile codebase to verify actual implementation state
- Used `/prompt-optimizer` skill to produce a structured investigation prompt

**Key finding — stale parity table:**
Three social discovery items were marked ❌ in the parity table but had been implemented on 2026-03-10 via the `mobile-social-discovery` spec:
- Social: Discover page → now ✅ (`DiscoverScreen.tsx`)
- Social: Follow/unfollow → now ✅ (`FollowButton.tsx`, `learnerApi`)
- Social: Learner profiles → now ✅ (`LearnerProfileScreen.tsx`)

Note: the parity table itself was NOT updated this session — corrections are documented in the execution plan and are the first pre-work item for the next session.

**Impact × Effort matrix — 11 real gaps remaining (after 3 corrections):**

| Gap | Impact | Effort | Wave |
|-----|--------|--------|------|
| Profile: Edit displayName/bio/avatar | High | Medium | 3 |
| Visibility: 4-tier upgrade (FOLLOWERS/COLLEAGUES) | High | Medium | 4 |
| Social: Re-Learning/share | High | Medium | 6 |
| Tags: Tag-at-creation | Medium | Low | 5 |
| Tags: AI suggestion approve/reject | Medium | Medium | 5 |
| Tags: Filter feed by tag | Medium | Low | 5 |
| Sort options (newest/oldest/updated) | Medium | Low | 7 |
| Auth: Google OAuth button | Low | Low | 7 |
| Tags: Tag-grouped view | Low | High | Deferred |
| Timeline view | Low | High | Deferred |
| Quick Entry inline | Low | Medium | Deferred |

**Execution plan created:** `mobile/store-assets/mobile-parity-execution-plan.md`

Wave sequencing:
- **Wave 3** (Profile editing) — REQUIRED for Play Store; no deps; `feat/mobile-profile-editing`
- **Wave 4** (4-tier visibility) — REQUIRED for Play Store; no deps; `feat/mobile-4-tier-visibility`
- **Wave 6** (Re-Learning/share) — REQUIRED for Play Store; depends on Wave 4 for `VisibilityPicker`
- **Wave 5** (Tag completion: TM-2/3/4) — post-submission update; no deps
- **Wave 7** (Sort options + Google OAuth) — post-submission update; specs to be written in pre-work

**Pre-work for next session (single session, before any wave):**
1. Update `mobile/store-assets/web-mobile-feature-parity.md` — fix 3 stale ❌ → ✅ entries
2. Write `docs/specs/features/mobile-google-oauth.md` (new spec)
3. Write `docs/specs/features/mobile-sort-options.md` (new spec)
4. Run `/review-spec` on all 6 specs (mobile-profile-editing, mobile-4-tier-visibility, mobile-re-learning, mobile-tag-management, mobile-google-oauth, mobile-sort-options)

---

## Active / Pending

⏳ Pending: Author using app for 1+ week (Phase 1 exit criterion)

Mobile design system migration progress (Wave 2): S2.1 ✅ S2.2 ✅ S2.3 ✅ — all Wave 2 screen migrations complete (feat/ds-auth-screens, feat/ds-feed-detail, feat/ds-profile-discover).

Mobile parity execution plan progress: Wave 4 (4-tier visibility) ✅ done (feat/mobile-4-tier-visibility, 2026-03-17). Wave 7 Google OAuth ✅ done (feat/mobile-google-sign-in, 2026-03-19). Pre-work complete (2026-03-17): parity table corrected, 8 specs Approved. Next: Wave 3 (profile editing, feat/mobile-profile-editing) — required for Play Store submission.

Milestone 3.4 (App Store Publishing): Play Store internal track updated to versionCode 11 (1.0.1) on 2026-03-19. Crash-on-launch permanently fixed via 4 Expo config plugins. `react` pinned to 19.0.0 to resolve JS crash from renderer version mismatch. Local signing workflow documented. Google OAuth for mobile still pending before production track promotion.

---

## MVP Exit Criteria

- [ ] User can register, login, and logout
- [ ] User can create POKs with title and content
- [ ] User can search and list their POKs
- [ ] Dark mode works
- [ ] Both EN and PT-BR languages work
- [x] App is deployed and accessible online
- [ ] Author uses the app for 1+ week
