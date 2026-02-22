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
cd backend && mvn verify -q        # compiles, tests, and checks in one pass
```

Then check JaCoCo coverage before proceeding:
```bash
python3 -c "
import xml.etree.ElementTree as ET
tree = ET.parse('backend/target/site/jacoco/jacoco.xml')
root = tree.getroot()
for c in root.findall('counter[@type=\"LINE\"]'):
    missed = int(c.get('missed', 0))
    covered = int(c.get('covered', 0))
    total = missed + covered
    pct = (covered / total * 100) if total else 0
    print(f'LINE coverage: {covered}/{total} ({pct:.1f}%)')
    print('BELOW_THRESHOLD' if pct < 90 else 'OK')
"
```

**If output contains `BELOW_THRESHOLD`:**
- Do NOT proceed to docs or commit
- Delegate to the `steward` agent with full context:
  - Current coverage percentage
  - Path to `backend/target/site/jacoco/jacoco.xml`
  - The failing threshold (90%)
- Wait for the agent to complete and confirm coverage is now above 90%
- Then re-run `mvn verify -q` one more time to confirm BUILD SUCCESS before continuing

**If output contains `OK`:** proceed normally.

> **Timeout:** Always use `timeout: 300000` (5 minutes) for this Bash call. The default 2-minute
> timeout causes false failures when Testcontainers integration tests are present. The Bash tool
> exits with code 1 even though Maven succeeds — a known Windows + Testcontainers issue.

Then run the unused import check (Java compiler does not catch these — Checkstyle does):
```bash
# Uses google_checks.xml bundled in the plugin — no pom.xml change needed
(cd backend && mvn org.apache.maven.plugins:maven-checkstyle-plugin:3.3.1:checkstyle \
  -Dcheckstyle.config.location=google_checks.xml -q 2>&1 \
  | grep "UnusedImports")
# If any UnusedImports lines appear → STOP and fix before committing.
# If the grep returns nothing → no unused imports detected, proceed.
```

**Web** — only if `web/` files changed:

> **Windows/Git Bash note:** `npm run <script>` on Windows may silently return exit code 1
> even when the underlying tool succeeds. If output is empty and exit code is 1, re-run
> using the tool directly (e.g., `npx eslint src`, `npx next build`, `npx vitest run`).
> Treat empty-output exit-1 as a shell wrapper issue, not a real failure — verify by running
> the tool directly. If the direct invocation also fails with actual error messages, STOP.

```bash
# Preferred: run tools directly so output is never swallowed by npm wrapper
(cd web && npx eslint src)            # lint — also catches unused imports via @typescript-eslint/no-unused-vars
(cd web && npx next build)            # type-check + production build
(cd web && npx vitest run)            # unit tests
```

> **Unused imports (TypeScript):** Caught automatically by `npx eslint src` via the
> `@typescript-eslint/no-unused-vars` rule (included in `next/typescript`). No separate step needed.

**Mobile** — only if `mobile/` files changed:
```bash
(cd mobile && npm run lint)
(cd mobile && npm run test)
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
