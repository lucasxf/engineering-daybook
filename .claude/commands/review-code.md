---
description: Review code using backend-code-reviewer agent
argument-hint: <file-or-class-name>
---

**Trigger backend-code-reviewer agent for code review.**

Target: $ARGUMENTS

**Workflow:**

1. **Identify target files**
   - If `$ARGUMENTS` is a file path → Review that file
   - If `$ARGUMENTS` is a class name → Find and review that class
   - If no arguments → Review recently modified files

2. **Delegate to backend-code-reviewer agent**
   - Perform comprehensive 10-dimension review
   - Check for project conventions compliance
   - Validate testing patterns
   - Check OpenAPI documentation

3. **Present findings**
   - Summary assessment
   - Strengths identified
   - Issues found (Critical/Major/Minor)
   - Recommendations
   - Prioritized action items
