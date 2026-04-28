# Changelog

## 1.0.0 (2026-04-28)


### Features

* add PATCH /api/v1/users/me/settings endpoint ([2412748](https://github.com/lucasxf/engineering-daybook/commit/24127481005a7ea76ab7f279aa663df980148f27))
* add per-file quality gates via PostToolUse hook (M1–M6) ([9db275a](https://github.com/lucasxf/engineering-daybook/commit/9db275a3b41b8466c687dae4ef38d9c4188f16cc))
* add spec pipeline health metric to /compile-metrics ([77d59a6](https://github.com/lucasxf/engineering-daybook/commit/77d59a6a62302c01dcf3dc394da757e720da10b6))
* Apple App Store compliance — account deletion, Sign in with Apple, support page, Xcode 26 SDK ([b7bd86f](https://github.com/lucasxf/engineering-daybook/commit/b7bd86f5e7c471969512e8c1b4292d00137d4624))
* **auth:** Sign in with Apple — backend + mobile ([77090ec](https://github.com/lucasxf/engineering-daybook/commit/77090ecf2c93f9c0803727ec1ca243ea0d04700f))
* **backend:** add Apple identity token verifier with JWK cache ([8194f99](https://github.com/lucasxf/engineering-daybook/commit/8194f99bf91c2c27e888dda53ef578c2c399bd89))
* **backend:** add apple_sub column to users (V23 migration) ([0153320](https://github.com/lucasxf/engineering-daybook/commit/0153320e1615c391bbf3f23842e562f4863a308f))
* **backend:** add appleLogin and completeAppleSignup to AuthService ([2bf56d7](https://github.com/lucasxf/engineering-daybook/commit/2bf56d7168ad83fb52249b5dde84c630b1735e5b))
* **backend:** add cascade-delete repository methods for account deletion ([49f6631](https://github.com/lucasxf/engineering-daybook/commit/49f6631ada7c7be7bea6b0070e92d37ac2b2452a))
* **backend:** add DELETE /api/v1/users/me account deletion endpoint ([3698a7e](https://github.com/lucasxf/engineering-daybook/commit/3698a7e1914a7d401c0fc6a4693991e7bf3e6a19))
* **backend:** add deleted_at to users and partial unique indices ([3639db5](https://github.com/lucasxf/engineering-daybook/commit/3639db5071f88fc27d577b3961b7db2a95bf2860))
* **backend:** add pokCount to tag responses ([978052b](https://github.com/lucasxf/engineering-daybook/commit/978052b05b9e53f15478a92b8c35ffb5ac0b87a4))
* **backend:** add POST /auth/mobile/apple and /apple/complete endpoints ([f012678](https://github.com/lucasxf/engineering-daybook/commit/f012678e090787711e85b9901a1c52d3c14f12a2))
* **backend:** expose theme and locale in settings and /auth/me endpoints ([1f0613d](https://github.com/lucasxf/engineering-daybook/commit/1f0613dfef061ab79c9b70c7f6aa0d3e2bf43b0b))
* include user's 5 most recent POKs in social feed ([0cd7d65](https://github.com/lucasxf/engineering-daybook/commit/0cd7d65086e1b1835698bd1cf3c120aa5f4fcde8))
* include user's own recent learnings in social feed ([97d2203](https://github.com/lucasxf/engineering-daybook/commit/97d22035d69d997b82a44470dfb0a50d58da0c52))
* **mobile+backend:** account deletion — Apple Guideline 5.1.1(v) compliance ([0f5fbfb](https://github.com/lucasxf/engineering-daybook/commit/0f5fbfb476d17b46232ad2a0f572c0c068778e01))
* settings persistence, tag sort/collapse, auto-resize textarea, and quality gates ([c20b573](https://github.com/lucasxf/engineering-daybook/commit/c20b5738ab024ca5e706f5d444eb163581aba5bd))
* **settings:** persist theme and locale preferences via backend ([1a69c6c](https://github.com/lucasxf/engineering-daybook/commit/1a69c6cb2ac71f1677a80671e564aaf00f99e4c9))
* tag sort by frequency + collapse/expand top 3 ([3d34f70](https://github.com/lucasxf/engineering-daybook/commit/3d34f70f6485926abf75efd76718a32e26785126))


### Bug Fixes

* address CI/CD failures and PR review feedback ([4596791](https://github.com/lucasxf/engineering-daybook/commit/4596791e45349269e414aa7c6d2eac5fe4489486))
* address CI/CD failures and review feedback from PR [#267](https://github.com/lucasxf/engineering-daybook/issues/267) ([0cfd22e](https://github.com/lucasxf/engineering-daybook/commit/0cfd22e69d0edf1d4af412d82b1b94c0fa6a997f))
* address PR [#277](https://github.com/lucasxf/engineering-daybook/issues/277) review feedback ([21877d1](https://github.com/lucasxf/engineering-daybook/commit/21877d11f9811a5e3148e85e4e87cb87dbfef425))
* apply PR review findings — gitignore artifacts, test name, accessibility, imports ([e987ae3](https://github.com/lucasxf/engineering-daybook/commit/e987ae382bf13d4757ba47ffa53ac47075b7068d))
* **backend+mobile:** apply review findings from account deletion PR ([a3831df](https://github.com/lucasxf/engineering-daybook/commit/a3831df21c3a3033cbef840721e1bed0293e4d30))
* **backend:** accept Android client ID as valid Google OAuth audience ([218df6e](https://github.com/lucasxf/engineering-daybook/commit/218df6e65d4e78f2524743400dc88d3fe84029bd))
* **backend:** complete PR [#267](https://github.com/lucasxf/engineering-daybook/issues/267) follow-up fixes ([7d0d588](https://github.com/lucasxf/engineering-daybook/commit/7d0d588d5f40bc171c4d3fd5dee79877a6a47fc3))
* **backend:** defer async tasks in create() to afterCommit to prevent missing row race ([905c93b](https://github.com/lucasxf/engineering-daybook/commit/905c93b3b8b7e679649c441caa66c03ce10639b0))
* **backend:** defer embedding/suggestion async tasks to afterCommit to prevent title clobber ([3059995](https://github.com/lucasxf/engineering-daybook/commit/3059995820d934444a241792b1f98f6a48450d2b))
* **backend:** updateTheme/updateLocale return 400 not 401 for unknown values ([b0668e2](https://github.com/lucasxf/engineering-daybook/commit/b0668e2a5b7d52fd8202143639a873b5cb044bba))
* enable pgvector extension in AuthIntegrationTest and FollowIntegrationTest ([08c88b0](https://github.com/lucasxf/engineering-daybook/commit/08c88b0ede4bc17dd075b8abd9127092f0b4947b))
* learning title update silently reverted after save ([acc4735](https://github.com/lucasxf/engineering-daybook/commit/acc4735e4ca534adc3cb536b053e2e880c7180f2))
* make SELF_POK_LIMIT public; use softDelete() in test ([4493b3b](https://github.com/lucasxf/engineering-daybook/commit/4493b3b119e772f9a123e54cec31ab2d85e799ce))
* **mobile:** merge AndroidX resolutionStrategy blocks into one ([8e2d3ce](https://github.com/lucasxf/engineering-daybook/commit/8e2d3cec6acc1b9e1060d629ffa19c8c9798b250))
* **mobile:** pin androidx.core to 1.15.0 to unblock EAS Android build ([924b7ee](https://github.com/lucasxf/engineering-daybook/commit/924b7ee490d67fea0b7221b5f417901d8457686f))
* remove pre-existing UnnecessaryStubbingException in LearnerServiceTest; update CLAUDE.md docs ([bf2dce2](https://github.com/lucasxf/engineering-daybook/commit/bf2dce25c7c480abc87d4fc149ba0d84877d2aaf))
* scope tag pokCount to visible learnings for non-owners; tidy key/constant ([828f1fa](https://github.com/lucasxf/engineering-daybook/commit/828f1faedf7690c72431db8063e81001d0b5a11e))
* update tests for nullable theme/locale and useRef hook mock ([0bf1777](https://github.com/lucasxf/engineering-daybook/commit/0bf177765a171e4b9cda185a05b62e52dd9c139c))


### Documentation

* **backend:** add Flyway migration rename pitfall — use git mv not rm ([212fd40](https://github.com/lucasxf/engineering-daybook/commit/212fd401825e6b75072aaf1dd35bb89bd323ef53))
* record session — two mobile bug fixes + docs/pitfall updates ([57dd9ee](https://github.com/lucasxf/engineering-daybook/commit/57dd9eed8f48da83ef5e6adc8e9e971453e8c14d))
* update phase-1 roadmap and triage plan for tag sort/collapse (S5 item [#6](https://github.com/lucasxf/engineering-daybook/issues/6)) ([246cb58](https://github.com/lucasxf/engineering-daybook/commit/246cb58f0565d987009699a7e5d0b9d5453855b6))


### Tests

* **backend:** add unit and integration tests for account deletion ([e1e953e](https://github.com/lucasxf/engineering-daybook/commit/e1e953ede4e0c2e5dad6b08b9fd9175d51664223))
* **backend:** encode UserTag subscription-id vs global-tag-id contract ([581bfa9](https://github.com/lucasxf/engineering-daybook/commit/581bfa9178a142824a875f818d2cdd8ddfd07564))
