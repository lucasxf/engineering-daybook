# [Feature Name]

> **Status:** Draft | Approved | In Progress | Implemented
> **Created:** YYYY-MM-DD
> **Implemented:** _pending_

---

## Context

[Why this feature exists. Link to product decision, user story, or problem statement.]

**Related:**
- [Link to user story, ADR, or related spec]

---

## Requirements

### Functional

- [ ] FR1: [Description]
- [ ] FR2: [Description]

### Non-Functional

- [ ] NFR1: [Performance, security, or maintainability requirement]

---

## Technical Constraints

**Stack:** Backend | Web | Mobile | Infrastructure | Multiple

**Technologies:** [Language/framework versions, required libraries]

**Integration Points:** [Existing code this touches, external systems]

**Out of Scope:**
- [Explicitly NOT included in this spec]

---

## Acceptance Criteria

### AC1: [Scenario name]
**GIVEN** [precondition]
**WHEN** [action]
**THEN** [expected outcome]

### AC2: [Scenario name]
**GIVEN** [precondition]
**WHEN** [action]
**THEN** [expected outcome]

---

## Screens

> _This section describes the user-facing screens introduced or modified by this feature.
> Each screen block is self-contained and tool-agnostic — it can be consumed directly
> by design tools, UI generation tools, or implementation agents._
> _Omit this section for backend-only specs._

### Screen: [Screen Name]

**Purpose:** [What the user accomplishes on this screen]

**Route:** `/[locale]/path/to/page`

**Layout:**
1. [Section] — [description]
2. [Section] — [description]

**Components:**
- `<PageComponent>` → `<ChildA />`, `<ChildB>` → `<Grandchild />`

**States:**
- Empty: [description]
- Loading: [description]
- Error: [description]
- Populated: [description]

**i18n:**
| Key | EN | PT-BR |
|-----|-----|-------|
| `namespace.key` | English text | Portuguese text |

**Interactions:**
- [click/tap target] → [what happens]

**Accessibility:**
- [requirement]

---

## Implementation Approach

### Architecture

[High-level design: layers, patterns, key classes/components]

### Test Strategy

- [ ] Full TDD (tests first for all code)
- [ ] Partial TDD (tests first for: [specific components])
- [ ] Infrastructure only (TDD not applicable — justification: [reason])

### File Changes

**New:**
- `path/to/File` — [purpose]

**Modified:**
- `path/to/File` — [what changes]

**Migrations (if applicable):**
- `db/migration/V___description.sql` — [schema changes]

---

## Implementation Plan

> _Ordered list of atomic tasks for subagent execution.
> Optional for simple specs; recommended for multi-commit features.
> `/implement-spec` uses this as the execution contract when present._

### Task 1: [Brief description]
- **Files:** `path/to/file1`, `path/to/file2`
- **Depends on:** _none_ | Task N
- **Commit:** `type: commit message`
- **Stack:** backend | web | mobile | infra

### Task 2: [Brief description]
- **Files:** `path/to/file3`
- **Depends on:** Task 1
- **Commit:** `type: commit message`
- **Stack:** backend | web | mobile | infra

---

## Dependencies

**Blocked by:** [Specs or features that must complete first, or "None"]

**Blocks:** [Specs that depend on this one, or "None"]

**External:** [Library upgrades, infrastructure setup, or "None"]

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `hash`: message

### Architectural Decisions

**Decision: [Title]**
- **Options:** [A, B, C]
- **Chosen:** [B]
- **Rationale:** [Why]

### Deviations from Spec
- [Any changes from original plan and why]

### Lessons Learned
- [What worked, what to do differently]
