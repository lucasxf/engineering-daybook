---
description: Update ROADMAP.md with current progress
argument-hint: <what-was-completed>
---

@ROADMAP.md

**Update ROADMAP.md with session progress.**

Context: $ARGUMENTS

**Workflow:**

1. **Analyze current ROADMAP.md state**
   - Identify "In Progress" items
   - Review "Next Steps" priorities

2. **Determine updates needed**
   - If `$ARGUMENTS` provided → Use as context for what was completed
   - If no arguments → Ask user: "What was completed this session?"

3. **Apply updates**
   - Move completed items from "In Progress" → "Implemented"
   - Update "In Progress" with current work
   - Reprioritize "Next Steps" if needed
   - Update "Last updated" timestamp

4. **Show diff**
   - Display changes for review

5. **Commit prompt**
   - Ask: "Commit ROADMAP.md update? (y/n)"
   - If yes, commit with: "docs: Update ROADMAP.md - [brief summary]"
