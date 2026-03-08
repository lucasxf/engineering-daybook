---
description: Run tests for a specific service or class
argument-hint: <service-or-class-name>
---

**Run tests for specific service or class.**

Target: $ARGUMENTS

**Workflow:**

1. **Determine test target**
   - If `$ARGUMENTS` is a class name → Run tests for that class
   - If `$ARGUMENTS` is a service name → Run tests for that service

2. **Find test files**
   ```bash
   # Backend
   find backend/src/test -name "*$ARGUMENTS*Test.java"
   ```

3. **Execute tests**
   ```bash
   # Run specific test class
   cd backend && ./mvnw test -Dtest="*$ARGUMENTS*" -q
   ```

4. **Report results**
   - Summary: X tests passed, Y failed
   - If failures, show failure details
   - Suggest fixes
