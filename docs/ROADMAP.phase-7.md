# Phase 7: Gamification (TBD)

> Status: **⏳ Planned**

---

**Goal:** Celebrate personal learning milestones with private-by-default badges — non-competitive, non-tracking, aligned with the mission of consistent learning.

**Design Principles:**
- Badges are **personal celebrations**, not competitive rankings
- No streaks, no consecutive-day tracking, no pressure mechanics
- Badges are **private by default**; learner can choose to make specific badges public
- Public badges must respect profile and POK privacy settings

---

## Milestone 7.1: AI-Assisted Tag Suggestions

> Basic manual tagging ships in Phase 2. This milestone adds AI-powered intent-based suggestions.

| # | Feature | Priority |
|---|---------|----------|
| 7.1.1 | AI engine infers explicit tags from POK content (e.g., #springboot from the text) | Must Have |
| 7.1.2 | AI engine infers related concept tags from intent (e.g., singleton → also #designpatterns, #oop) | Should Have |
| 7.1.3 | Suggested tags presented to learner for approval — never auto-applied silently | Must Have |
| 7.1.4 | Learner can propose additional tags not suggested by AI | Should Have |
| 7.1.5 | Learner can create entirely new tags | Must Have |
| 7.1.6 | Tag suggestion model improves over time based on learner's own tag history | Could Have |

## Milestone 7.2: Milestone Badges

| # | Badge Category | Examples | Priority |
|---|---------------|----------|----------|
| 7.2.1 | Volume milestones | 1st learning, 10th, 50th, 100th, 500th | Must Have |
| 7.2.2 | Tag depth | 10 learnings with same tag ("becoming an expert in #java") | Should Have |
| 7.2.3 | Tag breadth | Used 5+ different tags ("curious mind") | Could Have |
| 7.2.4 | Weekly celebration | 5+ learnings in a single week — one-time toast, no countdown | Should Have |
| 7.2.5 | Revisitor | Updated a learning 3+ times ("learning is iterative") | Could Have |
| 7.2.6 | Social (Phase 6 dependency) | First share; first follower | Could Have |

## Milestone 7.3: Badge Privacy & Display

| # | Feature | Priority |
|---|---------|----------|
| 7.3.1 | All badges private by default | Must Have |
| 7.3.2 | Learner can make individual badges public | Must Have |
| 7.3.3 | Public badges visible on learner's profile (below avatar) | Should Have |
| 7.3.4 | Public badges never expose counts or metrics violating anti-vanity principle | Must Have |
| 7.3.5 | Badge notification shown in-app at award time (celebration toast / modal) | Must Have |
| 7.3.6 | Badge visual design — illustrations or icons per badge type (TBD) | Should Have |

## Exit Criteria

- [ ] AI tag suggestions surface both explicit and related-concept tags
- [ ] Learner always approves tags before saving — no silent auto-tagging
- [ ] Learners can create new tags
- [ ] Badges awarded automatically on milestone events
- [ ] All badges private by default; learner controls visibility
- [ ] No competitive elements, streak counters, or progress bars visible
- [ ] Badge display respects all privacy settings

## Future Considerations (Backlog)

| Feature | Rationale |
|---------|-----------|
| AI Chat Interface | Query POKs via natural language conversation |
| Graph Visualization | Visual map of POK connections and tag relationships |
| Browser Extension | Quick capture from any webpage |
| IDE Plugin | Capture learnings without leaving the editor |
| Offline Mode | Full offline-first with sync |
| Voice Input | Record POKs via voice (mobile) |
| Push Notifications | Mobile push notifications for social events |
