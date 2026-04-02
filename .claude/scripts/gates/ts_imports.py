"""Import sort gate for TypeScript/TSX files via eslint-plugin-simple-import-sort."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .base import Finding, Gate


class TsImports(Gate):
    name = "import-sort"
    is_slow = False

    def run(self, file_path: str, repo_root: str) -> list[Finding]:
        fp = file_path.replace("\\", "/")
        if fp.startswith("web/"):
            cwd = str(Path(repo_root) / "web")
        elif fp.startswith("mobile/"):
            cwd = str(Path(repo_root) / "mobile")
        else:
            return []

        abs_path = str(Path(repo_root) / file_path)

        # Run ESLint scoped to the import-sort rules only
        try:
            result = subprocess.run(
                ["npx", "eslint",
                 "--format", "json",
                 "--no-error-on-unmatched-pattern",
                 "--rule", "simple-import-sort/imports: error",
                 "--rule", "simple-import-sort/exports: error",
                 abs_path],
                capture_output=True, text=True, timeout=8,
                cwd=cwd, shell=False,
            )
        except FileNotFoundError:
            try:
                result = subprocess.run(
                    f'npx eslint --format json --no-error-on-unmatched-pattern '
                    f'--rule "simple-import-sort/imports: error" '
                    f'--rule "simple-import-sort/exports: error" '
                    f'"{abs_path}"',
                    capture_output=True, text=True, timeout=8,
                    cwd=cwd, shell=True,
                )
            except Exception:  # noqa: BLE001
                return []
        except Exception:  # noqa: BLE001
            return []

        return _parse_eslint_json(result.stdout)


def _parse_eslint_json(output: str) -> list[Finding]:
    if not output.strip():
        return []
    try:
        data = json.loads(output)
    except json.JSONDecodeError:
        return []

    findings: list[Finding] = []
    for file_result in data:
        for msg in file_result.get("messages", []):
            rule = msg.get("ruleId", "")
            if "simple-import-sort" not in (rule or ""):
                continue
            severity = "error" if msg.get("severity") == 2 else "warning"
            findings.append(Finding(
                severity=severity,
                line=msg.get("line"),
                col=msg.get("column"),
                message=msg.get("message", ""),
                rule=rule,
            ))
    return findings
