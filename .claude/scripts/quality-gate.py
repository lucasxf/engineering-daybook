#!/usr/bin/env python3
"""Quality gate orchestrator — called by run-quality-gate.sh via PostToolUse hook.

Reads Claude's hook JSON from stdin, extracts the edited file path, routes it
through the appropriate per-stack gates, and returns findings as additionalContext
so Claude can self-correct within the same turn.

Fast gates (lint, format, imports) run in parallel via ThreadPoolExecutor and
their findings are returned synchronously.  Slow gates (security scan) are
spawned as background subprocesses; their results go to the reports directory.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Ensure the gates package is importable regardless of cwd
_SCRIPTS_DIR = Path(__file__).parent
sys.path.insert(0, str(_SCRIPTS_DIR))

from gates.base import Finding, Gate  # noqa: E402
from gates import router  # noqa: E402

# ── Constants ──────────────────────────────────────────────────────────────────

REPORTS_DIR = ".claude/quality-gate-reports"
DEBOUNCE_DIR = ".claude/quality-gate-reports/.debounce"
DEBOUNCE_SECONDS = int(os.environ.get("QUALITY_GATE_DEBOUNCE", "3"))
FAST_GATE_TIMEOUT = int(os.environ.get("QUALITY_GATE_TIMEOUT", "8"))


# ── Helpers ────────────────────────────────────────────────────────────────────

def find_repo_root(start: Path) -> str:
    """Walk up from start until we find .git or reach the filesystem root."""
    current = start.resolve()
    while current != current.parent:
        if (current / ".git").exists():
            return str(current)
        current = current.parent
    return str(start)


def to_repo_relative(file_path: str, repo_root: str) -> str:
    """Convert an absolute path to a repo-relative path with forward slashes."""
    try:
        rel = Path(file_path).resolve().relative_to(Path(repo_root).resolve())
        return str(rel).replace("\\", "/")
    except ValueError:
        return file_path.replace("\\", "/")


def is_debounced(rel_path: str, repo_root: str) -> bool:
    """Return True if this file was already gated within DEBOUNCE_SECONDS."""
    if DEBOUNCE_SECONDS <= 0:
        return False
    marker_dir = Path(repo_root) / DEBOUNCE_DIR
    marker_dir.mkdir(parents=True, exist_ok=True)
    safe_name = rel_path.replace("/", "__").replace("\\", "__")
    marker = marker_dir / safe_name
    now = time.time()
    if marker.exists() and (now - marker.stat().st_mtime) < DEBOUNCE_SECONDS:
        return True
    marker.touch()
    return False


def run_parallel(fast_gates: list[Gate], rel_path: str, repo_root: str) -> list[Finding]:
    """Run fast gates in parallel; collect all findings that complete in time."""
    if not fast_gates:
        return []
    findings: list[Finding] = []
    with ThreadPoolExecutor(max_workers=min(4, len(fast_gates))) as pool:
        futures = {pool.submit(g.run, rel_path, repo_root): g for g in fast_gates}
        try:
            for fut in as_completed(futures, timeout=FAST_GATE_TIMEOUT):
                gate = futures[fut]
                try:
                    result = fut.result(timeout=1)
                    findings.extend(result)
                except Exception as exc:  # noqa: BLE001
                    findings.append(Finding(
                        severity="warning",
                        message=f"Gate '{gate.name}' failed: {exc}",
                    ))
        except TimeoutError:
            # Some gates didn't finish in time — return whatever we have
            pass
    return findings


def spawn_background(slow_gates: list[Gate], rel_path: str, repo_root: str) -> None:
    """Fire-and-forget: run slow gates as independent subprocesses."""
    for gate in slow_gates:
        try:
            subprocess.Popen(
                [sys.executable, str(_SCRIPTS_DIR / "run_gate_bg.py"),
                 gate.__class__.__module__, gate.__class__.__name__,
                 rel_path, repo_root],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:  # noqa: BLE001
            pass


def format_findings(rel_path: str, findings: list[Finding]) -> str:
    """Format findings as a terse markdown block for additionalContext."""
    errors = [f for f in findings if f.severity == "error"]
    warnings = [f for f in findings if f.severity == "warning"]

    lines = [f"## Quality Gate: `{rel_path}`"]
    if errors:
        lines.append(f"\n**{len(errors)} error(s):**")
        lines.extend(f"- {f.format()}" for f in errors[:10])  # cap at 10
    if warnings:
        lines.append(f"\n**{len(warnings)} warning(s):**")
        lines.extend(f"- {f.format()}" for f in warnings[:5])  # cap at 5
    lines.append("\nPlease fix the errors above before proceeding.")
    return "\n".join(lines)


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
    except Exception:  # noqa: BLE001
        sys.exit(0)

    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)

    repo_root = find_repo_root(Path(file_path).parent)
    rel_path = to_repo_relative(file_path, repo_root)

    if is_debounced(rel_path, repo_root):
        sys.exit(0)

    try:
        gates = router.get_gates(rel_path)
    except Exception:  # noqa: BLE001
        sys.exit(0)

    fast = [g for g in gates if not g.is_slow]
    slow = [g for g in gates if g.is_slow]

    findings = run_parallel(fast, rel_path, repo_root)
    spawn_background(slow, rel_path, repo_root)

    # Only inject errors (not warnings) into additionalContext in v1
    errors = [f for f in findings if f.severity == "error"]

    context_parts: list[str] = []
    if errors:
        context_parts.append(format_findings(rel_path, findings))

    if slow:
        gate_names = ", ".join(g.name for g in slow)
        context_parts.append(
            f"*Background analysis running ({gate_names}) — "
            f"check `.claude/quality-gate-reports/` for results.*"
        )

    if context_parts:
        json.dump({"additionalContext": "\n\n".join(context_parts)}, sys.stdout)

    sys.exit(0)


if __name__ == "__main__":
    main()
