---
description: Start a new development session with stack-specific context loading
argument-hint: <optional: --stack=backend|web|mobile|docs|full or context description>
---

# Session Context Loading Strategy

## Step 1: Determine Stack Focus

**If user provided `--stack` parameter:**
- `--stack=backend` → Load backend-specific files (Java/Spring Boot)
- `--stack=web` → Load web-specific files (Next.js/TypeScript)
- `--stack=mobile` → Load mobile-specific files (Expo/React Native)
- `--stack=docs` → Load minimal documentation files
- `--stack=full` → Load all files (legacy behavior)

**If NO `--stack` parameter provided:**
- Analyze `$ARGUMENTS` for context clues:
  - Keywords: "Java", "Spring", "API", "backend", "POK service" → **backend**
  - Keywords: "Next.js", "React", "TypeScript", "web", "pages" → **web**
  - Keywords: "Expo", "mobile", "React Native", "app" → **mobile**
  - Keywords: "documentation", "README", "CLAUDE.md", "docs" → **docs**
- If ambiguous, use **AskUserQuestion** to prompt:
  - Question: "Which stack are you working on for this session?"
  - Options:
    1. Backend (Java/Spring Boot) - API, services, database
    2. Web (Next.js/TypeScript) - Web application
    3. Mobile (Expo/React Native) - Mobile application
    4. Documentation - CLAUDE.md, README.md, ROADMAP.md
    5. Full Context - Load everything (use sparingly)

## Step 2: Load Files Based on Stack

### Backend Session
@CLAUDE.md
@ROADMAP.md
@README.md
@.claude/agents-readme.md

### Web Session
@CLAUDE.md
@ROADMAP.md
@README.md
@.claude/agents-readme.md

### Mobile Session
@CLAUDE.md
@ROADMAP.md
@README.md
@.claude/agents-readme.md

### Documentation Session
@CLAUDE.md
@ROADMAP.md
@README.md
@.claude/agents-readme.md

### Full Context Session (Legacy)
@CLAUDE.md
@ROADMAP.md
@README.md
@.claude/agents-readme.md

**Session Context:** $ARGUMENTS

## Step 3: Standard Session Initialization

1. Review ROADMAP.md to understand:
   - Current implementation status
   - What's in progress
   - Next priority tasks
2. Review .claude/agents-readme.md to understand:
   - Available specialized agents
   - When to trigger each agent proactively
3. Review recent commits with `git log --oneline -5` to understand latest changes
4. Check current git status to see uncommitted changes
5. Provide a brief summary of:
   - **Stack focus for this session** (backend/web/mobile/docs/full)
   - Current project state (from ROADMAP.md)
   - Next priority tasks
   - Any uncommitted changes that need attention
   - Available agents for this session's work

**Ready to start development following all project guidelines.**

## Token Savings Report

After loading, report approximate token savings:
- Stack-specific session: ~30-45% reduction vs full load
- Documentation session: ~50% reduction vs full load
