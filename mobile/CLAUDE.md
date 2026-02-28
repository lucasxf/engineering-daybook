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
    │   └── AuthContext.tsx    # useAuth() — session init, setUser, logout, double-401
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
    │   ├── ui/                # Text, Button, TextInput, Card, ErrorMessage
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

---

*Last updated: 2026-02-27 (session: fix/pr-94-review)*
