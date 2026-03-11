---
description: Implement a feature from a specification file with TDD and approval gates
argument-hint: <path-to-spec-file>
---

# Spec-Driven Implementation

Spec file: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates to `tech-writer`, `sous-chef`, `nexus`, `hedy`, and `pixl` agents. These agents MUST NEVER call `/implement-spec` back.

@CLAUDE.md

---

## Orchestrator Rules

When the spec contains an `## Implementation Plan` section, this command operates in **orchestrator mode**. In orchestrator mode:

1. **You NEVER write implementation code yourself** — all code is written by subagents via the Task tool.
2. **You read the spec, parse the plan, dispatch tasks, verify results, and commit.**
3. **Each subagent gets a FRESH context:** full spec + their specific task + codebase brief + stack conventions.
4. **After each subagent completes:** verify that tests pass, lint is clean, and files match what was expected.
5. **Atomic commits after each verified task** — one commit per task, using the task's commit message from the spec.
6. **On failure:** report the error and ask the user whether to retry (spawn a new subagent for the same task) or skip.

When the spec has NO `## Implementation Plan` section, this command falls back to **legacy mode** (monolithic implementation in the main session, current behavior).

---

## Phase 0: Branch Verification

Before making any file changes or commits, perform a full branch intelligence check.

### 0.1 Gather Current State

Run in parallel:
- `git branch --show-current` — current branch
- `git status --short` — uncommitted changes

Display: **"Current branch: `<branch>`"**

### 0.2 Derive Feature Slug

From the spec path `$ARGUMENTS` (e.g., `docs/specs/features/tagging-system.md`), extract the slug:
- `docs/specs/features/tagging-system.md` → slug = `tagging-system`

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
(wrong = `main`, `develop`, or a branch for a clearly different feature)
- Warn: "No `<slug>` branch found. Current branch `<current>` doesn't match the spec being implemented."
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
- Warn: "Branch `<branch>` is N commits behind `origin/develop`. Implementing on a stale branch risks conflicts and missing recent fixes."
- Use AskUserQuestion to offer:
  1. Rebase on develop now — `git rebase origin/develop`
  2. Continue without rebasing

### 0.5 Uncommitted Changes

**If `git status --short` shows tracked modified/staged files:** Warn and use AskUserQuestion to ask whether to stash or proceed.
**If only untracked files (`??`):** Safe to ignore — proceed automatically.

---

## Phase 1: Validation

### 1.1 Read and Parse Spec

1. Read the spec file at `$ARGUMENTS`
2. Verify it has required sections: Context, Requirements, Technical Constraints, Acceptance Criteria, Implementation Approach
3. **If sections are missing:** STOP. Tell the user which sections are missing and ask them to complete the spec before proceeding.
4. Note whether an optional `## Screens` section is present (web/full-stack specs). When present, use it in Phase 2 to inform component hierarchy and file planning — it is the authoritative source for UI structure.

### 1.2 Check Status & Structural Gate

1. Read the spec's Status field
2. **If "Implemented":** STOP. Ask: "This spec is already implemented. Re-implement? (y/n)"
3. **If "Approved":** Proceed to Phase 1.3 — skip structural check (already reviewed by `/review-spec`)
4. **If "Draft":** Warn the user:
   ```
   Spec status is Draft — it has not been reviewed.
   Run `/review-spec $ARGUMENTS` first to get a quality gate and approval.
   Proceed anyway? (y/n)
   ```
   - If **no** → STOP
   - If **yes** → run the **Structural Completeness Check** below before proceeding

**Structural Completeness Check (Draft bypass only):**

Check the spec for structural completeness. For each row, report PASS, FAIL, or WARN:

| Check | Rule | Severity |
|-------|------|----------|
| Status / Created header | Must not be placeholder | FAIL |
| `## Context` | Must not be placeholder text | FAIL |
| `## Requirements` > `### Functional` | At least 1 FR | FAIL |
| `## Requirements` > `### Non-Functional` | At least 1 NFR | FAIL |
| `## Technical Constraints` | Stack field must be set | FAIL |
| `## Acceptance Criteria` | At least 1 AC with GIVEN/WHEN/THEN | FAIL |
| `## Screens` | Required if Stack includes Web or Mobile; N/A otherwise | FAIL or N/A |
| `## Implementation Approach` > `### Architecture` | Must not be placeholder | FAIL |
| `## Implementation Approach` > `### Test Strategy` | At least one checkbox selected | FAIL |
| `## Implementation Approach` > `### File Changes` | At least 1 file path listed | FAIL |
| `## Implementation Plan` | Recommended for orchestrator mode | WARN |
| `## Dependencies` | "Blocked by" and "Blocks" fields present | FAIL |

- **If any FAIL:** Print the table with per-row status. STOP with: "Spec has N structural issue(s). Fix before implementing, or run `/review-spec $ARGUMENTS` for detailed feedback and auto-approval."
- **If only WARNs:** Print the table, proceed.
- **If all PASS:** Proceed silently.

### 1.3 Update Status

Update the spec's Status to **"In Progress"** and commit this change:
```
docs: mark spec [name] as in progress
```

### 1.4 Load Context

Based on the spec's **Stack** field:
- **Backend** → Review Java/Spring Boot conventions in CLAUDE.md
- **Web** → Review TypeScript/Next.js conventions in CLAUDE.md
- **Mobile** → Review Expo/React Native conventions in CLAUDE.md
- **Multiple** → Review all relevant conventions

### 1.5 Detect Mode

Check whether the spec contains an `## Implementation Plan` section with at least one `### Task` entry.

- **If yes → Orchestrator mode.** Report: "Spec has an Implementation Plan. Running in orchestrator mode — subagents will implement each task."
- **If no → Legacy mode.** Report: "No Implementation Plan found. Running in legacy mode — implementing directly in this session."

Proceed to Phase 2.

---

## Phase 2: Implementation Planning

### Orchestrator Mode

#### 2.1 Parse Implementation Plan

Parse the `## Implementation Plan` section. For each `### Task N:` block, extract:
- **Description** — the task heading text
- **Files** — the `- **Files:**` field (comma-separated list of relative file paths)
- **Depends on** — the `- **Depends on:**` field (task numbers or `_none_`)
- **Commit** — the `- **Commit:**` field (conventional commit message)
- **Stack** — the `- **Stack:**` field (`backend`, `web`, `mobile`, or `infra`)

Build a dependency-ordered list of tasks. Validate that all `Depends on` references point to real task numbers.

#### 2.2 Present Task Summary

Display the parsed tasks in a table:

```
## Implementation Plan — N tasks

| # | Description | Stack | Files | Commit |
|---|-------------|-------|-------|--------|
| 1 | ...         | backend | path/to/File.java | feat: ... |
| 2 | ...         | web | path/to/Component.tsx | feat: ... |
...

Proceeding in orchestrator mode.
```

Check if "Blocked by" dependencies in the spec are resolved. If blocked: STOP and notify user.

#### 2.3 Wait for Approval

Ask: **"Implementation plan ready (N tasks, orchestrator mode). Approve to proceed? (y/n)"**

- **If no:** Ask what to adjust. The user may edit the spec file directly and re-run this command.
- **If yes:** Proceed to 2.4.

#### 2.4 Create Task List

Create TaskCreate items for each task in the plan:
- **subject:** The commit message (e.g., "feat: add PokShare entity and repository")
- **activeForm:** Present continuous form (e.g., "Adding PokShare entity and repository")
- **description:** Files involved, stack, depends on

---

### Legacy Mode

#### 2.1 Analyze Existing Codebase

1. Search for files mentioned in the spec's "File Changes" section
2. Search for similar patterns or features in the codebase
3. Identify conventions to follow from existing code
4. Check if "Blocked by" dependencies are resolved

**If blocked:** STOP. Notify user: "This spec is blocked by: [list]. Implement dependencies first."

#### 2.2 Generate Implementation Plan

Present a **file-level plan** organized as:

**New Files:**
```
path/to/File — purpose, key methods/components
path/to/FileTest — test coverage, test cases from acceptance criteria
```

**Modified Files:**
```
path/to/File — what changes, which lines/methods affected
```

**Migrations (if applicable):**
```
path/to/migration.sql — schema changes
```

**Test Strategy:**
```
TDD Mode: Full | Partial | Infrastructure
Unit Tests: [count] test cases for [classes]
Integration Tests: [count] scenarios using [tools]
E2E Tests (Web only): [list of user flows covered] | None (justify why)
```

> **Web E2E rule:** If the spec adds a new page, route, or multi-step user flow, the plan MUST include E2E tests in `web/e2e/`. Omitting E2E is only acceptable for pure back-end changes, styling tweaks, or copy changes — and must be explicitly justified in the Test Strategy.

**Commit Plan:**
```
1. type: description (files involved)
2. type: description (files involved)
...
```

#### 2.3 Wait for Approval

Present the complete plan and ask:

**"Implementation plan ready. Approve to proceed? (y/n)"**

- **If no:** Ask what to adjust, regenerate plan, present again
- **If yes:** Proceed to 2.4

#### 2.4 Create Task List

After the user approves the plan, create tasks using TaskCreate for each commit in the Commit Plan. Each task should have:
- **subject:** The commit message from the plan (e.g., "feat: add Google OAuth configuration")
- **activeForm:** Present continuous form (e.g., "Adding Google OAuth configuration")
- **description:** The files involved and what changes

Mark each task as `in_progress` before starting it and `completed` when the commit is done. This provides visual progress tracking and helps with session resumability.

---

## Phase 3: Implementation

### Orchestrator Mode

#### 3.0 Build Codebase Brief

Before dispatching any subagent, scan the files mentioned across all tasks to understand current patterns. Build a concise codebase brief (1–2 paragraphs) covering:
- Key existing files and their roles
- Patterns to follow (naming conventions, error handling, test structure)
- Integration points (APIs, DB schema, shared types)
- Stack-specific notes from CLAUDE.md

This brief is compiled ONCE and included in every subagent prompt.

#### 3.1 Execute Tasks (dependency order)

For each task, in dependency order:

1. **Mark task `in_progress`** in the task list.

2. **Compose subagent prompt** using this template:

```
You are implementing Task {N} of the "{spec_name}" spec.

## Your Task
{task_heading} — {task_description_from_spec}

## Files to Create or Modify
{file_list — one per line}

## Stack
{stack} — follow {stack}-specific conventions from CLAUDE.md

## Full Spec (context — implement ONLY your task, nothing more)
{full spec content}

## Codebase Brief
{codebase_brief}

## Prior Task Outputs
{for each completed dependency task: "Task N created/modified: [file list and key additions]"}

## Implementation Rules
- Follow TDD: write the failing test first, then implement, then refactor.
- Follow ALL CLAUDE.md conventions for the {stack} stack.
- Only touch the files listed in "Files to Create or Modify" above.
- Run tests after implementation to verify they pass.
- If tests fail, fix them before finishing.
- Do NOT commit — the orchestrator handles commits.
- Return a brief summary of what you created/modified (file names and key additions).
```

3. **Spawn subagent** via the Agent tool with `subagent_type` set by stack: `sous-chef` for `backend`, `nexus` for `web`, `hedy` for `mobile`. Use `general-purpose` only for `infra` or multi-stack tasks — if using `general-purpose`, include the agent name(s) in the task description.

4. **Verify after return:**
   - Run stack-specific tests for the affected files
   - Run lint for the affected stack
   - Run build/compilation check

   ```bash
   # Backend
   cd backend && ./mvnw test -pl . -Dtest=<TestClass> -q

   # Web
   cd web && npm run lint && npm run test -- --run
   # Web E2E (only if task touched web/ files)
   (cd web && npx playwright test --reporter=line || (npx playwright install chromium && npx playwright test --reporter=line))

   # Mobile
   cd mobile && npm run test
   ```

5. **If all checks pass:**
   - Stage only the task's files: `git add [file list]`
   - Commit with the task's commit message and Claude Code footer
   - Mark task as `completed`
   - Add task's file summary to "Prior Task Outputs" for subsequent subagents

6. **If checks fail:**
   - Show the failure output to the user
   - Use AskUserQuestion to offer:
     1. Retry — spawn a new subagent for the same task with the error context appended to the prompt
     2. Skip this task — continue with remaining tasks (warn that this may break later tasks)
     3. Abort — stop here, leave partial implementation on the branch

#### 3.2 Post-Implementation Review

After ALL tasks complete, optionally delegate a holistic code review:

**If backend code was written:** Delegate to `sous-chef` agent via the Agent tool with `subagent_type: sous-chef` for review.

**If web (Next.js/TypeScript) code was written:** Delegate to `nexus` agent via the Agent tool with `subagent_type: nexus` for review.

**If mobile (Expo/React Native) code was written:** Delegate to `hedy` agent via the Agent tool with `subagent_type: hedy` for review.

**If UI/design changes were made (web or mobile):** Delegate to `pixl` agent via the Agent tool with `subagent_type: pixl` for a design/accessibility review.

If issues are found:
- Fix critical and major issues (dispatch a targeted subagent or fix directly if trivial)
- Re-run tests to confirm nothing broke

---

### Legacy Mode

#### 3.1 Infrastructure Setup (if applicable)

Only if the spec requires infrastructure work:
- Create migration scripts
- Update configuration files
- Verify infrastructure is in place

#### 3.2 TDD Cycle

**For each component in the plan, follow this cycle:**

**If Full or Partial TDD (from spec's Test Strategy):**

1. **RED** — Write the failing test first
   - Follow project testing conventions (JUnit 5 + Mockito for backend, Jest for frontend)
   - Run the test to confirm it fails

2. **GREEN** — Write minimum code to pass
   - Follow CLAUDE.md coding conventions
   - Run the test to confirm it passes

3. **REFACTOR** — Clean up while tests are green
   - Extract methods, apply patterns
   - Ensure all tests still pass

**If Infrastructure work (TDD not applicable):**
- Implement the code
- Write verification tests afterward
- Spec must have justified this in the Test Strategy section

#### 3.3 Integration Tests

1. Write integration tests mapping to Acceptance Criteria (Given/When/Then)
2. Use Testcontainers for backend database tests
3. Verify all acceptance criteria pass

#### 3.4 E2E Tests (Web features only)

**Required when the spec adds a new page, route, or user-facing flow.**

For each new user flow listed in the Test Strategy:

1. Add/extend a `web/e2e/*.spec.ts` file — group by domain (e.g., `auth.spec.ts`, `poks.spec.ts`)
2. Use `setupApiMocks(page, config)` from `web/e2e/helpers/mock-api.ts` — call it BEFORE `page.goto()`
3. Cover at minimum: **happy path** for each flow (auth state pre-configured via the mock helper)
4. For new API shapes: extend `MockConfig` and the route handler in `mock-api.ts`

Pattern:
```typescript
test('user can <action>', async ({ page }) => {
  await setupApiMocks(page, { authenticated: true, poks: [MOCK_POK] });
  await page.goto('/en/<route>');
  // interact
  await expect(page).toHaveURL(/expected-url/);
  await expect(page.getByRole(...)).toBeVisible();
});
```

Run E2E suite to confirm:
```bash
(cd web && npx playwright test --reporter=line)
```

**If E2E are not applicable** (pure backend, styling only, etc.) — document the reason explicitly in Phase 2.2 Test Strategy and proceed.

#### 3.5 Code Quality Check

**If backend code was written:** Delegate to `sous-chef` agent via the Agent tool with `subagent_type: sous-chef` for review.

**If web (Next.js/TypeScript) code was written:** Delegate to `nexus` agent via the Agent tool with `subagent_type: nexus` for review.

**If mobile (Expo/React Native) code was written:** Delegate to `hedy` agent via the Agent tool with `subagent_type: hedy` for review.

**If UI/design changes were made (web or mobile):** Delegate to `pixl` agent via the Agent tool with `subagent_type: pixl` for a design/accessibility review.

If issues are found:
- Fix critical and major issues
- Re-run tests to confirm nothing broke

---

## Phase 4: Documentation

**Delegate to `tech-writer` agent via the Agent tool with `subagent_type: tech-writer`** for applicable documentation:

**Backend (Java):**
- Javadoc on new public classes (`@author`, `@since`)
- OpenAPI/Swagger annotations on new REST endpoints

**Frontend (TypeScript):**
- JSDoc/TSDoc on new components and hooks

**Project docs (if needed):**
- Update ROADMAP.md if a milestone item was completed
- Update README.md if new user-facing features were added

---

## Phase 5: Commits (Legacy Mode only)

_In orchestrator mode, commits are made after each task in Phase 3.1. Skip this phase._

Commit in **logical units** following the commit plan from Phase 2.

For each unit:
1. Stage only the specific files for that unit (`git add [files]`)
2. Show the diff for user review
3. Commit with conventional commit message and Claude Code footer

**Do NOT create one giant commit.** Each commit should be a coherent, reviewable unit.

---

## Phase 6: Post-Implementation

### 6.1 Update Spec

1. Set Status to **"Implemented"**
2. Set Implemented date to today
3. Fill in commit hashes in the Post-Implementation Notes section

### 6.2 Capture Decisions

Prompt the user:
- "What architectural decisions were made during implementation?"
- "Were there any deviations from the original spec?"
- "Any lessons learned?"

Format their responses into the Post-Implementation Notes section.

### 6.3 Final Commit

```
docs: complete spec [name] with implementation notes
```

### 6.4 Verification

Run full verification for the relevant stack:
```bash
# Backend
cd backend && ./mvnw verify

# Web
cd web && npm run test && npm run build && (npx playwright test --reporter=line || (npx playwright install chromium && npx playwright test --reporter=line))

# Mobile
cd mobile && npm run test
```

### 6.5 Summary

Report:
- **Mode:** Orchestrator (N tasks, N subagents) | Legacy
- **Implemented:** [feature name]
- **Files:** [created/modified count]
- **Tests:** [pass/fail count]
- **Commits:** [list with hashes]
- **Acceptance Criteria:** [all checked off]
- **Spec:** Updated with implementation notes

---

## Error Handling

- **Spec not found:** Show error, list available specs in `docs/specs/`
- **Tests failing:** STOP. Show failure. Ask user to debug before continuing.
- **Approval denied:** Ask what to adjust, regenerate plan.
- **Blocked dependencies:** STOP. List blockers. Do not proceed.
- **Subagent task failure (orchestrator mode):** Show error output, offer retry / skip / abort.
