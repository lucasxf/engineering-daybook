# Plan: Resolve App Store Connect Rejection (2026-04-17)

## Context

Apple rejected learnimo iOS submission (v1.0, build on versionCode 28) on 2026-04-17 citing **four distinct guideline violations**. All four are hard gates — none can be waived; all must land before a new binary is accepted.

Review source of truth: `mobile/store-assets/reviews/2026-04-17-app-store-connect-review.md`.

| # | Guideline / Notice | Issue (one-line) | Depth |
|---|--------------------|-------------------|-------|
| 1 | 5.1.1(ii) | Photo library purpose string is the Expo default — doesn't explain *how* or give a specific example | Mechanical fix |
| 2 | 1.5 | Support URL points at GitHub issues, not a functional support webpage | Small feature (web) |
| 3 | 5.1.1(v) | No account-deletion flow anywhere (no endpoint, no UI) | Full feature (backend + mobile) |
| 4 | 4.8 | Google Sign-In exists but Sign in with Apple is not offered as an equivalent login option | Full feature (backend + mobile + Apple Developer Console) |
| 5 | **ITMS-90725 (deadline 2026-04-28)** | Previous build accepted with warning: **all iOS submissions on or after 2026-04-28 must be built with iOS 26 SDK / Xcode 26.** Current EAS image is Xcode 16.x. See `docs/ROADMAP.phase-1.md:602` and `mobile/CLAUDE.md:326` | Build-chain migration |

Exploration confirmed (verbatim findings):
- Zero references to `expo-apple-authentication`, `AppleAuthentication`, or an Apple sub on mobile or backend.
- No `@DeleteMapping` for users anywhere in the backend; `ProfileScreen.tsx` has only Logout, no delete button; `mobile/src/lib/auth.ts` has no `deleteAccountApi`.
- `mobile/app.json` plugin entry for `expo-image-picker` passes only `microphonePermission: false` — no `photosPermission` override, so the Expo default string is what iOS users see.
- Web has `/[locale]/privacy` but no `/support`, `/help`, or `/contact` route. Domain is `learnimo.net` (Vercel).
- Support URL in `docs/appstore-metadata.md` points at the repo's GitHub issues page (the exact value is in that file).
- `expo-image-picker` is pinned at **exactly `55.0.4`** in `package.json` because `55.0.5+` introduces `#available(iOS 26.0, *)` Swift code that fails to compile on Xcode 16.x (current EAS image). Pin was added 2026-04-15.
- Previous submission (build 1.0.21 / build 7, 2026-04-16) was *accepted* with ITMS-90725 warning; the current rejection is for the 4 guideline violations. The SDK deadline is a *separate* gate that lands during the remediation window.

---

## Strategy: SDD + Parallel Worktrees

This remediation is multi-layer, multi-feature, and three of the four items meet the project's SDD criteria (domain complexity, multi-layer work, new capabilities). Per `docs/CLAUDE.md`, SDD is the right workflow.

**Deliverables before any code is written:**
1. This plan file (already exported — you're reading it). Reference in every worktree session via `@docs/plans/apple-rejection-2026-04-17.md`.
2. **Three specs** under `docs/specs/features/` (and one under `docs/specs/chore/`), each produced via `/write-spec` and validated with `/review-spec`. The photo-string fix is mechanical and skips SDD.
3. **Four worktrees** so the features can proceed in parallel.

**Decisions already made:**
- Account deletion semantics: **anonymize user row + hard-delete content** (PII nulled, `deleted_at` set, unique indices become partial-on-active, all owned content cascaded away).
- Support URL: **new `/[locale]/support` page on learnimo.net** with `support@learnimo.net` as contact.
- Ship strategy: **two PR-worth of merges**, one App Store resubmission.
- Contact email: **support@learnimo.net** — user provisions mailbox/forwarder on Locaweb DNS before PR 1 deploys.

---

## Specs to Write

All specs live in `docs/specs/features/` (or `docs/specs/chore/`) and are authored via `/write-spec <name>`, reviewed via `/review-spec`, implemented via `/implement-spec`. Each spec includes an `## Implementation Plan` section so `/implement-spec` runs in orchestrator mode.

### Spec A — Photo purpose string *(SKIP SDD — mechanical fix)*
One-line config change in `mobile/app.json`. Bundle into the Support Page PR (PR 1).

### Spec B — `docs/specs/features/support-page.md`
Minimal spec. Covers:
- New route `web/src/app/[locale]/support/page.tsx`.
- Content: intro, `support@learnimo.net` (text + mailto), 3–5 FAQ entries (how to delete account, change handle, data privacy, theme/language, report a bug → link to GitHub issues), link back to `/privacy`.
- i18n keys in `web/src/i18n/en.json`, `pt-BR.json` under new namespace `support.*`.
- Update `docs/appstore-metadata.md` Support URL → `https://learnimo.net/en/support`.
- Visual parity with existing `/privacy` page layout.
- Playwright E2E: route reachable in both locales, renders contact email, renders FAQ entries.

### Spec C — `docs/specs/features/account-deletion.md`
Full spec — multi-layer. Covers:
- **Backend:** Flyway migration adding `users.deleted_at TIMESTAMPTZ` + convert `email` / `handle` unique indices to partial-on-`deleted_at IS NULL`. `DELETE /api/v1/users/me` endpoint (auth-required, idempotent, 204). `UserService.deleteAccount(userId)` transactional method: hard-delete POKs + PokTags + PokAuditLogs + Tags + PokShares + Follows + RefreshTokens + avatar blob; then anonymize user row (null PII, rewrite email/handle to `deleted-{id}@deleted.learnimo.net` / `deleted_{id}`, set `deleted_at`). JPA `@Where` on `User` entity to hide deleted rows from lookups. Unit + integration tests.
- **Mobile:** `deleteAccountApi()` in `src/lib/userApi.ts` or `auth.ts`. "Delete Account" destructive button in `ProfileScreen.tsx` below Logout with two-step confirmation (warning alert → typed-handle confirm). On success: `tokenStore.clear()` + `authFailureListener()`. i18n keys `profile.deleteAccount.*`. Screen test covering button render, confirm dismissal, success navigation, failure toast.
- **Apple resubmission artifact:** physical-device screen recording of create → navigate → delete → confirm, embedded in App Review Information notes.

### Spec D — `docs/specs/features/sign-in-with-apple.md`
Full spec — multi-layer + external config. Covers:
- **Apple Developer Console (user-driven setup):** enable Sign in with Apple capability on `net.learnimo.app`, create Services ID, generate `.p8` signing key, record Team ID + Key ID.
- **Backend:** Flyway migration adding `users.apple_sub VARCHAR(255) UNIQUE`. `AppleIdentityTokenVerifier` service that fetches + caches Apple's JWK set (15 min TTL) and validates `iss=https://appleid.apple.com` / `aud=net.learnimo.app` / not-expired / signature. Endpoint pair on `AuthMobileController`: `POST /api/v1/auth/mobile/apple` (existing user → JWT pair; new user → 409 `{requiresHandle, appleSub, email}`) and `POST /api/v1/auth/mobile/apple/complete`. Unit tests for verifier + integration tests for both endpoints.
- **Mobile (iOS only):** `npm install expo-apple-authentication --legacy-peer-deps`. Register plugin in `app.json`. New `src/hooks/useAppleAuth.ts` mirroring `useGoogleAuth.ts`. `src/components/auth/AppleSignInButton.tsx` using Apple's native `AppleAuthenticationButton` (custom styling = rejection risk). Wire into `LoginScreen`, `RegisterScreen`, `ChooseHandleScreen` above the Google button, iOS-gated. `appleLoginApi` + `completeAppleSignupApi` in `src/lib/auth.ts`.
- **Privacy policy update:** add Sign in with Apple data-handling paragraph to `web/src/app/[locale]/privacy/page.tsx`.

### Spec E — `docs/specs/chore/ios-xcode26-sdk-migration.md`
Short operational spec — build-chain migration. Covers:
- Monitor `https://expo.dev/changelog` for the Xcode 26 build image name. Check 2026-04-22 at latest.
- When EAS Xcode 26 image is released: unpin `expo-image-picker` from `55.0.4`, upgrade to latest compatible version, add `"image": "<eas-xcode-26-image-name>"` to `production` + `preview` iOS profiles in `mobile/eas.json`, run `expo prebuild --clean`, EAS Preview build on physical iOS device, update `mobile/CLAUDE.md` pitfall entry.
- Fallback if image NOT available by 2026-04-25: ship 4 compliance fixes with current Xcode 16.x image, submit before 2026-04-28, PR 3 lands whenever image releases.
- No user-visible behavior change.

---

## Worktrees & Parallelism

| Worktree | Branch | Scope | Spec |
|----------|--------|-------|------|
| `.claude/worktrees/feat/apple-reject-quickfixes` | `feat/apple-reject-quickfixes` | Photo string + Support page | Spec B |
| `.claude/worktrees/feat/account-deletion` | `feat/account-deletion` | Backend + mobile delete-account | Spec C |
| `.claude/worktrees/feat/sign-in-with-apple` | `feat/sign-in-with-apple` | Backend + mobile Sign in with Apple | Spec D |
| `.claude/worktrees/chore/ios-xcode26-sdk` | `chore/ios-xcode26-sdk` | `expo-image-picker` unpin + Xcode 26 EAS image | Spec E |

All four worktrees are independent. Known merge conflict risk: `UserService` (Specs C + D); `mobile/src/lib/auth.ts` (Specs C + D). Resolve on merge of whichever lands second.

Run `npm install --legacy-peer-deps` in each worktree's `mobile/` and `web/` before first test/lint. Use unique Playwright ports per worktree to avoid cross-server false-positives.

---

## Progress Tracker

Status values: `not started` · `spec drafted` · `spec reviewed` · `in progress` · `PR open (#)` · `merged` · `verified on EAS Preview` · `shipped`

| # | Track | Spec file | Worktree | PR | Status |
|---|-------|-----------|----------|----|--------|
| 1 | Photo purpose string | — (mechanical) | `feat/apple-reject-quickfixes` | — | not started |
| 2 | Support page + metadata | `docs/specs/features/support-page.md` | `feat/apple-reject-quickfixes` | — | not started |
| 3 | Account deletion | `docs/specs/features/account-deletion.md` | `feat/account-deletion` | — | not started |
| 4 | Sign in with Apple | `docs/specs/features/sign-in-with-apple.md` | `feat/sign-in-with-apple` | — | not started |
| 5 | iOS 26 SDK / Xcode 26 (**deadline 2026-04-28**) | `docs/specs/chore/ios-xcode26-sdk-migration.md` | `chore/ios-xcode26-sdk` | — | blocked on EAS image release |
| 6 | App Store resubmission | — | (develop, post-merge) | — | blocked on 1–5 |

**External prerequisites:**
- [ ] `support@learnimo.net` mailbox/forwarder provisioned on Locaweb DNS (blocks PR 1 deploy)
- [ ] Sign in with Apple capability enabled on `net.learnimo.app` App ID
- [ ] Apple Services ID created; `.p8` signing key generated; Team ID + Key ID in secret store
- [ ] EAS Xcode 26 build image released — monitor https://expo.dev/changelog (check by 2026-04-22)
- [ ] New iOS build uploaded via EAS with bumped `version` + `buildNumber` (before 2026-04-28 if using Xcode 16.x)
- [ ] Physical-device screen recording of delete-account flow embedded in App Review Information notes

---

## Execution Playbook

### Phase 0 — Bootstrap (run from develop branch)
```bash
git worktree add .claude/worktrees/feat/apple-reject-quickfixes -b feat/apple-reject-quickfixes develop
git worktree add .claude/worktrees/feat/account-deletion -b feat/account-deletion develop
git worktree add .claude/worktrees/feat/sign-in-with-apple -b feat/sign-in-with-apple develop
git worktree add .claude/worktrees/chore/ios-xcode26-sdk -b chore/ios-xcode26-sdk develop
```

### Phase 1 — Specs (parallel across worktree sessions)
In each worktree's Claude session:
```
@docs/plans/apple-rejection-2026-04-17.md
/write-spec <name>
/review-spec docs/specs/features/<name>.md
```

### Phase 2 — Implementation (parallel, per worktree, after spec is Approved)
```
/implement-spec <path-to-spec>
/finish-session "Implemented <name>"
/create-pr
```

Quickfixes worktree exception: no spec for photo string — edit `mobile/app.json` directly per Spec A description above, then proceed with Spec B implementation.

Xcode 26 worktree exception: blocked until EAS Xcode 26 image is announced.

### Phase 3 — Merge + Resubmit

**Decision point by 2026-04-25:** is the EAS Xcode 26 build image available?

**Scenario A — image available:** merge all PRs → `develop` → `main`. EAS production iOS build with Xcode 26 image. Bump `version` + `buildNumber` + `versionCode`. Submit to App Store Connect with Support URL updated and delete-flow recording attached.

**Scenario B — image not yet available:** merge PRs 1 + 2 → `develop` → `main`. EAS production iOS build with current Xcode 16.x image. Submit by **2026-04-26** (48 h before deadline). PR 3 (Xcode 26) lands whenever image releases as a follow-up binary-refresh submission.

---

## Verification Summary

| Issue | Gate |
|-------|------|
| Photo string | `expo prebuild --clean` → grep `NSPhotoLibraryUsageDescription` in generated `ios/learnimo/Info.plist` |
| Support URL | `https://learnimo.net/en/support` + `pt-BR/support` load on Vercel; test email arrives at `support@learnimo.net` |
| Account deletion | Backend integration test (204, content gone, user anonymized, re-login fails, email/handle reusable); physical-device recording |
| Sign in with Apple | Backend integration tests green; physical iOS device: first-time + returning user + "Hide my email"; button absent on Android |
| Xcode 26 SDK | Image picker functional on physical iOS device after `expo-image-picker` upgrade; EAS build completes under Xcode 26 |
| All | `mvn verify` + `npm test` + Playwright E2E + CI green on `develop` |
| All | EAS Preview IPA smoke test on physical iOS before every production build |

---

## Out of Scope

- Play Store listing changes (not rejected).
- Sign in with Apple on web (Apple 4.8 is iOS-only).
- iOS purpose string localization (accept single English string for now).
- Account-deletion UI on web (not an App Store gate; follow-up if needed).
