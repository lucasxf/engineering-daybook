# PR Triage Presentation Template

Use this format when presenting keepr's evaluation results to the user in Step 5.

```
## PR #XX — Triage

### CI/CD: ❌ N failures / ✅ All passing
[Each failure: check name — type — specific error — log link]

### Review Comments

#### Accept (N)
- :wrench: **AuthController.java:42** (by copilot) — "Use constructor injection instead of @Autowired"
  Evaluation: Correct. Matches CLAUDE.md §Coding Conventions — constructor injection only.
  Agent: sous-chef

- :bug: **PokService.java:88** (by reviewer) — "This will NPE when tags is null"
  Evaluation: Confirmed — pok.getTags() is a @Nullable optional relationship; calling .stream() without
  a null check will throw at runtime when a POK has no tags.
  Agent: sous-chef

#### Accept with modification (N)
- :bulb: **api.ts:31** (by copilot) — "Extract silentRefresh to a shared utility"
  Evaluation: Identifies real duplication. However, the suggested location creates a circular import.
  Fix: inline the duplicate in api.ts instead of extracting to a new file.
  Agent: nexus

#### Reject (N)
- :bulb: **AuthService.java:60** (by copilot) — "Consider adding @Transactional to this method"
  Trade-off analysis:
    FOR applying: Protects against partial writes if a second DB call is added later.
    AGAINST applying: One DB call today — zero partial-write risk. CLAUDE.md: don't guard scenarios
    that can't happen.
  Verdict: Reject — revisit if method gains a second DB call.

#### Defer (N)
- :bulb: **PokRepository.java:15** (by copilot) — "Extract this query to a named @Query constant"
  Evaluation: Valid style improvement. No established pattern for named queries yet — one method
  doesn't justify it.
  Recommendation: Defer to when query count makes a consistent pattern worthwhile.

#### Questions — requires manual reply (N)
- :question: **PR comment** (by @reviewer) — "Why did you choose bcrypt over argon2?"
  Suggested reply: bcrypt is Spring Security's default and well-tested in production; argon2 has no
  practical advantage at current user scale.

#### From Claude Action — auto-verified (N)
- :wrench: **AuthController.java:175** (by claude[bot]) — "Use constructor injection"
  Auto-verified: aligns with CLAUDE.md §Coding Conventions.

- :bug: **PokService.java:42** (by claude[bot]) — "Null check missing before stream()"
  Full evaluation required — CONFLICTS with existing null-safe wrapper pattern.
  Verdict: Reject — see NullSafeCollections utility at PokService.java:12.

#### Informational — no action (N)
- :information_source: "Great use of records for DTOs!" (by copilot)
```
