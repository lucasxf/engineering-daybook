---
description: Triage an open PR — check CI/CD status, fetch and evaluate review comments, save structured report for /fix-pr
argument-hint: <optional-pr-number>
---

@CLAUDE.md

**PR Triage — CI/CD Status + Review Comment Evaluation**

Target PR: $ARGUMENTS

This command is read-only with respect to repository contents — no code is changed, no branches are
checked out, nothing is committed. PR metadata (title, body) may be updated when the title or
description is missing, inadequate, or stale — but only after prompting you for confirmation.
It gathers facts, evaluates feedback, and saves a structured triage report.
Run `/fix-pr $PR_NUMBER` afterwards to implement the approved items.

Execute the following steps in order:

---

## 0. Resolve Main Repo Path

Before anything else, determine the main repo root. This is where the triage report will be saved,
regardless of whether you are running from a worktree or the main repo.

```bash
MAIN_REPO=$(git worktree list --porcelain | grep '^worktree' | head -1 | sed 's/worktree //')
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
```

Both variables are required for all subsequent steps. Confirm them before proceeding.

---

## 0B. Delta Detection — Load Prior Triage (if any)

Before fetching comments, check whether a completed triage exists for this PR:

```bash
DONE_REPORT="$MAIN_REPO/.claude/reviews/pr-$PR_NUMBER-triage-done.md"
test -f "$DONE_REPORT" && echo "Prior triage found" || echo "No prior triage — full evaluation"
```

**If the done report exists:**

1. Read it and extract the "Approved for implementation" file:line references into a **skip list**:
   - Parse every line under `### Approved for implementation` that starts with `-`
   - Extract the `path:line` token (e.g. `AuthController.java:175`, `useFeedData.ts:51`)
   - Record the done report's date for display in the output

2. Tell the user:
   ```
   Prior triage found (pr-$PR_NUMBER-triage-done.md, dated <date>).
   Addressed items will be skipped:
     - <path:line> — <summary>
     - ...
   Only new or unaddressed comments will be evaluated.
   ```

3. Carry the skip list into Step 4. Any comment whose `path:line` appears in the skip list
   **and** whose `outdated` field is `true` (GitHub detected the code changed) is treated as
   already addressed. Log it as `⏭ Previously addressed — skipping` and do not evaluate it.

   Use **both signals together** as the skip condition — `outdated: true` alone is not enough
   (GitHub can mark a comment outdated when nearby unrelated code changes). The skip list entry
   confirms we explicitly addressed it.

**If no done report exists:** proceed with a full evaluation of all non-outdated comments.

---

## 1. Select Pull Request

**If `$ARGUMENTS` is a PR number:**
- Use it directly as the target PR

**If no argument provided:**

```bash
gh pr list --state open --json number,title,headRefName,author \
  --template '{{range .}}#{{.number}} {{.title}} ({{.headRefName}}) by {{.author.login}}{{"\n"}}{{end}}'
```

- If **no open PRs** → STOP. Tell the user: "No open PRs found."
- If **exactly 1 open PR** → Auto-select it and confirm to user
- If **multiple open PRs** → Use AskUserQuestion: "Which PR would you like to triage?" with the list as options

**Assign the number to `$PR_NUMBER` before proceeding.**

---

## 1A. Check for Claude GitHub Action Review

Before fetching comments, detect whether the Claude GitHub Action's automatic PR review is currently
running or has already posted. The Action runs as `claude[bot]` and fires on every PR open/synchronize.

```bash
# Check for in-progress "Claude Code" workflow runs targeting this PR
RUNNING=$(gh api repos/$REPO/actions/runs \
  --jq "[.workflow_runs[] | select(.name == \"Claude Code\" and .status != \"completed\")] | length")
```

**If `$RUNNING > 0` (Action in progress):**

Use AskUserQuestion: "The Claude GitHub Action PR review is still running.
  - **Wait for it** (recommended) — poll every 30 s up to 5 min, then proceed. Its comments will be included.
  - **Proceed now** — continue without its comments. Any `claude[bot]` feedback posted later will be missed by this triage."

If user chooses wait: poll every 30 s:
```bash
while true; do
  STATUS=$(gh api repos/$REPO/actions/runs \
    --jq "[.workflow_runs[] | select(.name == \"Claude Code\" and .status != \"completed\")] | length")
  [ "$STATUS" -eq 0 ] && break
  echo "Still running… waiting 30s"
  sleep 30
done
```
Stop polling after 5 min (10 iterations) and warn: "Claude Action did not finish in 5 min — proceeding without waiting."

**If `$RUNNING == 0` (Action complete or not triggered):** proceed normally.

---

## 1B. Check and Enrich PR Description

```bash
gh pr view $PR_NUMBER --repo $REPO --json body,title,headRefName \
  --jq '{body: .body, title: .title, branch: .headRefName}'
```

Track outcomes in two variables (used in Step 6):
- `TITLE_OUTCOME` — one of: `updated`, `kept`, `ok`
- `DESC_OUTCOME` — one of: `updated`, `kept`, `ok`

### Title check

A title is **inadequate** if any of:
- Matches the branch name verbatim (e.g., `develop`, `feature/foo-bar`)
- Shorter than 10 characters
- Has no conventional-commit prefix (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:`)
- Is a single generic word (e.g., "Update", "Fix", "Changes")

**If title is inadequate:**

1. Fetch commits and diff stat (reuse for description check below):
```bash
gh api repos/$REPO/pulls/$PR_NUMBER/commits --jq '.[].commit.message'
gh pr diff $PR_NUMBER --repo $REPO --stat
```

2. Draft a suggested title in conventional-commit format (e.g., `feat: add spec pipeline health metric to /compile-metrics`).

3. Display to user:
```
Current title : "<current title>"
Suggested title: "<suggested title>"
```

4. Use AskUserQuestion: "The PR title looks generic or is missing a conventional-commit prefix. Update it?"
   - "Yes, use suggested title"
   - "No, keep current title"

5. If yes → `gh pr edit $PR_NUMBER --repo $REPO --title "<suggested title>"` → set `TITLE_OUTCOME=updated`
6. If no → set `TITLE_OUTCOME=kept`

**If title is adequate:** set `TITLE_OUTCOME=ok`, proceed.

---

### Description check

A description is **missing or inadequate** if:
- Empty or only whitespace
- A single generic line (e.g., "Develop", "fix", "update")
- Shorter than ~100 characters with no structure (no bullets, no headings)

**If description is inadequate:**

1. Use commits and diff stat already fetched above (or fetch now if title was adequate and they weren't fetched yet).

2. Draft a suggested description:
```markdown
## Summary
- [Bullet per significant area — what + why]

## Test plan
- [ ] CI/CD passes
- [ ] [Feature-specific check]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

3. Display the draft to the user:
```
The PR description is missing or too thin. Here is a suggested description:

---
<rendered draft>
---
```

4. Use AskUserQuestion: "Update the PR description with this draft?"
   - "Yes, use suggested description"
   - "No, keep current description"

5. If yes → `gh pr edit $PR_NUMBER --repo $REPO --body "<suggested body>"` → set `DESC_OUTCOME=updated`
6. If no → set `DESC_OUTCOME=kept`

**If description is already comprehensive:** set `DESC_OUTCOME=ok`, proceed.

---

## 1C. Validate Description Accuracy (Staleness Check)

> Even a long description can be stale if earlier commits were reverted or if this is an aggregated
> merge PR (e.g., `develop → main`) written when it had fewer commits.
> Skip this step if `DESC_OUTCOME` is already `updated` or `kept` from Step 1B.

```bash
gh api repos/$REPO/pulls/$PR_NUMBER/commits --jq '[.[].commit.message] | join("\n")'
gh pr diff $PR_NUMBER --repo $REPO --stat
```

A description is **stale** if it:
- Mentions features not present in the current diff
- Omits significant areas visible in commits/diff
- Describes a single-feature branch when commits show an aggregated merge

**If stale:**

1. Draft a replacement that reflects the actual commits (same template as Step 1B).

2. Tell the user what is stale (e.g., "Description mentions feature X which is no longer in the diff; omits N new areas"):
```
The PR description appears stale. Here is a suggested update:

---
<rendered draft>
---
```

3. Use AskUserQuestion: "The PR description looks outdated relative to current commits. Replace it?"
   - "Yes, replace with updated description"
   - "No, keep current description"

4. If yes → `gh pr edit $PR_NUMBER --repo $REPO --body "<replacement body>"` → set `DESC_OUTCOME=updated`
5. If no → set `DESC_OUTCOME=kept`

**If accurate:** set `DESC_OUTCOME=ok`, proceed.

---

## 1D. Check Merge Conflicts

```bash
MERGEABLE=$(gh pr view $PR_NUMBER --repo $REPO --json mergeable --jq .mergeable)
BASE_BRANCH=$(gh pr view $PR_NUMBER --repo $REPO --json baseRefName --jq .baseRefName)
PR_BRANCH=$(gh pr view $PR_NUMBER --repo $REPO --json headRefName --jq .headRefName)
```

| State | Meaning |
|-------|---------|
| `MERGEABLE` | ✅ No conflicts — proceed |
| `CONFLICTING` | ❌ Has merge conflicts — identify files |
| `UNKNOWN` | ⏳ GitHub still computing — wait 5 s and retry (up to 3 times) |

**If `UNKNOWN`:** poll every 5 s, up to 3 retries:
```bash
for i in 1 2 3; do
  sleep 5
  MERGEABLE=$(gh pr view $PR_NUMBER --repo $REPO --json mergeable --jq .mergeable)
  [ "$MERGEABLE" != "UNKNOWN" ] && break
done
```
If still `UNKNOWN` after 3 retries, run the local merge-tree check (same as the `CONFLICTING` path below)
to attempt a definitive answer. If conflicts are found, treat as `CONFLICTING`; if no conflicts are
found, treat as `MERGEABLE`. In either case, note "conflict status was UNKNOWN — resolved via local
merge-tree check" in the report.

**If `CONFLICTING`:**

Identify the conflicting files. Try the newer two-tree `git merge-tree` form first (git ≥ 2.38),
which outputs `CONFLICT` lines directly without touching the working tree:
```bash
git fetch origin "$BASE_BRANCH" "$PR_BRANCH" --quiet
CONFLICTING_FILES=$(git merge-tree "origin/$BASE_BRANCH" "origin/$PR_BRANCH" 2>/dev/null \
  | grep '^CONFLICT' | sed 's/.*Merge conflict in //' | sort -u)
```

If `git merge-tree` produces no output (older git) or the result is empty, fall back to a
temp-worktree dry run:
```bash
TEMP=$(mktemp -d)
git worktree add "$TEMP" "origin/$PR_BRANCH" --quiet 2>/dev/null
git -C "$TEMP" merge --no-commit --no-ff "origin/$BASE_BRANCH" 2>/dev/null || true
CONFLICTING_FILES=$(git -C "$TEMP" diff --name-only --diff-filter=U | sort -u)
git -C "$TEMP" merge --abort 2>/dev/null || true
git worktree remove "$TEMP" --force 2>/dev/null || true
```

Record in the triage report:
- `CONFLICT_STATUS`: `CONFLICTING` (with file list) or `MERGEABLE`
- `CONFLICTING_FILES`: one file path per line

Tell the user:
```
⚠️ Merge conflicts detected in $PR_BRANCH vs $BASE_BRANCH:
  - <file1>
  - <file2>
These will be listed in the triage report and resolved by /fix-pr.
```

**If `MERGEABLE`:** set `CONFLICT_STATUS=MERGEABLE`, proceed silently.

---

## 2. Check CI/CD Pipeline Status

```bash
gh pr checks $PR_NUMBER --repo $REPO --json name,state,link
```

| State | Meaning |
|-------|---------|
| `pass` | ✅ Passing — no action needed |
| `fail` | ❌ Failed — classify and log |
| `pending` | 🔄 Running — note as in-progress |
| `skipping` | ⚠️ Skipped — note, usually no action needed |

**For each failed check, classify the failure type:**
- **Test failure** — unit, integration, or E2E tests
- **Build/compilation** — compile error, dependency issue
- **Linting/formatting** — ESLint, Checkstyle, Prettier
- **Type checking** — TypeScript tsc, Java compilation
- **Coverage** — JaCoCo threshold not met
- **Security scan** — dependency vulnerabilities

**Fetch detailed logs for each failed check:**

```bash
HEAD_SHA=$(gh pr view $PR_NUMBER --repo $REPO --json headRefOid --jq .headRefOid)
gh api repos/$REPO/commits/$HEAD_SHA/check-runs \
  --jq '.check_runs[] | {name: .name, id: .id, conclusion: .conclusion, url: .html_url}'
```

For each failed check run, fetch its logs to extract specific error messages, test names, and
file/line references. This detail goes directly into the triage report.

---

## 3. Fetch All Review Comments

Collect from three sources in parallel:

```bash
gh api repos/$REPO/issues/$PR_NUMBER/comments --paginate \
  > /tmp/pr_issue_comments.json &
gh api repos/$REPO/pulls/$PR_NUMBER/comments --paginate \
  --jq '.[] | {id: .id, user: .user.login, path: .path, line: .line,
               original_line: .original_line, body: .body, outdated: .outdated}' \
  > /tmp/pr_inline_comments.json &
gh api repos/$REPO/pulls/$PR_NUMBER/reviews --paginate \
  > /tmp/pr_reviews.json &
wait
echo "=== ISSUE COMMENTS ===" && cat /tmp/pr_issue_comments.json && echo "=== INLINE COMMENTS ===" && cat /tmp/pr_inline_comments.json && echo "=== REVIEWS ===" && cat /tmp/pr_reviews.json
```

**Filter out noise:**
- Exclude bots: `release-please`, `dependabot`, `github-actions`, `vercel[bot]`
- Keep: `Copilot`, `copilot-pull-request-reviewer[bot]`, `chatgpt-codex-connector[bot]`, human reviewers
- **Special handling for `claude[bot]`** — do NOT exclude. Tag these comments with `source: claude-action`
  so Step 4 can apply a lightweight fast-path instead of full four-axis evaluation.
- Exclude empty review bodies (approvals without comment)
- Note the `outdated` field on each inline comment — used in Step 4 for delta detection

---

## 4. Evaluate Each Review Comment

**Before evaluating, apply the delta skip check for each inline comment:**

If BOTH of the following are true, mark the comment as `⏭ Previously addressed — skipping` and
move on without evaluating it:
1. The comment's `outdated` field is `true` (GitHub detected the diff hunk changed since the comment was posted)
2. The comment's `path:line` (or `path:original_line` if `line` is null) appears in the skip list loaded in Step 0B

Log skipped comments in the triage report under a `### Previously addressed (skipped)` section
so there is a clear audit trail. Include: file:line, author, original comment summary, skip reason.

If only one signal is present — outdated but not in the skip list, or in the skip list but not
outdated — **do not skip**. Evaluate normally and note the discrepancy.

**Delegate evaluation of all remaining comments to the `keepr` agent via the Agent tool with `subagent_type: keepr`.**

Pass to keepr:
- The full list of non-skipped comments (file:line, author, body, outdated flag)
- `$REPO` so keepr can read source files for context

keepr returns grouped results (Accept / Accept with modification / Reject / Defer / Questions /
Informational) with classification, rationale, agent assignment, and trade-off analysis for grey
areas. Use its output directly in Step 5 and the triage report.

---

## 5. Present Evaluation to User

Read the presentation format template:
```
Read: .claude/templates/review-pr-presentation.md
```

Display one entry per comment, grouped by recommendation using that format.

**Ask user to confirm before saving the report.** Use AskUserQuestion with multiSelect:
- "Accept" items pre-selected
- "Accept with modification" items with the modification described
- "Reject" items with reason — allow user to override
- "Defer" items — allow user to escalate to this PR

---

## 6. Save Triage Report

This step is mandatory. Do not skip it.

```bash
mkdir -p "$MAIN_REPO/.claude/reviews"
TRIAGE_FILE="$MAIN_REPO/.claude/reviews/pr-$PR_NUMBER-triage.md"
```

Read the report structure template:
```
Read: .claude/templates/review-pr-report.md
```

Write the triage report to `$TRIAGE_FILE` using the Write tool (not bash redirection), following that structure.

After saving, confirm to the user:

```
Triage report saved → <absolute path to TRIAGE_FILE>

Next step: /fix-pr $PR_NUMBER
```

## Step 6.5: Extract Verdict Metrics

Parse the triage report and append verdict counts to the current session delta file:

```bash
python3 .claude/scripts/extract_triage_metrics.py "$TRIAGE_FILE"
```

After the confirmation, output this exact closing banner so the user knows the command has finished:

```
---
✅ /review-pr complete — triage saved for PR #$PR_NUMBER
---
```
