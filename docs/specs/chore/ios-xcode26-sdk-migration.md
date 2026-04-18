# iOS 26 SDK / Xcode 26 Build-Chain Migration

> **Status:** In Progress
> **Reviewed:** 2026-04-17
> **Created:** 2026-04-17
> **Implemented:** _pending_

---

## Context

Apple issued **ITMS-90725** alongside the accepted build 1.0.21 (2026-04-16): all iOS submissions on or after **2026-04-28** must be built with the iOS 26 SDK (Xcode 26). The current EAS build environment is Xcode 16.x.

A secondary constraint couples this deadline to a package pin: `expo-image-picker` is pinned at exactly `55.0.4` in `mobile/package.json` because `55.0.5+` introduced `PHAsset.contentType` / `PHAssetResource.contentType` calls inside an `#available(iOS 26.0, *)` block in `MediaHandler.swift`. Swift type-checks both branches of `#available` against the active SDK — under Xcode 16.x this causes a compile failure. The pin is a workaround that must be removed once EAS ships a Xcode 26 build image.

**Migration is gated on EAS releasing a Xcode 26 image.** Until that image is available, the pin must stay.

**Fallback:** If the EAS Xcode 26 image is not available by 2026-04-25, submit the four compliance fixes (Specs B/C/D + photo string) using the current Xcode 16.x image before 2026-04-28. This chore lands as a post-deadline follow-up binary refresh.

**Related:**
- `docs/plans/apple-rejection-2026-04-17.md` — remediation plan (item 5)
- `docs/ROADMAP.phase-1.md:602` — ITMS-90725 milestone item
- `mobile/CLAUDE.md` — expo-image-picker pitfall entry (added 2026-04-15)

---

## Requirements

### Functional

- [ ] FR1 (Must Have): Monitor `https://expo.dev/changelog` for an EAS build image that includes Xcode 26. Check by **2026-04-22** at the latest.
- [ ] FR2 (Must Have): When the Xcode 26 EAS image is confirmed available, add `"image": "<xcode-26-image-name>"` to the `ios` block of both the `production` and `preview` build profiles in `mobile/eas.json`.
- [ ] FR3 (Must Have): Remove the exact-version pin on `expo-image-picker` (`55.0.4`) from `mobile/package.json`; upgrade to the latest compatible version (Expo SDK 53 range). The literal string written to `package.json` must be a valid npm semver tilde range: `~55.0.5` (resolves `>=55.0.5 <55.1.0`). Verify the current latest `55.x` patch on npmjs.com before committing and use at least `~55.0.5`.
- [ ] FR4 (Must Have): Run `npm install --legacy-peer-deps` in `mobile/` after the version change and commit the updated `package-lock.json`.
- [ ] FR5 (Must Have): Run `expo prebuild --clean` to regenerate the native iOS project against the updated package.
- [ ] FR6 (Must Have): Trigger an EAS Preview iOS build with the new image; smoke-test image picker on a physical iOS device before marking verified.
- [ ] FR7 (Should Have): Update the `expo-image-picker` pitfall entry in `mobile/CLAUDE.md` to document that the pin was lifted and record the Xcode 26 image name used.
- [ ] FR8 (Could Have): Add the Xcode 26 image to the `simulator` profile as well (for local iOS simulator workflows on macOS).

### Non-Functional

- [ ] NFR1: No user-visible behavior change — this is a build-chain migration only.
- [ ] NFR2: Android builds must be unaffected. The `expo-image-picker` bug is iOS-only Swift; Android produces no code from `MediaHandler.swift`.
- [ ] NFR3: Expo SDK 53 compatibility must be maintained. Upgrading `expo-image-picker` must not pull in an Expo SDK 54+ dependency.
- [ ] NFR4: EAS `npm ci` must continue to pass. After upgrading, verify `package-lock.json` reflects the new version with `legacy-peer-deps=true` (already set in `mobile/.npmrc`).
- [ ] NFR5: Deadline gate — any iOS submission on or after 2026-04-28 MUST use the Xcode 26 image. Missing this deadline = Apple rejection.

---

## Technical Constraints

**Stack:** Mobile + Infrastructure (EAS Build)

**Technologies:**
- Expo SDK 53 (`~53.0.0`)
- expo-image-picker (currently pinned `55.0.4`; target `~55.0.5` post-upgrade — valid npm tilde range, resolves `>=55.0.5 <55.1.0`)
- EAS Build CLI (`>= 12.0.0`)
- Xcode 26 EAS image (name TBD — monitor expo.dev/changelog)

**Integration Points:**
- `mobile/eas.json` — build profiles that specify the EAS image
- `mobile/package.json` / `mobile/package-lock.json` — package pin removal
- `mobile/plugins/` — config plugins are unaffected (no plugin for image picker version)
- EAS cloud build pipeline — `npm ci` gate; `.npmrc` already sets `legacy-peer-deps=true`

**Out of Scope:**
- Backend changes — none required.
- Web changes — none required.
- User-visible UI changes — none; image picker behavior is identical.
- iOS purpose-string wording — covered by Spec A (photo purpose string, separate task in `feat/apple-reject-quickfixes`).
- `development` profile iOS image — dev client builds don't go to App Store; lower priority.

---

## Acceptance Criteria

### AC1: Xcode 26 image confirmed and eas.json updated
**GIVEN** the EAS Xcode 26 build image has been announced on expo.dev/changelog  
**WHEN** the `production` iOS profile in `mobile/eas.json` is inspected  
**THEN** it contains an `"image"` key whose value matches the announced Xcode 26 image name  
**AND** the `preview` iOS profile contains the same `"image"` key

### AC2: expo-image-picker pin removed
**GIVEN** `mobile/package.json` before this change has `"expo-image-picker": "55.0.4"`  
**WHEN** this chore is implemented  
**THEN** `package.json` has a tilde range of the form `~55.0.N` where `N >= 5` (e.g. `"~55.0.5"`) — NOT the exact pin `55.0.4` and NOT a loose `>=` range  
**AND** the installed version in `node_modules` is `>= 55.0.5` and `< 55.1.0`

### AC3: EAS Preview iOS build succeeds under Xcode 26
**GIVEN** `eas.json` references the Xcode 26 image  
**WHEN** `eas build --platform ios --profile preview` is triggered  
**THEN** the build completes without Swift compile errors  
**AND** the build log shows the Xcode 26 image was used (confirm in EAS build dashboard)

### AC4: Image picker functional on physical iOS device
**GIVEN** the EAS Preview IPA is installed on a physical iOS device  
**WHEN** the user navigates to Profile → avatar edit → selects a photo from library  
**THEN** the system photo picker opens, a photo is selectable, and the chosen image is reflected in the avatar preview  
**AND** no crash or error occurs

### AC5: Android unaffected
**GIVEN** the package version bump  
**WHEN** `eas build --platform android --profile preview` is triggered  
**THEN** the build completes successfully with no new warnings or errors

### AC6: Fallback — Xcode 16.x submission before deadline (conditional)
**GIVEN** the EAS Xcode 26 image is NOT available by 2026-04-25  
**WHEN** this scenario is reached  
**THEN** the compliance PRs (Specs B/C/D + photo string) are submitted to App Store Connect with the Xcode 16.x image before 2026-04-28  
**AND** this chore is noted as a follow-up binary-refresh submission

---

## Implementation Approach

### Architecture

Pure configuration change — no application code is modified. Two files change:

1. **`mobile/eas.json`** — adds `"ios": { "image": "<xcode-26-image>" }` under `production` and `preview` build profiles. The exact image name comes from the EAS changelog announcement.
2. **`mobile/package.json`** — removes the exact-version pin `"expo-image-picker": "55.0.4"` and replaces it with the latest SDK 53-compatible range. Check `https://www.npmjs.com/package/expo-image-picker` for the current latest in the `55.x` range.

After editing both files: `npm install --legacy-peer-deps` regenerates `package-lock.json`. Then `expo prebuild --clean` regenerates the native iOS project against the new package.

### EAS Image Name Discovery

The image name follows EAS naming conventions, e.g.:
- Xcode 16.x: `"macos-sequoia-15.2-xcode-16.2"` (hypothetical example)
- Xcode 26.x: check https://expo.dev/changelog or the [EAS build reference docs](https://docs.expo.dev/build-reference/infrastructure/) for the exact string

Do NOT guess the image name — use only the value announced in the official changelog.

### Test Strategy

- [ ] Infrastructure only — TDD not applicable. Verification is build-pipeline and manual smoke-test based.

Verification steps (manual, post-implementation):
1. EAS Preview iOS build completes (AC3)
2. Physical device smoke test: avatar image picker (AC4)
3. EAS Preview Android build completes unmodified (AC5)

### File Changes

**Modified:**
- `mobile/eas.json` — add `"image"` to `production` and `preview` iOS profiles
- `mobile/package.json` — remove exact pin on `expo-image-picker`; set range
- `mobile/package-lock.json` — regenerated by `npm install --legacy-peer-deps`
- `mobile/CLAUDE.md` — update pitfall entry to record resolution + image name

**Regenerated and committed (`ios/` is tracked in this repo):**
- `mobile/ios/` — `expo prebuild --clean` output; **must be committed**. The root `.gitignore` tracks `mobile/ios/` and only excludes specific sub-paths (`Pods/`, `build/`, `.xcode.env.local`, `*.xcworkspace`, `*.xcuserstate`). The regenerated sources (`AppDelegate.swift`, `Info.plist`, project files, etc.) are version-controlled. Commit the full `mobile/ios/` diff as part of Task 1.

---

## Implementation Plan

> This spec has 2 atomic tasks. Simple enough for a single session if the engineer has the image name in hand. Both tasks are blocked until the EAS Xcode 26 image is announced.

### Task 1: Unpin expo-image-picker and adopt Xcode 26 EAS image
- **Files:** `mobile/package.json`, `mobile/package-lock.json`, `mobile/eas.json`, `mobile/ios/` (tracked — see File Changes)
- **Depends on:** _none_ (but blocked externally until EAS announces the Xcode 26 image)
- **Steps:**
  1. Confirm Xcode 26 EAS image name from expo.dev/changelog
  2. Edit `mobile/eas.json`: add `"ios": { "image": "<image-name>" }` to `production` and `preview` profiles
  3. Edit `mobile/package.json`: replace `"expo-image-picker": "55.0.4"` with `~55.0.N` where N is the latest patch `>= 5` (check npmjs.com); use `~55.0.5` as the floor
  4. Run `npm install --legacy-peer-deps` in `mobile/` to regenerate lockfile
  5. Run `expo prebuild --clean` to regenerate native iOS project into `mobile/ios/`
  6. Stage and commit `mobile/ios/` along with the other changed files (`ios/` is tracked in this repo — see File Changes)
- **Commit:** `chore(mobile): unpin expo-image-picker, adopt Xcode 26 EAS build image`
- **Stack:** mobile / infra

### Task 2: Update CLAUDE.md pitfall entry
- **Files:** `mobile/CLAUDE.md`
- **Depends on:** Task 1 (image name must be known)
- **Steps:**
  1. Find the pitfall entry starting "**`expo-image-picker@55.0.5+` breaks iOS EAS builds under Xcode < 26**"
  2. Append a resolution note: pinned removed as of `[date]`, Xcode 26 image `<image-name>` adopted, `expo-image-picker` version upgraded to `<version>`
- **Commit:** `docs(mobile): record expo-image-picker Xcode 26 migration resolution`
- **Stack:** docs / mobile

---

## Dependencies

**Blocked by:**
- EAS / Expo team releasing a Xcode 26 build image — monitor https://expo.dev/changelog (check by 2026-04-22)
- None of the other Apple rejection specs (B/C/D) block this chore

**Blocks:**
- Final App Store resubmission with iOS 26 SDK (required for any submission on/after 2026-04-28)

**External:**
- Apple ITMS-90725 deadline: **2026-04-28**
- Fallback decision point: **2026-04-25** — if EAS image not yet available, submit Xcode 16.x binary with compliance fixes before the deadline

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- _pending_

### Architectural Decisions

_None — configuration-only change._

### Deviations from Spec
- _pending_

### Lessons Learned
- _pending_
