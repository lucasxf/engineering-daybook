#!/usr/bin/env bash
# Wrapper: resolves Python and runs track-usage.py.
# Called by the PostToolUse hook in settings.json.
# Reads JSON from stdin; silently exits on any failure.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKER="$SCRIPT_DIR/track-usage.py"

# Read stdin once; re-feed it to Python
INPUT="$(cat)"

# Try Python interpreters in priority order
for py in python3 python /usr/bin/python3 /usr/local/bin/python3; do
  if command -v "$py" >/dev/null 2>&1 || [ -x "$py" ]; then
    echo "$INPUT" | "$py" "$TRACKER"
    exit $?
  fi
done

# No Python found — silent exit (never block Claude)
exit 0
