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

Count lines of code across all stacks and write snapshot values into the `[productivity]` block of `usage-stats.toml`.

> Note: Only snapshot counts (`current_*` and `test_ratio_percent`) are computed here. Cumulative churn metrics (`total_locs_added`, `total_locs_deleted`, `net_locs`) require tracking a baseline commit and are deferred — they remain at 0.

```bash
python3 - <<'PYEOF'
import re
from pathlib import Path

def count_lines(patterns, exclude_substrings=None):
    total = 0
    for pattern in patterns:
        for f in Path('.').glob(pattern):
            path_str = str(f).replace('\\', '/')
            if exclude_substrings and any(ex in path_str for ex in exclude_substrings):
                continue
            try:
                total += sum(1 for _ in f.open(encoding='utf-8', errors='ignore'))
            except OSError:
                pass
    return total

# Backend
be_prod = count_lines(['backend/src/main/java/**/*.java'])
be_test = count_lines(['backend/src/test/java/**/*.java'])

# Web — production: *.ts / *.tsx excluding tests
web_prod = count_lines(
    ['web/src/**/*.ts', 'web/src/**/*.tsx'],
    exclude_substrings=['__tests__/', '.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']
)
web_test = count_lines(['web/src/**/*.test.ts', 'web/src/**/*.test.tsx'])
web_test += count_lines(['web/src/**/__tests__/**/*.ts', 'web/src/**/__tests__/**/*.tsx'])
e2e_test = count_lines(['web/e2e/**/*.ts'])

# Mobile
mob_prod = count_lines(
    ['mobile/src/**/*.ts', 'mobile/src/**/*.tsx'],
    exclude_substrings=['__tests__/', '.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']
)
mob_test = count_lines(['mobile/src/**/*.test.ts', 'mobile/src/**/*.test.tsx'])
mob_test += count_lines(['mobile/src/**/__tests__/**/*.ts', 'mobile/src/**/__tests__/**/*.tsx'])

prod_total = be_prod + web_prod + mob_prod
test_total = be_test + web_test + e2e_test + mob_test
grand_total = prod_total + test_total
ratio = (test_total / prod_total * 100) if prod_total > 0 else 0.0

stats = Path('.claude/metrics/usage-stats.toml').read_text(encoding='utf-8')
stats = re.sub(r'current_total_locs = \d+', f'current_total_locs = {grand_total}', stats)
stats = re.sub(r'current_production_locs = \d+', f'current_production_locs = {prod_total}', stats)
stats = re.sub(r'current_test_locs = \d+', f'current_test_locs = {test_total}', stats)
stats = re.sub(r'test_ratio_percent = [\d.]+', f'test_ratio_percent = {ratio:.1f}', stats)
Path('.claude/metrics/usage-stats.toml').write_text(stats, encoding='utf-8')

print(f'Production LOC: {prod_total:,}  (backend={be_prod:,}, web={web_prod:,}, mobile={mob_prod:,})')
print(f'Test LOC:       {test_total:,}  (backend={be_test:,}, web={web_test:,}, e2e={e2e_test:,}, mobile={mob_test:,})')
print(f'Total LOC:      {grand_total:,}')
print(f'Test ratio:     {ratio:.1f}%')
PYEOF
```

## 4C. Aggregate PR Review Quality Metrics

Sum the `[pr_review_quality]` section across all session delta files into `usage-stats.toml`.

```bash
python3 - <<'PYEOF'
import re
from pathlib import Path

sessions_dir = Path('.claude/metrics/sessions')
baseline_path = Path('.claude/metrics/usage-stats.toml')

session_files = [f for f in sessions_dir.glob('*.toml') if f.name != '.gitkeep']
if not session_files:
    raise SystemExit(0)

totals = {
    'total_prs_triaged': 0,
    'total_comments_triaged': 0,
    'accepted': 0,
    'rejected': 0,
    'deferred': 0,
    'questions': 0,
    'informational': 0,
}

for sf in session_files:
    text = sf.read_text(encoding='utf-8')
    m = re.search(r'\[pr_review_quality\](.*?)(?=\n\[|\Z)', text, re.DOTALL)
    if not m:
        continue
    section = m.group(1)
    for key in totals:
        km = re.search(rf'^{re.escape(key)}\s*=\s*(\d+)', section, re.MULTILINE)
        if km:
            totals[key] += int(km.group(1))

if any(v > 0 for v in totals.values()):
    baseline = baseline_path.read_text(encoding='utf-8')
    # Read current baseline values and add delta totals
    for key, delta_val in totals.items():
        def inc_field(m, dv=delta_val):
            return m.group(1) + str(int(m.group(2)) + dv)
        baseline = re.sub(
            rf'({re.escape(key)} = )(\d+)',
            inc_field,
            baseline,
        )
    baseline_path.write_text(baseline, encoding='utf-8')
    print(f'PR review quality aggregated: {totals}')
else:
    print('No PR review quality deltas found — skipping')
PYEOF
```

## 5. Stage and Remove Processed Delta Files

```bash
git add .claude/metrics/usage-stats.toml
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

## 9. Trigger Automation Sentinel

After compilation, automatically run the automation-sentinel agent to analyze the freshly updated metrics. Use the Agent tool with `subagent_type: automation-sentinel` and the full automation-sentinel prompt from `.claude/agents/automation-sentinel.md`.

The agent should:
1. Read `.claude/metrics/usage-stats.toml`
2. Read all agent files in `.claude/agents/` (skip `archive/` subdirectory)
3. Read all command files in `.claude/commands/`
4. Generate a health report covering: overall status, usage tables, zero-usage analysis, redundancy analysis, gaps, and top 3-5 prioritized recommendations

**Agent Usage table requirements:**
- Include a `Type` column with `Built-in` (Explore, Plan, general-purpose) or `Custom` (all others in `.claude/agents/`)
- Do NOT use parenthetical "(built-in)" annotations in the Agent name column

Display the sentinel's report as the final output of `/compile-metrics`.
