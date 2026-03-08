---
description: Run full verification (build + tests) in quiet mode
argument-hint: <optional: backend|web|mobile|all>
---

**Run full verification in quiet mode.**

Target: $ARGUMENTS

**Workflow:**

1. **Determine which stack to verify**
   - `backend` → `cd backend && ./mvnw verify -q`
   - `web` → `cd web && npm run build && npm run test`
   - `mobile` → `cd mobile && npm run test`
   - `all` or no argument → Verify all stacks

2. **Execute verification**
   - Run build + tests together
   - Use quiet mode to reduce output

3. **Report results**
   - Summary per stack: PASS or FAIL
   - If failures, show details
   - Suggest fixes
