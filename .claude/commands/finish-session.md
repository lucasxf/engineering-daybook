---
description: Finish session with build, lint, tests, docs update, and commit
argument-hint: <optional-commit-message-context>
---

@CLAUDE.md

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
python3 .claude/scripts/jacoco_report.py --summary backend/target/site/jacoco/jacoco.xml 90
```

**If output contains `BELOW_THRESHOLD`:**
- Do NOT proceed to docs or commit
- Delegate to the `steward` agent via the Agent tool with `subagent_type: steward`. Pass full context:
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
(cd web && npx vitest run --coverage) # unit tests + 50% line coverage threshold (enforced by vitest.config.ts; target 80%)
```

If vitest exits non-zero due to coverage below 50% → **STOP.** Do not commit. Show the coverage summary and ask the user how to proceed (add tests or lower threshold).


> **Unused imports (TypeScript):** Caught automatically by `npx eslint src` via the
> `@typescript-eslint/no-unused-vars` rule (included in `next/typescript`). No separate step needed.

**E2E coverage gate — Web new flows:**

After vitest, detect new pages/routes and touched E2E specs in the current working tree:
```bash
python3 .claude/scripts/session_delta.py --new-pages
python3 .claude/scripts/session_delta.py --e2e-touched
```

**E2E coverage rules:**
- New page/route (`web/src/app/[locale]/*/page.tsx`) → at least one E2E spec file must have been added or modified this session
- New multi-step user flow (create/edit/delete/auth) → must have an E2E test covering the happy path
- Minor UI-only changes (styling, copy, icons) → E2E not required

**If new pages detected but no E2E spec was touched: STOP.** Do not commit. Inform the user:
> "New page/flow detected but no E2E test found in `web/e2e/`. Add a Playwright test before committing. See `web/CLAUDE.md` for the mock API pattern."

Exceptions: user can explicitly say "skip E2E for this session" — warn and proceed.

**E2E test execution gate — Web:**

Run the full Playwright suite whenever `web/` files changed (coverage gate already passed):
```bash
(cd web && npx playwright test --reporter=line 2>&1 | tail -20)
```

- If Playwright exits with "Executable doesn't exist" or "browserType.launch: Executable doesn't exist" → auto-run `npx playwright install chromium` first, then retry once.
- If E2E tests fail → **STOP.** Do not commit. Show the failing test names and ask the user how to proceed.
- The dev server auto-starts via Playwright's `webServer` config (port 3001) — no backend needed.

**Orphaned export check (Web) — only if new `.tsx` or `.ts` files were added:**

Check whether any new components or hooks added this session have zero consumers:
```bash
python3 .claude/scripts/session_delta.py --new-exports
```

**If any new export has zero consumers → STOP.** Do not commit. Inform the user:
> "Orphaned export detected: `{file}` is exported but never imported anywhere. Wire it into a page/component, or remove it before committing. (Wiring gate — see CLAUDE.md #7)"

Exceptions: intentionally deferred components must have a documented note (in the spec's post-implementation notes or in a TODO comment in the file). User can override with explicit "skip wiring check for this session."

**Mobile** — only if `mobile/` files changed:
```bash
(cd mobile && npm run lint)
(cd mobile && npm run test:coverage) # unit tests + 80% line coverage threshold (enforced by jest.config.js coverageThreshold)
```

If Jest exits non-zero due to coverage below 80% → **STOP.** Do not commit. Show the coverage summary and ask how to proceed.

If a layer was not touched this session, skip it entirely.

**Output management — keep context clean:**
Build and test commands can produce thousands of lines. After running each stack's checks:
- Retain only: (1) PASS/FAIL status line, (2) error messages if failed, (3) coverage summary
- Discard verbose success output (test names, compilation progress, webpack stats) before proceeding to the next stack
- Use quiet flags where available: `mvn verify -q`, `npx vitest run --reporter=dot`

**Failure protocol — HARD RULE:**
- Show the exact error output
- Do NOT update docs
- Do NOT commit — under any circumstance
- Ask the user how to proceed
- The ONLY exception is if the user explicitly says "commit anyway" or "bypass" — in that case, warn clearly and proceed only with their confirmation

## 2. Documentation Updates (REQUIRED — Delegate to tech-writer)

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

**Delegate to `tech-writer` agent via the Agent tool with `subagent_type: tech-writer`** with all three sub-tasks in a single call. Pass:

**Sub-task A — Session Learnings** (only if Step 1 encountered non-trivial errors):
- Skip if Step 1 passed on first run with no issues
- Non-trivial = dependency incompatibility, tool misconfiguration, unexpected build/test behavior, environment quirk, anything requiring more than one fix attempt
- Pass: each failure (error message), its root cause, and the fix applied
- Agent routes each entry to the right file/section and confirms what was updated

**Sub-task B — Phase File Update** (always):
- Update `docs/ROADMAP.phase-{N}.md`: mark completed tasks ✅, move to "Completed" section, update "Active / Pending"
- If ALL items in any milestone are now ✅: confirm milestone is recorded in the phase file's "Completed" section
- If the entire phase is complete: update `<!-- CURRENT_PHASE: N -->` in `docs/ROADMAP.md`, update `CLAUDE.md` "Current Focus", update `README.md` roadmap section

**Sub-task C — Documentation Staleness Check** (always, scoped to this session):
- If `backend/` changed: verify OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponses`, `@Parameter`) on new/modified endpoints (missing = CRITICAL); Javadoc (`@author`, `@since`) on new/modified public classes; `backend/CLAUDE.md` conventions still accurate?
- If `web/` changed: verify `web/CLAUDE.md` conventions; README.md features section
- If `mobile/` changed: verify `mobile/CLAUDE.md` conventions; README.md features section
- Always: 3-way phase consistency (`CURRENT_PHASE` in ROADMAP.md = CLAUDE.md "Current Focus" = README.md; ROADMAP.md is source of truth); README.md "In Progress" section reflects reality
- Fix any stale item in the same commit — no docs debt

**tech-writer reports results for all three sub-tasks before this step is considered complete.**

## 3. Review Changes

Show consolidated git diff for all modified files so I can review before committing.

## 4. Commit

**Stage the session delta file first (REQUIRED — do not skip).**

The session delta TOML (e.g. `.claude/metrics/sessions/develop.toml`) is written live by the PostToolUse hook throughout the session. It must always be included in the final commit.

```bash
git add .claude/metrics/sessions/ || true
```

Then verify it is actually staged:
```bash
git diff --cached --name-only | grep "metrics/sessions/"
```

**If the grep returns nothing:** the file was either not modified this session (OK — proceed) or the `git add` silently failed (investigate before continuing).

The canonical `usage-stats.toml` is NOT modified by individual sessions — it is updated only by `/compile-metrics` on `develop`. Do not touch it here.

After I approve the diff, create a commit with:
- Proper semantic commit message (feat/fix/docs/refactor/test/chore)
- Reference to what was implemented
- Claude Code footer

## 5. Feature Branch PR Prompt (Optional)

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

## 6. Session Summary

Provide a brief summary:
- What was accomplished
- Test results (if tests were run)
- What's next (link to ROADMAP.md priorities)
- Any blockers or pending items

After the summary, output this exact closing banner so the user knows the command has finished:

```
---
✅ /finish-session complete
---
```
