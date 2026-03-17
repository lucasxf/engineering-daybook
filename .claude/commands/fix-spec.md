---
description: Apply fixes from a /review-spec report — resolve all FAIL items, re-run review checks, mark spec Approved
argument-hint: <path-to-spec-file>
---

@CLAUDE.md

# Spec Fix — Apply Review Report

Spec: $ARGUMENTS

This command implements what `/review-spec` decided. It requires a review report to exist at
`.claude/reviews/spec-<slug>-review.md`. It reads the FAIL items, applies targeted fixes to
the spec, re-runs the review checks inline, and marks the spec Approved if all issues are resolved.

---

## 0. Setup

```bash
MAIN_REPO=$(git worktree list --porcelain | grep '^worktree' | head -1 | sed 's/worktree //')
SPEC_PATH=$ARGUMENTS
SLUG=$(basename "$SPEC_PATH" .md)
REPORT="$MAIN_REPO/.claude/reviews/spec-$SLUG-review.md"
```

**If no argument provided:** STOP. Show usage:
```
Usage: /fix-spec docs/specs/features/my-spec.md
```

**Verify the spec file exists:**
```bash
test -f "$MAIN_REPO/$SPEC_PATH" && echo "Found spec" || echo "NOT FOUND"
```
If not found → list `docs/specs/features/` and stop.

**Verify the review report exists:**
```bash
test -f "$REPORT" && echo "Found report: $REPORT" || echo "NOT FOUND"
```
If not found → STOP. Tell the user:
> "No review report found for `$SPEC_PATH`. Run `/review-spec $SPEC_PATH` first."

Read the review report now. All decisions about what to fix come from it.

---

## 1. Parse FAIL Items

From the `## FAIL Items` section of the report, extract each bullet as a structured fix target.
Group them by type:

| Type | How to detect |
|------|--------------|
| **Structural** | "Missing `## Section`", "MISSING — no NFR", etc. |
| **AC gap** | "missing AC for FR…", "add AC…", "no acceptance criterion…" |
| **Technical Design** | "unspecified behavior", "not specified", "no guidance on…" |
| **Testability** | "AC vague", "ambiguous assertion", "too broad" |
| **CLAUDE.md conflict** | "conflicts with", "POK in user-facing text", etc. |

List the grouped FAIL items to the user before making changes:
```
Found N FAIL items to fix:
  Structural (2): ...
  AC gap (3): ...
  Technical Design (1): ...
```

Confirm: "Applying fixes now."

---

## 2. Apply Fixes

For each FAIL item, apply the minimal targeted fix to the spec file using the Edit tool.
Do NOT rewrite sections that are not referenced in the FAIL items.

### Structural fixes

**Missing `## Non-Functional Requirements`:**
Add a new section after the Functional Requirements (or Goals if no Requirements section exists).
Include at least:
- A test coverage NFR (reference the jest threshold in `jest.config.js`)
- A responsiveness NFR appropriate to the stack
- A content safety NFR if any user-generated content is involved

**Missing `## Technical Constraints`:**
Add the section with: `**Stack:**`, `**Technologies:**`, `**Integration Points:**`, `**Out of Scope:**`.
Derive Stack from the spec path or existing content. Move Non-Goals into Out of Scope if they overlap.

**Missing `## Screens`:**
Add a `### Screen: <ScreenName>` block per screen modified or introduced.
Each block must have: Purpose, Layout, Components, States (Default/Loading/Error), i18n reference, Interactions, Accessibility.
Derive content from the Technical Design / File Changes sections already in the spec.

**Missing Test Strategy checkbox:**
Add a `### Test Strategy` subsection to `## Implementation Approach` (or `## Technical Design` if that's used).
Select the appropriate checkbox based on what the Testing section describes.

### AC gap fixes

For each missing AC (e.g., "FR2 missing max-length enforcement AC"):
- Add a new `### ACN: <Scenario name>` block after the last existing AC
- Use concrete GIVEN/WHEN/THEN language
- Reference the specific field, value, or behaviour from the FR

### Technical Design fixes

For each unspecified behaviour (e.g., "fileSize undefined not handled", "navigate-away not specified"):
- Add the decision inline in the relevant Technical Design subsection
- Prefer a short statement + rationale, not a new section

### Testability fixes

For each vague AC assertion (e.g., "avatar image updates" → too vague):
- Edit the THEN clause to reference a specific prop, attribute, or observable element
- Use `testID`, `disabled={true}`, property names, or concrete string values

---

## 3. Resolve Open Questions (if present)

If the spec has an `## Open Questions` section and any questions have recommendations in the
review report or in the question text itself, resolve them:
1. Promote the recommended decision into the Technical Design section
2. Replace the `## Open Questions` section with a `## Decisions` section listing each resolved item

---

## 4. Inline Re-Review

After all edits are applied, re-run the structural completeness check from `/review-spec` Phase 2
inline (no agent). Check only the previously-FAIL sections:

For each section that was FAIL before:
- Read the spec and verify the fix is present and non-empty
- Mark as PASS if fixed, still-FAIL if not

Report the re-check table:

```
Re-check after fixes:
| Was-FAIL Item | Now |
|---------------|-----|
| NFR section   | ✅ PASS — NFR1-NFR4 added |
| Screens       | ✅ PASS — ProfileScreen block added |
| AC11 (bio max)| ✅ PASS — AC11 added |
| ...           | ... |
```

If any items are **still FAIL** (fix was not applied or was incomplete):
- List them explicitly
- Do NOT mark spec as Approved
- Tell user: "N items still need manual attention — see above."

---

## 5. Update Status + Commit

**If all previously-FAIL items are now PASS:**

1. Update the spec Status header:
   ```
   > **Status:** Approved
   > **Reviewed:** YYYY-MM-DD
   ```
   (Add `**Reviewed:**` line if not present; update if already present)

2. Archive the review report by renaming it to `spec-$SLUG-review-done.md`:
   ```bash
   mv "$REPORT" "${REPORT%-review.md}-review-done.md"
   ```

3. Commit:
   ```bash
   git add "$MAIN_REPO/$SPEC_PATH" "$MAIN_REPO/.claude/reviews/"
   git commit -m "docs: fix spec $SLUG — resolve review FAIL items, mark Approved"
   ```

4. Report:
   ```
   ✅ Spec approved — all FAIL items resolved.
   Spec:   <spec-path>
   Status: Approved
   Commit: <hash>

   Ready to run: /implement-spec <spec-path>
   ```

**If any items remain FAIL:**
```
⚠️ Partial fix — N item(s) still need attention.
See "Re-check after fixes" table above.
Do NOT run /implement-spec until all FAILs are resolved.
```
Do not commit in this case.

---

## Error Handling

- **No arguments:** Show usage and list `docs/specs/features/`
- **Spec not found:** Show error and list available specs
- **Report not found:** Tell user to run `/review-spec <path>` first
- **Report verdict is already READY:** Tell user the spec is already Approved; nothing to fix
- **Git not clean:** Warn before committing; offer to stash or skip commit
