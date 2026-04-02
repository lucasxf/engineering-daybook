#!/usr/bin/env bash
# Wrapper: resolves Python and runs quality-gate.py.
# Called by PostToolUse hook (matcher: Edit|Write) in settings.json.
# Reads JSON from stdin; silently exits on any failure.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATE="$SCRIPT_DIR/quality-gate.py"

# Read stdin once; re-feed it to Python
INPUT="$(cat)"

# Try Python interpreters in priority order
for py in python3 python /usr/bin/python3 /usr/local/bin/python3; do
  if command -v "$py" >/dev/null 2>&1 || [ -x "$py" ]; then
    echo "$INPUT" | "$py" "$GATE"
    exit 0
  fi
done

# No Python found — silent exit (never block Claude)
exit 0
