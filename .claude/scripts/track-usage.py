#!/usr/bin/env python3
"""
Hook script — tracks agent and slash-command invocations in real-time.

Wired to two hook events in settings.json:

1. PostToolUse (Task | Agent | Skill):
   - Task: reads subagent_type → increments [agent_usage.<name>]
   - Agent: reads subagent_type → increments [agent_usage.<name>]
   - Skill: reads skill name → increments [command_usage.<name>]
     (fires when Claude programmatically invokes a slash command)

2. UserPromptSubmit:
   - Detects /command-name at the start of the user's prompt
   - Increments [command_usage.<name>]
     (fires when the user types a slash command directly in the CLI)

Bash tool calls are intentionally NOT scanned — free-text pattern matching
on Bash command strings produces false positives (commit messages, echo
output, etc. containing a command name get miscounted as invocations).

Unknown agents/commands invoked via Task or Skill tool events are added
automatically so the file self-heals as new agents and commands are
introduced. User-typed slash commands (UserPromptSubmit) are limited to
the KNOWN_COMMANDS allowlist — unknowns are silently ignored to avoid
false positives from free-text pattern matching.

Cross-session safety: each session writes to its own delta file at
.claude/metrics/sessions/{sanitized-branch}.toml instead of updating
usage-stats.toml directly. The canonical file is updated only by
/compile-metrics after PRs merge to develop.
"""

import json
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

SESSIONS_DIR = Path(__file__).parent.parent / "metrics" / "sessions"

# --- BEGIN AUTO-GENERATED: KNOWN_AGENTS ---
KNOWN_AGENTS = {
    "automation-sentinel", "hedy", "imhotep", "keepr", "nexus", "pixl",
    "professor-x", "sous-chef", "steward", "tech-writer", "virgil",
}
# --- END AUTO-GENERATED: KNOWN_AGENTS ---

# --- BEGIN AUTO-GENERATED: KNOWN_COMMANDS ---
KNOWN_COMMANDS = {
    "compile-metrics", "create-pr", "directive", "finish-session",
    "fix-pr", "fix-spec", "generate-v0-prompt", "implement-spec",
    "productivity-report", "review-pr", "review-spec", "save-response",
    "start-session", "write-spec",
}
# --- END AUTO-GENERATED: KNOWN_COMMANDS ---

# --- BEGIN AUTO-GENERATED: KNOWN_SKILLS ---
KNOWN_SKILLS = {
    "doc-coauthoring", "frontend-design", "mobile-design-system",
    "productivity-metrics", "prompt-optimizer", "save-learning",
    "skill-creator",
}
# --- END AUTO-GENERATED: KNOWN_SKILLS ---


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_session_branch() -> str:
    """Return the current git branch name, or 'unknown' on failure."""
    try:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        branch = result.stdout.strip()
        return branch if branch else "unknown"
    except Exception:
        return "unknown"


def sanitize_branch_name(name: str) -> str:
    """
    Convert a branch name to a safe, collision-free filename.
    Uses URL encoding for '/' so the mapping is injective:
      feat/feature-a  → feat%2Ffeature-a
      feat/a/b        → feat%2Fa%2Fb   (distinct from feat/a--b → feat%2Fa--b)
    Remaining unsafe filename characters are replaced with '_'.
    """
    safe = name.replace("/", "%2F")
    safe = re.sub(r"[^\w\-\.%]", "_", safe)
    return safe or "unknown"


def read_toml(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def bootstrap_delta(branch: str, timestamp: str) -> str:
    """Create minimal metadata for a new session delta file."""
    return (
        f'[metadata]\n'
        f'session_branch = "{branch}"\n'
        f'session_start = "{timestamp}"\n'
        f'last_updated = "{timestamp}"\n'
    )


def increment_entry(content: str, section: str, key: str, timestamp: str) -> str:
    """
    Increment invocations and set last_used for [section.key].
    Adds the entry if it doesn't exist.
    Delta files have no [productivity] section, so new entries are appended.
    """
    header = f"[{section}.{key}]"
    if header in content:
        pattern = re.compile(
            rf"(\[{re.escape(section)}\.{re.escape(key)}\]\s*\n"
            rf"invocations = )(\d+)",
        )
        content = pattern.sub(lambda m: m.group(1) + str(int(m.group(2)) + 1), content)
        pattern_date = re.compile(
            rf"(\[{re.escape(section)}\.{re.escape(key)}\][^\[]*last_used = )\"[^\"]*\""
        )
        content = pattern_date.sub(lambda m: f'{m.group(1)}"{timestamp}"', content)
    else:
        new_entry = f'\n[{section}.{key}]\ninvocations = 1\nlast_used = "{timestamp}"\n'
        content += new_entry

    return content


def update_delta_metadata(content: str, timestamp: str) -> str:
    """Update only last_updated in delta file metadata."""
    content = re.sub(r'last_updated = "[^"]*"', f'last_updated = "{timestamp}"', content)
    return content


def resolve_agent_key(tool_input: dict, subagent_type: str) -> str:
    """
    Determine the effective agent key for a Task or Agent tool event.

    Resolution order:
    1. If subagent_type is itself a known custom agent name → use it directly.
    2. Search description + prompt text for a known agent name (longest first
       to avoid prefix collisions, e.g. "automation-sentinel" before "sentinel").
    3. Fall back to subagent_type (built-in type like "general-purpose").
    """
    # Sorted longest-first so more-specific names win over shorter prefixes.
    sorted_agents = sorted(KNOWN_AGENTS, key=len, reverse=True)

    if subagent_type in sorted_agents:
        return subagent_type

    search_text = (
        tool_input.get("description", "") + " " + tool_input.get("prompt", "")
    ).lower()
    for agent_name in sorted_agents:
        if agent_name in search_text:
            return agent_name

    return subagent_type


def detect_slash_command(prompt: str) -> Optional[str]:
    """
    Detect a /command-name at the very start of a user prompt.
    Anchored to start — no free-text scanning, no false positives.
    """
    prompt = prompt.strip()
    for cmd in KNOWN_COMMANDS:
        if re.match(rf'^/{re.escape(cmd)}\b', prompt):
            return cmd
    return None


def detect_slash_skill(prompt: str) -> Optional[str]:
    """
    Detect a /skill-name at the very start of a user prompt (for skills, not commands).
    Returns the skill name, or None if not a known skill invocation.
    """
    prompt = prompt.strip()
    for skill in KNOWN_SKILLS:
        if re.match(rf'^/{re.escape(skill)}\b', prompt):
            return skill
    return None


def write_with_retry(path: Path, content: str, attempts: int = 3) -> None:
    """
    Write file content with retry on failure.
    Covers the rare case of concurrent hook invocations on Windows
    where two async hooks fire nearly simultaneously for the same session.
    """
    for attempt in range(attempts):
        try:
            path.write_text(content, encoding="utf-8")
            return
        except OSError:
            if attempt < attempts - 1:
                time.sleep(0.05)
            else:
                raise


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            sys.exit(0)

        data = json.loads(raw)
        hook_event = data.get("hook_event_name", "")
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})
        timestamp = now_iso()

        section = None
        key = None

        if hook_event == "UserPromptSubmit":
            # User typed a slash command or skill invocation directly in the CLI
            prompt = data.get("prompt", "")
            cmd = detect_slash_command(prompt)
            if cmd:
                section = "command_usage"
                key = cmd
            else:
                skill = detect_slash_skill(prompt)
                if skill:
                    section = "skill_usage"
                    key = skill

        elif tool_name in ("Task", "Agent"):
            # Claude spawned a subagent (Task or Agent tool)
            subagent_type = tool_input.get("subagent_type", "").strip()
            if subagent_type:
                section = "agent_usage"
                key = resolve_agent_key(tool_input, subagent_type)

        elif tool_name == "Skill":
            # Claude invoked a skill or slash command via the Skill tool.
            # Skills (KNOWN_SKILLS) go to skill_usage; slash commands go to command_usage.
            skill_name = tool_input.get("skill", "").strip()
            if skill_name:
                if skill_name in KNOWN_SKILLS:
                    section = "skill_usage"
                    key = skill_name
                elif skill_name in KNOWN_COMMANDS:
                    section = "command_usage"
                    key = skill_name
                # Unknown names (built-ins like claude-code-guide) are ignored.

        # Bash tool calls are intentionally not tracked here.

        if not section or not key:
            sys.exit(0)

        # Resolve session delta file
        branch = get_session_branch()
        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        delta_file = SESSIONS_DIR / f"{sanitize_branch_name(branch)}.toml"

        content = read_toml(delta_file)
        if not content:
            content = bootstrap_delta(branch, timestamp)

        content = increment_entry(content, section, key, timestamp)
        content = update_delta_metadata(content, timestamp)
        write_with_retry(delta_file, content)

    except Exception:
        # Never block Claude — silently exit on any error
        sys.exit(0)


if __name__ == "__main__":
    main()
