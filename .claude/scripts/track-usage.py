#!/usr/bin/env python3
"""
Hook script — tracks agent and slash-command invocations in real-time.

Wired to two hook events in settings.json:

1. PostToolUse (Task | Skill):
   - Task: reads subagent_type → increments [agent_usage.<name>]
   - Skill: reads skill name → increments [command_usage.<name>]
     (fires when Claude programmatically invokes a slash command)

2. UserPromptSubmit:
   - Detects /command-name at the start of the user's prompt
   - Increments [command_usage.<name>]
     (fires when the user types a slash command directly in the CLI)

Bash tool calls are intentionally NOT scanned — free-text pattern matching
on Bash command strings produces false positives (commit messages, echo
output, etc. containing a command name get miscounted as invocations).

Unknown agents/commands are added automatically so the file self-heals
as new agents and commands are introduced.
"""

import json
import sys
import re
from datetime import datetime, timezone
from pathlib import Path

TOML_PATH = Path(__file__).parent.parent / "metrics" / "usage-stats.toml"

KNOWN_COMMANDS = {
    "start-session", "finish-session", "create-pr", "directive",
    "update-roadmap", "review-code", "quick-test", "build-quiet",
    "verify-quiet", "docker-start", "docker-stop", "api-doc",
    "resume-session", "save-response", "test-service", "write-spec",
    "implement-spec", "review-pr", "fix-pr",
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
        pattern = re.compile(
            rf"(\[{re.escape(section)}.{re.escape(key)}\]\s*\n"
            rf"invocations = )(\d+)",
        )
        content = pattern.sub(lambda m: m.group(1) + str(int(m.group(2)) + 1), content)
        pattern_date = re.compile(
            rf"(\[{re.escape(section)}.{re.escape(key)}\][^\[]*last_used = )\"[^\"]*\""
        )
        content = pattern_date.sub(lambda m: f'{m.group(1)}"{timestamp}"', content)
    else:
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


def detect_slash_command(prompt: str) -> str | None:
    """
    Detect a /command-name at the very start of a user prompt.
    Anchored to start — no free-text scanning, no false positives.
    """
    prompt = prompt.strip()
    for cmd in KNOWN_COMMANDS:
        if re.match(rf'^/{re.escape(cmd)}\b', prompt):
            return cmd
    return None


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
            # User typed a slash command directly in the CLI
            prompt = data.get("prompt", "")
            cmd = detect_slash_command(prompt)
            if cmd:
                section = "command_usage"
                key = cmd

        elif tool_name == "Task":
            # Claude spawned a subagent
            subagent_type = tool_input.get("subagent_type", "").strip()
            if subagent_type:
                section = "agent_usage"
                key = subagent_type

        elif tool_name == "Skill":
            # Claude programmatically invoked a slash command
            skill_name = tool_input.get("skill", "").strip()
            if skill_name:
                section = "command_usage"
                key = skill_name

        # Bash tool calls are intentionally not tracked here.

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
