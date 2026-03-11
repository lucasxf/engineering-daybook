---
description: Convert a spec file into a self-contained v0.dev prompt
argument-hint: <screen-name>
---

# Generate v0 Prompt from Spec

Convert a learnimo screen into a self-contained, copy-pasteable v0.dev prompt. One invocation = one screen.

## Usage

```
/generate-v0-prompt <screen-name>
```

Example:
```
/generate-v0-prompt "Login"
/generate-v0-prompt "Create Learning"
```

The screen name must match (case-insensitive) a row in `.claude/v0-prompts/INDEX.md`. To see all screens and their status, open that file.

## Input

The user provides a **screen name**. The command looks up the matching row in the INDEX to find the source spec file. Spec files contain:
- Functional requirements (FR) with priority levels
- Non-functional requirements (NFR)
- Acceptance criteria in Gherkin format
- Implementation approach with component trees, API contracts, file paths
- i18n keys and messages
- **`## Screens` section** (new specs) — self-contained, tool-agnostic screen blocks with purpose, layout, components, states, i18n, interactions, and accessibility. When present, use this as the primary source for UI content.

## Your Task

### Step 0 — Look up screen in INDEX (ALWAYS run first, before reading the spec)

Read `.claude/v0-prompts/INDEX.md` and find the row whose **Screen** column matches the given screen name (case-insensitive).

- **If no matching row exists:** STOP. Output:

  ```
  ⚠️ Screen "[Screen Name]" not found in .claude/v0-prompts/INDEX.md.
  Available screens: [list all Screen names from the index]
  ```

  Then exit. No further steps.

- **If the matching row is already ✅:** STOP immediately. Do not read the spec. Output:

  ```
  ⚠️ Skipping — a v0 prompt for "[Screen Name]" already exists:
     .claude/v0-prompts/<existing-filename>.md

  To regenerate it anyway, delete or rename that file and re-run the command.
  ```

  Then output the finish banner and exit. No further steps.

- **If the matching row is ⬜:** note the **Source Spec** path from that row, then proceed to Step 1.

### Step 1 — Generate and save

Read the spec file (from the Source Spec path found in Step 0) and produce a **single, self-contained v0.dev prompt for the requested screen only**, then **write it to a file** the user can open directly in their editor or browser.

## Output Format (Step 1)

1. **Write the prompt to a file** using the Write tool:
   - Output directory: `.claude/v0-prompts/`
   - Filename: derive from the spec filename + screen name slug, e.g. `pok-listing-search--learning-feed.md`
   - The file must contain **only the raw prompt text** (no wrapping code block, no frontmatter) so the user can open it, select all, and paste directly into v0.app
2. **Update the index table** at `.claude/v0-prompts/INDEX.md`:
   - Find the row whose **Screen** matches the screen you just generated (case-insensitive, fuzzy match on the name)
   - Update its **Prompt File** column to the filename you wrote
   - Update its **Status** column from `⬜` to `✅`
   - If the screen is not in the table yet, append a new row with the spec path, filename, and `✅`
   - Use the Edit tool for this (targeted replacement of the matching row only)
3. **Tell the user the file path** so they can open it immediately.

## Conversion Rules

### 1. Always include this brand header (copy verbatim)

```
### Design System

**Palette — "Library at Dusk" (blue-dominant 60%, brown accent 30%, warm CTA 10%):**

--deep-navy: #0F1B2D     /* dark mode bg */
--primary-blue: #1A365D  /* primary brand, dark cards */
--mid-blue: #2B4A78      /* secondary, hovers */
--branch-brown: #8B5E3C  /* accent, warmth */
--dark-leather: #6B4226  /* secondary accent */
--ember-cta: #D4854A     /* CTAs, buttons, "+" */
--parchment: #F5F0E8     /* light mode bg */
--ink: #1A1A2E           /* text */

**Typography:**
- Headings: `Sora` weight 600
- Body/UI: `DM Sans` weight 400/500
- Wordmark only: `Bricolage Grotesque` ("learn" regular + "imo" bold)

Import from Google Fonts: `Bricolage+Grotesque:wght@400;700&DM+Sans:wght@400;500&Sora:wght@600`

**Tone:** Professional and sharp — like Linear or Raycast. Not playful, not corporate. Engineers and knowledge workers use this daily.
```

### 2. Read UI content from the spec

**For specs with a `## Screens` section (new format):**
Read the `## Screens` section directly. Each `### Screen:` block is self-contained and maps 1:1 to the output template fields:
- `**Purpose:**` → `**Purpose:**`
- `**Layout:**` → `**Layout (top → bottom):**`
- `**States:**` → `**States to design:**`
- `**i18n:**` table → include as example text
- `**Interactions:**` → include as behavioral notes
- `**Accessibility:**` → include as requirements

**For legacy specs without a `## Screens` section:**

**INCLUDE:**
- Screen purpose and user problem (from Context section)
- Layout structure and component hierarchy (from Implementation → Web → Components)
- All UI states: empty, loading, error, success, populated
- i18n text strings (from i18n keys sections — include both EN and PT-BR examples)
- Interaction behaviors: click targets, navigation, debounce, keyboard shortcuts
- Validation feedback: inline errors, success messages
- Accessibility requirements (from NFR section)
- Any specific UI acceptance criteria (Gherkin scenarios starting with "Web UI" or describing visual behavior)

**EXCLUDE:**
- Backend implementation details (Java code, SQL queries, Spring Boot layers, repository methods)
- API endpoint contracts (the v0 component won't call real APIs)
- Database schema and migrations
- Test file paths and test implementation details
- Security implementation details (JWT extraction, SQL injection prevention)
- Performance benchmarks and infrastructure concerns
- Git workflow and CI/CD references

### 3. Always include dark and light mode specs

For every screen, provide explicit hex values for both modes. Use this template and adapt the specifics:

```
**Dark mode** (primary):
- Background: #0F1B2D
- Card bg: #1A365D with 1px border #2B4A78
- Title text: #F5F0E8
- Body text: #8899AA (muted blue-gray)
- Tags: #2B4A78 bg with #8B9EC2 text
- Input bg: #0F1B2D border #1A365D
- CTA button: #D4854A with white text

**Light mode:**
- Background: #F5F0E8
- Card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Title text: #1A1A2E
- Body text: #666666
- Tags: #E0E8F2 bg with #1A365D text
- Input bg: #FFFFFF border #CCC
- CTA button: #D4854A with white text
```

Adapt the component-specific colors (e.g., tags, inputs, cards) based on what the screen actually contains. Don't include colors for components that aren't on the screen.

### 4. Always end with this footer

```
**Component framework:** Use shadcn/ui components (adapt this list to the screen). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
```

### 5. Structure the prompt as

```
I'm redesigning the **[Screen Name]** screen for **learnimo**, a personal learning journal app.

### Design System
[brand header from rule 1]

### Screen: [Screen Name]

**Purpose:** [1-2 sentences from the spec's Context/User Problem]

**Layout (top → bottom):**
[numbered list of UI sections, from nav to footer]

**States to design:**
[bullet list of all states: empty, loading, error, success, etc.]

**Dark mode** (primary):
[hex values]

**Light mode:**
[hex values]

**Component framework:** [footer from rule 4]
```

### 6. Targeting the right screen in the spec

When reading the spec, focus only on the screen named in the argument. Specs often describe multiple screens:
- **New format:** Find the `### Screen: [Name]` block that matches the requested screen
- **Legacy format:** Focus on the component/route section for this specific screen only

Do NOT generate content for other screens in the same spec file.

### 7. Quality checks before outputting

Before producing the prompt, verify:
- [ ] Brand header is included verbatim
- [ ] No Java/Spring Boot code leaked into the prompt
- [ ] No API endpoint URLs in the prompt
- [ ] Dark AND light mode hex values are present
- [ ] All UI states are covered (empty, loading, error at minimum)
- [ ] i18n examples are included (at least placeholder text in EN and PT-BR)
- [ ] The prompt mentions shadcn/ui + Tailwind CSS
- [ ] The prompt asks for responsive design
- [ ] The prompt asks for both dark and light mode previews

## Example Output

For `/generate-v0-prompt "Learning Feed"` (spec looked up from INDEX as `pok-listing-search.md`), the output would be a prompt that:
- Opens with "I'm redesigning the Learning Feed..."
- Includes the full brand header
- Describes the nav bar, page header, quick-entry bar, search bar, POK feed, and pagination
- Lists all 4 states (empty, no results, loading, error)
- Provides dark/light mode hex values
- Ends with the shadcn/ui + responsive footer
- Is approximately 80-120 lines long (enough detail for v0, not overwhelming)

The user should be able to copy-paste the output directly into v0.app and get a meaningful first generation.

## Finish Banner

After writing the file and reporting the path, output this exact closing banner:

```
---
✅ /generate-v0-prompt complete — prompt saved to .claude/v0-prompts/<filename>.md
---
```
