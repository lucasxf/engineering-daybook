# Slash Commands - Engineering Daybook

> Custom slash commands for efficient development workflow.

## Available Commands

<!-- BEGIN AUTO-GENERATED: COMMANDS_TABLE -->
| Command | Description | Usage |
|---------|-------------|-------|
| `/api-doc` | Add OpenAPI documentation to a controller | `/api-doc <controller-name>` |
| `/build-quiet` | Run build in quiet mode | `/build-quiet <optional: backend|web|mobile|all>` |
| `/compile-metrics` | Aggregate session delta files into the canonical usage-stats.toml | `/compile-metrics` |
| `/create-pr` | Create pull request for current feature branch | `/create-pr <optional-pr-title>` |
| `/directive` | Add a new coding directive with smart deduplication to appropriate file | `/directive <directive-content>` |
| `/docker-start` | Start Docker development environment | `/docker-start <optional: service-name>` |
| `/docker-stop` | Stop Docker development environment | `/docker-stop <optional: service-name>` |
| `/finish-session` | Finish session with build, lint, tests, docs update, and commit | `/finish-session <optional-commit-message-context>` |
| `/fix-pr` | Implement approved items from a /review-pr triage report — fix CI/CD failures, apply review feedback, commit, push | `/fix-pr <pr-number>` |
| `/implement-spec` | Implement a feature from a specification file with TDD and approval gates | `/implement-spec <path-to-spec-file>` |
| `/quick-test` | Run tests quickly in quiet mode | `/quick-test <optional: backend|web|mobile|all>` |
| `/resume-session` | Resume a previous development session | `/resume-session <optional: context or last-task>` |
| `/review-code` | Review code using sous-chef agent | `/review-code <file-or-class-name>` |
| `/review-pr` | Triage an open PR — check CI/CD status, fetch and evaluate review comments, save structured report for /fix-pr | `/review-pr <optional-pr-number>` |
| `/save-response` | Save Claude's last response to a file | `/save-response <filename>` |
| `/start-session` | Start a new development session with stack-specific context loading | `/start-session <optional: --stack=backend|web|mobile|docs|full or context description>` |
| `/test-service` | Run tests for a specific service or class | `/test-service <service-or-class-name>` |
| `/update-roadmap` | Update the current phase file with session progress | `/update-roadmap <what-was-completed>` |
| `/verify-quiet` | Run full verification (build + tests) in quiet mode | `/verify-quiet <optional: backend|web|mobile|all>` |
| `/write-spec` | Write a feature specification using the spec template with product and technical analysis | `/write-spec <feature-name-or-description>` |
<!-- END AUTO-GENERATED: COMMANDS_TABLE -->

## Session Workflow

### Starting a Session

```bash
# Backend work
/start-session --stack=backend

# Web work
/start-session --stack=web

# Mobile work
/start-session --stack=mobile

# Documentation only
/start-session --stack=docs
```

### During a Session

```bash
# Run tests
/quick-test backend

# Review code
/review-code PokService

# Add documentation
/api-doc PokController
```

### After PR Review

```bash
# Step 1 — Triage: assess CI/CD status + evaluate review comments, save report
/review-pr        # auto-selects the only open PR
/review-pr 12     # target a specific PR

# Step 2 — Fix: implement approved items from the triage report
/fix-pr 12
```

### Finishing a Session

```bash
# Complete session with tests, docs, commit
/finish-session "Implemented POK creation"

# Create PR if on feature branch
/create-pr "Add POK creation feature"
```

## Spec-Driven Development Workflow

For complex features with design decisions, use Spec-Driven Development (see CLAUDE.md for full guidance):

```bash
# 1. Create spec from template
cp docs/specs/template.md docs/specs/features/my-feature.md
# Fill in: Context, Requirements, Constraints, Acceptance Criteria, Approach

# 2. Implement from spec
/implement-spec docs/specs/features/my-feature.md
# Validates spec → presents plan → waits for approval → TDD → logical commits → updates spec

# 3. Finish session as usual
/finish-session "Completed my-feature"
```

**Use specs for:** Multi-layer features, new architectural patterns, complex business logic.
**Go direct for:** Bug fixes, refactorings, config changes, mechanical tasks.

---

## Stack Options

| Stack | Description | Files Loaded |
|-------|-------------|--------------|
| `backend` | Java/Spring Boot | CLAUDE.md, ROADMAP.md, README.md |
| `web` | Next.js/TypeScript | CLAUDE.md, ROADMAP.md, README.md |
| `mobile` | Expo/React Native | CLAUDE.md, ROADMAP.md, README.md |
| `docs` | Documentation only | CLAUDE.md, ROADMAP.md, README.md |
| `full` | Everything | All context files |

## Anti-Cyclic Dependency Rule

Commands can call agents, agents can call other agents, but **agents must NEVER call commands**.

```
Commands (entry points)
    ↓ can call
Agents (workers)
    ↓ can call
Other Agents (delegation)
    ❌ NEVER call Commands
```
