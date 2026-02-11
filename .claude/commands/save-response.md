---
description: Save Claude's last response to a file
argument-hint: <filename>
---

**Save the previous response to a file.**

Filename: $ARGUMENTS

**Workflow:**

1. **Determine filename**
   - If `$ARGUMENTS` provided → Use as filename
   - If no arguments → Generate timestamped filename: `response-YYYY-MM-DD-HHMM.md`

2. **Determine save location**
   - Default: `prompts/responses/`
   - Create directory if it doesn't exist

3. **Save content**
   - Save previous response to file
   - Add header with timestamp

4. **Confirm**
   - Show saved file path
   - Note: File is in .gitignore by default
