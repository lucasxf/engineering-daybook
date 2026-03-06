#!/usr/bin/env python3
"""
sync-automation-registry.py — Automation Registry Sync Tool

Scans `.claude/agents/*.md` and `.claude/commands/*.md` (the source of truth)
and auto-generates all derived artifacts:

  1. KNOWN_AGENTS set in track-usage.py
  2. KNOWN_COMMANDS set in track-usage.py
  3. Available Commands table in .claude/commands/README.md
  4. Agent Overview table in .claude/agents-readme.md

Run this whenever agents or commands are added, renamed, or removed.
Also called automatically at the start of /compile-metrics (Step 0).

Usage:
    python3 .claude/scripts/sync-automation-registry.py
    python3 .claude/scripts/sync-automation-registry.py --dry-run  # print diffs, no writes
"""

import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent.parent  # .claude/
AGENTS_DIR = ROOT / "agents"
COMMANDS_DIR = ROOT / "commands"
SCRIPTS_DIR = ROOT / "scripts"

TRACK_USAGE_PY = SCRIPTS_DIR / "track-usage.py"
COMMANDS_README = COMMANDS_DIR / "README.md"
AGENTS_README = ROOT / "agents-readme.md"

DRY_RUN = "--dry-run" in sys.argv


# ---------------------------------------------------------------------------
# Frontmatter parsing
# ---------------------------------------------------------------------------

def parse_frontmatter(path: Path) -> dict:
    """Return a dict of key: value from YAML frontmatter (--- delimited)."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    fm_block = text[3:end]
    result = {}
    for line in fm_block.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            result[k.strip()] = v.strip()
    return result


# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------

def discover_agents() -> list[dict]:
    """
    Return a sorted list of agent dicts from .claude/agents/*.md.
    Skips the archive/ subdirectory and any file without a 'name' frontmatter field.
    """
    agents = []
    for path in sorted(AGENTS_DIR.glob("*.md")):
        if path.name.lower() == "readme.md":
            continue
        fm = parse_frontmatter(path)
        name = fm.get("name", "").strip()
        if not name:
            continue  # skip files that aren't proper agents
        agents.append({
            "name": name,
            "description": fm.get("description", "").strip(),
            "model": fm.get("model", "sonnet").strip(),
        })
    return sorted(agents, key=lambda a: a["name"])


def discover_commands() -> list[dict]:
    """
    Return a sorted list of command dicts from .claude/commands/*.md.
    Skips readme.md. Derives command name from filename stem.
    """
    commands = []
    for path in sorted(COMMANDS_DIR.glob("*.md")):
        if path.stem.lower() == "readme":
            continue
        fm = parse_frontmatter(path)
        name = path.stem  # e.g. compile-metrics
        description = fm.get("description", "").strip()
        hint = fm.get("argument-hint", "").strip()
        # Build a usage example: /command-name <hint>
        if hint and hint != "<no arguments>":
            usage = f"`/{name} {hint}`"
        else:
            usage = f"`/{name}`"
        commands.append({
            "name": name,
            "description": description,
            "usage": usage,
        })
    return sorted(commands, key=lambda c: c["name"])


# ---------------------------------------------------------------------------
# Replace between markers
# ---------------------------------------------------------------------------

def replace_between(content: str, begin_marker: str, end_marker: str, replacement: str) -> str:
    """
    Replace everything between begin_marker and end_marker (inclusive of marker lines)
    with: begin_marker + replacement + end_marker.
    If markers don't exist, appends them at the end of the file.
    """
    begin_idx = content.find(begin_marker)
    end_idx = content.find(end_marker)

    if begin_idx == -1 or end_idx == -1:
        # Markers not found — append at end
        return content.rstrip() + "\n\n" + begin_marker + "\n" + replacement + end_marker + "\n"

    # Include full lines
    before = content[:begin_idx]
    after = content[end_idx + len(end_marker):]
    return before + begin_marker + "\n" + replacement + end_marker + after


def write_if_changed(path: Path, new_content: str, label: str) -> bool:
    old_content = path.read_text(encoding="utf-8") if path.exists() else ""
    if old_content == new_content:
        print(f"  {label}: no changes")
        return False
    if DRY_RUN:
        print(f"  {label}: WOULD update (dry-run)")
        return False
    path.write_text(new_content, encoding="utf-8")
    print(f"  {label}: updated")
    return True


# ---------------------------------------------------------------------------
# 1. Update track-usage.py — KNOWN_AGENTS and KNOWN_COMMANDS
# ---------------------------------------------------------------------------

AGENTS_BEGIN = "# --- BEGIN AUTO-GENERATED: KNOWN_AGENTS ---"
AGENTS_END = "# --- END AUTO-GENERATED: KNOWN_AGENTS ---"
COMMANDS_BEGIN = "# --- BEGIN AUTO-GENERATED: KNOWN_COMMANDS ---"
COMMANDS_END = "# --- END AUTO-GENERATED: KNOWN_COMMANDS ---"


def format_python_set(var_name: str, names: list[str]) -> str:
    if not names:
        return f"{var_name} = set()\n"
    quoted = sorted(f'"{n}"' for n in names)
    lines = []
    row = []
    for q in quoted:
        row.append(q)
        if len(", ".join(row)) > 70:
            lines.append("    " + ", ".join(row[:-1]) + ",")
            row = [row[-1]]
    if row:
        lines.append("    " + ", ".join(row) + ",")
    body = "\n".join(lines)
    return f"{var_name} = {{\n{body}\n}}\n"


def update_track_usage(agents: list[dict], commands: list[dict]) -> bool:
    content = TRACK_USAGE_PY.read_text(encoding="utf-8")

    agent_names = [a["name"] for a in agents]
    command_names = [c["name"] for c in commands]

    agents_block = format_python_set("KNOWN_AGENTS", agent_names)
    commands_block = format_python_set("KNOWN_COMMANDS", command_names)

    # Replace or insert KNOWN_AGENTS block
    content = replace_between(content, AGENTS_BEGIN, AGENTS_END, agents_block)
    # Replace or insert KNOWN_COMMANDS block
    content = replace_between(content, COMMANDS_BEGIN, COMMANDS_END, commands_block)

    return write_if_changed(TRACK_USAGE_PY, content, "track-usage.py")


# ---------------------------------------------------------------------------
# 2. Update commands/README.md — Available Commands table
# ---------------------------------------------------------------------------

CMDS_TABLE_BEGIN = "<!-- BEGIN AUTO-GENERATED: COMMANDS_TABLE -->"
CMDS_TABLE_END = "<!-- END AUTO-GENERATED: COMMANDS_TABLE -->"


def format_commands_table(commands: list[dict]) -> str:
    rows = ["| Command | Description | Usage |", "|---------|-------------|-------|"]
    for c in commands:
        rows.append(f"| `/{c['name']}` | {c['description']} | {c['usage']} |")
    return "\n".join(rows) + "\n"


def update_commands_readme(commands: list[dict]) -> bool:
    content = COMMANDS_README.read_text(encoding="utf-8")
    table = format_commands_table(commands)
    new_content = replace_between(content, CMDS_TABLE_BEGIN, CMDS_TABLE_END, table)
    return write_if_changed(COMMANDS_README, new_content, "commands/README.md")


# ---------------------------------------------------------------------------
# 3. Update agents-readme.md — Agent Overview table
# ---------------------------------------------------------------------------

AGENTS_TABLE_BEGIN = "<!-- BEGIN AUTO-GENERATED: AGENTS_TABLE -->"
AGENTS_TABLE_END = "<!-- END AUTO-GENERATED: AGENTS_TABLE -->"

# Static metadata not available from frontmatter alone
AGENT_TRIGGERS = {
    "automation-sentinel": "On-demand",
    "hedy":                "On-demand",
    "imhotep":             "On-demand",
    "nexus":               "On-demand",
    "pixl":                "On-demand",
    "professor-x":         "On-demand",
    "session-optimizer":   "On-demand",
    "sous-chef":           "On-demand",
    "steward":             "Auto (/finish-session < 90% coverage)",
    "tech-writer":         "Delegated (/finish-session, /implement-spec)",
    "virgil":              "On-demand",
}

AGENT_NAME_ORIGINS = {
    "sous-chef":    "Kitchen metaphor: backend = kitchen; sous-chef enforces quality.",
    "imhotep":      "Imhotep (~2650 BC) — Egyptian polymath, first architect in history.",
    "pixl":         "—",
    "hedy":         "Hedy Lamarr — co-inventor of frequency-hopping spread spectrum.",
    "professor-x":  "Charles Xavier (X-Men) + Lucas **Xavier** Ferreira.",
    "virgil":       "Virgil Abloh — creative director who defined products across disciplines.",
    "session-optimizer": "—",
    "steward":      "—",
    "tech-writer":  "—",
    "nexus":        "—",
    "automation-sentinel": "—",
}


def format_agents_table(agents: list[dict]) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    count = len(agents)
    header = f"> **{count} custom agents** — last auto-updated {today}\n\n"
    rows = [
        "| Agent | Role | Model | Trigger |",
        "|-------|------|-------|---------|",
    ]
    for a in agents:
        # Truncate description to ~80 chars for the Role column
        role = a["description"].split(".")[0].split("—")[0].strip()
        if len(role) > 90:
            role = role[:87] + "..."
        # Strip leading "Use this agent when/for"
        role = re.sub(r"^Use this agent (when|for) ", "", role, flags=re.IGNORECASE)
        role = role.rstrip(",.:;")
        model = a["model"].capitalize()
        trigger = AGENT_TRIGGERS.get(a["name"], "On-demand")
        rows.append(f"| `{a['name']}` | {role} | {model} | {trigger} |")
    return header + "\n".join(rows) + "\n"


def update_agents_readme(agents: list[dict]) -> bool:
    content = AGENTS_README.read_text(encoding="utf-8")

    # Also update the "12 custom agents" header line using a regex
    count = len(agents)
    content = re.sub(
        r"This project includes \*\*\d+ custom agents\*\*",
        f"This project includes **{count} custom agents**",
        content,
    )

    # Update the last-updated date in the header
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    content = re.sub(r"\*\*Last updated:\*\* \S+", f"**Last updated:** {today}", content)

    # Replace the table
    table = format_agents_table(agents)
    new_content = replace_between(content, AGENTS_TABLE_BEGIN, AGENTS_TABLE_END, table)
    return write_if_changed(AGENTS_README, new_content, "agents-readme.md")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("Scanning agents and commands...")
    agents = discover_agents()
    commands = discover_commands()

    print(f"  Found {len(agents)} agents: {', '.join(a['name'] for a in agents)}")
    print(f"  Found {len(commands)} commands: {', '.join(c['name'] for c in commands)}")
    print()

    print("Updating derived files...")
    changed = []
    if update_track_usage(agents, commands):
        changed.append("track-usage.py")
    if update_commands_readme(commands):
        changed.append("commands/README.md")
    if update_agents_readme(agents):
        changed.append("agents-readme.md")

    print()
    if changed:
        print(f"Updated: {', '.join(changed)}")
    else:
        print("All files already up-to-date.")


if __name__ == "__main__":
    main()
