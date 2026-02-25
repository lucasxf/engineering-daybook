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

## Known Pitfalls

- **`@Lazy` to break circular constructor injection:** When two services depend on each other via constructor injection, Spring throws `BeanCurrentlyInCreationException`. Fix: annotate one of the injected parameters with `@Lazy` — Spring injects a proxy instead of the real bean, breaking the cycle. Keep `@Lazy` on the less-frequently-used dependency. Never use field injection (`@Autowired`) just to avoid this; `@Lazy` preserves constructor injection semantics.

  ```java
  public TagSuggestionService(@Lazy TagService tagService, ...) { ... }
  ```

- **Java text block (`"""`) one-liner requires content on next line:** A text block `"""..."""` where the opening `"""` and content are on the same line is a compile error. Content must start on the line *after* the opening `"""`. This also means the first character of a text block is always at the indentation of the closing `"""`.

  ```java
  // WRONG — compile error
  String sql = """SELECT * FROM tags""";

  // CORRECT
  String sql = """
          SELECT * FROM tags
          """;
  ```

---

## Testing

- Unit tests: `src/test/java/.../service/` and `src/test/java/.../controller/`
- Integration tests: Testcontainers-backed, extend a base class that starts PostgreSQL container
- `@SpringBootTest` + `@ActiveProfiles("test")` → `application-test.yml` sets `flyway.enabled: false`, `ddl-auto: create-drop`
- JaCoCo line coverage threshold: **90%** (enforced in CI via `mvn verify`)
- Coverage report: `target/site/jacoco/jacoco.xml` (parse with Python's `xml.etree.ElementTree` for per-class line stats)

### Docker / Testcontainers Rule

**Never skip integration tests by proceeding when Docker is unavailable.** Always check Docker before running `mvn verify`:

```bash
docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_DOWN"
```

- **DOCKER_OK** → proceed with `mvn verify`
- **DOCKER_DOWN** → attempt to start Docker Desktop:
  ```bash
  start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  sleep 20
  docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_STILL_DOWN"
  ```
  If still down → **stop and ask the user**. Do not commit or open a PR with integration tests silently skipped — this leaves coverage data incomplete and integration regressions undetected.
