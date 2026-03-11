---
description: Triage an open PR — check CI/CD status, fetch and evaluate review comments, save structured report for /fix-pr
argument-hint: <optional-pr-number>
---

@CLAUDE.md

**PR Triage — CI/CD Status + Review Comment Evaluation**

Target PR: $ARGUMENTS

This command is read-only with respect to repository contents — no code is changed, no branches are
checked out, nothing is committed. PR metadata (title, body) may be updated as part of triage when
the description is missing or stale. It gathers facts, evaluates feedback, and saves a structured
triage report. Run `/fix-pr $PR_NUMBER` afterwards to implement the approved items.

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
gh pr view $PR_NUMBER --repo $REPO --json body,title --jq '{body: .body, title: .title}'
```

A description is **missing or inadequate** if:
- Empty or only whitespace
- A single generic line (e.g., "Develop", "fix", "update")
- Shorter than ~100 characters with no structure (no bullets, no headings)

**If inadequate:**

1. Fetch commits and diff:
```bash
gh api repos/$REPO/pulls/$PR_NUMBER/commits --jq '.[].commit.message'
gh pr diff $PR_NUMBER --repo $REPO --stat
```

2. Draft a description:
```markdown
## Summary
- [Bullet per significant area — what + why]

## Test plan
- [ ] CI/CD passes
- [ ] [Feature-specific check]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

3. Update the PR:
```bash
gh pr edit $PR_NUMBER --repo $REPO --title "<meaningful title>" --body "<generated body>"
```

4. Note in the triage report: "Description was missing — generated from commits and diff."

**If already comprehensive:** proceed.

---

## 1C. Validate Description Accuracy (Staleness Check)

> Even a long description can be stale if earlier commits were reverted or if this is an aggregated
> merge PR (e.g., `develop → main`) written when it had fewer commits.

```bash
gh api repos/$REPO/pulls/$PR_NUMBER/commits --jq '[.[].commit.message] | join("\n")'
gh pr diff $PR_NUMBER --repo $REPO --stat
```

A description is **stale** if it:
- Mentions features not present in the current diff
- Omits significant areas visible in commits/diff
- Describes a single-feature branch when commits show an aggregated merge

**If stale:** update with a replacement that reflects the actual commits. Note in the triage report.
**If accurate:** proceed.

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

Collect from three sources:

```bash
# Top-level PR conversation comments
gh api repos/$REPO/issues/$PR_NUMBER/comments --paginate

# Inline code review comments — include the outdated field for delta detection
gh api repos/$REPO/pulls/$PR_NUMBER/comments --paginate \
  --jq '.[] | {id: .id, user: .user.login, path: .path, line: .line,
               original_line: .original_line, body: .body, outdated: .outdated}'

# Review summaries (approve / request changes / comment with body)
gh api repos/$REPO/pulls/$PR_NUMBER/reviews --paginate
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

Display one entry per comment, grouped by recommendation:

```
## PR #XX — Triage

### CI/CD: ❌ N failures / ✅ All passing
[Each failure: check name — type — specific error — log link]

### Review Comments

#### Accept (N)
- :wrench: **AuthController.java:42** (by copilot) — "Use constructor injection instead of @Autowired"
  Evaluation: Correct. Matches CLAUDE.md §Coding Conventions — constructor injection only.
  Agent: sous-chef

- :bug: **PokService.java:88** (by reviewer) — "This will NPE when tags is null"
  Evaluation: Confirmed — pok.getTags() is nullable per the domain model; calling .stream() without
  a null check will throw at runtime when a POK has no tags.
  Agent: sous-chef

#### Accept with modification (N)
- :bulb: **api.ts:31** (by copilot) — "Extract silentRefresh to a shared utility"
  Evaluation: Identifies real duplication. However, the suggested location creates a circular import.
  Fix: inline the duplicate in api.ts instead of extracting to a new file.
  Agent: nexus

#### Reject (N)
- :bulb: **AuthService.java:60** (by copilot) — "Consider adding @Transactional to this method"
  Trade-off analysis:
    FOR applying: Protects against partial writes if a second DB call is added later.
    AGAINST applying: One DB call today — zero partial-write risk. CLAUDE.md: don't guard scenarios
    that can't happen.
  Verdict: Reject — revisit if method gains a second DB call.

#### Defer (N)
- :bulb: **PokRepository.java:15** (by copilot) — "Extract this query to a named @Query constant"
  Evaluation: Valid style improvement. No established pattern for named queries yet — one method
  doesn't justify it.
  Recommendation: Defer to when query count makes a consistent pattern worthwhile.

#### Questions — requires manual reply (N)
- :question: **PR comment** (by @reviewer) — "Why did you choose bcrypt over argon2?"
  Suggested reply: bcrypt is Spring Security's default and well-tested in production; argon2 has no
  practical advantage at current user scale.

#### From Claude Action — auto-verified (N)
- :wrench: **AuthController.java:175** (by claude[bot]) — "Use constructor injection"
  Auto-verified: aligns with CLAUDE.md §Coding Conventions.

- :bug: **PokService.java:42** (by claude[bot]) — "Null check missing before stream()"
  Full evaluation required — CONFLICTS with existing null-safe wrapper pattern.
  Verdict: Reject — see NullSafeCollections utility at PokService.java:12.

#### Informational — no action (N)
- :information_source: "Great use of records for DTOs!" (by copilot)
```

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

Write the triage report to `$TRIAGE_FILE` using the Write tool (not bash redirection).

The report must include:

```markdown
# PR #XX Triage — <PR title>

**Branch:** <headRefName>
**Date:** <today>
**Repo:** <REPO>

## PR Description
- Status: [Generated / Updated / Already accurate]

## CI/CD
- Overall: [✅ All passing | ❌ N failures]
- Failures:
  - [check name] — [type] — [specific error] — [log link]

## Review Comments

### Approved for implementation
- [file:line] ([author]) — [summary]
  Recommendation: [Accept | Accept with modification: <what changes>]
  Agent: [sous-chef | nexus | hedy | pixl | inline]

### Rejected
- [file:line] ([author]) — [summary] — Reason: [rationale]

### Deferred
- [file:line] ([author]) — [summary] — Reason: [rationale]

### Requires manual reply
- [author] — [question] — Suggested reply: [text]

### Previously addressed (skipped)
- [path:line] ([author]) — [summary] — outdated: true, in prior triage dated <date>

### From Claude Action (auto-verified)
- [file:line] (claude[bot]) — [summary]
  Auto-verified: [aligns with CLAUDE.md §section | Full evaluation — see reason]

### Informational
- [summary]
```

After saving, confirm to the user:

```
Triage report saved → <absolute path to TRIAGE_FILE>

Next step: /fix-pr $PR_NUMBER
```

After the confirmation, output this exact closing banner so the user knows the command has finished:

```
---
✅ /review-pr complete — triage saved for PR #$PR_NUMBER
---
```
