"""Semgrep security gate — runs in background (is_slow=True).

Runs semgrep OSS with the security-audit and secrets rulesets on a single file,
parses the JSON output, and returns findings.  Results are written to
.claude/quality-gate-reports/ by run_gate_bg.py rather than injected as
additionalContext (too slow for synchronous feedback).

Requirements:
  pip install semgrep
  or: semgrep available on PATH (binary install)
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from .base import Finding, Gate

# Rulesets to run.  Both are OSS and work offline after first download.
_CONFIGS = ["p/security-audit", "p/secrets"]

# Severity mapping from semgrep's "severity" field
_SEVERITY_MAP = {
    "ERROR": "error",
    "WARNING": "warning",
    "INFO": "warning",
}


class SecurityScan(Gate):
    name = "semgrep"
    is_slow = True  # Semgrep startup + rule download can be 10-30s

    def run(self, file_path: str, repo_root: str) -> list[Finding]:
        semgrep = _find_semgrep()
        if not semgrep:
            return [Finding(
                severity="warning",
                message="semgrep not found — install with: pip install semgrep",
                rule="setup",
            )]

        abs_path = str(Path(repo_root) / file_path)
        if not Path(abs_path).exists():
            return []

        cmd = [semgrep, "scan", "--json", "--quiet"]
        for cfg in _CONFIGS:
            cmd += ["--config", cfg]
        cmd.append(abs_path)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=repo_root,
            )
        except subprocess.TimeoutExpired:
            return [Finding(
                severity="warning",
                message="semgrep scan timed out after 60s",
                rule="timeout",
            )]
        except Exception as exc:  # noqa: BLE001
            return [Finding(
                severity="warning",
                message=f"semgrep failed: {exc}",
                rule="error",
            )]

        return _parse_semgrep_json(result.stdout)


def _find_semgrep() -> str | None:
    """Locate the semgrep binary; prefers full path over bare name."""
    found = shutil.which("semgrep")
    if found:
        return found

    # Common pip install locations on Windows / Unix
    candidates = [
        str(Path.home() / ".local" / "bin" / "semgrep"),
        str(Path.home() / "AppData" / "Roaming" / "Python" / "Scripts" / "semgrep.exe"),
        "/usr/local/bin/semgrep",
        "/usr/bin/semgrep",
    ]
    for c in candidates:
        if Path(c).exists():
            return c

    return None


def _parse_semgrep_json(stdout: str) -> list[Finding]:
    """Parse semgrep --json output into Finding objects."""
    if not stdout.strip():
        return []

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return []

    results = data.get("results", [])
    findings: list[Finding] = []

    for r in results:
        sev_raw = r.get("extra", {}).get("severity", "WARNING").upper()
        severity = _SEVERITY_MAP.get(sev_raw, "warning")

        start = r.get("start", {})
        line = start.get("line") or None

        check_id = r.get("check_id", "")
        # Shorten the rule ID to just the last segment for readability
        rule = check_id.split(".")[-1] if check_id else None

        message = r.get("extra", {}).get("message", r.get("message", ""))
        # Trim whitespace from multi-line messages
        message = " ".join(message.split())

        findings.append(Finding(
            severity=severity,
            line=line,
            message=message,
            rule=rule,
        ))

    return findings
