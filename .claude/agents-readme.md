# Agent Suite — learnimo

> **Developer:** Lucas Xavier Ferreira
> **Last updated:** 2026-02-27

---

## Agent Overview

This project includes **12 custom agents** designed for full-stack development across web, mobile, and backend stacks.

| Agent | Role | Model | Name Origin |
|-------|------|-------|-------------|
| `automation-sentinel` | Meta-agent: automation health, metrics, optimization | Sonnet | — |
| `sous-chef` | Java/Spring Boot code review, best practices | Sonnet | The kitchen metaphor: the backend is the kitchen. You are the chef; sous-chef enforces quality where users never see. |
| `imhotep` | Pattern extraction, templates, new projects | Sonnet | Imhotep (~2650 BC) — Egyptian polymath, architect of the Step Pyramid of Djoser (first large stone structure in history), physician, scribe, vizier. The only non-royal Egyptian ever deified. |
| `pixl` | Next.js/Expo UI/UX design, accessibility | Sonnet | — |
| `hedy` | Expo/React Native mobile engineering | Sonnet | Hedy Lamarr (1914–2000) — co-inventor of frequency-hopping spread spectrum, the foundational technology behind WiFi, Bluetooth, and GPS. |
| `professor-x` | Teaching concepts, structured learning, exercises | Sonnet | Charles Xavier (X-Men) + Lucas **Xavier** Ferreira. |
| `virgil` | Product sense, requirements, user stories | Sonnet | Virgil Abloh (1980–2021) — Ghanaian-American creative director of Off-White and Louis Vuitton Men's. Defined what products should be and why, across disciplines. |
| `pulse` | Metrics collection agent (agent/command usage) | Haiku | — |
| `session-optimizer` | Token efficiency, session planning, workflow | Haiku | — |
| `steward` | Backend quality — identifies coverage gaps, writes targeted tests | Sonnet | — |
| `tech-writer` | Documentation (external + in-code), ADRs, Javadoc, OpenAPI | Sonnet | — |
| `nexus` | Next.js frontend engineering — routing, architecture, state | Sonnet | — |

> **Naming principle:** Homages use Black, African, Brazilian, or women names — people whose contributions are often undertold.

---

## Quick Start

### How Agents Work

1. **Automatic Invocation** - Claude Code automatically selects agents based on your message
2. **Explicit Invocation** - You can request specific agents: "Use sous-chef to analyze this"
3. **Complementary** - Multiple agents can work together (e.g., pulse → automation-sentinel)

### Anti-Cyclic Dependency Rule (CRITICAL)

**To prevent infinite loops, this hierarchy must be strictly enforced:**

```
Slash Commands (high-level orchestration)
    ↓ can call
Agents (task execution)
    ↓ can call
Other Agents (delegation)
    ↓ NEVER call
Slash Commands (would create cycle)
```

**Rules:**
- Commands CAN call agents — Example: `/finish-session` calls `tech-writer`
- Agents CAN call other agents — Example: `automation-sentinel` reads metrics from `pulse`
- Agents MUST NEVER call commands — Would create infinite loops

---

## Agent Usage Guide

### 1. Automation Sentinel (Meta-Agent)

**Use when:**
- Checking automation ecosystem health
- Finding redundant agents or commands
- Generating automation usage reports
- Detecting obsolete automations
- Getting optimization recommendations

**Note:** This agent is ON-DEMAND only. It does not auto-trigger.

**Example prompts:**
- "Check automation health"
- "Generate automation ecosystem report"
- "Are my agents redundant?"
- "Which automations are most valuable?"

---

### 2. Sous-Chef (Backend Code Reviewer)

**Use when:**
- After implementing backend features
- Before committing significant changes
- Refactoring existing code
- Learning Spring Boot best practices
- Improving code quality

**Auto-Trigger Protocol:**
- Says "review" + backend file path
- Says "check/validate/analyze" + Java/Spring Boot code
- Says "I just finished implementing [Service|Controller|Repository|...]"
- Says "before committing..."

---

### 3. Imhotep (Cross-Project Architect)

**Use when:**
- Starting new projects with similar structure
- Extracting reusable patterns from this project
- Making architectural decisions that affect multiple projects
- Creating project templates

**Example prompts:**
- "Extract the authentication pattern for reuse"
- "How do I apply this architecture to a new app?"

---

### 4. Pixl (UX Specialist)

**Use when:**
- Designing Next.js web screens or Expo mobile screens
- Creating React components with proper UX
- Improving user experience
- Making design decisions
- Ensuring accessibility (WCAG 2.1 AA)

**Example prompts:**
- "Design the POK creation screen"
- "How should I layout the knowledge feed?"
- "This screen feels cluttered"

---

### 5. Hedy (Mobile Engineer)

**Use when:**
- Making Expo/React Native architecture decisions
- Choosing between navigation approaches
- Designing token storage and session management
- Evaluating state strategy for mobile screens
- Addressing cross-platform (iOS/Android) concerns

**Example prompts:**
- "Should I use Expo Router or React Navigation?"
- "How do I adapt the web auth flow for mobile?"
- "Review the mobile engineering approach for this feature"

---

### 6. Professor-X (Learning Tutor)

**Use when:**
- Learning new concepts (Java 21, Spring Boot, React, Next.js)
- Understanding patterns deeply
- Getting structured lessons
- Practicing with exercises

**Auto-Trigger Protocol:**
- Says "teach me" + topic
- Says "explain" + concept
- Says "I want to understand" + topic
- Asks "what's the difference between X and Y?"

---

### 7. Virgil (Product Manager)

**Use when:**
- Defining new features or requirements
- Prioritizing the product backlog
- Writing user stories
- Making product decisions
- Analyzing user needs

**Example prompts:**
- "Help me write user stories for POK tagging"
- "What features should we prioritize for MVP?"
- "Define acceptance criteria for this feature"

---

### 8. Pulse (Metrics Collection Agent)

**Use when:**
- Manually collecting automation metrics
- Before running automation-sentinel analysis
- Updating usage data

**Note:** This agent is ON-DEMAND. Usage is tracked automatically via hooks (see `.claude/scripts/track-usage.py`).

---

### 9. Session Optimizer

**Use when:**
- Starting a new work session
- Planning complex tasks
- Token usage is getting high
- Want to work more efficiently

**Stack Options:**
- `--stack=backend` - Java/Spring Boot focus
- `--stack=web` - Next.js/TypeScript focus
- `--stack=mobile` - Expo/React Native focus
- `--stack=docs` - Documentation only
- `--stack=full` - Load everything

---

### 10. Steward (Backend Quality)

**Use when:**
- Backend test coverage falls below the project threshold (90% line coverage)
- `/finish-session` blocks the commit due to coverage failure
- Adding targeted tests to close specific coverage gaps

**Note:** Triggered automatically by `/finish-session` when coverage is below threshold. Can also be invoked on demand.

**Example prompts:**
- "Coverage dropped — run steward"
- "Close the coverage gap in PokService"

---

### 11. Tech Writer

**Use when:**
- Creating/updating documentation
- Adding Javadoc to classes
- Adding OpenAPI/Swagger annotations
- Creating ADRs (Architecture Decision Records)
- Updating ROADMAP.md

**Auto-Trigger Protocol:**
- Says "add OpenAPI annotations" + controller/endpoint name
- Says "create ADR for" + decision/topic
- Says "add Javadoc to" + class name
- Says "update ROADMAP.md"

---

### 12. Nexus (Web Engineer)

**Use when:**
- Making Next.js App Router architecture decisions
- Evaluating routing vs query param approaches
- Designing component structure and composition
- Choosing data fetching strategy (RSC, SWR, hooks)
- Reviewing URL and state strategy

**Example prompts:**
- "Should this be a route or a query param?"
- "How should I structure these components?"
- "Review the frontend architecture for this feature"

---

## Agent Selection Guide

```
What's your task?
│
├─ Checking automation health / metrics → pulse → automation-sentinel
│
├─ Reviewing backend/Java code → sous-chef
│
├─ Designing UI/UX screens → pixl
│
├─ Mobile engineering decisions → hedy
│
├─ Web engineering decisions → nexus
│
├─ Learning concepts → professor-x
│
├─ Defining product features → virgil
│
├─ Starting session / optimizing tokens → session-optimizer
│
├─ Creating docs / ADRs / Javadoc / OpenAPI → tech-writer
│
├─ Backend coverage below threshold → steward
│
└─ Extracting patterns / new projects → imhotep
```

---

## Status & Maintenance

### Current Status
- 12 agents total (last updated 2026-02-27)
- Tailored to learnimo (Java/Spring Boot + Next.js + Expo/React Native)
- Integrated with project conventions (CLAUDE.md, CODING_STYLE files)
- Anti-cyclic dependency rule documented and enforced
- Usage tracked automatically via PostToolUse hook → `.claude/scripts/track-usage.py`

### Maintenance
- **Update agents** when project conventions change
- **Add new agents** as new needs emerge
- **Run automation-sentinel** monthly to check ecosystem health

---

**Happy building!**
