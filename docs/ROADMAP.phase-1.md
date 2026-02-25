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

### Milestone 1.6: Web Testing Quality (partial)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.6.1 | Page-level behavior tests (Vitest) — all pages, both auth states | Should Have | ✅ Done (2026-02-20) |
| 1.6.2 | E2E tests with Playwright — 4 critical user journeys | Should Have | ✅ Done (2026-02-25, chore/web-e2e-integration-tests) |

> **Phase B (Playwright E2E):** Completed. `@playwright/test` installed; `web/e2e/` has 5 passing tests covering all 4 journeys. Uses `page.route()` to mock all backend API calls — no live backend needed. Also added auth redirect to poks list page (unauthenticated users redirected to /login).

### Milestone 1.7: MVP UX Review (partial)

**Completed:**

| # | Issue | Status |
|---|-------|--------|
| 1.7.1 | Session lost on F5/refresh — JWT in `useRef` (in-memory only) | ✅ Done (feat/persistent-user-sessions) |
| 1.7.2 | Home page was an empty "Get Started" screen | ✅ Done (chore/mvp-ux-review) |
| 1.7.3 | Post-login landed on home, not feed | ✅ Done (chore/mvp-ux-review) |
| 1.7.4 | "learnimo" title not clickable | ✅ Done (chore/mvp-ux-review) |
| 1.7.5 | Feed used multi-column grid | ✅ Done (chore/mvp-ux-review) |
| 1.7.7 | No inline quick-entry (Phase A content-only textarea) | ✅ Done (chore/mvp-ux-review) |
| 1.7.8 | Google login button styling | ✅ Done (chore/mvp-ux-review) |
| 1.7.9 | My Learnings screen bug fixes (EmptyState on errors, QuickEntry title field, label casing) | ✅ Done (fix/my-learnings-screen) |

**Remaining:**

| # | Issue | Status |
|---|-------|--------|
| 1.7.6 | General visual quality — UI looks like a raw form | ⏳ Needs design pass (v0.dev) |

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
