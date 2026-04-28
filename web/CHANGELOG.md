# Changelog

## 1.0.0 (2026-04-28)


### Features

* add /[locale]/support page ([b4fd4bc](https://github.com/lucasxf/engineering-daybook/commit/b4fd4bc6d9608779dc9004bfb6e89b14dae4a654))
* add /[locale]/support page with site-wide footer (App Store guideline 1.5) ([37093ce](https://github.com/lucasxf/engineering-daybook/commit/37093ced51656e4d13a9031f3ab9ac8c2c34eab7))
* add demo page with translations and i18n architecture ([991eaf0](https://github.com/lucasxf/engineering-daybook/commit/991eaf04595a7a2658669e4e016e5987d7826131))
* add per-file quality gates via PostToolUse hook (M1–M6) ([9db275a](https://github.com/lucasxf/engineering-daybook/commit/9db275a3b41b8466c687dae4ef38d9c4188f16cc))
* add prompt-optimizer skill for Opus/Sonnet prompt engineering ([cbbfe31](https://github.com/lucasxf/engineering-daybook/commit/cbbfe3160ad38477bf36b954866c486bf169b8fa))
* add public demo route for edit-learning without auth ([cd5863a](https://github.com/lucasxf/engineering-daybook/commit/cd5863aa2384eb8914d5c5f177f55f212f508a8b))
* add site-wide footer with Privacy and Support links ([d6c868b](https://github.com/lucasxf/engineering-daybook/commit/d6c868b90c178748c6ebcb53507a0aaea31baca2))
* add spec pipeline health metric to /compile-metrics ([77d59a6](https://github.com/lucasxf/engineering-daybook/commit/77d59a6a62302c01dcf3dc394da757e720da10b6))
* add support page i18n keys and update App Store support URL ([a2e0d2d](https://github.com/lucasxf/engineering-daybook/commit/a2e0d2d68d0481003d93abaab92b41ee43d9c77d))
* Apple App Store compliance — account deletion, Sign in with Apple, support page, Xcode 26 SDK ([b7bd86f](https://github.com/lucasxf/engineering-daybook/commit/b7bd86f5e7c471969512e8c1b4292d00137d4624))
* **auth:** Sign in with Apple — backend + mobile ([77090ec](https://github.com/lucasxf/engineering-daybook/commit/77090ecf2c93f9c0803727ec1ca243ea0d04700f))
* complete screen redesign migration (Edit Learning, Settings, Learner Profile) ([2f247c4](https://github.com/lucasxf/engineering-daybook/commit/2f247c491cadb49641cb1db4ec52626049955b37))
* create demo page with internationalization and theming support ([f7ae1ae](https://github.com/lucasxf/engineering-daybook/commit/f7ae1ae17abd584c3513967ac832c3ce16411683))
* implement Learner Profile screen with dark/light mode, skeleton states, and accessibility ([30edf70](https://github.com/lucasxf/engineering-daybook/commit/30edf70f52de56d95b145f7b9ba5cac4ffbc9e9a))
* implement View Learning screen with design system and i18n support ([2e9e592](https://github.com/lucasxf/engineering-daybook/commit/2e9e592fc15a53a2b861d41a8976d8a33c8d6a04))
* move components to web/src/components/view-learning ([e245e40](https://github.com/lucasxf/engineering-daybook/commit/e245e4039bbe3335e5fd27145913a429887ef180))
* redesign view-learning screen with design system, i18n, and /review-pr improvements ([13c51bf](https://github.com/lucasxf/engineering-daybook/commit/13c51bfadec139c60cb554cee2e4a281d01b5893))
* relocate demo page to correct i18n folder structure ([f4115d1](https://github.com/lucasxf/engineering-daybook/commit/f4115d121e68ee7b025ed358b040efa95618c85c))
* settings persistence, tag sort/collapse, auto-resize textarea, and quality gates ([c20b573](https://github.com/lucasxf/engineering-daybook/commit/c20b5738ab024ca5e706f5d444eb163581aba5bd))
* tag sort by frequency + collapse/expand top 3 ([3d34f70](https://github.com/lucasxf/engineering-daybook/commit/3d34f70f6485926abf75efd76718a32e26785126))
* **web:** add pokCount to Tag interface ([18c557e](https://github.com/lucasxf/engineering-daybook/commit/18c557e11575cf5e3aebb8ab82f5213ee334205a))


### Bug Fixes

* add explicit state="loaded" check to narrow props.learning type ([30dae63](https://github.com/lucasxf/engineering-daybook/commit/30dae63c1b269ca597de366968a87b53ac9beaa1))
* address CI failure and PR review feedback for CreateLearningForm ([62aef74](https://github.com/lucasxf/engineering-daybook/commit/62aef7409076599ce38799eab875a39478137cb7))
* address CI/CD failures and PR review feedback ([17e83c1](https://github.com/lucasxf/engineering-daybook/commit/17e83c150a518a328f6d117fa8e04dbe6a1c73b6))
* address CI/CD failures and PR review feedback ([9cf1d43](https://github.com/lucasxf/engineering-daybook/commit/9cf1d43057271077f42e42ae62b6f3f91b199f00))
* address CI/CD failures and PR review feedback ([623a990](https://github.com/lucasxf/engineering-daybook/commit/623a9900dd814ce5c29e3a924b77c52b8771f770))
* address CI/CD failures and PR review feedback ([c8e7eae](https://github.com/lucasxf/engineering-daybook/commit/c8e7eaee34aa09e5254aab7d8850c70a580b4069))
* address CI/CD failures and PR review feedback ([196bb96](https://github.com/lucasxf/engineering-daybook/commit/196bb96608d5773233ba0695547b7900b3be79e8))
* address CI/CD failures and review feedback from PR [#267](https://github.com/lucasxf/engineering-daybook/issues/267) ([0cfd22e](https://github.com/lucasxf/engineering-daybook/commit/0cfd22e69d0edf1d4af412d82b1b94c0fa6a997f))
* address remaining Copilot round-2 review comments ([8ab78b9](https://github.com/lucasxf/engineering-daybook/commit/8ab78b9fe10fb7ae5a7d3921faf57832525c6c57))
* address remaining PR review comments on view-learning screen ([6430186](https://github.com/lucasxf/engineering-daybook/commit/64301865fc16b4fd0b925f776a74f299d2a6d1e6))
* address remaining PR review comments on view-learning screen ([a780221](https://github.com/lucasxf/engineering-daybook/commit/a780221187ac5db53c725358b91962047724769d))
* apply valid review feedback on create-learning PR ([5dc84ae](https://github.com/lucasxf/engineering-daybook/commit/5dc84ae9cc3ed4cf8fe5b7793f505802f729aef9))
* apply valid review feedback on reset-password redesign ([2017e6d](https://github.com/lucasxf/engineering-daybook/commit/2017e6d69310a8b2e073699db8fa5888a2f1f09d))
* calibrate web coverage threshold to measured 52.71% baseline ([997ac41](https://github.com/lucasxf/engineering-daybook/commit/997ac41bcfa28f3785d3230c84fd7c781f15e098))
* correct "Single Tag" state to show only React tag ([3ff8441](https://github.com/lucasxf/engineering-daybook/commit/3ff8441ef033fc28e047b3aa09ca315fc3f21bf5))
* correct accent issues and avatar alignment ([7e9eef3](https://github.com/lucasxf/engineering-daybook/commit/7e9eef362d4837267f62aefd26961b71d42312e8))
* correct stale aria-label assertions in view-learning tests ([c7d4d88](https://github.com/lucasxf/engineering-daybook/commit/c7d4d88f818ede232289b40f664dd5bbb3642da8))
* improve handle color contrast in PrivateProfile dark mode ([8e97626](https://github.com/lucasxf/engineering-daybook/commit/8e9762661a8b63a0c31c95502d711df976505980))
* integrate next-intl for language toggle ([d746a05](https://github.com/lucasxf/engineering-daybook/commit/d746a055f87405471c90b20e8b96344f1ee7038f))
* move FAQ links inside dd elements; correct handle character rules ([22b3f90](https://github.com/lucasxf/engineering-daybook/commit/22b3f90b71ec9520e70e13efaf70b3fd0d4f7402))
* remove unused beforeEach import and fix mock href to pass ESLint ([514fcd0](https://github.com/lucasxf/engineering-daybook/commit/514fcd0ff736f2f92f2d8c25b290dfdff3b9391b))
* replace Button-in-Link with styled Link for cancel button ([b17b57a](https://github.com/lucasxf/engineering-daybook/commit/b17b57a5ef493aeeb3b577609adb2d9fd802899b))
* resolve E2E settings test strict-mode violation + localize aria-label + align spec copy ([6f967ec](https://github.com/lucasxf/engineering-daybook/commit/6f967ec5109da7dace0e310b67cf6e9dac1ea27e))
* resolve hydration mismatch and markdown key issues ([2395cc2](https://github.com/lucasxf/engineering-daybook/commit/2395cc29d7549fc5f9b122a0a3862f78a84f1456))
* resolve Vitest timer leak in useDebounce tests; add web docs and phase notes ([799613f](https://github.com/lucasxf/engineering-daybook/commit/799613f515092c74cb11ee2525e62987f6d8d8a8))
* split error title/body keys and i18n loading skeleton aria-label ([24dc893](https://github.com/lucasxf/engineering-daybook/commit/24dc8935d554add7586e44a54a3a94d264973375))
* update DeleteConfirmDialog translations ([1f45835](https://github.com/lucasxf/engineering-daybook/commit/1f45835c9ff5d60abf46b009516470943f11000b))
* update NotFound title color for dark mode contrast ([924ca99](https://github.com/lucasxf/engineering-daybook/commit/924ca9910a7409102e2803ec0081ec9c09582808))
* update PokForm mock in EditPokPage tests to render cancelButton prop ([244b919](https://github.com/lucasxf/engineering-daybook/commit/244b919899cf19f80bb013bd541adc2438fb6394))
* use useId() for unique ARIA IDs in DeleteConfirmDialog ([09aaac9](https://github.com/lucasxf/engineering-daybook/commit/09aaac962be33edc3399dfc6636b683addd364d7))
* use valid Tailwind classes for dark mode ([dd62e87](https://github.com/lucasxf/engineering-daybook/commit/dd62e87db3c9390960e9555cac0a0a847c8928ea))
* useTranslations in demo page for proper localization ([ad525fe](https://github.com/lucasxf/engineering-daybook/commit/ad525fe65f9c7087fce9cf3180fb7b733465c7a3))


### Code Refactoring

* prepare ViewLearningScreen for production ([9aa5d2c](https://github.com/lucasxf/engineering-daybook/commit/9aa5d2ca5d8b944770e6cbe1e6dee9e17d2d9fb4))
* streamline PokForm layout with unified footer ([4167c5c](https://github.com/lucasxf/engineering-daybook/commit/4167c5c82e5d608e9f66ae0e19d3342cd9dbf229))


### Documentation

* record PR [#186](https://github.com/lucasxf/engineering-daybook/issues/186) fix-pr session and add FormField pitfall ([e561a8a](https://github.com/lucasxf/engineering-daybook/commit/e561a8a29d4f07caa7854d8faa4f6f7035f611f5))
* record PR [#187](https://github.com/lucasxf/engineering-daybook/issues/187) fix session and add vi.mock pitfall ([74d5d97](https://github.com/lucasxf/engineering-daybook/commit/74d5d9778347ffca74e27d9c95e1c4b7ed277e43))
* record PR [#194](https://github.com/lucasxf/engineering-daybook/issues/194) fix session and add TS union narrowing pitfall ([f41a012](https://github.com/lucasxf/engineering-daybook/commit/f41a012d86aadd42bbba32dd65488ebbe7ea553a))
* update phase-1 roadmap and triage plan for tag sort/collapse (S5 item [#6](https://github.com/lucasxf/engineering-daybook/issues/6)) ([246cb58](https://github.com/lucasxf/engineering-daybook/commit/246cb58f0565d987009699a7e5d0b9d5453855b6))
* **web:** add Sign in with Apple data-handling section to privacy policy ([079cc43](https://github.com/lucasxf/engineering-daybook/commit/079cc434a60b711b040c8312ae3b1dd11271e56b))


### Tests

* add E2E tests for support page ([498e73b](https://github.com/lucasxf/engineering-daybook/commit/498e73b24e1d5bf3d24a839fc92d9694d6154cf8))
