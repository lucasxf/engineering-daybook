# Changelog

## 1.0.0 (2026-03-07)


### Features

* add displayName to Tag TypeScript interfaces and tagId to PokSearchParams (web + mobile) ([879cf40](https://github.com/lucasxf/engineering-daybook/commit/879cf407bcfe5f49d6a2986511581bf266d4079f))
* add markdown rendering to mobile (8.1.6, 8.1.7) ([651dc75](https://github.com/lucasxf/engineering-daybook/commit/651dc758f10f80c77f973c9469b1ecb978275097))
* add visibility picker and badge to mobile learning screens ([6ec8885](https://github.com/lucasxf/engineering-daybook/commit/6ec8885cd16a20082b8671ba10a96e1d27898c40))
* auth context and navigation shell (AC1, AC7-AC8) ([39a5925](https://github.com/lucasxf/engineering-daybook/commit/39a59254138220128b6700541fd847b066cb5f3d))
* create and detail screens (FR11-FR16, FR25) ([a28f919](https://github.com/lucasxf/engineering-daybook/commit/a28f919610cac72ce127b6c7994574d163b2b155))
* extend mobile auth/userApi types and add Avatar component ([3712083](https://github.com/lucasxf/engineering-daybook/commit/371208375d582be52209b5ed43f72d9c340640a7))
* extend ProfileScreen with avatar, display name, and bio (mobile) ([7b9c5e8](https://github.com/lucasxf/engineering-daybook/commit/7b9c5e8e6b5d42bd39c5fd603b773ef5ebcebdd4))
* Following & Colleagues — Milestone 6.1 ([2b02ccc](https://github.com/lucasxf/engineering-daybook/commit/2b02cccdacd70442e81e89349ff08cca5006bd17))
* Learner Profiles (Milestone 6.3) — avatar, bio, display name, public profile ([0251951](https://github.com/lucasxf/engineering-daybook/commit/0251951294bd9c7ae45e9cd0e4817fd828b91ce5))
* learning feed with search (FR17-FR24) ([02950ca](https://github.com/lucasxf/engineering-daybook/commit/02950cab414f2742a356a8d49bc2a42d0c475dcc))
* markdown support for POK content (Milestone 8.1) ([65f9b77](https://github.com/lucasxf/engineering-daybook/commit/65f9b779c9f057dbe0e1d409d4752759e8828bb1))
* Milestone 3.3 mobile app + RISK-1 security fix + tooling improvements ([68878b9](https://github.com/lucasxf/engineering-daybook/commit/68878b9ccda3393cbe80de19171dfd7905fefaee))
* Milestones 8.1 (Markdown) + 8.2 (Tag Improvements) + metrics fixes ([4d0e2c0](https://github.com/lucasxf/engineering-daybook/commit/4d0e2c09a61c0b3266b7209954946bc9bd2e9382))
* mobile app — Expo/React Native (Milestone 3.3) ([323ccaf](https://github.com/lucasxf/engineering-daybook/commit/323ccaf2328f6563aed81bf086ad54691db5a15f))
* **mobile:** add privacy settings section to ProfileScreen ([16668ee](https://github.com/lucasxf/engineering-daybook/commit/16668eebbc2080cd5e42db50039ee83f89bb73b0))
* Phase 5 Privacy System — POK visibility controls + learner profile privacy (5.1 & 5.2) ([2ac2309](https://github.com/lucasxf/engineering-daybook/commit/2ac230908d178b4e1765a524fb4c8a4833f7e15a))
* POK visibility controls (milestone 5.1) ([ee317ca](https://github.com/lucasxf/engineering-daybook/commit/ee317ca28db67a8acc4f72425e672397032ce6e6))
* **privacy:** Milestone 5.2 — Learner Profile Privacy ([a96799f](https://github.com/lucasxf/engineering-daybook/commit/a96799f9ef29eba22d37d3f6b41a74a3c5b03b6a))
* render displayName in mobile tag components (LearningDetailScreen + LearningCard) ([b5e5966](https://github.com/lucasxf/engineering-daybook/commit/b5e59660200abae37492986c0a82c5fb457a6f0e))
* tag improvements (Milestone 8.2) — displayName, spaces→dashes, feed filter ([8b87531](https://github.com/lucasxf/engineering-daybook/commit/8b8753185d081b9c5ad5730a4a33556f967e3000))
* theme tokens and i18n (AC23-AC26) ([7799b83](https://github.com/lucasxf/engineering-daybook/commit/7799b8338ef98699ffa88f682693cbb52850b236))
* token store and mobile API client (AC4-AC6) ([51761dd](https://github.com/lucasxf/engineering-daybook/commit/51761ddf668ecc0b4d499bb22437ec4a3a687c07))
* UI primitives and auth screens (FR5, FR6, FR10) ([8c484c7](https://github.com/lucasxf/engineering-daybook/commit/8c484c774370348fd8cbfc2732931173f048c692))


### Bug Fixes

* address PR [#118](https://github.com/lucasxf/engineering-daybook/issues/118) review feedback ([0fc8544](https://github.com/lucasxf/engineering-daybook/commit/0fc8544e8654f493ffbd7c59a561f65f0cf9bbc1))
* address PR [#130](https://github.com/lucasxf/engineering-daybook/issues/130) review feedback ([46e8042](https://github.com/lucasxf/engineering-daybook/commit/46e8042b13ab29e53554067c8658947d1c8444cb))
* address PR [#132](https://github.com/lucasxf/engineering-daybook/issues/132) review comments (jest regex overlap + snake_case stripping) ([546e2de](https://github.com/lucasxf/engineering-daybook/commit/546e2de7de466f5da6d88f0cc76d728edaf5e991))
* address PR [#92](https://github.com/lucasxf/engineering-daybook/issues/92) review feedback ([34fe8ad](https://github.com/lucasxf/engineering-daybook/commit/34fe8ad3e2d9f11a032cb533355dfc881810bd9e))
* address PR [#94](https://github.com/lucasxf/engineering-daybook/issues/94) review feedback ([788f30f](https://github.com/lucasxf/engineering-daybook/commit/788f30f6d96e1ff91cb1691183c607cd477ff2e3))
* address PR [#94](https://github.com/lucasxf/engineering-daybook/issues/94) review feedback (mobile bugs + backend test robustness) ([fc241e8](https://github.com/lucasxf/engineering-daybook/commit/fc241e8955be8802889582b0ef852bf37233062c))


### Documentation

* add mobile pitfalls from PR [#94](https://github.com/lucasxf/engineering-daybook/issues/94) review fixes ([9fcff5a](https://github.com/lucasxf/engineering-daybook/commit/9fcff5ae9687b110572993a6fab1e7b59bedd8c6))
* add stripMarkdown underscore pitfall to web/mobile CLAUDE.md ([aae4648](https://github.com/lucasxf/engineering-daybook/commit/aae4648e17c937c35b6197306935c1221ccbcac4))
* complete Milestone 6.3 Learner Profiles — update roadmap, docs, and learnings ([ee4e439](https://github.com/lucasxf/engineering-daybook/commit/ee4e439a7b174a3f21b9d4998d88995764fc0b3f))
* document useNavigation typing pitfall in mobile CLAUDE.md ([b039c6e](https://github.com/lucasxf/engineering-daybook/commit/b039c6e0a080db0ee1e8b0f79d88217148ff1d25))
* update mobile CLAUDE.md with full implementation context ([b46a67e](https://github.com/lucasxf/engineering-daybook/commit/b46a67e471acc0c367b9391fab5d6d21dd8f8d6b))
* update roadmap and CLAUDE.md for Milestone 8.1 completion ([c774432](https://github.com/lucasxf/engineering-daybook/commit/c77443251e10add6d7232c86ecd822b9ce32ae21))
* update roadmap, README, and API docs for milestone 5.1 completion ([572c8e8](https://github.com/lucasxf/engineering-daybook/commit/572c8e8e4ec5cd80ce30c403adc69e3e3bff8e62))


### Tests

* add unit tests for mobile markdown components (8.1.9) ([fe20dff](https://github.com/lucasxf/engineering-daybook/commit/fe20dff3d62a00ed73df3a7804e63262332d0d9b))
* fix search() 12-arg signature and Tag displayName in test fixtures ([ecdcedf](https://github.com/lucasxf/engineering-daybook/commit/ecdcedf23f6dc8bf3e72b93da9cb1885dd7ac8e8))
* Maestro E2E flows (AC28-AC30) ([6246dc3](https://github.com/lucasxf/engineering-daybook/commit/6246dc3ffd398ecb60e91459c640a4f5415adba5))
