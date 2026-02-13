# Slash Commands - Engineering Daybook

> Custom slash commands for efficient development workflow.

## Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/start-session` | Start session with stack-specific context | `/start-session --stack=backend` |
| `/finish-session` | Finish session with tests, docs, commit | `/finish-session "POK service complete"` |
| `/create-pr` | Create pull request for feature branch | `/create-pr "Add POK tagging"` |
| `/resume-session` | Resume previous development session | `/resume-session` |
| `/directive` | Add coding directive to CLAUDE.md | `/directive "Always use records for DTOs"` |
| `/update-roadmap` | Update ROADMAP.md with progress | `/update-roadmap "Completed POK CRUD"` |
| `/review-code` | Trigger backend-code-reviewer agent | `/review-code PokService` |
| `/review-pr` | Review and address feedback on an open PR | `/review-pr 12` |
| `/quick-test` | Run tests in quiet mode | `/quick-test backend` |
| `/build-quiet` | Run build in quiet mode | `/build-quiet backend` |
| `/verify-quiet` | Run full verification (build + tests) | `/verify-quiet all` |
| `/docker-start` | Start Docker development environment | `/docker-start` |
| `/docker-stop` | Stop Docker development environment | `/docker-stop` |
| `/api-doc` | Add OpenAPI docs to controller | `/api-doc PokController` |
| `/test-service` | Run tests for specific service | `/test-service PokService` |
| `/save-response` | Save Claude's response to file | `/save-response notes.md` |
| `/write-spec` | Write feature spec from template | `/write-spec "POK CRUD"` |
| `/implement-spec` | Implement feature from spec with TDD | `/implement-spec docs/specs/features/pok-crud.md` |

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
# Address review feedback on the only open PR
/review-pr

# Address feedback on a specific PR
/review-pr 12
```

### Finishing a Session

```bash
# Complete session with tests, docs, commit
/finish-session "Implemented POK creation"

# Create PR if on feature branch
/create-pr "Add POK creation feature"
```

## Stack Options

| Stack | Description | Files Loaded |
|-------|-------------|--------------|
| `backend` | Java/Spring Boot | CLAUDE.md, ROADMAP.md, README.md |
| `web` | Next.js/TypeScript | CLAUDE.md, ROADMAP.md, README.md |
| `mobile` | Expo/React Native | CLAUDE.md, ROADMAP.md, README.md |
| `docs` | Documentation only | CLAUDE.md, ROADMAP.md, README.md |
| `full` | Everything | All context files |

## Spec-Driven Development Workflow

```bash
# 1. Write the spec (delegates to product-manager agent)
/write-spec "POK CRUD"

# 2. Review and approve the generated spec
# (edit docs/specs/features/pok-crud.md if needed)

# 3. Implement from the spec (TDD, approval gates)
/implement-spec docs/specs/features/pok-crud.md
```

Pipeline: `/write-spec` → spec file → `/implement-spec`

---

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
