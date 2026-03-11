---
description: Review a feature specification for completeness, consistency, and implementability before /implement-spec
argument-hint: <path-to-spec-file> [optional: "revision instructions"]
---

@CLAUDE.md

# Spec Review

Arguments: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates product review to the `virgil` agent. The agent MUST NEVER call `/review-spec` back.

---

## Phase 0: Input & Mode Detection

### 0.1 Parse Arguments

Split `$ARGUMENTS` into:
- `<spec-path>` — the first token (file path)
- `<comments>` — everything after the first token (optional; user's revision instructions)

**If no arguments at all:** STOP. Tell the user:
```
Usage:
  /review-spec docs/specs/features/my-spec.md
  /review-spec docs/specs/features/my-spec.md "add NFR for latency, split AC3 into two scenarios"

Available specs:
```
Then list files in `docs/specs/features/` and stop.

**If a spec path is provided but the file does not exist:** STOP. Show error and list available specs in `docs/specs/features/`.

### 0.2 Detect Mode

- **If `<comments>` is non-empty** → **Revise + Review mode**
- **If `<comments>` is empty** → **Review Only mode**

Confirm to the user: `Spec: <spec-path> | Mode: [Revise + Review | Review Only]`

Read the spec file and `docs/specs/template.md` before proceeding.

---

## Phase 1: Revise (Revise + Review mode only — skip in Review Only mode)

1. Read the full spec file content
2. Interpret `<comments>` as revision instructions. Examples:
   - "add NFR for response time" → append a new NFR entry
   - "split AC3 into two scenarios" → replace the single AC3 block with AC3a and AC3b
   - "remove the mobile screen" → delete the Screen block for mobile
   - "mark status as Approved" → update the Status header field
3. Apply changes to the spec file using the Edit tool — preserve all existing structure and content; only modify what the instructions explicitly request
4. Show a revision summary:
   ```
   Revisions applied:
   - Added NFR3: response time < 200ms for search queries
   - Split AC3 → AC3a (happy path) + AC3b (error case)
   ```
5. Continue to Phase 2 with the updated file content

---

## Phase 2: Structural Completeness Check

Check the spec for all required sections from `docs/specs/template.md`. For each section, report PRESENT, MISSING, or EMPTY (section exists but contains only placeholder text from the template).

| Section | Required? | Rule |
|---------|-----------|------|
| Status / Created header | Yes | Must not be placeholder |
| `## Context` | Yes | Must not be placeholder text |
| `## Requirements` > `### Functional` | Yes | Must have at least 1 FR |
| `## Requirements` > `### Non-Functional` | Yes | Must have at least 1 NFR |
| `## Technical Constraints` | Yes | Stack field must be set |
| `## Acceptance Criteria` | Yes | At least 1 AC block with GIVEN/WHEN/THEN |
| `## Screens` | Conditional | Required if Stack includes `Web` or `Mobile`; optional otherwise |
| `## Implementation Approach` > `### Architecture` | Yes | Must not be placeholder |
| `## Implementation Approach` > `### Test Strategy` | Yes | Must have a checkbox selected |
| `## Implementation Approach` > `### File Changes` | Yes | Must have at least 1 file listed |
| `## Implementation Plan` | Recommended | WARN if missing (not a FAIL — orchestrator mode won't run, falls back to legacy) |
| `## Dependencies` | Yes | "Blocked by" and "Blocks" fields must be present |

---

## Phase 3: Product Review (delegate to virgil)

Delegate to the `virgil` agent via the Agent tool with `subagent_type: virgil`. Pass:
- The full spec content
- This instruction:

> "Review this spec for product quality. Check each of the following and return a structured list of findings (PASS / WARN / FAIL per check):
>
> 1. **FR-AC coverage:** Every functional requirement (FR1, FR2, …) must map to at least one acceptance criterion. List any orphaned FRs.
> 2. **AC testability:** Each AC must use concrete Given/When/Then language — no vague terms like 'should be fast' or 'user can see'. Flag vague ACs.
> 3. **Orphaned ACs:** Any AC that does not correspond to a FR. Flag them.
> 4. **MoSCoW priorities:** Each FR should have a priority label (Must Have / Should Have / Could Have). Flag missing labels.
> 5. **Out-of-scope explicit:** The Technical Constraints section must have a non-empty 'Out of Scope' list. Flag if missing.
> 6. **Context quality:** The Context section must explain *why* this feature exists (user problem / product decision), not just *what* it does. Flag if it only describes the feature."

Use virgil's output directly in the Phase 5 report.

---

## Phase 4: Technical Validation

Run these checks in the main session (no agent needed).

### 4.1 File Path Validation

Parse all file paths listed in `## Implementation Approach > ### File Changes` and `## Implementation Plan` (the `- **Files:**` fields).

For each path, check whether its **parent directory** exists in the codebase using Glob. A path like `backend/src/main/java/com/lucasxf/ed/service/NewService.java` is valid if `backend/src/main/java/com/lucasxf/ed/service/` exists. Report:
- PASS if all parent directories exist (or the file itself already exists)
- WARN for each path whose parent directory does not exist (possible typo or wrong location)

### 4.2 Implementation Plan Dependency Validation

If an `## Implementation Plan` section is present, parse each `### Task N` block and its `- **Depends on:**` field.

Check:
1. Every `Depends on: Task N` reference points to a task number that exists in the plan
2. No circular dependencies (Task A depends on B which depends on A)

Report PASS, or list specific invalid references / cycles found.

### 4.3 CLAUDE.md Conflict Check

Scan the spec text for patterns that conflict with project-wide rules. Flag any of the following:

| Pattern | Rule violated |
|---------|--------------|
| References to modifying, generating, or "improving" POK/learning content | POK content is SACRED |
| References to pushing directly to `main` | Main branch protection |
| Test Strategy checkbox is "Infrastructure only" without justification | Testing requirement |
| User-facing text contains the word "POK" | User-facing terminology rule |

---

## Phase 5: Report & Verdict

Output the review report:

```
## Spec Review — <spec-name>
[Mode: Revise + Review — changes applied before review] (Revise + Review mode only)
[Revisions: <one-line summary>] (Revise + Review mode only)

### Structural Completeness
| Section | Status |
|---------|--------|
| Status / Created header | PRESENT |
| Context | PRESENT |
| Requirements > Functional | PRESENT |
| Requirements > Non-Functional | PRESENT |
| Technical Constraints | PRESENT |
| Acceptance Criteria | PRESENT |
| Screens | PRESENT / N/A |
| Implementation Approach > Architecture | PRESENT |
| Implementation Approach > Test Strategy | PRESENT |
| Implementation Approach > File Changes | PRESENT |
| Implementation Plan | PRESENT / WARN: missing (legacy mode will be used) |
| Dependencies | PRESENT |

### Product Review (virgil)
- [PASS/WARN/FAIL] FR-AC coverage: ...
- [PASS/WARN/FAIL] AC testability: ...
- [PASS/WARN/FAIL] Orphaned ACs: ...
- [PASS/WARN/FAIL] MoSCoW priorities: ...
- [PASS/WARN/FAIL] Out-of-scope explicit: ...
- [PASS/WARN/FAIL] Context quality: ...

### Technical Validation
- [PASS/WARN] File paths: N valid, N with unknown parent directories
  - WARN: path/to/unknown/File.java (parent dir not found)
- [PASS/FAIL] Dependency order: no issues / cycle detected: Task 3 → Task 1 → Task 3
- [PASS/FAIL] CLAUDE.md conflicts: none / [list each conflict]

### Verdict
```

**If all checks PASS (no FAIL items):**
```
✅ READY — All checks pass. Safe to run /implement-spec <spec-path>
```

**If any FAIL items exist:**
```
⚠️ NEEDS WORK — N issue(s) found. Fix before running /implement-spec.

Issues to fix:
- [FAIL item 1]
- [FAIL item 2]
```

> WARNs (missing Implementation Plan, unknown file paths) do not block implementation — they are informational.

---

## Error Handling

- **No arguments:** Show usage message with spec list
- **Spec file not found:** Show error and list `docs/specs/features/`
- **virgil agent fails:** Fall back to listing the FR-AC check items as a manual checklist with "Review manually" note
- **Spec has no FRs at all:** Report as FAIL in structural completeness; skip FR-AC check with note "No FRs to evaluate"
