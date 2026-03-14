"""
session_delta.py — Detect changes in the current working tree for finish-session gates.

Usage:
  python3 .claude/scripts/session_delta.py --new-pages
      Prints all new page.tsx files (staged, unstaged, and untracked) in web/src/app/.
      Exit 0 if any found, exit 1 if none.

  python3 .claude/scripts/session_delta.py --e2e-touched
      Prints all E2E spec files touched this session (staged, unstaged, untracked) in web/e2e/.
      Exit 0 if any found, exit 1 if none.

  python3 .claude/scripts/session_delta.py --new-exports
      Prints new .tsx/.ts source files (not tests) added this session in web/src/.
      For each file, checks if its exports are imported anywhere else in web/src/.
      Prints "ORPHAN: <file>" for each with zero consumers.
      Exit 0 if all exported, exit 1 if any orphan found.
"""
import subprocess
import sys
import re
from pathlib import Path


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    lines = [l.strip() for l in result.stdout.splitlines() if l.strip()]
    return lines


def new_pages():
    staged   = run("git diff --cached --name-only -- 'web/src/app/**'")
    unstaged = run("git diff --name-only -- 'web/src/app/**'")
    untracked = run("git ls-files --others --exclude-standard -- 'web/src/app/**'")
    pages = [
        f for f in set(staged + unstaged + untracked)
        if f.endswith('page.tsx') and '__tests__' not in f
    ]
    for p in sorted(pages):
        print(p)
    return 0 if pages else 1


def e2e_touched():
    staged    = run("git diff --cached --name-only -- 'web/e2e/**'")
    unstaged  = run("git diff --name-only -- 'web/e2e/**'")
    untracked = run("git ls-files --others --exclude-standard -- 'web/e2e/**'")
    specs = sorted(set(staged + unstaged + untracked))
    for s in specs:
        print(s)
    return 0 if specs else 1


def new_exports():
    staged    = run("git diff --cached --name-only -- 'web/src/**/*.tsx' 'web/src/**/*.ts'")
    unstaged  = run("git diff --name-only -- 'web/src/**/*.tsx' 'web/src/**/*.ts'")
    untracked = run("git ls-files --others --exclude-standard -- 'web/src/**/*.tsx' 'web/src/**/*.ts'")

    skip = re.compile(r'(__tests__|\.test\.|\.spec\.)')
    new_files = sorted({f for f in set(staged + unstaged + untracked) if not skip.search(f)})

    orphans = []
    for fpath in new_files:
        stem = Path(fpath).stem
        # Check for any import of this module in the rest of web/src/
        result = subprocess.run(
            ['grep', '-r', stem, 'web/src/', '--include=*.tsx', '--include=*.ts',
             f'--exclude={Path(fpath).name}', '-l', '--'],
            capture_output=True, text=True
        )
        consumers = [l.strip() for l in result.stdout.splitlines()
                     if l.strip() and l.strip() != fpath]
        if not consumers:
            print(f'ORPHAN: {fpath}')
            orphans.append(fpath)
        else:
            print(f'OK: {fpath} (imported by {len(consumers)} file(s))')

    return 1 if orphans else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)

    mode = sys.argv[1]
    if mode == '--new-pages':
        sys.exit(new_pages())
    elif mode == '--e2e-touched':
        sys.exit(e2e_touched())
    elif mode == '--new-exports':
        sys.exit(new_exports())
    else:
        print(f'Unknown mode: {mode}', file=sys.stderr)
        sys.exit(2)
