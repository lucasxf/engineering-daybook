# Plan Mode Prompt Patterns (Opus)

Templates for 7 task types optimized for plan mode. Opus benefits from thorough context, explicit trade-off requests, structured output specifications, and structured reasoning (numbered analysis, trade-off tables, risk lists).

> **`@` references:** When generating an optimized prompt that references concrete files (not `[placeholders]`), include `@path/to/file` lines at the very top of the output `.md` file — one per line, no backticks. These resolve when the user copies the file content and pastes into the Claude Code CLI input, pre-loading files into context without tool calls.

---

## 1. Architecture / Design Decision

### When to use
User is choosing between approaches, designing a new system component, or making a structural decision. Signal phrases: "how should I approach", "what's the right design", "should I use X or Y", "architect", "design decision".

### Template

```
## Context
[1-3 sentences: what problem are you solving and why now]
[Relevant existing system components it touches]
[Constraints: time, performance, compatibility, team conventions]

## Decision Scope
In scope: [specific decisions to make]
Out of scope: [related things not being decided here]

## Background
[Key facts the model needs: existing patterns, what has been tried, known requirements]

## Request
Design an approach for [X] that fits the learnimo architecture (Spring Boot backend, Next.js web, Expo mobile, PostgreSQL/pgvector).

Structure your response as:
1. **Recommended Approach** — describe the implementation at a conceptual level
2. **Alternatives Considered** — at least 2 alternatives with pros/cons vs recommendation
3. **Trade-offs** — what does the recommended approach give up, and why that's acceptable
4. **Risks** — top 3 risks and mitigations
5. **Implementation Plan** — numbered steps at milestone level (not line-by-line)
6. **Open Questions** — decisions that need more information before implementing
```

### Key Opus-specific elements
- Explicit "Alternatives Considered" request surfaces options Opus might otherwise suppress
- "Trade-offs" section forces acknowledgment of what's sacrificed, not just what's gained
- "Out of scope" prevents plan bloat
- Numbered output sections give Opus a structured target to fill

### Example

```
## Context
The learnimo mobile app (Expo/React Native) caches nothing — every screen load hits the backend. This is causing visible latency on the feed screen (useFeedData hook) and burning mobile data. We want to add caching before the app store submission.

## Decision Scope
In scope: caching strategy for GET /api/v1/feed and GET /api/v1/poks responses in the mobile app
Out of scope: server-side caching, web app caching, offline mode, background sync

## Background
- Data is fetched with TanStack Query (React Query v5) — already in the project
- Feed data changes frequently (when users follow someone new or a colleague shares)
- POK detail data is mostly immutable after creation
- Expo SecureStore is in use for auth tokens

## Request
Design a caching approach for feed and POK data in the Expo mobile app.

Structure your response as:
1. **Recommended Approach**
2. **Alternatives Considered** (at least 2: no cache + skeleton UI, custom AsyncStorage cache, SWR-style stale-while-revalidate)
3. **Trade-offs**
4. **Risks** — top 3 with mitigations
5. **Implementation Plan** — milestone-level numbered steps
6. **Open Questions**
```

---

## 2. New Feature Planning

### When to use
User is planning a greenfield feature that touches multiple layers. Signal phrases: "plan the implementation of", "design a feature", "how would I add", "I want to build".

### Template

```
## Feature Goal
[One sentence: what the user can do that they couldn't do before]

## User Story
As a [role], I want to [action] so that [benefit].

## Constraints
- [Technical: stack, dependencies, must not break X]
- [Product: must work on web + mobile / backend-only / etc.]
- [Quality: performance, accessibility, i18n requirements]

## Current State
[Relevant existing code: what files/components/endpoints already exist that this touches]

## Request
Plan the full implementation of this feature across the learnimo stack.

Structure your response as:
1. **Domain Model Changes** — new entities, fields, or relationships needed
2. **Backend Tasks** — API endpoints, services, migrations (numbered)
3. **Web Tasks** — components, pages, hooks (numbered)
4. **Mobile Tasks** — screens, components (numbered, or "N/A - out of scope")
5. **Test Strategy** — unit, integration, and E2E coverage plan
6. **Sequence** — recommended order with dependencies called out
7. **Risks** — top 3
8. **Out of Scope** — what explicitly will NOT be built in this milestone
```

### Key Opus-specific elements
- Layered task breakdown (backend → web → mobile) maps to the actual codebase structure
- Sequence section with dependencies is high-value for Opus; Sonnet would just list tasks
- "Out of scope" is essential for scoped features that could sprawl

### Example

```
## Feature Goal
Learners can "bookmark" any POK (their own or another user's) to save it to a private reading list accessible from their profile.

## User Story
As a learner, I want to bookmark interesting POKs so that I can find them again later without following the author.

## Constraints
- Must work on web and mobile (Expo)
- Must respect POK visibility rules (bookmarked private POKs are not visible if access is revoked)
- Must not add a public bookmark count (anti-vanity principle)
- Must use existing auth and follow the PokShare pattern (V20 migration reference)

## Current State
- PokShare entity exists (V20 migration) for re-learning feature — similar structure
- Profile page exists on web (LearnerProfilePage) and mobile (LearnerProfileScreen)
- Backend: PokShareService, PokShareController as patterns to follow

## Request
Plan the full implementation of the bookmark feature across the learnimo stack.

Structure your response as:
1. **Domain Model Changes**
2. **Backend Tasks** (numbered)
3. **Web Tasks** (numbered)
4. **Mobile Tasks** (numbered)
5. **Test Strategy**
6. **Sequence** — with dependencies
7. **Risks** — top 3
8. **Out of Scope**
```

---

## 3. Bug Investigation (Root Cause Analysis)

### When to use
User has a symptom but not the cause. Signal phrases: "why is X happening", "what's causing", "investigate", "I'm seeing this error", "diagnose", "track down".

### Template

```
## Symptom
[Exact error message or observed behavior. Include stack trace if available.]

## Context
- When does it happen: [always / sometimes / specific conditions]
- Environment: [production / local / CI]
- Recent changes: [anything that changed before the issue appeared]

## Already Ruled Out
[What has already been tried or eliminated as a cause]

## Code Context
[Relevant file paths, component names, or service names where the issue appears]

## Request
Investigate the root cause of this issue. Think through the possible causes systematically before concluding.

Structure your response as:
1. **Likely Root Causes** — ranked by probability, with reasoning for each
2. **Investigation Plan** — specific files to read and questions to answer to confirm/rule out each cause
3. **Recommended Fix Direction** — once root cause is confirmed, what category of fix makes sense
4. **Risks of Each Fix Approach** — what could go wrong
5. **Questions** — what information would change the diagnosis
```

### Key Opus-specific elements
- "Think through systematically before concluding" signals deliberate analysis is expected
- Ranked causes with reasoning surfaces the model's uncertainty explicitly
- Investigation plan with specific files gives the execution step clarity

### Example

```
## Symptom
After login, the feed page briefly flashes the unauthenticated state (shows the login button in the nav) before rendering correctly. Only happens on first load after a hard refresh (F5).

## Context
- Happens in production (learnimo.net) and local dev
- Environment: Next.js 14 web app with AuthProvider wrapping the layout
- Recent changes: Added useEffect-based auth state initialization in AuthProvider

## Already Ruled Out
- JWT token is valid (API calls succeed after the flash)
- Not a cookie issue (we use in-memory storage)

## Code Context
- `web/src/context/AuthProvider.tsx` — auth state management
- `web/src/components/NavBar.tsx` — shows the login button when unauthenticated
- `web/src/app/[locale]/layout.tsx` — wraps children with AuthProvider

## Request
Investigate the root cause of this auth flash issue.

1. **Likely Root Causes** — ranked, with reasoning
2. **Investigation Plan** — specific files and questions to answer
3. **Recommended Fix Direction**
4. **Risks of Each Fix Approach**
5. **Questions** that would change the diagnosis
```

---

## 4. Refactoring Strategy

### When to use
User wants to restructure existing code without changing observable behavior. Signal phrases: "refactor", "restructure", "clean up", "the code is hard to maintain", "extract", "split this".

### Template

```
## What Needs Refactoring
[File paths and a brief description of the current structure's problem]

## Pain Points
[Specific things that are hard to do with the current structure]

## Constraints
- Must not change public API / observable behavior
- [Other: performance budget, test coverage must remain, etc.]

## Codebase Context
[Other files that depend on what's being refactored]

## Request
Design a refactoring strategy for [X].

Structure your response as:
1. **Current State Analysis** — what structural problems exist and why they matter
2. **Recommended Structure** — what the code looks like after refactoring
3. **Migration Path** — how to get from current to target without breaking things (incremental steps preferred)
4. **Alternatives** — at least 1 alternative approach and why you didn't choose it
5. **Risk Assessment** — what could break and how to detect it
6. **Test Strategy** — how to verify behavior is preserved throughout
```

### Key Opus-specific elements
- "Migration path — incremental steps preferred" is a planning-specific request that Sonnet would ignore
- Test strategy during refactoring (not just after) is a nuance Opus handles well

---

## 5. Migration / Upgrade Planning

### When to use
User is upgrading a dependency, migrating to a new API, or moving data. Signal phrases: "migrate", "upgrade", "move from X to Y", "update to version".

### Template

```
## Migration Goal
[What is changing: dependency version, API, data format, infrastructure]

## Current State
[Current version/approach and why it's being changed]

## Target State
[What the end state looks like]

## Scope
- Affected files/modules: [list known affected areas]
- Must continue working: [critical paths that cannot break]
- Rollback plan: [is there one?]

## Request
Plan the migration from [X] to [Y].

Structure your response as:
1. **Breaking Changes** — what the migration guide says will break, mapped to our codebase
2. **Migration Steps** — numbered, in order, with each step atomic and verifiable
3. **Verification Points** — how to confirm each step worked before proceeding
4. **Rollback Strategy** — how to undo if a step fails
5. **Risks** — top 3, with mitigations
6. **Estimated Scope** — rough file count and complexity
```

---

## 6. Code Review (Deep Analysis)

### When to use
User wants a thorough analysis of a PR, diff, or set of files before merging. Signal phrases: "review this PR", "analyze these changes", "what's wrong with", "evaluate before merging".

### Template

```
## What to Review
[PR number, branch name, or file list]

## Review Focus
[What matters most: correctness, security, performance, design, test coverage]

## Context
[What problem is this solving? Any known edge cases or constraints?]

## Request
Perform a deep code review.

Structure your response as:
1. **Summary** — what the change does and whether the approach is sound
2. **Critical Issues** — bugs, security problems, or correctness failures that must be fixed
3. **Design Concerns** — structural issues that should be addressed before merge
4. **Minor Issues** — style, naming, or non-blocking suggestions
5. **Missing Coverage** — test cases that should exist but don't
6. **Positive Notes** — what's done well (important for balanced reviews)
7. **Verdict** — Approve / Request Changes / Needs Discussion
```

---

## 7. Investigation / Codebase Exploration

### When to use
User needs to understand an unfamiliar part of the codebase before making changes. Signal phrases: "how does X work", "explain this system", "understand", "trace the flow", "where is".

### Template

```
## What to Understand
[The system, flow, or concept to explain]

## Starting Point
[Known entry point: file path, endpoint, component name]

## What I Already Know
[Existing understanding to avoid re-explaining]

## Request
Explain how [X] works in this codebase.

Structure your response as:
1. **High-Level Flow** — how data or control moves through the system (use a numbered sequence)
2. **Key Files** — the most important files with their role in the system
3. **Data Model** — relevant entities and their relationships
4. **Extension Points** — where and how to add new behavior
5. **Gotchas** — non-obvious behaviors, edge cases, or constraints
6. **Suggested Reading Order** — which files to read to build understanding efficiently
```
