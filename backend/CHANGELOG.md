# Changelog

## 1.0.0 (2026-02-22)


### Features

* add audit logging to PokService (TDD) ([00e6f5a](https://github.com/lucasxf/engineering-daybook/commit/00e6f5a48ec9d12d008d4225753690b6aad47f00))
* add AuthProperties, JwtService, AuthService, and auth DTOs ([32c0369](https://github.com/lucasxf/engineering-daybook/commit/32c0369b45ef23ad6f9b9804b4a888e109cf9fd5))
* add AuthProperties, JwtService, AuthService, and auth DTOs ([162af35](https://github.com/lucasxf/engineering-daybook/commit/162af3556197778f031a67648a93175849ea92e5))
* add database index for created_at sorting ([fe0dcd8](https://github.com/lucasxf/engineering-daybook/commit/fe0dcd863fd54e825679ef007ef732a5825c1131))
* add database migration for poks table ([b2be537](https://github.com/lucasxf/engineering-daybook/commit/b2be537e9ad4a1b96e1ae1b54707ed13bed3d121)), closes [#1](https://github.com/lucasxf/engineering-daybook/issues/1)
* add EmailService and PasswordResetService (TDD, 12 tests) ([4ce0921](https://github.com/lucasxf/engineering-daybook/commit/4ce09217a83ad6751f059b166a12fd0c20649099))
* add exception handlers for POK errors ([23dbc96](https://github.com/lucasxf/engineering-daybook/commit/23dbc96d98895bd2e4894ec7a06332be7bdacd08)), closes [#7](https://github.com/lucasxf/engineering-daybook/issues/7)
* add GET /api/v1/poks/{id}/history endpoint ([7123631](https://github.com/lucasxf/engineering-daybook/commit/712363162cf3d47c6cfe226a6d32a12cb0186aad))
* add Google ID token verification service ([59c5c0c](https://github.com/lucasxf/engineering-daybook/commit/59c5c0c622fe60f53480cb3c5c2a8705da6b369e))
* add Google OAuth authentication ([a81e8c6](https://github.com/lucasxf/engineering-daybook/commit/a81e8c6e497e706ac5f7a5e637bb8330cdb82cfb))
* add Google OAuth configuration ([02aaf64](https://github.com/lucasxf/engineering-daybook/commit/02aaf64273ac7892dd4bd07efb42a5b08f9d689d))
* add Google OAuth DTOs ([59d692b](https://github.com/lucasxf/engineering-daybook/commit/59d692b83d77cba31fa709e5bd7075d8fcda0f42))
* add Google OAuth login and signup service methods ([28b20be](https://github.com/lucasxf/engineering-daybook/commit/28b20be6a315a423286f6b838a3a3be6427e5f55))
* add Google OAuth REST endpoints ([5ab97a4](https://github.com/lucasxf/engineering-daybook/commit/5ab97a4f61d9dc8b14379ba5851877b7b9194c60))
* add password reset domain, exception, and configuration ([5dc9609](https://github.com/lucasxf/engineering-daybook/commit/5dc9609cf9b60035630a377f984d0b5e57e4bbee))
* add PasswordResetController with MockMvc tests (12 tests green) ([5835953](https://github.com/lucasxf/engineering-daybook/commit/5835953e052b86c53124c533174b8a5b63a0ee25))
* add POK domain entity ([05030ae](https://github.com/lucasxf/engineering-daybook/commit/05030aed95284a36bd96f05f74d534a4f8360674)), closes [#2](https://github.com/lucasxf/engineering-daybook/issues/2)
* add POK DTOs and custom exceptions ([a67878b](https://github.com/lucasxf/engineering-daybook/commit/a67878b0a5120e93923811d17e0189b2e83ded42)), closes [#4](https://github.com/lucasxf/engineering-daybook/issues/4)
* add POK repository with Testcontainers tests ([a4eea2b](https://github.com/lucasxf/engineering-daybook/commit/a4eea2b1247d628bff76ecb7d5f317ef6e2a9fea)), closes [#3](https://github.com/lucasxf/engineering-daybook/issues/3)
* add POK search query to repository ([0cf4ef8](https://github.com/lucasxf/engineering-daybook/commit/0cf4ef804d7c8e6f79376c1852c0f190b55b6a6d))
* add PokAuditLog entity, repository, and DTO ([addf08d](https://github.com/lucasxf/engineering-daybook/commit/addf08d4a5f42d5326124e0a7558fd95990a6339))
* add search/filter/sort logic to PokService ([927016d](https://github.com/lucasxf/engineering-daybook/commit/927016df3c546114d34b78528e7c0d2a70ac1a67))
* add search/filter/sort query params to PokController ([e1eb525](https://github.com/lucasxf/engineering-daybook/commit/e1eb525d2b37cd120fd7d6f599224f7f02b042e1))
* add SecurityConfig, JwtAuthenticationFilter, and AuthController ([14102f7](https://github.com/lucasxf/engineering-daybook/commit/14102f7b91ef5b37f0e2a7c42386616773c0ca5c))
* add Spring Boot backend scaffold ([9394f33](https://github.com/lucasxf/engineering-daybook/commit/9394f331194fe10f3c30b4adea8942fbbdedcbcf))
* add Spring Boot backend scaffold ([3431f7b](https://github.com/lucasxf/engineering-daybook/commit/3431f7b40e594312dcf13b2cccebc4c2c805de46))
* add Spring Boot backend scaffold ([a6093aa](https://github.com/lucasxf/engineering-daybook/commit/a6093aacabfaa83b464d493e639e3ce2ac539de1))
* add temp token support for two-step OAuth signup ([4382482](https://github.com/lucasxf/engineering-daybook/commit/43824826309b9d6dd1803ec6ec15579780f8463d))
* add User and RefreshToken domain entities ([9eef8a8](https://github.com/lucasxf/engineering-daybook/commit/9eef8a8a88a11fc0c686dd8ace931b1dd9fa02ad))
* add UserRepository and RefreshTokenRepository ([68d5781](https://github.com/lucasxf/engineering-daybook/commit/68d5781acfc8f0dff729c171dd82226f5da50fa2))
* add users and refresh_tokens database migrations ([1b95143](https://github.com/lucasxf/engineering-daybook/commit/1b95143f53a6213308b3ac013d5e19fca38f05ad))
* add V6 migration for pok_audit_logs table ([2d7d0f8](https://github.com/lucasxf/engineering-daybook/commit/2d7d0f8f21aca3de85dae0ef8b12fe9a52e1df7c))
* add V7 Flyway migration for password_reset_tokens table ([fa83214](https://github.com/lucasxf/engineering-daybook/commit/fa83214f3fd14e3c8b5edc8518f90e38e3d19c0e))
* backend authentication (JWT + email/password) ([946f107](https://github.com/lucasxf/engineering-daybook/commit/946f107f90306bff20f34eeca882bdb19fb3c7d1))
* implement password reset flow (Milestone 1.1.5) ([605d26d](https://github.com/lucasxf/engineering-daybook/commit/605d26d2ce91c397f356e82969e63f9289006c18))
* implement POK CRUD (Milestone 1.2) ([31c2b6b](https://github.com/lucasxf/engineering-daybook/commit/31c2b6b133cf75b1b60ca44cba1c12893e49d56e))
* implement POK listing with search and sort (Milestone 1.3) ([aac0e14](https://github.com/lucasxf/engineering-daybook/commit/aac0e14ce82985157df226d07f2cc7c440803414))
* implement POK REST controller with OpenAPI docs ([0a6db26](https://github.com/lucasxf/engineering-daybook/commit/0a6db26ac72d0288ee87171e9c0b76b48fd357ed)), closes [#6](https://github.com/lucasxf/engineering-daybook/issues/6)
* implement POK service with comprehensive TDD ([46760e6](https://github.com/lucasxf/engineering-daybook/commit/46760e6a94d586b0111a76546c5aae7d19e36577)), closes [#5](https://github.com/lucasxf/engineering-daybook/issues/5)
* POK audit trail, success notifications, and history endpoint (Milestone 2.1) ([ac9f022](https://github.com/lucasxf/engineering-daybook/commit/ac9f022e8573057633c75105d6bd08f4c9fc16e1))


### Bug Fixes

* add PostgreSQL service container for CI tests ([86a86b7](https://github.com/lucasxf/engineering-daybook/commit/86a86b76ca7dc96ee0c5b2b501ab827ca878b7fb))
* address PR [#20](https://github.com/lucasxf/engineering-daybook/issues/20) review feedback ([a335292](https://github.com/lucasxf/engineering-daybook/commit/a335292092b3c667d723c8779d5ce5233790e17d))
* address PR [#59](https://github.com/lucasxf/engineering-daybook/issues/59) Copilot review comments ([bcb11eb](https://github.com/lucasxf/engineering-daybook/commit/bcb11eb394780d89e943de2f3e50888013bfa06a))
* address PR review feedback on authentication ([fcb4be6](https://github.com/lucasxf/engineering-daybook/commit/fcb4be6a9977ad16460448b3692d0888eda2cd3d))
* **backend:** make CORS allowed origins configurable via env var ([c5fe565](https://github.com/lucasxf/engineering-daybook/commit/c5fe56530dadfc5d6f1af619ff1b22239bdc4775))
* **backend:** make CORS allowed origins configurable via env var ([a218d54](https://github.com/lucasxf/engineering-daybook/commit/a218d54ce6ade8c7a23d6780702781aed0808d92))
* **backend:** make CORS allowed origins configurable via env var ([ea361cb](https://github.com/lucasxf/engineering-daybook/commit/ea361cb3a3591b574bb9798f78083be0f060932f))
* make exception message matching case-insensitive ([7428bf6](https://github.com/lucasxf/engineering-daybook/commit/7428bf6bc3ee6b0f851ce6aad5d2515384eb9d18))
* make home CTA auth-aware + add page-level behavior tests ([2f28ca5](https://github.com/lucasxf/engineering-daybook/commit/2f28ca50c36742ca27eefe408f3ad0ff0846b1e5))
* resolve @swc/helpers version and Flyway/JPA ordering in Spring Boot 4 ([c77af7b](https://github.com/lucasxf/engineering-daybook/commit/c77af7ba48f9a10cf015061ce6cef4f136de361c))
* resolve CI/CD failures from dependabot dependency upgrades ([2bf74cc](https://github.com/lucasxf/engineering-daybook/commit/2bf74cccad9640f10c9953092fb9a338f4cbffee))
* resolve CI/CD pipeline failures ([4a82d9e](https://github.com/lucasxf/engineering-daybook/commit/4a82d9eee27651b2da1c025c83ab8f380a302a27))
* resolve PostgreSQL type inference and stale mock failures in tests ([e544e0f](https://github.com/lucasxf/engineering-daybook/commit/e544e0f4aee40495b2d8b9ab3b1a8212b5ee26a4))
* resolve remaining CI/CD failures ([a326c32](https://github.com/lucasxf/engineering-daybook/commit/a326c3231c2b966889a54cf45e0b6a106568a93f))
* set execute permission on Maven wrapper script ([1d23fea](https://github.com/lucasxf/engineering-daybook/commit/1d23feab80747c3482ce67a677403a8a1b2d3330))
* update HealthControllerTest for Spring Security context ([62e20f7](https://github.com/lucasxf/engineering-daybook/commit/62e20f7408481e2911860d040e3bb7cf596a104a))
* use Instant.now() in logUpdate to avoid pre-@PreUpdate timestamp ([ea67959](https://github.com/lucasxf/engineering-daybook/commit/ea67959782741edee8ce5bb0fb7f5b738c434c1f))
* validate date params and whitelist sortBy in PokService ([bbdc1c6](https://github.com/lucasxf/engineering-daybook/commit/bbdc1c63cdc45f43b8ec1381431d156d58619d1f))
* wire Get Started button, update home description, and sync docs ([88d75ae](https://github.com/lucasxf/engineering-daybook/commit/88d75aed97706b2f3db9b288aa575a2e020765cd))


### Code Refactoring

* extract duplicate temp token error message to constant ([4d0947b](https://github.com/lucasxf/engineering-daybook/commit/4d0947bbefe52b86bdc5a8cb34d59c0ee4a46c4d))
* migrate logging to Lombok @Slf4j annotation ([c629704](https://github.com/lucasxf/engineering-daybook/commit/c62970422f7fef570a7dad270f659ed12877c48a))
* replace IllegalArgumentException with custom domain exceptions ([5f251ed](https://github.com/lucasxf/engineering-daybook/commit/5f251edd219359f9f0e8c3b32879a26b7ffa457c))


### Documentation

* MVP UX review, JaCoCo pipeline, and password reset spec ([5342840](https://github.com/lucasxf/engineering-daybook/commit/5342840a60155304f32869bfa62a2cd045826a98))
* update README and architecture to reflect production stack ([7d76d6d](https://github.com/lucasxf/engineering-daybook/commit/7d76d6d771f4afd65de56bcad7cd5db0e428a9aa))


### Tests

* add auth integration tests covering email/password and Google OAuth flows ([5f694b8](https://github.com/lucasxf/engineering-daybook/commit/5f694b8ea8ac530a447755b73c38fa1b27c8dc7e))
* add AuthController MockMvc tests ([973d14a](https://github.com/lucasxf/engineering-daybook/commit/973d14a92cb15c4a2753d902cd0bd7e24032d38b))
* add controller tests for search query parameters ([f38afc1](https://github.com/lucasxf/engineering-daybook/commit/f38afc11faeb72637dcf75e5067b922a38f21ceb))
* add EmailServiceTest to fix backend coverage (88.8% → 92.9%) ([bf52a2f](https://github.com/lucasxf/engineering-daybook/commit/bf52a2fa30af1b8a9c33ea03d1293500bc5577fa))
* add JwtAuthenticationFilter and GlobalExceptionHandler unit tests ([98aaa6f](https://github.com/lucasxf/engineering-daybook/commit/98aaa6fcd74e6b6638ddea3c6a9f6b4b24731b84))
* add JwtService and AuthService unit tests ([57d476e](https://github.com/lucasxf/engineering-daybook/commit/57d476e2aa8d2cf8c83e4e08bcedf15a5909edc2))
* add JwtService and AuthService unit tests ([5c23bce](https://github.com/lucasxf/engineering-daybook/commit/5c23bcebd950ff1602e832df3e48b90392ceebe3))
* add repository tests for POK search functionality ([99dcf85](https://github.com/lucasxf/engineering-daybook/commit/99dcf855bebd8de35e0117a984f7842d835eab96))
* add service tests for POK search/filter/sort ([479afb1](https://github.com/lucasxf/engineering-daybook/commit/479afb13d54f83e51655994e7838953e9e011f11))
