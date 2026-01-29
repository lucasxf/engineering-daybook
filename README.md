# Engineering Daybook

> A digital learning journal built for engineers who want to capture, organize, and recall their daily learnings.

⚠️ **Status:** Phase 0 — Foundation (Documentation & Setup)

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

# Web (new terminal)
cd web
npm install
npm run dev

# Mobile (new terminal)
cd mobile
npm install
npx expo start
```

> ⚠️ Detailed setup instructions will be added as the project progresses.

---

## Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for the full development plan.

### Current Phase: Foundation (Weeks 1-2)
- [x] Project documentation
- [ ] Repository structure
- [ ] CI/CD pipeline
- [ ] Development environment setup

### Next Phase: MVP (Weeks 3-8)
- [ ] User authentication (email + Google)
- [ ] Create POKs
- [ ] Search/query POKs
- [ ] Dark mode
- [ ] i18n (English + Portuguese)

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
