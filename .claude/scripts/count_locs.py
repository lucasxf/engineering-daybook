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

be_prod = count_lines(['backend/src/main/java/**/*.java'])
be_test = count_lines(['backend/src/test/java/**/*.java'])

web_prod = count_lines(
    ['web/src/**/*.ts', 'web/src/**/*.tsx'],
    exclude_substrings=['__tests__/', '.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']
)
web_test = count_lines(['web/src/**/*.test.ts', 'web/src/**/*.test.tsx'])
web_test += count_lines(['web/src/**/__tests__/**/*.ts', 'web/src/**/__tests__/**/*.tsx'])
e2e_test = count_lines(['web/e2e/**/*.ts'])

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

print(f'Production LOC: {prod_total}  (backend={be_prod}, web={web_prod}, mobile={mob_prod})')
print(f'Test LOC:       {test_total}  (backend={be_test}, web={web_test}, e2e={e2e_test}, mobile={mob_test})')
print(f'Total LOC:      {grand_total}')
print(f'Test ratio:     {ratio:.1f}%')
