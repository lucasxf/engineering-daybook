# Web vs Mobile Feature Parity

> Last updated: 2026-03-11 (session: develop — mobile feature parity: My Learnings tab, search bar, tag management)

| Feature | Web | Mobile | Gap |
|---------|:---:|:------:|-----|
| **Auth: Email/password login** | ✅ | ✅ | — |
| **Auth: Email/password register** | ✅ | ✅ | — |
| **Auth: Google OAuth** | ✅ | ⚠️ | API layer done, button not wired in LoginScreen |
| **Auth: Choose Handle (Google signup)** | ✅ | ✅ | — |
| **Auth: Forgot password** | ✅ | ✅ | — |
| **Auth: Reset password** | ✅ | ❌ | Web-only (email deep link opens web) |
| **Learning: Create** | ✅ | ✅ | — |
| **Learning: Read (feed + detail)** | ✅ | ✅ | — |
| **Learning: Edit (inline)** | ✅ | ✅ | — |
| **Learning: Delete (soft)** | ✅ | ✅ | — |
| **Learning: Quick Entry (inline on feed)** | ✅ | ❌ | Web-only component |
| **Search: Hybrid/semantic/keyword** | ✅ | ✅ | — |
| **Search: Pagination + infinite scroll** | ✅ | ✅ | — |
| **Markdown: Content rendering** | ✅ | ✅ | — |
| **Markdown: Strip for card preview** | ✅ | ✅ | — |
| **Tags: Display on cards/detail** | ✅ | ✅ read-only | — |
| **Tags: Add/remove on existing learning** | ✅ | ✅ | Tag chips with ✕ remove + bottom-sheet picker in detail screen |
| **Tags: Tag-at-creation** | ✅ | ❌ | Not in mobile `CreatePokDto` |
| **Tags: AI suggestion approve/reject** | ✅ | ❌ | API exists, no UI |
| **Tags: Filter feed by tag** | ✅ | ❌ | API supports `tagId` param, no UI |
| **Tags: Tag-grouped view** | ✅ | ❌ | Web-only view |
| **Timeline view** | ✅ | ❌ | Web-only view |
| **Sort options (newest/oldest/updated)** | ✅ | ❌ | Web-only UI |
| **Visibility: PRIVATE / PUBLIC** | ✅ | ✅ | — |
| **Visibility: FOLLOWERS_ONLY / COLLEAGUES_ONLY** | ✅ | ❌ | Mobile is 2-tier only |
| **Profile: View own info** | ✅ | ✅ | — |
| **Profile: Edit displayName** | ✅ | ❌ | API exists, display only |
| **Profile: Edit bio** | ✅ | ❌ | API exists, display only |
| **Profile: Avatar upload/remove** | ✅ | ❌ | API exists, no UI |
| **Profile: Avatar display** | ✅ | ✅ | — |
| **Settings: Theme toggle** | ✅ | ✅ | — |
| **Settings: Language toggle** | ✅ | ✅ | — |
| **Settings: Privacy (profile visibility)** | ✅ 4-tier | ✅ 2-tier | FOLLOWERS_ONLY / COLLEAGUES_ONLY missing |
| **Settings: Default learning visibility** | ✅ 4-tier | ✅ 2-tier | FOLLOWERS_ONLY / COLLEAGUES_ONLY missing |
| **My Learnings (personal feed)** | ✅ | ✅ | FeedScreen tab toggle: "Feed" (social) ↔ "My Learnings" (personal, via `useFeedData`) |
| **Search bar UI** | ✅ | ✅ | Debounced search bar in My Learnings tab |
| **Social: Discovery feed (following feed)** | ✅ | ✅ | Both done — mobile FeedScreen uses `useSocialFeedData` |
| **Social: Discover page (learner search)** | ✅ | ✅ | `DiscoverScreen` + `useLearnerSearch` shipped (Milestone 6.5, 2026-03-10) |
| **Social: Follow/unfollow** | ✅ | ✅ | `FollowButton` + follow/unfollow endpoints wired in mobile `learnerApi` (Milestone 6.5, 2026-03-10) |
| **Social: Learner profiles** | ✅ | ✅ | `LearnerProfileScreen` + `useLearnerProfile` shipped (Milestone 6.5, 2026-03-10) |
| **Social: Re-Learning (share)** | ✅ | ❌ | No share endpoints in mobile `learnerApi`; no `ReLearningModal` |
| **Dark/light/system theme** | ✅ | ✅ | — |
| **i18n (EN + PT-BR)** | ✅ | ✅ | — |
