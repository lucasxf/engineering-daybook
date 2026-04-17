"""Maps a file path to the list of gates that apply to it."""

from __future__ import annotations

from .base import Gate


def get_gates(file_path: str) -> list[Gate]:
    """Return the applicable gates for the given repo-relative file path.

    Gates are imported lazily so that missing optional dependencies (e.g. a
    gate whose tool isn't installed yet) only fail at gate-run time, not at
    import time.
    """
    # Normalise separators so the same logic works on Windows paths
    fp = file_path.replace("\\", "/")

    if (fp.startswith(("web/", "mobile/")) and fp.endswith((".ts", ".tsx"))):
        from .ts_lint import TsLint
        from .ts_format import TsFormat
        from .ts_imports import TsImports
        from .security_scan import SecurityScan
        return [TsLint(), TsFormat(), TsImports(), SecurityScan()]

    if fp.startswith("backend/") and fp.endswith(".java"):
        from .java_lint import JavaLint
        from .java_format import JavaFormat
        from .security_scan import SecurityScan
        return [JavaLint(), JavaFormat(), SecurityScan()]

    if fp.endswith(".sh"):
        # Shell lint gate added in Milestone 4+
        return []

    return []
