---
description: Review and address feedback on an open pull request
argument-hint: <optional-pr-number>
---

@CLAUDE.md

**Address PR Review Feedback**

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

## 2. Checkout PR Branch

```bash
# Get PR branch name (requires $PR_NUMBER from Step 1)
PR_BRANCH=$(gh pr view $PR_NUMBER --json headRefName --jq .headRefName)

# Checkout the branch
git checkout "$PR_BRANCH"
```

If there are uncommitted changes, stash them first and inform the user. **Track the original branch name so we can return to it later.**

## 3. Fetch All Review Comments

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

## 4. Analyze and Categorize Comments

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

## 5. Present Plan to User

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

## 6. Implement Approved Items

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

## 7. Commit and Push

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

## 8. Summary

```
## PR Review Feedback — Summary

PR: #XX (title)
Branch: $PR_BRANCH

### Implemented (N)
- :white_check_mark: file.java:42 — description of fix
- :white_check_mark: file.java:15 — description of fix

### Skipped (N)
- :fast_forward: file.java:80 — reason (user chose to skip / contradicts convention)

### Requires Manual Reply (N)
- :speech_balloon: PR comment by @reviewer — "question text..."

### Next Steps
1. Review the pushed changes on the PR
2. Reply to any outstanding questions on the PR
3. Re-request review if needed
```

## 9. Restore Original State

If changes were stashed in Step 2:
```bash
# Return to the original branch
git checkout $ORIGINAL_BRANCH

# Restore stashed changes
git stash pop
```

Inform the user that their stashed changes have been restored.
