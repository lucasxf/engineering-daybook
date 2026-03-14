# Automation Metrics

This directory contains automation usage metrics and sentinel analysis artifacts.

## Files

- `usage-stats.toml` — Canonical agent and command usage statistics (aggregated by `/compile-metrics`)
- `recommendations.md` — Recommendation record table (tracked by automation-sentinel; auto-appended on each `/compile-metrics` run)
- `sessions/` — Per-session delta files (transient; consumed and deleted by `/compile-metrics`)
- `sentinel-report-*.md` — Point-in-time sentinel health reports (archived manually)

## How It Works

1. **Collection:** The `track-usage.py` PostToolUse hook writes per-session delta files to `sessions/{branch}.toml` whenever an agent or command is invoked
2. **Aggregation:** `/compile-metrics` runs on `develop` after PRs merge — reads delta files, merges them into `usage-stats.toml`, then deletes the session files
3. **Analysis:** The `automation-sentinel` agent reads `usage-stats.toml`, agent files, and command files to produce a health report and append new recommendations to `recommendations.md`
4. **Commit:** All changes (`usage-stats.toml`, `recommendations.md`) are committed together as `chore: compile session metrics`

## Updating Metrics

Run on `develop` after merging feature PRs:

```bash
/compile-metrics
```

## Metrics Schema

See `usage-stats.toml` for the full schema. Key sections:

```toml
[metadata]       # timestamp, branch, schema_version
[agent_usage.*]  # invocations + last_used per agent
[command_usage.*] # invocations + last_used per command
[productivity]   # LOC counts and test ratio
[pr_review_quality] # keepr verdict counts
[spec_pipeline]  # spec counts by status
[health]         # total_agents, total_commands, schema_errors
```
