"""Checkstyle gate for Java files in backend/.

Runs maven-checkstyle-plugin on-demand (no lifecycle binding) and parses
the XML report at backend/target/checkstyle-result.xml.
"""

from __future__ import annotations

import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from .base import Finding, Gate

# Only lint source files, not test or generated code
_SOURCE_ROOT = "backend/src/main/java/"


class JavaLint(Gate):
    name = "checkstyle"
    is_slow = True  # Maven startup is ~8-10s on Windows — run in background

    def run(self, file_path: str, repo_root: str) -> list[Finding]:
        fp = file_path.replace("\\", "/")

        # Only run on production source files
        if not fp.startswith(_SOURCE_ROOT):
            return []

        backend_dir = str(Path(repo_root) / "backend")
        report_path = Path(backend_dir) / "target" / "checkstyle-result.xml"

        mvn = _find_mvn(repo_root)
        if not mvn:
            return []

        try:
            subprocess.run(
                [mvn, "checkstyle:check",
                 "--no-transfer-progress",
                 "-q"],
                capture_output=True, text=True, timeout=15,
                cwd=backend_dir,
            )
        except Exception:  # noqa: BLE001
            return []

        # Parse XML report regardless of exit code
        if not report_path.exists():
            return []

        return _parse_checkstyle_xml(report_path, str(Path(repo_root) / fp))


def _find_mvn(repo_root: str) -> str | None:
    """Prefer system mvn (mvnw has SSL issues on Windows); fall back to mvnw."""
    import shutil
    import os

    # Check shutil.which first — returns the full resolved path (not just "mvn")
    found = shutil.which("mvn")
    if found:
        return found

    # Fallback: known .cmd wrapper (Windows) or shell script (Unix)
    for suffix in ["mvn.cmd", "mvn"]:
        for base in [
            "/c/repo/apache-maven-3.9.11/bin",
            str(Path.home() / "apache-maven" / "bin"),
        ]:
            candidate = str(Path(base) / suffix)
            if Path(candidate).exists():
                return candidate

    # Fall back to Maven wrapper (SSL may fail on some machines)
    for candidate in [
        str(Path(repo_root) / "backend" / "mvnw"),
        str(Path(repo_root) / "mvnw"),
    ]:
        if Path(candidate).exists():
            return candidate

    return None


def _parse_checkstyle_xml(report_path: Path, target_abs: str) -> list[Finding]:
    try:
        tree = ET.parse(str(report_path))
    except ET.ParseError:
        return []

    findings: list[Finding] = []
    for file_el in tree.getroot().findall("file"):
        name = file_el.get("name", "").replace("\\", "/")
        target = target_abs.replace("\\", "/")
        # Only include findings for the specific file we checked
        if not name.endswith(target.split("/backend/")[-1]):
            continue
        for err in file_el.findall("error"):
            sev = err.get("severity", "error")
            source = err.get("source", "")
            rule = source.split(".")[-1] if source else None
            findings.append(Finding(
                severity="error" if sev == "error" else "warning",
                line=int(err.get("line", 0)) or None,
                col=int(err.get("column", 0)) or None,
                message=err.get("message", ""),
                rule=rule,
            ))
    return findings
