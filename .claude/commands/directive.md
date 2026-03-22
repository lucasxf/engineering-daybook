---
description: Add a new coding directive with smart deduplication to appropriate file
argument-hint: <directive-content>
---

Add the following coding directive with smart deduplication:

**New Directive:** $ARGUMENTS

**Workflow:**

1. **Search for Similar Directives** — check ALL of the following files:
   - `CLAUDE.md` (root)
   - `backend/CLAUDE.md`
   - `web/CLAUDE.md`
   - `mobile/CLAUDE.md`
   - `memory/MEMORY.md`
   - Look for exact matches, similar wording, or related concepts across all five files.

2. **Analyze Result**
   - **EXACT MATCH FOUND** → Inform user: "This directive already exists in [file] → [section]. No action taken."
   - **SIMILAR DIRECTIVE FOUND** → Show existing directive and its location, ask: "A similar directive exists in [file] → [section]:\n\n[existing]\n\nDo you want to:\na) Update existing directive\nb) Add as separate directive\nc) Skip (no action)"
   - **ENTIRELY NEW** → Proceed to step 3

3. **Invoke `save-learning` skill**
   - Pass the directive text (from `$ARGUMENTS`) as the pre-written text, plus an optional stack hint if the directive is clearly stack-specific.
   - The skill classifies the directive (backend / web / mobile / cross-cutting) and routes it to the correct file and section, with cross-file dedup.

4. **Show Changes**
   - Display git diff for user review
   - Confirm the file and section the directive was saved to (as reported by `save-learning`)

5. **Commit Prompt**
   - Ask: "Commit this change? (y/n)"
   - If yes, create commit with message: "docs: Add directive - [brief summary]"

**Important:**
- Avoid duplicates at all costs — search across all 5 files before writing
- `save-learning` handles final placement; this command's job is to search and initiate
- Use clear, concise language
- Follow existing formatting style
