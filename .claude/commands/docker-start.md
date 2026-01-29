---
description: Start Docker development environment
argument-hint: <optional: service-name>
---

**Start Docker Compose development environment.**

Target: $ARGUMENTS

**Workflow:**

1. **Navigate to infrastructure directory**
   ```bash
   cd infra
   ```

2. **Start services**
   - If `$ARGUMENTS` provided → Start specific service
   - If no arguments → Start all services

   ```bash
   # All services
   docker compose up -d --build --quiet-pull

   # Specific service
   docker compose up -d --build --quiet-pull $ARGUMENTS
   ```

3. **Verify services are running**
   ```bash
   docker compose ps
   ```

4. **Report status**
   - List running services with ports
   - Show any startup errors
   - Remind of useful endpoints (e.g., database, API)
