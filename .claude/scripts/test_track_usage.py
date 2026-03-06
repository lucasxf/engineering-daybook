#!/usr/bin/env python3
"""
Unit tests for track-usage.py delta-file logic.

Run with: python .claude/scripts/test_track_usage.py
"""

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

# Load track-usage.py (hyphenated name requires importlib)
_script_path = Path(__file__).parent / "track-usage.py"
_spec = importlib.util.spec_from_file_location("track_usage", _script_path)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

bootstrap_delta = _mod.bootstrap_delta
get_session_branch = _mod.get_session_branch
increment_entry = _mod.increment_entry
sanitize_branch_name = _mod.sanitize_branch_name
update_delta_metadata = _mod.update_delta_metadata
write_with_retry = _mod.write_with_retry
SESSIONS_DIR = _mod.SESSIONS_DIR


class TestSanitizeBranchName(unittest.TestCase):

    def test_slash_encoded_with_percent2F(self):
        self.assertEqual(sanitize_branch_name("feat/feature-a"), "feat%2Ffeature-a")

    def test_main_unchanged(self):
        self.assertEqual(sanitize_branch_name("main"), "main")

    def test_nested_slashes(self):
        self.assertEqual(sanitize_branch_name("feat/deep/nested"), "feat%2Fdeep%2Fnested")

    def test_empty_string_fallback(self):
        self.assertEqual(sanitize_branch_name(""), "unknown")

    def test_chore_branch(self):
        self.assertEqual(sanitize_branch_name("chore/cross-session-metrics"), "chore%2Fcross-session-metrics")

    def test_special_chars_stripped(self):
        result = sanitize_branch_name("feat/foo bar")
        self.assertNotIn(" ", result)

    def test_collision_safety(self):
        """feat/a/b and feat/a--b must produce distinct filenames."""
        self.assertNotEqual(
            sanitize_branch_name("feat/a/b"),
            sanitize_branch_name("feat/a--b"),
        )


class TestDeltaFileCreation(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_new_delta_file_created_with_correct_structure(self):
        """A new delta file should be created with invocations = 1."""
        delta_file = self.tmp_path / "feat--feature-a.toml"
        timestamp = "2026-03-06T12:00:00Z"

        content = bootstrap_delta("feat/feature-a", timestamp)
        content = increment_entry(content, "command_usage", "start-session", timestamp)
        content = update_delta_metadata(content, timestamp)
        write_with_retry(delta_file, content)

        result = delta_file.read_text(encoding="utf-8")
        self.assertIn("[metadata]", result)
        self.assertIn('session_branch = "feat/feature-a"', result)
        self.assertIn("[command_usage.start-session]", result)
        self.assertIn("invocations = 1", result)
        self.assertIn(f'last_used = "{timestamp}"', result)

    def test_no_productivity_or_health_sections(self):
        """Delta files must not contain [productivity] or [health]."""
        timestamp = "2026-03-06T12:00:00Z"
        content = bootstrap_delta("feat/feature-a", timestamp)
        content = increment_entry(content, "agent_usage", "Explore", timestamp)

        self.assertNotIn("[productivity]", content)
        self.assertNotIn("[health]", content)


class TestDeltaFileIncrement(unittest.TestCase):

    def test_existing_invocations_incremented(self):
        """An existing entry with invocations = 3 should become 4."""
        content = (
            "[metadata]\n"
            'session_branch = "main"\n'
            'session_start = "2026-03-06T10:00:00Z"\n'
            'last_updated = "2026-03-06T10:00:00Z"\n'
            "\n"
            "[command_usage.start-session]\n"
            "invocations = 3\n"
            'last_used = "2026-03-06T10:00:00Z"\n'
        )
        timestamp = "2026-03-06T12:00:00Z"
        result = increment_entry(content, "command_usage", "start-session", timestamp)

        self.assertIn("invocations = 4", result)
        self.assertIn(f'last_used = "{timestamp}"', result)

    def test_timestamp_updated_on_increment(self):
        """last_used should be updated to the new timestamp on increment."""
        content = (
            "[agent_usage.Explore]\n"
            "invocations = 7\n"
            'last_used = "2026-03-06T09:00:00Z"\n'
        )
        new_ts = "2026-03-06T15:00:00Z"
        result = increment_entry(content, "agent_usage", "Explore", new_ts)
        self.assertIn(f'last_used = "{new_ts}"', result)
        self.assertNotIn("2026-03-06T09:00:00Z", result)


class TestUnknownEntryAutoAdd(unittest.TestCase):

    def test_new_agent_appended(self):
        """An unknown agent not in the delta file should be added with invocations = 1."""
        content = (
            "[metadata]\n"
            'session_branch = "main"\n'
            'session_start = "2026-03-06T10:00:00Z"\n'
            'last_updated = "2026-03-06T10:00:00Z"\n'
        )
        timestamp = "2026-03-06T12:00:00Z"
        result = increment_entry(content, "agent_usage", "brand-new-agent", timestamp)

        self.assertIn("[agent_usage.brand-new-agent]", result)
        self.assertIn("invocations = 1", result)

    def test_new_command_appended(self):
        """An unknown command should be appended to the delta file."""
        content = "[metadata]\nlast_updated = \"2026-03-06T10:00:00Z\"\n"
        timestamp = "2026-03-06T12:00:00Z"
        result = increment_entry(content, "command_usage", "future-command", timestamp)

        self.assertIn("[command_usage.future-command]", result)
        self.assertIn("invocations = 1", result)


class TestCanonicalFileUntouched(unittest.TestCase):

    def test_canonical_file_not_modified(self):
        """
        track-usage.py must never modify usage-stats.toml directly.
        Verify by checking that SESSIONS_DIR is used, not the canonical path.
        """
        # The canonical path should not appear anywhere in the write path
        canonical = Path(__file__).parent.parent / "metrics" / "usage-stats.toml"
        sessions = Path(__file__).parent.parent / "metrics" / "sessions"

        # Structural check: SESSIONS_DIR points to sessions/, not metrics/ directly
        self.assertEqual(SESSIONS_DIR, sessions)
        self.assertNotEqual(SESSIONS_DIR, canonical.parent)
        self.assertFalse(SESSIONS_DIR == canonical)


class TestGetSessionBranchFallback(unittest.TestCase):

    def test_fallback_on_subprocess_failure(self):
        """get_session_branch() must return 'unknown' when git command fails."""
        with patch("subprocess.run", side_effect=Exception("git not found")):
            result = get_session_branch()
        self.assertEqual(result, "unknown")

    def test_fallback_on_empty_output(self):
        """get_session_branch() returns 'unknown' when git output is empty."""
        import subprocess as sp
        mock_result = sp.CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        with patch("subprocess.run", return_value=mock_result):
            result = get_session_branch()
        self.assertEqual(result, "unknown")


if __name__ == "__main__":
    unittest.main(verbosity=2)
