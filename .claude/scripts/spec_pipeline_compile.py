import re
from pathlib import Path

counts = {'draft': 0, 'planned': 0, 'approved': 0, 'in_progress': 0, 'implemented': 0}
spec_files = list(Path('docs/specs/features').glob('*.md'))

for f in spec_files:
    lines = f.read_text(encoding='utf-8', errors='ignore').splitlines()
    for line in lines[:5]:
        m = re.search(r'\*\*Status:\*\*\s*(.+)', line)
        if m:
            raw = m.group(1).strip()
            normalized = raw.lower().replace(' ', '_')
            if normalized == 'complete':
                normalized = 'implemented'
            if normalized in counts:
                counts[normalized] += 1
            break

total = len(spec_files)
stats = Path('.claude/metrics/usage-stats.toml').read_text(encoding='utf-8')
stats = re.sub(r'(total_specs = )\d+', rf'\g<1>{total}', stats)
for key, val in counts.items():
    stats = re.sub(rf'(\[spec_pipeline\][^\[]*\b{re.escape(key)} = )\d+', rf'\g<1>{val}', stats)
Path('.claude/metrics/usage-stats.toml').write_text(stats, encoding='utf-8')

print(f'Spec pipeline: total={total}, draft={counts["draft"]}, planned={counts["planned"]}, approved={counts["approved"]}, in_progress={counts["in_progress"]}, implemented={counts["implemented"]}')
if counts['approved'] == 0 and counts['implemented'] > 0:
    print(f'  Warning: {counts["implemented"]} implemented specs, 0 approved — /review-spec is not being used')
