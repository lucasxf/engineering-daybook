#!/usr/bin/env bash
# check-screen-tests.sh — verify every screen file has a corresponding test file.
#
# Every *Screen.tsx file under src/screens/ must have a matching
# __tests__/<Name>.test.tsx in the same directory. Fails CI if any are missing.
#
# Usage: bash scripts/check-screen-tests.sh (from mobile/ directory)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCREENS_DIR="$SCRIPT_DIR/../src/screens"
ERRORS=0

while IFS= read -r -d '' screen_file; do
  base=$(basename "$screen_file" .tsx)
  screen_dir=$(dirname "$screen_file")
  test_file="$screen_dir/__tests__/$base.test.tsx"

  if [[ ! -f "$test_file" ]]; then
    echo "MISSING TEST: $test_file"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$SCREENS_DIR" -name "*Screen.tsx" -not -path "*/__tests__/*" -print0)

if [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "❌  $ERRORS screen(s) have no test file."
  echo "    Every file in src/screens/ must have a __tests__/<Name>.test.tsx"
  exit 1
fi

echo "✅  All screens have test files."
