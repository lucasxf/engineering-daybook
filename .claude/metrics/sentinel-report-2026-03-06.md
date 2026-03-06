# Automation Ecosystem Health Report

**Saved:** 2026-03-06 | **Source:** automation-sentinel agent

---

**Generated:** 2026-03-06 | **Branch:** develop | **Metrics Timestamp:** 2026-03-06T17:26:39Z

---

## Overall Health: HEALTHY (with advisory)

The automation ecosystem is structurally sound -- zero schema errors, all agents and commands have valid frontmatter, and the core session lifecycle (`/start-session` -> work -> `/finish-session` -> `/create-pr`) shows strong adoption. However, the metrics tracking system was introduced very recently (first `/compile-metrics` run today), so most counters reflect usage from a narrow window. The high zero-usage count (9 of 12 custom agents, 10 of 20 commands) is expected for this early stage but warrants a follow-up review in 2-4 weeks.

**Key stats:**
- **12 custom agent files** on disk (+ `general-purpose` and 2 built-in subagents `Explore`/`Plan` tracked in metrics = 13 agent entries in TOML; `steward` and `nexus` are on disk but NOT tracked in the TOML yet)
- **20 commands** tracked (+ `readme.md` is documentation, not a command = 21 files total)
- **0 schema errors**

---

## Agent Usage

| Agent | Invocations | Last Used | Purpose | Status |
|-------|-------------|-----------|---------|--------|
| **Explore** (built-in) | 10 | 2026-03-06 16:54 | Codebase exploration subagent | **Active** |
| **general-purpose** (built-in) | 9 | 2026-03-06 17:05 | Default delegation target | **Active** |
| **Plan** (built-in) | 2 | 2026-03-06 14:41 | Planning subagent | **Active** |
| automation-sentinel | 0 | -- | Meta-agent: ecosystem health reports | On-demand |
| sous-chef | 0 | -- | Backend (Java/Spring) code reviewer | Unused |
| imhotep | 0 | -- | Cross-project architect / pattern extraction | Unused |
| pixl | 0 | -- | UI/UX design specialist | Unused |
| hedy | 0 | -- | Mobile (Expo/RN) engineering advisor | Unused |
| professor-x | 0 | -- | Learning tutor (teaches frontend to backend devs) | Unused |
| virgil | 0 | -- | Product manager (user stories, prioritization) | Unused |
| pulse | 0 | -- | Metrics data collection | On-demand |
| session-optimizer | 0 | -- | Token efficiency / session planning | Unused |
| tech-writer | 0 | -- | Documentation specialist | Unused |
| **steward** | *not tracked* | -- | JaCoCo coverage gap fixer | **Missing from TOML** |
| **nexus** | *not tracked* | -- | Web (Next.js) engineering advisor | **Missing from TOML** |

### Top Agent Performers

1. **Explore** (10 invocations) -- The most-used subagent, used for codebase research and file discovery.
2. **general-purpose** (9 invocations) -- Default delegation target for miscellaneous tasks.
3. **Plan** (2 invocations) -- Used for structured planning sessions.

---

## Command Usage

| Command | Invocations | Last Used | Purpose | Status |
|---------|-------------|-----------|---------|--------|
| `/start-session` | 12 | 2026-03-06 15:00 | Session initialization with stack context | **Active** |
| `/finish-session` | 4 | 2026-03-06 16:48 | Session finalization (test, lint, docs, commit) | **Active** |
| `/create-pr` | 4 | 2026-03-06 16:56 | Pull request creation | **Active** |
| `/review-pr` | 4 | 2026-03-06 16:36 | PR triage (CI/CD + review comment evaluation) | **Active** |
| `/fix-pr` | 3 | 2026-03-06 16:40 | Implement approved items from triage report | **Active** |
| `/write-spec` | 1 | 2026-03-06 13:57 | Feature specification authoring | **Active** |
| `/implement-spec` | 1 | 2026-03-06 14:11 | Spec-driven TDD implementation | **Active** |
| `/compile-metrics` | 1 | 2026-03-06 17:25 | Aggregate session metrics into canonical TOML | **Active** |
| `/resume-session` | 0 | -- | Resume a previous session | Unused |
| `/directive` | 0 | -- | Add coding directive to CLAUDE.md | Unused |
| `/update-roadmap` | 0 | -- | Update phase file with progress | Unused |
| `/review-code` | 0 | -- | Trigger sous-chef for code review | Unused |
| `/quick-test` | 0 | -- | Run tests in quiet mode | Unused |
| `/build-quiet` | 0 | -- | Run build in quiet mode | Unused |
| `/verify-quiet` | 0 | -- | Run full verification (build + tests) | Unused |
| `/test-service` | 0 | -- | Run tests for specific service/class | Unused |
| `/docker-start` | 0 | -- | Start Docker Compose environment | Unused |
| `/docker-stop` | 0 | -- | Stop Docker Compose environment | Unused |
| `/api-doc` | 0 | -- | Add OpenAPI annotations to controller | Unused |
| `/save-response` | 0 | -- | Save Claude response to file | Unused |

### Top Command Performers

1. **/start-session** (12 invocations) -- Core workflow entry point, used every session. Clear value.
2. **/finish-session** (4 invocations) -- Session exit gate with test/lint/docs/commit checks. High value.
3. **/create-pr** (4 invocations) -- PR creation with auto-generated descriptions.
4. **/review-pr** (4 invocations) -- Structured PR triage workflow. Notable: used the same number of times as `/create-pr`, suggesting a disciplined review-before-merge pattern.
5. **/fix-pr** (3 invocations) -- Complement to `/review-pr`. The 4:3 ratio suggests one PR was triaged but not yet fixed.

---

## Zero-Usage Analysis

### Legitimately Idle (infrastructure, on-demand, or recently added -- no concern)

| Item | Type | Rationale |
|------|------|-----------|
| `automation-sentinel` | Agent | On-demand meta-agent. This is its first invocation. Zero-usage is by design. |
| `pulse` | Agent | On-demand data collection agent. Metrics were collected via `/compile-metrics` command instead, which performs pulse's role directly. |
| `session-optimizer` | Agent | Designed to auto-trigger with `/start-session`. Since `/start-session` handles context loading itself, the optimizer is functionally inlined into the command. |
| `/compile-metrics` | Command | Infrastructure command. 1 invocation (today) is expected -- it runs only when aggregating session deltas. |
| `/docker-start` / `/docker-stop` | Commands | Infrastructure convenience commands. Docker is started manually or by `/finish-session`'s Docker check. Low-frequency is normal. |
| `/save-response` | Command | Utility for saving responses to disk. Rarely needed; user may paste output directly. |

### Potentially Underutilized (have clear value but are not being used)

| Item | Type | Expected Usage | Concern |
|------|------|----------------|---------|
| `sous-chef` | Agent | Should be triggered by `/review-code`, `/implement-spec`, `/fix-pr` | The agent is defined as a code reviewer but has 0 direct invocations. Reviews happen informally (inline by the main session) rather than through structured agent delegation. |
| `tech-writer` | Agent | Should be triggered by `/finish-session` and `/implement-spec` | `/finish-session` delegates to tech-writer for docs updates. If the 4 `/finish-session` invocations used tech-writer, those invocations were not captured. Suggests **metrics hook may not track agent delegation from within commands**. |
| `nexus` | Agent | Frontend engineering decisions on Next.js work | Missing from TOML entirely. Added after initial metrics schema was created. |
| `steward` | Agent | Auto-triggered by `/finish-session` when JaCoCo coverage is below 90% | Missing from TOML entirely. Like `nexus`, added after initial schema. |
| `/review-code` | Command | Direct code review trigger for backend code | 0 invocations. Reviews happen through `/review-pr` + `/fix-pr` instead. |
| `/quick-test` / `/build-quiet` / `/verify-quiet` | Commands | Quick feedback loops during development | 0 invocations. User likely runs `mvn verify` or `npx vitest run` directly. |
| `/update-roadmap` | Command | Session progress tracking | 0 invocations. `/finish-session` (Step 3) already handles roadmap updates, making the standalone command redundant. |
| `/resume-session` | Command | Continue interrupted sessions | 0 invocations. Users likely run `/start-session` again instead. |
| `/directive` | Command | Add coding directives to CLAUDE.md | 0 invocations. Users edit CLAUDE.md directly or delegate to tech-writer. |
| `/api-doc` | Command | Add OpenAPI annotations | 0 invocations. Handled inline during implementation or by `/finish-session`'s doc staleness check. |
| `/test-service` | Command | Run tests for a specific service | 0 invocations. Overlaps with `/quick-test backend` and direct `mvn test -Dtest=...` calls. |

### Likely Stale or Dormant

| Item | Type | Concern |
|------|------|---------|
| `professor-x` | Agent | Learning tutor. The project is past the "learning frontend" phase. Unless actively used for onboarding, may not see future use. |
| `imhotep` | Agent | Cross-project pattern extraction. Project has only one repo. Value emerges when a second project begins. Currently dormant by design. |
| `virgil` | Agent | Product manager. Solo personal app — product decisions are made informally. With only 1 spec written, agent has minimal impact. |

---

## Redundancy Analysis

### Confirmed Overlaps

1. **`/update-roadmap` is fully subsumed by `/finish-session`**
   - `/finish-session` Step 3 performs the exact same roadmap update.
   - **Recommendation:** Keep as lightweight standalone for mid-session updates; document that `/finish-session` includes this step.

2. **`/quick-test`, `/build-quiet`, `/verify-quiet` overlap significantly**
   - `/verify-quiet` = `/build-quiet` + `/quick-test` combined. `/finish-session` Step 1 also runs verify.
   - **Recommendation:** Consider consolidating into a single `/check` command with `--mode=test|build|verify`.

3. **`/test-service` overlaps with `/quick-test backend`**
   - **Recommendation:** Merge `/test-service` into `/quick-test` as `/quick-test PokService`.

4. **`pulse` agent vs. `/compile-metrics` command**
   - `pulse` designed to scan git history. `/compile-metrics` uses per-session delta files — more reliable.
   - **Recommendation:** Archive `pulse` or repurpose as "full rescan" mode for `/compile-metrics`.

5. **`session-optimizer` vs. `/start-session`**
   - `/start-session` already handles context loading. `session-optimizer` aspirational features not implemented.
   - **Recommendation:** Inline token budget tracking into `/start-session` and retire the standalone agent.

### No Overlap (clean separation)

- `sous-chef` (backend) vs. `nexus` (web) vs. `hedy` (mobile) — clean stack-based separation.
- `pixl` (visual/UX) vs. `nexus`/`hedy` (engineering) — explicitly scoped.
- `steward` (coverage gap fixer) — unique purpose.
- `automation-sentinel` — unique meta-agent purpose.

---

## Gaps: Manual Workflows That Could Be Automated

1. **No post-merge hook to run `/compile-metrics`**
   - Requires manual invocation after PRs merge to develop. Metrics drift unless user remembers.
   - **Gap:** Automate via GitHub Actions workflow on push to `develop`.

2. **No automatic metrics capture for agent delegation within commands**
   - When `/finish-session` delegates to `tech-writer` or `steward`, those invocations are not counted.
   - **Gap:** Session delta hook likely only captures top-level agent invocations.

3. **No `/merge-pr` command**
   - Workflow goes `/create-pr` → `/review-pr` → `/fix-pr` but no command to complete the cycle.
   - **Gap:** Users merge via GitHub UI or `gh pr merge` manually.

4. **No periodic health check scheduling**
   - Agent documentation mentions weekly/monthly triggers but no mechanism exists.
   - **Gap:** Add reminder in `/start-session` if sentinel hasn't run in 7+ days.

---

## Prioritized Recommendations

### 1. Register `steward` and `nexus` in the metrics TOML schema (Priority: HIGH)

Two agents exist on disk but have no TOML entries — invocations silently dropped. Add entries and update `[health] total_agents`.

### 2. Fix nested agent invocation tracking (Priority: HIGH)

Most valuable agents (`tech-writer`, `sous-chef`, `steward`) are invoked as delegates from commands, not directly. Verify and fix the hook to track delegated invocations. Without this, metrics systematically undercount the most important agents.

### 3. Consolidate test/build convenience commands (Priority: MEDIUM)

Merge `/quick-test`, `/build-quiet`, `/verify-quiet`, `/test-service` into a single `/check` command with intelligent argument parsing.

### 4. Archive `pulse` agent (Priority: LOW)

`/compile-metrics` has replaced pulse's role. Move `pulse.md` to `.claude/agents/archive/` with a note.

### 5. Add staleness reminder to `/start-session` (Priority: LOW)

Check when `/compile-metrics` and `automation-sentinel` were last run. If older than 7 days, print a one-line nudge.

---

## Summary

The automation ecosystem is well-designed with clear separation of concerns and a mature command lifecycle. Core workflow commands show strong adoption (30 total invocations across the top 5 commands). Main risks:

- **Metrics blind spots:** 2 agents missing from schema; nested delegation likely not tracked.
- **Command sprawl:** 4 test/build convenience commands with overlapping functionality.
- **Dormant agents:** `professor-x`, `imhotep`, `virgil` serve niche purposes that may not recur regularly.

No agents or commands are broken or misconfigured. The ecosystem is healthy and functional — recommendations above are optimizations, not fixes.
