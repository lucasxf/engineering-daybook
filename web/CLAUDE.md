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

- Test runner: Vitest with jsdom
- Tests live alongside source files or in `__tests__/` directories
- Mock `next/navigation` hooks (`useParams`, `useRouter`, `useSearchParams`) in tests
- `useSearchParams` requires `<Suspense>` boundary for SSG pages
- After changing `package.json`, run `npm install` locally to update lock file before committing
