# CLAUDE.md — Mobile Context

> Load this file for mobile sessions (Expo/React Native). Root `CLAUDE.md` is always loaded first.

---

## Tech Stack

- **Framework:** Expo SDK 53 (React Native 0.76.x, managed workflow)
- **Language:** TypeScript 5+ (strict mode, `@/` path alias → `src/`)
- **Navigation:** React Navigation 6 (native-stack + bottom-tabs)
- **Forms:** react-hook-form + @hookform/resolvers + zod
- **i18n:** i18n-js 4 + expo-localization
- **Auth storage:** expo-secure-store (tokens only)
- **Media:** expo-image-picker (avatar upload)
- **Testing (unit):** jest 29 + jest-expo preset (two-project config)
- **Testing (E2E):** Maestro YAML flows (`mobile/e2e/`)

---

## Project Structure

```
mobile/
├── app.config.ts          # Expo config with env vars (EXPO_PUBLIC_API_URL)
├── app.json               # App metadata (scheme: learnimo, bundle ID)
├── eas.json               # EAS Build profiles (dev / preview / production)
├── jest.config.js         # Two projects: lib (node env) + rn (jest-expo)
├── e2e/                   # Maestro E2E YAML flows
└── src/
    ├── App.tsx            # Root: GestureHandler > SafeArea > Theme > I18n > Auth > Navigator
    ├── theme/
    │   └── tokens.ts      # palette, spacing, radii, typography, lightTheme, darkTheme
    ├── contexts/
    │   ├── ThemeContext.tsx   # useTheme() — light/dark/system override
    │   ├── I18nContext.tsx    # useI18n() — locale + t()
    │   └── AuthContext.tsx    # useAuth() — session init, setUser, updateUser, logout, double-401
    ├── i18n/
    │   ├── i18n.ts            # i18n-js setup, resolveLocale()
    │   └── locales/en.ts, pt-BR.ts
    ├── navigation/
    │   ├── RootNavigator.tsx  # loading spinner + auth gate (AppTabs vs AuthStack)
    │   ├── AuthStack.tsx      # Login, Register, ForgotPassword, ChooseHandle
    │   └── AppTabs.tsx        # Feed, NewLearning, Profile (bottom tabs)
    ├── lib/                   # API clients and utilities (pure TypeScript)
    │   ├── api.ts             # apiFetch (Bearer + 401 refresh retry), apiPublicFetch
    │   ├── auth.ts            # loginApi, registerApi, googleLoginApi, etc.
    │   ├── pokApi.ts          # CRUD + search for learnings (poks)
    │   ├── tagApi.ts          # Tag CRUD and suggestion management
    │   ├── tokenStore.ts      # In-memory cache + expo-secure-store persistence
    │   ├── validations.ts     # Shared zod schemas (login, register, pok, etc.)
    │   └── __tests__/         # Unit tests (node env, no RN setup needed)
    ├── hooks/
    │   ├── useDebounce.ts     # 300ms debounce for search input
    │   ├── useFeedData.ts     # Paginated feed with refresh + infinite scroll
    │   └── __tests__/
    ├── components/
    │   ├── ui/                # Text, Button, TextInput, Card, ErrorMessage, Avatar, AvatarPicker
    │   └── feed/              # LearningCard, LearningForm
    └── screens/
        ├── auth/              # LoginScreen, RegisterScreen, ForgotPassword, ChooseHandle
        └── app/               # FeedScreen, LearningNewScreen, LearningDetailScreen, ProfileScreen
```

---

## Auth Architecture (Mobile)

Mobile auth uses **JWT tokens in SecureStore** (not httpOnly cookies — unavailable on mobile).

1. **Login/Register:** Backend returns `accessToken` + `refreshToken` in JSON body (RISK-1).
2. **Storage:** `tokenStore.ts` writes to both in-memory cache + `expo-secure-store`.
3. **Session init:** `AuthContext` calls `tokenStore.load()` → if tokens exist, calls `/auth/me`.
4. **Refresh:** `apiFetch` catches 401, sends `{ refreshToken }` in POST body to `/auth/refresh`.
5. **Double-401:** `authFailureListener` clears tokens + sets unauthenticated state.

See `src/lib/api.ts`, `src/lib/tokenStore.ts`, `src/contexts/AuthContext.tsx`.

---

## Jest Configuration

Two jest projects (see `jest.config.js`):

| Project | Environment | Covers |
|---------|-------------|--------|
| `lib` | `node` | `src/lib/__tests__/` and `src/hooks/__tests__/` — pure TS logic |
| `rn` | `jest-expo` | React Native components and hooks with rendering |

**Why two projects?** `jest-expo`'s setup file (`setup.js`) calls `Object.defineProperty` on React Native internals that break under Node 22 with RN 0.76+. Pure TypeScript lib tests (no rendering) run fine in `node` env.

**Run all tests:**
```bash
cd mobile && npm test -- --no-coverage --selectProjects lib
```

**Run with coverage:**
```bash
cd mobile && npm run test:coverage
```

Coverage threshold: **80% lines** (configured in `jest.config.js`).

---

## Key Commands

```bash
cd mobile
npx expo start                          # Dev server (scan QR with Expo Go)
npx expo start --android                # Android emulator
npx expo start --ios                    # iOS simulator (macOS only)
npm test -- --selectProjects lib        # Unit tests (fast, no RN env)
npm run test:coverage                   # Coverage report
maestro test e2e/auth-login.yaml        # Run an E2E flow (requires Maestro CLI)
```

---

## Known Issues / Pitfalls

- **`react@18.3.2` does not exist** — use `18.3.1`. Package.json was fixed during Milestone 3.3 implementation.
- **`jest-expo` preset fails with RN 0.76 in Node 22** — root cause: `Object.defineProperty` on `NativeModules.default` fails. Fixed by using `testEnvironment: 'node'` in a separate jest project for lib tests. See `jest.config.js`.
- **`testMatch` glob fails in `.claude/worktrees/` paths on Windows** — use `testRegex` instead. The `\.claude` directory name causes glob matching to fail with `<rootDir>` substitution. `testRegex` is path-relative and avoids the issue.
- **`<rootDir>` glob on Windows** — `<rootDir>` resolves to the absolute path with mixed separators (`/` and `\`). The `\.` sequence in `\.claude` breaks micromatch glob. Use `testRegex` for any project inside a `.claude/` path.
- **ESLint 9 requires `eslint.config.js`, not `.eslintrc.*`** — `eslint-config-expo@8` uses FlatCompat via `@eslint/eslintrc` to bridge legacy rules into the new flat config format. Do not create `.eslintrc.js` or `.eslintrc.json`; ESLint 9 ignores them silently. The correct file is `eslint.config.js` exporting an array of config objects.
- **npm install requires `--legacy-peer-deps`** — some Expo SDK 53 peer deps conflict with npm's strict resolver. Always use `--legacy-peer-deps`.
- **`app.json` main field** — must be `"node_modules/expo/AppEntry.js"` for Expo managed workflow. Do not set `"src/App.tsx"` as main.
- **Always type `useNavigation` and `useRoute` from the stack `ParamList`:** Using `useNavigation<any>()` discards compile-time navigation safety for route names and params. Import `NativeStackNavigationProp` from `@react-navigation/native-stack` and type the hook with the navigator's `ParamList`. For route params, derive `RouteProp` from the same `ParamList` rather than repeating the shape inline — inline definitions drift silently when the stack changes.

  ```ts
  // WRONG — loses type safety
  const nav = useNavigation<any>();
  type RouteProps = RouteProp<{ LearningDetail: { pokId: string } }, 'LearningDetail'>;

  // CORRECT — single source of truth
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import type { AppStackParamList } from '@/navigation/AppStack';

  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  type RouteProps = RouteProp<AppStackParamList, 'LearningDetail'>;
  ```

- **`refresh()` and `loadMore()` must explicitly reset loading flags on AbortError:** `fetchPage()` returns `null` (not throws) on AbortError, so the `try/catch` block does NOT reset `refreshing` or `loadingMore`. If you have `if (!data) return`, that path bypasses the success branch that clears the flag — leaving the pull-to-refresh spinner or infinite-scroll footer permanently stuck. Always add an explicit state reset in the null path: `if (!data) { setState(prev => ({...prev, refreshing: false})); return; }`.
- **`silentRefresh()` must be guarded by a promise mutex when called from `apiFetch`:** Multiple in-flight API calls that simultaneously receive a 401 will each invoke `silentRefresh()` concurrently. The first rotation invalidates the refresh token, causing all subsequent refresh calls to fail and triggering `authFailureListener()` — a spurious logout. Use a module-scoped `let refreshPromise: Promise<boolean> | null = null` to deduplicate: `if (!refreshPromise) refreshPromise = silentRefresh(); const result = await refreshPromise; refreshPromise = null;`
- **Screen in a tab navigator must use `BottomTabNavigationProp<TabParamList>`, not `NativeStackNavigationProp<StackParamList>`:** Even when a tab screen is nested inside a stack navigator, `useNavigation()` returns the navigation object of the closest parent navigator (the tab). Typing it as the stack's navigation prop makes TypeScript accept incorrect route names. A screen inside `AppTabs` should import `BottomTabNavigationProp` from `@react-navigation/bottom-tabs` and type the hook with `AppTabsParamList` — routes like `'Feed'` are then checked at compile time. Attempting to navigate to a tab route (`'Feed'`) through a stack nav type (`AppStackParamList`) silently succeeds at runtime but TypeScript cannot catch renames.

- **Component unit tests that cannot run under `jest-expo` on Node 22 require a 3rd jest project with `testEnvironment: 'node'`:** The existing two-project setup (`lib` + `rn`) covers pure TypeScript logic (node env) and full React Native rendering (jest-expo). However, `jest-expo`'s setup calls `Object.defineProperty` on RN internals that fail under Node 22 + RN 0.76, which means any component test importing native modules (e.g., `react-native-markdown-display`) cannot run in the `rn` project either. The workaround is to add a 3rd jest project (`components`) with `testEnvironment: 'node'`, a `moduleNameMapper` that stubs out native modules, and manual mocks placed in `src/__mocks__/`. This project covers `src/components/**/__tests__/` files. The `rn` project remains for full-integration screen tests that need the Expo runtime setup. See `jest.config.js` for the configuration. **Important:** the `rn` project's `testRegex` must exclude `components/` via a negative lookahead (e.g. `src/(?!components/).*/__tests__/`) to prevent `MarkdownContent.test.tsx` (and any future component tests) from running in both `rn` and `components` when no `--selectProjects` flag is used. Without the exclusion, component tests are executed twice — once in each project — wasting time and causing confusing duplicate output. (Added 2026-03-06)

  ```js
  // jest.config.js — third project entry
  {
    displayName: 'components',
    testEnvironment: 'node',
    testRegex: 'src/components/.*/__tests__/.*\\.test\\.[jt]sx?$',
    moduleNameMapper: {
      '^react-native-markdown-display$': '<rootDir>/src/__mocks__/react-native-markdown-display.tsx',
      // ... other native module stubs
    },
    preset: 'ts-jest',
  }
  ```

- **`stripMarkdown` italic regex must use word-boundary guards for underscore, not asterisk:** A single pattern `(\*|_)(.*?)\1` incorrectly strips underscores from `snake_case_variable` (e.g., `_case_` matches and removes the surrounding underscores, yielding `snakecase_variable`). Fix: split into two patterns — `\*([^*\n]+)\*` for asterisk (safe — `*` is not used in identifiers) and `(?<!\w)_([^_\n]+)_(?!\w)` for underscore (word-boundary safe). Apply both to web and mobile versions of `stripMarkdown`. (Added 2026-03-06)

- **EAS init: Invalid UUID appId from placeholder** — If `app.json` contains a placeholder `"extra": { "eas": { "projectId": "learnimo-mobile" } }` (or any non-UUID string), `eas init` fails with "Invalid UUID appId". Fix: remove the entire `extra.eas` block from `app.json` before running `eas init`. EAS will regenerate it with the real UUID after authenticating. (Added 2026-03-08)

- **EAS build: "Unable to resolve module ../../App"** — `expo/AppEntry.js` (inside `node_modules/expo/`) hard-codes a two-level-up relative import for the root `App` file. If the project keeps its root component at `src/App.tsx` without a root-level re-export, Metro fails with "Unable to resolve module ../../App from node_modules/expo/AppEntry.js". Fix: create `mobile/App.tsx` at the project root containing `export { default } from './src/App';`. (Added 2026-03-08)

- **Gradle: "Could not set unknown property 'enableBundleCompression'"** — Occurs when EAS resolves a newer React Native Gradle plugin (RN 0.77+) during build while `package.json` still pins RN 0.76. The `enableBundleCompression` property was removed in the RN 0.77 Gradle plugin. Fix: upgrade all packages to Expo SDK 53 expected versions (React 18→19, RN 0.76→0.79). Use `npm install --legacy-peer-deps` rather than `expo install --check`, which itself fails with ERESOLVE on SDK 53. (Added 2026-03-08)

- **Detail screen tag pills must use `tagPillBg`/`tagPillText` tokens and `caption` text variant — not `surfaceAlt`/`bodySm`:** The canonical tag pill pattern (established in `LearningCard.tsx`) uses the `tagPillBg` and `tagPillText` semantic tokens for background and text colour, and renders the label using the `caption` Text variant. Using `surfaceAlt` for the pill background or `bodySm` for the text produces a visible mismatch between the feed card and the detail screen. This applies to both the read-mode tag chips and the inline add-tag / remove-tag controls in `LearningDetailScreen`. (Added 2026-03-15)

- **EAS `npm ci` fails with ERESOLVE** — EAS runs `npm ci` (strict lockfile mode) on the build server. Two common causes: (1) `react-test-renderer` is on a different major version than `react` (e.g., `react@19` + `react-test-renderer@18`); (2) peer dep conflicts that local `npm install --legacy-peer-deps` masks. Fix: (a) ensure `react-test-renderer` version matches `react` version exactly; (b) create `mobile/.npmrc` with `legacy-peer-deps=true` so that EAS's `npm ci` uses legacy resolution — EAS copies `.npmrc` from the repo into the build environment. Without `.npmrc`, the build server uses npm defaults (strict), diverging from the local install. (Added 2026-03-08)

- **`eas init` requires local `eas-cli` install before `npx eas init`** — Running `npx eas init` without a prior local install fails because npx cannot locate the binary in ephemeral environments. Fix: run `npm install eas-cli` inside the `mobile/` directory first to add it to `node_modules/.bin/`, then run `npx eas init`. (Added 2026-03-08)

- **Wire `AbortController.signal` all the way through to the API call — a stale `cancelled` flag is not equivalent:** When a hook creates an `AbortController` and passes its `signal` to a cleanup-triggered abort, the signal must be forwarded to the actual `fetch` call (or `apiFetch` wrapper) as a parameter. A local `let cancelled = false` flag set in the cleanup function does not propagate the abort to the in-flight network request — it only stops the hook from setting state after the fact. Result: the network request completes, the backend processes it, and only the state update is skipped. Pattern: `const controller = new AbortController(); return () => controller.abort();` paired with `apiCall({ signal: controller.signal })` at the call site. Seen in `useLearnerProfile.ts` (Copilot review fix, PR #177, 2026-03-11).

- **Expo Google Fonts + fontWeight conflict triggers Android font synthesis:** When using weight-specific Google Font variants (e.g., `Sora_600SemiBold`, `DMSans_500Medium`), the font weight is baked into the filename. Setting a conflicting `fontWeight` in the React Native style prop (e.g., `fontWeight: '700'` on a `600SemiBold` font) causes Android to synthesize the requested weight, producing incorrect and often ugly rendering. Fix: omit `fontWeight` when using weight-specific font variants, or use a `fontWeight` that exactly matches the weight in the filename. Applied in Wave 1 design system migration (Text.tsx title/subheading, MarkdownContent.tsx headings, Avatar.tsx initials). (Added 2026-03-15)

- **`findAllByType` must check both string type and function name when mocking components:** When mock factories return named functions (e.g., `Button: (props) => ...`), the React element's `el.type` is the function itself — not the string `'Button'`. Arrow functions assigned to object properties get their name inferred from the property key in modern JS (e.g., `{ Button: (props) => null }` creates a function whose `.name` is `'Button'`). A `findAllByType(tree, 'Button')` check that only tests `el.type === type` will miss all such elements. Fix: check both conditions — `el.type === type || (el.type as any)?.name === type`. This applies to any traversal helper used with jest.mock factories. (Added 2026-03-15)

  ```ts
  function findAllByType(element: any, type: string): any[] {
    const results: any[] = [];
    function walk(el: any) {
      if (!el || typeof el !== 'object') return;
      if (el.type === type || (el.type as any)?.name === type) results.push(el);
      [el.props?.children].flat().forEach(walk);
    }
    walk(element);
    return results;
  }
  ```

- **`jest.mock()` callCount for `useState` sequencing must live at module scope, not inside the factory closure:** When a factory closure manages a `callCount` variable internally, it persists across tests but cannot be reset from `beforeEach` — the variable is inaccessible from outside the closure. Fix: declare `let mockStateCallCount = 0` at module scope (the `mock` prefix satisfies Jest's hoisting exception for referenced variables). The factory closure then captures the module-scope variable, and `beforeEach` can reset it between tests. This pattern is required for any mock that sequences React `useState` calls differently per test (e.g., loading state on call 1, error state on call 2). (Added 2026-03-15)

  ```ts
  // at module scope — Jest hoisting exception allows 'mock'-prefixed vars
  let mockStateCallCount = 0;

  jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: (init: any) => {
      mockStateCallCount++;
      if (mockStateCallCount === 2) return [true, jest.fn()]; // e.g. loading=true on call 2
      return [init, jest.fn()];
    },
  }));

  beforeEach(() => { mockStateCallCount = 0; });
  ```

---

*Last updated: 2026-03-17 (session: feat/mobile-4-tier-visibility — Wave 4: 4-tier visibility picker across all mobile screens)*
