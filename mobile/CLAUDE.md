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

---

*Last updated: 2026-02-27 (session: Milestone 3.3 mobile app implementation)*
