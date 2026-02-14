# Engineering Daybook

> A digital learning journal built for engineers who want to capture, organize, and recall their daily learnings.

⚠️ **Status:** Phase 1 — MVP (Authentication & POK CRUD Complete)

---

## Overview

Engineering Daybook (ED) is a personal knowledge management tool specifically designed for engineers. Inspired by the concept from "The Pragmatic Programmer" book, where engineers in traditional industries would maintain physical notebooks to record daily learnings, ED brings this practice into the digital age with modern search, categorization, and (eventually) AI-powered insights.

> "A tinta mais fraca constrói pontes mais fortes que a memória mais viva."
> — Provérbio Yorubá (Nigéria)

---

## What It Is

- A place to record and search through your own pieces of knowledge (POKs)
- A learning journal with automatic and manual tagging
- A tool that keeps your learnings atomic, searchable, and immutable (protected from AI hallucination)

## What It Isn't

- A general-purpose notes app (OneNote, Evernote)
- A task/project management tool (Jira, Notion)
- A text editor (Notepad, VS Code)
- An AI chatbot that generates or modifies your content

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend (Web)** | Next.js 14+, TypeScript, Tailwind CSS |
| **Frontend (Mobile)** | Expo (React Native), TypeScript |
| **Backend** | Java 21, Spring Boot 3, Maven |
| **Database** | PostgreSQL 15+ with pg_vector |
| **Infrastructure** | Vercel (web), Railway/Render (backend), Supabase (database) |
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
│   └── ROADMAP.md
├── prompts/                  # AI assistant prompts
│   ├── claude-ai/
│   └── claude-code/
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
# Swagger UI at http://localhost:8080/swagger-ui.html

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

- **POK Management**
  - Create, read, update, and delete POKs
  - Rich text content with Markdown support
  - Automatic and manual tagging
  - Audit trail for all changes

- **Web Application**
  - Responsive design with Tailwind CSS
  - Internationalization (EN/PT-BR) with next-intl
  - Protected routes and authentication flows
  - Modern React patterns with TypeScript

### In Progress
- Semantic search with vector embeddings
- Dark mode support
- Mobile application (Expo/React Native)

---

## Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for the full development plan.

### Phase 0: Foundation — ✅ Complete
- [x] Project documentation
- [x] Repository structure
- [x] CI/CD pipeline
- [x] Development environment setup
- [x] Backend scaffold
- [x] Web scaffold

### Phase 1: MVP — 🔄 In Progress
- [x] User authentication (email + password)
- [x] Google OAuth integration
- [x] POK CRUD (backend + web)
- [ ] Semantic search
- [ ] Dark mode
- [ ] i18n refinements

---

## API Documentation

The backend exposes a RESTful API documented with OpenAPI (Swagger):

- **Swagger UI:** `http://localhost:8080/swagger-ui.html` (when running locally)
- **OpenAPI Spec:** `http://localhost:8080/v3/api-docs`

Key endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google OAuth
- `GET /api/poks` - List user's POKs
- `POST /api/poks` - Create new POK
- `GET /api/poks/{id}` - Get POK by ID
- `PUT /api/poks/{id}` - Update POK
- `DELETE /api/poks/{id}` - Delete POK

---

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_VISION.md](./docs/PROJECT_VISION.md) | Product vision, goals, and differentiation |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical stack, data model, and ADRs |
| [GLOSSARY.md](./docs/GLOSSARY.md) | Terms and definitions (POK, POL, etc.) |
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
