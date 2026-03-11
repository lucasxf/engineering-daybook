---
description: Write a feature specification using the spec template with product and technical analysis
argument-hint: <feature-name-or-description>
---

# Write Feature Specification

Feature: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates to `virgil`, `nexus`, `sous-chef`, and `pixl` agents. These agents MUST NEVER call `/write-spec` back.

@CLAUDE.md

---

## Phase 0: Branch Verification

Before making any file changes or commits, perform a full branch intelligence check.

### 0.1 Gather Current State

Run in parallel:
- `git branch --show-current` — current branch
- `git status --short` — uncommitted changes

Display: **"Current branch: `<branch>`"**

### 0.2 Derive Feature Slug

From `$ARGUMENTS` (spec path or feature description), extract the feature slug:
- Path: `docs/specs/features/tagging-system.md` → slug = `tagging-system`
- Description: `"POK CRUD"` → slug = `pok-crud`

### 0.3 Search for Existing Branches

Run in parallel:
```bash
git branch | grep <slug>       # local branches matching the slug
git branch -r | grep <slug>    # remote branches matching the slug
```

**If matching branches exist (local or remote):**
- List them to the user with their full names
- If the current branch is NOT one of them, use AskUserQuestion to offer:
  1. Switch to the best-matching local branch
  2. Checkout the remote branch locally (if only on remote: `git checkout -b feat/<slug> origin/feat/<slug>`)
  3. Create a new `feat/<slug>` from `develop`
  4. Stay on current branch (not recommended — warn why)

**If no matching branches exist AND the current branch looks wrong:**
(wrong = `main`, `develop`, a merged branch, or a branch for a clearly different topic)
- Warn: "No `<slug>` branch found. Current branch `<current>` doesn't look right for this spec."
- Use AskUserQuestion to offer:
  1. Create `feat/<slug>` from `develop` (Recommended)
  2. Stay on current branch

**If the current branch already matches the slug:** Proceed to 0.4.

### 0.4 Check Branch Freshness

If on a feature branch (not `develop` or `main`), check whether it is behind `develop`:
```bash
git fetch origin develop --quiet
git log HEAD..origin/develop --oneline
```

**If behind develop (output is non-empty):**
- Warn: "Branch `<branch>` is N commits behind `origin/develop`. Writing a spec on a stale branch may cause merge conflicts later."
- Use AskUserQuestion to offer:
  1. Rebase on develop now — `git rebase origin/develop`
  2. Continue without rebasing

### 0.5 Uncommitted Changes

**If `git status --short` shows tracked modified/staged files:** Warn and use AskUserQuestion to ask whether to stash or proceed.
**If only untracked files (`??`):** Safe to ignore — proceed automatically.

---

## Phase 1: Setup

### 1.1 Parse Input

1. Parse `$ARGUMENTS` as the feature name or description
2. **If no arguments:** STOP. Tell the user: "Usage: `/write-spec <feature-name-or-description>`"
3. Generate a slug from the feature name (lowercase, hyphens, e.g., "POK CRUD" → `pok-crud`)

### 1.2 Check for Existing Spec

```bash
ls docs/specs/features/
```

1. **If a spec with matching slug already exists:** STOP. Ask: "A spec already exists at `docs/specs/features/<slug>.md`. Open it instead? (y/n)"
2. **If no match:** Proceed

### 1.3 Load Context

1. Read `docs/specs/template.md` for the template structure
2. Read `ROADMAP.md` for current project state and priorities
3. Check if this feature is listed in the roadmap — note the milestone

---

## Phase 2: Product Sections

**Delegate to `virgil` agent via the Agent tool with `subagent_type: virgil`** using this prompt:

> "Define the product requirements for the following feature in Engineering Daybook: **[feature name/description]**.
>
> Produce the following sections in markdown format:
>
> 1. **Context** — Why this feature exists, the user problem it solves, link to any related roadmap items or specs
> 2. **Functional Requirements** — Checkboxed list (FR1, FR2, ...) with MoSCoW priority labels (Must Have / Should Have / Could Have). Include a **Scope** field at the end: one of `backend`, `web`, `full-stack`.
> 3. **Non-Functional Requirements** — Performance, security, accessibility, i18n considerations
> 4. **Acceptance Criteria** — Testable Given/When/Then (Gherkin) scenarios covering happy paths and key edge cases
>
> Follow these rules:
> - Every functional requirement must map to at least one acceptance criterion
> - Be specific and testable — no vague requirements like 'should be fast'
> - Consider both EN and PT-BR locales where relevant
> - Reference the Engineering Daybook domain model: User, POK, Tag, PokTag, PokAuditLog
> - Mark deferred/out-of-scope items explicitly"

Review the agent's output for completeness and consistency. Extract the **Scope** field — you will need it in Phases 2.1 and 3.

### 2.1 Screen Definition (web or full-stack only)

If the Scope includes `web` or `full-stack`, delegate to the `pixl` agent via the Agent tool with `subagent_type: pixl`:

> "Define the UI screens for the following feature in Engineering Daybook: **[feature name]**.
>
> Functional requirements: [paste FR list]
> UI-related acceptance criteria: [paste ACs that describe visual/interactive behavior]
>
> For each screen introduced or significantly modified by this feature, produce a `### Screen:` block following this exact format:
>
> ```
> ### Screen: [Screen Name]
>
> **Purpose:** [What the user accomplishes on this screen]
>
> **Route:** `/[locale]/path/to/page`
>
> **Layout:**
> 1. [Section] — [description]
> 2. [Section] — [description]
>
> **Components:**
> - `<PageComponent>` → `<ChildA />`, `<ChildB>` → `<Grandchild />`
>
> **States:**
> - Empty: [description]
> - Loading: [description]
> - Error: [description]
> - Populated: [description]
>
> **i18n:**
> | Key | EN | PT-BR |
> |-----|-----|-------|
> | `namespace.key` | English text | Portuguese text |
>
> **Interactions:**
> - [click/tap target] → [what happens]
>
> **Accessibility:**
> - [requirement]
> ```
>
> Rules:
> - Do NOT include brand colors, design tokens, or tool-specific directives. Keep it tool-agnostic.
> - Do NOT duplicate business rules that belong in FR/NFR — reference them (e.g., 'validation per FR3')
> - Cover every screen that has visible user-facing changes; skip screens with backend-only changes"

Include the `pixl` agent's output as the `## Screens` section of the spec.

---

## Phase 3: Technical Sections

### 3.1 Codebase Exploration (main session)

1. Search the codebase for existing patterns relevant to the feature
2. Identify files that will be affected (controllers, services, repositories, migrations, frontend pages/components)
3. Compile a **codebase brief**: key existing files, reusable patterns, and integration points. This brief will be passed to specialists.

### 3.2 Specialist Consultation

Delegate to specialists in parallel based on the **Scope** from Phase 2. Each specialist receives: feature name, functional requirements list, and the codebase brief from 3.1.

**Web or Full-stack:** Delegate to `nexus` agent via the Agent tool with `subagent_type: nexus`:
> "You are reviewing the frontend engineering approach for: **[feature name]**.
>
> Functional requirements: [paste FR list]
> Existing codebase context: [paste codebase brief]
>
> Provide: recommended routing/URL structure, component architecture, state strategy, data fetching approach, TypeScript patterns, and a list of files to create or modify. Call out any risks or data strategy decisions that need resolving before implementation."

**Backend or Full-stack:** Delegate to `sous-chef` agent via the Agent tool with `subagent_type: sous-chef`:
> "You are reviewing the backend engineering approach for: **[feature name]**.
>
> Functional requirements: [paste FR list]
> Existing codebase context: [paste codebase brief]
>
> Provide: API endpoint design (method, path, request/response shape), service layer changes, repository queries, Flyway migration needs, and a list of files to create or modify. Call out any data model decisions that affect the frontend."

**Web features with new screens:** Screen layout and interaction patterns are handled by the `pixl` delegation in Phase 2.1.

### 3.3 Assemble and Reconcile (main session)

Review specialist outputs for **conflicts** — e.g., backend proposes a data shape that contradicts the frontend's data fetching assumption. Resolve conflicts before writing the spec. Document any deferred decisions explicitly.

Then write:
- **Technical Constraints** — Stack, technologies, integration points, out of scope
- **Implementation Approach** — Architecture summary from specialist outputs, test strategy, concrete file changes list
- **Dependencies** — Blocked by, blocks, external requirements

### 3.4 Generate Implementation Plan

Using the `File Changes` list and `Test Strategy` from 3.3, produce an ordered task breakdown for the `## Implementation Plan` section. Group files into coherent atomic tasks — small enough for a single subagent to implement in a fresh context.

**Ordering heuristics (apply in this order):**
1. Migrations before entities/repositories
2. Entities/repositories before services
3. Services before controllers
4. Backend tasks before frontend tasks (full-stack specs)
5. Unit tests co-located with their production code (same task)
6. Integration tests after the components they integrate
7. E2E tests last
8. i18n changes grouped with the components that consume them

**For each task, specify:**
- A brief, imperative description (e.g., "Add PokShare entity and repository")
- The exact files to create or modify (use full relative paths)
- Dependencies on prior tasks (or `_none_` for the first tasks)
- A conventional commit message (`feat:`, `test:`, `chore:`, etc.)
- Stack label: `backend`, `web`, `mobile`, or `infra`

**Aim for 3–8 tasks per spec.** If fewer than 3 tasks are sufficient, a single implementation pass may be simpler than orchestration — note this to the user.

---

## Phase 4: Assembly & Review

### 4.1 Assemble Spec

Combine all sections into the template format from `docs/specs/template.md`:

```markdown
# [Feature Name]

> **Status:** Draft
> **Created:** [today's date]
> **Implemented:** _pending_

---

## Context
[From Phase 2]

## Requirements
### Functional
[From Phase 2]
### Non-Functional
[From Phase 2]

## Technical Constraints
[From Phase 3]

## Acceptance Criteria
[From Phase 2]

## Screens
[From Phase 2.1 — omit this section for backend-only specs]

## Implementation Approach
[From Phase 3]

## Implementation Plan
[From Phase 3.4]

## Dependencies
[From Phase 3]

## Post-Implementation Notes
> _This section is filled AFTER implementation._
```

### 4.2 Present for Review

Display the full assembled spec to the user.

Ask: **"Spec ready for review. Save as `docs/specs/features/<slug>.md`?"**

Use AskUserQuestion with options:
- **Save as Draft** — Write the file with Status: Draft
- **Save as Approved** — Write the file with Status: Approved (ready for `/implement-spec`)
- **Revise** — Ask what to adjust, regenerate relevant sections

### 4.3 Write File

1. Write the spec to `docs/specs/features/<slug>.md`
2. Commit:
```
docs: add spec for [feature name]
```

---

## Phase 5: Handoff

Report:
```
## Spec Created

**Feature:** [name]
**File:** docs/specs/features/<slug>.md
**Status:** [Draft | Approved]
**Sections:** Context, Requirements (N functional, N non-functional), N Acceptance Criteria, Implementation Approach, Dependencies

### Next Steps
- Review the spec and mark as "Approved" if satisfied
- Run `/implement-spec docs/specs/features/<slug>.md` to begin implementation
```

---

## Error Handling

- **No arguments:** Show usage message
- **Spec already exists:** Offer to open/edit existing spec
- **Product-manager agent fails:** Fall back to writing product sections in main session
- **Feature is ambiguous:** Use AskUserQuestion to clarify scope before proceeding
