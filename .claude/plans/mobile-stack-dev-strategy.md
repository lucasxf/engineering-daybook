# Mobile Stack Development Strategy — Learnimo

## Context

All web screens have been redesigned via v0.dev using the "Library at Dusk" design language. The mobile app (Expo/React Native) has **zero** visual parity — it uses a completely different design system (indigo/gray vs. warm parchment/ember/navy). This document analyzes the optimal workflow to bring mobile to visual parity without repeating the web cycle's inefficiencies.

**Key finding:** The divergence is concentrated at the token level. All 2,800 lines of mobile code reference `useTheme()` → `tokens.ts`. Updating that single file propagates ~80% of the visual change automatically.

---

## 1. Tool Landscape

**No external tool exists that does for Expo what v0.dev does for Next.js.** This is the most important finding.

| Tool | Generates | RN/Expo Fit | Verdict |
|------|-----------|-------------|---------|
| **v0.dev** | Next.js + Tailwind + shadcn/ui | ❌ Web only | Cannot generate RN code |
| **bolt.new** | Full-stack web apps | ❌ Web only | Same problem as v0 |
| **Draftbit** | Expo-compatible code | ⚠️ Own component library, not raw RN | Poor fit — outputs don't match existing `tokens.ts` pattern; better for greenfield |
| **Locofy / Anima** | Figma → RN code | ❌ Requires Figma source | No Figma designs exist — web was built via v0 prompts |
| **NativeWind** | Not a tool — Tailwind syntax for RN | ⚠️ Would reduce translation gap | Possible future adoption, but a separate migration project |
| **Claude (@pixl + @hedy)** | Direct RN code from visual specs | ✅ Best fit | Already integrated; knows the codebase |

**Confidence level:** High for v0/bolt (well-documented web-only tools). Medium for Draftbit (may have improved since Aug 2025). Low for Locofy/Anima RN quality (rapidly evolving).

**Bottom line:** The "design tool" for mobile IS Claude via @pixl/@hedy with a structured design system specification. No tool purchase changes this.

---

## 2. Skills Assessment

### `frontend-design` skill: not applicable
Web-focused (HTML/CSS/Tailwind). Zero knowledge of RN `StyleSheet`, `Animated`, or native constraints.

### Custom `mobile-design-system` skill: recommended

A ~200-line skill document encoding:

1. **Library at Dusk palette mapped to RN tokens** — exact hex values from `globals.css` for both light/dark, translated to `buildTheme()` semantics
2. **Component recipes** — border radii, shadows (RN shadow ≠ CSS shadow), spacing, press feedback, typography per variant for all 7 UI components
3. **Screen layout patterns** — SafeAreaView, keyboard avoidance, FlatList styling, bottom tab bar appearance, React Navigation header config
4. **Font loading** — `expo-font` setup for DM Sans + Sora

**Build cost:** 2-4 hours (it's a document, not code).
**Reuse:** Applies to all 14+ screens/components. Prevents drift across sessions. Serves as the canonical mobile design system spec.

**Integration with @pixl:** The skill loads as context when @pixl handles mobile tasks. @pixl provides UX heuristics and layout; the skill provides exact tokens and component patterns. @hedy handles engineering decisions.

---

## 3. Recommended Workflow

### Recommendation: Approach D (Skill-driven)

| Criterion | A: Replay | B: Translate | C: Hybrid | **D: Skill-driven** |
|---|---|---|---|---|
| Session/token cost | High (tool prompt + manual translation) | Medium (ad-hoc) | Medium-High | **Low-Medium** (skill is pre-loaded context) |
| Visual drift risk | High (no RN tool exists) | Medium (human judgment gap) | Medium | **Low** (tokens encoded in skill) |
| External tool dependency | Hard (on a tool that doesn't exist) | None | Partial | **None** |
| SDD workflow fit | Requires new command + tool | Fits existing pipeline | Splits workflow | **Fits existing pipeline** |
| State A suitability | Overkill | Good | Good | **Best** (batch reskin) |
| State B suitability | Ideal IF tool existed | Good | Good | **Good** |
| State C suitability | Tool doesn't exist | OK (inspect live web) | Better | **Good** |

**Why D wins:** The prerequisite tool for A/C doesn't exist. B is ad-hoc — each session re-derives the palette. D systematizes B by encoding the design system once and reusing it.

**The D workflow:**
1. Build the `mobile-design-system` skill (one-time, 2-4 hrs)
2. Update `tokens.ts` with Library at Dusk palette (one-time, 1 session)
3. Per screen: load spec (functional) + load skill (visual) + reference web screen (layout) → @pixl/@hedy implement

---

## 4. Per-State Workflow

### State A: 8 screens with stale mobile code

**Patch, don't rebuild.** The architecture is sound — every component uses `useTheme()` with no hardcoded colors. The divergence is a token-level problem.

**Patch vs. rebuild threshold:** Rebuild only if the screen's information architecture (what information is shown and how it's organized) has fundamentally changed. Layout changes, added features, or palette swaps are patches.

| Variable | Favors Patch | Favors Rebuild |
|----------|-------------|----------------|
| Component structure matches web | ✅ All 8 screens | — |
| Theme-aware styling (`useTheme()`) | ✅ All screens | — |
| Test coverage exists | ✅ 39 unit + 3 Maestro E2E | — |
| Missing features are additive | ✅ (re-learn button, tag mgmt, etc.) | — |
| Navigation structure changed | — | ❌ None have |

**All 8 screens: PATCH.**

**Workflow:**
1. **Token update** (single commit): Update `tokens.ts` palette → all screens inherit new colors
2. **Component refinement** (per-component commits): Update `Button`, `Card`, `TextInput`, etc. with Library at Dusk-specific details (shadows, border styles, font families)
3. **Per-screen QA**: Side-by-side with web, fix any remaining visual gaps
4. **Feature additions**: Implement from existing specs (tag mgmt, re-learning, etc.) — these arrive in the new palette automatically

**Agents:** @pixl (visual QA) + @hedy (engineering) + mobile-design-system skill (context)

### State B: 4 web-only screens

| Screen | Effort | Priority | Approach |
|--------|--------|----------|----------|
| **Privacy Policy** | Trivial | Required for App Store | WebView pointing to hosted URL, or ScrollView with static text |
| **Reset Password** | Medium | Required for auth completeness | Write spec, implement. Needs Expo deep linking config. |
| **Timeline view** | Medium | Low | Could be a SectionList view mode within My Learnings tab. Defer unless users request. |
| **Dedicated settings** | N/A | N/A | Mobile uses ProfileScreen (platform convention). Feature parity comes from implementing existing specs. |

**Workflow:** For each, reference the corresponding web page + v0 prompt output as the visual spec. Write a mobile SDD spec noting RN-specific adaptations (navigation, safe areas, gestures). Implement via `/implement-spec` → @hedy.

### State C: Unspecified screens

**Do not retroactively spec web screens.** The live web UI IS the spec. When mobile needs the equivalent, write a mobile-specific spec referencing the web screen as visual reference. The spec covers: component mapping, navigation differences, mobile-specific concerns.

---

## 5. Spec Triage Plan

### Current state
5 mobile specs exist, all from 2026-03-09, all unimplemented. **None reference Library at Dusk.**

### Are they stale?
**No.** They are **functional specs** — they specify API wiring, hook composition, navigation changes, and interaction patterns. None specify colors, fonts, or visual tokens. The palette change doesn't invalidate them.

### Staleness criteria
A spec is stale if it:
1. References visual details contradicting Library at Dusk (none do)
2. References a component API or screen structure that was refactored since writing (check git blame)
3. Assumes navigation/state architecture that changed (none do)

### Decision rule
**Do not update specs before mobile work.** Instead:
- Functional requirements → existing spec (correct as-is)
- Visual requirements → mobile-design-system skill (shared, not per-spec)
- Layout reference → live web UI or v0 prompt output

This avoids premature spec updates that might need further changes once work begins.

### Are existing mobile implementations useful?
**Yes, strongly.** Despite palette divergence:
- ✅ Correct component structure (theme-aware throughout)
- ✅ Correct navigation wiring (typed React Navigation params)
- ✅ Correct data fetching (hooks with pagination, refresh, error handling)
- ✅ Correct a11y patterns (accessibilityRole, accessibilityLabel)
- ✅ Correct form handling (react-hook-form + zod)

After `tokens.ts` update, existing screens will look ~80% correct immediately.

---

## 6. Open Questions

**Q1: Custom fonts — which to load?**
Library at Dusk uses DM Sans (body), Sora (headings), Bricolage Grotesque (wordmark). Loading via `expo-font` adds ~200-400KB + a loading state. **Recommendation:** Load DM Sans + Sora. Skip Bricolage Grotesque (use a static image for the wordmark). Typography is a significant brand signal.

**Q2: NativeWind adoption?**
Would reduce Tailwind→RN translation gap. But: 2,800 lines of existing inline styles would need migration. **Recommendation:** Defer. It's a refactoring project, not a design parity prerequisite. Revisit after parity is achieved.

**Q3: Priority order after token update?**
The token update makes all screens inherit new colors simultaneously. Then implement specs in business priority order. Suggested: mobile-my-learnings → mobile-tag-management → mobile-profile-editing → mobile-4-tier-visibility → mobile-re-learning (follows dependency order from specs).

**Q4: 4th bottom tab vs. segment toggle?**
`mobile-my-learnings.md` proposes a 4th tab ("My Learnings"). But FeedScreen already has a working segment toggle (Social Feed / My Learnings). The toggle is built and tested; a 4th tab is a navigation architecture change. **Needs a UX decision before implementation.**

**Q5: Visual parity verification?**
No automated visual regression testing exists. **Recommendation:** Manual side-by-side comparison (web screenshot vs. mobile simulator), documented in PR descriptions with before/after screenshots. Maestro screenshot comparison is possible but not yet configured for visual diff.

---

## Execution Sequence

```
1. Build `mobile-design-system` skill                    [prerequisite, 1 session]
2. Update tokens.ts + add font loading                   [prerequisite, 1 session]
3. Update 7 UI components (Button, Card, Text, etc.)     [1 session]
4. Visual QA pass on 8 State A screens                   [2-3 sessions]
5. Implement mobile specs in priority order               [1-2 sessions each, 5 specs]
6. Build State B screens as needed                        [1 session each]
```

**Total estimate:** ~12-16 sessions for full mobile visual + feature parity.

---

## Critical Files

| File | Role |
|------|------|
| `mobile/src/theme/tokens.ts` | Foundation — must be updated first |
| `web/src/app/globals.css` | Source of truth for Library at Dusk colors |
| `web/tailwind.config.ts` | Full semantic color mapping to replicate |
| `.claude/agents/pixl.md` | Visual design agent (already mobile-aware) |
| `.claude/agents/hedy.md` | Mobile engineering agent |
| `mobile/src/components/ui/*.tsx` | 7 UI primitives to update |
