# Phase 0 Implementation Plan - Engineering Daybook

> **Session Date:** 2026-01-29
> **Status:** Ready for execution
> **Use `/resume-session` to continue if session is interrupted**

## Overview

Complete Phase 0 (Foundation) deliverables through **4 focused PRs**, following the project's incremental approach.

**Strategy:** Multiple PRs for easier review and validation
**Backend:** Minimal scaffold (health endpoint, proves stack works)
**Mobile:** Placeholder only (development starts Phase 3)

---

## PR Sequence

```
PR #1: CI/CD + Release Please
    |
    v
PR #2: Backend Scaffold (Spring Boot)
    |
    v
PR #3: Web Scaffold (Next.js)
    |
    v
PR #4: Docker + Mobile Placeholder + ROADMAP Update
```

---

## PR #1: CI/CD Pipeline + Release Please

**Branch:** `chore/cicd-pipeline`

### Files to Create

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Build/test on PRs with path filtering |
| `.github/workflows/release-please.yml` | Automated releases on main |
| `release-please-config.json` | Monorepo package configuration |
| `.release-please-manifest.json` | Initial versions (0.0.0) |
| `.github/dependabot.yml` | Dependency updates (Maven + npm) |

### CI Workflow Features
- Path-based triggers (backend/** triggers Java CI only)
- Java 21 + Maven with caching
- Node.js 20 + npm with caching
- Parallel jobs for backend/web

### Verification
- Create a test PR and verify CI runs
- Check path filtering works correctly

---

## PR #2: Backend Scaffold (Spring Boot)

**Branch:** `feat/backend-scaffold`

### Directory Structure
```
backend/
├── src/main/java/com/lucasxf/ed/
│   ├── EdApplication.java
│   ├── config/
│   │   ├── OpenApiConfig.java
│   │   └── JacksonConfig.java
│   ├── controller/
│   │   └── HealthController.java
│   ├── dto/
│   │   └── HealthResponse.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── ApiError.java
│   ├── service/.gitkeep
│   ├── repository/.gitkeep
│   ├── domain/.gitkeep
│   └── security/.gitkeep
├── src/main/resources/
│   ├── application.yml
│   ├── application-local.yml
│   └── db/migration/
│       └── V1__enable_extensions.sql
├── src/test/java/com/lucasxf/ed/
│   ├── EdApplicationTests.java
│   └── controller/
│       └── HealthControllerTest.java
├── pom.xml
├── mvnw, mvnw.cmd, .mvn/
├── Dockerfile
└── README.md
```

### Key Dependencies (pom.xml)
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- spring-boot-starter-actuator
- springdoc-openapi-starter-webmvc-ui:2.3+
- postgresql
- flyway-core, flyway-database-postgresql
- spring-boot-starter-test
- testcontainers (postgresql)

### Configuration Highlights
- Virtual Threads enabled (`spring.threads.virtual.enabled: true`)
- Flyway for migrations
- SpringDoc OpenAPI at /swagger-ui
- Profile-based config (local, dev, prod)

### Coding Standards (from CLAUDE.md)
- 4 spaces indentation, 100 char line limit
- Constructor injection only (no @Autowired)
- Javadoc with @author and @since
- Package imports: java → jakarta → spring → project → static

### Verification
```bash
cd backend
./mvnw clean verify  # Tests pass
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# GET http://localhost:8080/api/v1/health → 200 OK
# GET http://localhost:8080/swagger-ui → OpenAPI docs
```

---

## PR #3: Web Scaffold (Next.js)

**Branch:** `feat/web-scaffold`

### Directory Structure
```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/
│   │       └── Button.tsx
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── lib/
│   │   └── utils.ts
│   └── locales/
│       ├── en.json
│       └── pt-BR.json
├── public/.gitkeep
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .eslintrc.json
├── .env.example
└── README.md
```

### Key Dependencies (package.json)
- next:14+
- react, react-dom
- typescript:5+
- tailwindcss, postcss, autoprefixer
- next-intl (i18n)
- next-themes (dark mode)
- clsx, tailwind-merge

### Configuration Highlights
- App Router (Next.js 14)
- Dark mode default with toggle
- i18n: EN and PT-BR from day 1
- TypeScript strict mode

### Coding Standards (from CLAUDE.md)
- Functional components only
- Explicit types (no `any`)
- Custom hooks for shared logic
- Tailwind for styling

### Verification
```bash
cd web
npm install
npm run build  # Build succeeds
npm run lint   # No errors
npm run dev    # http://localhost:3000 renders
# Toggle dark/light mode works
# Language switch EN/PT-BR works
```

---

## PR #4: Docker + Mobile Placeholder + ROADMAP Update

**Branch:** `chore/phase0-complete`

### Files to Create

**Docker Compose:**
```
docker-compose.yml          # PostgreSQL 15 + pgvector
docker-compose.override.yml # Local dev overrides
.env.example                # Environment variables template
```

**Mobile Placeholder:**
```
mobile/
├── README.md    # Explains Phase 3 timeline
├── package.json # Minimal, just name/version
└── .gitkeep
```

**ROADMAP.md Updates:**
- Mark 0.3-0.8 as Done
- Check Phase 0 exit criteria

### Docker Compose Features
- PostgreSQL 15 with pgvector extension
- Health checks
- Persistent volume
- Matches Supabase production environment

### Verification
```bash
docker-compose up -d
# PostgreSQL starts and is healthy
cd backend && ./mvnw spring-boot:run
# Backend connects to local PostgreSQL
```

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Coding conventions to follow |
| `docs/ARCHITECTURE.md` | Package structure, tech versions |
| `docs/ROADMAP.md` | Deliverables checklist to update |
| `.gitignore` | Already configured for monorepo |

---

## Exit Criteria (Phase 0)

After all PRs merged:
- [ ] `git clone` + `docker-compose up` + `./mvnw spring-boot:run` works
- [ ] `npm run dev` in /web works
- [ ] CI runs on every PR to develop
- [ ] Health endpoint returns 200 OK
- [ ] Swagger UI accessible
- [ ] Dark mode toggle works
- [ ] i18n EN/PT-BR works

---

## Implementation Notes

1. **Order matters:** PR #1 first enables CI for subsequent PRs
2. **Conventional commits:** Use `feat:`, `chore:`, `docs:` prefixes
3. **Branch from develop:** All feature branches from `develop`
4. **Merge to develop:** PRs target `develop`, not `main`
5. **No deployment yet:** CI only; deployment in Phase 1

---

## Progress Tracking

| PR | Status | Branch | Notes |
|----|--------|--------|-------|
| PR #1: CI/CD | ⏳ Pending | `chore/cicd-pipeline` | |
| PR #2: Backend | ⏳ Pending | `feat/backend-scaffold` | |
| PR #3: Web | ⏳ Pending | `feat/web-scaffold` | |
| PR #4: Final | ⏳ Pending | `chore/phase0-complete` | |
