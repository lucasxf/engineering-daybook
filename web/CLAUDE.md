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
│   │   └── /ui          # Shared primitive components (Alert, Button, Card, Input, Select, Textarea, ...)
│   ├── /hooks
│   ├── /lib
│   ├── /locales
│   └── /styles
└── package.json
```

---

## Shared UI Component Library (`components/ui/`)

Primitive, reusable components live in `web/src/components/ui/`. Always check here before writing inline markup.

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Alert` | Error / success / info message block | `variant: 'error' \| 'success' \| 'info'`, `role` |
| `Button` | Primary action button | `variant`, `size`, `disabled`, `loading` |
| `Card` | Surface container | `as: 'div' \| 'article'` (polymorphic) |
| `Input` | Text input | `hasError`, `forwardRef`-enabled |
| `Select` | Accessible custom dropdown | `options`, `value`, `onChange`, keyboard nav, animated chevron, `slideUp` panel |
| `Textarea` | Multi-line text input | `hasError`, `forwardRef`-enabled, mirrors `Input` API |

**Rules:**
- Prefer `ui/Alert` over ad-hoc `<div className="bg-red-...">` error blocks.
- Prefer `ui/Select` over native `<select>` for any styled dropdown (consistent keyboard nav and animation).
- `Card`, `Input`, `Textarea` all use `forwardRef` — pass `ref` freely.
- All `ui/` components have unit tests. When adding a new primitive, add tests alongside it.

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

- **Partial state refresh pattern for pages with in-progress forms:** When a page has both an editable form and a side panel that triggers data fetching (e.g., a tag picker calling `onChanged`), wiring `onChanged` to the full page loader (e.g., `loadPok`) causes the loading gate to toggle (`setLoading(true)`), which unmounts the form and discards any unsaved edits. Instead, add a targeted refresh function that fetches the latest data and updates only the relevant state slice via `setPok((prev) => prev ? { ...prev, tags: data.tags } : data)`, leaving `loading` unchanged. The full loader is only for initial mount; subsequent partial updates use the targeted refresh.

- **Mock ALL hooks a component uses — adding a new hook to a component breaks existing tests:** When a component starts using a new `next/navigation` hook (e.g. `useRouter`) or a third-party hook (e.g. `useTranslations` from `next-intl`), any existing test that only mocked the hooks the component used before will now throw. The test does not import the component under test directly — it renders a parent — so the error surfaces as an unexpected runtime failure in an already-passing test file. Fix: whenever a component gains a new hook import, audit all test files that render that component (directly or via a parent) and extend their mocks. For `next/navigation`, always mock the full set — `useRouter`, `useParams`, `useSearchParams` — even if the current component only uses one; this prevents future drift:

  ```typescript
  vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    useParams: () => ({ locale: 'en' }),
    useSearchParams: () => new URLSearchParams(),
  }));
  ```

  For `next-intl`, add a top-level mock when any child component calls `useTranslations`:

  ```typescript
  vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
  }));
  ```

- **`scrollIntoView` is not implemented in jsdom (Vitest) — use optional chaining on the method:** jsdom, which Vitest uses as its DOM environment, does not implement `scrollIntoView` on DOM elements. Calling `element.scrollIntoView({ block: 'nearest' })` in a component `useEffect` (e.g., inside a custom `Select` dropdown to scroll the active option into view) will throw `TypeError: item?.scrollIntoView is not a function` when the test runs. Fix: use optional chaining on the method itself — `element?.scrollIntoView?.({ block: 'nearest' })` — so the call silently no-ops when the method is absent. The `?.` before the method name (not just before the object) is what matters.

- **`<button>` (or `<Button>`) inside `<Link>` is invalid HTML — restructure to sibling elements:** An `<a>` element cannot contain interactive content (buttons, inputs, other links) per the HTML spec. This manifests as keyboard navigation breakage, WCAG 4.1.1 failures, and unpredictable browser behavior (some browsers fire the click on the outer `<a>`, some on the inner `<button>`, some on both). Two correct patterns:
  1. Make the outer container a `<div>` with `relative` positioning; the `<Link>` wraps only the card content; the interactive button is a sibling with `absolute` positioning so it floats visually inside the card area.
  2. Replace `<Button>` with a styled `<span>` inside `<Link>` when the link itself is the intended action (no separate button needed).

  Seen in: `PokCard.tsx` (pattern 1) and `poks/[id]/page.tsx` (pattern 2). (Added 2026-03-01)

- **`render` prefix on ReactNode props implies a render function — use a noun slot name instead:** React convention treats `render*` props as functions (`() => ReactNode` or `(args) => ReactNode`), not static nodes. A prop typed as `renderAfterContent?: ReactNode` will confuse readers who expect to call it. Use a noun slot name instead: `afterContent`, `contentSlot`, `hint`, or similar. Avoid any `render*` naming on a prop whose type is `ReactNode`. Seen in `PokForm.tsx` (`renderAfterContent` → `afterContent`). (Added 2026-03-01)
