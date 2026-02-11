# Specification Files

> Implementation contracts that separate design from code.

---

## When to Use Specs

- Features with **domain complexity** or multiple architectural decisions
- Work touching **multiple layers** (domain, application, infrastructure)
- New capabilities where **design choices need to be deliberate**
- POCs with **clear scope and acceptance criteria**

## When to Skip (Go Direct)

- Bug fixes and **localized refactorings**
- **Mechanical tasks** with established patterns
- **Exploratory spikes** (crystallize into a spec *after* if delivering)
- Tasks where CLAUDE.md conventions already provide sufficient guidance

---

## Directory Structure

```
docs/specs/
  template.md              # Canonical spec template
  README.md                # This file
  features/                # Feature specifications
  infrastructure/          # Infrastructure/tooling specs
```

---

## Quick Start

```bash
# 1. Copy the template
cp docs/specs/template.md docs/specs/features/my-feature.md

# 2. Fill in the required sections
#    Context, Requirements, Constraints, Acceptance Criteria, Implementation Approach

# 3. Implement from spec
/implement-spec docs/specs/features/my-feature.md
```

The command validates the spec, presents an implementation plan, waits for approval, implements with TDD, commits in logical units, and updates the spec with post-implementation notes.

---

## Spec Lifecycle

```
Draft → Approved → In Progress → Implemented
```

| Status | Meaning |
|--------|---------|
| **Draft** | Being written or refined |
| **Approved** | Reviewed and ready for implementation |
| **In Progress** | Currently being implemented via `/implement-spec` |
| **Implemented** | Complete with post-implementation notes filled in |

---

## Template Sections

| Section | Purpose |
|---------|---------|
| **Context** | Why this exists, links to decisions/user stories |
| **Requirements** | Checkboxed functional + non-functional requirements |
| **Technical Constraints** | Stack, technologies, integration points, out of scope |
| **Acceptance Criteria** | Testable Given/When/Then scenarios |
| **Implementation Approach** | Architecture, test strategy, file changes |
| **Dependencies** | What blocks this, what this blocks |
| **Post-Implementation Notes** | Decisions taken, deviations, lessons learned (filled after) |

---

## Tips

- **Start simple** — don't over-specify, focus on the contract
- **Make it testable** — every requirement should map to acceptance criteria
- **Document decisions** — post-implementation notes are the most valuable part
- **Link to context** — reference user stories, ADRs, related specs
