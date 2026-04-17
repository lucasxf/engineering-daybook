# Per-File Quality Gates — Claude Code Hook Architecture

> Plan file for implementing per-file quality gates via Claude Code hooks.
> Reference this file with `@docs/plans/quality-gates-hook-architecture.md` after context compaction.

## Context

The learnimo monorepo has no automated code quality enforcement during active editing. Lint issues, formatting inconsistencies, security vulnerabilities, and import disorder are only caught at PR review time (or not at all). Prettier is not installed anywhere, Checkstyle is absent from the backend, and there's no secrets scanner. The goal is to run per-file quality checks immediately after Claude edits any source file, surfacing issues as `additionalContext` so Claude self-corrects within the same turn.

**Current state:** ESLint 9 installed in `web/` and `mobile/`; JaCoCo in `backend/`; no Prettier, no Checkstyle, no security scanner, no import sorting anywhere.

---

## Progress Tracker

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Scaffolding (`run-quality-gate.sh`, `quality-gate.py`, `gates/base.py`, `gates/router.py`, settings.json) | ✅ Done |
| 2 | TS lint gate (`gates/ts_lint.py`) | ✅ Done |
| 3 | TS format + imports (install Prettier, `gates/ts_format.py`, `gates/ts_imports.py`) | ✅ Done |
| 4 | Java gates (`gates/java_lint.py`, `gates/java_format.py`, Checkstyle in pom.xml) | ✅ Done |
| 5 | Security scanning (`gates/security_scan.py`, semgrep) | ✅ Done |
| 6 | Debounce + reporting + sync automation registry | ✅ Done |

---

## 1. Hook Type Selection

**Recommended: `PostToolUse` with `Edit|Write` matcher, sync mode.**

| Dimension | PostToolUse | Stop | FileChanged |
|-----------|------------|------|-------------|
| File path in stdin | ✅ `tool_input.file_path` | ❌ Must reconstruct | ✅ `file_path` |
| Fires per... | Each edit | Once per turn | Each disk event (double-fires) |
| Can inject `additionalContext` | ✅ Sync mode | ❌ Turn already ended | ✅ But unreliable |
| Self-correction | ✅ Claude sees & fixes | ❌ Would need follow-up | ⚠️ Timing issues |

**Decisive trade-off:** Only PostToolUse lets Claude see findings and self-correct in the same turn. Stop fires too late; FileChanged double-fires.

---

## 2. Architecture

```
Claude Edit/Write → PostToolUse fires
        ↓
  run-quality-gate.sh (bash, finds python)
        ↓
  quality-gate.py (Python orchestrator)
        ↓
  router.py → determines stack from file path
        ↓
  ┌─────────────┬─────────────┬──────────────┐
  │  ts_lint.py  │ ts_format.py│ ts_imports.py│  ← ThreadPoolExecutor (parallel, sync)
  └──────┬───────┴──────┬──────┴──────┬───────┘
         └──────────────┼─────────────┘
                        ↓
              Collect findings → stdout JSON
              { "additionalContext": "## Quality: file.ts\n- L42: ..." }
                        ↓
              Background: security_scan.py → .claude/quality-gate-reports/
```

**Fast gates (sync, ≤8s):** lint, format-check, import-sort → `additionalContext`
**Slow gates (async, background):** security scan → report file

---

## 3. Hook Configuration

Add to `.claude/settings.json` as a **second** `PostToolUse` entry (existing `Task|Agent|Skill` entry untouched):

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "bash \".claude/scripts/run-quality-gate.sh\"",
      "timeout": 10
    }
  ]
}
```

- Sync (no `"async": true`) — so `additionalContext` reaches Claude
- 10s timeout — hard kill if anything hangs
- Permissions to add: `"Bash(npx eslint *)"`, `"Bash(npx prettier *)"`

---

## 4. Script Architecture

### New files

```
.claude/scripts/
  run-quality-gate.sh          # Bash dispatcher (mirrors run-track-usage.sh)
  quality-gate.py              # Python orchestrator
  gates/
    __init__.py
    base.py                    # Finding dataclass + Gate ABC
    router.py                  # file path → list[Gate]
    ts_lint.py                 # ESLint wrapper
    ts_format.py               # Prettier --check wrapper
    ts_imports.py              # eslint-plugin-simple-import-sort check
    java_lint.py               # Checkstyle wrapper
    java_format.py             # google-java-format --dry-run wrapper
    security_scan.py           # Semgrep wrapper (is_slow=True)
```

### Core abstractions (`gates/base.py`)

```python
@dataclass
class Finding:
    severity: str      # "error" | "warning"
    line: int | None
    message: str
    rule: str | None

class Gate(ABC):
    name: str
    is_slow: bool = False

    @abstractmethod
    def run(self, file_path: str) -> list[Finding]: ...
```

### Router (`gates/router.py`)

```python
def get_gates(file_path: str) -> list[Gate]:
    if file_path.startswith(("web/", "mobile/")) and file_path.endswith((".ts", ".tsx")):
        return [TsLint(), TsFormat(), TsImports(), SecurityScan()]
    elif file_path.startswith("backend/") and file_path.endswith(".java"):
        return [JavaLint(), JavaFormat(), SecurityScan()]
    elif file_path.endswith(".sh"):
        return [ShellLint()]
    return []
```

### Orchestrator (`quality-gate.py`)

```python
def main():
    data = json.load(sys.stdin)
    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)
    gates = router.get_gates(file_path)
    fast = [g for g in gates if not g.is_slow]
    slow = [g for g in gates if g.is_slow]
    findings = run_parallel(fast, file_path, timeout=8)
    spawn_background(slow, file_path)
    if findings:
        context = format_findings(file_path, findings)
        json.dump({"additionalContext": context}, sys.stdout)
```

---

## 5. Tool Matrix

| Gate | web/ & mobile/ (TS/TSX) | backend/ (Java) | Status |
|------|------------------------|-----------------|--------|
| **Lint** | ESLint 9 | Checkstyle 10.x | ESLint ✅; Checkstyle ❌ new |
| **Format** | Prettier 3.x (`--check`) | google-java-format (`--dry-run`) | Both ❌ new |
| **Import sort** | eslint-plugin-simple-import-sort | Checkstyle ImportOrder | Both ❌ new |
| **Security** | Semgrep OSS | Semgrep OSS | ❌ new (`pip install semgrep`) |
| **Code review** | Manual (v1) | Manual via sous-chef (v1) | Deferred to v2 |

---

## 6. Parallelism Design

```
ThreadPoolExecutor(max_workers=4)
  ├── ts_lint.py      (subprocess: npx eslint)
  ├── ts_format.py    (subprocess: npx prettier --check)
  └── ts_imports.py   (subprocess: npx eslint --rule simple-import-sort)
  → collect all, ≤8s total

Background (Popen, fire-and-forget):
  └── security_scan.py (subprocess: semgrep)
```

- `ThreadPoolExecutor` (not asyncio) — simpler for blocking `subprocess.run` on Windows
- Debounce: skip if same file was gated within 3 seconds (`.last_gate_ts` marker)

---

## 7. Key Design Decisions

- **Format mode:** `--check` only (report, don't write) — avoids conflicts with Claude's in-progress edits
- **Severity threshold:** errors only injected into `additionalContext` in v1
- **sous-chef:** cannot be invoked from a hook; Java code review remains manual in v1
- **TS code review:** deferred to v2; ESLint + Prettier + semgrep sufficient for v1

---

## 8. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| N fires for N edits (performance) | 3s per-file debounce; 10s hard timeout |
| Format auto-fix conflicts with edits | `--check` mode only |
| Windows Git Bash subprocess quirks | Absolute path resolution; `shell=True` fallback |

---

## 9. Open Questions (user decisions needed)

1. **Format: report-only vs auto-fix?** Default: report-only
2. **Severity threshold:** errors only, or warnings too?
3. **Debounce window:** 3 seconds? Configurable via env var?
4. **Semgrep:** pip vs binary download?
5. **ESLint config changes** for import-sort: bundle with Milestone 3?
6. **AI code review:** defer to v2?

---

## Verification

1. Edit a `.ts` file with deliberate unused variable → `additionalContext` shows ESLint error
2. Edit a `.java` file with wrong indentation → Checkstyle finding appears
3. Edit 5 files rapidly → debounce prevents excessive runs
4. Introduce hardcoded secret → semgrep catches it in background report
5. Existing `Task|Agent|Skill` tracking hook still works unchanged
