"""
dc_counter.py — Delivered Capability (DC) counter

Parses all docs/ROADMAP.phase-*.md files, extracts milestone items with their
status, MoSCoW priority, and completion date. Writes totals to [dc_timeline]
in usage-stats.toml and prints a JSON array of DCs to stdout (used by
dc_timeline.py for period grouping).

DC definition (ADR-008):
  - 1 DC = 1 milestone table row with status Done
  - Weight: Must Have=1.0, Should Have=0.7, Could Have=0.4, Deferred=0.0
  - Phase files without a Priority column default to weight 1.0

Usage:
    python3 .claude/scripts/dc_counter.py          # update TOML + print JSON
    python3 .claude/scripts/dc_counter.py --json   # print JSON only, no TOML write
"""

import json
import re
import sys
from pathlib import Path

WEIGHTS = {
    'must have': 1.0,
    'should have': 0.7,
    'could have': 0.4,
    'won\'t have': 0.0,
    'deferred': 0.0,
}

DONE_PATTERN = re.compile(r'done|complete|✅', re.IGNORECASE)
DEFERRED_PATTERN = re.compile(r'defer', re.IGNORECASE)
MILESTONE_HEADER = re.compile(
    r'^#{2,3}\s+Milestone\s+(\d+\.\d+)[^\n]*Done[^\n]*\((\d{4}-\d{2}-\d{2})\)',
    re.IGNORECASE
)


def parse_phase_file(path: Path) -> list[dict]:
    """Parse a ROADMAP.phase-*.md file and return a list of DC dicts."""
    text = path.read_text(encoding='utf-8', errors='ignore')
    lines = text.splitlines()
    dcs = []

    current_milestone = None
    current_milestone_date = None
    in_table = False
    col_map = {}  # column name → index

    for line in lines:
        # Detect milestone header with completion date
        mh = MILESTONE_HEADER.match(line)
        if mh:
            current_milestone = mh.group(1)
            current_milestone_date = mh.group(2)
            in_table = False
            col_map = {}
            continue

        # Detect table header row: | # | Feature | Priority | Status |
        if line.startswith('|') and '#' in line and 'Feature' in line:
            headers = [h.strip().lower() for h in line.split('|') if h.strip()]
            col_map = {name: idx for idx, name in enumerate(headers)}
            in_table = True
            continue

        # Skip separator row
        if in_table and re.match(r'^\|[-| ]+\|', line):
            continue

        # Parse table data rows
        if in_table and line.startswith('|'):
            cols = [c.strip() for c in line.split('|')]
            # cols[0] is empty (before first |), so real cols start at index 1
            cols = cols[1:]  # drop leading empty string

            if len(cols) < 2:
                continue

            # Extract values by column position
            id_col = col_map.get('#', 0)
            feature_col = col_map.get('feature', 1)
            priority_col = col_map.get('priority')
            status_col = col_map.get('status', len(cols) - 1)

            item_id = cols[id_col].strip() if id_col < len(cols) else ''
            feature = cols[feature_col].strip() if feature_col < len(cols) else ''

            if not item_id or not re.match(r'^\d+\.\d+\.\d+', item_id):
                continue  # skip non-item rows

            # Priority
            if priority_col is not None and priority_col < len(cols):
                priority_raw = cols[priority_col].strip().lower()
            else:
                priority_raw = 'must have'  # default for phase files without priority column

            weight = WEIGHTS.get(priority_raw, 1.0)

            # Status
            status_raw = cols[status_col].strip() if status_col < len(cols) else ''

            if DEFERRED_PATTERN.search(status_raw):
                done = False
                weight = 0.0
            elif DONE_PATTERN.search(status_raw):
                done = True
            else:
                done = False

            # Determine phase from item_id (e.g. "6.1.1" → phase "6")
            phase = item_id.split('.')[0] if '.' in item_id else ''

            dcs.append({
                'id': item_id,
                'feature': feature,
                'milestone': current_milestone or f'{phase}.?',
                'phase': phase,
                'priority': priority_raw,
                'weight': weight,
                'done': done,
                'completion_date': current_milestone_date if done else None,
                'parity': 'parity' in feature.lower() or 'mobile' in path.name.lower(),
            })
        elif in_table and not line.startswith('|') and line.strip():
            # Table ended (non-pipe, non-empty line)
            in_table = False

    return dcs


def main():
    json_only = '--json' in sys.argv
    roadmap_files = sorted(Path('docs').glob('ROADMAP.phase-*.md'))

    all_dcs = []
    for f in roadmap_files:
        all_dcs.extend(parse_phase_file(f))

    done_dcs = [d for d in all_dcs if d['done']]
    total_dcs = len(done_dcs)
    total_weighted = sum(d['weight'] for d in done_dcs)

    # Count complete milestones: all Must Have + Should Have items in milestone are done
    milestones = {}
    for d in all_dcs:
        m = d['milestone']
        if m not in milestones:
            milestones[m] = {'required': 0, 'done_required': 0}
        if d['weight'] >= 0.7:  # Must Have or Should Have
            milestones[m]['required'] += 1
            if d['done']:
                milestones[m]['done_required'] += 1

    complete_milestones = [m for m, v in milestones.items()
                           if v['required'] > 0 and v['required'] == v['done_required']]

    # Count complete phases: all milestones in phase are complete
    phase_milestones = {}
    for m in milestones:
        p = m.split('.')[0] if '.' in m else m
        if p not in phase_milestones:
            phase_milestones[p] = set()
        phase_milestones[p].add(m)

    complete_phases = [p for p, ms in phase_milestones.items()
                       if ms and all(m in complete_milestones for m in ms)]

    if not json_only:
        stats_path = Path('.claude/metrics/usage-stats.toml')
        stats = stats_path.read_text(encoding='utf-8')

        if '[dc_timeline]' not in stats:
            # Append new section before [dora_metrics] or [health] or at end
            new_section = (
                '\n# Delivered Capability (DC) Metrics — ADR-008\n'
                '[dc_timeline]\n'
                f'total_dcs = {total_dcs}\n'
                f'total_weighted_dcs = {total_weighted:.1f}\n'
                f'total_milestones_complete = {len(complete_milestones)}\n'
                f'total_phases_complete = {len(complete_phases)}\n'
            )
            for anchor in ('[dora_metrics]', '[loc_churn]', '[health]'):
                if anchor in stats:
                    stats = stats.replace(anchor, new_section + '\n' + anchor, 1)
                    break
            else:
                stats += new_section
        else:
            stats = re.sub(r'total_dcs = \d+', f'total_dcs = {total_dcs}', stats)
            stats = re.sub(r'total_weighted_dcs = [\d.]+', f'total_weighted_dcs = {total_weighted:.1f}', stats)
            stats = re.sub(r'total_milestones_complete = \d+', f'total_milestones_complete = {len(complete_milestones)}', stats)
            stats = re.sub(r'total_phases_complete = \d+', f'total_phases_complete = {len(complete_phases)}', stats)

        stats_path.write_text(stats, encoding='utf-8')

        print(f'DCs done: {total_dcs} raw / {total_weighted:.1f} weighted')
        print(f'Milestones complete: {len(complete_milestones)} / {len(milestones)}')
        print(f'Phases complete: {len(complete_phases)} / {len(phase_milestones)}')

    print(json.dumps(all_dcs, indent=2))


if __name__ == '__main__':
    main()
