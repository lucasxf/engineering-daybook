"""
dc_timeline.py — DC time-series aggregator

Reads DC JSON from dc_counter.py stdout, groups by ISO week, and writes
[[dc_timeline.periods]] entries to usage-stats.toml.

Completion dates come from milestone header annotations in ROADMAP.phase-*.md
(e.g. "Done (2026-03-07)"). Items with no date are assigned to the week of
their milestone's completion date.

Usage:
    python3 .claude/scripts/dc_counter.py --json | python3 .claude/scripts/dc_timeline.py
    # Or:
    python3 .claude/scripts/dc_counter.py --json > /tmp/dcs.json
    python3 .claude/scripts/dc_timeline.py /tmp/dcs.json
"""

import json
import re
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path


def iso_week(date_str: str) -> str:
    """Return 'YYYY-WNN' for a 'YYYY-MM-DD' date string."""
    d = date.fromisoformat(date_str)
    iso = d.isocalendar()
    return f'{iso[0]}-W{iso[1]:02d}'


def main():
    # Read DC JSON from file arg or stdin
    if len(sys.argv) > 1:
        dcs = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    else:
        dcs = json.loads(sys.stdin.read())

    done_dcs = [d for d in dcs if d.get('done') and d.get('completion_date')]

    # Group by ISO week
    periods: dict[str, dict] = defaultdict(lambda: {
        'dcs_completed': 0,
        'weighted_dcs': 0.0,
        'milestones': set(),
    })

    for dc in done_dcs:
        week = iso_week(dc['completion_date'])
        periods[week]['dcs_completed'] += 1
        periods[week]['weighted_dcs'] += dc['weight']
        periods[week]['milestones'].add(dc['milestone'])

    sorted_periods = sorted(periods.items())

    stats_path = Path('.claude/metrics/usage-stats.toml')
    stats = stats_path.read_text(encoding='utf-8')

    # Build TOML period entries
    period_toml = ''
    for week, data in sorted_periods:
        milestones_list = sorted(data['milestones'])
        milestones_toml = json.dumps(milestones_list)
        period_toml += (
            f'\n[[dc_timeline.periods]]\n'
            f'period = "{week}"\n'
            f'dcs_completed = {data["dcs_completed"]}\n'
            f'weighted_dcs = {data["weighted_dcs"]:.1f}\n'
            f'milestones_completed = {milestones_toml}\n'
        )

    # Replace or append [[dc_timeline.periods]] block
    if '[[dc_timeline.periods]]' in stats:
        # Remove all existing period entries (between first [[dc_timeline.periods]] and next non-dc_timeline section)
        stats = re.sub(
            r'(\n\[\[dc_timeline\.periods\]\][^\[]*)+',
            '',
            stats
        )

    # Append after [dc_timeline] totals block
    stats = re.sub(
        r'(\[dc_timeline\][^\[]+)',
        lambda m: m.group(1).rstrip() + '\n' + period_toml + '\n',
        stats
    )

    stats_path.write_text(stats, encoding='utf-8')

    print(f'DC timeline: {len(sorted_periods)} weeks with delivered capabilities')
    for week, data in sorted_periods[-5:]:  # show last 5 weeks
        print(f'  {week}: {data["dcs_completed"]} DCs ({data["weighted_dcs"]:.1f} weighted)')


if __name__ == '__main__':
    main()
