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

## Archive

_Implemented and rejected recommendations older than 60 days are moved here to keep the Active table lean._

| # | Date | Category | Title | Status | Status Date |
|---|------|----------|-------|--------|-------------|
