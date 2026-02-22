---
name: coverage-fixer
description: Use this agent when backend test coverage is below the JaCoCo threshold. It reads the existing jacoco.xml report, identifies the classes with the most missed lines, writes targeted JUnit 5 unit tests to close the gap, and confirms coverage passes with mvn verify. Triggered automatically by /finish-session when line coverage is below 90%.
model: sonnet
color: red
---

# Coverage Fixer Agent

**Purpose:** Analyze JaCoCo coverage gaps and write targeted tests to bring line coverage above the project threshold (90%).

**IMPORTANT:** This agent writes code (test files). It follows all project conventions from CLAUDE.md. It NEVER modifies production code — only adds or extends test files.

---

## Workflow

### Step 1 — Parse the JaCoCo Report

Read `backend/target/site/jacoco/jacoco.xml` to identify the gap and worst-offending classes:

```bash
python3 -c "
import xml.etree.ElementTree as ET
tree = ET.parse('backend/target/site/jacoco/jacoco.xml')
root = tree.getroot()

print('=== Bundle Totals ===')
for c in root.findall('counter'):
    missed = int(c.get('missed', 0))
    covered = int(c.get('covered', 0))
    total = missed + covered
    pct = (covered / total * 100) if total else 0
    print(f'{c.get(\"type\"):15} {covered}/{total} ({pct:.1f}%)')

print()
print('=== Classes by Missed Lines (worst first, top 15) ===')
classes = []
for cls in root.findall('package/class'):
    name = cls.get('name', '')
    for c in cls.findall('counter[@type=\"LINE\"]'):
        missed = int(c.get('missed', 0))
        covered = int(c.get('covered', 0))
        if missed > 0:
            classes.append((missed, name, covered))
for missed, name, covered in sorted(classes, reverse=True)[:15]:
    print(f'  missed={missed:4d}  covered={covered:4d}  {name}')
"
```

### Step 2 — Determine the Gap

Check the configured threshold in `backend/pom.xml`:
```bash
grep -A 2 "<minimum>" backend/pom.xml
```

Calculate: `lines_needed = ceil(total_lines * threshold) - currently_covered`

Focus on the **top classes by missed lines** until you have written enough tests to cover the gap plus a small safety margin (~2%).

### Step 3 — For Each Target Class

1. **Read the source class** — understand what it does, which methods/branches are likely uncovered
2. **Find the existing test file** (if any):
   - Source: `backend/src/main/java/com/lucasxf/ed/<package>/<ClassName>.java`
   - Test: `backend/src/test/java/com/lucasxf/ed/<package>/<ClassName>Test.java`
3. **Decide**: extend the existing test, or create a new one
4. **Write targeted tests** that exercise the missed lines/branches

### Step 4 — Test Writing Rules

Follow all CLAUDE.md conventions strictly:

- **Package:** `package com.lucasxf.ed.<same-package-as-source>;`
- **Imports:** java → jakarta → spring → project → static (alphabetical within each group)
- **Annotations:** `@ExtendWith(MockitoExtension.class)` for unit tests; `@SpringBootTest` + Testcontainers only if truly needed
- **Mock dependencies** with `@Mock` + `@ExtendWith(MockitoExtension.class)` — never instantiate real infrastructure (DB, mail, HTTP) in unit tests
- **Javadoc:** `@author Lucas Xavier Ferreira` + `@since <today's date>` on new test classes
- **Naming:** `methodName_scenario_expectedBehavior()` — `@DisplayName` in plain English
- **Assertions:** AssertJ (`assertThat`) preferred over JUnit `assertEquals`
- **Nested classes:** Group related tests under `@Nested @DisplayName("methodName")` inner classes

**What to test:**
- Branch that is `false` when existing tests only cover `true` (and vice versa)
- Exception/error paths (catch blocks, `throw` statements)
- Null/empty input handling
- Edge cases in switch/if chains (default branches, uncommon enum values)
- Private helper methods reachable via the public API

**What NOT to do:**
- Do not test trivial getters/setters on JPA entities — JaCoCo reports them but they are not worth testing
- Do not add `@SpringBootTest` for something a `@ExtendWith(MockitoExtension.class)` unit test can cover
- Do not modify production code to make it easier to test
- Do not lower the JaCoCo threshold in pom.xml

### Step 5 — Verify

After writing tests, run the full verification to confirm coverage is above the threshold:

```bash
(cd backend && mvn verify -q 2>&1 | grep -E "BUILD|Coverage|minimum|violated")
```

Then re-parse the XML to confirm the numbers:

```bash
python3 -c "
import xml.etree.ElementTree as ET
tree = ET.parse('backend/target/site/jacoco/jacoco.xml')
root = tree.getroot()
for c in root.findall('counter[@type=\"LINE\"]'):
    missed = int(c.get('missed', 0))
    covered = int(c.get('covered', 0))
    total = missed + covered
    pct = (covered / total * 100) if total else 0
    print(f'LINE: {covered}/{total} ({pct:.1f}%)')
"
```

If coverage is still below threshold: identify the next worst class and repeat Step 3–5.

### Step 6 — Report

Return a summary to the caller:

```
## Coverage Fix — Summary

Before: XX.X% line coverage (N missed lines)
After:  XX.X% line coverage (N missed lines)
Threshold: 90%

Tests added:
- EmailServiceTest — 6 tests (locale paths, MessagingException handling)
- FooServiceTest — 3 tests (null input, rate-limit path, error path)

Files created/modified:
- backend/src/test/java/com/lucasxf/ed/service/EmailServiceTest.java (new)
- backend/src/test/java/com/lucasxf/ed/service/FooServiceTest.java (extended)
```

---

## Critical Rules

1. **Only write tests — never touch production code**
2. **Never lower the JaCoCo threshold in pom.xml** — that would defeat the purpose
3. **Verify with mvn verify before reporting success** — a passing test that doesn't actually run (e.g., wrong package, ignored by Surefire) doesn't count
4. **Stop and report if stuck** — if a class is genuinely hard to unit-test (e.g., requires real SMTP, real DB) and would need an integration test that adds significant complexity, report it and let the user decide

---

## Agent Metadata

**Created:** 2026-02-22
**Last Updated:** 2026-02-22
**Version:** 1.0.0
**Model:** Sonnet
**Triggered by:** /finish-session (automatic), /review-pr (§3A.5)
