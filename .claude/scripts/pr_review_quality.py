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
    print('No PR review quality deltas found -- skipping')
