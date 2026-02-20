# Roadmap — learnimo

This document outlines the development phases, milestones, and timeline for the learnimo project.

---

## Overview

The project follows an iterative development approach, prioritizing a functional MVP for personal use before expanding features and audience.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 0        Phase 1          Phase 2           Phase 3        Phase 4   │
│  Foundation     MVP              Evolution         AI & Scale     Growth    │
│                                                                              │
│  ┌─────┐       ┌─────┐          ┌─────┐           ┌─────┐       ┌─────┐    │
│  │Week │       │Week │          │Week │           │Week │       │Week │    │
│  │ 1-2 │──────►│ 3-8 │─────────►│9-14 │──────────►│15-20│──────►│ 21+ │    │
│  └─────┘       └─────┘          └─────┘           └─────┘       └─────┘    │
│                                                                              │
│  Setup &       Core             Enhanced          AI Features   Marketing   │
│  Planning      Features         Experience        & Mobile      & Feedback  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Foundation (Weeks 1-2)

**Goal:** Project setup, documentation, and infrastructure ready for development.

### Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 0.1 | Project documentation (Vision, Requirements, Architecture, Glossary, Roadmap) | ✅ Done |
| 0.2 | GitHub repository with README, LICENSE, .gitignore | ✅ Done |
| 0.3 | Monorepo structure (/backend, /web, /mobile, /docs) | ✅ Done |
| 0.4 | CI/CD pipeline (GitHub Actions) | ✅ Done |
| 0.5 | Release Please configuration | ✅ Done |
| 0.6 | Development environment setup (local Docker, Supabase project) | ✅ Done |
| 0.7 | Backend project scaffold (Spring Boot + Maven) | ✅ Done |
| 0.8 | Web project scaffold (Next.js) | ✅ Done |
| 0.9 | Claude Code workflow setup (agents, commands) | ✅ Done |

### Exit Criteria
- [x] All developers can clone repo and run locally
- [x] CI pipeline runs on every PR
- [x] Documentation is complete and accessible

---

## Phase 1: MVP (Weeks 3-8)

**Goal:** Deliver a functional web application for personal use with core POK management features.

### Implemented

#### Milestone 1.1: Authentication

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1.1.1 | User registration (email/password) | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.2 | User login (email/password) | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.3 | Google OAuth login | Must Have | ✅ Backend + Web (PR #20) |
| 1.1.4 | JWT session management | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.5 | Password reset flow | Should Have | ⏳ Pending (separate spec) |

#### Milestone 1.2: POK CRUD

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1.2.1 | Create POK endpoint (backend) | Must Have | ✅ Backend (feat/pok-crud) |
| 1.2.2 | Read POK endpoints (backend) | Must Have | ✅ Backend (feat/pok-crud) |
| 1.2.3 | Update POK endpoint (backend) | Must Have | ✅ Backend (feat/pok-crud) |
| 1.2.4 | Delete POK endpoint (backend) | Must Have | ✅ Backend (feat/pok-crud) |
| 1.2.5 | POK CRUD UI (web) | Must Have | ✅ Web (feat/pok-crud) |
| 1.2.6 | Input validation | Must Have | ✅ Backend + Web (feat/pok-crud) |
| 1.2.7 | Success/error feedback UI | Must Have | ✅ Web (feat/pok-crud) |

#### Milestone 1.3: POK Listing & Search

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1.3.1 | List all POKs (paginated) | Must Have | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.2 | Keyword search | Must Have | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.3 | Filter by date range | Should Have | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.4 | Sort by date created/updated | Must Have | ✅ Backend + Web (feat/pok-listing-search) |
| 1.3.5 | Empty states and loading UI | Must Have | ✅ Web (feat/pok-listing-search) |

**Note:** feat/pok-listing-search (pending PR)

#### Milestone 1.4: UI/UX Polish (Weeks 7-8)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1.4.1 | Dark mode (default) | Must Have | ✅ Web (feat/dark-mode-i18n) |
| 1.4.2 | Light mode toggle | Must Have | ✅ Web (feat/dark-mode-i18n) |
| 1.4.3 | Responsive design (mobile-friendly web) | Must Have | ✅ Web (feat/dark-mode-i18n) |
| 1.4.4 | i18n: English support | Must Have | ✅ Web (feat/dark-mode-i18n) |
| 1.4.5 | i18n: Portuguese (BR) support | Must Have | ✅ Web (feat/dark-mode-i18n) |
| 1.4.6 | Accessibility basics (contrast, focus states) | Should Have | ✅ Web (feat/dark-mode-i18n) |

#### Milestone 1.5: Deployment (learnimo.net)
| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.5.1 | Supabase DB setup | Must Have | ✅ Done |
| 1.5.2 | Railway backend deployment | Must Have | ✅ Done (engineering-daybook-production.up.railway.app) |
| 1.5.3 | Vercel web deployment + learnimo.net domain | Must Have | ✅ Done (learnimo.net) |
| 1.5.4 | Google OAuth production redirect URIs | Must Have | ✅ Done |

### In Progress

⏳ Pending: Author using app for 1+ week (Phase 1 exit criterion)

#### Production Bug Fix (2026-02-20)

| # | Task | Priority | Status |
|---|------|----------|--------|
| — | Diagnose Google Sign-Up 500 error in production | Must Have | ✅ Root cause: `SPRING_DATASOURCE_URL` Railway env var pointing to Supabase PgBouncer pooler — delete it |
| — | Auth integration tests (Testcontainers) covering email/password + Google OAuth | Must Have | ✅ Done (`AuthIntegrationTest`) |
| — | Add `spring-boot-starter-flyway` to `pom.xml` (required in Spring Boot 4 for Flyway auto-configuration) | Must Have | ✅ Done |
| — | Railway IPv6 incompatibility — switched `DB_HOST` to Supabase IPv4 session-mode pooler (port 5432) | Must Have | ✅ Done |
| — | Added explicit `driver-class-name: org.postgresql.Driver` to `application.yml` | Must Have | ✅ Done |
| — | Removed `database-platform` from `application.yml` (Hibernate auto-detects dialect; explicit value triggers warning) | Must Have | ✅ Done |
| — | Disabled Flyway in test profile (`application-test.yml`) | Must Have | ✅ Done |
| — | Fixed HomeCta auth-aware navigation — authenticated users redirected silently back to `/` when clicking "Get Started"; extracted `HomeCta` client component that routes authenticated users to `/poks` and unauthenticated users to `/register` | Must Have | ✅ Done |

#### Milestone 1.6: Web Testing Quality

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.6.1 | Page-level behavior tests (Vitest) — all pages, both auth states, link targets, redirects | Should Have | ✅ Done (2026-02-20) |
| 1.6.2 | E2E tests with Playwright — 4 critical user journeys (register, login, create learning, authenticated home nav) | Should Have | ⏳ Planned (Phase B) |

> **Phase B (Playwright E2E):** Planned after Phase 1 exit. Will use `page.route()` to mock API responses so no live backend is needed in CI. Covers the full browser navigation flows that Vitest/jsdom cannot test (e.g., auth redirect loops, multi-page flows). See ADR when implemented.

### MVP Exit Criteria
- [ ] User can register, login, and logout
- [ ] User can create POKs with title and content
- [ ] User can search and list their POKs
- [ ] Dark mode works
- [ ] Both EN and PT-BR languages work
- [x] App is deployed and accessible online
- [ ] Author uses the app for 1+ week

---

## Phase 2: Evolution (Weeks 9-14)

**Goal:** Enhance the core experience with editing, tagging, and better visualization.

### Milestone 2.1: POK Editing & Deletion (Week 9-10)

| # | Feature | Priority |
|---|---------|----------|
| 2.1.1 | Edit POK content | Must Have |
| 2.1.2 | Edit POK title | Must Have |
| 2.1.3 | Soft delete POK | Should Have |
| 2.1.4 | Audit trail logging | Must Have |
| 2.1.5 | View POK history | Could Have |

### Milestone 2.2: Tagging System (Weeks 11-12)

| # | Feature | Priority |
|---|---------|----------|
| 2.2.1 | Manual tag creation | Should Have |
| 2.2.2 | Assign tags to POKs | Should Have |
| 2.2.3 | Filter POKs by tag | Must Have |
| 2.2.4 | Tag management (rename, delete) | Should Have |
| 2.2.5 | AI auto-tag suggestions | Must Have |
| 2.2.6 | Approve/reject/modify suggested tags | Must Have |

### Milestone 2.3: Visualization (Weeks 13-14)

| # | Feature | Priority |
|---|---------|----------|
| 2.3.1 | Timeline view (chronological) | Must Have |
| 2.3.2 | Tag-grouped view | Must Have |
| 2.3.3 | Sort options (date, relevance) | Must Have |
| 2.3.4 | Search result highlighting | Could Have |

### Evolution Exit Criteria
- [ ] User can edit and delete POKs
- [ ] All changes are logged in audit trail
- [ ] Tagging system works (manual + AI suggestions)
- [ ] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs

---

## Phase 3: AI & Mobile (Weeks 15-20)

**Goal:** Add semantic search, AI insights, and mobile app.

### Milestone 3.1: Semantic Search (Weeks 15-16)

| # | Feature | Priority |
|---|---------|----------|
| 3.1.1 | Generate embeddings for POKs | Must Have |
| 3.1.2 | pg_vector similarity search | Must Have |
| 3.1.3 | Hybrid search (keyword + semantic) | Should Have |
| 3.1.4 | Search relevance tuning | Should Have |

### Milestone 3.2: AI Connections (Weeks 17-18)

| # | Feature | Priority |
|---|---------|----------|
| 3.2.1 | Identify related POKs | Should Have |
| 3.2.2 | "Related learnings" section on POK view | Should Have |
| 3.2.3 | Connection strength indicators | Could Have |

### Milestone 3.3: Mobile App (Weeks 19-20)

| # | Feature | Priority |
|---|---------|----------|
| 3.3.1 | Expo project setup | Must Have |
| 3.3.2 | Authentication (reuse web logic) | Must Have |
| 3.3.3 | Create POK (mobile-optimized) | Must Have |
| 3.3.4 | List and search POKs | Must Have |
| 3.3.5 | Dark mode | Must Have |
| 3.3.6 | i18n (EN/PT-BR) | Must Have |
| 3.3.7 | Push notifications (optional) | Could Have |

### Phase 3 Exit Criteria
- [ ] Semantic search returns relevant results
- [ ] Related POKs are surfaced automatically
- [ ] Mobile app is published (TestFlight/Play Store internal)
- [ ] Author uses mobile app to capture POKs on-the-go

---

## Phase 4: Growth & Polish (Weeks 21+)

**Goal:** Prepare for external users, add export features, and gather feedback.

### Milestone 4.1: Data Export (Week 21-22)

| # | Feature | Priority |
|---|---------|----------|
| 4.1.1 | Export all POKs as JSON | Should Have |
| 4.1.2 | Export all POKs as Markdown | Should Have |
| 4.1.3 | Export filtered POKs | Could Have |
| 4.1.4 | Brag doc generator | Could Have |

### Milestone 4.2: Security Hardening (Week 23)

| # | Feature | Priority |
|---|---------|----------|
| 4.2.1 | MFA support | Should Have |
| 4.2.2 | Rate limiting audit | Should Have |
| 4.2.3 | Security headers review | Should Have |
| 4.2.4 | Penetration testing (basic) | Could Have |

### Milestone 4.3: Social Sharing (Week 24)

| # | Feature | Priority |
|---|---------|----------|
| 4.3.1 | Share POK to LinkedIn | Could Have |
| 4.3.2 | Share POK to Medium | Could Have |
| 4.3.3 | Share POK to Substack | Could Have |
| 4.3.4 | Public read-only link generation | Could Have |

### Milestone 4.4: Launch Preparation (Week 25+)

| # | Task | Priority |
|---|------|----------|
| 4.4.1 | Product naming finalization | Should Have | ✅ Done (learnimo) |
| 4.4.2 | Landing page | Should Have |
| 4.4.3 | Product Hunt / LinkedIn launch post | Could Have |
| 4.4.4 | Feedback collection mechanism | Should Have |
| 4.4.5 | Analytics setup (privacy-respecting) | Should Have |

### Phase 4 Exit Criteria
- [ ] External users can sign up and use the app
- [ ] Feedback mechanism is in place
- [ ] At least 1 article published about the project
- [ ] Basic analytics tracking usage patterns

---

## Future Considerations (Backlog)

These items are out of scope for the initial roadmap but may be prioritized later:

| Feature | Rationale |
|---------|-----------|
| AI Chat Interface | Query POKs via natural language conversation |
| Graph Visualization | Visual map of POK connections |
| Browser Extension | Quick capture from any webpage |
| IDE Plugin | Capture learnings without leaving the editor |
| Team/Sharing Features | Curated knowledge sharing (opt-in) |
| Offline Mode | Full offline-first with sync |
| Voice Input | Record POKs via voice (mobile) |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep | High | High | Strict MVP definition, defer nice-to-haves |
| Time constraints (solo dev) | Medium | High | Focus on 3-5 sessions/week, realistic timeline |
| Learning curve (React/Next.js) | Medium | Medium | Use v0.dev for UI, leverage Claude Code |
| Supabase free tier limits | Low | Low | Monitor usage, upgrade path clear |
| Burnout | High | Medium | Sustainable pace, take breaks, celebrate milestones |

---

## Success Milestones

| Milestone | Target Date | Success Indicator |
|-----------|-------------|-------------------|
| 🏁 MVP Live | Week 8 | App deployed, author using daily |
| 🏷️ Tagging Works | Week 12 | 50+ POKs tagged |
| 🔍 Semantic Search | Week 16 | Search finds relevant POKs >80% of time |
| 📱 Mobile App | Week 20 | Author captures POKs on mobile |
| 🚀 Public Launch | Week 25+ | 10 external users |

---

## How to Use This Roadmap

1. **Weekly Check-in:** Review current milestone progress
2. **Adjust as Needed:** Move items between phases based on learnings
3. **Celebrate Wins:** Mark deliverables as done ✅
4. **Update Estimates:** Refine timeline based on actual velocity

This is a living document. Update it as the project evolves.

---

## Document History

| Version | Date | Author | Changes |
|:-------:|:----:|:------:|:--------|
| 1.0 | 2026-01-29 | Lucas Xavier Ferreira | Initial version |
| 1.1 | 2026-02-11 | Lucas Xavier Ferreira | Phase 0 complete, Auth backend implemented (PR #15) |
| 1.2 | 2026-02-13 | Lucas Xavier Ferreira | Auth web implemented — login/register pages, auth context, i18n (PR #17) |
| 1.3 | 2026-02-13 | Lucas Xavier Ferreira | Google OAuth implemented — backend + web (PR #20) |
| 1.4 | 2026-02-14 | Lucas Xavier Ferreira | POK CRUD implemented — full CRUD operations backend + web (feat/pok-crud) |
| 1.5 | 2026-02-15 | Lucas Xavier Ferreira | POK Listing & Search implemented — keyword search, sorting, filters (feat/pok-listing-search) |
| 1.6 | 2026-02-18 | Lucas Xavier Ferreira | Spring Boot upgraded 3.4 → 4.0.2; test imports migrated to SB4 package structure |
| 1.7 | 2026-02-19 | Lucas Xavier Ferreira | UI/UX Polish — dark mode, i18n (EN/PT-BR), aria-labels, locale fixes (feat/dark-mode-i18n) |
| 1.8 | 2026-02-19 | Lucas Xavier Ferreira | PR review fixes — PokCard 'use client', locale redirect, dead-code removal, i18n results count, a11y dialog + form |
| 1.9 | 2026-02-19 | Lucas Xavier Ferreira | Rebranded to learnimo; CORS fix merged to main (PR #38); deployment preparation started — domain learnimo.net registered |
| 2.0 | 2026-02-20 | Lucas Xavier Ferreira | MVP deployed — learnimo.net live on Railway + Vercel + Supabase |
| 2.1 | 2026-02-20 | Lucas Xavier Ferreira | Production bug fix — Google Sign-Up 500 (PgBouncer pooler env var); added AuthIntegrationTest with Testcontainers |
| 2.2 | 2026-02-20 | Lucas Xavier Ferreira | Production infra fixes — added Flyway starter dependency (SB4), switched DB_HOST to Supabase IPv4 session-mode pooler (Railway IPv6 incompatibility), added explicit JDBC driver-class-name, removed database-platform, disabled Flyway in test profile |
| 2.3 | 2026-02-20 | Lucas Xavier Ferreira | HomeCta auth-aware fix (authenticated users silently looped back to home; now routed to /poks); added Phase A page-level behavior tests (Vitest) — 8 new test files covering all pages, test count 101 → 161 |
