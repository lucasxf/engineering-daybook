---
name: save-learning
description: Save a new learning, pitfall, or coding directive to the correct file with cross-file deduplication. Routes stack-specific pitfalls to the appropriate {stack}/CLAUDE.md "Known Pitfalls" section and cross-cutting patterns to memory/MEMORY.md Key Learnings. Use when you've learned something new from a correction, bug, or debugging session and want to persist it correctly. Trigger when: tech-writer agent needs to save a learning, /directive needs to write a new directive, or mid-session you discover a pitfall worth recording. Examples: "save this learning", "record this pitfall", "add this directive", "write this to the right CLAUDE.md".
---

# save-learning

Single entry point for saving learnings, pitfalls, and directives to the correct file. Callers provide the **pre-written text** — this skill handles **routing and deduplication only**.

**Separation of concerns:**
- Caller (tech-writer, /directive, mid-session) = **writing quality** (crafts the text, code examples, phrasing)
- This skill = **placement intelligence** (classifies, deduplicates, writes to correct file)

---

## Step 1: Classify the learning

If the caller provided an explicit `stackHint` (backend / web / mobile), use it and skip inference.

Otherwise, scan the text for stack signals:

| Signals | Stack |
|---------|-------|
| Java, Spring, Maven, JPA, Flyway, Testcontainers, Hibernate, @Bean, pom.xml | `backend` |
| TypeScript, Next.js, React (web), Vitest, Playwright, Tailwind, next-intl, `web/` | `web` |
| Expo, React Native, Maestro, jest-expo, `mobile/`, Android, EAS, `app.json` | `mobile` |
| None of the above, or applies across stacks | `cross-cutting` |

---

## Step 2: Determine target file and section

| Classification | Target file | Target section |
|----------------|-------------|----------------|
| `backend` | `backend/CLAUDE.md` | `## Known Pitfalls` |
| `web` | `web/CLAUDE.md` | `## Known Pitfalls` |
| `mobile` | `mobile/CLAUDE.md` | `## Known Issues / Pitfalls` |
| `cross-cutting` | `memory/MEMORY.md` | `## Key Learnings` → pick the closest subsection |

---

## Step 3: Dedup across ALL files

Extract 2–3 unique key phrases from the text (specific method names, error messages, or unique terms).

Search for these phrases across:
- `CLAUDE.md` (root)
- `backend/CLAUDE.md`
- `web/CLAUDE.md`
- `mobile/CLAUDE.md`
- `memory/MEMORY.md`

**If an EXACT match is found:**
- Report: `"Already exists in {file} → {section}. Skipped."`
- Stop — do NOT write.

**If a NEAR match is found** (same topic, different wording):
- Show the existing entry and the new text side by side.
- Ask: "A similar entry exists in {file}. Do you want to: (a) update existing, (b) add as new entry, (c) skip?"
- Proceed based on response.

**If no match found:** proceed to Step 4.

---

## Step 4: Write to target file

Append the pre-written text to the correct section, with `(Added YYYY-MM-DD)` timestamp if not already present in the text.

For MEMORY.md Key Learnings: place under the correct subsection (Mobile, Infrastructure, Flyway, JaCoCo, Spring/Testing, Backend, Playwright, Frontend, Python, Git, etc.). Create a new subsection only if none of the existing ones fit.

**Remember:** MEMORY.md Key Learnings carries the comment:
```
<!-- Stack-specific pitfalls belong in {stack}/CLAUDE.md. Only keep entries here that are NOT in any stack file. -->
```
Verify classification before writing to MEMORY.md — cross-cutting entries only.

---

## Step 5: Report

Output a single confirmation line:
```
Saved to backend/CLAUDE.md → Known Pitfalls
```
or
```
Skipped — already exists in web/CLAUDE.md → Known Pitfalls (line ~175)
```
