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
