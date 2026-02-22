---
description: Review and address feedback and CI/CD failures on an open pull request
argument-hint: <optional-pr-number>
---

@CLAUDE.md

**Address PR Review Feedback & CI/CD Failures**

Target PR: $ARGUMENTS

Execute the following steps in order:

## 1. Select Pull Request

**If `$ARGUMENTS` is a PR number:**
- Use it directly as the target PR

**If no argument provided:**

```bash
# List open PRs
gh pr list --state open --json number,title,headRefName,author --template '{{range .}}#{{.number}} {{.title}} ({{.headRefName}}) by {{.author.login}}{{"\n"}}{{end}}'
```

- If **no open PRs** → STOP. Tell the user: "No open PRs found."
- If **exactly 1 open PR** → Auto-select it and confirm to user
- If **multiple open PRs** → Use AskUserQuestion to prompt: "Which PR would you like to address?" with the list of PRs as options

**After selecting the PR, assign the number to `$PR_NUMBER` before proceeding.** All subsequent steps depend on this variable being set.

## 1B. Check and Enrich PR Description

**Get the current PR body:**

```bash
gh pr view $PR_NUMBER --repo $REPO --json body,title,commits --jq '{body: .body, title: .title}'
```

**Evaluate the body:**

A PR description is considered **missing or inadequate** if any of these are true:
- The body is empty or only whitespace
- The body is a single generic line (e.g., "Develop", "fix", "update")
- The body is shorter than ~100 characters with no structure (no bullets, no headings)

**If the description is missing or inadequate:**

1. Fetch the commits and diff to understand what the PR contains:

```bash
# List commits in the PR
gh api repos/$REPO/pulls/$PR_NUMBER/commits --jq '.[].commit.message'

# Get the PR diff summary (files changed)
gh pr diff $PR_NUMBER --stat
```

2. Analyze the commits and file changes to draft a comprehensive description following this format:

```markdown
## Summary

- [Bullet point per significant area of change]
- [Each bullet is 1-2 sentences, describes the what + why]

## Test plan

- [ ] CI/CD passes (backend tests, web tests, build)
- [ ] [Feature-specific check]
- [ ] [Feature-specific check]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

3. Update the PR with the generated description AND a meaningful title (if the current title is also generic):

```bash
gh pr edit $PR_NUMBER --repo $REPO --title "<meaningful title>" --body "<generated body>"
```

4. Inform the user: "PR #XX was missing a description — I've added one based on the commits and diff."

**If the description is already comprehensive:** Skip this step and proceed.

---

## 2. Check CI/CD Pipeline Status

**Get PR checks status:**

```bash
# Get all check runs for the PR (use `state` and `link`; `status`/`conclusion`/`detailsUrl` are not valid JSON fields)
gh pr checks $PR_NUMBER --json name,state,link
```

**Analyze the results:**

| State | Meaning | Action |
|-------|---------|--------|
| `pass` | ✅ Passing | No action needed |
| `fail` | ❌ Failed | Investigate and fix |
| `pending` | 🔄 Running/Queued | Wait or proceed with review comments |
| `skipping` | ⚠️ Skipped | Usually no action needed |

**If any checks failed:**

1. Display failed checks to user with links to logs
2. For each failed check, determine the type:
   - **Build failure** (compilation error, dependency issue)
   - **Test failure** (unit tests, integration tests, e2e tests)
   - **Linting/Formatting** (ESLint, Checkstyle, Prettier)
   - **Type checking** (TypeScript, Java compilation)
   - **Security scan** (dependency vulnerabilities)
   - **Coverage** (test coverage below threshold) — see §3A.5 for the fast JaCoCo-first path

3. **Fetch detailed logs** for failed checks:

```bash
# Get the latest workflow run for this PR
WORKFLOW_RUN=$(gh api repos/{owner}/{repo}/commits/$(gh pr view $PR_NUMBER --json headRefOid --jq .headRefOid)/check-runs --jq '.check_runs[0].id')

# Get workflow logs (may require parsing)
gh api repos/{owner}/{repo}/actions/runs/$WORKFLOW_RUN/logs
```

4. **Parse logs to identify specific failures:**
   - Extract test names that failed
   - Extract error messages
   - Extract file paths and line numbers

**Present CI/CD status to user:**

```
## PR #XX — CI/CD Status

### ❌ Failed Checks (N)
- **Backend Tests** — 3 tests failed
  - `PokServiceTest.testCreate` — NullPointerException at line 42
  - `PokControllerTest.testUpdate` — Expected 200, got 404
  - `PokRepositoryTest.testSoftDelete` — Assertion failed
  Details: https://github.com/.../actions/runs/123

- **Web Build** — TypeScript compilation error
  - `src/components/poks/PokForm.tsx:85` — Type 'string | undefined' is not assignable
  Details: https://github.com/.../actions/runs/124

### ✅ Passing Checks (N)
- ESLint
- Checkstyle
- Build (mobile)

### 🔄 In Progress (N)
- E2E Tests (running)
```

**Ask user:** "Do you want to address CI/CD failures first, or review comments first?"

Use AskUserQuestion with options:
- **Fix CI/CD failures first** — Address pipeline issues before review comments
- **Address review comments first** — Fix code review feedback before CI/CD
- **Address both in parallel** — Handle CI/CD and review comments together

## 3. Checkout PR Branch

```bash
# Get PR branch name (requires $PR_NUMBER from Step 1)
PR_BRANCH=$(gh pr view $PR_NUMBER --json headRefName --jq .headRefName)

# Checkout the branch
git checkout "$PR_BRANCH"
```

If there are uncommitted changes, stash them first and inform the user. **Track the original branch name so we can return to it later.**

## 3A. Address CI/CD Failures (If User Selected This Option)

**For each failed check:**

### 3A.1. Test Failures

**If tests failed:**

1. **Run tests locally** to reproduce:
```bash
# Backend
(cd backend && ./mvnw test)

# Web
(cd web && npm test)

# Mobile
(cd mobile && npm test)
```

2. **Analyze failures:**
   - Read test file and implementation
   - Identify root cause (logic error, incorrect assertion, missing mock, etc.)
   - Check if related to recent changes in the PR

3. **Fix the issue:**
   - Update implementation code if logic is wrong
   - Fix test assertions if expectations are incorrect
   - Add missing mocks or test data
   - Update test setup if configuration changed

4. **Verify fix locally:**
   - Re-run failed tests
   - Ensure all tests pass before committing

### 3A.2. Build/Compilation Failures

**If build failed:**

1. **Run build locally:**
```bash
# Backend
(cd backend && ./mvnw compile)

# Web
(cd web && npm run build)
```

2. **Common issues:**
   - **Missing import** → Add the import
   - **Type error** → Fix type annotations or casts
   - **Syntax error** → Fix the syntax
   - **Dependency issue** → Update package.json or pom.xml
   - **Circular dependency** → Refactor imports

3. **Fix and verify:**
   - Apply the fix
   - Run build again
   - Ensure clean build

### 3A.3. Linting/Formatting Failures

**If linting failed:**

1. **Run linter locally:**
```bash
# Web (ESLint)
(cd web && npm run lint)

# Backend (Checkstyle)
(cd backend && ./mvnw checkstyle:check)
```

2. **Auto-fix if possible:**
```bash
# ESLint auto-fix
(cd web && npm run lint -- --fix)

# Prettier auto-fix
(cd web && npm run format)
```

3. **Manual fixes if needed:**
   - Read the linting error
   - Apply the required code style change
   - Re-run linter to verify

### 3A.4. Type Checking Failures

**If TypeScript type check failed:**

1. **Run type check locally:**
```bash
(cd web && npx tsc --noEmit)
```

2. **Fix type errors:**
   - Add missing type annotations
   - Fix incorrect types
   - Add type guards or assertions
   - Update TypeScript configuration if needed

### 3A.5. Coverage Failures

**If CI is failing due to test coverage (backend):**

> **Start here before running any tests locally.** JaCoCo reports are already generated by CI and available locally after the last Maven run — reading them is faster than re-running the full suite.

1. **Check the JaCoCo XML report first:**

```bash
# Parse the coverage report to find classes with the most missed lines
python3 -c "
import xml.etree.ElementTree as ET, sys
tree = ET.parse('backend/target/site/jacoco/jacoco.xml')
root = tree.getroot()

# Bundle totals
print('=== Bundle Totals ===')
for c in root.findall('counter'):
    missed = int(c.get('missed', 0))
    covered = int(c.get('covered', 0))
    total = missed + covered
    pct = (covered / total * 100) if total else 0
    print(f'{c.get(\"type\"):15} {covered}/{total} ({pct:.1f}%)')

# Per-class breakdown (worst first)
print()
print('=== Classes by Missed Lines (worst first) ===')
classes = []
for cls in root.findall('package/class'):
    for c in cls.findall('counter[@type=\"LINE\"]'):
        missed = int(c.get('missed', 0))
        covered = int(c.get('covered', 0))
        if missed > 0:
            classes.append((missed, cls.get('name'), covered))
for missed, name, covered in sorted(classes, reverse=True)[:20]:
    print(f'  missed={missed:4d}  covered={covered:4d}  {name}')
"
```

   If the XML doesn't exist yet (first run on this branch), generate it:

```bash
(cd backend && mvn jacoco:report -q)
```

2. **Identify the gap:** Compare the bundle totals against the configured threshold (check `backend/pom.xml` for `<jacoco-minimum-coverage>` or the `<minimum>` rule in the JaCoCo plugin config).

3. **Open the HTML report for visual inspection if needed:**

   `backend/target/site/jacoco/index.html` — drill into packages and classes with red/yellow coverage bars.

4. **Write targeted tests** for the classes with the most missed lines:
   - Read the class under test and its existing test file (if any)
   - Add tests covering the uncovered branches/lines
   - Follow project test conventions: JUnit 5 + Mockito for unit tests, Testcontainers for integration tests

5. **Verify coverage locally:**

```bash
(cd backend && mvn verify -q)
```

   Re-parse `jacoco.xml` to confirm the gap is closed before committing.

### 3A.6. Commit and Push CI/CD Fixes

```bash
# Stage changed files
git add [changed-files]

# Commit with descriptive message
git commit -m "fix: resolve CI/CD pipeline failures

Fixed:
- [list of specific failures addressed]
- [test names or build errors fixed]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to PR branch
git push origin $PR_BRANCH
```

**Wait for CI/CD to re-run and verify fixes:**

```bash
# Watch CI/CD status
gh pr checks $PR_NUMBER --watch
```

If checks still fail, repeat the analysis and fix process.

---

## 4. Fetch All Review Comments

Collect comments from three GitHub API sources:

```bash
# Get repository owner/repo
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

# Top-level PR conversation comments
gh api repos/$REPO/issues/$PR_NUMBER/comments --paginate

# Inline code review comments (attached to specific lines)
gh api repos/$REPO/pulls/$PR_NUMBER/comments --paginate

# Review summaries (approve/request changes/comment with body text)
gh api repos/$REPO/pulls/$PR_NUMBER/reviews --paginate
```

**Filter out noise:**
- Exclude bots: release-please, dependabot, github-actions
- Keep: GitHub Copilot, human reviewers, Claude
- Exclude empty review bodies (e.g., approval without comment)

## 5. Analyze and Categorize Comments

For each comment, read the referenced file and surrounding code context (for inline comments), then classify:

| Category | Description | Icon |
|----------|-------------|------|
| **Actionable fix** | Code change needed (bug, style, convention, security) | :wrench: |
| **Suggestion** | Optional improvement, worth considering | :bulb: |
| **Question** | Needs a reply, not a code change | :question: |
| **Informational** | No action needed (praise, acknowledgment, FYI) | :information_source: |

**Claude's recommendation per comment:**

Cross-reference each comment against:
- **CLAUDE.md** coding conventions and directives
- **Project patterns** in the existing codebase
- **Spec files** in `docs/specs/` if relevant

Then recommend one of:
- **Accept** — Comment aligns with project conventions; implement it
- **Ignore** — Comment contradicts a project directive or convention (explain why, e.g., "This suggestion conflicts with our constructor injection convention per CLAUDE.md")
- **Defer** — Valid but low-priority; can be addressed in a follow-up

## 6. Present Plan to User

Display the categorized list grouped by priority:

```
## PR #XX Review Feedback — Action Plan

### Actionable Fixes (N items)
- [ ] [Accept] :wrench: **file.java:42** — "Use constructor injection instead of @Autowired" (by copilot)
      → Recommendation: Accept — aligns with CLAUDE.md convention

### Suggestions (N items)
- [ ] [Defer] :bulb: **file.java:15** — "Consider extracting this to a utility method" (by copilot)
      → Recommendation: Defer — single usage, premature abstraction per project guidelines

### Questions (N items)
- [ ] :question: **PR comment** — "Why did you choose bcrypt over argon2?" (by reviewer)
      → Note: Requires a manual reply on the PR

### Informational (N items)
- :information_source: "Great use of records for DTOs!" (by copilot)
      → No action needed
```

**Ask user:** "Which items would you like to implement? You can override any recommendation."

Use AskUserQuestion with multiSelect to let the user pick which actionable items and suggestions to implement.

## 7. Implement Approved Items

For each approved item:
1. Read the target file
2. Apply the change following project conventions (CLAUDE.md)
3. After all changes are applied, run relevant tests:

```bash
# If backend files were changed (run in subshell to avoid directory leaking)
(cd backend && ./mvnw test -q)

# If web files were changed (run in subshell to avoid directory leaking)
(cd web && npm test --silent)
```

**If tests fail** → STOP. Show the failure. Ask user whether to revert or debug.

## 8. Commit and Push Review Comment Fixes

```bash
# Stage only the changed files
git add [changed-files]

# Commit with descriptive message
git commit -m "fix: address PR review feedback

Addressed review comments on PR #$PR_NUMBER:
- [list of changes made]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# Push to the PR branch
git push origin $PR_BRANCH
```

## 9. Summary

```
## PR #XX Review & CI/CD — Summary

PR: #XX (title)
Branch: $PR_BRANCH

### CI/CD Status
- ✅ All checks passing (N/N)
  OR
- ⚠️ Still failing (N/N) — [list failures]

### CI/CD Fixes Applied (N)
- :wrench: Fixed PokServiceTest.testCreate — Added missing null check
- :wrench: Fixed TypeScript error in PokForm.tsx:85 — Added type assertion
- :wrench: Fixed ESLint errors — Ran auto-fix

### Review Comment Fixes Applied (N)
- :white_check_mark: file.java:42 — Used constructor injection
- :white_check_mark: file.java:15 — Extracted utility method

### Skipped (N)
- :fast_forward: file.java:80 — reason (user chose to skip / contradicts convention)

### Requires Manual Reply (N)
- :speech_balloon: PR comment by @reviewer — "question text..."

### Commits Pushed
- fix: resolve CI/CD pipeline failures (if applicable)
- fix: address PR review feedback (if applicable)

### Next Steps
1. Wait for CI/CD checks to complete: `gh pr checks $PR_NUMBER --watch`
2. Review the pushed changes on the PR
3. Reply to any outstanding questions on the PR
4. Re-request review if needed
```

## 10. Restore Original State

If changes were stashed in Step 2:
```bash
# Return to the original branch
git checkout $ORIGINAL_BRANCH

# Restore stashed changes
git stash pop
```

Inform the user that their stashed changes have been restored.
