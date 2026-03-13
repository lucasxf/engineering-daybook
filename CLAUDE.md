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

**Docker / Testcontainers gate:** Before running `mvn verify` (or any command that triggers Testcontainers integration tests), check whether Docker is running. If it is not:
1. Attempt to start Docker Desktop: `start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"` then wait ~20 s and retry
2. If Docker still isn't available, **stop and ask the user** — do not silently skip integration tests and proceed to commit/PR. Skipping means coverage data is incomplete and integration regressions go undetected. (Added 2026-02-25)

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

## Session Guidelines

1. **Plan before coding** — enter plan mode for any non-trivial task (3+ steps or architectural decisions). Write detailed specs upfront. If something goes sideways, STOP and re-plan — don't keep pushing.
2. **Be critical** — challenge the user's questions AND your own work. Push back on suggestions; don't just agree. Always show trade-offs and alternatives. For non-trivial changes, ask "is there a more elegant way?" If a fix feels hacky, implement the elegant solution instead. Skip for simple, obvious fixes.
3. **Quality over speed** — production-ready, not prototypes
4. **Test everything** — no code without tests
5. **Document decisions** — update ADRs when making architectural choices
6. **Learn from errors** — when a slash command encounters an error, fix the root cause in `.claude/commands/` before continuing. After ANY correction from the user, update `memory/MEMORY.md` Key Learnings with the pattern. Review Key Learnings at session start.
7. **Wiring gate** — before marking a feature milestone complete, verify that every new component/hook is imported and rendered in at least one page or consumed by at least one caller. Orphaned (unreferenced) exports are a defect, not a deferral. If a component was intentionally deferred, do not commit it — keep it on a branch or document the gap explicitly. `/finish-session` enforces this with an orphaned-export check. (Added 2026-02-28)
8. **Automation tracking gate** — every custom agent (`.claude/agents/*.md`) and slash command (`.claude/commands/*.md`) must have an entry in `.claude/metrics/usage-stats.toml` and appear in `KNOWN_AGENTS` / `KNOWN_COMMANDS` in `.claude/scripts/track-usage.py`. After adding or removing an agent/command, run `python3 .claude/scripts/sync-automation-registry.py` to keep the registry in sync. (Added 2026-03-06)

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

**Phase 1: MVP** — 🔄 In Progress (exit criterion: 1+ week usage)

Active work:
- [x] Milestone 1.6.2: E2E tests with Playwright (5 tests; auth redirect, login, create/edit/delete)
- [x] Milestone 1.7.6: General visual quality — done (chore/visual-quality, 2026-03-01)
- [ ] Phase 1 exit criterion: author uses app for 1+ week with satisfaction

**Phase 2: Evolution** — 🔄 Started (2.1, 2.2, 2.3 done; 2.4 planned)

- [x] Milestone 2.1: POK editing, deletion, audit trail
- [x] Milestone 2.2: Tagging System — full web UI done (TagSection, add/remove tags from view and edit pages, tag-at-creation via TagPicker in QuickEntry and /poks/new, post-create redirect to tag UI); TagFilter + TagInput combobox deferred but not blocking (2026-03-01)
- [x] Milestone 2.3: Visualization (timeline, tag-grouped view, sort) — done (2026-02-25)
- [ ] Milestone 2.4: UX Delight (inspirational prompts, homepage personalization)

**Phase 3: AI & Mobile** — 🔄 In Progress (3.1, 3.3 done; 3.4 in progress)

- [x] Milestone 3.1: Semantic Search — hybrid keyword + vector search, HuggingFace embeddings, pgvector (2026-02-26)
- [ ] Milestone 3.2: AI Connections (related learnings)
- [x] Milestone 3.3: Mobile App (Expo/React Native) — done (2026-02-27)
- [ ] Milestone 3.4: App Store Publishing — Android .aab built, Play Console setup done, Play Store internal track in progress; 6 mobile feature parity specs written (2026-03-09); mobile-design-system skill created (2026-03-13, step 1 of visual parity execution sequence)

**Phase 5: Privacy** — 🔄 In Progress (5.1 done; 5.2 done)

- [x] Milestone 5.1: POK Visibility Controls — private/public visibility on POKs and user default preference; irreversible PUBLIC→PRIVATE enforcement; access control; web + mobile UI indicators (2026-03-04)
- [x] Milestone 5.2: Learner Profile Privacy — profileVisibility field, learner profile endpoint/page, settings page/screen, E2E tests (2026-03-04)

**Phase 6: Social Capabilities** — 🔄 In Progress (6.1 done; 6.3 done; 6.4 done; 6.5 done)

- [x] Milestone 6.1: Following & Colleagues — follow/unfollow endpoints, colleague auto-detection (mutual follow), FOLLOWERS_ONLY/COLLEAGUES_ONLY visibility tiers, private social counts (anti-vanity), RelationshipStatus on profiles, FollowButton component, 4-tier visibility selectors on Settings page; 115 backend + 347 frontend + 8 E2E tests (2026-03-07)
- [x] Milestone 6.3: Learner Profiles — avatar upload/remove (Supabase Storage, Thumbnailator resize to 200×200), bio + displayName editing, Avatar component (web + mobile), learner profile page, settings page, header UserMenu with avatar; 415 backend + 357 web + 55 mobile tests (2026-03-07)
- [x] Milestone 6.4: Share (Re-Learning) — PokShare entity (V20 migration), PokShareService (TDD), PokShareController (POST/DELETE/GET), exception hierarchy, LearnerService union feed, ReLearningModal component, Re-learn button on PokCard/PokList wired on learner profile; 46 backend + 29 web + 4 E2E tests (2026-03-07)
- [ ] Milestone 6.2: Classes & Study Groups
- [x] Milestone 6.5: Discovery Feed — social feed (GET /api/v1/feed, FeedList, useFeedData), learner search (GET /api/v1/learners/search, Discover page); 17 E2E tests (2026-03-08); mobile social discovery (LearnerProfileScreen, DiscoverScreen, FollowButton, useLearnerProfile, useLearnerSearch, Maestro E2E flows — 2026-03-10)
- [ ] Milestone 6.6: Community Principles & Content Moderation

**Phase 8: Knowledge Enrichment** — 🔄 In Progress (8.1 done; 8.2 done)

- [x] Milestone 8.1: Markdown Support — done (2026-03-06); react-markdown + rehype-sanitize (web), react-native-markdown-display (mobile); 8.1.8 (title rendering) deferred
- [x] Milestone 8.2: Tag Improvements — display_name column + backfill migrations (V16/V17), TagService.normalise(), TagResponse.displayName, GET /api/v1/poks?tagId filter, TagFilter component wired into feed, mobile tag components updated, integration tests added (2026-03-06)
- [ ] Milestone 8.3: Knowledge Paths — planning and spec only (graph visualization, grouped by topic)

**Phase 4: Growth & Polish** — ⏸️ Postponed (deprioritized in favor of Phase 8, 2026-03-06)

**Phase 7: Gamification** — ⏸️ Postponed (deprioritized in favor of Phase 8, 2026-03-06)

See `docs/ROADMAP.md` for full active milestone details.

---

## Contact

- **GitHub:** https://github.com/lucasxf
- **LinkedIn:** https://www.linkedin.com/in/lucas-xavier-ferreira/

---

*Last updated: 2026-03-13 (session: feat/mobile-design-system-skill — mobile-design-system skill created)*
