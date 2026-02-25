# Roadmap — learnimo

<!-- CURRENT_PHASE: 1 -->
<!-- CURRENT_PHASE_FILE: docs/ROADMAP.phase-1.md -->

> This file is the **roadmap index** — the single source of truth for the active phase.
> Commands and agents read `CURRENT_PHASE` above to load the right phase file.
> Per-phase files: `ROADMAP.phase-0.md` through `ROADMAP.phase-7.md`

---

## Phase Overview

```
  Phase 0        Phase 1        Phase 2        Phase 3        Phase 4
  Foundation ──► MVP        ──► Evolution  ──► AI & Mobile ──► Growth
  ✅ Done        🔄 Active       🔄 Started      ⏳ Planned      ⏳ Planned

                              Phase 5        Phase 6        Phase 7
                              Privacy    ──► Social     ──► Gamification
                              ⏳ Planned     ⏳ Planned      ⏳ Planned
```

| Phase | File | Status |
|-------|------|--------|
| 0 — Foundation | `ROADMAP.phase-0.md` | ✅ Complete |
| 1 — MVP | `ROADMAP.phase-1.md` | 🔄 Active |
| 2 — Evolution | `ROADMAP.phase-2.md` | 🔄 Started (2.1 done) |
| 3 — AI & Mobile | `ROADMAP.phase-3.md` | ⏳ Planned |
| 4 — Growth | `ROADMAP.phase-4.md` | ⏳ Planned |
| 5 — Privacy | `ROADMAP.phase-5.md` | ⏳ Planned |
| 6 — Social | `ROADMAP.phase-6.md` | ⏳ Planned |
| 7 — Gamification | `ROADMAP.phase-7.md` | ⏳ Planned |

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

When all items in a milestone are ✅:
1. Move the milestone section to the appropriate `ROADMAP.phase-N.md` (if not already there)
2. Update the phase status in this file
3. Update `CLAUDE.md` "Current Focus" to reflect the active phase
4. Update `README.md` if the phase or active milestone changed

> `/finish-session` automates steps 1–4 when a milestone is completed.
