---
description: Triage an open PR — check CI/CD status, fetch and evaluate review comments, save structured report for /fix-pr
argument-hint: <optional-pr-number>
---

@CLAUDE.md

**PR Triage — CI/CD Status + Review Comment Evaluation**

Target PR: $ARGUMENTS

This command is read-only. It gathers facts, evaluates feedback, and saves a structured triage report.
No code is changed, no branches are checked out, nothing is committed.
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

# Inline code review comments
gh api repos/$REPO/pulls/$PR_NUMBER/comments --paginate

# Review summaries (approve / request changes / comment with body)
gh api repos/$REPO/pulls/$PR_NUMBER/reviews --paginate
```

**Filter out noise:**
- Exclude bots: `release-please`, `dependabot`, `github-actions`
- Keep: GitHub Copilot, human reviewers, Claude
- Exclude empty review bodies (approvals without comment)

---

## 4. Evaluate Each Review Comment

> **Mindset:** You are a second reviewer deciding whether each comment is *correct*, *worth the cost*,
> and *consistent with this project's goals*. Treat every comment — including Copilot's — as a
> proposal that may or may not be right.

For each comment:

**Step A — Read context first.** Before evaluating, read:
- The exact file and surrounding lines (inline comments: ±20 lines)
- The spec in `docs/specs/` if the comment touches a recently implemented feature
- The relevant section of `CLAUDE.md` if the comment is about style or conventions

**Step B — Evaluate on four axes:**

1. **Correctness** — Is the claim accurate? Does the fix actually solve the problem, or does it introduce a new one?
2. **Consistency** — Does it align with CLAUDE.md conventions, existing patterns, and ADRs?
3. **Proportionality** — Is the scope of change proportional to the benefit?
4. **Timing** — Is this the right moment? Some suggestions are valid but wrong for this PR's scope.

**Step C — Classify and recommend:**

| Category | Description | Icon |
|----------|-------------|------|
| **Bug / Correctness fix** | The current code is wrong; the suggestion fixes a real defect | :bug: |
| **Convention / Style** | Aligns with CLAUDE.md or project patterns; low-risk change | :wrench: |
| **Suggestion** | Valid improvement but optional; trade-offs exist | :bulb: |
| **Question** | Requires a reply, not a code change | :question: |
| **Informational** | Praise, acknowledgment, FYI — no action needed | :information_source: |

**Recommendation options:**
- **Accept** — Correct, proportional, consistent. Implement it.
- **Accept with modification** — Real issue, but suggested fix is wrong or incomplete. Implement a corrected version.
- **Reject** — Factually wrong, conflicts with a project directive, or introduces more complexity than it solves. Cite the reason (CLAUDE.md section, ADR, or specific counter-argument).
- **Defer** — Valid but belongs in a separate PR or future milestone.

**For grey-area comments, show the trade-off explicitly:**

```
Trade-off analysis:
  FOR applying: [concrete benefit — what problem it solves, who benefits, how much]
  AGAINST applying: [concrete cost — complexity, consistency violation, risk, scope creep]
  Verdict: [Accept / Reject / Defer] — [one-sentence rationale]
```

Grey-area examples that require trade-off analysis:
- Suggestions that improve readability but increase indirection
- Security hardening that goes beyond the threat model in scope for this PR
- Refactors that are valid but widen the PR's blast radius
- Suggestions that conflict with a project guideline but have merit in this specific case
- Copilot suggestions that are technically correct but miss the intent of the code

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

### Informational
- [summary]
```

After saving, confirm to the user:

```
Triage report saved → <absolute path to TRIAGE_FILE>

Next step: /fix-pr $PR_NUMBER
```
