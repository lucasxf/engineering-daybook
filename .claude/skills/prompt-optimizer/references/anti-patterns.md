# Prompt Anti-Patterns

Common mistakes that reduce prompt quality, waste tokens, or produce worse outputs. Used by the review workflow in prompt-optimizer.

Each entry includes: the problem, a before/after example, and the impact.

---

## 1. Vague Scope

**Problem:** The prompt describes the general area but not the specific change needed. The model spends time figuring out scope instead of doing the work.

**Before:**
```
Fix the bug with the tag component.
```

**After:**
```
Fix the crash in TagSection.tsx when tags is an empty array — the .map() call on line 43 throws because tags is undefined (not empty) when a new POK has no tags yet.

Done when: `npm test -- TagSection` passes.
```

**Why it matters:** Vague prompts trigger clarifying questions or produce broad, unfocused responses. For execution mode this is pure waste — Sonnet can't start until it knows exactly what to do.

---

## 2. Over-Explaining Known Context

**Problem:** The prompt repeats information that's already in `CLAUDE.md`, the codebase conventions, or that the model can see from file imports. This is the single biggest source of token waste.

**Before:**
```
This project uses Spring Boot 4 with Java 21. We follow Conventional Commits format (feat:, fix:, docs:, etc.). The backend uses PostgreSQL and Flyway for migrations. Make sure to write unit tests following our TDD approach. We use JUnit 5 for testing. Always add @DisplayName annotations to tests.
[... 200 tokens of context the model already has ...]

Now add an endpoint to get a user's bookmarks.
```

**After:**
```
Add GET /api/v1/bookmarks — returns all bookmarks for the authenticated user.
Pattern to follow: PokShareController.java (same auth + response structure).
Done when: integration test in PokControllerIntegrationTest passes.
```

**Why it matters:** `CLAUDE.md` is already in context. Every token you spend restating it is a token not used for the actual response. This is especially harmful in execution mode where context budget matters most.

---

## 3. Wrong Mode Mismatch

**Problem:** Using plan-style prompts in execution mode (wastes tokens on exploration the model doesn't need) or execution-style prompts in plan mode (produces shallow plans because the model had insufficient context to reason deeply).

**Execution mode — plan-style prompt (bad):**
```
I want to add a notification system. Please think through the architecture, consider trade-offs between polling and WebSockets, look at how existing features are structured, and propose three different approaches with pros and cons before we decide.
```
→ This is a planning prompt. Use it in plan mode with Opus, not in an execution session.

**Plan mode — execution-style prompt (bad):**
```
Add a NotificationService.java with a sendNotification method.
```
→ This tells Opus to implement, not plan. Opus will write the code instead of producing an architectural plan.

**Why it matters:** Mode mismatch produces outputs that don't match what the user actually needs. Plan mode with a shallow prompt produces shallow plans. Execution mode with an over-specified reasoning request wastes tokens and slows down coding.

---

## 4. Missing Acceptance Criteria

**Problem:** The prompt doesn't say what "done" looks like. The model either over-delivers (does extra things) or stops at an arbitrary point.

**Before:**
```
Add pagination to the feed endpoint.
```

**After:**
```
Add cursor-based pagination to GET /api/v1/feed.

Done when:
- Endpoint accepts `cursor` (opaque string, nullable) and `limit` (default 20) query params
- Response includes `nextCursor: string | null`
- `FeedIntegrationTest` covers: first page, second page, last page (null cursor)
- `mvn test -Dtest=FeedIntegrationTest` passes
```

**Why it matters:** Without acceptance criteria, "done" is ambiguous. The model might implement pagination but skip the tests, or add tests but use a different pagination strategy than you expected.

---

## 5. Kitchen-Sink Prompt

**Problem:** One prompt tries to do too many unrelated things. Each thing gets less attention, and the model may partially complete several things instead of fully completing one.

**Before:**
```
Fix the pagination bug, add search to the mobile app, update the README, and refactor TagService while you're at it.
```

**After:**
Four separate prompts, each with its own scope and acceptance criteria. Or if they're related, sequence them explicitly: "First fix X (AC: Y), then implement Z (AC: W)."

**Why it matters:** Cognitive load is distributed across tasks. Edge cases get missed. Tests are written for some tasks but not others. The commit becomes a mess that's hard to review.

---

## 6. Abstract Instructions Without Examples

**Problem:** The prompt describes the desired output in abstract terms instead of showing what it looks like.

**Before:**
```
Make sure the API responses follow REST best practices and are consistent.
```

**After:**
```
API responses must follow this structure:
- Success: `{ "data": [...] }` with HTTP 200
- Error: `{ "error": { "code": "POK_NOT_FOUND", "message": "..." } }` with appropriate HTTP status
- Pattern to follow: PokController.java (already correct)
```

**Why it matters:** "Best practices" and "consistent" are not actionable. The model will interpret them differently each time. A concrete example gives a single target to match.

---

## 7. Redundant Emphasis

**Problem:** The same constraint is stated multiple times using different emphasis markers (IMPORTANT, CRITICAL, NOTE, ALWAYS, NEVER). Each repetition reduces the signal value of all emphasis markers.

**Before:**
```
IMPORTANT: Never modify POK content.
CRITICAL: The content field must never be changed by AI.
NOTE: This is a sacred rule — POK content is user-written and must not be altered.
ALWAYS remember: AI should never touch the content field.
```

**After:**
```
Never modify `content` — user-written POK content is sacrosanct (see CLAUDE.md §Critical Rule).
```

**Why it matters:** When everything is CRITICAL, nothing is. Repeated constraints also inflate token count without adding information. State each constraint once, clearly.

---

## 8. Unnecessary Preamble

**Problem:** The prompt spends several sentences setting up context before getting to the actual request. The model has to read through filler to find the instruction.

**Before:**
```
I've been working on this project for a while and I'm trying to improve the mobile app experience. One thing I've noticed is that users have to go through multiple screens to create a new learning. I was thinking about this and I believe the UX could be improved. What I'd like to do is add a quick-entry feature. Could you help me implement this?
```

**After:**
```
Add a QuickEntry bottom sheet to the mobile home screen — a single-tap way to create a new POK without navigating to the full creation screen.
Pattern to follow: web/src/components/QuickEntry.tsx (same interaction model, different stack).
```

**Why it matters:** Every word before the actual instruction is a token spent on overhead. In execution mode especially, lead with the action.

---

## 9. Specifying the How Instead of the What

**Problem:** The prompt dictates implementation details that should be left to the model, while leaving the actual goal underspecified.

**Before:**
```
Create a new React hook called useBookmarks, add it to web/src/hooks/, use useState for the bookmarks array, use useEffect to fetch on mount, use axios for the API call, and export it as a named export.
```

**After:**
```
Create a useBookmarks hook in `web/src/hooks/` that fetches GET /api/v1/bookmarks for the authenticated user.
Pattern to follow: `web/src/hooks/useFeedData.ts` (same fetch pattern, same auth handling).
Done when: `npm test -- useBookmarks` passes.
```

**Why it matters:** Over-specifying implementation locks in potentially suboptimal choices (axios vs fetch, useState vs useReducer) while obscuring the actual goal. Reference an existing pattern instead — it communicates both the what and the how implicitly, with fewer tokens.

---

## 10. Forgetting the Stack Context for Cross-Stack Changes

**Problem:** For changes that touch multiple layers (backend + web + mobile), the prompt only describes one layer, leaving the model to guess about the others.

**Before:**
```
Add a "visibility" badge to POK cards.
```

**After:**
```
Add a visibility badge to POK cards on all three surfaces:

- **Backend:** Already returns `visibility` in PokResponse (no change needed)
- **Web:** Add badge to `web/src/components/PokCard.tsx` — pattern: existing `tagList` rendering; show only for PRIVATE (lock icon) and COLLEAGUES_ONLY (people icon), nothing for PUBLIC
- **Mobile:** Add badge to `mobile/src/components/PokCard.tsx` — same logic, use Ionicons

Done when: visual appears correctly in both web Storybook and mobile Expo Go.
```

**Why it matters:** Without knowing the scope, the model may implement only the web layer and consider the task done, missing mobile and leaving the feature inconsistent.
