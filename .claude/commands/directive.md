---
description: Add a new coding directive with smart deduplication to appropriate file
argument-hint: <directive-content>
---

Add the following coding directive with smart deduplication:

**New Directive:** $ARGUMENTS

**Workflow:**

1. **Search for Similar Directives**
   - Search in CLAUDE.md
   - Look for exact matches, similar wording, or related concepts

2. **Analyze Result**
   - **EXACT MATCH FOUND** → Inform user: "This directive already exists in [file] [section]. No action taken."
   - **SIMILAR DIRECTIVE FOUND** → Show existing directive, ask: "A similar directive exists:\n\n[existing]\n\nDo you want to:\na) Update existing directive\nb) Add as separate directive\nc) Skip (no action)"
   - **ENTIRELY NEW** → Proceed to step 3

3. **Determine Correct Section in CLAUDE.md**
   - **Tech Stack** → Add to appropriate stack section (Backend/Frontend)
   - **Coding Conventions** → Add to conventions section
   - **Git Workflow** → Add to workflow section
   - **Domain Model** → Add to domain section
   - **Session Guidelines** → Add to guidelines section

4. **Add Directive**
   - Format with proper markdown (bullet point or subsection as appropriate)
   - Include clear examples if applicable
   - Add timestamp: "(Added YYYY-MM-DD)"
   - Add to appropriate section (don't create new sections unless necessary)

5. **Show Changes**
   - Display git diff for user review
   - Summarize: "Added directive to CLAUDE.md → [section]"

6. **Commit Prompt**
   - Ask: "Commit this change? (y/n)"
   - If yes, create commit with message: "docs: Add directive - [brief summary]"

**Important:**
- Avoid duplicates at all costs
- When in doubt about section, ask user
- Use clear, concise language
- Follow existing formatting style
