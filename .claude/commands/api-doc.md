---
description: Add OpenAPI documentation to a controller
argument-hint: <controller-name>
---

**Add OpenAPI/Swagger documentation to REST controller.**

Target: $ARGUMENTS

**Workflow:**

1. **Find controller file**
   - Search for `$ARGUMENTS` in backend/src/main/java
   - Verify it's a @RestController

2. **Delegate to tech-writer agent**
   - Add @Tag annotation at class level
   - Add @Operation annotation to each endpoint
   - Add @ApiResponses with all relevant status codes:
     - 200/201/204 for success
     - 400 for validation errors
     - 401 for authentication required
     - 403 for authorization denied
     - 404 for resource not found
     - 422 for business rule violations
   - Add @Parameter annotations for path/query parameters

3. **Show changes**
   - Display diff for review

4. **Verify**
   - Remind to check at http://localhost:8080/swagger-ui.html

5. **Commit prompt**
   - Ask: "Commit OpenAPI documentation? (y/n)"
