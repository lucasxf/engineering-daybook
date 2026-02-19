# Glossary — learnimo

This document defines the terminology used throughout the learnimo project documentation, codebase, and communications.

---

## Project Terms

| Term | Definition |
|------|------------|
| **ED** | learnimo — the product/application itself |
| **EDP** | learnimo Project — refers to the overall project (development, documentation, planning) |

---

## Domain Terms

### POK (Piece of Knowledge)

**Definition:** The atomic/minimal unit of information in learnimo. A single learning entry recorded by the user.

**Synonym:** POL (Piece of Learning) — used interchangeably with POK.

**Usage Guidelines:**

| Context | Use "POK" | Use "learning" |
|---------|-----------|----------------|
| **Code/Technical** | ✅ Types, files, API routes, database tables, tests | ❌ Never in code |
| **User Interface** | ❌ **NEVER** — users won't understand it | ✅ **ALWAYS** — buttons, labels, messages |
| **Documentation** | ✅ Technical specs, ADRs, developer docs | Context-dependent |
| **Translations (i18n)** | ❌ Never | ✅ EN: "learning"<br>PT-BR: "aprendizado" |

**Rationale:** "POK" is internal jargon. "Learning" is semantic and user-friendly, reinforcing that this app is specifically for capturing learnings, not generic notes or todos.

**Examples:**
- Code: `interface Pok`, `pokApi.create()`, `poks` table ✅
- UI: "Save Learning", "My Learnings", "Delete learning?" ✅
- UI: "Create POK", "My POKs" ❌ WRONG

**See also:** `CLAUDE.md` Domain Model section for enforcement rules.

---

### Other Domain Terms

| Term | Definition |
|------|------------|
| **Tag** | A categorization label attached to a POK (e.g., `#java`, `#concurrency`, `#system-design`). Can be auto-generated or manually assigned. |
| **Auto-tagging** | The feature where AI suggests tags for a POK based on its content. User approval is required. |
| **Atomic entry** | A POK that is self-contained and makes sense on its own, without requiring context from other entries. |

---

## Document History

| Version | Date | Author | Changes |
|:-------:|:----:|:------:|:--------|
| 1.0 | 2026-01-29 | Lucas Xavier Ferreira | Initial version |
| 1.1 | 2026-02-14 | Lucas Xavier Ferreira | Expanded POK entry with user-facing terminology guidelines |
