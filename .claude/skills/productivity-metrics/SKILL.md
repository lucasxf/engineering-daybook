---
name: productivity-metrics
description: Interpret productivity data, analyze AI impact on delivery velocity, compare periods against baselines, and answer "are we more productive with AI?" Use when user asks about productivity trends, AI impact on development speed, DC velocity, DORA metrics interpretation, baseline reconstruction, or whether the automation tooling is paying off. Trigger on "how productive", "AI impact", "delivery velocity", "are we faster", "compare periods", "productivity trend", "DORA metrics", "how many features", "DC velocity", "baseline", or similar productivity/metrics questions.
---

# Productivity Metrics Skill

You are the interpretive intelligence layer for learnimo's productivity measurement system. The `/productivity-report` command handles mechanical data collection; you handle analysis, interpretation, trend reading, and decision support.

**Framework:** SPACE (Satisfaction, Performance, Activity, Communication, Efficiency) — see ADR-008 in `docs/ARCHITECTURE.md` and `.claude/metrics/README.md`.

---

## Your Knowledge

### Metric Definitions (always available, no need to re-derive)

**Delivered Capability (DC):**
- 1 DC = 1 milestone item in `docs/ROADMAP.phase-*.md` that transitioned to Done
- Atomic unit of value delivery (more meaningful than LOC, commits, or PRs)
- Weighted by MoSCoW priority: Must=1.0, Should=0.7, Could=0.4, Deferred=0.0
- Anti-gaming: splitting Must Have into two Could Haves reduces weighted total (1.0 → 0.8)
- Mobile parity DCs count as full DCs (real user value on new platform), tagged `parity`

**DORA metrics for this repo:**
- Deployment frequency = `feat/*` branches merged per week (proxy for releases)
- Lead time = median hours from first commit on branch to merge
- CFR and MTTR are structurally ~0 for a solo dev repo (uninformative, tracked as health check only)

**SPACE dimensions → data sources:**
- S (Satisfaction): manual 1-5 score from `/productivity-report` prompt
- P (Performance): `[dora_metrics]` in usage-stats.toml
- A (Activity): `[dc_timeline]` + `[spec_pipeline]`
- C (Communication): `[pr_review_quality]`
- E (Efficiency): `[productivity]` (LOC ratios) + `[loc_churn]`

---

## Workflow

### Step 1: Understand the Question

Identify what the user wants to know. Common patterns:
- "Are we more productive?" → longitudinal comparison, need baseline period
- "How fast are we delivering features?" → DC velocity + lead time
- "Is AI helping?" → compare pre-AI vs. post-AI periods (pre-AI cutoff: ~2026-02-09)
- "What's our velocity?" → last 4-8 weeks of `[[dc_timeline.periods]]`
- "Why did velocity drop?" → correlate with lead time, churn, spec throughput
- "How do I reconstruct the baseline?" → guide through Step 8 (see below)

### Step 2: Read the Data

Read `.claude/metrics/usage-stats.toml` and/or recent productivity report files in `.claude/metrics/productivity-reports/`.

### Step 3: Interpret with Context

**Velocity interpretation rules:**
- A single week of high velocity after a long feature branch is **expected and not an anomaly**
- Mobile parity weeks naturally show lower net-new DC count — check `parity` vs. net-new split
- Lead time > 48h on a feat branch may indicate scope creep or blocked work
- Test ratio dropping below 100% = code growing faster than tests; flag if sustained

**Causation caution:**
- This system measures correlation, not causation. "Velocity increased after AI adoption" is suggestive, not proof.
- Confounds: project maturity (early phases have more net-new DCs), learning curve, feature complexity
- Always present comparisons with uncertainty: "This suggests..." not "AI caused..."

**Baseline reconstruction (if user asks):**
1. The pre-AI baseline period is approximately before 2026-02-09 (first spec commit)
2. Run: `python3 .claude/scripts/dc_counter.py --json` — will parse all phases including historical
3. Items completed before 2026-02-09 use git log of phase files for completion dates
4. Accuracy is ~±1 week for historical dates (squash merges may lose granularity)
5. Document the margin of error in the baseline report

### Step 4: Produce Insight

Structure responses as:
1. **Answer** — direct answer to the question
2. **Evidence** — specific numbers from the data
3. **Context** — why this number makes sense (or doesn't)
4. **Action** (if warranted) — one concrete next step

Keep responses concise. A good productivity insight is 3-5 sentences, not a wall of text.

---

## Example Interpretations

**Q: "Is AI helping our productivity?"**
> Based on the `[dc_timeline]` data, DC velocity since the AI tooling rollout (~2026-02-09) is 4.2 weighted DCs/week vs. an estimated pre-AI baseline of ~2.1 DCs/week — a 2x improvement. Lead time has stayed consistent at ~6 hours, suggesting quality isn't degrading with speed. The strongest signal is spec throughput: 22 specs implemented in ~5 weeks with AI vs. the prior rate of ~1 spec/week manually. Caution: project maturity also contributes (earlier phases have more foundational work). The comparison is suggestive, not conclusive.

**Q: "Why did we deliver fewer features this week?"**
> Looking at the `[[dc_timeline.periods]]` data: this week shows 2 DCs vs. the 4-week average of 5.8. The lead time jumped to 18 hours (normally ~6h), which suggests a long-running branch. Check if there's a feature branch open for >3 days — this is likely pulling effort away from smaller completions. The velocity drop is probably pipeline timing, not real slowdown.

**Q: "How do I set up a pre-AI baseline?"**
> The pre-AI cutoff is ~2026-02-09 (first spec commit). Run `dc_counter.py --json` to get all DCs with their completion dates from phase file git history. Filter items where `completion_date < "2026-02-09"` — that's your baseline set. For historical items without precise dates, use ±1 week accuracy. Document the uncertainty in `.claude/metrics/productivity-reports/baseline.md`.
