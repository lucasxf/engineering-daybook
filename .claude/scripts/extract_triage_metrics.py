"""
extract_triage_metrics.py — Parse a /review-pr triage report and append verdict
counts to the current session delta TOML.

Usage:
  python3 .claude/scripts/extract_triage_metrics.py <triage_file>

Reads the triage report, counts items under each verdict section, then
appends or accumulates into .claude/metrics/sessions/<branch>.toml.
"""
import re
import subprocess
import sys
from pathlib import Path


def count_items(text, section_header):
    """Count '- ' bullet lines immediately after a section header."""
    pattern = rf'{re.escape(section_header)}\n(.*?)(?=\n###|\Z)'
    m = re.search(pattern, text, re.DOTALL)
    if not m:
        return 0
    return len(re.findall(r'^- ', m.group(1), re.MULTILINE))


def main():
    if len(sys.argv) < 2:
        print('Usage: extract_triage_metrics.py <triage_file>', file=sys.stderr)
        sys.exit(1)

    triage_path = Path(sys.argv[1])
    if not triage_path.exists():
        print('Triage file not found — skipping metrics')
        sys.exit(0)

    report = triage_path.read_text(encoding='utf-8')

    accepted      = count_items(report, '### Approved for implementation')
    rejected      = count_items(report, '### Rejected')
    deferred      = count_items(report, '### Deferred')
    questions     = count_items(report, '### Requires manual reply')
    informational = count_items(report, '### Informational')
    total = accepted + rejected + deferred + questions + informational

    branch = subprocess.run(
        ['git', 'branch', '--show-current'],
        capture_output=True, text=True, timeout=3
    ).stdout.strip() or 'unknown'
    safe_branch = branch.replace('/', '%2F')
    safe_branch = re.sub(r'[^\w\-\.%]', '_', safe_branch) or 'unknown'

    delta_path = Path(f'.claude/metrics/sessions/{safe_branch}.toml')
    content = delta_path.read_text(encoding='utf-8') if delta_path.exists() else ''

    if '[pr_review_quality]' in content:
        def add(field, n):
            global content
            def inc(m): return m.group(1) + str(int(m.group(2)) + n)
            content = re.sub(
                rf'(\[pr_review_quality\][^\[]*?{re.escape(field)} = )(\d+)',
                inc, content, flags=re.DOTALL
            )
        add('total_prs_triaged', 1)
        add('total_comments_triaged', total)
        add('accepted', accepted)
        add('rejected', rejected)
        add('deferred', deferred)
        add('questions', questions)
        add('informational', informational)
    else:
        content += (
            f'\n[pr_review_quality]\n'
            f'total_prs_triaged = 1\n'
            f'total_comments_triaged = {total}\n'
            f'accepted = {accepted}\n'
            f'rejected = {rejected}\n'
            f'deferred = {deferred}\n'
            f'questions = {questions}\n'
            f'informational = {informational}\n'
        )

    delta_path.write_text(content, encoding='utf-8')
    print(
        f'PR review quality: accepted={accepted}, rejected={rejected}, '
        f'deferred={deferred}, questions={questions}, '
        f'informational={informational}, total={total}'
    )


if __name__ == '__main__':
    main()
