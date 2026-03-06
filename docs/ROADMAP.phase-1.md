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

Tooling fix: resolved a concurrency bug where parallel Claude Code sessions in separate worktrees would conflict on `usage-stats.toml` by writing to it simultaneously.

| Task | Status |
|------|--------|
| Modified `.claude/scripts/track-usage.py` to write per-session delta files to `.claude/metrics/sessions/{branch}.toml` instead of updating `usage-stats.toml` in-place | ✅ Done |
| Created `.claude/commands/compile-metrics.md` — new `/compile-metrics` slash command that aggregates session delta files into the canonical `usage-stats.toml` on `develop` | ✅ Done |
| Updated `.claude/commands/finish-session.md` and `.claude/commands/create-pr.md` to stage session delta files instead of the canonical file | ✅ Done |
| Added 15 unit tests in `.claude/scripts/test_track_usage.py` (all passing) | ✅ Done |

---

## Active / Pending

⏳ Pending: Author using app for 1+ week (Phase 1 exit criterion)

---

## MVP Exit Criteria

- [ ] User can register, login, and logout
- [ ] User can create POKs with title and content
- [ ] User can search and list their POKs
- [ ] Dark mode works
- [ ] Both EN and PT-BR languages work
- [x] App is deployed and accessible online
- [ ] Author uses the app for 1+ week
