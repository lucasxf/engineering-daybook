---
name: prompt-optimizer
description: Optimize, rewrite, or review prompts for Claude Code plan mode (Opus) or execution mode (Sonnet). Use when the user wants to improve a prompt they've written, optimize a command or agent for token efficiency, create a high-quality plan-mode or execution-mode prompt from a raw intent, review an existing agent or SKILL.md for prompt quality, convert a prompt between plan and execution mode, or asks about prompt engineering for Claude. Trigger when user mentions "optimize prompt", "improve this prompt", "make this better for sonnet", "make this better for opus", "rewrite for plan mode", "review this command/agent/skill", "reduce tokens in this prompt", "prompt engineering", "how should I phrase this for Claude", "convert plan prompt to execution", "optimize from queue", "check prompts to optimize", "prompts/to-optimize", or similar.
---

# Prompt Optimizer

A skill for transforming raw intent or existing prompts into mode-optimized versions for Claude Code — plan mode (Opus) or execution mode (Sonnet).

There are three workflows:

0. **Discover from queue** — no prompt provided; search `prompts/to-optimize/` and let the user pick
1. **Optimize a new prompt** — user has an intent or rough prompt; you produce a polished, mode-appropriate version
2. **Review an existing prompt** — user points at a command, agent, SKILL.md, or any prompt file; you analyze it and suggest improvements

Start by figuring out which workflow the user needs, then jump in.

---

## Workflow 0: Discover Prompts from Queue

**Activate when:** the user runs `/prompt-optimizer` with no argument, mentions "queue", "to-optimize", or `prompts/to-optimize/`.

**Steps:**

1. Use `Glob` to list all `.md` files in `prompts/to-optimize/`
2. **If empty** → tell the user the queue is empty and fall back to Workflow 1 (ask them to paste a prompt or describe their intent)
3. **If one file** → auto-select it; tell the user which file was picked
4. **If multiple files** → read the first heading or first non-empty line of each file for a one-line summary, then present the list and ask the user which prompt to optimize:
   ```
   Found N prompts in the queue:
   1. filename-a.md — [summary]
   2. filename-b.md — [summary]
   Which would you like to optimize? (enter number or name)
   ```
5. Read the selected file
6. Proceed to **Step 0: Detect Mode** and then **Workflow 1** as normal, treating the file contents as the raw input prompt
7. After saving the optimized prompt to `prompts/optimized/`, ask:
   > "Remove `prompts/to-optimize/<filename>` from the queue now that it's been optimized?"
   Only delete the source file if the user confirms.

---

## Step 0: Detect Mode

Before doing anything, determine which mode the optimized prompt will be used in. Apply this priority order:

1. **Explicit**: User said "plan mode", "opus", "execution mode", "sonnet" → use that
2. **Inference**: Analyze the task type:
   - Architecture, design decisions, trade-offs, "what should I do", "how should I approach", "investigate" → **plan mode**
   - Implement, fix, write tests, refactor, "add X to file Y", "make this change" → **execution mode**
   - Converting from plan to execution → **execution mode**
3. **Ask**: If genuinely ambiguous, ask: "Should I optimize this for plan mode (Opus — deep reasoning, richer context) or execution mode (Sonnet — lean, specific, token-efficient)?"

State the detected mode clearly before producing output.

---

## Workflow 1: Optimize a New Prompt

**Input**: A raw intent, rough prompt, or description of what the user wants to accomplish — or a file selected from the queue in Workflow 0.

**Steps:**

1. Detect mode (Step 0 above)
2. Classify the task type (see categories below)
3. Read the appropriate reference file:
   - Plan mode → `references/plan-patterns.md`
   - Execution mode → `references/exec-patterns.md`
4. Apply the template for that task type + mode-specific optimization rules
5. Output the optimized prompt in a fenced code block (ready to copy)
6. Below the prompt, add **Optimization Notes** explaining each significant change

**Task type categories:**

| Category | Signal phrases |
|----------|---------------|
| Architecture / Design | "should I", "how to approach", "design", "architecture", "what's the right way" |
| New Feature | "add", "implement", "build", "create a new" |
| Bug Investigation | "why", "what's causing", "diagnose", "root cause", "not working" |
| Bug Fix | "fix", "resolve the error", "make it work" |
| Refactoring | "refactor", "restructure", "clean up", "improve the code" |
| Test Writing | "write tests", "add coverage", "test this" |
| Code Review | "review", "analyze this PR", "evaluate this diff" |
| Migration / Upgrade | "migrate", "upgrade", "move from X to Y" |
| Investigation | "understand", "explore", "how does X work", "find where" |
| Quick Change | "rename", "update this line", "change X to Y" |

---

## Workflow 2: Review an Existing Prompt

**Input**: Path to a command (`.claude/commands/`), agent (`.claude/agents/`), SKILL.md (`.claude/skills/`), or any markdown file containing a prompt.

**Steps:**

1. Read the target file
2. Determine what mode it targets (plan, execution, or both)
3. Read `references/anti-patterns.md`
4. Analyze the prompt against the quality criteria below
5. Produce a structured report
6. Offer to output a rewritten version

**Quality criteria:**

| Criterion | Questions to ask |
|-----------|-----------------|
| Token efficiency | Are there redundant phrases, repeated constraints, unnecessary preamble? |
| Specificity | Are instructions vague ("follow best practices") or concrete ("add X to file Y")? |
| Mode alignment | Is the detail level appropriate for the target model? |
| Acceptance criteria | Is it clear what "done" looks like? |
| Scope | Is the prompt trying to do too many things at once? |
| Examples | Does it show what good output looks like rather than just describing it? |

**Report format:**

```
## Prompt Review: [filename]
**Target mode:** [plan / execution / both]
**Overall assessment:** [1-2 sentences]

### Issues

| Severity | Issue | Line/Section | Suggestion |
|----------|-------|--------------|-----------|
| High | ... | ... | ... |
| Medium | ... | ... | ... |
| Low | ... | ... | ... |

### Token Estimate
Approximate savings from applying suggestions: ~X tokens (~Y%)
```

After the report, ask: "Want me to produce a rewritten version applying these suggestions?"

---

## Optimization Principles by Mode

### Plan Mode (Opus)

Opus benefits from thorough context and structured reasoning requests. A good plan prompt:

- **Spends the context budget** — include broader system context, related components, constraints, and future implications. Opus uses this to reason better, not just regurgitate.
- **Pre-loads context files** — when the prompt depends on reading specific files, include them as `@` references at the top of the output `.md` file. When the user copies the file content and pastes into the CLI, these resolve and pre-load the files into context without tool calls. Especially valuable for plan mode where Opus benefits from having all context available before reasoning.
- **Asks for structured output** — numbered plans, decision matrices, risk tables, alternatives comparison. Don't just say "give me a plan"; say "give me a numbered implementation plan with a risks section and at least two alternatives considered."
- **Names the trade-offs explicitly** — "Consider trade-offs between X and Y" produces better output than hoping Opus will surface them.
- **Encourages reasoning** — phrases like "Think through the implications before proposing an approach" signal that deliberate analysis is expected, not a quick answer.
- **Specifies the output format** — "Return a plan with: Context, Approach, Implementation Steps (numbered), Risks, and Open Questions sections."
- **Includes scope boundaries** — what's in scope AND what's explicitly out of scope prevents plan bloat.

### Execution Mode (Sonnet)

Sonnet is fast and capable, but every token in the prompt is a token not used for output. A good execution prompt:

- **Uses `@` for key files** — include `@path/to/file` references at the top of the output file for files being fixed, tested, or refactored. Sonnet gets the file contents immediately without a Read tool call.
- **Leads with the action** — "Fix the NPE in `PokService.java:87`" not "I've been experiencing an issue where..."
- **Names specific files** — "Edit `web/src/components/PokCard.tsx`" not "update the card component"
- **States the acceptance criterion** — "Done when `npm test` passes and the card renders the tag list"
- **References existing patterns** — "Follow the same pattern as `TagSection.tsx`" saves Sonnet from inventing a new approach
- **Uses imperative voice throughout** — "Add", "Remove", "Replace", "Update" — not "You should add" or "It would be good to"
- **Strips background context** — if CLAUDE.md already documents a convention, don't repeat it in the prompt
- **One goal per prompt** — if there are multiple changes, either sequence them explicitly or split into separate prompts

---

## Output Format

Write the optimized prompt to `prompts/optimized/<slug>.md` using the Write tool, where `<slug>` is a kebab-case summary of the task (e.g., `nielsen-heuristics-ui-workflows.md`).

**File structure:**

```
@.claude/skills/frontend-design/SKILL.md
@.claude/skills/mobile-design-system/SKILL.md

## Context
[prompt body...]

## Request
[structured output request...]
```

Rules for the output file:
- `@` references go at the very top, one per line, no backticks, no bullets — just raw `@path` lines
- Only include `@` references for **concrete files that exist** — never for template placeholders like `[path/to/file]`
- The prompt body follows after one blank line, as regular markdown
- No wrapping fenced code block — the file IS the prompt, ready to copy-paste

**Why this format works:** When the user opens the file in VS Code, copies all content, and pastes into the Claude Code CLI input, the `@` references resolve at paste time — pre-loading file contents into context without any tool calls.

**Terminal output** after writing the file — show only:
1. The file path: `Prompt saved to: prompts/optimized/<slug>.md`
2. **Optimization Notes** (one line per change, explaining what changed and why — meta-commentary stays in terminal, not in the prompt file)

---

## Reference Files

- `references/plan-patterns.md` — Templates for 7 plan-mode task types (load when optimizing for Opus)
- `references/exec-patterns.md` — Templates for 7 execution-mode task types (load when optimizing for Sonnet)
- `references/anti-patterns.md` — Common prompt mistakes with before/after fixes (load when reviewing existing prompts)

Load only the reference file you need for the current task. Don't load all three at once.
