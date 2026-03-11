# Roadmap — learnimo

<!-- CURRENT_PHASE: 1 -->
<!-- CURRENT_PHASE_FILE: docs/ROADMAP.phase-1.md -->

> This file is the **roadmap index** — the single source of truth for the active phase.
> Commands and agents read `CURRENT_PHASE` above to load the right phase file.
> Per-phase files: `ROADMAP.phase-0.md` through `ROADMAP.phase-8.md`

---

## Phase Overview

```
  Phase 0        Phase 1        Phase 2        Phase 3        Phase 8
  Foundation ──► MVP        ──► Evolution  ──► AI & Mobile ──► Knowledge Enrichment
  ✅ Done        🔄 Active       🔄 Started      🔄 In Progress  🔄 In Progress

                              Phase 5        Phase 6
                              Privacy    ──► Social
                              🔄 In Progress 🔄 In Progress

  Phase 4        Phase 7
  Growth         Gamification
  ⏸️ Postponed    ⏸️ Postponed
```

| Phase | File | Status |
|-------|------|--------|
| 0 — Foundation | `ROADMAP.phase-0.md` | ✅ Complete |
| 1 — MVP | `ROADMAP.phase-1.md` | 🔄 Active |
| 2 — Evolution | `ROADMAP.phase-2.md` | 🔄 Started (2.1, 2.2, 2.3 done; 2.4 planned) |
| 3 — AI & Mobile | `ROADMAP.phase-3.md` | 🔄 In Progress (3.1, 3.3 done; 3.4 in progress) |
| 4 — Growth | `ROADMAP.phase-4.md` | ⏸️ Postponed |
| 5 — Privacy | `ROADMAP.phase-5.md` | 🔄 In Progress (5.1 done; 5.2 done) |
| 6 — Social | `ROADMAP.phase-6.md` | 🔄 In Progress (6.1 done; 6.3 done; 6.4 done; 6.5 done) |
| 7 — Gamification | `ROADMAP.phase-7.md` | ⏸️ Postponed |
| 8 — Knowledge Enrichment | `ROADMAP.phase-8.md` | 🔄 In Progress (8.1 done; 8.2 done) |

---

## Success Milestones

| Milestone | Success Indicator |
|-----------|-------------------|
| 🏁 MVP Live | App deployed, author using daily |
| ✏️ Evolution | Tagging works; 50+ POKs tagged; author uses timeline view |
| 🔍 Semantic Search | Search finds relevant POKs >80% of the time |
| 📱 Mobile App | Author captures POKs on mobile |
| 🔒 Privacy | All POKs have visibility controls; access enforcement confirmed |
| 👥 Social | Author follows at least 3 learners; share feature in use |
| 🏅 Gamification | First milestone badges awarded; AI tag suggestions in use |
| 📝 Knowledge Enrichment | Markdown renders in all views; tag search works; Knowledge Paths deferred to after Phase 6 |
| 🚀 Public Launch | 10 external learners; community principles published |

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

## Maintenance

Updates go in phase files (`ROADMAP.phase-{N}.md`), not here.

Only update this index when:
1. A full phase completes → bump `CURRENT_PHASE` and update the status table
2. A phase's summary status changes → update the status column

> `/finish-session` updates phase files; it touches this file only on phase completion.
