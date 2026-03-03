# Phase 5: Privacy (TBD)

> Status: **⏳ Planned**

---

**Goal:** Give learners full control over the visibility of their POKs. Privacy infrastructure is the prerequisite for all social features.

**Design Principles:**
- Default is private — learners opt in to sharing
- The default visibility setting is freely adjustable at any time (in either direction)
- A learning made public cannot be reverted to private — once shared, it stays shared
- A public learning can be deleted; deletion propagates and removes downstream shares (Phase 6.4)
- Phase 5 ships the initial two tiers (private / public); followers-only and colleagues-only unlock in Phase 6

---

## Milestone 5.1: POK Visibility Controls

| # | Feature | Priority |
|---|---------|----------|
| 5.1.1 | POK visibility field (private / public — Phase 5; followers-only / colleagues-only — Phase 6) | Must Have |
| 5.1.2 | Default visibility setting per learner (default: private) | Must Have |
| 5.1.3 | Set visibility at POK creation time | Must Have |
| 5.1.4 | Change visibility of an existing POK from private → public (irreversible; public → private not allowed) | Must Have |
| 5.1.5 | Access control enforcement — public visible to all; private visible only to owner; changing to private removes all shares | Must Have |
| 5.1.6 | Share visibility constraint: shared POK's visibility ≤ original's | Must Have |
| 5.1.7 | UI indicators for visibility level on POK cards and detail views | Should Have |

## Milestone 5.2: Learner Profile Privacy

| # | Feature | Priority |
|---|---------|----------|
| 5.2.1 | Profile visibility: public / followers-only / colleagues-only / private | Must Have |
| 5.2.2 | Public profiles discoverable; private profiles visible only to owner | Must Have |
| 5.2.3 | No visible follower count, colleague count, or total learning count on public profiles (anti-vanity) | Must Have |

## Exit Criteria

- [ ] POKs are private by default; learners can make individual POKs public
- [ ] Learners can set their default visibility preference
- [ ] Access control correctly enforced for all endpoints and UI views
- [ ] Public learnings cannot be reverted to private
