# Automation Sentinel Recommendations — Implementation Prompts

**Saved:** 2026-03-11
**Source:** `/compile-metrics` sentinel report, session on `develop`
**Purpose:** Self-contained prompts for implementing recs 2, 3, and 4 in fresh Claude Code sessions.

---

## Recommendation 2: Fix Delegated Agent Tracking in `track-usage.py`

### Problem

Custom agents (e.g., `tech-writer`, `keepr`, `sous-chef`) show 0 invocations in `.claude/metrics/usage-stats.toml` despite being actively used. `tech-writer` shows 5 vs 42+ actual invocations (one per `/finish-session`). The root cause is in `.claude/scripts/track-usage.py`.

### Root Cause Analysis

The PostToolUse hook fires on both `Task` and `Agent` tool calls and reads `tool_input["subagent_type"]`. However:

1. **`subagent_type` carries the built-in type, not the custom agent name.** When Claude delegates to a custom agent like `tech-writer`, the `subagent_type` is typically `"general-purpose"` (or `"Explore"` / `"Plan"`). The custom identity is in the `prompt` text or `description` field, not `subagent_type`.

2. **The fallback heuristic is weak.** Lines ~197-217 of `track-usage.py` attempt to recover agent names by substring-matching `KNOWN_AGENTS` against `tool_input["description"]`, but only when `subagent_type == "general-purpose"`. It doesn't fire for `"Explore"` or `"Plan"`, and relies on the agent name appearing literally in the short description field.

3. **No inspection of `prompt` field.** The `prompt` parameter often contains phrases like "You are the tech-writer agent" or "delegate to keepr", but the tracker never reads it.

### Files to Modify

- `.claude/scripts/track-usage.py` — lines 166-246 (`main()` function)

### Implementation Plan

1. **Extend the heuristic to ALL subagent types** (not just `"general-purpose"`):
   - After reading `subagent_type`, always check `description` AND `prompt` fields for `KNOWN_AGENTS` matches
   - If a known agent name is found, reclassify `key` to that agent name
   - Keep the built-in type as a fallback only when no custom agent is detected

2. **Search both `description` and `prompt` fields:**
   ```python
   # Current (only description, only for general-purpose):
   if subagent_type == "general-purpose":
       description = tool_input.get("description", "").lower()
       for agent_name in KNOWN_AGENTS:
           if agent_name in description:
               key = agent_name
               break

   # Fixed (all types, both fields):
   search_text = (
       tool_input.get("description", "") + " " +
       tool_input.get("prompt", "")
   ).lower()
   for agent_name in KNOWN_AGENTS:
       if agent_name in search_text:
           key = agent_name
           break
   ```

3. **Handle the `subagent_type` field directly matching a custom agent name.** Some commands explicitly use `subagent_type: "tech-writer"` or `subagent_type: "steward"` — the tracker should recognize these directly. Currently it only recognizes built-in types. Fix: check if `subagent_type` value is in `KNOWN_AGENTS` before falling through to the heuristic.

4. **Sort `KNOWN_AGENTS` iteration to avoid ambiguity.** Convert the set to a sorted list and prefer longer matches first (e.g., `"automation-sentinel"` before `"sentinel"`).

### Verification

After fixing, run a quick test:
```bash
# Simulate a hook payload for an Agent call with subagent_type: "general-purpose"
# but description mentioning "tech-writer"
echo '{"hook_event_name":"PostToolUse","tool_name":"Agent","tool_input":{"subagent_type":"general-purpose","description":"Phase file update and docs check","prompt":"You are the tech-writer agent..."}}' | python3 .claude/scripts/track-usage.py

# Check the session delta file was written with tech-writer, not general-purpose
cat .claude/metrics/sessions/*.toml
```

Then run `/compile-metrics` and verify the agent shows up correctly.

### Convention Notes

- `KNOWN_AGENTS` is a set defined at the top of `track-usage.py` — kept in sync by `.claude/scripts/sync-automation-registry.py`
- The hook config is in `.claude/settings.json` under `hooks.PostToolUse` — matcher is `"Task|Agent|Skill"`
- Delta files go to `.claude/metrics/sessions/{branch}.toml`

---

## Recommendation 3: Capture keepr Verdict Distribution in Metrics

### Problem

`/review-pr` invokes keepr to classify every PR review comment as Accept / Accept with Modification / Reject / Defer / Question / Informational. This verdict distribution is valuable for trending reviewer quality (e.g., "are Copilot suggestions mostly accepted or rejected?"), but it never reaches `usage-stats.toml`.

### Current Flow

1. `/review-pr` (`.claude/commands/review-pr.md`) Step 4 invokes keepr via `Agent` tool with `subagent_type: keepr`
2. keepr returns grouped verdicts
3. Step 6 saves the triage report to `.claude/reviews/pr-{N}-triage.md`
4. The report has structured markdown sections: `### Approved for implementation`, `### Rejected`, `### Deferred`, `### Requires manual reply`, `### From Claude Action (auto-verified)`, `### Informational`
5. No metrics are extracted from the verdict counts

### Triage Report Format (relevant sections)

```markdown
### Approved for implementation
- `file:line` (author) — description
  Recommendation: Accept — ...
  Agent: sous-chef

### Rejected
- `file:line` (author) — description
  Reason: ...

### Deferred
- `file:line` (author) — description
  Reason: ...

### Requires manual reply
- (author) — question
  Suggested reply: ...

### Informational
- (description)
```

### Files to Modify

- `.claude/commands/review-pr.md` — add a Step 6.5 after saving the triage report to extract verdict counts and write them to the session delta
- `.claude/scripts/track-usage.py` — add support for a new `[pr_review_quality]` section in session deltas (or reuse existing session delta write mechanism)
- `.claude/commands/compile-metrics.md` — add aggregation logic for `[pr_review_quality]` section

### Implementation Plan

1. **Add Step 6.5 to `/review-pr`** — after the triage report is saved (Step 6), count items per verdict category:
   ```bash
   python3 -c "
   from pathlib import Path
   import re

   report = Path('$TRIAGE_FILE').read_text()

   # Count items under each section header
   sections = {
       'accepted': len(re.findall(r'(?<=### Approved for implementation\n).*?(?=###|\Z)', report, re.S)[0].strip().split('\n- ')) - 1 if '### Approved' in report else 0,
       'rejected': ...,
       'deferred': ...,
       'questions': ...,
       'informational': ...,
   }

   # Write to session delta as [pr_review_quality.pr-{N}]
   ..."
   ```

2. **Extend session delta format** — add a new section type:
   ```toml
   [pr_review_quality]
   total_prs_triaged = 1
   total_comments_triaged = 12
   accepted = 3
   accepted_with_modification = 1
   rejected = 4
   deferred = 2
   questions = 1
   informational = 1
   ```

3. **Extend `/compile-metrics`** — add aggregation for `[pr_review_quality]`:
   - Sum all numeric fields across session deltas
   - Write cumulative totals to `usage-stats.toml`

4. **Extend automation-sentinel** — add a "PR Review Quality" section to the health report:
   - Accept rate = (accepted + accepted_with_modification) / total_comments
   - Reject rate = rejected / total_comments
   - Show trends if historical data exists

### Verification

1. Run `/review-pr` on any open PR
2. Check the session delta file for `[pr_review_quality]` section
3. Run `/compile-metrics` and verify totals appear in `usage-stats.toml`
4. Run the automation sentinel and verify the new section appears in the report

---

## Recommendation 4: Add Structural Completeness Pre-check to `/implement-spec`

### Problem

`/implement-spec` checks for five section headings (`Context`, `Requirements`, `Technical Constraints`, `Acceptance Criteria`, `Implementation Approach`) but does NOT validate their content quality. A spec with the right headings but placeholder text, zero FRs, or empty ACs passes the gate and wastes compute on subagent dispatch. `/review-spec` already has a thorough 12-point structural check — this should be reused.

### Current `/implement-spec` Validation (Phase 1.1, lines 96-103)

```
1. Read the spec file at `$ARGUMENTS`
2. Check for required sections:
   - Context
   - Requirements
   - Technical Constraints
   - Acceptance Criteria
   - Implementation Approach
3. If any section is missing → STOP
4. Note whether optional `## Screens` section exists
```

This only checks section headings exist. It does NOT check:
- Whether sections have real content vs placeholder text
- Whether Requirements has at least 1 FR and 1 NFR
- Whether ACs have GIVEN/WHEN/THEN structure
- Whether Stack field is set in Technical Constraints
- Whether Test Strategy has a checkbox selected
- Whether File Changes has at least 1 file listed
- Whether Dependencies has Blocked by / Blocks fields

### `/review-spec` Phase 2 Checks (lines 67-84 of review-spec.md)

| Check | Rule | Severity |
|-------|------|----------|
| Status / Created header | Must not be placeholder | FAIL |
| `## Context` | Must not be placeholder text | FAIL |
| `## Requirements` > `### Functional` | At least 1 FR | FAIL |
| `## Requirements` > `### Non-Functional` | At least 1 NFR | FAIL |
| `## Technical Constraints` | Stack field must be set | FAIL |
| `## Acceptance Criteria` | At least 1 AC block with GIVEN/WHEN/THEN | FAIL |
| `## Screens` | Required if Stack includes Web or Mobile | FAIL/N/A |
| `## Implementation Approach` > `### Architecture` | Must not be placeholder | FAIL |
| `## Implementation Approach` > `### Test Strategy` | Must have a checkbox selected | FAIL |
| `## Implementation Approach` > `### File Changes` | At least 1 file listed | FAIL |
| `## Implementation Plan` | Recommended | WARN (not blocking) |
| `## Dependencies` | "Blocked by" and "Blocks" fields present | FAIL |

### Files to Modify

- `.claude/commands/implement-spec.md` — expand Phase 1.1 (lines ~96-103)

### Implementation Plan

Insert a **Phase 1.1B: Structural Completeness Gate** between the current Phase 1.1 (section heading check) and Phase 1.2 (status check). This runs the same 12-point validation table from `/review-spec` Phase 2.

**Add the following after Phase 1.1's section heading check:**

```markdown
### Phase 1.1B: Structural Completeness Gate

Run the `/review-spec` Phase 2 structural completeness checks inline:

| Check | Rule | Severity |
|-------|------|----------|
| Status / Created header | Must not be placeholder | FAIL |
| Context | Must not be placeholder text | FAIL |
| Requirements > Functional | At least 1 FR (numbered list item) | FAIL |
| Requirements > Non-Functional | At least 1 NFR (numbered list item) | FAIL |
| Technical Constraints | Stack field must be set (not blank/placeholder) | FAIL |
| Acceptance Criteria | At least 1 AC with GIVEN/WHEN/THEN structure | FAIL |
| Screens | Required if Stack includes Web or Mobile; N/A otherwise | FAIL or N/A |
| Architecture | Must not be placeholder text | FAIL |
| Test Strategy | Must have at least one checkbox selected | FAIL |
| File Changes | At least 1 file path listed | FAIL |
| Implementation Plan | Recommended for orchestrator mode | WARN |
| Dependencies | "Blocked by" and "Blocks" fields present | FAIL |

**If any FAIL items:**
- Print the completeness table with PASS/FAIL/WARN status per row
- STOP with: "Spec has N structural issue(s). Run `/review-spec {spec-path}` to get detailed feedback, then fix before running `/implement-spec`."
- Do NOT proceed to Phase 1.2

**If only WARNs:**
- Print the table (showing WARNs)
- Proceed normally (WARN for missing Implementation Plan just means legacy mode)

**If all PASS:**
- Proceed silently (no table output needed)
```

### Verification

1. Create a test spec with placeholder content (e.g., empty Requirements section):
   ```bash
   cp docs/specs/template.md /tmp/test-spec.md
   # Leave placeholders in place
   ```
2. Run `/implement-spec /tmp/test-spec.md` — should STOP with structural completeness errors
3. Fill in the spec properly, run again — should pass the gate and proceed to Phase 1.2

### Convention Notes

- The check table duplicates `/review-spec` Phase 2 logic — this is intentional (avoiding cross-command dependencies). If the review-spec checks change, update implement-spec's copy too.
- The WARN for missing Implementation Plan is consistent with `/implement-spec`'s existing Phase 1.5 mode detection (falls back to legacy mode).
- This does NOT replace `/review-spec` — it's a lightweight pre-flight check, not a full review (no reader testing, no consistency analysis, no technical validation of file paths).
