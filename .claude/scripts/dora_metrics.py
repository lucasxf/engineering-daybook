"""
dora_metrics.py — DORA Performance dimension metrics

Computes two DORA metrics from git log (the informative ones for a solo dev repo):
  - Deployment Frequency: feat/* branches merged per week (rolling window)
  - Lead Time for Changes: median hours from first commit on branch → merge commit

CFR and MTTR are tracked but structurally ~0 for a single-developer repo with no
production SLAs. They serve as a health check rather than a performance indicator.

Writes [dora_metrics] section to usage-stats.toml.

Usage:
    python3 .claude/scripts/dora_metrics.py
    python3 .claude/scripts/dora_metrics.py --weeks 12   # custom window (default: 8)
"""

import re
import statistics
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


def run_git(args: list[str]) -> str:
    result = subprocess.run(
        ['git'] + args,
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    return result.stdout.strip()


def parse_iso_timestamp(ts: str) -> datetime:
    """Parse a git --format=%aI ISO 8601 timestamp."""
    ts = ts.strip()
    # Normalize timezone offset format
    if ts.endswith('Z'):
        ts = ts[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(ts)
    except ValueError:
        # Fallback: strip tz info
        return datetime.fromisoformat(ts[:19]).replace(tzinfo=timezone.utc)


def get_merge_commits(branch: str = 'develop') -> list[dict]:
    """Return list of merge commits on develop with timestamp and merged branch."""
    # --first-parent ensures we only see merges into develop, not transitive merges
    log = run_git([
        'log', '--merges', '--first-parent', branch,
        '--format=%H|%aI|%s'
    ])
    if not log:
        return []

    commits = []
    for line in log.splitlines():
        parts = line.split('|', 2)
        if len(parts) < 3:
            continue
        sha, ts, subject = parts
        # Extract branch name from merge commit subject
        # "Merge pull request #N from lucasxf/feat/branch-name" or "Merge branch 'branch-name'"
        # Match everything after the first slash following the username
        branch_match = re.search(r'from \w+/(\S+)', subject) or re.search(r"branch '([^']+)'", subject)
        # The regex above greedily takes lucasxf/BRANCH; group(1) = full branch (feat/x, fix/y, develop)
        merged_branch = branch_match.group(1) if branch_match else ''
        commits.append({
            'sha': sha.strip(),
            'timestamp': parse_iso_timestamp(ts),
            'subject': subject.strip(),
            'merged_branch': merged_branch,
        })
    return commits


def get_first_commit_time(branch: str) -> datetime | None:
    """Return timestamp of first commit on a branch (not reachable from develop before branch)."""
    # Find the merge-base between branch and develop, then get commits after it
    merge_base = run_git(['merge-base', 'develop', branch])
    if not merge_base:
        return None
    log = run_git([
        'log', f'{merge_base}..{branch}',
        '--format=%aI', '--reverse'
    ])
    if not log:
        return None
    first_line = log.splitlines()[0]
    return parse_iso_timestamp(first_line)


def main():
    weeks = 8
    for arg in sys.argv[1:]:
        if arg.startswith('--weeks'):
            try:
                weeks = int(arg.split('=')[-1]) if '=' in arg else int(sys.argv[sys.argv.index(arg) + 1])
            except (ValueError, IndexError):
                pass

    now = datetime.now(timezone.utc)
    window_start = now - timedelta(weeks=weeks)

    merges = get_merge_commits('develop')
    if not merges:
        print('No merge commits found on develop — skipping DORA metrics')
        return

    # Filter to window
    recent_merges = [m for m in merges if m['timestamp'] >= window_start]

    # Deployment frequency
    feat_merges = [m for m in recent_merges if m['merged_branch'].startswith('feat/')]
    fix_merges = [m for m in recent_merges if m['merged_branch'].startswith('fix/')]
    total_merges = len(recent_merges)

    deployment_frequency = len(feat_merges) / weeks if weeks > 0 else 0.0
    cfr = len(fix_merges) / total_merges if total_merges > 0 else 0.0

    # Lead time for recent feat branches
    lead_times_hours = []
    for merge in feat_merges[:20]:  # cap at 20 to avoid excessive git calls
        branch = merge['merged_branch']
        if not branch:
            continue
        # Try to find the branch's first commit by looking at reflog or remote refs
        # Since branch may be deleted after merge, use the merge commit's parent
        parent_log = run_git([
            'log', '--format=%aI', '--reverse',
            f'{merge["sha"]}^2..{merge["sha"]}'
        ])
        if not parent_log:
            # Branch is gone, use merge commit timestamp - 0 (unknown)
            continue
        first_ts = parse_iso_timestamp(parent_log.splitlines()[0])
        delta_hours = (merge['timestamp'] - first_ts).total_seconds() / 3600
        if 0 < delta_hours < 24 * 30:  # sanity check: between 0 and 30 days
            lead_times_hours.append(delta_hours)

    lead_time_median = statistics.median(lead_times_hours) if lead_times_hours else 0.0

    # Write to usage-stats.toml
    stats_path = Path('.claude/metrics/usage-stats.toml')
    stats = stats_path.read_text(encoding='utf-8')

    dora_section = (
        '\n# DORA Performance Dimension — ADR-008\n'
        '[dora_metrics]\n'
        f'deployment_frequency_weekly = {deployment_frequency:.2f}\n'
        f'lead_time_median_hours = {lead_time_median:.1f}\n'
        f'change_failure_rate = {cfr:.3f}\n'
        f'mttr_hours = 0.0\n'
        f'measurement_window_start = "{window_start.strftime("%Y-%m-%d")}"\n'
        f'measurement_window_end = "{now.strftime("%Y-%m-%d")}"\n'
        f'measurement_weeks = {weeks}\n'
    )

    if '[dora_metrics]' in stats:
        stats = re.sub(
            r'# DORA Performance Dimension[^\[]*\[dora_metrics\][^\[]+',
            dora_section.lstrip('\n'),
            stats
        )
    else:
        for anchor in ('[loc_churn]', '[health]'):
            if anchor in stats:
                stats = stats.replace(anchor, dora_section + '\n' + anchor, 1)
                break
        else:
            stats += dora_section

    stats_path.write_text(stats, encoding='utf-8')

    print(f'DORA metrics (last {weeks} weeks):')
    print(f'  Deployment frequency: {deployment_frequency:.2f} feat merges/week ({len(feat_merges)} total)')
    print(f'  Lead time (median):   {lead_time_median:.1f} hours ({len(lead_times_hours)} samples)')
    print(f'  Change failure rate:  {cfr:.1%} ({len(fix_merges)} fix merges / {total_merges} total)')
    print(f'  MTTR:                 ~0 (structurally N/A for solo dev repo)')


if __name__ == '__main__':
    main()
