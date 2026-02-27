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

### 1.2 Check Status

1. Read the spec's Status field
2. **If "Implemented":** STOP. Ask: "This spec is already implemented. Re-implement? (y/n)"
3. **If "Draft":** Ask: "Spec is in Draft. Has it been reviewed? Consider using the `virgil` agent first."
4. **If "Approved" or user confirms:** Proceed

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

---

## Phase 2: Implementation Planning

### 2.1 Analyze Existing Codebase

1. Search for files mentioned in the spec's "File Changes" section
2. Search for similar patterns or features in the codebase
3. Identify conventions to follow from existing code
4. Check if "Blocked by" dependencies are resolved

**If blocked:** STOP. Notify user: "This spec is blocked by: [list]. Implement dependencies first."

### 2.2 Generate Implementation Plan

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

### 2.3 Wait for Approval

Present the complete plan and ask:

**"Implementation plan ready. Approve to proceed? (y/n)"**

- **If no:** Ask what to adjust, regenerate plan, present again
- **If yes:** Proceed to Phase 2.4

### 2.4 Create Task List

After the user approves the plan, create tasks using TaskCreate for each commit in the Commit Plan. Each task should have:
- **subject:** The commit message from the plan (e.g., "feat: add Google OAuth configuration")
- **activeForm:** Present continuous form (e.g., "Adding Google OAuth configuration")
- **description:** The files involved and what changes

Mark each task as `in_progress` before starting it and `completed` when the commit is done. This provides visual progress tracking and helps with session resumability.

---

## Phase 3: TDD Implementation

### 3.1 Infrastructure Setup (if applicable)

Only if the spec requires infrastructure work:
- Create migration scripts
- Update configuration files
- Verify infrastructure is in place

### 3.2 TDD Cycle

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

### 3.3 Integration Tests

1. Write integration tests mapping to Acceptance Criteria (Given/When/Then)
2. Use Testcontainers for backend database tests
3. Verify all acceptance criteria pass

### 3.4 E2E Tests (Web features only)

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

### 3.5 Code Quality Check

**If backend code was written:** Delegate to `sous-chef` agent for review.

**If web (Next.js/TypeScript) code was written:** Delegate to `nexus` agent for review.

**If mobile (Expo/React Native) code was written:** Delegate to `hedy` agent for review.

**If UI/design changes were made (web or mobile):** Delegate to `pixl` agent for a design/accessibility review.

If issues are found:
- Fix critical and major issues
- Re-run tests to confirm nothing broke

---

## Phase 4: Documentation

**Delegate to `tech-writer` agent** for applicable documentation:

**Backend (Java):**
- Javadoc on new public classes (`@author`, `@since`)
- OpenAPI/Swagger annotations on new REST endpoints

**Frontend (TypeScript):**
- JSDoc/TSDoc on new components and hooks

**Project docs (if needed):**
- Update ROADMAP.md if a milestone item was completed
- Update README.md if new user-facing features were added

---

## Phase 5: Commits

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
cd web && npm run test && npm run build

# Mobile
cd mobile && npm run test
```

### 6.5 Summary

Report:
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
