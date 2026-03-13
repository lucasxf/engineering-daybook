# learnimo

> A personal learning journal for everyone — capture, organize, and recall what you learn.

🚀 **Status:** Phase 1 — MVP **Live at [learnimo.net](https://learnimo.net) · [learnimo.com.br](https://learnimo.com.br)**

---

## Overview

learnimo is a personal learning journal for everyone. Inspired by "The Pragmatic Programmer", where engineers in traditional industries maintained physical notebooks called engineering daybooks to record daily learnings, learnimo brings that practice into the digital age — with modern search, tagging, and (eventually) AI-powered insights.

> "A tinta mais fraca constrói pontes mais fortes que a memória mais viva."
> — Provérbio Yorubá (Nigéria)

---

## What It Is

- A place to record and search through your own learnings
- A learning journal with automatic and manual tagging
- A tool that keeps your learnings atomic, searchable, and immutable (protected from AI hallucination)

## What It Isn't

- A general-purpose notes app (OneNote, Evernote)
- A task/project management tool (Jira, Notion)
- A text editor (Notepad, VS Code)
- An AI chatbot that generates or modifies your content

---

## The Name

**learnimo** emerged from a cross-linguistic exploration of words for learning, memory, and knowledge — drawing from Portuguese, English, Swahili (Bantu), and Yoruba (which also inspired the opening quote above).

The name carries three semantic layers:

- **learn** — the core action the app enables (to learn / aprender)
- **imo** — Yoruba for knowledge and learning (*imọ̀*, the root behind *aprendizado*)
- Say *learnimo* out loud and you can hear **ânimo** — Portuguese for energy, spirit, drive

The runner-up names in that exploration were **daftari** (Swahili for "notebook", strong cultural identity) and **devimo** (developer-focused startup vibe). **learnimo** was chosen for its global reach and because it carries meaning in multiple languages without belonging to just one.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend (Web)** | Next.js 16, TypeScript, Tailwind CSS, react-markdown |
| **Frontend (Mobile)** | Expo SDK 53 (React Native 0.79), TypeScript, react-native-markdown-display |
| **Backend** | Java 21, Spring Boot 4.0+, Maven |
| **Database** | PostgreSQL 15+ with pgvector + uuid-ossp extensions |
| **Infrastructure** | Vercel (web), Railway (backend), Supabase (database) |
| **CI/CD** | GitHub Actions |
| **Versioning** | Semantic Versioning + Conventional Commits + Release Please |

---

## Project Structure

```
/engineering-daybook
├── backend/                  # Java Spring Boot API
├── web/                      # Next.js web application
├── mobile/                   # Expo mobile application
│   ├── e2e/                  # Maestro E2E test flows
│   └── store-assets/         # Play Store / App Store listing assets
├── docs/                     # Project documentation
│   ├── PROJECT_VISION.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── GLOSSARY.md
│   ├── ROADMAP.md              # Phase index (source of truth for active phase)
│   ├── ROADMAP.phase-{N}.md   # Per-phase details (0–8)
│   └── specs/                  # Spec-Driven Development feature specs
│       └── features/           # 26 feature specs (one per shipped milestone)
├── .claude/                  # Claude Code automation
│   ├── agents/               # Specialized AI agents (tech-writer, sous-chef, etc.)
│   ├── commands/             # Slash commands (/finish-session, /write-spec, etc.)
│   ├── skills/               # Reusable skill prompts (mobile-design-system, etc.)
│   ├── scripts/              # Automation scripts (coverage, metrics, registry)
│   └── metrics/              # Session usage stats and recommendations
├── .github/workflows/        # CI/CD pipelines (ci, release-please, claude)
├── docker-compose.yml        # Local development database (PostgreSQL + pgvector)
├── CLAUDE.md                 # Claude Code context
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

- Java 21 (LTS)
- Node.js 20+
- Maven 3.9+
- Docker (for local database)

### Installation

```bash
# Clone the repository
git clone https://github.com/lucasxf/engineering-daybook.git
cd engineering-daybook

# Start local PostgreSQL (with pgvector)
docker-compose up -d

# Backend
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui
# Note: on Windows, ./mvnw may fail with an SSL error — use system mvn instead: mvn spring-boot:run

# Web (new terminal)
cd web
npm install
npm run dev
# Web app available at http://localhost:3000

# Mobile (new terminal)
cd mobile
npm install --legacy-peer-deps   # required for Expo SDK 53 peer deps
npx expo start
```

### Configuration

The backend requires environment variables for:
- Database connection (PostgreSQL)
- JWT signing key
- Google OAuth credentials (optional, for OAuth login)

See `backend/src/main/resources/application.yml` for configuration details.

The web app requires `NEXT_PUBLIC_API_URL` pointing to the backend (default: `http://localhost:8080`).

The mobile app requires `EXPO_PUBLIC_API_URL` for the same.

---

## Features

### Implemented
- **User Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - JWT-based session management with httpOnly cookies
  - Secure password hashing with BCrypt
  - Password reset via email

- **Learning Management**
  - Create, read, update, and delete learnings
  - Rich text content with Markdown support (web + mobile)
  - Automatic and manual tagging — tag assignment at creation time (QuickEntry and /new page)
  - AI-powered tag suggestions (approve/reject; generated from HuggingFace keyword extraction)
  - Tag CRUD with display-name normalization; tag filtering on the feed
  - Audit trail for all changes
  - Tag-grouped view (alphabetical sections, untagged at bottom)
  - Timeline view (month/year grouped, newest-first, locale-aware)
  - Sort options: Newest, Oldest, Recently updated
  - Hybrid search (keyword + semantic via pgvector cosine similarity)
  - AI-powered embeddings via HuggingFace Inference API (async, non-blocking)
  - Visibility controls — private by default; learners can make individual learnings public (irreversible); per-user default visibility preference

- **Social & Discovery**
  - Follow/unfollow learners; automatic colleague detection (mutual follow)
  - 4-tier visibility: PRIVATE, FOLLOWERS_ONLY, COLLEAGUES_ONLY, PUBLIC
  - Discovery feed — aggregates learnings and re-learnings from followed learners
  - Learner search — Discover page to find learners by handle or name
  - Re-Learning — share any public learning to your own feed with attribution; visibility cascade enforced (shared visibility ≤ original)
  - Anti-vanity design — no public follower counts

- **Learner Profiles**
  - Public profile page at `/learners/{handle}` with avatar, display name, and bio
  - Avatar upload with automatic resize to 200×200 JPEG (Supabase Storage, 2 MB limit, JPEG/PNG/WebP)
  - Short bio editing; external links blocked by design
  - Clickable handle and avatar thumbnail in navigation header
  - Profile respects visibility settings

- **Web Application**
  - Responsive design with Tailwind CSS
  - Internationalization (EN/PT-BR) with next-intl
  - Dark mode / light mode / system theme toggle
  - Protected routes and authentication flows
  - Modern React patterns with TypeScript
  - E2E tested with Playwright (auth redirect, login, create/edit/delete learnings)

- **Mobile Application (Expo/React Native)**
  - Auth: login, register, password reset, Google OAuth
  - Learning feed with search (hybrid keyword + semantic)
  - Create, edit, and delete learnings with Markdown rendering
  - Visibility picker at creation; visibility badge and toggle on detail screen
  - Discover screen — learner search and follow/unfollow
  - Learner profile screen with avatar, bio, and follow status
  - Avatar and bio display on ProfileScreen; avatar upload/remove via settings
  - Dark mode / light mode / system theme
  - Internationalization (EN/PT-BR)

---

## Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for the index of all phases.

### Phase 0: Foundation — ✅ Complete
See [ROADMAP.phase-0.md](./docs/ROADMAP.phase-0.md)

### Phase 1: MVP — 🔄 Active
See [ROADMAP.phase-1.md](./docs/ROADMAP.phase-1.md)
- [x] User authentication (email + password + Google OAuth + password reset)
- [x] Learning CRUD (backend + web)
- [x] Search (keyword, filters, sorting)
- [x] Dark mode + i18n (EN/PT-BR)
- [x] Deployed to production (learnimo.net · learnimo.com.br)
- [x] Session persistence (httpOnly cookies)
- [x] Inline quick-entry
- [x] Visual polish (1.7.6) — standardized palette, animation tokens, shared UI components (Alert, Card, Textarea, Select), accessible custom dropdown, spacing fixes
- [ ] Phase 1 exit criterion: 1+ week usage

### Phase 2: Evolution — 🔄 Started
See [ROADMAP.phase-2.md](./docs/ROADMAP.phase-2.md)
- [x] POK editing, deletion, and audit trail
- [x] Tagging system — full web UI done (TagSection, add/remove tags from view and edit pages, tag assignment at creation time via TagPicker, post-create redirect to tag UI, AI keyword-based tag suggestions with approve/reject)
- [x] Visualization — tag-grouped view, timeline view (month/year), sort options (Newest/Oldest/Recently updated)
- [ ] UX Delight — inspirational prompts, homepage personalization

### Phase 3: AI & Mobile — 🔄 In Progress
See [ROADMAP.phase-3.md](./docs/ROADMAP.phase-3.md)
- [x] Semantic search — hybrid keyword + vector search via pgvector; embeddings from HuggingFace Inference API
- [ ] AI Connections (related learnings)
- [x] Mobile app (Expo/React Native) — auth, feed, create/edit/delete, dark mode, i18n EN/PT-BR
- [ ] App Store Publishing (TestFlight + Play Store internal track)

### Phase 4: Growth — ⏸️ Postponed
See [ROADMAP.phase-4.md](./docs/ROADMAP.phase-4.md)

### Phase 5: Privacy — 🔄 In Progress
See [ROADMAP.phase-5.md](./docs/ROADMAP.phase-5.md)
- [x] POK Visibility Controls — private by default, per-learning public toggle (irreversible), default visibility preference, access control enforcement, UI indicators on web and mobile
- [x] Learner Profile Privacy — profileVisibility field, public learner profile page, settings page/screen, E2E tests

### Phase 6: Social Capabilities — 🔄 In Progress
See [ROADMAP.phase-6.md](./docs/ROADMAP.phase-6.md)
- [x] Following & Colleagues — follow/unfollow, automatic colleague detection (mutual follow), FOLLOWERS_ONLY and COLLEAGUES_ONLY visibility tiers, private social counts (anti-vanity), RelationshipStatus on profiles, FollowButton component, 4-tier visibility selectors on Settings page
- [x] Learner Profiles — avatar upload (Supabase Storage, Thumbnailator resize), bio and display name editing, public profile page, header avatar thumbnail + handle link, visibility enforcement, no public vanity metrics
- [x] Share (Re-Learning) — share any public learning to your own feed with attribution to original author; visibility cascade enforced (shared visibility ≤ original); original going private removes downstream shares; Re-learn button on learner profiles for non-owner visitors; ReLearningModal component
- [x] Discovery Feed — social feed aggregating learnings and re-learnings from followed learners (GET /api/v1/feed); Discover page with learner search by handle/name (GET /api/v1/learners/search); mobile social feed via useFeedData hook; 17 E2E tests
- [ ] Classes & Study Groups
- [ ] Community Principles & Content Moderation

### Phase 7: Gamification — ⏸️ Postponed
See [ROADMAP.phase-7.md](./docs/ROADMAP.phase-7.md)

### Phase 8: Knowledge Enrichment — 🔄 In Progress
See [ROADMAP.phase-8.md](./docs/ROADMAP.phase-8.md)
- [x] Markdown Support — react-markdown + rehype-sanitize (web), react-native-markdown-display (mobile); renders in all views
- [x] Tag Improvements — display_name column, TagService.normalise(), GET /api/v1/poks?tagId filter, TagFilter component wired into feed, mobile tag components updated
- [ ] Knowledge Paths — planning and spec only (graph visualization, grouped by topic)

---

## Development Workflow

This project uses [Claude Code](https://claude.ai/code) with a suite of custom slash commands and skills for spec-driven development.

### Happy Path

```
# Optional: refine your prompt before starting (skill, not a slash command)
prompt-optimizer "I want to build feature X"
# → /clear → Shift+Tab (plan mode) → paste enhanced prompt

/start-session --stack=<backend|web|mobile|docs>

  # For complex features — skip for bug fixes / small chores
  /write-spec <feature-name>
  /review-spec docs/specs/features/<feature-name>.md
  /implement-spec docs/specs/features/<feature-name>.md

  # ... code, iterate ...

/finish-session        # build + lint + test gate → docs update → commit

/create-pr             # open PR against develop

  # Iterate on review feedback
  /review-pr <N>
  /fix-pr <N>

# After merge to develop
/compile-metrics
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `/start-session` | Load stack-specific context, orient on current branch + phase |
| `/write-spec` | Draft a feature spec (delegates to specialist agents) |
| `/review-spec` | Quality-gate the spec before implementation |
| `/implement-spec` | TDD implementation from spec, one commit per task |
| `/finish-session` | Build/lint/test gates, docs update, conventional commit |
| `/create-pr` | Open PR via `gh` with auto-generated description |
| `/review-pr` | Triage open PR — CI status, review comments, triage report |
| `/fix-pr` | Implement approved items from triage report |
| `/compile-metrics` | Aggregate session usage stats after merge |

### Key Skills

| Skill | Purpose |
|-------|---------|
| `prompt-optimizer` | Enhance a raw prompt before starting a session |
| `mobile-design-system` | "Library at Dusk" design tokens for Expo/RN visual parity |
| `frontend-design` | Production-grade frontend interface generation |

---

## API Documentation

The backend exposes a RESTful API documented with OpenAPI (Swagger):

- **Swagger UI:** `http://localhost:8080/swagger-ui` (when running locally)
- **OpenAPI Spec:** `http://localhost:8080/api-docs`

The API covers these groups: **Auth** (web + mobile + password reset), **Learnings** (CRUD, search, history), **Tags** (CRUD, assignment, AI suggestions), **Social** (feed, follow, learner search, re-learning/shares), **Profile** (settings, avatar), and **Admin** (embedding backfills).

See Swagger UI for the full, always-up-to-date endpoint reference.

---

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_VISION.md](./docs/PROJECT_VISION.md) | Product vision, goals, and differentiation |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical stack, data model, and ADRs |
| [GLOSSARY.md](./docs/GLOSSARY.md) | Terms and definitions (POK, Learner, etc.) |
| [ROADMAP.md](./docs/ROADMAP.md) | Development phases, milestones, and timeline |
| [docs/specs/](./docs/specs/) | Spec-Driven Development feature specs (26 shipped features) |

---

## Contributing

This is currently a personal project. Contribution guidelines will be added if/when the project opens for external contributions.

---

## Author

**Lucas Xavier Ferreira**

- [GitHub](https://github.com/lucasxf)
- [LinkedIn](https://www.linkedin.com/in/lucas-xavier-ferreira/)
- [Medium](https://medium.com/@lucasxferreira)
- [Substack](https://substack.com/@xflucas)

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Version

| Version | Date | Description |
|:-------:|:----:|:-----------:|
| 0.1.0 | 2026-01-29 | Initial documentation and project setup |
| 0.2.0 | 2026-02-13 | Authentication (email/password + Google OAuth) |
| 0.3.0 | 2026-02-14 | POK CRUD (backend + web implementation) |
| 0.4.0 | 2026-02-19 | UI/UX Polish — dark mode, i18n (EN/PT-BR), aria improvements |
| 0.5.0 | 2026-02-20 | MVP deployed — learnimo.net live (Railway + Vercel + Supabase) |
| 0.6.0 | 2026-02-25 | Phase 2 — editing, deletion, audit trail, tagging, timeline/tag-grouped views, sort options |
| 0.7.0 | 2026-02-27 | Phase 3 — semantic search (pgvector + HuggingFace), Expo mobile app (auth, feed, CRUD, dark mode, i18n) |
| 0.8.0 | 2026-03-04 | Phase 5 — visibility controls (4-tier), learner profile privacy, access enforcement, E2E tests |
| 0.9.0 | 2026-03-08 | Phase 6 — following/colleagues, learner profiles + avatar, re-learning/shares, discovery feed, learner search, mobile social features |
| 0.10.0 | 2026-03-06 | Phase 8 — Markdown support (web + mobile), tag display names + normalization, TagFilter on feed |
