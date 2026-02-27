#!/usr/bin/env python3
"""
PostToolUse hook — tracks agent invocations in real-time.

Fires after every Task tool call. Reads the subagent_type from stdin JSON,
increments the matching [agent_usage.<name>] entry in usage-stats.toml,
and updates last_used timestamp. No LLM involved — pure file I/O.

Also fires on Bash tool calls matching command slash commands, updating
[command_usage.<name>] entries. Detects commands by inspecting the
tool_input.command field for known .claude/commands/ patterns.

Unknown agents/commands are added automatically so the file self-heals
as new agents are introduced.
"""

import json
import sys
import os
import re
from datetime import datetime, timezone
from pathlib import Path

TOML_PATH = Path(__file__).parent.parent / "metrics" / "usage-stats.toml"

KNOWN_COMMANDS = {
    "start-session", "finish-session", "create-pr", "directive",
    "update-roadmap", "review-code", "quick-test", "build-quiet",
    "verify-quiet", "docker-start", "docker-stop", "api-doc",
    "resume-session", "save-response", "test-service", "write-spec",
    "implement-spec", "review-pr",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def read_toml(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def increment_entry(content: str, section: str, key: str, timestamp: str) -> str:
    """
    Increment invocations and set last_used for [section.key].
    Adds the entry if it doesn't exist.
    """
    header = f"[{section}.{key}]"
    if header in content:
        # Increment invocations
        def bump(m):
            return f"invocations = {int(m.group(1)) + 1}"
        # Only replace within this section — find the block and patch it
        pattern = re.compile(
            rf"(\[{re.escape(section)}.{re.escape(key)}\]\s*\n"
            rf"invocations = )(\d+)",
        )
        content = pattern.sub(lambda m: m.group(1) + str(int(m.group(2)) + 1), content)
        # Update last_used
        pattern_date = re.compile(
            rf"(\[{re.escape(section)}.{re.escape(key)}\][^\[]*last_used = )\"[^\"]*\""
        )
        content = pattern_date.sub(lambda m: f'{m.group(1)}"{timestamp}"', content)
    else:
        # Append new entry before [productivity] or at end
        new_entry = f'\n[{section}.{key}]\ninvocations = 1\nlast_used = "{timestamp}"\n'
        if "[productivity]" in content:
            content = content.replace("[productivity]", new_entry + "\n[productivity]", 1)
        else:
            content += new_entry

    return content


def update_metadata(content: str, timestamp: str) -> str:
    content = re.sub(r'timestamp = "[^"]*"', f'timestamp = "{timestamp}"', content)
    content = re.sub(r'updated_by = "[^"]*"', 'updated_by = "hook"', content)
    return content


def detect_command(tool_input: dict) -> str | None:
    """Extract slash command name from a Bash tool_input, if any."""
    command = tool_input.get("command", "")
    for cmd in KNOWN_COMMANDS:
        # Matches patterns like: /finish-session, start-session, etc.
        if re.search(rf'\b{re.escape(cmd)}\b', command):
            return cmd
    return None


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            sys.exit(0)

        data = json.loads(raw)
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})
        timestamp = now_iso()

        section = None
        key = None

        if tool_name == "Task":
            subagent_type = tool_input.get("subagent_type", "").strip()
            if subagent_type:
                section = "agent_usage"
                key = subagent_type

        elif tool_name == "Bash":
            cmd = detect_command(tool_input)
            if cmd:
                section = "command_usage"
                key = cmd

        if not section or not key:
            sys.exit(0)

        content = read_toml(TOML_PATH)
        content = increment_entry(content, section, key, timestamp)
        content = update_metadata(content, timestamp)
        TOML_PATH.write_text(content, encoding="utf-8")

    except Exception:
        # Never block Claude — silently exit on any error
        sys.exit(0)


if __name__ == "__main__":
    main()
