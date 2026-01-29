# Architecture — Engineering Daybook

This document describes the technical architecture, technology stack, data models, and key architectural decisions for the Engineering Daybook project.

---

## 1. Architecture Overview

Engineering Daybook follows a **layered architecture** pattern with clear separation of concerns. The system is designed as a **modular monolith** for the MVP, with the flexibility to evolve into microservices if needed.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │      Next.js (Web)          │    │      Expo (Mobile)          │        │
│  │  • Server-Side Rendering    │    │  • React Native             │        │
│  │  • Dark Mode Support        │    │  • Offline-capable (future) │        │
│  │  • i18n (EN/PT-BR)          │    │  • i18n (EN/PT-BR)          │        │
│  └──────────────┬──────────────┘    └──────────────┬──────────────┘        │
│                 │                                   │                       │
│                 └───────────────┬───────────────────┘                       │
│                                 │ HTTPS/REST                                │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│                                 │                                            │
│  ┌──────────────────────────────▼──────────────────────────────────────┐    │
│  │                    Spring Boot 3 (Java 21)                          │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │    Auth    │  │    POK     │  │    Tag     │  │   Search   │    │    │
│  │  │ Controller │  │ Controller │  │ Controller │  │ Controller │    │    │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │    │
│  │        │               │               │               │           │    │
│  │  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐   │    │
│  │  │    Auth    │  │    POK     │  │    Tag     │  │   Search   │   │    │
│  │  │  Service   │  │  Service   │  │  Service   │  │  Service   │   │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼───────────────────────────────────────────┐
│                            DOMAIN LAYER                                       │
│                                  │                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │     User      │  │      POK      │  │      Tag      │  │   AuditLog    │  │
│  │   (Entity)    │  │   (Entity)    │  │   (Entity)    │  │   (Entity)    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘  │
│                                                                               │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼───────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                                   │
│                                  │                                            │
│  ┌───────────────────────────────▼───────────────────────────────────────┐   │
│  │                    PostgreSQL + pg_vector (Supabase)                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │   │
│  │  │  users  │  │  poks   │  │  tags   │  │pok_tags │  │pok_audit_log│  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Web Framework** | Next.js | 14+ | SSR, routing, API routes |
| **Mobile Framework** | Expo | 50+ | React Native simplified |
| **Language** | TypeScript | 5+ | Type safety |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS |
| **State Management** | Zustand or React Query | Latest | Client state / server state |
| **i18n** | next-intl / i18next | Latest | EN/PT-BR support |
| **Dark Mode** | next-themes | Latest | Theme switching |

### 2.2 Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Spring Boot | 3.2+ | REST API, dependency injection |
| **Language** | Java | 21 (LTS) | Virtual Threads support |
| **Build Tool** | Maven | 3.9+ | Dependency management |
| **API Docs** | SpringDoc OpenAPI | 2+ | Swagger UI |
| **Security** | Spring Security | 6+ | Authentication, authorization |
| **Validation** | Jakarta Validation | 3+ | Input validation |
| **Database Access** | Spring Data JPA | 3+ | ORM |
| **Migration** | Flyway | 10+ | Schema versioning |

### 2.3 Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | PostgreSQL | 15+ | Primary data store |
| **Vector Search** | pg_vector | Semantic search embeddings |
| **Hosting** | Supabase | Managed PostgreSQL + Auth |

### 2.4 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend Hosting** | Railway or Render | Java app hosting |
| **Web Hosting** | Vercel | Next.js optimized hosting |
| **CI/CD** | GitHub Actions | Build, test, deploy |
| **Versioning** | Release Please | Automated releases |
| **Monitoring** | Supabase Dashboard (MVP) | Basic observability |

---

## 3. Data Model

### 3.1 Entity Relationship Diagram

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│       users       │       │       poks        │       │       tags        │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (PK, UUID)     │──┐    │ id (PK, UUID)     │    ┌──│ id (PK, UUID)     │
│ email             │  │    │ user_id (FK)      │◄───┘  │ name              │
│ password_hash     │  │    │ title             │       │ user_id (FK)      │
│ name              │  └───►│ content           │       │ created_at        │
│ locale (EN/PT-BR) │       │ embedding (vector)│       └───────────────────┘
│ theme (light/dark)│       │ is_deleted        │                │
│ created_at        │       │ created_at        │                │
│ updated_at        │       │ updated_at        │                │
└───────────────────┘       └───────────────────┘                │
                                    │                            │
                                    │      ┌─────────────────────┘
                                    │      │
                                    ▼      ▼
                            ┌───────────────────┐
                            │     pok_tags      │
                            ├───────────────────┤
                            │ pok_id (FK, PK)   │
                            │ tag_id (FK, PK)   │
                            │ source (manual/ai)│
                            │ created_at        │
                            └───────────────────┘
                                    │
                                    │
                                    ▼
                            ┌───────────────────┐
                            │  pok_audit_log    │
                            ├───────────────────┤
                            │ id (PK, UUID)     │
                            │ pok_id (FK)       │
                            │ user_id (FK)      │
                            │ action            │
                            │ old_content (JSON)│
                            │ new_content (JSON)│
                            │ changed_at        │
                            └───────────────────┘
```

### 3.2 Table Definitions

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    theme VARCHAR(10) NOT NULL DEFAULT 'dark',
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### poks
```sql
CREATE TABLE poks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- For semantic search (OpenAI ada-002 dimension)
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poks_user_id ON poks(user_id);
CREATE INDEX idx_poks_created_at ON poks(created_at DESC);
CREATE INDEX idx_poks_embedding ON poks USING ivfflat (embedding vector_cosine_ops);
```

#### tags
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

#### pok_tags
```sql
CREATE TABLE pok_tags (
    pok_id UUID NOT NULL REFERENCES poks(id),
    tag_id UUID NOT NULL REFERENCES tags(id),
    source VARCHAR(20) NOT NULL DEFAULT 'manual',  -- 'manual' or 'ai'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (pok_id, tag_id)
);
```

#### pok_audit_log
```sql
CREATE TABLE pok_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pok_id UUID NOT NULL REFERENCES poks(id),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL,  -- 'CREATED', 'UPDATED', 'DELETED', 'RESTORED'
    old_content JSONB,
    new_content JSONB,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pok_audit_log_pok_id ON pok_audit_log(pok_id);
CREATE INDEX idx_pok_audit_log_changed_at ON pok_audit_log(changed_at DESC);
```

---

## 4. API Design

### 4.1 REST Endpoints (MVP)

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/google` | Login with Google OAuth |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Invalidate session |

#### POKs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/poks` | List user's POKs (paginated) |
| GET | `/api/v1/poks/:id` | Get single POK |
| POST | `/api/v1/poks` | Create new POK |
| PUT | `/api/v1/poks/:id` | Update POK |
| DELETE | `/api/v1/poks/:id` | Soft delete POK |
| GET | `/api/v1/poks/search` | Search POKs (keyword + filters) |

#### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tags` | List user's tags |
| POST | `/api/v1/tags` | Create new tag |
| DELETE | `/api/v1/tags/:id` | Delete tag |

#### AI (Evolution)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/suggest-tags` | Get AI tag suggestions for content |
| GET | `/api/v1/poks/search/semantic` | Semantic search |

### 4.2 Request/Response Examples

#### Create POK
```json
// POST /api/v1/poks
// Request
{
  "title": "Java Virtual Threads for I/O",
  "content": "When dealing with I/O-bound operations in Java 21+, use Virtual Threads instead of platform threads. They're lightweight and managed by the JVM, allowing millions of concurrent tasks without thread pool tuning.",
  "tagIds": ["uuid-backend", "uuid-java"]
}

// Response (201 Created)
{
  "id": "uuid-pok-123",
  "title": "Java Virtual Threads for I/O",
  "content": "When dealing with I/O-bound operations...",
  "tags": [
    {"id": "uuid-backend", "name": "backend", "source": "manual"},
    {"id": "uuid-java", "name": "java", "source": "manual"}
  ],
  "createdAt": "2026-01-29T14:30:00Z",
  "updatedAt": "2026-01-29T14:30:00Z"
}
```

#### Search POKs
```json
// GET /api/v1/poks/search?q=virtual+threads&tags=java&sortBy=relevance
// Response (200 OK)
{
  "data": [
    {
      "id": "uuid-pok-123",
      "title": "Java Virtual Threads for I/O",
      "content": "When dealing with I/O-bound operations...",
      "tags": [
        {"id": "uuid-backend", "name": "backend"},
        {"id": "uuid-java", "name": "java"}
      ],
      "createdAt": "2026-01-29T14:30:00Z",
      "relevanceScore": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

## 5. Project Structure

```
/engineering-daybook
│
├── /backend                          # Java Spring Boot application
│   ├── /src
│   │   ├── /main
│   │   │   ├── /java/com/lucasxf/ed
│   │   │   │   ├── /config           # Spring configurations
│   │   │   │   ├── /controller       # REST controllers
│   │   │   │   ├── /service          # Business logic
│   │   │   │   ├── /repository       # Data access
│   │   │   │   ├── /domain           # Entities, value objects
│   │   │   │   ├── /dto              # Request/Response DTOs
│   │   │   │   ├── /security         # Auth, JWT
│   │   │   │   └── /exception        # Custom exceptions
│   │   │   └── /resources
│   │   │       ├── application.yml
│   │   │       └── /db/migration     # Flyway migrations
│   │   └── /test                     # Unit and integration tests
│   ├── pom.xml
│   └── Dockerfile
│
├── /web                              # Next.js application
│   ├── /src
│   │   ├── /app                      # App router pages
│   │   ├── /components               # React components
│   │   ├── /hooks                    # Custom hooks
│   │   ├── /lib                      # Utilities, API client
│   │   ├── /locales                  # i18n translations (en, pt-BR)
│   │   └── /styles                   # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── /mobile                           # Expo React Native application
│   ├── /src
│   │   ├── /screens                  # Screen components
│   │   ├── /components               # Shared components
│   │   ├── /hooks                    # Custom hooks
│   │   ├── /lib                      # Utilities, API client
│   │   └── /locales                  # i18n translations
│   ├── app.json
│   └── package.json
│
├── /docs                             # Project documentation
│   ├── PROJECT_VISION.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── GLOSSARY.md
│   └── ROADMAP.md
│
├── /prompts                          # AI assistant prompts
│   ├── /claude-ai
│   └── /claude-code
│
├── /.claude                          # Claude Code automation
│   ├── /commands
│   └── /agents
│
├── /.github
│   └── /workflows                    # GitHub Actions
│       ├── ci.yml
│       └── release-please.yml
│
├── README.md
├── LICENSE
└── .gitignore
```

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: Layered Architecture over Event Sourcing + CQRS

**Status:** Accepted

**Context:**
The initial prompt considered Event Sourcing + CQRS for managing POKs. This would treat each POK change as an immutable event and separate read/write models.

**Decision:**
Use a simple layered architecture with audit trail instead of ES+CQRS for the MVP.

**Rationale:**
- POKs are simple entities with low write volume
- ES+CQRS adds significant complexity (event store, projections, eventual consistency)
- Audit trail provides sufficient change history without full event replay capability
- Can evolve to ES+CQRS later if needed (audit log is a stepping stone)

**Consequences:**
- Faster MVP delivery
- Simpler debugging and maintenance
- No event replay capability (acceptable for MVP)
- Migration path exists if requirements change

---

### ADR-002: PostgreSQL with pg_vector for Storage

**Status:** Accepted

**Context:**
Need a database that supports both relational data (users, POKs, tags) and semantic vector search for future AI features.

**Decision:**
Use PostgreSQL with pg_vector extension, hosted on Supabase.

**Rationale:**
- Single database for all data (no separate vector DB)
- PostgreSQL is battle-tested, well-documented
- pg_vector integrates seamlessly for semantic search
- Supabase offers free tier with pg_vector enabled
- Strong consistency model aligns with CAP priority

**Consequences:**
- Vector search may be slower than dedicated solutions (Pinecone, Weaviate) at scale
- Acceptable trade-off for simplicity at current scale
- Can add dedicated vector DB later if needed

---

### ADR-003: Next.js + Expo for Frontend

**Status:** Accepted

**Context:**
Need to deliver both web and mobile applications with maximum code sharing and fastest time to MVP.

**Decision:**
Use Next.js for web and Expo (React Native) for mobile.

**Rationale:**
- Same paradigm (React) for both platforms
- ~80% code sharing potential (hooks, business logic, types)
- Next.js has excellent SSR, routing, and Vercel integration
- Expo simplifies React Native development significantly
- Strong TypeScript support in both
- v0.dev can accelerate UI prototyping for Next.js

**Consequences:**
- Learning curve for React (author's background is Flutter)
- Two build pipelines (acceptable trade-off for code sharing)
- Expo limitations for native modules (not a concern for MVP)

---

### ADR-004: Semantic Versioning with Release Please

**Status:** Accepted

**Context:**
Need automated, consistent versioning that updates changelogs, version numbers, and creates releases without manual intervention.

**Decision:**
Use Semantic Versioning convention with Conventional Commits and Release Please automation.

**Rationale:**
- Industry standard versioning format (MAJOR.MINOR.PATCH)
- Conventional Commits enable automated changelog generation
- Release Please (Google) is battle-tested and well-maintained
- Integrates seamlessly with GitHub Actions
- Single source of truth for version (no manual edits)

**Consequences:**
- Requires discipline in commit message format
- All team members (currently 1) must follow Conventional Commits
- Automated process reduces human error

---

### ADR-005: Supabase for Managed PostgreSQL and Auth

**Status:** Accepted

**Context:**
Need a database hosting solution that is cheap, easy to maintain, and provides built-in authentication capabilities.

**Decision:**
Use Supabase as the managed PostgreSQL provider with built-in Auth.

**Rationale:**
- Generous free tier (500MB database, 50K monthly active users)
- pg_vector extension available out of the box
- Built-in Auth with Google OAuth support (simplifies backend)
- Dashboard for basic monitoring
- Easy migration path to self-hosted PostgreSQL if needed

**Consequences:**
- Vendor dependency (mitigated by PostgreSQL portability)
- May outgrow free tier (upgrade path is clear)
- Some Supabase-specific features might create lock-in (avoided by using standard PostgreSQL features)

---

### ADR-006: English and Portuguese from Day 1

**Status:** Accepted

**Context:**
The author is Brazilian and wants to support both English and Portuguese speakers from the MVP.

**Decision:**
Implement internationalization (i18n) for both English and Brazilian Portuguese from day 1.

**Rationale:**
- Adding i18n later is significantly harder than starting with it
- Author can validate both languages personally
- Expands potential user base from MVP launch
- next-intl and react-i18next make implementation straightforward

**Consequences:**
- Slightly more initial development effort
- All UI strings must be externalized (good practice anyway)
- Need to maintain two translation files

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  Client │────►│   Backend   │────►│  Supabase   │────►│ Google   │
│ (Web/   │     │ (Spring)    │     │    Auth     │     │  OAuth   │
│  Mobile)│◄────│             │◄────│             │◄────│          │
└─────────┘     └─────────────┘     └─────────────┘     └──────────┘
     │                │
     │    JWT Token   │
     │◄───────────────┤
     │                │
     │  API Requests  │
     │  (Bearer JWT)  │
     ├───────────────►│
```

### 7.2 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS only | Enforced at infrastructure level |
| Authentication | JWT tokens | Short-lived access + refresh tokens |
| Password | Bcrypt hashing | Via Supabase Auth or Spring Security |
| Authorization | Row-level security | Users can only access own data |
| Input | Validation | Jakarta Validation + sanitization |
| SQL | Parameterized queries | Spring Data JPA (no raw SQL) |
| XSS | Output encoding | React's default escaping |
| CSRF | SameSite cookies | Modern browser protection |
| Rate Limiting | API throttling | Spring Boot rate limiter |

---

## Document History

| Version | Date | Author | Changes |
|:-------:|:----:|:------:|:--------|
| 1.0 | 2026-01-29 | Lucas Xavier Ferreira | Initial version |
