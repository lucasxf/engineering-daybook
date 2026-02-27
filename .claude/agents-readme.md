# Custom Agent Suite - Engineering Daybook

> **Purpose:** Specialized agents to accelerate development, learning, and automation efficiency.
> **Created:** 2026-01-29
> **Developer:** Lucas Xavier Ferreira

---

## Agent Overview

This project includes **10 custom agents** and **16 custom slash commands** designed for full-stack development:

| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| **automation-sentinel** | Meta-agent: automation health, metrics, optimization | Sonnet | Checking automation health, generating reports, finding redundancy |
| **sous-chef** | Java/Spring Boot code review, best practices | Sonnet | Reviewing backend code after implementation |
| **imhotep** | Pattern extraction, templates, new projects | Sonnet | Starting new projects, extracting reusable patterns |
| **frontend-ux-specialist** | Next.js/Expo UI/UX design, accessibility | Sonnet | Designing screens, improving user experience |
| **professor-x** | Teaching concepts, structured learning, exercises | Sonnet | Learning new topics (Java, TypeScript, React) |
| **virgil** | Product sense, requirements, user stories | Sonnet | Defining features, prioritizing backlog, writing user stories |
| **pulse** | Metrics collection agent (agent/command usage, LOCs) | Haiku | On-demand metrics collection |
| **session-optimizer** | Token efficiency, session planning, workflow | Haiku | Starting sessions, optimizing token usage |
| **steward** | Backend quality assurance — identifies coverage gaps, writes targeted tests to meet thresholds | Sonnet | When backend test coverage falls below the project threshold |
| **tech-writer** | Documentation (external + in-code), ADRs, Javadoc, OpenAPI | Sonnet | Creating ADRs, adding Javadoc, updating docs |

---

## Quick Start

### How Agents Work

1. **Automatic Invocation** - Claude Code automatically selects agents based on your message
2. **Explicit Invocation** - You can request specific agents: "Use the sous-chef to analyze this"
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
- Commands CAN call agents - Example: `/finish-session` calls `tech-writer`
- Agents CAN call other agents - Example: `automation-sentinel` reads metrics from `pulse`
- Agents MUST NEVER call commands - Would create infinite loops

---

## Agent Usage Guide

### 1. Automation Sentinel (Meta-Agent)

**Use when:**
- Checking automation ecosystem health
- Finding redundant agents or commands
- Generating automation usage reports
- Detecting obsolete automations
- Getting optimization recommendations

**Note:** This agent is ON-DEMAND only. It does not auto-trigger on `/create-pr`.

**Example prompts:**
- "Check automation health"
- "Generate automation ecosystem report"
- "Are my agents redundant?"
- "Which automations are most valuable?"

---

### 2. Backend Code Reviewer

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

### 3. Cross-Project Architect

**Use when:**
- Starting new projects with similar structure
- Extracting reusable patterns from this project
- Making architectural decisions that affect multiple projects
- Creating project templates

**Example prompts:**
- "Extract the authentication pattern for reuse"
- "How do I apply this architecture to a new app?"

---

### 4. Frontend UX Specialist

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

### 5. Learning Tutor

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

### 6. Product Manager

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

### 7. Pulse (Metrics Collection Agent)

**Use when:**
- Manually collecting automation metrics
- Before running automation-sentinel analysis
- Updating usage data

**Note:** This agent is ON-DEMAND only.

---

### 8. Session Optimizer

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

### 9. Steward (Backend Quality)

**Use when:**
- Backend test coverage falls below the project threshold (90% line coverage)
- `/finish-session` blocks the commit due to coverage failure
- Adding targeted tests to close specific coverage gaps

**Note:** This agent is triggered automatically by `/finish-session` when coverage is below threshold. It can also be invoked on demand.

**Example prompts:**
- "Coverage dropped — run steward"
- "Close the coverage gap in PokService"

---

### 10. Tech Writer

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

## Agent Selection Guide

```
What's your task?
│
├─ Checking automation health / metrics → pulse → automation-sentinel
│
├─ Reviewing backend/Java code → sous-chef
│
├─ Addressing PR review feedback → /review-pr command
│
├─ Designing UI/UX screens → frontend-ux-specialist
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
- 9 agents created (2026-01-29); `steward` added (2026-02-22) — 10 total
- Tailored to Engineering Daybook (Java/Spring Boot + Next.js/Expo)
- Integrated with project conventions (CLAUDE.md, CODING_STYLE files)
- Anti-cyclic dependency rule documented and enforced
- Ready to use

### Maintenance
- **Update agents** when project conventions change
- **Add new agents** as new needs emerge
- **Run automation-sentinel** monthly to check ecosystem health

---

**Happy building!**
