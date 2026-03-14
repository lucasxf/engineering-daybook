# PR Triage Report Template

Use this structure when writing the triage report in Step 6.

```markdown
# PR #XX Triage — <PR title>

**Branch:** <headRefName>
**Date:** <today>
**Repo:** <REPO>

## PR Metadata
- Title: [updated — "<new title>" | kept as-is — user declined | ok — was already adequate]
- Description: [updated — generated from commits and diff | kept as-is — user declined | ok — was already adequate]

## CI/CD
- Overall: [✅ All passing | ❌ N failures]
- Failures:
  - [check name] — [type] — [specific error] — [log link]

## Merge Conflicts
- Status: [✅ No conflicts (MERGEABLE) | ❌ N conflicting files (CONFLICTING) | ⏳ Indeterminate (UNKNOWN after retries)]
- Files:
  - [file path] — [conflict type: content / delete-modify / rename / lockfile]

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
