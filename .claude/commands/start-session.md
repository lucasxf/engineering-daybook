---
description: Start a new development session with stack-specific context loading
argument-hint: <optional: --stack=backend|web|mobile|docs|full or context description>
---

# Session Context Loading Strategy

## Step 1: Determine Stack Focus

**If user provided `--stack` parameter:**
- `--stack=backend` → Load backend context
- `--stack=web` → Load web context
- `--stack=mobile` → Load mobile context
- `--stack=docs` → Load docs context
- `--stack=full` → Load all contexts (use sparingly)

**If NO `--stack` parameter provided:**
- Analyze `$ARGUMENTS` for context clues:
  - Keywords: "Java", "Spring", "API", "backend", "service" → **backend**
  - Keywords: "Next.js", "React", "TypeScript", "web", "page", "component" → **web**
  - Keywords: "Expo", "mobile", "React Native" → **mobile**
  - Keywords: "documentation", "ROADMAP", "CLAUDE.md", "docs", "spec", "ADR" → **docs**
- If ambiguous, use **AskUserQuestion** to prompt:
  - Question: "Which stack are you working on for this session?"
  - Options:
    1. Backend (Java/Spring Boot) — API, services, database
    2. Web (Next.js/TypeScript) — Web application
    3. Mobile (Expo/React Native) — Mobile application
    4. Documentation — ROADMAP, CLAUDE.md, specs, ADRs
    5. Full Context — Load everything (use sparingly)

## Step 2: Detect Current Phase

Read `docs/ROADMAP.md` and extract the current phase:
```bash
grep "CURRENT_PHASE:" docs/ROADMAP.md
# Returns: <!-- CURRENT_PHASE: N -->
```

Unless `--phase=N` was explicitly provided in `$ARGUMENTS`, use the detected phase.

## Step 3: Load Files Based on Stack

### Backend Session
@CLAUDE.md
@backend/CLAUDE.md
@docs/ROADMAP.phase-{N}.md

### Web Session
@CLAUDE.md
@web/CLAUDE.md
@docs/ROADMAP.phase-{N}.md

### Mobile Session
@CLAUDE.md
@mobile/CLAUDE.md
@docs/ROADMAP.phase-{N}.md

### Documentation Session
@CLAUDE.md
@docs/CLAUDE.md
@docs/ROADMAP.md
@docs/ROADMAP.phase-{N}.md

### Full Context Session (use sparingly)
@CLAUDE.md
@backend/CLAUDE.md
@web/CLAUDE.md
@mobile/CLAUDE.md
@docs/CLAUDE.md
@docs/ROADMAP.md
@docs/ROADMAP.phase-{N}.md

> Replace `{N}` with the current phase number detected in Step 2.

**Session Context:** $ARGUMENTS

## Step 4: Standard Session Initialization

1. Run `git log --oneline -5` to understand latest changes
2. Run `git status` to see uncommitted changes
3. Provide a brief summary of:
   - **Stack focus** for this session
   - **Current phase** (from ROADMAP.md index)
   - **Active milestone(s)** (from the phase file)
   - Next priority tasks
   - Any uncommitted changes that need attention

**Ready to start development following all project guidelines.**

## Token Savings Report

After loading, report approximate token savings vs full load:
- Backend session: ~45% reduction
- Web session: ~50% reduction
- Mobile session: ~55% reduction
- Documentation session: ~15% reduction (intentionally loads more)
- Full context: baseline
