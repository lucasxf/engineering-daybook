# CLAUDE.md — learnimo

> Universal context file. Loaded in every session regardless of stack.
> For stack-specific conventions, see: `backend/CLAUDE.md` | `web/CLAUDE.md` | `mobile/CLAUDE.md` | `docs/CLAUDE.md`

---

## Project Overview

**learnimo (ED)** is a personal learning journal for everyone — capture, organize, and recall what you learn.

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

**Docker / Testcontainers gate:** Never skip integration tests when Docker is unavailable — stop and ask the user. See `backend/CLAUDE.md` for the full procedure. (Added 2026-02-25)

**Main branch protection:** Never push directly to `main`. It is read-only — only pull from it. All code reaches `main` via PRs opened from `develop`. (Added 2026-02-25)

**Branch deletion safety:** Never delete protected, default, or automation-managed branches (`main`, `develop`, `release-please--*`, `copilot/*`, or other CI/CD-managed branches) — even during batch branch cleanup operations. (Added 2026-03-04)

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

## Session Guidelines (extends `~/.claude/CLAUDE.md`)

1. **Be critical** — challenge the user's questions AND your own work. Push back on suggestions; don't just agree. Always show trade-offs and alternatives. For non-trivial changes, ask "is there a more elegant way?" If a fix feels hacky, implement the elegant solution instead. Skip for simple, obvious fixes.
2. **Learn from errors** — when a slash command encounters an error, fix the root cause in `.claude/commands/` before continuing. Route corrections to the right file via the `save-learning` skill: stack-specific pitfalls → `{stack}/CLAUDE.md` "Known Pitfalls"; cross-cutting patterns → `memory/MEMORY.md` Key Learnings. Never duplicate across both.
3. **Wiring gate** — `/finish-session` enforces orphaned-export check. (Added 2026-02-28)
4. **Automation tracking gate** — every custom agent/command must have entries in `.claude/metrics/usage-stats.toml` and `.claude/scripts/track-usage.py`. After adding or removing, run `python3 .claude/scripts/sync-automation-registry.py`. (Added 2026-03-06)

## Task Management

- **Track Progress**: Mark milestone items complete in the active phase file (`docs/ROADMAP.phase-{N}.md`) — not in `docs/ROADMAP.md` (that's the index only).
- **Document Results**: Run `/finish-session` to record session outcomes in the phase file.

## Environment Notes

**`gh` CLI path on this machine:** `gh` is NOT on the PATH in Git Bash / mintty. Use the full path:
```bash
GH="/c/Program Files/GitHub CLI/gh.exe"
"$GH" pr view 94 ...
```
Do NOT call `gh` via PowerShell (`gh` is also not on the PowerShell PATH) or `cmd /c gh` (both silently fail or produce no output). Always use the full path in Bash. (Added 2026-02-27)

**`docker` binary not on PATH in Git Bash on Windows:** Even when Docker Desktop is running, `docker` is not on the default Git Bash PATH. The binary lives at `/c/Program Files/Docker/Docker/resources/bin/docker.exe`. Fix: prepend it before any `docker`-dependent command:
```bash
export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"
docker info
```
The `Bash(export *)` permission in `.claude/settings.json` covers this. (Added 2026-03-01)

**Never add machine-specific absolute paths to `settings.json`:** `.claude/settings.json` is version-controlled and committed to the remote repository. Machine-specific paths (e.g. `/c/repo/apache-maven-3.9.11/bin/mvn`, `/c/Users/lucas/AppData/Roaming/npm/npm.cmd`) must go in `.claude/settings.local.json`, which is gitignored. Only portable, tool-name-based patterns (e.g. `Bash(mvn *)`, `Bash(npm run *)`) belong in `settings.json`. (Added 2026-03-01)

**`node_modules` is not shared between worktrees — run `npm install` in each worktree:** `.gitignore` excludes `node_modules`, so a new worktree has no installed packages. Running lint or tests without installing first produces errors like `node_modules/.bin/eslint: No such file or directory`. Fix: run `npm install --legacy-peer-deps` in both `web/` and `mobile/` directories of any new worktree before running lint or tests. (Added 2026-03-07)

**Claude Code "allow always" dialog saves wrong permission format:** The "don't ask again" dialog writes permissions to `settings.local.json` using a colon-separated format (e.g. `Bash(export:*)`) instead of the correct space-separated format (`Bash(export *)`). The colon format never matches actual shell commands, so the permission is silently ignored and the dialog reappears. Fix: add correct patterns directly to `.claude/settings.json` using space-separated syntax. Do NOT rely on the "allow always" dialog to persist permissions correctly. (Added 2026-03-01)

---

## Current Focus

See `docs/ROADMAP.md` for active phases and milestones.

---

## Contact

- **GitHub:** https://github.com/lucasxf
- **LinkedIn:** https://www.linkedin.com/in/lucas-xavier-ferreira/

---

*Last updated: 2026-03-19 (session: develop — SPACE productivity toolset: dc_counter, dora_metrics, loc_churn, /productivity-report, productivity-metrics skill)*
