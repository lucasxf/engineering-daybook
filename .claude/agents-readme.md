# Agent Suite — learnimo

> **Developer:** Lucas Xavier Ferreira
> **Last updated:** 2026-02-27

---

## Roster

| Agent | Role | Model | Name Origin |
|-------|------|-------|-------------|
| `virgil` | Product — requirements, user stories, acceptance criteria | Sonnet | Virgil Abloh (1980–2021) — Ghanaian-American creative director of Off-White and Louis Vuitton Men's. Defined what products should be and why, across disciplines. |
| `nexus` | Web engineering — Next.js, App Router, component architecture, URL/state strategy | Sonnet | — |
| `pixl` | UX & design — screens, interactions, accessibility, visual quality | Sonnet | — |
| `hedy` | Mobile engineering — Expo/React Native, navigation, token storage, state, cross-platform | Sonnet | Hedy Lamarr (1914–2000) — Austrian-American actress and co-inventor of frequency-hopping spread spectrum, the foundational technology behind WiFi, Bluetooth, and GPS. |
| `sous-chef` | Backend code review — Java/Spring Boot, API design, JPA, Flyway, security | Sonnet | The kitchen metaphor: the backend is the kitchen. You are the chef; sous-chef enforces quality and standards where users never see. |
| `imhotep` | Cross-project architecture — pattern extraction, templates, new project scaffolding | Sonnet | Imhotep (~2650 BC) — Egyptian polymath and architect of the Step Pyramid of Djoser, the first large stone structure in history. Physician, scribe, vizier. The only non-royal Egyptian to be deified. |
| `professor-x` | Teaching — explains concepts, structured learning, exercises | Sonnet | Charles Xavier (X-Men) + Lucas **Xavier** Ferreira. |
| `steward` | Backend test coverage — reads JaCoCo report, writes targeted tests to meet threshold | Sonnet | — |
| `tech-writer` | Documentation — ADRs, README, ROADMAP, Javadoc, OpenAPI annotations | Sonnet | — |
| `automation-sentinel` | Automation health — detects redundancy, obsolete agents/commands, usage reports | Sonnet | — |
| `pulse` | Metrics collection — agent/command usage, delta and full modes | Haiku | — |
| `session-optimizer` | Session planning — token efficiency, stack-scoped context loading | Haiku | — |

---

## Anti-Cyclic Dependency Rule

```
Slash Commands → Agents → Other Agents
                               ↓
                        NEVER back to Commands
```

Commands can call agents. Agents can call agents. Agents must never call commands.

---

## Status

- 12 agents total
- Agents with named homages: `virgil`, `hedy`, `imhotep`, `professor-x`, `sous-chef`
- All homages follow the project naming principle: Black, African, Brazilian, or women — people whose contributions are often undertold.
