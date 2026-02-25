---
description: Finish session with build, lint, tests, docs update, and commit
argument-hint: <optional-commit-message-context>
---

@CLAUDE.md
@docs/ROADMAP.md

**Session Finalization Workflow**

Additional context for commit message: $ARGUMENTS

**Anti-Cyclic Dependency Note:**
This command delegates documentation tasks to `tech-writer` agent. The agent MUST NEVER call `/finish-session` back (would create infinite loop).

Execute the following steps in order:

## 1. Build, Lint, and Test (if applicable)

**If any check fails: STOP. Report the failure. Do not proceed to docs or commit.**

For each layer, check whether files in that directory were modified this session before running:

**Backend** — only if `backend/` files changed:

First, verify Docker is running (required for Testcontainers integration tests):
```bash
docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_DOWN"
```

**If DOCKER_DOWN:**
1. Attempt to start Docker Desktop:
   ```bash
   start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" && sleep 20
   docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_STILL_DOWN"
   ```
2. If still down → **STOP. Ask the user** whether to wait for Docker or abort. Do NOT proceed without Docker — integration tests will be silently skipped, leaving coverage data incomplete and integration regressions undetected.

**If DOCKER_OK:** proceed:
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

## 2. Update Phase File and Archive Completed Milestones (REQUIRED - Delegate to tech-writer)

> ⚠️ **ROADMAP.md is an index only.** Never write milestone details into it.
> All milestone updates go in `docs/ROADMAP.phase-{N}.md` only.

**Determine session context:**
- If `$ARGUMENTS` contains sufficient details → Use it directly
- If `$ARGUMENTS` is empty/vague → Ask user: "What was completed this session?"

**Detect current phase:**
```bash
grep "CURRENT_PHASE:" docs/ROADMAP.md
# e.g. <!-- CURRENT_PHASE: 1 --> → load docs/ROADMAP.phase-1.md
```

**Delegate to `tech-writer` agent** to update the current phase file (`docs/ROADMAP.phase-{N}.md`):
- Mark newly completed tasks as ✅
- Move completed items into the appropriate "Completed" section within the phase file
- Update "Active / Pending" section with remaining work

**Check for milestone completion:**
After updating the phase file, check: are ALL items in any milestone now ✅?
- **If yes:** The milestone is complete — tech-writer confirms it is already in the "Completed" section of the phase file. No separate archive needed; the phase file is the record.
- **If the entire phase is now complete** (all milestones ✅):
  1. Update `<!-- CURRENT_PHASE: N -->` in `docs/ROADMAP.md` to `N+1`
  2. Update `<!-- CURRENT_PHASE_FILE: ... -->` accordingly
  3. Update `CLAUDE.md` "Current Focus" section to reflect the new active phase
  4. Update `README.md` roadmap section to reflect phase completion

## 3. Documentation Staleness Check (ALWAYS - Delegate to tech-writer)

**Always delegate to `tech-writer` agent.** The check is scoped to what changed this session — not a full-repo audit. tech-writer must verify each applicable item below and explicitly confirm it is current or fix it.

### If `backend/` files changed:
- [ ] **OpenAPI annotations** — every new/modified endpoint has `@Tag`, `@Operation`, `@ApiResponses`, `@Parameter`. Missing = CRITICAL, block commit.
- [ ] **Javadoc** — every new/modified public class has `@author` and `@since`. Missing = fix before commit.
- [ ] **`backend/CLAUDE.md`** — Java conventions still accurate? Any new pattern introduced this session that contradicts or extends the documented rules?

### If `web/` files changed:
- [ ] **`web/CLAUDE.md`** — TypeScript/Next.js conventions still accurate?
- [ ] **README.md features section** — does it reflect what's now implemented?

### If `mobile/` files changed:
- [ ] **`mobile/CLAUDE.md`** — conventions still accurate?
- [ ] **README.md features section** — updated?

### Always (regardless of stack):
- [ ] **3-way phase consistency** — `CURRENT_PHASE` in `docs/ROADMAP.md` matches `CLAUDE.md` "Current Focus" matches README.md. If diverged, ROADMAP.md is the source of truth; fix the others.
- [ ] **README.md "In Progress" section** — does it reflect reality? Remove anything that shipped this session.

**If any item is stale:** fix it in the same commit. Do not leave docs debt.

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
