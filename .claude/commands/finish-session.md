---
description: Finish session with build, lint, tests, docs update, and commit
argument-hint: <optional-commit-message-context>
---

@CLAUDE.md
@ROADMAP.md
@README.md

**Session Finalization Workflow**

Additional context for commit message: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates documentation tasks to `tech-writer` agent. The agent MUST NEVER call `/finish-session` back (would create infinite loop).

Execute the following steps in order:

## 1. Build, Lint, and Test (if applicable)

**If any check fails: STOP. Report the failure. Do not proceed to docs or commit.**

For each layer, check whether files in that directory were modified this session before running:

**Backend** — only if `backend/` files changed:
```bash
cd backend && ./mvnw verify -q        # compiles, tests, and checks in one pass
```

**Web** — only if `web/` files changed:
```bash
cd web && npm run lint                 # lint first (fast feedback)
cd web && npm run build               # type-check + production build
cd web && npm run test                # unit tests
```

**Mobile** — only if `mobile/` files changed:
```bash
cd mobile && npm run lint
cd mobile && npm run test
```

If a layer was not touched this session, skip it entirely.

**Failure protocol — HARD RULE:**
- Show the exact error output
- Do NOT update docs
- Do NOT commit — under any circumstance
- Ask the user how to proceed
- The ONLY exception is if the user explicitly says "commit anyway" or "bypass" — in that case, warn clearly and proceed only with their confirmation

## 2. Update ROADMAP.md (REQUIRED - Delegate to tech-writer)

**Determine session context:**
- If `$ARGUMENTS` contains sufficient details → Use it directly
- If `$ARGUMENTS` is empty/vague → Ask user: "What was completed this session?"

**Delegate to `tech-writer` agent** to update ROADMAP.md:
- Move completed tasks from "In Progress" → "Implemented" section
- Update "In Progress" with current work
- Reprioritize "Next Steps"
- Update "Last updated" timestamp to today's date

## 3. Update Other Documentation (if needed - Delegate to tech-writer)

**Review what was implemented** and determine which documentation needs updates:
- **CLAUDE.md** - Only for new architecture patterns or critical directives
- **README.md** - If new features/endpoints were added
- **OpenAPI annotations** - If new REST endpoints were added (CRITICAL)
- **Javadoc** - If new backend classes/methods were added
- **JSDoc/TSDoc** - If new frontend components/hooks were added

**If updates needed** → Delegate to `tech-writer` agent.

## 4. Review Changes

Show consolidated git diff for all modified files so I can review before committing.

## 5. Commit

After I approve the diff, create a commit with:
- Proper semantic commit message (feat/fix/docs/refactor/test/chore)
- Reference to what was implemented
- Claude Code footer

## 6. Feature Branch PR Prompt (Optional)

**Detect if on feature branch:**
```bash
CURRENT_BRANCH=$(git branch --show-current)

# Check if on a feature branch (not main/develop)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "develop" ]]; then
  echo "Feature branch detected: $CURRENT_BRANCH"
fi
```

**If on feature branch, ask user:**
"You're on feature branch `$CURRENT_BRANCH`. Is this feature complete and ready for PR? (y/n)"

**If YES:**
- Invoke `/create-pr` command with current context
- Exit after PR creation

**If NO:**
- Skip PR creation
- Continue to Session Summary

## 7. Session Summary

Provide a brief summary:
- What was accomplished
- Test results (if tests were run)
- What's next (link to ROADMAP.md priorities)
- Any blockers or pending items
