# Requirements — learnimo

This document defines the functional and non-functional requirements for the learnimo project.

---

## 1. Functional Requirements

### 1.1 Authentication

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| AUTH-01 | User can register with email and password | Must Have | MVP |
| AUTH-02 | User can sign in with Google OAuth | Must Have | MVP |
| AUTH-03 | User can reset password via email | Should Have | MVP |
| AUTH-04 | User session persists across browser/app restarts | Must Have | MVP |

> **Implementation gap (2026-02-21):** AUTH-04 is listed as Must Have / MVP but is NOT YET IMPLEMENTED. JWT tokens are currently stored in React `useRef` (in-memory only) and are lost on page refresh. Must be resolved in Milestone 1.7. Target: `httpOnly` cookie with `SameSite=Strict` (see ADR-007 in ARCHITECTURE.md).
| AUTH-05 | User can sign out from all devices | Could Have | Post-MVP |
| AUTH-06 | User can enable Multi-Factor Authentication (MFA) | Should Have | Evolution |

---

### 1.2 POK Management (Core)

#### 1.2.1 Creating POKs

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| POK-01 | User can create a new POK with text content | Must Have | MVP |
| POK-02 | System automatically records creation timestamp | Must Have | MVP |
| POK-03 | System automatically records last update timestamp | Must Have | MVP |
| POK-04 | User can add manual tags to a POK | Should Have | MVP |
| POK-05 | System suggests tags based on POK content (auto-tagging) | Should Have | Evolution |
| POK-06 | User can approve, reject, or modify suggested tags | Must Have | Evolution |
| POK-07 | User can attach images to a POK | Could Have | Mid-Long Term |
| POK-08 | User can attach Mermaid diagrams to a POK | Could Have | Mid-Long Term |
| POK-09 | User can attach links/URLs to a POK | Could Have | Evolution |
| POK-10 | User can attach audio recordings to a POK | Could Have | Future |

**Use Case: Recording Something New**

> An engineer faces a bug while working on a feature. They search the web and find a solution in documentation or an article. After applying and testing the solution, they open ED and write: "Whenever doing X, use library Y to address Z issue."
>
> ED classifies and records the learning with:
> - Creation timestamp
> - Auto-suggested tags (e.g., `#backend`, `#java`, `#caching`)
> - User-approved or modified tags

---

#### 1.2.2 Searching & Querying POKs

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| POK-20 | User can search POKs by keyword | Must Have | MVP |
| POK-21 | User can filter POKs by tag | Must Have | MVP |
| POK-22 | User can filter POKs by date range | Should Have | MVP |
| POK-23 | Search results display in a default sort order (relevance) | Must Have | MVP |
| POK-24 | User can change sort order (date created, date updated, relevance) | Must Have | Evolution |
| POK-25 | System supports semantic search (meaning-based, not just keyword) | Must Have | Mid-Long Term |
| POK-26 | Search results highlight matching terms | Could Have | Evolution |
| POK-27 | User can combine multiple filters (tags + keywords + date) | Should Have | Evolution |

**Use Case: Searching**

> An engineer is working on a feature that uses a concept they previously recorded. They open ED and type "REST API" or "loose coupling" in the search bar.
>
> The app returns a list of POKs matching those concepts, sorted by relevance. The engineer selects one to refresh their memory on the subject.

---

#### 1.2.3 Editing & Deleting POKs

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| POK-30 | User can edit the content of an existing POK | Must Have | Evolution |
| POK-31 | User can edit tags of an existing POK | Must Have | Evolution |
| POK-32 | System records all edits in an audit trail | Must Have | Evolution |
| POK-33 | User can delete a POK (soft delete) | Should Have | Evolution |
| POK-34 | User can restore a deleted POK within 30 days | Could Have | Post-MVP |
| POK-35 | Deleted POKs are permanently removed after 30 days | Could Have | Post-MVP |

---

### 1.3 Visualization & Navigation

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| VIZ-01 | User can view POKs in a timeline (chronological list) | Must Have | Evolution |
| VIZ-02 | User can view POKs grouped by tag | Must Have | Evolution |
| VIZ-03 | User can view a dashboard with learning statistics | Could Have | Mid-Long Term |
| VIZ-04 | System displays connections between related POKs (graph view) | Could Have | Mid-Long Term |

---

### 1.4 AI Features

> **Critical Constraint:** AI features MUST NOT modify POK content. AI assists with discovery and insights only. The user's original text is sacred and immutable by any automated process.

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| AI-01 | System suggests tags based on POK content | Must Have | Evolution |
| AI-02 | System identifies connections between POKs | Should Have | Mid-Long Term |
| AI-03 | User can chat with AI to query their POKs | Could Have | Mid-Long Term |
| AI-04 | AI responses always cite source POKs | Must Have | Mid-Long Term |
| AI-05 | AI never generates or modifies POK content | Must Have | All Phases |

---

### 1.5 Data Export & Portability

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| EXP-01 | User can export all POKs as JSON | Should Have | Post-MVP |
| EXP-02 | User can export all POKs as Markdown | Should Have | Post-MVP |
| EXP-03 | User can export filtered POKs (by tag, date range) | Could Have | Post-MVP |
| EXP-04 | User can generate a "brag doc" from selected POKs | Could Have | Mid-Long Term |

---

### 1.6 Social & Sharing

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| SOC-01 | User can share a single POK to LinkedIn | Could Have | Mid-Long Term |
| SOC-02 | User can share a single POK to Medium | Could Have | Mid-Long Term |
| SOC-03 | User can share a single POK to Substack | Could Have | Mid-Long Term |
| SOC-04 | Shared POKs generate a public read-only link | Could Have | Mid-Long Term |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target | Phase |
|----|-------------|--------|-------|
| PERF-01 | POK creation response time | < 500ms | MVP |
| PERF-02 | Keyword search response time | < 1s for up to 10,000 POKs | MVP |
| PERF-03 | Semantic search response time | < 2s for up to 10,000 POKs | Mid-Long Term |
| PERF-04 | App initial load time (web) | < 3s on 4G connection | MVP |
| PERF-05 | App initial load time (mobile) | < 2s after install | Evolution |

---

### 2.2 Scalability

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| SCAL-01 | Support concurrent users | 1-10 (MVP), 100+ (future) | Single user initially |
| SCAL-02 | Support POKs per user | 10,000+ | No artificial limits |
| SCAL-03 | Database can scale horizontally | When needed | Supabase handles this |

---

### 2.3 Availability & Reliability

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| AVL-01 | System uptime | 99% (MVP), 99.9% (production) | Some latency acceptable |
| AVL-02 | Data durability | No data loss | Daily backups minimum |
| AVL-03 | Graceful degradation | App works offline (read-only) | Post-MVP |

---

### 2.4 Security

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| SEC-01 | All API calls over HTTPS | Must Have | MVP |
| SEC-02 | Passwords hashed with bcrypt or Argon2 | Must Have | MVP |
| SEC-03 | JWT tokens for session management | Must Have | MVP |
| SEC-04 | User can only access their own POKs | Must Have | MVP |
| SEC-05 | Rate limiting on authentication endpoints | Should Have | MVP |
| SEC-06 | SQL injection prevention (parameterized queries) | Must Have | MVP |
| SEC-07 | XSS prevention on frontend | Must Have | MVP |

---

### 2.5 Usability

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| USE-01 | Mobile-responsive web interface | Must Have | MVP |
| USE-02 | POK creation in ≤ 3 clicks/taps | Must Have | MVP |
| USE-03 | Search accessible from any screen | Must Have | MVP |
| USE-04 | Dark mode support | Must Have | MVP |
| USE-05 | Keyboard shortcuts for power users (web) | Could Have | Post-MVP |
| USE-06 | Authenticated users land directly on the feed (learnings list), not on a welcome page | Must Have | MVP |
| USE-07 | Brand/logo in header is always a clickable link to the user's primary view | Must Have | MVP |
| USE-08 | Feed displays learnings in a single-column vertical layout (LIFO, newest on top) | Must Have | MVP |
| USE-09 | Inline quick-entry available directly on the feed page for fast learning capture | Must Have | MVP |
| USE-10 | Guest (unauthenticated) home page shows the login form directly — no intermediate "Get Started" screen | Must Have | MVP |

---

### 2.6 Maintainability

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| MAINT-01 | Code test coverage > 80% for new components | Must Have | Backend focus |
| MAINT-02 | API documentation via OpenAPI/Swagger | Must Have | MVP |
| MAINT-03 | Conventional Commits for all changes | Must Have | MVP |
| MAINT-04 | Automated changelog generation | Must Have | MVP |
| MAINT-05 | CI/CD pipeline for all environments | Must Have | MVP |

---

### 2.7 Data Integrity

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| DATA-01 | POK content never modified by AI | Must Have | Core principle |
| DATA-02 | All POK changes logged in audit trail | Must Have | Evolution |
| DATA-03 | Soft delete for all user data | Should Have | Evolution |
| DATA-04 | Consistency prioritized over availability (CAP) | Must Have | By design |

---

## 3. Git Branching Strategy

```
main                          # Production-ready releases only
  └── develop                 # Integration branch for ongoing work
        ├── feature/XXX       # New features (e.g., feature/pok-search)
        ├── chore/XXX         # Maintenance tasks (e.g., chore/update-deps)
        ├── fix/XXX           # Bug fixes (e.g., fix/auth-token-expiry)
        └── docs/XXX          # Documentation updates (e.g., docs/api-swagger)
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-description>` | `feature/pok-creation` |
| Bug Fix | `fix/<short-description>` | `fix/search-pagination` |
| Chore | `chore/<short-description>` | `chore/upgrade-spring-boot` |
| Documentation | `docs/<short-description>` | `docs/api-endpoints` |
| Refactor | `refactor/<short-description>` | `refactor/pok-service` |

### Merge Flow

1. Create branch from `develop`: `git checkout -b feature/my-feature develop`
2. Work and commit using Conventional Commits
3. Open Pull Request to `develop`
4. After review and CI passes, merge to `develop`
5. When ready for release: `develop` → `main` (triggers Release Please)

### Rules

- **Never commit directly to `main` or `develop`**
- All changes go through Pull Requests
- Branch names use lowercase and hyphens (no spaces or underscores)
- Delete branches after merge

---

## 4. Constraints

| Constraint | Description |
|------------|-------------|
| **Single Developer** | Project is built and maintained by one person |
| **Budget** | Free tier infrastructure preferred; max ~$20/month if needed |
| **Timeline** | MVP targeted for delivery within 8-12 weeks |
| **Technology** | Must use well-documented, widely-adopted technologies |

---

## 5. Assumptions

| Assumption | Rationale |
|------------|-----------|
| Initial user base is 1 (the author) | Validates product before broader release |
| POKs are primarily text-based | Simplifies MVP; media support added later |
| English and Portuguese are the primary languages | Both must be supported from day 1 (MVP) |
| Users have reliable internet | Offline mode is post-MVP |

---

## 6. MoSCoW Summary

### Must Have (MVP)
- Email + Google authentication
- Session persistence across browser restarts (AUTH-04)
- Create, search, filter POKs
- Basic keyword search
- Mobile-responsive web app
- Dark mode
- English and Portuguese language support
- Direct-to-feed post-login navigation (USE-06)
- Clickable logo navigation (USE-07)
- Single-column feed layout (USE-08)
- Inline quick-entry on feed (USE-09)

### Must Have (Evolution)
- Manual tagging with user control over suggested tags
- Sort order options (date, relevance)
- Timeline view
- Tag-grouped view
- AI auto-tagging suggestions

### Should Have
- Edit POKs with audit trail
- Semantic search
- MFA authentication
- AI-identified connections between POKs

### Could Have (Mid-Long Term)
- AI chat interface
- Graph visualization of POK connections
- Social sharing (LinkedIn, Medium, Substack)
- Data export (JSON, Markdown)
- Brag doc generation
- Audio recording attachments

### Won't Have (Out of Scope for now)
- Collaborative/team features
- Real-time sync across devices
- Offline-first architecture

---

## Document History

| Version | Date | Author | Changes |
|:-------:|:----:|:------:|:--------|
| 1.0 | 2026-01-29 | Lucas Xavier Ferreira | Initial version |
| 1.1 | 2026-02-21 | Lucas Xavier Ferreira | Added AUTH-04 implementation gap note; added USE-06 through USE-09 (MVP UX Review findings); updated MoSCoW summary |
