# learnimo

> A digital learning journal built for engineers who want to capture, organize, and recall their daily learnings.

🚀 **Status:** Phase 1 — MVP **Live at [learnimo.net](https://learnimo.net)**

---

## Overview

learnimo (ED) is a personal knowledge management tool. Inspired by the concept from "The Pragmatic Programmer" book, where engineers in traditional industries would maintain physical notebooks to record daily learnings, ED brings this practice into the digital age with modern search, categorization, and (eventually) AI-powered insights.

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
| **Frontend (Web)** | Next.js 14+, TypeScript, Tailwind CSS |
| **Frontend (Mobile)** | Expo (React Native), TypeScript |
| **Backend** | Java 21, Spring Boot 4.0+, Maven |
| **Database** | PostgreSQL 15+ with pg_vector |
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
├── docs/                     # Project documentation
│   ├── PROJECT_VISION.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── GLOSSARY.md
│   ├── ROADMAP.md              # Phase index (source of truth for active phase)
│   └── ROADMAP.phase-{N}.md   # Per-phase details (0–7)
├── prompts/                  # AI assistant prompts
│   ├── claude-ai/
│   └── ignore/
├── .claude/                  # Claude Code automation
│   ├── commands/
│   └── agents/
├── .github/workflows/        # CI/CD pipelines
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

# Backend
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui

# Web (new terminal)
cd web
npm install
npm run dev
# Web app available at http://localhost:3000

# Mobile (new terminal)
cd mobile
npm install
npx expo start
```

### Configuration

The backend requires environment variables for:
- Database connection (PostgreSQL)
- JWT signing key
- Google OAuth credentials (optional, for OAuth login)

See `backend/src/main/resources/application.yml` for configuration details.

---

## Features

### Implemented
- **User Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - JWT-based session management
  - Secure password hashing with BCrypt

- **Learning Management**
  - Create, read, update, and delete learnings
  - Rich text content with Markdown support
  - Automatic and manual tagging
  - Audit trail for all changes

- **Web Application**
  - Responsive design with Tailwind CSS
  - Internationalization (EN/PT-BR) with next-intl
  - Dark mode / light mode / system theme toggle
  - Protected routes and authentication flows
  - Modern React patterns with TypeScript
  - Password reset via email

### In Progress
- Mobile application (Expo/React Native) — Phase 3

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
- [x] Deployed to production (learnimo.net)
- [x] Session persistence (httpOnly cookies)
- [x] Inline quick-entry
- [ ] Visual polish (1.7.6)
- [ ] Phase 1 exit criterion: 1+ week usage

### Phase 2: Evolution — 🔄 Started
See [ROADMAP.phase-2.md](./docs/ROADMAP.phase-2.md)
- [x] POK editing, deletion, and audit trail

---

## API Documentation

The backend exposes a RESTful API documented with OpenAPI (Swagger):

- **Swagger UI:** `http://localhost:8080/swagger-ui` (when running locally)
- **OpenAPI Spec:** `http://localhost:8080/api-docs`

Key endpoints:
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/google` - Login with Google OAuth
- `GET /api/v1/poks` - List user's POKs
- `POST /api/v1/poks` - Create new POK
- `GET /api/v1/poks/{id}` - Get POK by ID
- `PUT /api/v1/poks/{id}` - Update POK
- `DELETE /api/v1/poks/{id}` - Delete POK
- `GET /api/v1/poks/{id}/history` - Get POK change history (audit log)

---

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_VISION.md](./docs/PROJECT_VISION.md) | Product vision, goals, and differentiation |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical stack, data model, and ADRs |
| [GLOSSARY.md](./docs/GLOSSARY.md) | Terms and definitions (POK, Learner, etc.) |
| [ROADMAP.md](./docs/ROADMAP.md) | Development phases, milestones, and timeline |

---

## Contributing

This is currently a personal project. Contribution guidelines will be added if/when the project opens for external contributions.

---

## Author

**Lucas Xavier Ferreira**

- [GitHub](https://github.com/lucasxf)
- [LinkedIn](https://www.linkedin.com/in/lucas-xavier-ferreira/)
- [Medium](https://medium.com/@lucasxferreira)

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
