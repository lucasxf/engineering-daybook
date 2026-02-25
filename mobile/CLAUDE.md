# CLAUDE.md — Mobile Context

> Load this file for mobile sessions (Expo/React Native). Root `CLAUDE.md` is always loaded first.

---

## Tech Stack

- **Framework:** Expo 50+ (React Native)
- **Language:** TypeScript 5+

---

## Project Structure

```
/mobile
├── /src
└── package.json
```

---

## Coding Conventions

Same TypeScript rules as web (explicit types, functional components, custom hooks).

**Mobile-specific:**
- Mobile app is **not yet started** (Phase 3 — Milestone 3.3)
- Reuse authentication logic from web where possible
- Mobile-optimized UI (touch targets, native patterns)

---

## Key Commands

```bash
cd mobile
npx expo start    # Dev server
npx expo build    # Build app
```
