# Automation Metrics

This directory contains automation usage metrics collected by the `pulse` agent.

## Files

- `usage-stats.toml` - Agent and command usage statistics

## How It Works

1. **Collection**: The `pulse` agent scans git history and counts agent/command invocations
2. **Storage**: Metrics are stored in TOML format for human readability
3. **Analysis**: The `automation-sentinel` agent reads these metrics for analysis

## Manual Update

To update metrics manually:

```
"Update automation metrics"
```

This invokes the `pulse` agent to scan recent activity and update the TOML file.

## Metrics Schema

```toml
[metadata]
timestamp = "2026-01-29T00:00:00Z"
commit_sha = "abc123"
schema_version = "1.0.0"

[agent_usage.agent-name]
invocations = 0
last_used = "2026-01-29T00:00:00Z"

[command_usage.command-name]
invocations = 0
last_used = "2026-01-29T00:00:00Z"

[productivity]
current_total_locs = 0
test_ratio_percent = 0.0

[health]
total_agents = 9
total_commands = 16
```
