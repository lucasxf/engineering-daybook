# Execution Mode Prompt Patterns (Sonnet)

Templates for 7 task types optimized for execution mode. Sonnet executes fast — every token in the prompt must earn its place. Lead with the action, name files explicitly, state acceptance criteria, and reference existing patterns instead of explaining from scratch.

General rule: if the same information is already in `CLAUDE.md` or the codebase conventions, don't repeat it. Point at the pattern instead.

---

## 1. Bug Fix

### When to use
Root cause is known; user wants the fix implemented. Signal phrases: "fix this", "resolve the error", "make it work", "patch".

### Template

```
Fix [brief description of the bug].

**File:** `[path/to/file.ext]:[line number if known]`
**Symptom:** [exact error message or observable failure]
**Root cause:** [what's wrong]
**Fix:** [what to change — be specific if known, or "determine the minimal fix"]

Done when: [acceptance criterion — test passes / error disappears / specific behavior works]
```

### Token-saving techniques
- Skip context that CLAUDE.md already covers (stack conventions, test requirements)
- Root cause line eliminates diagnostic back-and-forth
- "Done when" gives Sonnet a clear stopping condition

### Example

```
Fix the NPE in PokService when a user with no POKs calls getRecentPoks.

**File:** `backend/src/main/java/net/learnimo/service/PokService.java`
**Symptom:** NullPointerException at PokService.java:142 when userId has zero POKs
**Root cause:** custom @Query with projection returns null when no rows match, not empty list
**Fix:** null-check before stream or rewrite query to return empty list

Done when: `mvn test -Dtest=PokServiceTest` passes with a test for zero-POK user
```

---

## 2. New Feature Implementation

### When to use
Feature is designed and scoped; implement it. Signal phrases: "implement", "add X", "build this", "create the endpoint/component/screen".

### Template

```
Implement [feature name].

**Scope:**
- [Layer 1, e.g., Backend]: [specific files/classes to create or edit]
- [Layer 2, e.g., Web]: [specific files/components to create or edit]
- [Layer 3, e.g., Mobile]: [N/A or specific files]

**Pattern to follow:** [existing file that uses the same pattern]

**Acceptance criteria:**
- [ ] [specific testable outcome 1]
- [ ] [specific testable outcome 2]
- [ ] Tests pass: `[exact test command]`
```

### Token-saving techniques
- "Pattern to follow" replaces paragraphs of architectural explanation
- Checkboxes for AC make done-ness unambiguous
- Exact test command eliminates guessing

### Example

```
Implement GET /api/v1/poks/{id}/related — returns the 5 most semantically similar POKs using pgvector cosine distance.

**Scope:**
- Backend: add `getRelatedPoks(UUID pokId, UUID userId)` to PokRepository and PokService; add GET endpoint to PokController

**Pattern to follow:** `backend/src/main/java/net/learnimo/service/SemanticSearchService.java` (same pgvector cosine query pattern)

**Acceptance criteria:**
- [ ] Endpoint returns 200 with array of max 5 PokResponse objects
- [ ] Excludes the source POK from results
- [ ] Respects visibility rules (private POKs not returned to non-owners)
- [ ] Integration test in `PokControllerIntegrationTest` covers happy path and visibility enforcement
- [ ] Tests pass: `mvn test -Dtest=PokControllerIntegrationTest`
```

---

## 3. Refactoring Execution

### When to use
Refactoring strategy is decided; execute it without changing behavior. Signal phrases: "refactor X following the plan", "extract this", "split into", "apply the strategy".

### Template

```
Refactor [what] to [goal].

**Files to change:** [list]
**Files that depend on this (verify still work):** [list]

**Change:**
[2-4 bullet points describing the structural change]

**Must not change:** [public API / observable behavior / test outcomes]

Done when: `[test command]` passes with no changes to expected outputs.
```

### Token-saving techniques
- "Must not change" is the acceptance criterion — Sonnet focuses on behavior preservation
- Dependent files list prevents regressions from being missed

### Example

```
Refactor TagService to extract tag normalization into a standalone TagNormalizer utility class.

**Files to change:** `backend/src/main/java/net/learnimo/service/TagService.java`
**New file:** `backend/src/main/java/net/learnimo/service/TagNormalizer.java`
**Files that depend on this:** `TagController.java`, `PokService.java` (verify still compile)

**Change:**
- Move `normalise(String name)` and its private helpers out of TagService into TagNormalizer
- TagService receives TagNormalizer via constructor injection
- TagNormalizer is a @Component

**Must not change:** TagService public API, normalization behavior, existing test outcomes

Done when: `mvn test -Dtest=TagServiceTest,TagIntegrationTest` passes unchanged.
```

---

## 4. Test Writing

### When to use
User wants tests added for existing code. Signal phrases: "write tests for", "add coverage", "test this class/component/hook".

### Template

```
Write tests for [class/component/hook].

**File under test:** `[path/to/file.ext]`
**Test file:** `[path/to/test.ext]` (create if missing)

**Coverage targets:**
- [ ] [scenario 1: happy path]
- [ ] [scenario 2: edge case / error case]
- [ ] [scenario 3: boundary condition]

**Pattern to follow:** `[path/to/similar-test.ext]`

Done when: `[test command]` passes and coverage for this file is ≥ [X]%.
```

### Token-saving techniques
- Naming the test file prevents Sonnet from choosing a bad location
- Explicit scenarios prevent shallow coverage (just the happy path)
- "Pattern to follow" ensures consistent test style

### Example

```
Write unit tests for PokShareService.

**File under test:** `backend/src/main/java/net/learnimo/service/PokShareService.java`
**Test file:** `backend/src/test/java/net/learnimo/service/PokShareServiceTest.java`

**Coverage targets:**
- [ ] share() creates a PokShare record and returns PokShareResponse
- [ ] share() throws PokNotFoundException when pokId doesn't exist
- [ ] share() throws PokAlreadySharedException when user already shared this POK
- [ ] unshare() deletes the PokShare record
- [ ] unshare() throws PokShareNotFoundException when share doesn't exist
- [ ] getSharesForUser() returns all shares for a given user, sorted by createdAt desc

**Pattern to follow:** `backend/src/test/java/net/learnimo/service/TagServiceTest.java`

Done when: `mvn test -Dtest=PokShareServiceTest` passes, all 6 scenarios covered.
```

---

## 5. Migration / Upgrade Execution

### When to use
Migration plan exists; execute a specific step. Signal phrases: "execute step N of the migration", "apply the upgrade", "run the migration".

### Template

```
Execute [migration step N]: [brief description].

**Files to change:** [list]
**Command to run after:** `[verify command]`

**Change:**
[numbered steps, each atomic and verifiable]

**Rollback:** [how to undo this step if it fails]

Done when: `[verification command]` produces [expected output].
```

### Token-saving techniques
- One step at a time prevents partial migrations that leave the codebase in a bad state
- Rollback included in the prompt so Sonnet can implement it if needed

---

## 6. Code Review (Focused PR Feedback)

### When to use
User wants concrete, actionable feedback on a specific PR or diff. Signal phrases: "review PR #N", "give me feedback on this diff", "what should I fix".

### Template

```
Review PR #[N] / the diff in [file(s)].

**Focus:** [correctness / security / performance / test coverage / all]
**Context:** [1 sentence: what this PR does]

Return:
- Blocking issues (must fix before merge)
- Non-blocking suggestions (nice to have)
- Any missing test cases
```

### Token-saving techniques
- "Focus" scopes the review — prevents a 20-bullet wall when you only care about correctness
- Structured return format makes the output immediately actionable

---

## 7. Quick Change

### When to use
A small, mechanical change to one or two files. Signal phrases: "rename", "update this value", "change X to Y", "add this import", "remove this line".

### Template

```
In `[file path]`, [exact change in one line].

Done when: `[verify command]` passes.
```

### Token-saving techniques
- No preamble. No context. Action + location + verification.
- If the change is truly one line, the prompt should be one line.

### Examples

```
In `web/src/components/PokCard.tsx`, rename prop `pok` to `learning` across the component (props interface, JSX usage, destructuring).

Done when: `npm run typecheck` passes.
```

```
In `backend/src/main/resources/application.yml`, change `spring.flyway.enabled: false` to `true` in the default profile only (not test profile).

Done when: app starts without Flyway errors.
```
