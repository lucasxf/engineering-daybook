---
description: Stop Docker development environment
argument-hint: <optional: service-name>
---

**Stop Docker Compose development environment.**

Target: $ARGUMENTS

**Workflow:**

1. **Navigate to infrastructure directory**
   ```bash
   cd infra
   ```

2. **Stop services**
   - If `$ARGUMENTS` provided → Stop specific service
   - If no arguments → Stop all services

   ```bash
   # All services
   docker compose down

   # Specific service
   docker compose stop $ARGUMENTS
   ```

3. **Report status**
   - Confirm services stopped
   - Note any persistent volumes
