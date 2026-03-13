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
| REC-011 | 2026-03-12 | workflow | Enforce /review-spec gate — 0 approved specs while 19 are implemented | open | 2026-03-12 |
| REC-012 | 2026-03-12 | archival | Archive imhotep agent — 0 invocations, single-project constraint not yet met | open | 2026-03-12 |
| REC-013 | 2026-03-12 | metrics | Implement LOC churn tracking — total_locs_added/deleted/net_locs stuck at 0 | open | 2026-03-12 |
| REC-014 | 2026-03-13 | metrics | Track skills ecosystem in usage-stats.toml — 3 skills present but not metricked | open | 2026-03-13 |
| REC-015 | 2026-03-13 | archival | Evaluate professor-x agent — 0 invocations, no wiring to any command, no task delegation | open | 2026-03-13 |
| REC-016 | 2026-03-13 | workflow | Fix stale Co-Authored-By footer in /create-pr — hardcoded "Claude Opus 4.5" should be current model | open | 2026-03-13 |

## Archive

_Implemented and rejected recommendations older than 60 days are moved here to keep the Active table lean._

| # | Date | Category | Title | Status | Status Date |
|---|------|----------|-------|--------|-------------|
