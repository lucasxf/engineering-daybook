"""Prettier formatting gate for TypeScript/TSX files (--check mode, no writes)."""

from __future__ import annotations

import subprocess
from pathlib import Path

from .base import Finding, Gate


class TsFormat(Gate):
    name = "prettier"
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

        try:
            result = subprocess.run(
                ["npx", "prettier", "--check", abs_path],
                capture_output=True, text=True, timeout=8,
                cwd=cwd, shell=False,
            )
        except FileNotFoundError:
            try:
                result = subprocess.run(
                    f'npx prettier --check "{abs_path}"',
                    capture_output=True, text=True, timeout=8,
                    cwd=cwd, shell=True,
                )
            except Exception:  # noqa: BLE001
                return []
        except Exception:  # noqa: BLE001
            return []

        # prettier --check exits 1 when the file is not formatted, 0 when ok
        if result.returncode == 0:
            return []

        return [Finding(
            severity="error",
            message="File is not formatted. Run `npx prettier --write` to fix.",
            rule="prettier/prettier",
        )]
