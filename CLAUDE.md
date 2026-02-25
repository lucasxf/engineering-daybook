# CLAUDE.md — learnimo

> Universal context file. Loaded in every session regardless of stack.
> For stack-specific conventions, see: `backend/CLAUDE.md` | `web/CLAUDE.md` | `mobile/CLAUDE.md` | `docs/CLAUDE.md`

---

## Project Overview

**learnimo (ED)** is a personal knowledge management tool for engineers to capture, organize, and recall daily learnings.

- **Repository:** https://github.com/lucasxf/engineering-daybook
- **Author:** Lucas Xavier Ferreira
- **Status:** Phase 1 (MVP)

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

### User-Facing Terminology

**CRITICAL RULE:** "POK" is internal domain jargon. Users must NEVER see it in the UI.

| Context | Term to Use | Examples |
|---------|-------------|----------|
| **Internal code** | `POK`, `Pok` | File names, types, API routes, DB tables, tests, comments |
| **User-facing UI** | `learning` | Buttons, labels, messages, page titles, form hints, notifications |
| **i18n files** | `learning` (EN)<br>`aprendizado` (PT-BR) | All translation keys under `poks.*` namespace |

**Examples:**
- ❌ "Create POK" → ✅ "Save Learning"
- ❌ "My POKs" → ✅ "My Learnings"
- ❌ "POK created successfully" → ✅ "Learning saved successfully"

**See also:** `docs/GLOSSARY.md`

---

## UX Mandate

> **Reduce friction. Seamless experience. Minimum clicks and screens.**

This is a permanent, project-wide principle that applies to ALL features across ALL phases.

**Rules:**
- Every user action should require the fewest possible clicks/taps to complete
- Eliminate intermediate screens that add no value
- Authenticated users land directly on their primary workflow (the feed), never on a welcome page
- Prefer inline interactions over navigation to separate pages when the interaction is simple
- Navigation elements (logo, brand name) must always be clickable and link to the user's primary view
- When evaluating any feature: "Can we remove a step?" If yes, remove it.

---

## Git Workflow

```
main ← develop ← feature/xxx
                 fix/xxx
                 chore/xxx
                 docs/xxx
```

**Branch naming:** `type/short-description` (lowercase, hyphens)

**Pre-work check:** Always verify the current branch (`git branch --show-current`) before starting any task. Never commit changes to an unrelated branch.

**Quality gate:** Never commit when there are test, lint, build, or CI failures. Stop, show the error, and ask how to proceed. Only bypass if user explicitly requests it — warn clearly before proceeding.

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

## Session Guidelines

1. **Plan before coding** — show plan, wait for approval
2. **Be critical** — challenge questions and push back on suggestions; don't just agree. Always show trade-offs and alternatives. (Updated 2026-02-25)
3. **Quality over speed** — production-ready, not prototypes
4. **Test everything** — no code without tests
5. **Document decisions** — update ADRs when making architectural choices
6. **Learn from command errors** — when a slash command encounters an error, fix the root cause in `.claude/commands/` before continuing

---

## Current Focus

**Phase 1: MVP** — 🔄 In Progress (exit criterion: 1+ week usage)

Active work:
- [ ] Milestone 1.6.2: E2E tests with Playwright (Phase B, after Phase 1 exit)
- [ ] Milestone 1.7.6: General visual quality — UI needs design pass
- [ ] Phase 1 exit criterion: author uses app for 1+ week with satisfaction

Phase 2 next up: Tagging System (2.2), Visualization (2.3), UX Delight (2.4)

See `docs/ROADMAP.md` for full active milestone details.

---

## Contact

- **GitHub:** https://github.com/lucasxf
- **LinkedIn:** https://www.linkedin.com/in/lucas-xavier-ferreira/

---

*Last updated: 2026-02-25*
