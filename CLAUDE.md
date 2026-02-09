# CLAUDE.md — Engineering Daybook

> Context file for Claude Code sessions in this project.

---

## Project Overview

**Engineering Daybook (ED)** is a personal knowledge management tool for engineers to capture, organize, and recall daily learnings.

- **Repository:** https://github.com/lucasxf/engineering-daybook
- **Author:** Lucas Xavier Ferreira
- **Status:** Phase 0 (Foundation)

---

## Tech Stack

### Backend
- **Language:** Java 21 (use Virtual Threads where applicable)
- **Framework:** Spring Boot 3.2+
- **Build:** Maven 3.9+
- **Database:** PostgreSQL 15+ with pg_vector (Supabase)
- **Migration:** Flyway
- **API Docs:** SpringDoc OpenAPI (Swagger)
- **Testing:** JUnit 5, Mockito, Testcontainers

### Frontend (Web)
- **Framework:** Next.js 14+
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3+
- **i18n:** next-intl (EN/PT-BR)

### Frontend (Mobile)
- **Framework:** Expo 50+ (React Native)
- **Language:** TypeScript 5+

### Infrastructure
- **Web Hosting:** Vercel
- **Backend Hosting:** Railway or Render
- **Database:** Supabase (managed PostgreSQL)
- **CI/CD:** GitHub Actions
- **Versioning:** Release Please + Conventional Commits

---

## Project Structure

```
/engineering-daybook
├── /backend                    # Spring Boot application
│   ├── /src/main/java/com/lucasxf/ed
│   │   ├── /config
│   │   ├── /controller
│   │   ├── /service
│   │   ├── /repository
│   │   ├── /domain
│   │   ├── /dto
│   │   ├── /security
│   │   └── /exception
│   ├── /src/main/resources
│   │   ├── application.yml
│   │   └── /db/migration
│   ├── /src/test
│   └── pom.xml
├── /web                        # Next.js application
│   ├── /src
│   │   ├── /app
│   │   ├── /components
│   │   ├── /hooks
│   │   ├── /lib
│   │   ├── /locales
│   │   └── /styles
│   └── package.json
├── /mobile                     # Expo application
│   ├── /src
│   └── package.json
├── /docs                       # Documentation
├── /prompts                    # AI prompts
│   ├── /claude-ai              # Claude AI project instructions
│   └── /ignore                 # Working notes (not for context)
└── /.claude                    # Claude Code automation
    ├── /agents                 # Specialized AI agents
    ├── /commands               # Slash commands
    └── /metrics                # Usage tracking
```

---

## Coding Conventions

### Java (Backend)

```java
// Package structure
package com.lucasxf.ed.service;

// Imports: java → jakarta → spring → project → static
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import com.lucasxf.ed.domain.Pok;
import static java.util.Objects.requireNonNull;

/**
 * Service for POK operations.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@Service
public class PokService {

    private final PokRepository pokRepository;

    // Constructor injection ONLY (never @Autowired on fields)
    public PokService(PokRepository pokRepository) {
        this.pokRepository = requireNonNull(pokRepository);
    }
}
```

**Rules:**
- Constructor injection only (no `@Autowired` on fields)
- Use `@ConfigurationProperties` instead of `@Value`
- 4 spaces indentation, 100 chars line limit
- Javadoc with `@author` and `@since` on public classes
- Tests required: unit + integration with Testcontainers

### TypeScript (Frontend)

```typescript
// Functional components with explicit types
interface PokCardProps {
  pok: Pok;
  onEdit?: (id: string) => void;
}

export function PokCard({ pok, onEdit }: PokCardProps) {
  // ...
}
```

**Rules:**
- Explicit types (avoid `any`)
- Functional components only
- Custom hooks for shared logic
- Tailwind for styling

---

## Git Workflow

```
main ← develop ← feature/xxx
                 fix/xxx
                 chore/xxx
                 docs/xxx
```

**Branch naming:** `type/short-description` (lowercase, hyphens)

**Commit format (Conventional Commits):**
```
feat: add POK creation endpoint
fix: correct JWT expiration handling
docs: update architecture diagram
chore: upgrade dependencies
refactor: extract validation logic
test: add PokService unit tests
```

---

## Key Commands

```bash
# Backend
cd backend
./mvnw spring-boot:run          # Run locally
./mvnw test                      # Run tests
./mvnw verify                    # Run all checks

# Web
cd web
npm run dev                      # Dev server
npm run build                    # Production build
npm run test                     # Run tests

# Mobile
cd mobile
npx expo start                   # Dev server
npx expo build                   # Build app
```

---

## Domain Model

### Core Entities

- **User:** App user (id, email, handle, name, locale, theme)
- **POK:** Piece of Knowledge (id, userId, title, content, embedding, timestamps)
- **Tag:** Category label (id, userId, name)
- **PokTag:** Many-to-many relation (pokId, tagId, source)
- **PokAuditLog:** Change history (id, pokId, action, oldContent, newContent)

### Critical Rule

> **POK content is SACRED.** Never modify, generate, or "improve" user-written content.
> AI assists with tagging, search, and connections — never content modification.

---

## Current Focus

**Phase 0: Foundation**
- [x] Documentation (Vision, Requirements, Architecture, Glossary, Roadmap)
- [ ] Repository structure
- [ ] CI/CD pipeline
- [ ] Backend scaffold
- [ ] Web scaffold
- [ ] Claude Code workflow

**Next Phase:** MVP (Auth, POK CRUD, Search, i18n, Dark Mode)

---

## Documentation References

| Doc | Purpose |
|-----|---------|
| `/docs/PROJECT_VISION.md` | What ED is/isn't |
| `/docs/REQUIREMENTS.md` | Features and priorities |
| `/docs/ARCHITECTURE.md` | Tech decisions, ADRs |
| `/docs/GLOSSARY.md` | Terminology |
| `/docs/ROADMAP.md` | Timeline and milestones |

---

## Session Guidelines

1. **Plan before coding** — show plan, wait for approval
2. **Explain trade-offs** — don't just agree, show options
3. **Quality over speed** — production-ready, not prototypes
4. **Test everything** — no code without tests
5. **Document decisions** — update ADRs when making architectural choices

---

## Spec-Driven Development

**This project uses Spec-Driven Development (SDD) for complex features and architectural work.**

### When to Use SDD

- **Domain complexity** — Multiple business rules, edge cases, or architectural decisions
- **Multi-layer work** — Touches domain, application, and infrastructure simultaneously
- **New capabilities** — First-time patterns that need deliberate design
- **Scoped POCs** — Experiments with clear acceptance criteria and constraints

### When to Skip (Go Direct)

- **Bug fixes** — Localized corrections with clear scope
- **Refactorings** — Mechanical changes following established patterns
- **Exploratory spikes** — Learning-focused work (crystallize into spec *after* if delivering)
- **Pattern application** — Work fully covered by existing conventions in this file

### Workflow

```bash
# 1. Create spec from template
cp docs/specs/template.md docs/specs/features/my-feature.md

# 2. Implement from spec (presents plan, waits for approval, follows TDD)
/implement-spec docs/specs/features/my-feature.md

# 3. Finish session as usual
/finish-session "Completed my-feature"
```

### Principles

1. **Specs are contracts** — Implementation follows spec or documents deviations
2. **Specs are living documents** — Updated post-implementation with real decisions
3. **Quality gates** — Plan approval before coding, TDD by default
4. **Logical commits** — Each commit is a coherent, reviewable unit

**Spec location:** `docs/specs/` | **Template:** `docs/specs/template.md`

---

## Contact

- **GitHub:** https://github.com/lucasxf
- **LinkedIn:** https://www.linkedin.com/in/lucas-xavier-ferreira/

---

*Last updated: 2026-01-29*
