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

- **`@EnableAsync` is required for `@Async` to work:** Without `@EnableAsync` on `EdApplication` (or a `@Configuration` class), Spring silently ignores `@Async` and executes annotated methods synchronously on the calling thread. Always add `@EnableAsync` when introducing the first `@Async` method — there is no warning when it's missing.

- **`pgvector/pgvector:pg15` ships the extension but does NOT activate it — `CREATE EXTENSION` is always required:** The Docker image installs the pgvector binaries, but `CREATE EXTENSION IF NOT EXISTS vector` must be run against each database before any DDL that references the `vector` type. This applies to both Testcontainers (local) and CI service containers. If a `@DynamicPropertySource` method has separate branches for CI vs. local, the extension enable step must live **outside the branch** (or in a shared helper) so it cannot drift. Pattern used in `PokRepositoryTest`:

  ```java
  // In @DynamicPropertySource — after resolving url/username/password from either branch:
  enablePgVector(url, username, password);   // always runs, regardless of CI vs. local

  private static void enablePgVector(String url, String user, String pass) {
      try (Connection conn = DriverManager.getConnection(url, user, pass)) {
          conn.createStatement().execute("CREATE EXTENSION IF NOT EXISTS vector;");
      } catch (Exception e) {
          throw new RuntimeException("Failed to enable pgvector extension", e);
      }
  }
  ```

  Symptom when missing: `ERROR: relation "table_name" does not exist` on INSERT — Hibernate silently fails to create the table because the `vector(N)` column type was unresolvable. Tests pass locally (Testcontainers path had the fix) but fail in CI (service container path did not).

- **pgvector: map `float[]` to `vector` column with `@ColumnTransformer`, not a custom dialect:** Hibernate has no built-in type for PostgreSQL's `vector` column type. The correct approach is (1) a `@Converter(autoApply = false)` that serializes `float[]` to/from the `[x,y,z,...]` string format that pgvector accepts, and (2) `@ColumnTransformer(write = "?::vector")` on the field so Hibernate emits the correct cast in INSERT/UPDATE. Without the `::vector` cast, Postgres rejects the raw text value with `ERROR: column is of type vector but expression is of type text`. Do NOT use the pgvector Hibernate dialect shim — it pulls in the full pgvector-spring-ai stack and conflicts with the existing RestClient auto-configuration.

  ```java
  @Convert(converter = VectorAttributeConverter.class)
  @ColumnTransformer(write = "?::vector")
  @Column(name = "embedding", columnDefinition = "vector(1536)")
  private float[] embedding;
  ```

- **`@ConditionalOnMissingBean` on `RestClient.Builder` for embedding service testability:** The `HuggingFaceEmbeddingService` is injected with a `RestClient.Builder`. Declaring the builder bean with `@Bean @ConditionalOnMissingBean` in a `@Configuration` class allows integration tests to `@MockitoBean` or `@TestConfiguration`-override the builder without fighting Spring Boot's auto-configured default. Without this guard, the test context fails with a duplicate bean definition if both auto-configuration and the explicit bean are present.

- **Async embedding generation: `@Async` methods must be on Spring-managed beans, not called from within the same class:** Calling an `@Async` method on `this` (self-invocation) bypasses the proxy and executes synchronously. Always inject the service into itself (via `@Lazy` constructor injection) or extract the `@Async` method into a separate Spring component if you need to call it from within the same class. For embedding: `PokService` calls `embeddingService.generateAndSave(pokId)` — keep them in separate beans.

- **State-machine transitions must query by expected source state:** When implementing approve/reject (or any state transition), always query by expected status in addition to ownership (`findByIdAndUserIdAndStatus(id, userId, PENDING)`), not by identity alone. Querying only by `id + userId` allows replaying already-resolved transitions (e.g., REJECTED → approve again), creating orphaned records and contradictory history.

- **Hoist repeated repository queries out of streams:** A repository call inside `stream().flatMap(...)` with fixed arguments re-executes for every element — a Java N+1 pattern. Hoist the call to a variable before the stream. For list endpoints processing N entities, pass the pre-fetched list into a private method overload rather than re-querying inside each `map`.

- **List endpoints must include relationship data if the UI renders it:** Returning `List.of()` for a field like `tags` on list/search endpoints silently breaks any UI component that renders that field (e.g., `PokCard` tag badges). Verify that all fields the frontend reads are populated for every endpoint path — not just `getById`.

- **Java text block (`"""`) one-liner requires content on next line:** A text block `"""..."""` where the opening `"""` and content are on the same line is a compile error. Content must start on the line *after* the opening `"""`. This also means the first character of a text block is always at the indentation of the closing `"""`.

  ```java
  // WRONG — compile error
  String sql = """SELECT * FROM tags""";

  // CORRECT
  String sql = """
          SELECT * FROM tags
          """;
  ```

- **`SameSite=None` is required for cross-origin cookies (different domains):** When the frontend and backend are on different domains (e.g., learnimo.net on Vercel and railway.app on Railway), `SameSite=Strict` or `SameSite=Lax` will cause the browser to silently block the auth cookie on cross-origin requests — the backend receives no cookie and returns 401 with no body. Fix: use `SameSite=None`. `SameSite=None` **requires** `Secure=true` (HTTPS-only); without it, browsers reject the cookie. In production, set `AUTH_COOKIE_SECURE=true` (or the equivalent env var) in Railway. In local dev (HTTP), `SameSite=Lax` is fine and avoids the `Secure` requirement.

- **`/error` must be in Spring Security `permitAll()`:** Spring dispatches internally to `/error` when an unhandled exception occurs. If `/error` is not in the `permitAll()` list, the security filter chain intercepts the error dispatch and returns a 401 with an empty response body — the actual error information is swallowed. Always include `"/error"` in `requestMatchers(...).permitAll()` in `SecurityConfig`.

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
