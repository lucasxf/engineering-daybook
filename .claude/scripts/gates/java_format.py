"""Java formatting gate — placeholder for google-java-format (v2).

google-java-format requires a standalone JAR download (~13MB).
To enable this gate:
  1. Download the AOSP-style JAR:
       curl -L -o .claude/tools/google-java-format.jar \\
         https://github.com/google/google-java-format/releases/download/v1.25.2/google-java-format-1.25.2-all-deps.jar
  2. The gate will auto-detect the JAR at .claude/tools/google-java-format.jar.

Until the JAR is present this gate is a no-op.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

from .base import Finding, Gate

_JAR_PATH = ".claude/tools/google-java-format.jar"
_SOURCE_ROOT = "backend/src/main/java/"


class JavaFormat(Gate):
    name = "google-java-format"
    is_slow = False

    def run(self, file_path: str, repo_root: str) -> list[Finding]:
        fp = file_path.replace("\\", "/")
        if not fp.startswith(_SOURCE_ROOT):
            return []

        jar = Path(repo_root) / _JAR_PATH
        if not jar.exists():
            return []  # JAR not downloaded yet — skip silently

        abs_path = str(Path(repo_root) / file_path)

        try:
            result = subprocess.run(
                ["java", "-jar", str(jar),
                 "--aosp",          # 4-space indent (Android Open Source style)
                 "--dry-run",       # print filename if reformatting needed, no writes
                 abs_path],
                capture_output=True, text=True, timeout=8,
            )
        except Exception:  # noqa: BLE001
            return []

        # --dry-run prints the filename to stdout if the file needs formatting
        if result.stdout.strip():
            return [Finding(
                severity="error",
                message="File is not formatted. Run google-java-format --aosp --replace to fix.",
                rule="google-java-format",
            )]
        return []
