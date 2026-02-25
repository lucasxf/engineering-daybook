# Phase 6: Social Capabilities (TBD)

> Status: **⏳ Planned**

---

**Goal:** Enable learners to connect, follow each other, discover public learnings, and share content — without rewarding vanity metrics.

**Design Principles:**
- No follower, colleague, or learning counts visible on public profiles (anti-vanity)
- Learners can see their own counts privately
- Mutual follows = **colleagues** (automatic — no separate request flow)
- Social connections named for the learning context: colleagues, class, study group
- Kindness is a first-class principle — humiliation and harassment not tolerated

---

## Milestone 6.1: Following & Colleagues

| # | Feature | Priority |
|---|---------|----------|
| 6.1.1 | Follow a learner | Must Have |
| 6.1.2 | Unfollow a learner | Must Have |
| 6.1.3 | Mutual follow = colleague (automatic) | Must Have |
| 6.1.4 | Followers-only and colleagues-only visibility tiers (from Phase 5 model) | Must Have |
| 6.1.5 | Learner can privately see own counts: learnings, followers, following, colleagues | Must Have |
| 6.1.6 | Follow notification copy | Should Have |
| 6.1.7 | Unfollow notification | Could Have |

## Milestone 6.2: Classes & Study Groups

| # | Feature | Priority |
|---|---------|----------|
| 6.2.1 | Learners can form an opt-in named group (Class / Study Group) with colleagues | Could Have |
| 6.2.2 | Groups are never auto-created — always deliberate | Must Have (constraint) |
| 6.2.3 | Group visibility and membership rules respect individual privacy settings | Must Have |

## Milestone 6.3: Learner Profiles

| # | Feature | Priority |
|---|---------|----------|
| 6.3.1 | Public profile page at `/learners/{handle}` | Must Have |
| 6.3.2 | Profile shows avatar and display name | Must Have |
| 6.3.3 | Optional short bio (no external links or social media redirects) | Should Have |
| 6.3.4 | Avatar upload (Supabase Storage, size limits, format validation, resizing) | Must Have |
| 6.3.5 | Profile respects visibility settings | Must Have |
| 6.3.6 | No vanity metrics on public profiles | Must Have |
| 6.3.7 | Clickable `@handle` in header links to own profile; avatar thumbnail displayed | Should Have |

## Milestone 6.4: Share (Re-Learning)

| # | Feature | Priority |
|---|---------|----------|
| 6.4.1 | Share a public POK (reference in learner's feed, attributed to original author) | Should Have |
| 6.4.2 | Shared POK in sharer's feed and profile, linked to original | Should Have |
| 6.4.3 | Original author notified when their POK is shared | Should Have |
| 6.4.4 | Shared POK visibility ≤ original's | Must Have |
| 6.4.5 | Original POK going private removes all downstream shares | Must Have |

## Milestone 6.5: Discovery Feed

| # | Feature | Priority |
|---|---------|----------|
| 6.5.1 | Feed of public POKs from learners you follow | Must Have |
| 6.5.2 | Discover public learners (search by handle or name) | Should Have |

## Milestone 6.6: Community Principles & Content Moderation

| # | Feature | Priority |
|---|---------|----------|
| 6.6.1 | Publish learnimo Manifest / Community Principles — kindness rule included | Must Have |
| 6.6.2 | Report/flag mechanism for inappropriate content | Must Have |
| 6.6.3 | AI moderation agent for harmful/abusive language in shared content | Should Have |
| 6.6.4 | Community guidelines linked from onboarding and profile pages | Should Have |

## Exit Criteria

- [ ] Learners can follow/unfollow others
- [ ] Mutual follows correctly identified as colleagues
- [ ] Profiles display correctly with visibility enforcement
- [ ] Share feature works with attribution and visibility cascade
- [ ] No vanity metrics visible on public profiles
- [ ] Community Principles published and linked in-app
- [ ] Report mechanism functional
