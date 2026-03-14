# Enhancing CLAUDE.MD

## Context

On this session we'll work on improving both this project's and root (`~/.claude/CLAUDE.md`) `CLAUDE.md` files.
I want to enhance it not only for project **learnimo**, but also for any other future projects where I use Claude Code, hence the changes to root `claude.md`.

## Goal

Our goal is to add the directives below under section `## Workflow Orchestration` (everything after the section separator: `---`) to my current `CLAUDE.md` files in a manner that it "merges", i.e., expands and improves what I have already set there.

## Directives for this session

- DO NOT replace my `CLAUDE.md` files with the directives below
- DO NOT just copy and paste the directives below to my `CLAUDE.md` files
- If my current `CLAUDE.md` files already have any of the items below, present me a way to join them or to select the better version of them (either mine or the directives below must be better written)
- If my current `CLAUDE.md` files already have directives that are conflicting, i.e. telling opposite patterns, with any of the items below, present me the conflicts and let me decide
- Prompt me for any ambiguities
- Prompt me in case the `CLAUDE.md` files are getting to bloated and we need strategies for adding the directives, while keeping my original patterns, and having everything fit in
- Confirm you understood before proceeding and wait for my approval

---

## Workflow Orchestration

### 1. Plan Mode default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project
  
### 4. Verification Before Done

- Never mark a task complete without proving it work
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a Staff Engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `docs/tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `docs/tasks/todo.`SearchMode`
6. **Capture Lessons**: Update `docs/tasks/lessons.md`

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
