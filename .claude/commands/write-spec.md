---
description: Write a feature specification using the spec template with product and technical analysis
argument-hint: <feature-name-or-description>
---

# Write Feature Specification

Feature: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates to `product-manager` agent (and optionally `frontend-ux-specialist`). These agents MUST NEVER call `/write-spec` back.

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

**Delegate to `product-manager` agent** with this prompt:

> "Define the product requirements for the following feature in Engineering Daybook: **[feature name/description]**.
>
> Produce the following sections in markdown format:
>
> 1. **Context** — Why this feature exists, the user problem it solves, link to any related roadmap items or specs
> 2. **Functional Requirements** — Checkboxed list (FR1, FR2, ...) with MoSCoW priority labels (Must Have / Should Have / Could Have)
> 3. **Non-Functional Requirements** — Performance, security, accessibility, i18n considerations
> 4. **Acceptance Criteria** — Testable Given/When/Then (Gherkin) scenarios covering happy paths and key edge cases
>
> Follow these rules:
> - Every functional requirement must map to at least one acceptance criterion
> - Be specific and testable — no vague requirements like 'should be fast'
> - Consider both EN and PT-BR locales where relevant
> - Reference the Engineering Daybook domain model: User, POK, Tag, PokTag, PokAuditLog
> - Mark deferred/out-of-scope items explicitly"

Review the agent's output for completeness and consistency. Adjust if needed.

---

## Phase 3: Technical Sections

**This runs in the main session** (full codebase context available).

### 3.1 Codebase Exploration

1. Search the codebase for existing patterns relevant to the feature
2. Identify files that will be affected (controllers, services, repositories, migrations, frontend pages/components)
3. Check for reusable code, utilities, or patterns already in place

### 3.2 Write Technical Constraints

- **Stack:** Determine from the feature scope (Backend / Web / Mobile / Multiple)
- **Technologies:** List specific versions and libraries required
- **Integration Points:** Existing code this touches, external systems
- **Out of Scope:** Items explicitly deferred (complement the product-manager's list)

### 3.3 Write Implementation Approach

- **Architecture:** High-level design — layers, patterns, key classes/components
- **Test Strategy:** Recommend Full TDD / Partial TDD / Infrastructure based on feature complexity
- **File Changes:** Concrete list of new files, modified files, and migrations with paths and purposes

### 3.4 Write Dependencies

- **Blocked by:** Other specs or features that must complete first
- **Blocks:** Specs that depend on this one
- **External:** Library upgrades, infrastructure setup needed

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

## Implementation Approach
[From Phase 3]

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
