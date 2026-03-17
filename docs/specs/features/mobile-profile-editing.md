# Mobile Profile Editing

> **Status:** Implemented
> **Created:** 2026-03-09
> **Reviewed:** 2026-03-17
> **Implemented:** 2026-03-17

---

## Context

Milestone 6.3 (Learner Profiles) implemented avatar upload, bio, and display name editing on the **web** settings page. The mobile `ProfileScreen` received partial work: it displays `avatarUrl`, `displayName`, and `bio` from `AuthContext` (read-only), and already has handlers for the `profileVisibility` and `defaultPokVisibility` toggles via `updateUserSettings`. However, it has no edit capability for display name, bio, or avatar.

All the required API surface exists:
- `updateUserSettings({ displayName, bio })` via `mobile/src/lib/userApi.ts`
- `uploadAvatar(uri, type, fileName)` via `mobile/src/lib/userApi.ts`
- `deleteAvatar()` via `mobile/src/lib/userApi.ts`

What is missing:
- Edit UI for display name and bio on `ProfileScreen`
- Avatar upload and remove actions on `ProfileScreen`
- `AuthContext.updateUser(patch)` to keep in-memory user state in sync after mutations (the web `AuthContext` already has this; mobile does not)
- A new `AvatarPicker` component that encapsulates the pick-upload-remove flow

**Related:**
- `docs/specs/features/learner-profiles.md` — Milestone 6.3 (foundation; web implementation reference)
- `mobile/src/screens/app/ProfileScreen.tsx` — screen to extend
- `mobile/src/contexts/AuthContext.tsx` — needs `updateUser`
- `mobile/src/lib/userApi.ts` — API functions that already exist
- `web/src/app/[locale]/settings/page.tsx` — web reference implementation

---

## Goals

1. Allow mobile users to edit their display name inline on `ProfileScreen`.
2. Allow mobile users to edit their bio inline on `ProfileScreen` with a character counter.
3. Allow mobile users to upload a new avatar or remove their existing one via `expo-image-picker`.
4. Keep `AuthContext` user state in sync after every successful mutation (optimistic-style update so the UI reflects the change immediately, even across navigations).
5. Encapsulate avatar pick/upload/remove logic in a reusable `AvatarPicker` component.

---

## Non-Functional Requirements

- **NFR1 — Test coverage _(Must Have)_:** All new code must maintain the 80% line coverage threshold configured in `jest.config.js`. New components and handlers must each have unit tests.
- **NFR2 — Responsiveness _(Must Have)_:** Save buttons show a loading state within one render cycle of tapping; the UI must not appear frozen. Async operations run asynchronously and do not block the JS thread.
- **NFR3 — Content safety _(Must Have)_:** `ProfileScreen` edits only `displayName`, `bio`, and `avatarUrl` — never the content of any learning (POK). The `updateUser` patch is constrained to `Partial<AuthResponse>` which contains no POK fields.
- **NFR4 — Graceful degradation _(Should Have)_:** If `expo-image-picker` permission is denied, the avatar edit flow degrades gracefully with an informative alert — the rest of `ProfileScreen` remains fully functional.

---

## Non-Goals

- 4-tier visibility controls (PRIVATE / COLLEAGUES_ONLY / FOLLOWERS_ONLY / PUBLIC) — covered in a separate spec; current implementation only exposes PRIVATE/PUBLIC toggles.
- Google OAuth sign-in — separate spec.
- Password reset — separate spec.
- Handle or email editing — not planned.
- Profile visibility controls — already implemented on `ProfileScreen`; not modified here.
- Backend changes — all API endpoints are already implemented.
- Web changes — already implemented in Milestone 6.3.

---

## Technical Constraints

**Stack:** Mobile

**Technologies:** Expo SDK 53, React Native 0.76.x, TypeScript 5 (strict), `expo-image-picker` (Expo SDK 53 bundled), `expo-secure-store`, React Navigation 6

**Integration Points:**
- `mobile/src/contexts/AuthContext.tsx` — adds `updateUser` to context value and provider
- `mobile/src/lib/userApi.ts` — existing `updateUserSettings`, `uploadAvatar`, `deleteAvatar` (no changes)
- `mobile/src/components/ui/Avatar.tsx` — consumed by `AvatarPicker`; falls back to initials when `avatarUrl` is `undefined` (existing behaviour, no changes)
- Backend `PATCH /api/v1/users/me` and `POST /api/v1/users/me/avatar` — already implemented (Milestone 6.3)

**Out of Scope:**
- 4-tier visibility controls (PRIVATE / COLLEAGUES_ONLY / FOLLOWERS_ONLY / PUBLIC)
- Google OAuth sign-in
- Password reset
- Handle or email editing
- Profile visibility controls (already implemented)
- Any backend or web changes

---

## Functional Requirements

### FR1 — Display name editing _(Must Have)_

`ProfileScreen` shows an editable text input pre-filled with `user.displayName`. A "Save" button adjacent to the field triggers `updateUserSettings({ displayName })`. On success, `updateUser({ displayName })` is called to sync `AuthContext`. On failure, an error alert is shown and the field reverts to its previous value. The field enforces a 100-character maximum. The button is disabled while the save is in flight.

### FR2 — Bio editing _(Must Have)_

`ProfileScreen` shows an editable multiline text input pre-filled with `user.bio`. A character counter reads `{n}/200` and updates as the user types. A "Save" button triggers `updateUserSettings({ bio })`. On success, `updateUser({ bio })` is called. On failure, an error alert is shown and the field reverts. The field enforces a 200-character maximum. The button is disabled while the save is in flight.

### FR3 — Avatar upload _(Must Have)_

`ProfileScreen` (via `AvatarPicker`) shows the user's current avatar (or initials placeholder). Tapping the avatar or an "Change photo" button opens the device media library using `expo-image-picker`. Only JPEG, PNG, and WebP images are accepted (enforced client-side before upload). Files larger than 2 MB are rejected with an error alert before upload. On selection of a valid image, `uploadAvatar(uri, type, fileName)` is called. On success, `updateUser({ avatarUrl })` is called. On failure, an error alert is shown and the avatar is unchanged. The avatar area is disabled while an upload is in flight.

### FR4 — Avatar remove _(Must Have)_

When the user has an existing avatar, `AvatarPicker` shows a "Remove photo" option (destructive). Tapping it shows a confirmation dialog ("Remove your profile photo?"). On confirmation, `deleteAvatar()` is called. On success, `updateUser({ avatarUrl: undefined })` is called and the initials placeholder is shown. On cancellation or failure, no change occurs.

### FR5 — `AuthContext.updateUser(patch)` _(Must Have)_

`AuthContextValue` gains a new `updateUser(patch: Partial<AuthResponse>)` method that performs a shallow merge of `patch` into the current `user` state. It is a no-op when `user` is null. This method is exported from `useAuth()` and callable from any screen or component that mutates user settings. It does not trigger a re-fetch of `/auth/me`.

### FR6 — `AvatarPicker` component _(Must Have)_

A new `mobile/src/components/ui/AvatarPicker.tsx` component wraps:
- `Avatar` display (current avatarUrl or initials)
- Image library picker launch (via `expo-image-picker`)
- Upload-in-progress indicator (loading state on the avatar area)
- "Remove photo" action with confirmation dialog

Props: `avatarUrl`, `displayName`, `handle`, `size`, `onUpload(uri, type, fileName)`, `onRemove`, `uploading`.

The component has no domain API calls — it receives callbacks and does not call `uploadAvatar` or `deleteAvatar` directly. It does call `expo-image-picker` APIs and `Alert` (side effects scoped to the component's own UX). The caller (`ProfileScreen`) owns all async save logic and state.

---

## Acceptance Criteria

### AC1: Display name saved and reflected immediately
**GIVEN** an authenticated user with `displayName = "Alice"`
**WHEN** they change the display name field to "Alice Smith" and tap Save
**THEN** `updateUserSettings` is called with `{ displayName: "Alice Smith" }`, the field shows "Alice Smith", and the profile card header also updates (via `AuthContext`) without a page reload.

### AC2: Display name field enforces max length
**GIVEN** an authenticated user on ProfileScreen
**WHEN** they type more than 100 characters into the display name field
**THEN** the field stops accepting input at 100 characters (enforced by `maxLength` on the input).

### AC3: Bio saved with character counter
**GIVEN** an authenticated user
**WHEN** they type "I love learning!" into the bio field
**THEN** the counter reads "17/200" and the Save button is enabled.
**WHEN** they tap Save
**THEN** `updateUserSettings` is called with `{ bio: "I love learning!" }` and the bio displayed in the profile card updates.

### AC4: Bio revert on error
**GIVEN** an authenticated user whose `updateUserSettings` call fails
**WHEN** they tap Save on the bio field
**THEN** an error alert is shown and the bio field reverts to its previous value.

### AC5: Avatar upload from media library
**GIVEN** an authenticated user
**WHEN** they tap the avatar area and select a valid JPEG image (≤2 MB) from the library
**THEN** `uploadAvatar` is called with the selected file's `uri`, `mimeType`, and `fileName`, and on success `AvatarPicker` renders the new `avatarUrl` returned by `updateUser`.

### AC6: Avatar upload rejects oversized image
**GIVEN** an authenticated user
**WHEN** they select an image larger than 2 MB
**THEN** an error alert is shown ("Image must be under 2 MB") and `uploadAvatar` is not called.

### AC7: Avatar remove with confirmation
**GIVEN** an authenticated user with an existing avatar
**WHEN** they tap "Remove photo" and confirm in the dialog
**THEN** `deleteAvatar` is called and the avatar area shows the initials placeholder.

### AC8: Avatar remove cancelled
**GIVEN** an authenticated user with an existing avatar
**WHEN** they tap "Remove photo" and dismiss the confirmation dialog
**THEN** `deleteAvatar` is not called and the avatar is unchanged.

### AC9: `updateUser` reflects changes in `useAuth` consumers
**GIVEN** `ProfileScreen` is mounted and reads `useAuth().user.displayName`
**WHEN** `updateUser({ displayName: "Alice Smith" })` is called
**THEN** the display name `TextInput` value in `ProfileScreen` updates to "Alice Smith" within the same render cycle (via the `useEffect` sync from `user`).

### AC10: Save buttons disabled during in-flight requests
**GIVEN** a display name or bio Save request is in flight
**THEN** the corresponding Save `Button` has `disabled={true}` and the button label shows the saving text (`profile.displayNameSaving` / `profile.bioSaving`) until the request resolves or rejects.

### AC11: Bio field enforces max length
**GIVEN** an authenticated user on ProfileScreen
**WHEN** they type more than 200 characters into the bio field
**THEN** the field stops accepting input at 200 characters (enforced by `maxLength` on the input).

### AC12: Avatar upload rejects unsupported file type
**GIVEN** an authenticated user
**WHEN** `expo-image-picker` returns an asset whose `mimeType` is not `image/jpeg`, `image/png`, or `image/webp` (e.g., `image/gif`)
**THEN** an error alert is shown ("Unsupported file type. Please select a JPEG, PNG, or WebP image.") and `uploadAvatar` is not called.

### AC13: `updateUser` is a no-op when user is null
**GIVEN** the `AuthContext` user is `null` (unauthenticated state)
**WHEN** `updateUser({ displayName: "Alice" })` is called
**THEN** no error is thrown, `setUserState` is not called, and the context user remains `null`.

---

## Screens

### Screen: ProfileScreen (modified)

**Purpose:** User views and edits their public-facing identity — display name, bio, and avatar — alongside existing privacy/visibility settings.

**Layout:**
1. **Identity card** (top) — `AvatarPicker` (avatar tap → image picker; "Remove photo" link below when avatar exists), display name `TextInput` + Save button, bio multiline `TextInput` + character counter + Save button
2. **Settings section** (below identity card) — existing `profileVisibility` / `defaultPokVisibility` toggles (unchanged)
3. **Logout button** (bottom) — unchanged

**Components:**
- `ProfileScreen` → `Card` → `AvatarPicker` (new), `TextInput` (displayName), `Button` (Save displayName), `TextInput` (bio, multiline), `Text` (char counter), `Button` (Save bio)

**States:**
- **Default (read/edit):** All fields pre-filled; Save buttons enabled; avatar shown or initials placeholder
- **Saving (displayName):** Display name Save button disabled, label = `profile.displayNameSaving`; bio Save and avatar controls remain enabled
- **Saving (bio):** Bio Save button disabled, label = `profile.bioSaving`; display name Save and avatar controls remain enabled
- **Uploading (avatar):** `AvatarPicker` shows `ActivityIndicator` overlay; avatar pressable disabled; other fields remain enabled
- **Error:** `Alert.alert` shown; affected field reverts to previous value; button re-enabled

**i18n:** See i18n keys table in `## Technical Design > ### i18n keys`.

**Interactions:**
- Tap avatar / "Change photo" → request `MEDIA_LIBRARY` permission → launch image picker (lazy, on first tap only)
- Select image → validate type → validate size (if `fileSize` known) → call `onUpload` → `ProfileScreen` calls `uploadAvatar` → on success `updateUser({ avatarUrl })`
- Tap "Remove photo" → confirmation dialog → on confirm call `onRemove` → `ProfileScreen` calls `deleteAvatar` → on success `updateUser({ avatarUrl: undefined })`
- Edit display name → tap Save → `handleDisplayNameSave()` → on success `updateUser({ displayName })`, on failure revert + alert
- Edit bio → tap Save → `handleBioSave()` → on success `updateUser({ bio })`, on failure revert + alert
- Navigate away during in-flight save → request completes silently; if screen has unmounted, state updates are skipped (no-op); no error thrown

**Accessibility:**
- Display name `TextInput` has `accessibilityLabel={t('profile.displayNamePlaceholder')}`
- Bio `TextInput` has `accessibilityLabel={t('profile.bioPlaceholder')}`
- Save buttons have `accessibilityState={{ disabled: isSaving }}` and `accessibilityLabel` matching button text
- `AvatarPicker` pressable has `accessibilityLabel={t('profile.changeAvatar')}` and `accessibilityRole="button"`

---

## Technical Design

### `AuthContext.updateUser`

Add to `AuthContextValue`:

```typescript
updateUser: (patch: Partial<AuthResponse>) => void;
```

Implementation in `AuthProvider`:

```typescript
const updateUser = useCallback((patch: Partial<AuthResponse>) => {
  setUserState((prev) => (prev ? { ...prev, ...patch } : prev));
}, []);
```

Expose via the `value` memo alongside `setUser`, `logout`.

### `AvatarPicker` component

```typescript
// mobile/src/components/ui/AvatarPicker.tsx

interface AvatarPickerProps {
  avatarUrl?: string;
  displayName: string;
  handle: string;
  size?: number;
  uploading: boolean;
  onUpload: (uri: string, type: string, fileName: string) => void;
  onRemove: () => void;
}
```

Internal flow:
1. Renders `<Avatar>` wrapped in a `<Pressable>`.
2. On press, calls `ImagePicker.requestMediaLibraryPermissionsAsync()` (lazy — only on first tap). If denied, shows alert with `t('profile.avatarPermissionDenied')` and returns.
3. Calls `ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.9 })`. The `aspect: [1, 1]` gives the user a preview of the square crop that matches the 200×200 server resize.
4. If `result.canceled` is true, returns without action.
5. Validates `mimeType` — if not `image/jpeg`, `image/png`, or `image/webp`, shows error alert and returns (AC12).
6. Validates file size: if `asset.fileSize` is defined and `> 2 * 1024 * 1024`, shows error alert ("Image must be under 2 MB") and returns (AC6). If `asset.fileSize` is `undefined` (common on some Android versions), skips the client-side size check and proceeds — the server enforces 2 MB regardless.
7. Calls `onUpload(asset.uri, asset.mimeType ?? 'image/jpeg', asset.fileName ?? 'avatar.jpg')`.
8. When `avatarUrl` is set, renders a secondary "Remove photo" pressable (text, destructive color) below the avatar.

The `uploading` prop controls a loading overlay (`ActivityIndicator`) on the avatar area and sets the pressable to `disabled`.

**Permission:** `expo-image-picker` requires the `MEDIA_LIBRARY` permission on Android and `NSPhotoLibraryUsageDescription` on iOS. The component requests permission via `ImagePicker.requestMediaLibraryPermissionsAsync()` before launching the library; if denied, an alert is shown.

### `ProfileScreen` changes

New state:

```typescript
const [displayName, setDisplayName] = useState(user?.displayName ?? '');
const [bio, setBio] = useState(user?.bio ?? '');
const [displayNameSaving, setDisplayNameSaving] = useState(false);
const [bioSaving, setBioSaving] = useState(false);
const [avatarUploading, setAvatarUploading] = useState(false);
```

New `useEffect` to sync from `user` when `AuthContext` is updated externally (mirrors web settings page pattern):

```typescript
useEffect(() => {
  if (user) {
    setDisplayName(user.displayName ?? '');
    setBio(user.bio ?? '');
  }
}, [user]);
```

**Navigate-away during in-flight save:** No navigation guard is implemented. If the user navigates away mid-save, the async handler continues to completion. On success, `updateUser` is called (updating `AuthContext` globally — harmless). State setters (`setDisplayNameSaving`, etc.) are called on an unmounted component, which React 18+ silently ignores (no-op, no error). This is acceptable for this feature's scope.

New handlers:

- `handleDisplayNameSave()` — calls `updateUserSettings({ displayName })`, then `updateUser({ displayName })` on success, reverts + Alert on failure.
- `handleBioSave()` — calls `updateUserSettings({ bio })`, then `updateUser({ bio })` on success, reverts + Alert on failure.
- `handleAvatarUpload(uri, type, fileName)` — wraps `uploadAvatar(uri, type, fileName)`, calls `updateUser({ avatarUrl })` on success, Alert on failure.
- `handleAvatarRemove()` — calls `deleteAvatar()`, calls `updateUser({ avatarUrl: undefined })` on success, Alert on failure.

The profile identity `Card` (currently read-only) gains the `AvatarPicker` in place of the static `Avatar`, plus display name and bio `TextInput` fields each with their own Save button.

### i18n keys

New keys to add under `profile` namespace in `mobile/src/i18n/locales/en.ts` and `pt-BR.ts`:

| Key | EN | PT-BR |
|-----|----|-------|
| `profile.displayNamePlaceholder` | Your name | Seu nome |
| `profile.displayNameSave` | Save | Salvar |
| `profile.displayNameSaving` | Saving… | Salvando… |
| `profile.bioPlaceholder` | A short bio | Uma bio curta |
| `profile.bioSave` | Save | Salvar |
| `profile.bioSaving` | Saving… | Salvando… |
| `profile.bioCharCount` | `{count}/200` | `{count}/200` |
| `profile.avatar` | Profile photo | Foto de perfil |
| `profile.changeAvatar` | Change photo | Alterar foto |
| `profile.removeAvatar` | Remove photo | Remover foto |
| `profile.removeAvatarConfirmTitle` | Remove profile photo? | Remover foto de perfil? |
| `profile.removeAvatarConfirmOk` | Remove | Remover |
| `profile.avatarTooLarge` | Image must be under 2 MB | A imagem deve ter menos de 2 MB |
| `profile.avatarUnsupportedType` | Unsupported file type. Please select a JPEG, PNG, or WebP image. | Tipo de arquivo não suportado. Selecione uma imagem JPEG, PNG ou WebP. |
| `profile.avatarPermissionDenied` | Photo library access denied | Acesso à biblioteca de fotos negado |
| `profile.saveSuccess` | Saved | Salvo |
| `profile.saveError` | Failed to save. Please try again. | Falha ao salvar. Tente novamente. |

---

## Testing

### Unit tests — `mobile/src/components/ui/__tests__/AvatarPicker.test.tsx`

Run under the `components` jest project (`testEnvironment: 'node'`, native modules stubbed).

| Test | Description |
|------|-------------|
| Renders Avatar with avatarUrl when provided | Image src set correctly |
| Renders initials placeholder when no avatarUrl | Avatar initials shown |
| Calls onUpload after valid image selection | Mock `ImagePicker.launchImageLibraryAsync` returns asset; `onUpload` called with uri/type/fileName |
| Does not call onUpload when picker is cancelled | `ImagePicker` returns `cancelled: true`; `onUpload` not called |
| Shows remove option only when avatarUrl is set | "Remove photo" pressable absent when avatarUrl is undefined |
| Calls onRemove when confirm pressed | Alert mock triggers OK callback; `onRemove` called |
| Does not call onRemove when dialog cancelled | Alert mock triggers Cancel callback; `onRemove` not called |
| Shows loading indicator when uploading=true | Activity indicator or disabled state rendered |

### Unit tests — `mobile/src/contexts/__tests__/AuthContext.test.tsx`

Run under the `lib` jest project (`testEnvironment: 'node'`). Note: an existing `authContext.test.ts` lives at `mobile/src/lib/__tests__/` and tests token-related auth flows — this new file is separate and tests only the `updateUser` method added to the context.

| Test | Description |
|------|-------------|
| `updateUser` merges patch into user state | setUserState called with spread; new fields reflected in context value |
| `updateUser` is a no-op when user is null | No error; state unchanged (AC13) |

### Unit tests — `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx`

Run under `rn` jest project (jest-expo preset).

| Test | Description |
|------|-------------|
| Renders displayName field pre-filled | Input value matches `user.displayName` |
| Calls `updateUserSettings` on display name save | Fires with correct payload |
| Calls `updateUser` on display name save success | AuthContext updater called with `{ displayName }` |
| Shows error alert on display name save failure | `Alert.alert` called; field reverts |
| Renders bio field pre-filled with char counter | Textarea value + counter correct |
| Calls `updateUserSettings` on bio save | Fires with `{ bio }` |
| Disables Save button while saving | Button disabled prop true during in-flight request |

### Maestro E2E — `mobile/e2e/profile-editing.yaml`

| Flow | Steps |
|------|-------|
| Edit display name | Login → Profile tab → edit displayName field → tap Save → assert updated name in card |
| Edit bio | Login → Profile tab → edit bio field → tap Save → assert updated bio in card |
| Change avatar | Login → Profile tab → tap Change photo → select image → assert avatar updated |
| Remove avatar | Login → Profile tab (with avatar) → tap Remove photo → confirm → assert initials shown |

---

## File Changes

### New

| File | Description |
|------|-------------|
| `mobile/src/components/ui/AvatarPicker.tsx` | New component — wraps Avatar + image picker + remove action |
| `mobile/src/components/ui/__tests__/AvatarPicker.test.tsx` | Unit tests for AvatarPicker |
| `mobile/e2e/profile-editing.yaml` | Maestro E2E flow for profile editing |

### Modified

| File | Change |
|------|--------|
| `mobile/src/contexts/AuthContext.tsx` | Add `updateUser(patch)` to `AuthContextValue` and `AuthProvider` |
| `mobile/src/contexts/__tests__/AuthContext.test.tsx` | Add tests for `updateUser` |
| `mobile/src/screens/app/ProfileScreen.tsx` | Add display name / bio edit fields with Save buttons; wire `AvatarPicker`; add `handleDisplayNameSave`, `handleBioSave`, `handleAvatarUpload`, `handleAvatarRemove` |
| `mobile/src/screens/app/__tests__/ProfileScreen.test.tsx` | Add tests for new edit interactions |
| `mobile/src/i18n/locales/en.ts` | Add new `profile.*` i18n keys (table above) |
| `mobile/src/i18n/locales/pt-BR.ts` | Add same keys in PT-BR |

---

## Dependencies

**Blocked by:** None — all backend APIs are already implemented (Milestone 6.3).

**Requires:** `expo-image-picker` must be installed (`npm install expo-image-picker --legacy-peer-deps`). It is already listed as a dependency in Expo SDK 53 managed workflow; verify it is in `mobile/package.json` before starting.

**Blocks:** Nothing (this is a self-contained mobile-only improvement).

---

## Implementation Order

| # | Commit scope | Description |
|---|-------------|-------------|
| 1 | AuthContext | Add `updateUser(patch)` to `AuthContextValue` + `AuthProvider`; add unit tests |
| 2 | AvatarPicker | New `AvatarPicker` component with pick/upload/remove logic; unit tests |
| 3 | i18n | Add new `profile.*` keys to `en.ts` and `pt-BR.ts` |
| 4 | ProfileScreen | Wire display name edit, bio edit, `AvatarPicker` into `ProfileScreen`; unit tests |
| 5 | E2E | Add Maestro `profile-editing.yaml` flow |

---

## Decisions

> _Open questions resolved during spec review (2026-03-17). All three have been incorporated into the Technical Design above._

1. **`fileSize` undefined on Android → skip client-side check:** When `asset.fileSize` is `undefined`, skip the 2 MB validation and proceed with the upload. The server enforces the 2 MB limit regardless and will return 400 on oversized files.

2. **Image crop UI → enabled with square aspect:** Use `allowsEditing: true` with `aspect: [1, 1]` in `launchImageLibraryAsync`. This shows the system crop UI and gives users a preview of the square crop that matches the 200×200 server resize.

3. **Permission prompt → lazy (on first tap):** Request `MEDIA_LIBRARY` permission inside `AvatarPicker` on the first tap, not on `ProfileScreen` mount. Aligns with the UX mandate of minimum friction.

---

## Post-Implementation Notes

### Commits

| Commit | Description |
|--------|-------------|
| `eb647a6` | chore: install expo-image-picker |
| `d0a29e7` | feat: add updateUser(patch) to AuthContext |
| `d7dfbc4` | feat: add AvatarPicker component with image pick/remove |
| `b0810c7` | feat: add i18n keys for profile editing (EN + PT-BR) |
| `2464217` | feat: wire profile editing into ProfileScreen |
| `8885cb1` | test: add Maestro E2E flow for profile editing |

### Architectural Decisions

1. **`jest.resetAllMocks()` over `jest.clearAllMocks()` in AvatarPicker tests** — `clearAllMocks` only resets call history but leaves `mockImplementation` in place. AvatarPicker tests set Alert mock implementations in some tests (for dialog simulation); using `resetAllMocks` prevents implementation bleed-through between tests.

2. **`Alert` added to `__mocks__/react-native.js` as `jest.fn()`** — Rather than re-mocking `react-native` inline in each test file, the shared mock now exports `Alert: { alert: jest.fn() }`. Tests can spy on it directly via `Alert.alert as jest.Mock`. This is more consistent with how other RN mock exports are used across the project.

3. **`useI18n()` called once (not twice)** — The initial ProfileScreen draft called `useI18n()` twice (once for `t`, once for `locale`/`setAppLocale`). Fixed to a single destructuring call per React hook rules.

### Deviations from Spec

- **Maestro E2E covers only edit-displayName and edit-bio flows.** Avatar pick/remove flows require interaction with the native image picker dialog, which is not automatable via Maestro YAML without platform-specific workarounds (e.g. tapping into the iOS Photos app). The spec listed 4 flows; 2 were implemented; avatar flows are documented as manual-only.
- **ProfileScreen test project is `screens` (node env) not `rn` (jest-expo).** The spec noted tests "run under `rn` jest project (jest-expo preset)" but the project already established that screen tests use the `screens` project (node env) to avoid jest-expo/Node 22 incompatibility. Tests were written accordingly.
- **`profile.bioCharCount` key format uses `{count}` placeholder** rather than a runtime ICU-style replacement — consistent with how other i18n interpolation works in the project. The `t()` function in `ProfileScreen` manually calls `.replace('{count}', String(bio.length))` since i18n-js 4 doesn't auto-substitute without explicit call syntax.

### Lessons Learned

- `jest.resetAllMocks()` vs `jest.clearAllMocks()`: prefer `resetAllMocks` in component test suites where any test sets a `mockImplementation` that shouldn't bleed into subsequent tests.
- Tree traversal for component tests: React elements before mounting have `type = ComponentFunction` (not the DOM string). `findAllByType` must match by `el.type?.name` (function name inferred from variable), not the rendered DOM element type string (e.g. `'button'`). Also access props like `onPress` directly, not the DOM-translated `onClick`.
- `jest.requireMock` called inside a `jest.mock()` factory for the same module causes infinite recursion (the factory calls itself). Fix: add items to the shared `__mocks__/react-native.js` file instead of trying to extend it inline.
