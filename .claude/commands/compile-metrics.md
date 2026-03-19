---
description: Aggregate session delta files into the canonical usage-stats.toml
argument-hint: <no arguments>
---

**Compile Session Metrics Workflow**

Aggregates all per-session delta files from `.claude/metrics/sessions/` into the canonical `.claude/metrics/usage-stats.toml`. Run this on `develop` after feature PRs are merged.

Execute the following steps in order:

## 0. Sync Automation Registry

Before compiling, run the registry sync script to keep KNOWN_AGENTS, KNOWN_COMMANDS, and documentation tables in sync with the current agent/command files:

```bash
python3 .claude/scripts/sync-automation-registry.py
```

If the script reports changes, they will be included in the commit at Step 6.

## 1. Guard: Verify Branch

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

If not on `develop`, **stop immediately** with:
> "⚠️ You are on `$CURRENT_BRANCH`, not `develop`. /compile-metrics must run on `develop`. Switch branches and try again."

Do not proceed.

## 2. Check for Session Files

```bash
ls .claude/metrics/sessions/*.toml 2>/dev/null | grep -v '\.gitkeep'
```

If no `.toml` files exist (only `.gitkeep` or empty directory):
> "No session delta files found in `.claude/metrics/sessions/`. Nothing to compile."

Stop — this is a clean no-op.

## 3. Read the Baseline

Read `.claude/metrics/usage-stats.toml` as the cumulative baseline. This file holds the canonical accumulated totals.

## 4. Aggregate Delta Files

For each `.toml` file in `.claude/metrics/sessions/` (skip `.gitkeep`):

1. Parse the session delta file
2. For each `[agent_usage.X]` entry in the delta:
   - If entry exists in baseline: `baseline.invocations += delta.invocations`
   - If entry is new: add the entry to baseline with the delta's count
   - Take the **later** of `baseline.last_used` vs `delta.last_used` as the new `last_used`
3. Repeat for each `[command_usage.X]` entry

Use Python for this to avoid manual TOML parsing errors:

```bash
python3 - <<'PYEOF'
import re
from pathlib import Path
from datetime import datetime, timezone

def parse_entries(text):
    """Extract {section.key: {invocations, last_used}} from TOML text."""
    entries = {}
    current_section = None
    current_key = None
    for line in text.splitlines():
        m = re.match(r'^\[(agent_usage|command_usage)\.(.+)\]', line)
        if m:
            current_section, current_key = m.group(1), m.group(2)
            entries[(current_section, current_key)] = {}
        elif current_section and '=' in line:
            k, _, v = line.partition('=')
            k = k.strip()
            v = v.strip().strip('"')
            if k == 'invocations':
                entries[(current_section, current_key)]['invocations'] = int(v)
            elif k == 'last_used':
                entries[(current_section, current_key)]['last_used'] = v
    return entries

def update_baseline(baseline_text, entries):
    """Sum delta entries into baseline text."""
    for (section, key), delta_vals in entries.items():
        header = f'[{section}.{key}]'
        delta_inv = delta_vals.get('invocations', 0)
        delta_ts = delta_vals.get('last_used', '')
        if header in baseline_text:
            # Increment invocations
            pattern = re.compile(
                rf'(\[{re.escape(section)}\.{re.escape(key)}\]\s*\n'
                rf'invocations = )(\d+)',
            )
            baseline_text = pattern.sub(
                lambda m, d=delta_inv: m.group(1) + str(int(m.group(2)) + d),
                baseline_text
            )
            # Update last_used if delta is more recent
            ts_pattern = re.compile(
                rf'(\[{re.escape(section)}\.{re.escape(key)}\][^\[]*last_used = )"([^"]*)"'
            )
            def update_ts(m, new_ts=delta_ts):
                existing = m.group(2)
                chosen = new_ts if new_ts > existing else existing
                return f'{m.group(1)}"{chosen}"'
            baseline_text = ts_pattern.sub(update_ts, baseline_text)
        else:
            # New entry — append before [productivity] or at end
            new_entry = (
                f'\n[{section}.{key}]\n'
                f'invocations = {delta_inv}\n'
                f'last_used = "{delta_ts}"\n'
            )
            if '[productivity]' in baseline_text:
                baseline_text = baseline_text.replace('[productivity]', new_entry + '\n[productivity]', 1)
            else:
                baseline_text += new_entry
    return baseline_text

baseline_path = Path('.claude/metrics/usage-stats.toml')
sessions_dir = Path('.claude/metrics/sessions')

baseline = baseline_path.read_text(encoding='utf-8')
session_files = [f for f in sessions_dir.glob('*.toml') if f.name != '.gitkeep']

if not session_files:
    print('NO_SESSION_FILES')
else:
    for sf in session_files:
        delta_text = sf.read_text(encoding='utf-8')
        delta_entries = parse_entries(delta_text)
        baseline = update_baseline(baseline, delta_entries)
        print(f'Merged: {sf.name}')

    # Update metadata
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    baseline = re.sub(r'timestamp = "[^"]*"', f'timestamp = "{now}"', baseline)
    baseline = re.sub(r'updated_by = "[^"]*"', 'updated_by = "compile-metrics"', baseline)

    # Recalculate health counters
    total_agents = len(re.findall(r'^\[agent_usage\.', baseline, re.MULTILINE))
    total_commands = len(re.findall(r'^\[command_usage\.', baseline, re.MULTILINE))
    baseline = re.sub(r'total_agents = \d+', f'total_agents = {total_agents}', baseline)
    baseline = re.sub(r'total_commands = \d+', f'total_commands = {total_commands}', baseline)

    baseline_path.write_text(baseline, encoding='utf-8')
    print(f'Updated: {baseline_path}')
    print(f'Health: {total_agents} agents, {total_commands} commands')
PYEOF
```

If output contains `NO_SESSION_FILES`, stop — nothing to compile.

## 4B. Compute LOC Productivity Metrics

Count lines of code across all stacks and write snapshot values into the `[productivity]` block of `usage-stats.toml`. Includes mobile Maestro E2E YAML files in the test count.

```bash
python3 .claude/scripts/loc_compute.py
```

## 4C. Aggregate PR Review Quality Metrics

Sum the `[pr_review_quality]` section across all session delta files into `usage-stats.toml`.

```bash
python3 .claude/scripts/pr_quality.py
```

## 4D. Compute Spec Pipeline Health

Count spec files in `docs/specs/features/` by their current Status and write snapshot values into the `[spec_pipeline]` block of `usage-stats.toml`.

Status normalization: `Complete` → `implemented`; `In Progress` → `in_progress`; all others lowercased with spaces replaced by underscores.

```bash
python3 .claude/scripts/spec_pipeline.py
```

## 4F. Compute Delivered Capability (DC) Metrics

Parse all `docs/ROADMAP.phase-*.md` files for milestone items, compute weighted DC totals and time-series periods. See ADR-008 for weight definitions.

```bash
python3 .claude/scripts/dc_counter.py --json | python3 .claude/scripts/dc_timeline.py
```

`dc_counter.py` writes `[dc_timeline]` totals to `usage-stats.toml` and emits DC JSON to stdout.
`dc_timeline.py` reads that JSON and writes `[[dc_timeline.periods]]` entries.

## 4G. Compute DORA Performance Metrics

Compute deployment frequency and lead time from git merge history (last 8 weeks by default).

```bash
python3 .claude/scripts/dora_metrics.py
```

Writes `[dora_metrics]` to `usage-stats.toml`.

## 4H. Compute LOC Churn

Track lines added/deleted since the last `/compile-metrics` run.

```bash
python3 .claude/scripts/loc_churn.py
```

Appends a `[[loc_churn.periods]]` entry and updates `churn_baseline_commit` in `[metadata]`.

## 4E. Trigger Automation Sentinel

Run the automation-sentinel agent **before** staging and committing, so any rows it appends to `recommendations.md` are included in the same commit.

Use the Agent tool with `subagent_type: automation-sentinel` and the full automation-sentinel prompt from `.claude/agents/automation-sentinel.md`.

The agent should:
1. Read `.claude/metrics/recommendations.md` (dedup check — **required first step**)
2. Read `.claude/metrics/usage-stats.toml`
3. Read all agent files in `.claude/agents/` (skip `archive/` subdirectory)
4. Read all command files in `.claude/commands/`
5. Generate a health report covering: overall status, usage tables, zero-usage analysis, redundancy analysis, gaps, spec pipeline health, and new recommendations (deduplicated against the record table)

**Agent Usage table requirements:**
- Include a `Type` column with `Built-in` (Explore, Plan, general-purpose) or `Custom` (all others in `.claude/agents/`)
- Do NOT use parenthetical "(built-in)" annotations in the Agent name column

**Recommendations output:** The sentinel appends any new recommendations directly to `.claude/metrics/recommendations.md` with status `open`. It includes a dedup summary line in its report. The file is staged in Step 5.

## 5. Stage and Remove Processed Delta Files

```bash
git add .claude/metrics/usage-stats.toml
git add .claude/metrics/recommendations.md
git add .claude/metrics/productivity-reports/ 2>/dev/null || true
git rm .claude/metrics/sessions/*.toml 2>/dev/null || true
```

> Note: `.gitkeep` is NOT removed — it ensures the directory remains tracked after all session files are deleted.

## 6. Commit

```bash
git commit -m "chore: compile session metrics"
```

## 7. Push to Remote

```bash
git push origin develop
```

## 8. Summary

Report:
- How many session files were compiled
- Which agents/commands had their counts updated
- New total counts for the top 5 most-used agents and commands

Display the sentinel's health report (generated in Step 4E) as the final output of `/compile-metrics`.
