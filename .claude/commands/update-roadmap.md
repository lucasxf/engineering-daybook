---
description: Update the current phase file with session progress
argument-hint: <what-was-completed>
---

**Update the active phase file with session progress.**

> ⚠️ This command edits `docs/ROADMAP.phase-{N}.md` — NOT `docs/ROADMAP.md`.
> `ROADMAP.md` is the index only; never add milestone details to it.

Context: $ARGUMENTS

**Workflow:**

1. **Detect current phase**
   ```bash
   grep "CURRENT_PHASE:" docs/ROADMAP.md
   # e.g. <!-- CURRENT_PHASE: 1 --> → edit docs/ROADMAP.phase-1.md
   ```

2. **Read the phase file**
   - Load `docs/ROADMAP.phase-{N}.md`
   - Identify items to update based on `$ARGUMENTS` (or ask: "What was completed this session?")

3. **Apply updates to the phase file**
   - Mark completed items as ✅
   - Move newly completed milestones into the "Completed" section
   - Update "Active / Pending" with remaining work

4. **If a full phase is now complete**
   - Update `<!-- CURRENT_PHASE: N -->` in `docs/ROADMAP.md` to `N+1`
   - Update the status table row in `docs/ROADMAP.md`
   - Update `CLAUDE.md` "Current Focus" section

5. **Show diff and confirm**
   - Display changes for review before committing
