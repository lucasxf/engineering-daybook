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

- **Sync `AuthContext` after mutating API calls that change user preferences:** When a settings endpoint (e.g., `PATCH /users/me/settings`) returns 204 No Content, the caller cannot read the updated user from the response. Without explicitly calling `updateUser(patch)` on `AuthContext` after success, every component that reads `user.defaultPokVisibility` or `user.profileVisibility` (e.g. `QuickEntry` initializing new POK visibility) sees stale values until the next full page reload. Pattern: expose `updateUser(patch: Partial<AuthUser>)` on `AuthContextValue` and call it in the success handler of any settings mutation.

  ```typescript
  // In AuthContext.tsx — expose the updater
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // In settings/page.tsx — call it after every successful mutation
  await updateUserSettings({ defaultPokVisibility: value });
  updateUser({ defaultPokVisibility: value });
  ```

- **`rehype-sanitize` default schema strips `input` elements and raw HTML blocks:** The default `defaultSchema` from `rehype-sanitize` removes `<input>` tags, which means GFM task list checkboxes (`- [x] item`) are not rendered — only the text label appears. It also strips raw HTML blocks entirely. This is intentional for XSS safety. If task list checkbox rendering is required, a custom schema allowing `input[type=checkbox][disabled]` must be provided. Tests asserting on markdown output must not expect checkboxes or raw HTML to appear when using the default schema. (Added 2026-03-06)

- **`jest.mock()` factory cannot reference variables imported in the outer module scope — use `require()` inside the factory:** Vitest (and Jest) hoist `vi.mock()` / `jest.mock()` calls to the top of the file before any imports are evaluated. Any variable from the outer scope that the factory function closes over will be `undefined` at the time the factory runs (temporal dead zone). The fix is to use `require()` inside the factory body to get the value at call time, or to use `vi.hoisted()` to declare shared values that are initialized before hoisting occurs. This is distinct from the `vi.hoisted()` pitfall above, which covers shared mock functions — this one covers any imported constant or module export referenced directly in a factory. (Added 2026-03-06)

- **`stripMarkdown` italic regex must use word-boundary guards for underscore, not asterisk:** A single pattern `(\*|_)(.*?)\1` incorrectly strips underscores from `snake_case_variable` (e.g., `_case_` matches and removes the surrounding underscores, yielding `snakecase_variable`). Fix: split into two patterns — `\*([^*\n]+)\*` for asterisk (safe — `*` is not used in identifiers) and `(?<!\w)_([^_\n]+)_(?!\w)` for underscore (word-boundary safe). Apply both to web and mobile versions of `stripMarkdown`. (Added 2026-03-06)

- **Align tag name input masks with backend `normalise()` — use `/\s+/g`, not `/ /g`:** The backend `TagService.normalise()` uses `replaceAll("\\s+", "-")` to convert all whitespace (spaces, tabs, non-breaking spaces) to dashes. Frontend `onChange` handlers in tag components must use the same pattern — `value.replace(/\s+/g, '-')` — so that the client-side mask collapses every whitespace run consistently, not just literal ASCII spaces. Using `/ /g` (literal space only) leaves tabs and consecutive spaces unconverted, producing a mismatch between what the user sees and what the backend stores. Applies to `TagPicker.tsx` and `TagSection.tsx` (and any future tag input component). (Added 2026-03-06)

- **Stale dev server reuse in E2E tests when using worktrees:** Playwright's `reuseExistingServer: !process.env.CI` in `playwright.config.ts` reuses any process already listening on port 3001, regardless of which directory it was started from. When working in a git worktree, a dev server started from the main repo's `web/` directory will be reused — serving stale code that doesn't include the worktree's changes. This causes E2E tests for new features to fail with "waiting for locator(...)". Fix: before running E2E in a worktree, kill any existing server on the port: `netstat -ano | grep :3001` to find the PID, then `taskkill //F //PID <pid>` to kill it. Playwright will then start a fresh server from the correct directory. (Added 2026-03-07)

- **`screen.queryByRole()` with non-ARIA element names is vacuous — always returns null:** HTML element names like `'blockquote'` are not recognized ARIA roles in aria-query, so `screen.queryByRole('blockquote')` always returns null regardless of what is rendered. The assertion never fails, making the test meaningless. Use `container.querySelector()` (DOM query) for elements without ARIA roles. (Added 2026-03-08)

  ```ts
  // ❌ vacuous — always returns null
  expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
  // ✅ actual DOM check
  const { container } = render(<Component />);
  expect(container.querySelector('blockquote')).not.toBeInTheDocument();
  ```

- **Two `absolute right-2 top-2` buttons on the same card overlap — use the `onShare` prop as a discriminant:** When a card conditionally shows an edit button (for owners) and a share button (for non-owners), both positioned `absolute right-2 top-2`, they will visually collide if both can appear simultaneously. Use the presence of `onShare` as the discriminant: when `onShare` is provided the viewer is a non-owner, so hide the edit button with `{!onShare && <EditButton />}`. This keeps the two actions mutually exclusive without additional state. (Added 2026-03-08)

- **Map HTTP 400 share errors by `err.message`, not by status code alone:** A 400 from the share API covers multiple distinct failure reasons (self-share, non-PUBLIC original, visibility-tier violation, note length validation). Mapping all 400s to a single error key (e.g. `selfShare`) suppresses the real cause. Inspect `err.message` (populated from the backend's `ApiError.message`) and route to the correct i18n key: `errors.selfShare` for self-share, `errors.notPublic` for sharing not allowed, `errors.noteTooLong` for validation failures. Each new error key must be added to both `en.json` and `pt-BR.json`. (Added 2026-03-08)

- **`getAll()` in `pokApi.ts` must return `Promise<PokListPage>`, not `Promise<PokPage>`:** When the backend can return a mixed feed (`FeedPage` containing `FeedItem[]`), a return type of `PokPage` causes TypeScript to silently accept type mismatches. Downstream hooks typed as `Pok[]` will receive `FeedItem[]` at runtime without any compile-time error. Fix: use the already-defined union return type `Promise<PokListPage>`. Callers that only want plain POKs should filter defensively: `result.content.filter((item): item is Pok => !('originalPokId' in item))`. (Added 2026-03-08)

- **Type predicates on union types must be assignable to the parameter type:** When filtering `FeedItem[]` (a union of `Pok & { type: 'owned' }` and `PokShare`) with a type predicate like `(item): item is Pok`, TypeScript errors because `Pok` is not assignable to `FeedItem` — the union member requires the `type` discriminant field. Fix: include the discriminant in the predicate: `(item): item is Pok & { type: 'owned' }`. This preserves type narrowing while keeping the predicate assignable to the parameter type. (Added 2026-03-08)

  ```typescript
  // ❌ TypeScript error: Pok is not assignable to FeedItem
  items.filter((item): item is Pok => item.type === 'owned')

  // ✅ Correct: include the discriminant
  items.filter((item): item is Pok & { type: 'owned' } => item.type === 'owned')
  ```

- **`waitForRequest` captures Next.js RSC navigation requests too:** A filter like `r.url().includes('/poks')` matches BOTH API calls to `localhost:8080/api/v1/poks?keyword=react&searchMode=hybrid` AND Next.js RSC navigation fetches to `localhost:3001/en/poks?keyword=react`. The RSC request never has `searchMode`, so any assertion depending on API-specific params will fail. Always scope `waitForRequest` filters to the API host: `r.url().startsWith('http://localhost:8080/api/v1/poks')`. (Added 2026-03-11)

- **`Select` renders `role="combobox"`, not `role="button"`:** When testing custom Select dropdowns in E2E tests, use `getByRole('combobox')` to target the trigger, not `getByRole('button')`. The options inside render as `role="option"` within a listbox. (Added 2026-03-11)

- **`MonthGroup` uses `year: '2-digit'` → "January 26" not "January 2026":** When testing month group headings, match `/january/i` (not `/january 2026/i`). Also use `level: 2` to avoid matching `h3` PokCard title headings that share the month name. (Added 2026-03-11)

- **Web coverage baseline:** Current measured line coverage is ~54%. `vitest.config.ts` threshold set to 50% (safe baseline). Target is 80% — raise incrementally as new tests are added. `@vitest/coverage-v8` is the provider. (Added 2026-03-11)

- **`<p>` cannot wrap block-level elements — use `<div>` for hint/helper text slots that may contain block content:** The HTML spec prohibits `<p>` from containing block-level elements such as `<div>`, `<ul>`, or other `<p>` tags. When a hint slot in a form field component (e.g. `FormField.tsx`) accepts a `ReactNode`, callers may pass block-level JSX. Wrapping that content in `<p>` causes the browser to implicitly close the `<p>` tag early, breaking layout and producing invalid DOM structure. Fix: use `<div>` as the hint wrapper whenever the slot accepts arbitrary `ReactNode` content. Seen in `FormField.tsx` (`<p className="...">` → `<div className="...">`). (Added 2026-03-12)

- **`vi.mock()` at module level affects ALL imports in the same file — split test files when mocking sub-components you also want to test directly:** When a test file mocks a sub-component (e.g. `vi.mock('./learning-nav-bar', ...)`) AND later imports that same component to test it directly, the import resolves to the mock, not the real implementation. The test passes vacuously. Fix: put screen-level tests (which need the mocks) in one file (e.g. `view-learning-screen.test.tsx`), and individual component tests (which need the real implementations) in a separate file (e.g. `view-learning-components.test.tsx`) with no conflicting mocks. Rule of thumb: one test file per "mock context". (Added 2026-03-12)

- **TypeScript does not narrow a discriminated union through deeply nested JSX ternaries — add an explicit branch per variant:** When a component accepts discriminated union props (e.g. `props.state === 'loading' | 'loaded' | 'error'`), TypeScript narrows inside an `if`/`switch` block but loses that narrowing across multi-level JSX ternaries. A pattern like `props.state !== 'loading' ? <LoadedView {...props} /> : null` may compile but passes the full union to `<LoadedView>`, which then fails or produces stale type errors when the component expects only the `'loaded'` variant. Fix: add an explicit conditional branch for each variant and assert or cast within that branch:

  ```typescript
  // ❌ TypeScript does not narrow here — props.data is still 'unknown' inside LoadedView
  return props.state === 'loading' ? <Spinner /> : <LoadedView data={props.data} />;

  // ✅ Explicit per-variant branch
  if (props.state === 'loading') return <Spinner />;
  if (props.state === 'error') return <ErrorView message={props.error} />;
  // TypeScript now knows props.state === 'loaded' here
  return <LoadedView data={props.data} />;
  ```

  This also eliminates hydration guards that exist only to paper over the narrowing gap. Seen in `view-learning-screen.tsx`. (Added 2026-03-13)

- **`useTranslations` mock returns raw keys — assert on keys, not translated strings:** The standard test mock `useTranslations: () => (key: string) => key` returns the raw key as-is (e.g. `"view.loadingLabel"`). Any test asserting on a translated string (e.g. `"Carregando aprendizado..."`) will fail because the component renders the raw key, not the translation. Always match assertions to what the mock returns. To assert on human-readable text, either use a real next-intl provider in the test, or change the assertion to use the raw key. (Added 2026-03-13)
