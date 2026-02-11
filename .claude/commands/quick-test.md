---
description: Run tests quickly in quiet mode
argument-hint: <optional: backend|web|mobile|all>
---

**Run tests in quiet mode for faster feedback.**

Target: $ARGUMENTS

**Workflow:**

1. **Determine which tests to run**
   - `backend` → `cd backend && ./mvnw test -q`
   - `web` → `cd web && npm run test`
   - `mobile` → `cd mobile && npm run test`
   - `all` or no argument → Run all applicable tests

2. **Execute tests**
   - Use quiet mode (-q) to reduce output
   - Capture pass/fail status

3. **Report results**
   - Summary: X tests passed, Y failed
   - If failures, show failure details
   - Suggest next steps if tests fail
