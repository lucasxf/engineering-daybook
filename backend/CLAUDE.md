# CLAUDE.md — Backend Context

> Load this file for backend sessions (Java/Spring Boot). Root `CLAUDE.md` is always loaded first.

---

## Tech Stack

- **Language:** Java 21 (use Virtual Threads where applicable)
- **Framework:** Spring Boot 4.0+
- **Build:** Maven 3.9+
- **Database:** PostgreSQL 15+ with pg_vector (Supabase)
- **Migration:** Flyway
- **API Docs:** SpringDoc OpenAPI (Swagger)
- **Testing:** JUnit 5, Mockito, Testcontainers

---

## Project Structure

```
/backend
├── /src/main/java/com/lucasxf/ed
│   ├── /config
│   ├── /controller
│   ├── /service
│   ├── /repository
│   ├── /domain
│   ├── /dto
│   ├── /security
│   └── /exception
├── /src/main/resources
│   ├── application.yml
│   └── /db/migration
├── /src/test
└── pom.xml
```

---

## Coding Conventions

```java
// Package structure
package com.lucasxf.ed.service;

// Imports: java → jakarta → spring → project → static
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import com.lucasxf.ed.domain.Pok;
import static java.util.Objects.requireNonNull;

/**
 * Service for POK operations.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-01-29
 */
@Service
public class PokService {

    private final PokRepository pokRepository;

    // Constructor injection ONLY (never @Autowired on fields)
    public PokService(PokRepository pokRepository) {
        this.pokRepository = requireNonNull(pokRepository);
    }
}
```

**Rules:**
- Constructor injection only (no `@Autowired` on fields)
- Use `@ConfigurationProperties` instead of `@Value`
- Use Lombok `@Slf4j` for logging instead of explicit `LoggerFactory.getLogger()` declarations
- 4 spaces indentation, 100 chars line limit
- Javadoc with `@author` and `@since` on public classes
- Tests required: unit + integration with Testcontainers

---

## Key Commands

```bash
cd backend
./mvnw spring-boot:run    # Run locally (use system mvn if mvnw fails on Windows)
./mvnw test               # Run tests (timeout: 5 min for full suite with Testcontainers)
./mvnw verify             # Run all checks (build + tests + JaCoCo)
```

> **Windows note:** `./mvnw` may fail with SSL errors. Use `mvn` from `C:\repo\apache-maven-3.9.11` instead.

> **Testcontainers timeout:** Full `mvn test` suite can exceed 2 min on Windows. Always pass `timeout: 300000` to Bash tool calls.

---

## Testing

- Unit tests: `src/test/java/.../service/` and `src/test/java/.../controller/`
- Integration tests: Testcontainers-backed, extend a base class that starts PostgreSQL container
- `@SpringBootTest` + `@ActiveProfiles("test")` → `application-test.yml` sets `flyway.enabled: false`, `ddl-auto: create-drop`
- JaCoCo line coverage threshold: **90%** (enforced in CI via `mvn verify`)
- Coverage report: `target/site/jacoco/jacoco.xml` (parse with Python's `xml.etree.ElementTree` for per-class line stats)
