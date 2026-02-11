# Roadmap — Engineering Daybook

This document outlines the development phases, milestones, and timeline for the Engineering Daybook project.

---

## Overview

The project follows an iterative development approach, prioritizing a functional MVP for personal use before expanding features and audience.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 0        Phase 1          Phase 2           Phase 3        Phase 4   │
│  Foundation     MVP              Evolution         AI & Scale     Growth    │
│                                                                              │
│  ┌─────┐       ┌─────┐          ┌─────┐           ┌─────┐       ┌─────┐    │
│  │Week │       │Week │          │Week │           │Week │       │Week │    │
│  │ 1-2 │──────►│ 3-8 │─────────►│9-14 │──────────►│15-20│──────►│ 21+ │    │
│  └─────┘       └─────┘          └─────┘           └─────┘       └─────┘    │
│                                                                              │
│  Setup &       Core             Enhanced          AI Features   Marketing   │
│  Planning      Features         Experience        & Mobile      & Feedback  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Foundation (Weeks 1-2)

**Goal:** Project setup, documentation, and infrastructure ready for development.

### Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 0.1 | Project documentation (Vision, Requirements, Architecture, Glossary, Roadmap) | ✅ Done |
| 0.2 | GitHub repository with README, LICENSE, .gitignore | 🔄 In Progress |
| 0.3 | Monorepo structure (/backend, /web, /mobile, /docs) | ⏳ Pending |
| 0.4 | CI/CD pipeline (GitHub Actions) | ⏳ Pending |
| 0.5 | Release Please configuration | ⏳ Pending |
| 0.6 | Development environment setup (local Docker, Supabase project) | ⏳ Pending |
| 0.7 | Backend project scaffold (Spring Boot + Maven) | ⏳ Pending |
| 0.8 | Web project scaffold (Next.js) | ⏳ Pending |
| 0.9 | Claude Code workflow setup (agents, commands) | ⏳ Pending |

### Exit Criteria
- [ ] All developers can clone repo and run locally
- [ ] CI pipeline runs on every PR
- [ ] Documentation is complete and accessible

---

## Phase 1: MVP (Weeks 3-8)

**Goal:** Deliver a functional web application for personal use with core POK management features.

### Milestone 1.1: Authentication (Week 3)

| # | Feature | Priority |
|---|---------|----------|
| 1.1.1 | User registration (email/password) | Must Have |
| 1.1.2 | User login (email/password) | Must Have |
| 1.1.3 | Google OAuth login | Must Have |
| 1.1.4 | JWT session management | Must Have |
| 1.1.5 | Password reset flow | Should Have |

### Milestone 1.2: POK Creation (Week 4)

| # | Feature | Priority |
|---|---------|----------|
| 1.2.1 | Create POK endpoint (backend) | Must Have |
| 1.2.2 | Create POK form (frontend) | Must Have |
| 1.2.3 | Auto-generate timestamps | Must Have |
| 1.2.4 | Input validation | Must Have |
| 1.2.5 | Success/error feedback UI | Must Have |

### Milestone 1.3: POK Listing & Search (Weeks 5-6)

| # | Feature | Priority |
|---|---------|----------|
| 1.3.1 | List all POKs (paginated) | Must Have |
| 1.3.2 | Keyword search | Must Have |
| 1.3.3 | Filter by date range | Should Have |
| 1.3.4 | Sort by date created/updated | Must Have |
| 1.3.5 | Empty states and loading UI | Must Have |

### Milestone 1.4: UI/UX Polish (Weeks 7-8)

| # | Feature | Priority |
|---|---------|----------|
| 1.4.1 | Dark mode (default) | Must Have |
| 1.4.2 | Light mode toggle | Must Have |
| 1.4.3 | Responsive design (mobile-friendly web) | Must Have |
| 1.4.4 | i18n: English support | Must Have |
| 1.4.5 | i18n: Portuguese (BR) support | Must Have |
| 1.4.6 | Accessibility basics (contrast, focus states) | Should Have |

### MVP Exit Criteria
- [ ] User can register, login, and logout
- [ ] User can create POKs with title and content
- [ ] User can search and list their POKs
- [ ] Dark mode works
- [ ] Both EN and PT-BR languages work
- [ ] App is deployed and accessible online
- [ ] Author uses the app for 1+ week

---

## Phase 2: Evolution (Weeks 9-14)

**Goal:** Enhance the core experience with editing, tagging, and better visualization.

### Milestone 2.1: POK Editing & Deletion (Week 9-10)

| # | Feature | Priority |
|---|---------|----------|
| 2.1.1 | Edit POK content | Must Have |
| 2.1.2 | Edit POK title | Must Have |
| 2.1.3 | Soft delete POK | Should Have |
| 2.1.4 | Audit trail logging | Must Have |
| 2.1.5 | View POK history | Could Have |

### Milestone 2.2: Tagging System (Weeks 11-12)

| # | Feature | Priority |
|---|---------|----------|
| 2.2.1 | Manual tag creation | Should Have |
| 2.2.2 | Assign tags to POKs | Should Have |
| 2.2.3 | Filter POKs by tag | Must Have |
| 2.2.4 | Tag management (rename, delete) | Should Have |
| 2.2.5 | AI auto-tag suggestions | Must Have |
| 2.2.6 | Approve/reject/modify suggested tags | Must Have |

### Milestone 2.3: Visualization (Weeks 13-14)

| # | Feature | Priority |
|---|---------|----------|
| 2.3.1 | Timeline view (chronological) | Must Have |
| 2.3.2 | Tag-grouped view | Must Have |
| 2.3.3 | Sort options (date, relevance) | Must Have |
| 2.3.4 | Search result highlighting | Could Have |

### Evolution Exit Criteria
- [ ] User can edit and delete POKs
- [ ] All changes are logged in audit trail
- [ ] Tagging system works (manual + AI suggestions)
- [ ] Timeline and tag views are functional
- [ ] Author actively uses tags to organize POKs

---

## Phase 3: AI & Mobile (Weeks 15-20)

**Goal:** Add semantic search, AI insights, and mobile app.

### Milestone 3.1: Semantic Search (Weeks 15-16)

| # | Feature | Priority |
|---|---------|----------|
| 3.1.1 | Generate embeddings for POKs | Must Have |
| 3.1.2 | pg_vector similarity search | Must Have |
| 3.1.3 | Hybrid search (keyword + semantic) | Should Have |
| 3.1.4 | Search relevance tuning | Should Have |

### Milestone 3.2: AI Connections (Weeks 17-18)

| # | Feature | Priority |
|---|---------|----------|
| 3.2.1 | Identify related POKs | Should Have |
| 3.2.2 | "Related learnings" section on POK view | Should Have |
| 3.2.3 | Connection strength indicators | Could Have |

### Milestone 3.3: Mobile App (Weeks 19-20)

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

## Phase 4: Growth & Polish (Weeks 21+)

**Goal:** Prepare for external users, add export features, and gather feedback.

### Milestone 4.1: Data Export (Week 21-22)

| # | Feature | Priority |
|---|---------|----------|
| 4.1.1 | Export all POKs as JSON | Should Have |
| 4.1.2 | Export all POKs as Markdown | Should Have |
| 4.1.3 | Export filtered POKs | Could Have |
| 4.1.4 | Brag doc generator | Could Have |

### Milestone 4.2: Security Hardening (Week 23)

| # | Feature | Priority |
|---|---------|----------|
| 4.2.1 | MFA support | Should Have |
| 4.2.2 | Rate limiting audit | Should Have |
| 4.2.3 | Security headers review | Should Have |
| 4.2.4 | Penetration testing (basic) | Could Have |

### Milestone 4.3: Social Sharing (Week 24)

| # | Feature | Priority |
|---|---------|----------|
| 4.3.1 | Share POK to LinkedIn | Could Have |
| 4.3.2 | Share POK to Medium | Could Have |
| 4.3.3 | Share POK to Substack | Could Have |
| 4.3.4 | Public read-only link generation | Could Have |

### Milestone 4.4: Launch Preparation (Week 25+)

| # | Task | Priority |
|---|------|----------|
| 4.4.1 | Product naming finalization | Should Have |
| 4.4.2 | Landing page | Should Have |
| 4.4.3 | Product Hunt / LinkedIn launch post | Could Have |
| 4.4.4 | Feedback collection mechanism | Should Have |
| 4.4.5 | Analytics setup (privacy-respecting) | Should Have |

### Phase 4 Exit Criteria
- [ ] External users can sign up and use the app
- [ ] Feedback mechanism is in place
- [ ] At least 1 article published about the project
- [ ] Basic analytics tracking usage patterns

---

## Future Considerations (Backlog)

These items are out of scope for the initial roadmap but may be prioritized later:

| Feature | Rationale |
|---------|-----------|
| AI Chat Interface | Query POKs via natural language conversation |
| Graph Visualization | Visual map of POK connections |
| Browser Extension | Quick capture from any webpage |
| IDE Plugin | Capture learnings without leaving the editor |
| Team/Sharing Features | Curated knowledge sharing (opt-in) |
| Offline Mode | Full offline-first with sync |
| Voice Input | Record POKs via voice (mobile) |

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

| Milestone | Target Date | Success Indicator |
|-----------|-------------|-------------------|
| 🏁 MVP Live | Week 8 | App deployed, author using daily |
| 🏷️ Tagging Works | Week 12 | 50+ POKs tagged |
| 🔍 Semantic Search | Week 16 | Search finds relevant POKs >80% of time |
| 📱 Mobile App | Week 20 | Author captures POKs on mobile |
| 🚀 Public Launch | Week 25+ | 10 external users |

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
