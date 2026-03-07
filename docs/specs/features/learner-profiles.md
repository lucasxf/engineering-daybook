# Learner Profiles (Milestone 6.3)

> **Status:** In Progress
> **Created:** 2026-03-07
> **Implemented:** _pending_

---

## Context

Milestone 5.2 (Learner Profile Privacy) delivered the minimal profile page at `/learners/{handle}` with visibility controls, privacy enforcement, and the anti-vanity rule. However, profiles are text-only — no avatar, no bio, no personality. The roadmap items 6.3.1 (profile page) and 6.3.5–6.3.6 (visibility, anti-vanity) are already implemented.

This spec delivers the remaining 6.3 items: avatar display and upload (6.3.2, 6.3.4), short bio (6.3.3), clickable `@handle` with avatar thumbnail in the header (6.3.7), and display name editing from settings. Together, these give learner profiles a personal identity beyond just a handle.

**Phase/Milestone:** Phase 6 — Social / Milestone 6.3

**Related:**
- `docs/specs/features/learner-profile-privacy.md` — 5.2 (foundation this builds on)
- `docs/ROADMAP.phase-6.md` — Milestone 6.3 items

---

## Requirements

### Functional

#### Avatar

- [ ] **FR1** *(Must Have)* — `avatar_url` column added to `users` table (nullable VARCHAR(500)). V18 migration.
- [ ] **FR2** *(Must Have)* — `POST /api/v1/users/me/avatar` accepts multipart file upload (JPEG, PNG, WebP). Max 2MB. Server resizes to 200×200 JPEG. Stores in Supabase Storage bucket `avatars` at path `{userId}.jpg`. Returns `{ avatarUrl }`.
- [ ] **FR3** *(Must Have)* — `DELETE /api/v1/users/me/avatar` removes the file from Supabase Storage and sets `avatar_url = NULL` in the database. Returns 204.
- [ ] **FR4** *(Must Have)* — Public profile page shows the avatar image (or initials placeholder when no avatar). Private shell shows no avatar.
- [ ] **FR5** *(Should Have)* — Web header shows the user's avatar thumbnail (32px) + clickable `@handle` linking to their own profile (6.3.7).

#### Bio

- [ ] **FR6** *(Must Have)* — `bio` column added to `users` table (nullable VARCHAR(200)). V18 migration.
- [ ] **FR7** *(Must Have)* — Bio is updated via `PATCH /api/v1/users/me/settings` (added to existing `UpdateUserSettingsRequest`). Max 200 chars. URLs (`http://`, `https://`, `www.`) are rejected with 400.
- [ ] **FR8** *(Must Have)* — Public profile page shows bio below display name. Private shell shows no bio.

#### Display Name Editing

- [ ] **FR9** *(Must Have)* — Display name is editable via `PATCH /api/v1/users/me/settings` (added to `UpdateUserSettingsRequest`). Max 100 chars, not blank.
- [ ] **FR10** *(Must Have)* — Settings page (web) and ProfileScreen (mobile) show a display name input field.

#### Settings & Auth

- [ ] **FR11** *(Must Have)* — `avatarUrl`, `bio`, and `displayName` are returned in `GET /auth/me` response so the frontend can display them without extra roundtrips.
- [ ] **FR12** *(Must Have)* — Settings page (web) has sections for: avatar upload/remove, display name, bio, and existing privacy controls.
- [ ] **FR13** *(Must Have)* — Mobile ProfileScreen extended with: avatar display/upload, display name editing, bio editing.

**Scope:** Full-stack (Backend + Web + Mobile)

#### Out of Scope

- `FOLLOWERS_ONLY` / `COLLEAGUES_ONLY` profile visibility tiers — Phase 6.1
- Discoverable public learner directory — Phase 6.5
- Unauthenticated access to profiles — Phase 6+
- Handle changes — not planned

### Non-Functional

1. **Security — Avatar validation:** Server rejects files >2MB, non-image types, and corrupt images. Thumbnailator processes the image (implicit validation — corrupt files throw exceptions).
2. **Security — Bio URL rejection:** Backend enforces no-links rule. `http://`, `https://`, and `www.` patterns in bio cause 400.
3. **Security — Supabase Storage ACL:** `avatars` bucket is public-read (URLs are accessible if known), service-key-write (only backend uploads). Avatar URLs for private profiles are not returned in API responses, so the frontend never receives them. If someone guesses the URL pattern, they can see the avatar — acceptable (same as GitHub).
4. **Performance — Image resizing:** Thumbnailator resizes to 200×200 JPEG at 85% quality. ~10-20KB per avatar. No CDN needed at current scale.
5. **i18n:** All new UI labels available in EN and PT-BR.
6. **Accessibility:** Avatar upload input is labeled. Bio textarea has character counter announced to screen readers. Display name input is labeled.

---

## Technical Constraints

**Stack:** Multiple (Backend + Web + Mobile)

**Technologies:**
- Backend: Java 21, Spring Boot, Spring Data JPA, Flyway, Thumbnailator (new dep)
- Web: Next.js 14+, TypeScript 5+, Tailwind CSS, next-intl, Vitest
- Mobile: Expo SDK 53, React Native 0.76, expo-image-picker (new dep)

**Integration Points:**
- `User.java` — add `avatarUrl`, `bio` fields + setters; add `displayName` setter
- `AuthResponse.java` — add `avatarUrl`, `bio`, `displayName` fields; update all constructors and call sites
- `LearnerProfileResponse.java` — add `avatarUrl`, `bio` to record + factory methods
- `UpdateUserSettingsRequest.java` — add `bio`, `displayName` fields
- `UserSettingsController.java` — add avatar upload/delete endpoints, handle bio and displayName in PATCH
- `UserService.java` — add `updateBio()`, `updateDisplayName()` methods
- New `StorageService` interface + `SupabaseStorageService` implementation
- New `AvatarService` — orchestrates validation, resize, upload, URL persistence
- `web/src/contexts/AuthContext.tsx` — add `avatarUrl`, `bio`, `displayName` to `AuthUser`
- `web/src/components/auth/UserMenu.tsx` — avatar thumbnail + profile link
- Supabase Storage bucket `avatars` (must be created in Supabase dashboard or via API)

**Out of Scope:**
- Supabase Storage bucket creation automation (manual dashboard step)
- CDN for avatars
- Multiple avatar sizes

---

## Acceptance Criteria

### AC1: Avatar upload succeeds with valid image
**GIVEN** an authenticated user
**WHEN** they POST a 1MB JPEG to `/api/v1/users/me/avatar`
**THEN** the response is `200 OK` with `{ "avatarUrl": "https://..." }` and the avatar is visible on their profile

### AC2: Avatar upload rejects invalid file type
**GIVEN** an authenticated user
**WHEN** they POST a `.pdf` file to `/api/v1/users/me/avatar`
**THEN** the response is `400 Bad Request`

### AC3: Avatar upload rejects oversized file
**GIVEN** an authenticated user
**WHEN** they POST a 5MB image to `/api/v1/users/me/avatar`
**THEN** the response is `400 Bad Request`

### AC4: Avatar delete removes avatar
**GIVEN** a user with an avatar set
**WHEN** they call `DELETE /api/v1/users/me/avatar`
**THEN** the response is `204`, `avatar_url` is null, and their profile shows the initials placeholder

### AC5: Profile page shows avatar and bio
**GIVEN** Alice has a `PUBLIC` profile with an avatar and bio
**WHEN** Bob views `/learners/alice`
**THEN** Bob sees Alice's avatar image, display name, bio, and public learnings

### AC6: Private profile hides avatar and bio
**GIVEN** Alice has a `PRIVATE` profile with an avatar and bio
**WHEN** Bob views `/learners/alice`
**THEN** Bob sees only `@alice` and "This profile is private" — no avatar, no bio

### AC7: Initials placeholder when no avatar
**GIVEN** a user with no avatar set and a `PUBLIC` profile
**WHEN** anyone views their profile
**THEN** a circle with the first letter of their display name is shown instead of an image

### AC8: Bio saved via settings
**GIVEN** an authenticated user
**WHEN** they PATCH `/api/v1/users/me/settings` with `{ "bio": "I love learning!" }`
**THEN** the bio is saved and appears on their profile page

### AC9: Bio rejects URLs
**GIVEN** an authenticated user
**WHEN** they PATCH `/api/v1/users/me/settings` with `{ "bio": "Visit https://example.com" }`
**THEN** the response is `400 Bad Request`

### AC10: Display name editable from settings
**GIVEN** an authenticated user with `displayName = "Alice"`
**WHEN** they PATCH `/api/v1/users/me/settings` with `{ "displayName": "Alice Smith" }`
**THEN** the display name is updated and reflected on their profile and in the header

### AC11: Auth/me returns avatar, bio, displayName
**GIVEN** a user with avatar, bio, and displayName set
**WHEN** they call `GET /auth/me`
**THEN** the response includes `avatarUrl`, `bio`, and `displayName` fields

### AC12: Header shows avatar thumbnail and @handle link
**GIVEN** a logged-in user with an avatar
**WHEN** they view any page
**THEN** the header shows their 32px avatar thumbnail and `@handle`, both linking to their profile

### AC13: Settings page has all profile controls (web)
**GIVEN** a logged-in web user
**WHEN** they visit `/settings`
**THEN** they see avatar upload/remove, display name input, bio textarea, and privacy controls

### AC14: Mobile ProfileScreen has profile controls
**GIVEN** a logged-in mobile user
**WHEN** they open the Profile tab
**THEN** they see avatar display/upload, display name input, bio input, and existing privacy/theme/language controls

---

## Implementation Approach

### Architecture

Builds on the existing 5.2 infrastructure (LearnerController, LearnerService, UserSettingsController, settings page). Adds a new storage layer for Supabase avatar uploads.

**New backend layer: Storage**
- `StorageService` (interface) → `SupabaseStorageService` (implementation)
- Uses `RestClient` to call Supabase Storage REST API
- Config via `StorageProperties` (`storage.supabase.url`, `storage.supabase.service-key`, `storage.supabase.bucket`)

**Avatar upload flow:**
1. Controller receives `MultipartFile`
2. `AvatarService` validates type (JPEG/PNG/WebP) and size (≤2MB)
3. Thumbnailator resizes to 200×200 JPEG at 85% quality
4. `SupabaseStorageService` uploads to `avatars/{userId}.jpg` (overwrites existing)
5. `UserService` saves public URL to `user.avatarUrl`
6. Returns `{ avatarUrl }` to client

**Bio update:** Added to existing `PATCH /api/v1/users/me/settings` via `UpdateUserSettingsRequest`. URL pattern check in `UserService.updateBio()`.

**Display name update:** Added to same PATCH endpoint. Validates not blank, ≤100 chars.

**Frontend Avatar component:** Shared across web and mobile. Shows `<img>` with `avatarUrl` when present, or CSS initials circle (first letter of displayName, deterministic background color from handle hash) when absent.

### Test Strategy

- [x] **Full TDD** for:
  - `AvatarService` — file type validation, size validation, resize, URL rejection in bio
  - `UserService.updateBio()`, `UserService.updateDisplayName()` — happy path + validation
  - `UserSettingsController` — avatar upload/delete endpoints, bio/displayName in PATCH
  - `LearnerController` (existing tests updated) — assert avatarUrl/bio in responses, null in private shell

- [x] **Partial TDD** for:
  - Web Avatar component (Vitest) — image vs. initials rendering
  - Web settings page — avatar upload section, bio textarea, displayName input
  - Mobile Avatar component — rendering tests

### File Changes

**New — Migrations:**
- `backend/src/main/resources/db/migration/V18__add_avatar_and_bio_to_users.sql` — add `avatar_url VARCHAR(500)` and `bio VARCHAR(200)` to users

**New — Backend:**
- `backend/.../config/StorageProperties.java` — Supabase storage config record
- `backend/.../service/StorageService.java` — storage interface
- `backend/.../service/impl/SupabaseStorageService.java` — Supabase REST client for upload/delete
- `backend/.../service/AvatarService.java` — orchestrates validate → resize → upload → persist
- `backend/.../dto/AvatarUploadResponse.java` — `record AvatarUploadResponse(String avatarUrl)`

**New — Web:**
- `web/src/components/ui/Avatar.tsx` — shared avatar component (image or initials)

**New — Mobile:**
- `mobile/src/components/ui/Avatar.tsx` — RN avatar component

**New — Tests:**
- `backend/.../service/AvatarServiceTest.java`
- `web/src/components/ui/__tests__/Avatar.test.tsx`

**Modified — Backend:**
- `backend/pom.xml` — add Thumbnailator dependency
- `backend/.../resources/application.yml` — storage config + multipart limits
- `backend/.../domain/User.java` — add `avatarUrl`, `bio` fields + setters; add `displayName` setter
- `backend/.../dto/AuthResponse.java` — add `avatarUrl`, `bio`, `displayName`; update constructors
- `backend/.../dto/LearnerProfileResponse.java` — add `avatarUrl`, `bio`; update factory methods
- `backend/.../dto/UpdateUserSettingsRequest.java` — add `bio`, `displayName`
- `backend/.../service/UserService.java` — add `updateBio()`, `updateDisplayName()`, `updateAvatarUrl()`
- `backend/.../service/LearnerService.java` — pass new fields to response factories
- `backend/.../controller/UserSettingsController.java` — avatar upload/delete endpoints, bio/displayName in PATCH
- `backend/.../controller/AuthController.java` — pass new fields in AuthResponse
- `backend/.../controller/AuthMobileController.java` — pass new fields in AuthResponse
- `backend/.../exception/GlobalExceptionHandler.java` — handle multipart size exceeded

**Modified — Web:**
- `web/src/lib/learnerApi.ts` — add avatarUrl, bio to LearnerProfileResponse
- `web/src/lib/userApi.ts` — add bio, displayName to payload; add uploadAvatar/deleteAvatar
- `web/src/lib/api.ts` — ensure FormData body skips Content-Type header
- `web/src/lib/auth.ts` — add avatarUrl, bio, displayName to AuthResponse type
- `web/src/contexts/AuthContext.tsx` — add avatarUrl, bio, displayName to AuthUser
- `web/src/components/auth/UserMenu.tsx` — avatar thumbnail + @handle profile link
- `web/src/app/[locale]/learners/[handle]/page.tsx` — render avatar + bio
- `web/src/app/[locale]/settings/page.tsx` — avatar upload section, bio textarea, displayName input
- `web/src/locales/en.json` — profile/avatar/bio/displayName keys
- `web/src/locales/pt-BR.json` — same keys

**Modified — Mobile:**
- `mobile/src/lib/auth.ts` — add avatarUrl, bio, displayName
- `mobile/src/lib/userApi.ts` — add bio, displayName, uploadAvatar, deleteAvatar
- `mobile/src/screens/app/ProfileScreen.tsx` — avatar display/upload, displayName, bio editing
- `mobile/src/i18n/locales/en.ts` — avatar/bio/displayName keys
- `mobile/src/i18n/locales/pt-BR.ts` — same keys

**Modified — Tests (cascading from AuthResponse shape change):**
- `backend/.../controller/LearnerControllerTest.java`
- `backend/.../service/LearnerServiceTest.java`
- `backend/.../controller/AuthControllerTest.java`
- `backend/.../controller/AuthControllerGoogleTest.java`
- `backend/.../controller/UserSettingsControllerTest.java`

---

## Dependencies

**Blocked by:** None (5.2 is already implemented)

**Blocks:**
- Phase 6.5 (Discovery Feed) — profiles need to have personality before discovery makes sense

**External:**
- Supabase Storage bucket `avatars` must be created (public-read, service-key-write)
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables must be set in Railway
- Thumbnailator library (net.coobird:thumbnailator:0.4.20)
- expo-image-picker (mobile, for camera roll access)

---

## Implementation Order

| # | Commit scope | Description |
|---|-------------|-------------|
| 1 | DB + Entity | V18 migration + User.java (avatarUrl, bio fields, displayName setter) |
| 2 | Bio + DisplayName | UpdateUserSettingsRequest, UserService methods, URL validation, controller wiring, unit tests |
| 3 | DTO updates | AuthResponse + LearnerProfileResponse add new fields; fix all cascading call sites and tests |
| 4 | Storage layer | StorageProperties, StorageService, SupabaseStorageService, Thumbnailator dep, multipart config |
| 5 | Avatar endpoints | AvatarService, POST/DELETE /me/avatar, AvatarUploadResponse, unit tests |
| 6 | Web: Avatar component | Avatar.tsx with image/initials modes + tests |
| 7 | Web: API + AuthContext | learnerApi.ts, userApi.ts, auth.ts, AuthContext.tsx, api.ts FormData fix |
| 8 | Web: Profile page | Avatar + bio display on learner profile page |
| 9 | Web: Settings page | Avatar upload/remove, displayName input, bio textarea, i18n |
| 10 | Web: Header | UserMenu avatar thumbnail + @handle profile link |
| 11 | Mobile: Types + Avatar | auth.ts, userApi.ts, Avatar.tsx component |
| 12 | Mobile: ProfileScreen | Avatar display/upload, displayName, bio, i18n |

---

## Verification

1. **Backend tests:** `mvn verify` — all existing + new tests pass, JaCoCo coverage maintained
2. **Web tests:** `npm run test` in `/web` — Avatar component tests + updated settings/profile tests
3. **Manual smoke test (web):**
   - Upload avatar from settings → appears on profile page and header
   - Delete avatar → initials placeholder shows
   - Edit bio → appears on public profile
   - Edit display name → reflected everywhere
   - View another user's public profile → avatar + bio visible, no counts
   - View another user's private profile → only handle + private message
4. **Manual smoke test (mobile):**
   - Upload avatar from ProfileScreen → appears in user card
   - Edit bio and display name → saved correctly
5. **API verification:** `GET /auth/me` returns avatarUrl, bio, displayName

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._
