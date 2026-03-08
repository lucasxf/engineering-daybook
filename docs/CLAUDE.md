# CLAUDE.md — Docs Context

> Load this file for documentation/architecture sessions. Root `CLAUDE.md` is always loaded first.

---

## Infrastructure

- **Web Hosting:** Vercel
- **Backend Hosting:** Railway (`engineering-daybook-production.up.railway.app`)
- **Domain:** learnimo.net · learnimo.com.br (Vercel + Locaweb DNS)
- **Database:** Supabase (managed PostgreSQL)
- **CI/CD:** GitHub Actions
- **Versioning:** Release Please + Conventional Commits

---

## Documentation References

| Doc | Purpose |
|-----|---------|
| `/docs/PROJECT_VISION.md` | What ED is/isn't |
| `/docs/REQUIREMENTS.md` | Features and priorities |
| `/docs/ARCHITECTURE.md` | Tech decisions, ADRs |
| `/docs/GLOSSARY.md` | Terminology |
| `/docs/ROADMAP.md` | Phase index — active phase marker, phase list |
| `/docs/ROADMAP.phase-N.md` | Full detail for phase N (e.g. `ROADMAP.phase-1.md`) |

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
- **Pattern application** — Work fully covered by existing conventions in `CLAUDE.md`

### Workflow

```bash
# 1. Write spec (includes Implementation Plan section)
/write-spec my-feature

# 2. Implement from spec
/implement-spec docs/specs/features/my-feature.md

# 3. Finish session as usual
/finish-session "Completed my-feature"
```

### Orchestrator + Subagent Pattern

For specs with an `## Implementation Plan` section, `/implement-spec` runs in **orchestrator mode**:

- The orchestrator (main agent) **never writes implementation code itself**
- It reads the plan, dispatches one **subagent per task** via the Task tool
- Each subagent gets a **fresh context window**: full spec + their task + codebase brief + stack conventions
- After each subagent completes, the orchestrator **verifies** (tests + lint + build) and **commits atomically**
- If a subagent fails, the orchestrator reports the error and asks whether to retry or skip

This prevents "context rot" — the degradation in quality that occurs when a single session accumulates 10+ commits worth of file reads, test runs, and diffs.

Specs **without** an `## Implementation Plan` fall back to legacy mode (monolithic implementation in one session), preserving backward compatibility.

### The `## Implementation Plan` Section

`/write-spec` auto-generates this section. Each task specifies:
- Files to touch
- Dependencies on prior tasks
- Conventional commit message
- Stack label

You can edit the task breakdown in the spec before running `/implement-spec`.

### Principles

1. **Specs are contracts** — Implementation follows spec or documents deviations
2. **Specs are living documents** — Updated post-implementation with real decisions
3. **Quality gates** — Plan approval before coding, TDD by default
4. **Atomic commits** — One commit per task, verified before the next task starts
5. **Fresh context per task** — Subagents work in isolation; orchestrator tracks progress

**Spec location:** `docs/specs/` | **Template:** `docs/specs/template.md`
