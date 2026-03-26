# learnimo

> A personal learning journal for everyone — capture, organize, and recall what you learn.

🚀 **Status:** Phase 1 — MVP **Live at [learnimo.net](https://learnimo.net) · [learnimo.com.br](https://learnimo.com.br)**

---

## Overview

learnimo is a personal learning journal for everyone. Inspired by "The Pragmatic Programmer", where engineers in traditional industries maintained physical notebooks called engineering daybooks to record daily learnings, learnimo brings that practice into the digital age — with modern search, tagging, and (eventually) AI-powered insights.

> *"Nea onnim no sua a, ohu."*
> — Akan proverb (Ghana)
>
> *"He who does not know can know from learning."*
> *"Aquele que não sabe, se aprender, saberá."*

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

## Names

### learnimo

**learnimo** emerged from a cross-linguistic exploration of words for learning, memory, and knowledge — drawing from Portuguese, English, Swahili (Bantu), Akan (which also inspired the opening proverb above), and Yoruba.

The name carries three semantic layers:

- **learn** — the core action the app enables (to learn / aprender)
- **imo** — Yoruba for knowledge and learning (*imọ̀*, the root behind *aprendizado*)
- Say *learnimo* out loud and you can hear **ânimo** — Portuguese for energy, spirit, drive

The runner-up names in that exploration were **daftari** (Swahili for "notebook", strong cultural identity) and **devimo** (developer-focused startup vibe). **learnimo** was chosen for its global reach and because it carries meaning in multiple languages without belonging to just one.

### Onnim — the crow

learnimo's mascot is a crow named **Onnim**.

The name carries two layers:

- **Akan root** — "onnim" opens the proverb *"Nea onnim no sua a, ohu"* (*"He who does not know can know from learning"*) — the same proverb that greets every visitor to the app. The mascot's name is the word for "does not know yet" — because every learner starts there.
- **Norse echo** — Odin's two ravens are **Huginn** (thought) and **Muninn** (memory). Onnim joins that lineage: a crow who watches, collects, and carries knowledge across time.

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

## Architecture

| Layer | Pattern | Key structure |
|-------|---------|--------------|
| **Backend** | Layered (n-tier) | `controller/` → `service/` → `repository/` → `domain/` (JPA entities). Infrastructure boundaries use interfaces (`EmbeddingService`, `StorageService`). |
| **Web** | Next.js App Router + domain-grouped components | `app/[locale]/` routes, `components/{feature}/` folders, `lib/` API clients, `hooks/` data layer |
| **Mobile** | Screen-Component-Hook + React Navigation | `screens/` → `components/` → `hooks/` → `lib/` (mirrors web). Imperative navigation (native-stack + bottom-tabs). |

> For ADRs, data model, and security architecture, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Project Structure

```
/engineering-daybook
├── .claude/                       # Claude Code automation
│   ├── agents/                    # Specialized AI agents — see agents-readme.md
│   ├── agents-readme.md           # Agent catalog (outside agents/ to avoid auto-loading)
│   ├── commands/                  # Slash commands (/finish-session, /write-spec, etc.)
│   ├── metrics/                   # Session usage stats and recommendations
│   ├── scripts/                   # Automation scripts (coverage, metrics, registry)
│   └── skills/                    # Reusable skill prompts (mobile-design-system, etc.)
├── .github/workflows/             # CI/CD pipelines (ci, release-please, claude)
├── backend/                       # Java Spring Boot API
├── docs/                          # Project documentation
│   ├── ARCHITECTURE.md
│   ├── GLOSSARY.md
│   ├── PROJECT_VISION.md
│   ├── REQUIREMENTS.md
│   ├── ROADMAP.md                 # Phase index (source of truth for active phase)
│   ├── ROADMAP.phase-{N}.md       # Per-phase details (0–8)
│   └── specs/                     # Spec-Driven Development feature specs
│       └── features/              # 26 feature specs (one per shipped milestone)
├── mobile/                        # Expo mobile application
│   ├── e2e/                       # Maestro E2E test flows
│   └── store-assets/              # Play Store / App Store listing assets
├── web/                           # Next.js web application (deployed to learnimo.net)
├── CLAUDE.md                      # Claude Code context
├── docker-compose.override.yml    # Local overrides (ports, volumes)
├── docker-compose.yml             # Local development database (PostgreSQL + pgvector)
├── LICENSE                        # MIT License
├── release-please-config.json     # Release automation config
└── README.md                      # This file
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

- **Learning journal** — create, edit, search, and tag your learnings with Markdown support
- **AI-assisted organization** — automatic tag suggestions and hybrid search (keyword + semantic via pgvector)
- **Social learning** — follow learners, discover public learnings, re-learn from others
- **Privacy controls** — 4-tier visibility (private, followers, colleagues, public) with anti-vanity design
- **Cross-platform** — web (Next.js) and mobile (Expo/React Native), both with dark mode and i18n (EN/PT-BR)

See [docs/specs/](./docs/specs/) for the full list of 26 shipped feature specs.

---

## Roadmap

learnimo is currently in **Phase 1 (MVP)**, with work active across Phases 2, 3, 5, 6, and 8. The app is live at [learnimo.net](https://learnimo.net).

See [ROADMAP.md](./docs/ROADMAP.md) for the full phase index and milestone details.

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

See [`.claude/commands/README.md`](./.claude/commands/README.md) for the full command reference.

### Key Skills

| Skill | Purpose |
|-------|---------|
| `prompt-optimizer` | Enhance a raw prompt before starting a session |
| `mobile-design-system` | "Library at Dusk" design tokens for Expo/RN visual parity |
| `frontend-design` | Production-grade frontend interface generation |

### Agents

See [`.claude/agents-readme.md`](./.claude/agents-readme.md) for the full agent catalog.

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
| 0.9.0 | 2026-03-06 | Phase 8 — Markdown support (web + mobile), tag display names + normalization, TagFilter on feed |
| 0.10.0 | 2026-03-08 | Phase 6 — following/colleagues, learner profiles + avatar, re-learning/shares, discovery feed, learner search, mobile social features |

See [GitHub Releases](https://github.com/lucasxf/engineering-daybook/releases) for the full release history and changelogs.
