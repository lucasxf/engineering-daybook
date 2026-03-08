---
description: Run build in quiet mode
argument-hint: <optional: backend|web|mobile|all>
---

**Run build in quiet mode for faster feedback.**

Target: $ARGUMENTS

**Workflow:**

1. **Determine which build to run**
   - `backend` → `cd backend && ./mvnw clean install -q -DskipTests`
   - `web` → `cd web && npm run build`
   - `mobile` → `cd mobile && npx expo export`
   - `all` or no argument → Run all applicable builds

2. **Execute build**
   - Use quiet mode to reduce output
   - Capture success/failure status

3. **Report results**
   - BUILD SUCCESS or BUILD FAILURE
   - If failure, show error details
   - Suggest fixes if build fails
