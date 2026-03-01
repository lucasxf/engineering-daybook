# CLAUDE.md — Web Context

> Load this file for web sessions (Next.js/TypeScript). Root `CLAUDE.md` is always loaded first.

---

## Tech Stack

- **Framework:** Next.js 14+
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3+
- **i18n:** next-intl (EN/PT-BR)

---

## Project Structure

```
/web
├── /src
│   ├── /app
│   ├── /components
│   ├── /hooks
│   ├── /lib
│   ├── /locales
│   └── /styles
└── package.json
```

---

## Coding Conventions

```typescript
// Functional components with explicit types
interface PokCardProps {
  pok: Pok;
  onEdit?: (id: string) => void;
}

export function PokCard({ pok, onEdit }: PokCardProps) {
  // ...
}
```

**Rules:**
- Explicit types (avoid `any`)
- Functional components only
- Custom hooks for shared logic
- Tailwind for styling

---

## Key Commands

```bash
cd web
npm run dev      # Dev server
npm run build    # Production build
npm run test     # Run tests (Vitest)
```

---

## Testing

### Unit / Component Tests (Vitest)
- Test runner: Vitest with jsdom
- Tests live alongside source files or in `__tests__/` directories
- Mock `next/navigation` hooks (`useParams`, `useRouter`, `useSearchParams`) in tests
- `useSearchParams` requires `<Suspense>` boundary for SSG pages
- After changing `package.json`, run `npm install` locally to update lock file before committing
- Mock `useAuth` hook in page tests that render components using `useAuth()`:
  ```typescript
  vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({ user: {...}, isAuthenticated: true, isLoading: false, ... }),
  }));
  ```

### E2E Tests (Playwright)
- Test runner: `@playwright/test` (Chromium only)
- Tests live in `web/e2e/` — separate `e2e/tsconfig.json` scoped to `@playwright/test` types
- Runs against `next dev` (started automatically by Playwright's `webServer` config)
- **No live backend needed:** all `http://localhost:8080/api/v1/**` calls mocked with `page.route()`
- Shared helpers in `e2e/helpers/mock-api.ts` — `setupApiMocks(page, config)` handles all routes
- Call `setupApiMocks(page, config)` BEFORE `page.goto()` so routes are registered first
- Commands: `npm run test:e2e` (headless) | `npm run test:e2e:ui` (interactive)

**E2E coverage rule (mandatory):**
> Every new page, route, or multi-step user flow added to the web app MUST have at least one E2E scenario covering the happy path. This is enforced by `/finish-session` and `/implement-spec`. Exceptions (styling-only, copy changes) must be explicitly stated.

---

## Known Pitfalls

- **Use `=== null` (not `!error`) to check for absence of an error string:** HTTP/2 always delivers an empty `statusText` (`""`), so a fetch error derived from `statusText` will be an empty string. A falsy check (`!error`) treats `""` as "no error", causing the UI to skip the error branch entirely and show empty state instead. Always use strict null checks: `error === null` to mean "no error has occurred", and initialize the state to `null` (not `""`).
- **Playwright `webServer` port must be unique per worktree:** Running two worktrees simultaneously causes port conflicts. Set `port` in `playwright.config.ts` to a value other than 3000 (e.g. 3001) for worktree-specific E2E runs. The port only affects local dev/test; it has no impact on CI.
- **`vi.hoisted()` for mocks that must be available before module evaluation:** When a mock factory references a variable that would otherwise be in TDZ (temporal dead zone) at the time `vi.mock(...)` is hoisted, wrap the shared value in `vi.hoisted(() => ...)` and reference the returned object in both the mock factory and the test body. This applies to ALL shared mock functions (not just navigation hooks). Group all shared mocks into a single `vi.hoisted()` call: `const { mockCreateTag, mockAssignTag, mockRemoveTag } = vi.hoisted(() => ({ mockCreateTag: vi.fn(), mockAssignTag: vi.fn(), mockRemoveTag: vi.fn() }));` then reference them in each `vi.mock()` factory. Single-function example: `const mockPush = vi.hoisted(() => vi.fn()); vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));`
- **`Intl.DateTimeFormat` timezone must match UTC-based date bucketing:** When grouping items by month using UTC methods (`getUTCFullYear`, `getUTCMonth`), the header label formatter must also use `timeZone: 'UTC'`. Without it, timestamps near month boundaries (`2026-02-01T00:30:00Z` in UTC-8 = Jan 31 locally) land in the correct bucket but display the wrong month name.
- **`useMemo` for stable object/array deps of `useCallback`:** If a `useCallback` depends on a derived object or array (e.g. `{ sort, tagId }`), wrap that value in `useMemo` first. Without `useMemo`, a new object reference is created on every render, causing the callback to be re-created every render and breaking `useEffect` dependency arrays that include it.

- **Hardcode search mode at the hook layer, not in the API module:** When rolling out a new search mode (e.g. `'hybrid'`) to all users without a toggle, set it in the data-fetching hook (`usePoksData`) rather than baking a default into `pokApi.ts`. The API module should accept `searchMode` as a parameter and pass it through transparently. This keeps the API layer reusable and makes the rollout decision explicit and easy to revert. Example: `pokApi.searchPoks({ ..., searchMode: 'hybrid' })` called from `usePoksData`.

- **Semantic search `NoSearchResults` hint text must distinguish between no-data-yet and no-query-match:** A user with zero learnings sees the same empty state as a user whose search returned nothing. Use the presence of a non-empty `keyword` (or `searchMode`) to select the right copy: `noResultsSemantic` / `noResultsSemanticHint` when a search was performed; `noLearnings` / `noLearningsHint` when the feed is genuinely empty. Both cases must be covered by unit tests.
