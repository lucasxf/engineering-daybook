"""
loc_churn.py — LOC churn tracker (fixes REC-013)

Computes lines added and deleted between the last stored baseline commit SHA
and HEAD, then appends a [[loc_churn.periods]] entry to usage-stats.toml.

The baseline commit SHA is stored in [metadata] as `churn_baseline_commit`.
On the first run (no baseline), it uses the initial commit as the baseline
and sets the period to "historical".

Usage:
    python3 .claude/scripts/loc_churn.py
    python3 .claude/scripts/loc_churn.py --reset   # reset baseline to HEAD (no entry written)
"""

import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def run_git(args: list[str]) -> str:
    result = subprocess.run(
        ['git'] + args,
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    return result.stdout.strip()


def get_churn(from_sha: str, to_sha: str = 'HEAD') -> tuple[int, int]:
    """Return (lines_added, lines_deleted) between two commits."""
    diff = run_git([
        'diff', '--stat', '--shortstat', from_sha, to_sha,
        '--', '*.java', '*.ts', '*.tsx', '*.py'
    ])
    if not diff:
        return 0, 0

    # Parse "N files changed, X insertions(+), Y deletions(-)"
    added = 0
    deleted = 0
    m_add = re.search(r'(\d+) insertion', diff)
    m_del = re.search(r'(\d+) deletion', diff)
    if m_add:
        added = int(m_add.group(1))
    if m_del:
        deleted = int(m_del.group(1))
    return added, deleted


def iso_week_now() -> str:
    now = datetime.now(timezone.utc)
    iso = now.isocalendar()
    return f'{iso[0]}-W{iso[1]:02d}'


def main():
    reset_mode = '--reset' in sys.argv
    stats_path = Path('.claude/metrics/usage-stats.toml')
    stats = stats_path.read_text(encoding='utf-8')

    head_sha = run_git(['rev-parse', 'HEAD'])
    if not head_sha:
        print('Could not determine HEAD SHA — skipping loc_churn')
        return

    if reset_mode:
        # Just update the baseline commit, no churn entry written
        if 'churn_baseline_commit' in stats:
            stats = re.sub(r'churn_baseline_commit = "[^"]*"', f'churn_baseline_commit = "{head_sha}"', stats)
        else:
            stats = re.sub(r'(\[metadata\][^\[]+)', lambda m: m.group(1).rstrip() + f'\nchurn_baseline_commit = "{head_sha}"\n', stats)
        stats_path.write_text(stats, encoding='utf-8')
        print(f'Baseline reset to {head_sha[:8]}')
        return

    # Get stored baseline commit
    m = re.search(r'churn_baseline_commit = "([^"]*)"', stats)
    baseline_sha = m.group(1) if m else ''

    if not baseline_sha:
        # First run: use first commit as baseline
        baseline_sha = run_git(['rev-list', '--max-parents=0', 'HEAD'])
        period = 'historical'
    else:
        period = iso_week_now()

    if baseline_sha == head_sha:
        print('No new commits since last churn measurement — skipping')
        return

    lines_added, lines_deleted = get_churn(baseline_sha, head_sha)
    net = lines_added - lines_deleted

    # Build TOML entry
    new_entry = (
        f'\n[[loc_churn.periods]]\n'
        f'period = "{period}"\n'
        f'lines_added = {lines_added}\n'
        f'lines_deleted = {lines_deleted}\n'
        f'net = {net}\n'
        f'baseline_commit = "{baseline_sha[:8]}"\n'
        f'head_commit = "{head_sha[:8]}"\n'
    )

    # Append loc_churn section if missing
    if '[loc_churn]' not in stats:
        churn_section = '\n# LOC Churn per Compile Window — ADR-008\n[loc_churn]\n'
        for anchor in ('[health]',):
            if anchor in stats:
                stats = stats.replace(anchor, churn_section + '\n' + anchor, 1)
                break
        else:
            stats += churn_section

    # Append the new period entry after the [loc_churn] header
    stats = re.sub(
        r'(\[loc_churn\][^\[]*)',
        lambda m: m.group(1).rstrip() + new_entry + '\n',
        stats
    )

    # Update baseline to HEAD
    if 'churn_baseline_commit' in stats:
        stats = re.sub(r'churn_baseline_commit = "[^"]*"', f'churn_baseline_commit = "{head_sha}"', stats)
    else:
        stats = re.sub(r'(\[metadata\][^\[]+)', lambda m: m.group(1).rstrip() + f'\nchurn_baseline_commit = "{head_sha}"\n', stats)

    stats_path.write_text(stats, encoding='utf-8')

    print(f'LOC churn ({period}): +{lines_added:,} / -{lines_deleted:,} = net {net:+,}')
    print(f'  Range: {baseline_sha[:8]}..{head_sha[:8]}')


if __name__ == '__main__':
    main()
