# Roadmap — learnimo

This document outlines the development phases, milestones, and timeline for the learnimo project.

---

## Overview

The project follows an iterative development approach, prioritizing a functional MVP for personal use before expanding features and audience.

```
  Phase 0        Phase 1        Phase 2        Phase 3        Phase 4
  Foundation ──► MVP        ──► Evolution  ──► AI & Mobile ──► Growth
  Setup &        Core           Enhanced       AI Features    Marketing
  Planning       Features       Experience     & Mobile       & Feedback

                                                    │
                                                    ▼

                              Phase 5        Phase 6        Phase 7
                              Privacy    ──► Social     ──► Gamification
                              POK            Follow /       Milestone
                              Visibility     Profiles       Badges
```

---

## Phase 0: Foundation

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

## Phase 1: MVP

**Goal:** Deliver a functional web application for personal use with core POK management features.

### Implemented

#### Milestone 1.1: Authentication

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1.1.1 | User registration (email/password) | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.2 | User login (email/password) | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.3 | Google OAuth login | Must Have | ✅ Backend + Web (PR #20) |
| 1.1.4 | JWT session management | Must Have | ✅ Backend (PR #15) + Web (PR #17) |
| 1.1.5 | Password reset flow | Should Have | ✅ Implemented (2026-02-21) |

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

#### Milestone 1.4: UI/UX Polish

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

> **Next priority: Milestone 1.7 UX Review** — Password reset (1.1.5) is complete. All critical friction issues in Milestone 1.7 are now resolved (session persistence ✅, post-login redirect ✅, home page for guests ✅, clickable logo ✅, single-column feed ✅). The 1-week usage clock can now meaningfully restart.

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

#### Milestone 1.7: MVP UX Review (2026-02-21)

> Findings from first production usage. These friction issues block the Phase 1 exit criterion
> ("author uses the app for 1+ week with satisfaction").

**Critical (blocks Phase 1 exit):**

| # | Issue | Req | Status |
|---|-------|-----|--------|
| 1.7.1 | Session lost on F5/refresh — JWT in `useRef` (in-memory only) | AUTH-04 | ✅ Done (feat/persistent-user-sessions) |
| 1.7.2 | Home page is an empty "Get Started" screen — guests should see login form directly | USE-10 | ✅ Done (chore/mvp-ux-review) |
| 1.7.3 | Post-login lands on home, not feed — extra click to reach learnings | USE-06 | ✅ Done (chore/mvp-ux-review) |
| 1.7.4 | "learnimo" title in header not clickable — should link to feed (auth) or home (guest) | USE-07 | ✅ Done (chore/mvp-ux-review) |
| 1.7.5 | Feed uses multi-column grid — should be single-column vertical, LIFO | USE-08 | ✅ Done (chore/mvp-ux-review) |

**Moderate (improves experience, can ship iteratively):**

| # | Issue | Req | Status |
|---|-------|-----|--------|
| 1.7.6 | General visual quality — UI looks like a raw form | — | ⏳ Needs design pass |
| 1.7.7 | No inline quick-entry — "New Learning" navigates to separate page | USE-09 | ✅ Done — Phase A (chore/mvp-ux-review) |
| 1.7.8 | Google login button styling — white borders/margins clash with blue background | — | ✅ Done (chore/mvp-ux-review) |

**Notes:**
- 1.7.1–1.7.5 must be resolved before Phase 1 exit criterion can be satisfied
- 1.7.2: Guest home page becomes the login form directly (brand + tagline above, "Sign up" link below). Eliminates the intermediate "Get Started" screen.
- 1.7.7: See quick-entry design decision below.
- 1.7.8: Fix by adjusting the container/background around Google's standard button (not custom styling, to respect Google branding guidelines).

##### Quick-Entry Design Decision (1.7.7)

The inline quick-entry uses a **phased approach**:

**Phase A (Milestone 1.7):** Single textarea, content-only. No title parsing.
- Placeholder: "What did you learn?"
- Submit: `Ctrl+Enter` / `Cmd+Enter`
- After save: clear textarea, show toast, prepend new learning to list
- The "New Learning" button remains for the full-form experience (deliberate entries with titles)
- Rationale: Maximum friction reduction, zero learning curve, backend already supports null titles

**Phase B (future, if needed):** Add first-line-as-title parsing.
- First line renders bold/larger in real-time (Apple Notes / Bear pattern)
- Subsequent lines render in normal body style
- Single-line entries remain content-only (no title)
- Only add this if Phase A usage reveals missing inline titles as a pain point

**Precedent:** Apple Notes, Bear, and Day One all use first-line-as-title for personal knowledge capture.

##### UI Improvement Tooling Recommendation (2026-02-21)

> Open question from MVP review: What tool/approach for frontend UI improvement?

**Recommended phased approach:**

1. **Milestone 1.7 (layout/navigation fixes):** Use **Claude Code** directly. Items 1.7.2–1.7.5, 1.7.7–1.7.8 are structural changes (routing, grid layout, links) — not design work.
2. **Visual polish (1.7.6):** Use **v0.dev** (Vercel's AI UI generator) to prototype improved component designs. Generates Tailwind + React directly — stays within the existing tech stack.
3. **Future (Phase 2+):** If a comprehensive design system is needed, use **Figma** for mockups before implementation. A dedicated `ux-specialist` Claude agent (`.claude/agents/`) could review PRs for UX consistency and accessibility.

**Why NOT Lovable/Bolt:** These tools generate entire apps from scratch. learnimo has an established codebase with patterns, tests, and conventions. Iterate on what exists.

---

### MVP Exit Criteria
- [ ] User can register, login, and logout
- [ ] User can create POKs with title and content
- [ ] User can search and list their POKs
- [ ] Dark mode works
- [ ] Both EN and PT-BR languages work
- [x] App is deployed and accessible online
- [ ] Author uses the app for 1+ week

---

## Phase 2: Evolution

**Goal:** Enhance the core experience with editing, tagging, and better visualization.

### Implemented

#### Milestone 2.1: POK Editing & Deletion

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 2.1.1 | Edit POK content | Must Have | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.2 | Edit POK title | Must Have | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.3 | Soft delete POK | Should Have | ✅ Backend + Web (feat/pok-audit-trail) |
| 2.1.4 | Audit trail logging | Must Have | ✅ Backend (feat/pok-audit-trail) — V6 Flyway migration, `PokAuditLog` entity + repository, audit logging in `PokService` (create/update/delete) |
| 2.1.5 | View POK history (FR18-FR20) | Could Have | ⏳ Backend endpoint ships (`GET /api/v1/poks/{id}/history`); frontend history UI deferred |

**Notes:**
- `Toast` component added (accessible, `role="status"`, `aria-live="polite"`); success toast on edit/delete in `EditPokPage` and `ViewPokPage`
- All tests pass: PokServiceTest 26/26, PokControllerTest 33/33, web 164/164
- Frontend history view (FR18-FR20) deferred — backend endpoint available for future UI implementation

### Planned

### Milestone 2.2: Tagging System

| # | Feature | Priority |
|---|---------|----------|
| 2.2.1 | Manual tag creation (learner creates new tags freely) | Must Have |
| 2.2.2 | Assign tags to POKs | Should Have |
| 2.2.3 | Filter POKs by tag | Must Have |
| 2.2.4 | Tag management (rename, delete) | Should Have |
| 2.2.5 | Basic AI auto-tag suggestions (explicit tags from content) | Must Have |
| 2.2.6 | Approve/reject/modify suggested tags | Must Have |

> **Note:** Intent-based related-concept tag suggestions (e.g., singleton POK → #designpatterns) ship in Phase 7 (AI-Assisted Tag Suggestions).

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
| 2.4.1 | Random inspirational prompt on "add new learning" page — e.g., "TIL (Today I learned...)", "Essa semana eu aprendi que...", "Esse livro me ensinou..." — sourced from a localised dictionary/database, changes on every page load | Should Have |
| 2.4.2 | Homepage personalization after first learning: replace the "Get Started" CTA with a persistent layout of (1) a textbox to input new learnings and (2) a search bar — the learner's primary daily workflow. **Note:** Inline quick-entry (USE-09) pulled forward to Milestone 1.7.7 as MVP-blocking. | Must Have |

### Evolution Exit Criteria
- [x] Learner can edit and delete POKs
- [x] All changes are logged in audit trail
- [ ] Tagging system works (manual creation + AI suggestions for explicit tags)
- [ ] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs
- [ ] Inspirational prompts appear on add-learning page
- [ ] Homepage adapts after first learning is recorded

---

## Phase 3: AI & Mobile

**Goal:** Add semantic search, AI insights, and mobile app.

### Milestone 3.1: Semantic Search

| # | Feature | Priority |
|---|---------|----------|
| 3.1.1 | Generate embeddings for POKs | Must Have |
| 3.1.2 | pg_vector similarity search | Must Have |
| 3.1.3 | Hybrid search (keyword + semantic) | Should Have |
| 3.1.4 | Search relevance tuning | Should Have |

### Milestone 3.2: AI Connections

| # | Feature | Priority |
|---|---------|----------|
| 3.2.1 | Identify related POKs | Should Have |
| 3.2.2 | "Related learnings" section on POK view | Should Have |
| 3.2.3 | Connection strength indicators | Could Have |

### Milestone 3.3: Mobile App

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

## Phase 4: Growth & Polish

**Goal:** Prepare for external users, add export features, and gather feedback.

### Milestone 4.1: Data Export

| # | Feature | Priority |
|---|---------|----------|
| 4.1.1 | Export all POKs as JSON | Should Have |
| 4.1.2 | Export all POKs as Markdown | Should Have |
| 4.1.3 | Export filtered POKs | Could Have |
| 4.1.4 | Brag doc generator | Could Have |

### Milestone 4.2: Security Hardening

| # | Feature | Priority |
|---|---------|----------|
| 4.2.1 | MFA support | Should Have |
| 4.2.2 | Rate limiting audit | Should Have |
| 4.2.3 | Security headers review | Should Have |
| 4.2.4 | Penetration testing (basic) | Could Have |

### Milestone 4.3: External Sharing

| # | Feature | Priority |
|---|---------|----------|
| 4.3.1 | Share POK to LinkedIn | Could Have |
| 4.3.2 | Share POK to Medium | Could Have |
| 4.3.3 | Share POK to Substack | Could Have |
| 4.3.4 | Public read-only link generation | Could Have |

### Milestone 4.4: Launch Preparation

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.4.1 | Product naming finalization | Should Have | ✅ Done (learnimo) |
| 4.4.2 | Landing page | Should Have | |
| 4.4.3 | Product Hunt / LinkedIn launch post | Could Have | |
| 4.4.4 | Feedback collection mechanism | Should Have | |
| 4.4.5 | Analytics setup (privacy-respecting) | Should Have | |

### Phase 4 Exit Criteria
- [ ] External users can sign up and use the app
- [ ] Feedback mechanism is in place
- [ ] At least 1 article published about the project
- [ ] Basic analytics tracking usage patterns

---

---

## Phase 5: Privacy (TBD)

**Goal:** Give learners full control over the visibility of their POKs. Privacy infrastructure is the prerequisite for all social features.

**Design Principles:**
- Default is private — learners opt in to sharing, never out
- Visibility can always be changed after creation
- Phase 5 ships the initial two tiers (private / public); followers-only and colleagues-only unlock in Phase 6 when the social graph exists

### Milestone 5.1: POK Visibility Controls

| # | Feature | Priority |
|---|---------|----------|
| 5.1.1 | POK visibility field (private / public — Phase 5; followers-only / colleagues-only — Phase 6) | Must Have |
| 5.1.2 | Default visibility setting per learner (default: private) | Must Have |
| 5.1.3 | Set visibility at POK creation time | Must Have |
| 5.1.4 | Edit visibility of an existing POK at any time | Must Have |
| 5.1.5 | Access control enforcement — public POKs visible to all; private POKs visible only to owner; if owner changes a POK to private, all shares of it disappear from other learners' feeds and profiles | Must Have |
| 5.1.6 | Share visibility constraint: a shared POK's visibility may be equal to or narrower than the original's (e.g., a followers-only POK can be shared as followers-only, colleagues-only, or private — but not public) | Must Have |
| 5.1.7 | UI indicators for visibility level on POK cards and detail views | Should Have |

### Milestone 5.2: Learner Profile Privacy

| # | Feature | Priority |
|---|---------|----------|
| 5.2.1 | Profile visibility setting: public / followers-only / colleagues-only / private | Must Have |
| 5.2.2 | Public profiles discoverable by any visitor; private profiles visible only to the owner | Must Have |
| 5.2.3 | No visible follower count, colleague count, or total learning count on public profiles (anti-vanity principle) | Must Have |

### Phase 5 Exit Criteria
- [ ] POKs are private by default; learners can make individual POKs public
- [ ] Learners can set their default visibility preference
- [ ] Access control correctly enforced for all endpoints and UI views
- [ ] Share cascade rule works: POK going private removes all downstream shares

---

## Phase 6: Social Capabilities (TBD)

**Goal:** Enable learners to connect, follow each other, discover public learnings, and share content — all without rewarding vanity metrics.

**Design Principles:**
- No follower, colleague, or learning counts visible on public profiles (anti-vanity)
- Learners can see their own counts privately (in their own profile/settings view)
- Mutual follows = **colleagues** (emerges automatically — no separate request flow)
- Social connections named to reinforce the learning context: colleagues, class, study group
- Kindness is a first-class principle: the platform is an open space where learners may record mistakes — humiliation and harassment are not tolerated

### Milestone 6.1: Following & Colleagues

| # | Feature | Priority |
|---|---------|----------|
| 6.1.1 | Follow a learner | Must Have |
| 6.1.2 | Unfollow a learner | Must Have |
| 6.1.3 | Mutual follow = colleague (automatic, no separate request) | Must Have |
| 6.1.4 | Followers-only and colleagues-only visibility tiers (unlocked from Phase 5 model) | Must Have |
| 6.1.5 | Learner can privately see own counts: total learnings, followers, following, colleagues | Must Have |
| 6.1.6 | Follow notification copy — e.g., "Learner Lucas wants to learn with you" / "Xavier is now learning from you" | Should Have |
| 6.1.7 | Unfollow notification — notify the unfollowed learner when a colleague parts ways (copy TBD; tone: matter-of-fact, not dramatic) | Could Have |

### Milestone 6.2: Classes & Study Groups

| # | Feature | Priority |
|---|---------|----------|
| 6.2.1 | Learners can form an opt-in named group (Class / Study Group) with their colleagues | Could Have |
| 6.2.2 | Groups are never auto-created by the system — always deliberate | Must Have (constraint) |
| 6.2.3 | Group visibility and membership rules respect individual privacy settings | Must Have |

### Milestone 6.3: Learner Profiles

| # | Feature | Priority |
|---|---------|----------|
| 6.3.1 | Public profile page at `/learners/{handle}` | Must Have |
| 6.3.2 | Profile shows avatar and display name | Must Have |
| 6.3.3 | Optional short bio (few hundred characters max; no external links or social media redirects) | Should Have |
| 6.3.4 | Avatar upload (Supabase Storage, size limits, format validation, resizing) | Must Have |
| 6.3.5 | Profile respects visibility settings — private profiles not accessible to non-followers | Must Have |
| 6.3.6 | No vanity metrics on public profiles: follower, colleague, and learning counts hidden from all viewers except the profile owner | Must Have |
| 6.3.7 | Clickable `@handle` in header links to own profile; avatar thumbnail displayed next to handle | Should Have |

### Milestone 6.4: Share (Re-Learning)

| # | Feature | Priority |
|---|---------|----------|
| 6.4.1 | Share a public POK (creates a reference in the learner's feed, attributed to the original author) | Should Have |
| 6.4.2 | Shared POK appears in sharer's feed and profile, linked back to the original | Should Have |
| 6.4.3 | Original author notified when their POK is shared (respects notification settings) | Should Have |
| 6.4.4 | Shared POK visibility constrained to equal or narrower than original's | Must Have |
| 6.4.5 | When original POK is changed to private, all downstream shares disappear from feeds and profiles | Must Have |

### Milestone 6.5: Discovery Feed

| # | Feature | Priority |
|---|---------|----------|
| 6.5.1 | Feed of public POKs from learners you follow | Must Have |
| 6.5.2 | Discover public learners (search by handle or name) | Should Have |

### Milestone 6.6: Community Principles & Content Moderation

| # | Feature | Priority |
|---|---------|----------|
| 6.6.1 | Publish learnimo Manifest / Community Principles document — includes kindness rule: learners may make mistakes while learning; humiliation and harassment are not tolerated | Must Have |
| 6.6.2 | Report/flag mechanism for inappropriate content on shared POKs | Must Have |
| 6.6.3 | AI moderation agent to scan shared POK comments/notes for harmful or abusive language | Should Have |
| 6.6.4 | Community guidelines linked from onboarding and profile pages | Should Have |

### Phase 6 Exit Criteria
- [ ] Learners can follow/unfollow others
- [ ] Mutual follows correctly identified as colleagues
- [ ] Profiles display correctly with appropriate visibility enforcement
- [ ] Share feature works with proper attribution and visibility cascade rules
- [ ] No vanity metrics (follower/colleague/learning counts) visible on public profiles
- [ ] Community Principles document published and linked in-app
- [ ] Report mechanism functional

---

## Phase 7: Gamification (TBD)

**Goal:** Celebrate personal learning milestones with private-by-default badges — non-competitive, non-tracking, and aligned with the mission of encouraging consistent learning.

**Design Principles:**
- Badges are **personal celebrations**, not competitive rankings
- No streaks, no consecutive-day tracking, no pressure mechanics
- Badges are **private by default**; learner can choose to make specific badges public
- Public badges must respect profile and POK privacy settings (no information leakage)

### Milestone 7.1: AI-Assisted Tag Suggestions

> **Note:** Basic manual tagging ships in Phase 2. This milestone adds AI-powered intent-based suggestions.

| # | Feature | Priority |
|---|---------|----------|
| 7.1.1 | AI engine infers explicit tags from POK content (e.g., #springboot from the text) | Must Have |
| 7.1.2 | AI engine infers related concept tags from intent (e.g., singleton POK → also suggests #designpatterns, #oop) | Should Have |
| 7.1.3 | Suggested tags presented to learner for approval before saving — never auto-applied silently | Must Have |
| 7.1.4 | Learner can propose additional tags not suggested by AI | Should Have |
| 7.1.5 | Learner can create entirely new tags that don't exist yet | Must Have |
| 7.1.6 | Tag suggestion model improves over time based on the learner's own tag history | Could Have |

### Milestone 7.2: Milestone Badges

| # | Badge Category | Examples | Priority |
|---|---------------|----------|----------|
| 7.2.1 | **Volume milestones** | 1st learning, 10th, 50th, 100th, 500th | Must Have |
| 7.2.2 | **Tag depth** | 10 learnings with the same tag ("you're becoming an expert in #java") | Should Have |
| 7.2.3 | **Tag breadth** | Used 5+ different tags ("curious mind") | Could Have |
| 7.2.4 | **Weekly celebration** | Recorded 5+ learnings in a single week — a one-time celebration toast, no countdown UI, no pressure | Should Have |
| 7.2.5 | **Revisitor** | Updated a learning 3+ times ("learning is iterative") | Could Have |
| 7.2.6 | **Social** (Phase 6 dependency) | First share; first follower | Could Have |

### Milestone 7.3: Badge Privacy & Display

| # | Feature | Priority |
|---|---------|----------|
| 7.3.1 | All badges private by default | Must Have |
| 7.3.2 | Learner can make individual badges public | Must Have |
| 7.3.3 | Public badges visible on learner's profile (below avatar) | Should Have |
| 7.3.4 | Public badges never expose counts or metrics that violate anti-vanity principle | Must Have |
| 7.3.5 | Badge notification shown in-app at award time (celebration toast / modal) | Must Have |
| 7.3.6 | Badge visual design — illustrations or icons per badge type (design assets TBD; may use AI image generation, stock icon libraries, or a commissioned designer) | Should Have |

### Phase 7 Exit Criteria
- [ ] AI tag suggestions surface both explicit and related-concept tags
- [ ] Learner always approves tags before they are saved — no silent auto-tagging
- [ ] Learners can create new tags that don't exist yet
- [ ] Badges awarded automatically on milestone events (POK creation, updates)
- [ ] All badges private by default; learner controls visibility per badge
- [ ] No competitive elements, streak counters, or progress bars visible
- [ ] Badge display on profiles respects all privacy settings

---

## Future Considerations (Backlog)

These items are out of scope for the initial roadmap but may be prioritized later:

| Feature | Rationale |
|---------|-----------|
| AI Chat Interface | Query POKs via natural language conversation |
| Graph Visualization | Visual map of POK connections and tag relationships |
| Browser Extension | Quick capture from any webpage |
| IDE Plugin | Capture learnings without leaving the editor |
| Offline Mode | Full offline-first with sync |
| Voice Input | Record POKs via voice (mobile) |
| Push Notifications | Mobile push notifications for social events (shares, new followers) |

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

| Milestone | Success Indicator |
|-----------|-------------------|
| 🏁 MVP Live | App deployed, author using daily |
| ✏️ Evolution | Tagging works; 50+ POKs tagged; author uses timeline view |
| 🔍 Semantic Search | Search finds relevant POKs >80% of the time |
| 📱 Mobile App | Author captures POKs on mobile |
| 🔒 Privacy | All POKs have visibility controls; access enforcement confirmed |
| 👥 Social | Author follows at least 3 learners; share feature in use |
| 🏅 Gamification | First milestone badges awarded; AI tag suggestions in use |
| 🚀 Public Launch | 10 external learners; community principles published |

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
| 2.4 | 2026-02-20 | Lucas Xavier Ferreira | Added Phase 5 (Privacy), Phase 6 (Social Capabilities), Phase 7 (Gamification) to roadmap; updated timeline chart; added "Learner", "Friendship", and "Echo" to GLOSSARY |
| 2.5 | 2026-02-20 | Lucas Xavier Ferreira | Revised Phases 5–7: resolved Echo→Share naming, colleagues/class terminology, bio rules, anti-vanity owned counts, community principles, AI moderation; added Phase 2 Milestone 2.4 (UX Delight: random prompts + homepage personalization); simplified timeline chart (removed week estimates); updated GLOSSARY (Colleague, Class/Study Group, Share) |
| 2.6 | 2026-02-20 | Lucas Xavier Ferreira | Milestone 2.1 complete — POK editing, deletion, and audit trail implemented (feat/pok-audit-trail); frontend history view (FR18-FR20) deferred; Toast component added; `/finish-session` command updated with unused import checks |
| 2.7 | 2026-02-21 | Lucas Xavier Ferreira | Added Milestone 1.7 (MVP UX Review, 8 items); quick-entry design decision; UI tooling recommendation; 6.3.7 (clickable handle + avatar); cross-referenced 2.4.2 with 1.7.7 |
| 2.8 | 2026-02-21 | Lucas Xavier Ferreira | Added JaCoCo code coverage to backend CI pipeline (PR #57) — 90% line coverage threshold enforced; added JwtAuthenticationFilterTest and GlobalExceptionHandlerTest to close coverage gap; backend coverage 86% → 93.9% |
| 2.9 | 2026-02-21 | Lucas Xavier Ferreira | Milestone 1.1.5 complete — Password reset implemented end-to-end: V7 Flyway migration, PasswordResetToken entity + repo, EmailService (SMTP/Resend), PasswordResetService (12 unit tests), PasswordResetController (3 endpoints, 12 MockMvc tests), GlobalExceptionHandler fix; web: ForgotPasswordForm + ResetPasswordForm components, 2 new pages, LoginForm "Forgot password?" link, reset=success banner, i18n keys (EN/PT-BR), 19 new Vitest tests, all 177 tests pass |
| 3.0 | 2026-02-22 | Lucas Xavier Ferreira | Claude Code tooling improvements — `/review-pr` gained §3A.5 "Coverage Failures" with JaCoCo-first path (reads `jacoco.xml` via Python before running tests locally); new `steward` agent parses JaCoCo XML, identifies highest-missed-line classes, writes targeted JUnit 5 tests, and confirms threshold via `mvn verify`; `/finish-session` now checks LINE coverage against 90% threshold after `mvn verify` and blocks commit + delegates to `steward` if below |
| 3.1 | 2026-02-22 | Lucas Xavier Ferreira | Documentation review and consistency fixes — corrected learnimo name etymology (learn + imọ̀ Yoruba + ânimo phonetic); fixed prompts directory path; updated Phase 1 roadmap status; clarified POL synonym scope; split auto-tagging definition by phase; fixed AUTH-04 table rendering; added USE-10 to MoSCoW; removed stale milestone notes; fixed 4.4 table header; added steward agent docs |
| 3.2 | 2026-02-22 | Lucas Xavier Ferreira | Milestone 1.7.1 complete — Session persistence implemented: httpOnly cookie-based token delivery (backend: AuthController refactored, CookieHelper, UserPrincipal, GET /auth/me; frontend: AuthContext initializeSession, api.ts silent refresh, auth.ts simplified); PokRepositoryTest Docker guard fixed |
