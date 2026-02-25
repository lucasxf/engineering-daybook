# Project Vision — learnimo

> "A tinta mais fraca constrói pontes mais fortes que a memória mais viva."
> — Provérbio Yorubá (Nigéria)

---

## 1. Origin

The learnimo concept was inspired by "The Pragmatic Programmer" by David Thomas and Andrew Hunt. In the book, they describe how engineers in traditional industries would maintain physical notebooks to record daily learnings — and those with the fullest notebooks would take pride in their accumulated knowledge.

This project brings that practice into the digital age — for everyone who learns and wants to hold onto what they know.

---

## 2. Vision Statement

**learnimo is a personal learning journal that helps anyone capture, organize, and recall what they learn — without the noise of general-purpose tools or the unpredictability of AI-generated content.**

The core promise: **Your knowledge, exactly as you recorded it, findable when you need it.**

---

## 3. Problem Statement

### The Pain Points

1. **Knowledge Scattering:** You learn something new, apply it, and forget where you documented it — if at all. Learnings end up spread across chat messages, random `.txt` files, browser bookmarks, and memory.

2. **Tool Overload:** General-purpose tools (OneNote, Notion, Obsidian) are powerful but noisy. They try to do everything — project management, task tracking, note-taking — creating clutter that buries learnings.

3. **Memory Decay:** You solved that exact problem 6 months ago. You *know* you did. But you can't remember how, and searching your notes returns nothing useful.

4. **AI Hallucination Risk:** LLM-powered tools are great for generating ideas but dangerous for retrieving facts. You need your learnings to be immutable and trustworthy.

---

## 4. Target Audience

**Primary:** Anyone who learns continuously and wants to hold onto what they know:
- Curious people who pick up new things across many domains
- Professionals building a personal knowledge base in their field
- Students who want to retain and retrieve what they study
- Anyone frustrated with existing tools' noise-to-signal ratio

**Secondary:**
- People documenting patterns, decisions, and lessons learned at work
- Anyone preparing a record of their experience and accomplishments
- Readers who want to remember and connect ideas from books and articles

---

## 5. Core Principles

### 5.1 Atomic Knowledge

Each piece of knowledge (POK) is:
- **Self-contained:** Makes sense on its own
- **Immutable by AI:** Only the author can edit content
- **Timestamped:** Creation and modification dates tracked
- **Tagged:** Categorized for discoverability

### 5.2 Learner-First Design

- Clean, distraction-free interface
- Fast capture (mobile + web)
- Powerful search (semantic, not just keyword)
- No project management features bleeding in

### 5.3 Minimum Friction

- **Every interaction, fewest steps possible** — if a screen can be eliminated, eliminate it
- **Post-login = primary workflow** — authenticated users land on their feed, not a welcome page
- **Inline capture** — quick-entry should be available directly on the feed, not behind navigation
- **Navigation is universal** — logo, brand, and key nav elements are always clickable
- **Seamless experience** — the app should feel like an extension of thought, not a form to fill out

### 5.4 Trust & Integrity

- **What you write is what you get** — no AI "improving" your notes
- AI features (when added) assist with *finding* and *connecting* knowledge, never *modifying* it
- Full audit trail of changes

---

## 6. What learnimo IS

| Capability | Description |
|------------|-------------|
| **Learning Journal** | Record what you learned today in your own words |
| **Knowledge Search** | Find past learnings by keyword, tag, or semantic meaning |
| **Auto-Tagging** | AI suggests tags; you approve or reject |
| **Timeline View** | See your learning journey chronologically |
| **Connection Insights** | Discover how new learnings relate to past ones |
| **Export-Ready** | Your data, portable, for resumes/brag docs |

---

## 7. What learnimo is NOT

| Anti-Pattern | Why Not |
|--------------|---------|
| **General notes app** | We optimize for learnings, not meeting notes or grocery lists |
| **Project management** | No tasks, sprints, or kanban boards |
| **AI content generator** | We retrieve your knowledge; we don't invent it |
| **Collaborative wiki** | This is *your* daybook; team knowledge bases are a different tool |
| **Code repository** | Store insights *about* code, not the code itself |

---

## 8. Differentiation

### vs. OneNote / Evernote / Notion

| Aspect | General Tools | learnimo |
|--------|---------------|---------------------|
| **Focus** | Everything | Learnings only |
| **Organization** | User-managed folders/pages | Auto-tagged atomic entries |
| **Search** | Basic text match | Semantic + keyword + tags |
| **Interface** | Feature-rich, complex | Minimal, fast |
| **AI Role** | Content generation | Content discovery (never modification) |

### vs. LLM Chat Apps (ChatGPT, Claude)

| Aspect | Chat Apps | learnimo |
|--------|-----------|---------------------|
| **Data Source** | Training data + hallucination | Your own verified learnings |
| **Persistence** | Conversation-based | Entry-based, permanent |
| **Navigation** | Scroll through chat | Timeline, tags, search |
| **Trust** | "Probably correct" | "Exactly what I wrote" |

---

## 9. Success Metrics

### MVP Success (Personal Use)

- [ ] Author actively uses ED for 8+ weeks
- [ ] Consistent weekly usage (3-5 entries per week average)
- [ ] Search retrieves relevant POK in ≤3 attempts (80%+ success rate)
- [ ] Author reports feeling "in control" of their learnings (qualitative)

### Growth Success (If Opened to Others)

- [ ] 10 active users recording at least weekly
- [ ] Net Promoter Score > 8 (via in-app feedback)
- [ ] Organic mentions on LinkedIn or Medium (tracked via social listening or manual search)

> **Note on metrics:** We intentionally avoid vanity metrics like "total POKs created."
> The goal is sustainable learning habits, not gamified accumulation.

---

## 10. Future Vision (North Star)

In 2+ years, learnimo could become:

1. **Your second brain** — seamlessly integrated into your daily learning workflow
2. **Record of accomplishment** — your learning history as a personal portfolio
3. **Community knowledge layer** — optional sharing of curated learnings (without losing personal focus)
4. **Cross-platform presence** — browser extensions, mobile, CLI tools

But first: **nail the MVP for one user (the author).**

---

## Document History

| Version | Date | Author | Changes |
|:-------:|:----:|:------:|:--------|
| 1.0 | 2026-01-29 | Lucas Xavier Ferreira | Initial version |
| 1.1 | 2026-02-21 | Lucas Xavier Ferreira | Added § 5.3 Minimum Friction as core principle; renumbered Trust & Integrity to § 5.4 |
| 1.2 | 2026-02-24 | Lucas Xavier Ferreira | Broadened scope — learnimo is a learning journal for everyone, not engineers only; updated Vision Statement, Problem Statement, Target Audience, § 5.2, and North Star |
