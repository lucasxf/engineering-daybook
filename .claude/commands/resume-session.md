---
description: Resume a previous development session
argument-hint: <optional: context or last-task>
---

@ROADMAP.md
@.claude/agents-readme.md

**Resume Development Session**

Context: $ARGUMENTS

**Workflow:**

1. **Check git status**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Review ROADMAP.md**
   - Check "In Progress" section for current work
   - Review "Next Steps" for priorities

3. **Determine context**
   - If `$ARGUMENTS` provided → Use as context
   - If uncommitted changes exist → Summarize them
   - If no context → Ask user: "What were you working on?"

4. **Provide session summary**
   - Current branch and status
   - Uncommitted changes (if any)
   - Last 5 commits
   - Current priorities from ROADMAP.md
   - Available agents for this session

5. **Ready to continue**
   - Suggest next actions based on context
