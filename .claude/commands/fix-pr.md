---
description: Implement approved items from a /review-pr triage report — fix CI/CD failures, apply review feedback, commit, push
argument-hint: <pr-number>
---

@CLAUDE.md

**PR Fix — Implement Triage Report**

Target PR: $ARGUMENTS

This command implements what `/review-pr` decided. It requires a triage report to exist.
It checks out code, makes changes, runs tests, commits, and pushes.

---

## 0. Setup

```bash
MAIN_REPO=$(git worktree list --porcelain | grep '^worktree' | head -1 | sed 's/worktree //')
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
PR_NUMBER=$ARGUMENTS
TRIAGE_FILE="$MAIN_REPO/.claude/reviews/pr-$PR_NUMBER-triage.md"
```

**Verify the triage report exists:**

```bash
test -f "$TRIAGE_FILE" && echo "Found: $TRIAGE_FILE" || echo "NOT FOUND"
```

If the file does not exist → STOP. Tell the user:
"No triage report found for PR #$PR_NUMBER. Run `/review-pr $PR_NUMBER` first."

Read the triage report now. All decisions about what to fix and what to skip come from it — do not
re-evaluate review comments from scratch.

---

## 1. Checkout PR Branch

```bash
ORIGINAL_BRANCH=$(git branch --show-current)
PR_BRANCH=$(gh pr view $PR_NUMBER --repo $REPO --json headRefName --jq .headRefName)
```

**If there are uncommitted changes**, stash them first and inform the user:
```bash
git stash push -u -m "fix-pr stash: pre-checkout"
```

```bash
git checkout "$PR_BRANCH"
```

---

## 2. Address CI/CD Failures

Work through each failure listed in the triage report.

### Test Failures

1. Run only the failing tests to reproduce:
```bash
# Backend — run by test class name
(cd backend && mvn test -Dtest="$AFFECTED_TESTS" -q)

# Web
(cd web && npm test -- --testPathPattern="<pattern>" --silent)

# Mobile
(cd mobile && npm test -- --testPathPattern="<pattern>" --silent)
```

2. Identify root cause (logic error, incorrect assertion, missing mock, stale test data).
3. Fix the implementation or the test — whichever is wrong.
4. Re-run the failing tests to confirm they pass before moving on.

### Build / Compilation Failures

```bash
# Backend
(cd backend && mvn compile -q)

# Web
(cd web && npm run build)
```

Common causes: missing import, type error, syntax error, dependency mismatch.
Fix, then re-run the build to confirm clean compilation.

### Linting / Formatting Failures

```bash
# Web — ESLint auto-fix first
(cd web && npm run lint -- --fix)
(cd web && npm run format)

# Backend — Checkstyle
(cd backend && mvn checkstyle:check -q)
```

Apply manual fixes for anything auto-fix doesn't resolve. Re-run to confirm.

### TypeScript Type Check Failures

```bash
(cd web && npx tsc --noEmit)
```

Add missing type annotations, fix incorrect types, add type guards. Re-run to confirm.

### Coverage Failures (Backend)

First, verify Docker is running (required for Testcontainers integration tests):
```bash
docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_DOWN"
```

**If DOCKER_DOWN:** STOP. Ask the user to start Docker before proceeding — without Docker,
integration tests are silently skipped via `disabledWithoutDocker = true`, leaving coverage
data incomplete and integration regressions undetected.

**If DOCKER_OK:** Delegate to the `steward` agent via the Agent tool with `subagent_type: steward`. Pass:
- The current coverage percentage and the configured threshold (check `backend/pom.xml` →
  `<jacoco-minimum-coverage>` or `<minimum>` in the JaCoCo plugin config)
- Report path: `backend/target/site/jacoco/jacoco.xml`

Wait for the agent to complete. Then verify locally:
```bash
(cd backend && mvn verify -q)
```
Re-parse `jacoco.xml` to confirm the gap is closed before committing.

---

## 3. Implement Approved Review Changes

Read the "Approved for implementation" section of the triage report. Each item has an assigned agent.
Route each group to the appropriate specialist agent via the Task tool.

### Agent Routing Table

| File pattern | Comment type | Agent |
|---|---|---|
| `backend/**` (`.java`, `pom.xml`, `application*.yml`) | Any | `sous-chef` |
| `web/**` (`.ts`, `.tsx`) | Architecture, logic, TypeScript, data fetching | `nexus` |
| `mobile/**` (`.ts`, `.tsx`) | Architecture, logic, navigation, state, storage | `hedy` |
| `web/**` or `mobile/**` | Visual design, layout, colors, spacing, accessibility | `pixl` |
| `.md`, i18n `.json`, config-only | Any | Handle inline — no agent needed |

**Classification tie-breakers:**
- Comment mentions layout, color, spacing, `className`, style props, WCAG, or accessibility → `pixl`, regardless of file
- Comment mentions component structure, TypeScript types, hooks, data fetching, or routing → `nexus` (web) or `hedy` (mobile)
- A single comment that spans both logic and design → split into two items, one per agent
- Cross-cutting comments touching both `backend/` and `web/` → run `sous-chef` then `nexus` sequentially

### Launch Agents

For each group, launch the specialist agent via the Agent tool with `subagent_type` matching the agent name from the routing table above (e.g., `subagent_type: sous-chef` for backend files). Pass:
- The exact comment text and file/line reference
- The recommendation from the triage report (accept / accept with modification — include the deviation if applicable)
- Relevant conventions from `CLAUDE.md` or the stack-specific `CLAUDE.md`

**Parallelism rules:**
- Groups touching **different files** → launch in parallel
- Groups touching **overlapping files** → run sequentially to avoid conflicts

After each agent completes:
- Review its output for correctness and convention alignment
- Verify it applied the triage recommendation, not the raw reviewer suggestion verbatim (for "accept with modification" items)
- Note which files were changed — needed for the compile + test gate below

### Compile and Test Gate

After all agents finish, run the compile gate:

```bash
# Backend
(cd backend && mvn compile test-compile -q)

# Web
(cd web && npx tsc --noEmit)

# Mobile
(cd mobile && npx tsc --noEmit)
```

**If compilation fails** → STOP immediately. Show the error. Ask user whether to revert or debug.
Skip for docs-only changes (`.md`, Javadoc, i18n `.json`).

**Targeted test run — backend:**
```bash
# AFFECTED_TESTS = comma-separated test class names for changed files
(cd backend && mvn test -Dtest="$AFFECTED_TESTS" -q)
```

**Targeted test run — web:**
```bash
(cd web && npm test -- --testPathPattern="<changed-file-pattern>" --silent)
```

**Targeted test run — mobile:**
```bash
(cd mobile && npm test -- --testPathPattern="<changed-file-pattern>" --silent)
```

**If any targeted tests fail** → STOP. Show the failure. Ask user whether to revert or debug.

**E2E regression check — Web:**

If any `web/` files were changed in Step 3, run the full Playwright suite:
```bash
(cd web && npx playwright test --reporter=line 2>&1 | tail -20)
```

If E2E tests fail → STOP. Show the failing tests. Ask user whether to revert or debug.

---

## 4. Commit and Push

```bash
git add [changed-files]

git commit -m "fix: address CI/CD failures and PR review feedback

PR #$PR_NUMBER:
- [list each CI fix]
- [list each review change]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin $PR_BRANCH
```

---

## 5. Extract and Save Coding Style Learnings

Review what each accepted fix revealed. For each one that exposes a pitfall, convention, or
anti-pattern not already documented, delegate documentation to the `tech-writer` agent via the Agent tool with `subagent_type: tech-writer`.

**What qualifies:**
- A missing annotation/config that silently breaks intended behavior (e.g., `@EnableAsync`, `@Transactional`)
- A state-machine or data-consistency pattern the team got wrong
- A performance anti-pattern that is subtle and easy to repeat (e.g., N+1 inside streams)
- A UX/API contract gap: "field X must be populated on ALL endpoints if the UI reads it"
- A test-mock update pattern (e.g., "when the service method signature changes, mock must change too")

**What does not qualify:**
- One-off fixes specific to a single class (not repeatable)
- Suggestions that were Rejected or Deferred
- Things already in CLAUDE.md

**How to delegate:** Launch `tech-writer` via the Agent tool with `subagent_type: tech-writer`. Pass the list of qualifying learnings
(one per bullet): what the pitfall is, why it matters, the correct pattern. The agent applies its
own routing rules to place each entry in the right file and section.

After the agent completes, report what was documented in the §7 Summary under "Coding Style Tips Saved".

---

## 6. Wait for CI/CD

```bash
gh pr checks $PR_NUMBER --repo $REPO --watch
```

If checks pass → proceed to summary.
If checks still fail → diagnose the new failure, repeat the relevant section above, push a follow-up commit.

---

## 7. Summary

```
## PR #XX — Fix Summary

PR: #XX (<title>)
Branch: $PR_BRANCH

### CI/CD
- ✅ All checks passing (N/N)
  OR
- ⚠️ Still failing: [list]

### CI/CD Fixes Applied (N)
- [check name] — [what was fixed]

### Review Changes Applied (N)
- [file:line] — [what was changed] — (agent: [name])

### Skipped (N)
- [file:line] — [reason: user override / Rejected in triage / Deferred]

### Requires Manual Reply (N)
- [author] — [question] — Suggested reply: [text from triage report]

### Coding Style Tips Saved (N)
- [file] — [one-line summary]

### Commits Pushed
- [commit message]

### Next Steps
1. Reply to any outstanding questions on the PR
2. Re-request review if needed
```

---

## 8. Restore Original State

```bash
git checkout "$ORIGINAL_BRANCH"
```

If changes were stashed in Step 1:
```bash
git stash pop
```

Inform the user: "Restored to branch `$ORIGINAL_BRANCH`."

---

## 9. Archive Triage Report

Mark the report as processed to prevent accidental reuse in a future run.

```bash
mv "$TRIAGE_FILE" "${TRIAGE_FILE%.md}-done.md"
```

After archiving, output this exact closing banner so the user knows the command has finished:

```
---
✅ /fix-pr complete — PR #$PR_NUMBER
---
```
