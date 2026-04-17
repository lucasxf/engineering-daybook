# Automation Recommendations Record

> Tracked by automation-sentinel. New rows auto-appended with status `open`.
> Status changes are manual. Terminal states: `implemented`, `rejected`.
>
> **Columns:** `#` | `Date` (suggested) | `Category` | `Title` | `Status` | `Status Date` (last transition)
>
> **Statuses:** `open` → `approved` → `implemented` | `open` → `rejected` | `open` ⇄ `deferred`

## Active Recommendations

| # | Date | Category | Title | Status | Status Date |
|---|------|----------|-------|--------|-------------|
| REC-001 | 2026-03-06 | metrics | Register steward and nexus in metrics TOML | implemented | 2026-03-08 |
| REC-002 | 2026-03-06 | metrics | Fix nested agent invocation tracking | implemented | 2026-03-08 |
| REC-003 | 2026-03-06 | workflow | Consolidate test/build convenience commands into one command | implemented | 2026-03-08 |
| REC-004 | 2026-03-06 | archival | Archive pulse agent (replaced by compile-metrics delta-file approach) | implemented | 2026-03-08 |
| REC-005 | 2026-03-06 | workflow | Add staleness reminder to /start-session if sentinel hasn't run in 7+ days | deferred | 2026-03-08 |
| REC-006 | 2026-03-08 | workflow | Fix four broken build/test commands that use ./mvnw (fails on Windows) | implemented | 2026-03-08 |
| REC-007 | 2026-03-08 | archival | Fix session-optimizer wiring or archive the agent | implemented | 2026-03-08 |
| REC-008 | 2026-03-08 | workflow | Add /check-ci command to wrap non-standard gh CLI path | deferred | 2026-03-08 |
| REC-009 | 2026-03-08 | workflow | Promote nexus/hedy specialists at session start (stack-gated note) | deferred | 2026-03-08 |
| REC-010 | 2026-03-08 | archival | Archive resume-session, update-roadmap, review-code, api-doc, and virgil | implemented | 2026-03-08 |
| REC-011 | 2026-03-12 | workflow | Enforce /review-spec gate — 0 approved specs while 19 are implemented | rejected | 2026-03-13 |
| REC-012 | 2026-03-12 | archival | Archive imhotep agent — 0 invocations, single-project constraint not yet met | open | 2026-03-12 |
| REC-013 | 2026-03-12 | metrics | Implement LOC churn tracking — total_locs_added/deleted/net_locs stuck at 0 | open | 2026-03-12 |
| REC-014 | 2026-03-13 | metrics | Track skills ecosystem in usage-stats.toml — 3 skills present but not metricked | implemented | 2026-03-14 |
| REC-015 | 2026-03-13 | archival | Evaluate professor-x agent — 0 invocations, no wiring to any command, no task delegation | open | 2026-03-13 |
| REC-016 | 2026-03-13 | workflow | Fix stale Co-Authored-By footer in /create-pr — hardcoded "Claude Opus 4.5" should be current model | open | 2026-03-13 |
| REC-017 | 2026-03-13 | archival | virgil agent still on disk despite REC-010 marking archival as implemented — move to archive/ or delete | open | 2026-03-13 |
| REC-018 | 2026-03-13 | workflow | nexus agent has 0 invocations — verify trigger description or add explicit session-start promotion separate from REC-009 | open | 2026-03-13 |
| REC-019 | 2026-03-14 | archival | virgil is actively wired into /review-spec Phase 3 (subagent_type: virgil) — archiving it (REC-017) would break spec review pipeline; resolve dependency before archiving | rejected | 2026-03-14 |
| REC-020 | 2026-03-14 | metrics | prompt-optimizer is a Skill but tracked under command_usage in usage-stats.toml — add a skill_usage section or move it to the correct category | implemented | 2026-03-14 |
| REC-021 | 2026-03-14 | archival | /directive command has 1 invocation (2026-03-06) with no activity in 8+ days — evaluate whether it serves an ongoing purpose or should be archived | open | 2026-03-14 |
| REC-022 | 2026-03-15 | metrics | claude-code-guide appears in agent_usage in usage-stats.toml but has no corresponding .md file in .claude/agents/ — phantom entry should be removed or the agent file created | open | 2026-03-15 |
| REC-023 | 2026-03-15 | metrics | mobile-design-system is double-registered as both command_usage.mobile-design-system (1 invocation) and skill_usage.mobile-design-system (0 invocations) — split counts create false zero in skill tracking; remove the command_usage entry and ensure invocations flow to skill_usage | open | 2026-03-15 |
| REC-024 | 2026-03-15 | archival | Three skills have 0 invocations and no wiring to any command: doc-coauthoring, frontend-design, skill-creator — evaluate whether these serve active workflows or should be documented as on-demand-only with explicit trigger examples | open | 2026-03-15 |
| REC-025 | 2026-03-16 | archival | tech-writer.md Integration section references archived session-optimizer agent — stale cross-reference should be removed or updated to reflect current wiring | implemented | 2026-03-16 |
| REC-026 | 2026-03-16 | workflow | /review-spec has 0 invocations despite 5 post-creation specs (2 draft plus 3 planned) — the spec review gate is inactive; ensure new specs are routed through /review-spec before /implement-spec | rejected | 2026-03-16 |
| REC-027 | 2026-03-18 | workflow | hedy agent unused during Wave 6 mobile parity work (last used 2026-03-13, Wave 6 merged 2026-03-17) — mobile specialist should be consulted for mobile feature waves; verify REC-009 deferral or add hedy trigger to /implement-spec mobile tasks | open | 2026-03-18 |
| REC-028 | 2026-03-18 | workflow | hedy.md references Expo SDK 52 in Project Stack section but project is on Expo SDK 53 — stale reference may cause incorrect recommendations; update hedy.md to match mobile/CLAUDE.md | open | 2026-03-18 |
| REC-029 | 2026-03-18 | workflow | sous-chef has only 1 invocation (2026-03-12) despite significant backend work across Phases 3/5/6/8 — backend code review specialist is systematically under-utilised; add explicit sous-chef delegation to /finish-session backend gate or /create-pr pre-flight | open | 2026-03-18 |
| REC-030 | 2026-03-19 | workflow | /implement-spec has 6 invocations (last used 2026-03-08, 11 days ago) while write-spec has 9 and review-spec has 7; 3 specs are now Approved and 1 is Planned — approved specs are accumulating without being consumed; verify whether the approved specs are blocking on user scheduling or whether /implement-spec is being bypassed in favour of ad-hoc implementation | open | 2026-03-19 |
| REC-031 | 2026-03-20 | metrics | /productivity-report has 0 invocations despite being added as a full SPACE-framework command with 4 supporting scripts (dc_counter, dora_metrics, loc_churn, spec_pipeline) — the toolset was created 2026-03-19 but never run; run /productivity-report at least once per week to surface data-driven insights and validate the SPACE metric scripts work end-to-end | open | 2026-03-20 |
| REC-032 | 2026-03-20 | metrics | skill_usage.productivity-metrics has 0 invocations — this skill was added alongside /productivity-report but has never been triggered; verify whether it is intended as an on-demand complement to /productivity-report or is redundant given the command already covers the same workflow | open | 2026-03-20 |
| REC-033 | 2026-03-20 | workflow | hedy.md Project Stack section still lists "Expo SDK 52+" (REC-028 open since 2026-03-18) and the project is on SDK 53 — 2 days without resolution; the stale reference may cause hedy to recommend wrong SDK-specific APIs; update hedy.md line 18 to "Expo SDK 53+" to close REC-028 | open | 2026-03-20 |
| REC-034 | 2026-03-20 | archival | claude-code-guide appears in agent_usage (3 invocations, last used 2026-03-17) but has no .md file in .claude/agents/ — REC-022 flagged this as a phantom entry on 2026-03-15 and remains open; either create a minimal agent file for claude-code-guide or remove the agent_usage entry from usage-stats.toml to clean up the phantom | open | 2026-03-20 |
| REC-035 | 2026-03-20 | workflow | nexus agent has 0 invocations (REC-018 open since 2026-03-13) despite active Next.js feature work in Phases 6 and 8 — 7 days without improvement; /implement-spec dispatches nexus for web tasks in orchestrator mode but /implement-spec itself has not been run since 2026-03-08; the root cause is /implement-spec bypass, not nexus trigger failure; close REC-018 and redirect focus to REC-030 (implement-spec bypass) | open | 2026-03-20 |
| REC-036 | 2026-04-16 | workflow | /create-pr has 32 invocations but has not been used since 2026-03-19 (28 days) — PRs may be being created manually via gh CLI; verify whether /create-pr is being bypassed in favour of direct gh commands or whether feature branch work has paused | open | 2026-04-16 |
| REC-037 | 2026-04-16 | workflow | automation-sentinel has not run since 2026-03-19 (28 days) despite /compile-metrics having 20 invocations — the sentinel should auto-trigger from /compile-metrics Step 4E but the gap suggests it has been skipped; confirm Step 4E is not being bypassed in compile-metrics runs | open | 2026-04-16 |
| REC-038 | 2026-04-16 | metrics | skill_usage.save-learning has 0 invocations but save-learning is explicitly delegated from both /directive (Step 3) and tech-writer.md (Learning Routing section) — this is a wired-in delegate subject to the known undercount limitation; verify the skill is callable via the Skill tool and that tech-writer is actually invoking it | open | 2026-04-16 |

## Archive

_Implemented and rejected recommendations older than 60 days are moved here to keep the Active table lean._

| # | Date | Category | Title | Status | Status Date |
|---|------|----------|-------|--------|-------------|
