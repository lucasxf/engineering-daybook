"""Base abstractions for quality gate runners."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class Finding:
    severity: str        # "error" | "warning"
    message: str
    line: int | None = None
    col: int | None = None
    rule: str | None = None

    def format(self) -> str:
        parts = []
        if self.line is not None:
            parts.append(f"L{self.line}")
        parts.append(self.message)
        if self.rule:
            parts.append(f"[{self.rule}]")
        prefix = "✗" if self.severity == "error" else "⚠"
        return f"{prefix} {' '.join(parts)}"


class Gate(ABC):
    name: str
    is_slow: bool = False

    @abstractmethod
    def run(self, file_path: str, repo_root: str) -> list[Finding]:
        """Run the gate on a single file. Return findings. Never raise."""
