#!/usr/bin/env python3
"""Background gate runner — spawned by quality-gate.py for slow (async) gates.

Usage: python3 run_gate_bg.py <module> <class> <rel_path> <repo_root>

Writes findings to .claude/quality-gate-reports/<timestamp>-<filename>.md
"""

from __future__ import annotations

import importlib
import json
import sys
import time
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).parent
sys.path.insert(0, str(_SCRIPTS_DIR))

REPORTS_DIR = ".claude/quality-gate-reports"


def main() -> None:
    if len(sys.argv) < 5:
        sys.exit(0)

    module_name, class_name, rel_path, repo_root = sys.argv[1:5]

    try:
        mod = importlib.import_module(module_name)
        gate_cls = getattr(mod, class_name)
        gate = gate_cls()
        findings = gate.run(rel_path, repo_root)
    except Exception as exc:  # noqa: BLE001
        findings_data = [{"severity": "warning", "message": f"Gate failed: {exc}"}]
    else:
        findings_data = [
            {"severity": f.severity, "line": f.line, "message": f.message, "rule": f.rule}
            for f in findings
        ]

    if not findings_data:
        return

    reports_path = Path(repo_root) / REPORTS_DIR
    reports_path.mkdir(parents=True, exist_ok=True)

    ts = time.strftime("%Y%m%d-%H%M%S")
    safe_name = rel_path.replace("/", "__").replace("\\", "__")
    report_file = reports_path / f"{ts}-{safe_name}.json"
    report_file.write_text(json.dumps({
        "file": rel_path,
        "gate": class_name,
        "timestamp": ts,
        "findings": findings_data,
    }, indent=2))


if __name__ == "__main__":
    main()
