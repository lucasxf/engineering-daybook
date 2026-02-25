# CLAUDE.md — Docs Context

> Load this file for documentation/architecture sessions. Root `CLAUDE.md` is always loaded first.

---

## Infrastructure

- **Web Hosting:** Vercel
- **Backend Hosting:** Railway (`engineering-daybook-production.up.railway.app`)
- **Domain:** learnimo.net (Vercel + Locaweb DNS)
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
| `/docs/ROADMAP.md` | Active milestones and upcoming work |
| `/docs/ROADMAP.archive.md` | Completed milestones (Phase 0, Phase 1 1.1–1.5) |

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
