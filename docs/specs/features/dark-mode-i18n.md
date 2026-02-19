# Dark Mode + i18n

> **Status:** Implemented
> **Created:** 2026-02-19
> **Implemented:** 2026-02-19

---

## Context

Engineering Daybook's UI layer already includes `next-themes` for dark mode and `next-intl`
for EN/PT-BR internationalization. Both were scaffolded early in Phase 1 but never audited for
completeness. Concrete gaps found in the codebase:

1. Hardcoded string: `{totalElements} {totalElements === 1 ? 'learning' : 'learnings'} found`
   in `poks/page.tsx:179` — not i18n'd, not pluralized via `next-intl`
2. Hardcoded locale in date formatting: `toLocaleDateString('en-US', ...)` in `PokCard.tsx:31`
   — always formats as US English regardless of active locale
3. Dark mode coverage audit not done for components added during `feat/pok-crud` and
   `feat/pok-listing-search`
4. No tests for `ThemeToggle` or `LanguageToggle` components

This milestone (Roadmap 1.4 — UI/UX Polish) closes these gaps before the Phase 1 MVP is
considered shippable. The goal is to verify, complete, and test what already exists — not to
build new infrastructure.

**Roadmap reference:** Phase 1 › Milestone 1.4 UI/UX Polish
**Related:** `docs/ROADMAP.md` items 1.4.1–1.4.6

---

## Requirements

### Functional

- [ ] **FR1** `[Must]` All user-facing strings in POK listing, detail, create/edit, and layout
  are externalized to `next-intl` locale files and render correctly in both EN and PT-BR.
- [ ] **FR2** `[Must]` The hardcoded `poks/page.tsx:179` count string is replaced with a
  `next-intl` ICU plural message working in both locales
  (`"1 learning found"` vs `"3 learnings found"` / PT-BR equivalents).
- [ ] **FR3** `[Must]` Date formatting uses the active locale — not hardcoded `'en-US'`.
  EN renders `Jan 1, 2026`; PT-BR renders `1 de jan. de 2026`.
- [ ] **FR4** `[Must]` `ThemeToggle` cycles dark → light → system and the theme is applied
  immediately with no flash of unstyled content.
- [ ] **FR5** `[Must]` When theme is `"system"`, the app respects
  `prefers-color-scheme` in real time.
- [ ] **FR6** `[Must]` All components from `feat/pok-crud` and `feat/pok-listing-search`
  milestones are audited and have correct `dark:` Tailwind classes. Nothing unreadable in dark.
- [ ] **FR7** `[Must]` `LanguageToggle` switches the full UI to the selected locale including
  pluralized strings and date formats.
- [ ] **FR8** `[Should]` Locale persists within the session via URL prefix (`/en/...`,
  `/pt-BR/...`). No cookie or backend persistence needed for Phase 1.
- [ ] **FR9** `[Won't — Phase 1]` Backend `User.locale` field sync is out of scope.

### Non-Functional

- [ ] **NFR1** `[Must]` No FOUC — theme class applied before first paint via `next-themes`
  `suppressHydrationWarning`.
- [ ] **NFR2** `[Must]` Theme and locale persist across client-side navigation within a session.
- [ ] **NFR3** `[Must]` `ThemeToggle` and `LanguageToggle` are keyboard-navigable with
  descriptive `aria-label` values reflecting current state.
- [ ] **NFR4** `[Must]` All text/interactive elements meet WCAG 2.1 AA contrast ratios
  (4.5:1 normal text, 3:1 large text) in both light and dark themes.
- [ ] **NFR5** `[Should]` Unit test coverage for `ThemeToggle` and `LanguageToggle` before
  milestone close.

---

## Technical Constraints

**Stack:** Web (Next.js 15 / TypeScript)

**Technologies:**
- `next-themes@0.4.4` — SSR-safe theme management, `class` strategy
- `next-intl@4.8.3` — i18n middleware, ICU plural support, `useTranslations()` / `getTranslations()`
- `tailwindcss@3.4.17` — `dark:` class strategy, CSS custom properties for theme
- `vitest@4.0.18` + `@testing-library/react@16.3.2` — component testing

**Integration Points:**
- `src/app/layout.tsx` — root `ThemeProvider` (already configured: `defaultTheme="dark"`, `enableSystem`)
- `src/app/[locale]/layout.tsx` — `NextIntlClientProvider` wrapper, header with both toggles
- `src/components/ui/ThemeToggle.tsx` — cycles dark/light/system, hydration-safe
- `src/components/ui/LanguageToggle.tsx` — switches locale via `window.location.href`
- `src/locales/en.json` + `src/locales/pt-BR.json` — all locale strings (already comprehensive)
- `src/middleware.ts` — `localePrefix: 'always'`, locale routing

**Out of Scope:**
- Mobile app (Expo) — separate milestone
- Backend `User.locale` persistence
- Custom color themes beyond dark/light/system
- Font size preferences or high-contrast mode

---

## Acceptance Criteria

### AC1: Dark mode default on first visit
**GIVEN** a user visits the app for the first time with no saved theme preference
**WHEN** the page loads
**THEN** the dark theme is applied by default and `ThemeToggle` reflects "dark"

### AC2: System preference respected
**GIVEN** the user has selected theme "system" and OS preference is "dark"
**WHEN** the OS preference changes to "light"
**THEN** the app re-renders in light mode without a page reload

### AC3: Theme persists across navigation
**GIVEN** the user has selected the "light" theme
**WHEN** the user navigates to a learning detail page
**THEN** light theme remains active with no flash of dark content

### AC4: Language toggle switches full UI locale
**GIVEN** the user is on the learning list in EN (`/en/poks`)
**WHEN** the user activates `LanguageToggle` and selects PT-BR
**THEN** all UI strings switch to Portuguese, URL becomes `/pt-BR/poks`, and navigation preserves the locale

### AC5: Locale-aware date formatting
**GIVEN** a learning was created on January 1, 2026
**WHEN** the user views the list in EN
**THEN** the date displays in EN conventions (e.g., `Jan 1, 2026`)
**WHEN** the user switches to PT-BR
**THEN** the date displays in PT-BR conventions (e.g., `1 de jan. de 2026`)

### AC6: Pluralized results count in both locales
**GIVEN** the learning list returns exactly 1 result
**WHEN** viewed in EN → `"1 learning found"` | PT-BR → `"1 aprendizado encontrado"`
**GIVEN** the list returns 3 results
**WHEN** viewed in EN → `"3 learnings found"` | PT-BR → `"3 aprendizados encontrados"`

### AC7: ThemeToggle cycles through all states
**GIVEN** `ThemeToggle` is in "dark" state
**WHEN** activated → switches to "light"
**WHEN** activated again → switches to "system"
**WHEN** activated again → switches back to "dark"
**THEN** each transition is reflected immediately in the UI

---

## Implementation Approach

### Architecture

No new architectural components. Work is audit-and-fix across the existing layer:

1. **i18n gap fixes** — Add ICU plural key to locale files, replace hardcoded strings
2. **Dark mode audit** — Read every component in `src/components/poks/` and
   `src/app/[locale]/` for missing `dark:` Tailwind classes; add where absent
3. **ARIA improvements** — Add `aria-label` to `ThemeToggle` and `LanguageToggle`
   reflecting current state
4. **Tests** — Unit tests for both toggle components (write tests first)

**ICU plural key for `next-intl`:**

```json
// en.json — under poks.list
"resultsCount": "{count, plural, =1 {1 learning found} other {# learnings found}}"

// pt-BR.json — under poks.list
"resultsCount": "{count, plural, =1 {1 aprendizado encontrado} other {# aprendizados encontrados}}"
```

Usage in `poks/page.tsx`:
```typescript
t('list.resultsCount', { count: totalElements })
```

**Locale-aware date in `PokCard`:**
```typescript
// Before
new Date(pok.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

// After — params.locale already available in component
new Date(pok.updatedAt).toLocaleDateString(params.locale, { year: 'numeric', month: 'short', day: 'numeric' })
```

### Test Strategy

- [ ] Partial TDD — write tests first for `ThemeToggle` and `LanguageToggle`
- [ ] Audit-driven fixes for dark mode and i18n gaps in existing components

### File Changes

**New:**
- `src/components/ui/__tests__/ThemeToggle.test.tsx` — cycle states, aria-label, hydration guard
- `src/components/ui/__tests__/LanguageToggle.test.tsx` — render, href per locale, aria-label

**Modified:**
- `src/locales/en.json` — add `poks.list.resultsCount` ICU plural key
- `src/locales/pt-BR.json` — add `poks.list.resultsCount` ICU plural key
- `src/app/[locale]/poks/page.tsx` — replace hardcoded count string (line 179) with
  `t('list.resultsCount', { count: totalElements })`
- `src/components/poks/PokCard.tsx` — replace `'en-US'` (line 31) with `params.locale`
- `src/components/ui/ThemeToggle.tsx` — add `aria-label` reflecting active theme
- `src/components/ui/LanguageToggle.tsx` — add `aria-label` reflecting active language
- _(Conditional)_ Any component found missing `dark:` classes during audit

---

## Dependencies

**Blocked by:** None

**Blocks:** None — Milestone 1.4 is the last Must-Have before MVP exit criteria can be checked

**External:** None — all required libraries already installed (`next-themes`, `next-intl`, Tailwind)

---

## Post-Implementation Notes

### Commits
- `037cab4`: test(ui): add unit tests for ThemeToggle and LanguageToggle (TDD RED)
- `20b3686`: fix(i18n): add dynamic aria-labels to ThemeToggle and LanguageToggle (TDD GREEN)
- `0ef315f`: fix(i18n): locale date formatting, pluralized count, and locale redirect

### Architectural Decisions

**Decision: Hardcoded English aria-labels (not translated)**
- **Options:** A) Hardcoded English strings, B) Add new i18n keys to locale files
- **Chosen:** A — hardcoded English strings in the component
- **Rationale:** ARIA labels are consumed by screen readers; screen reader users typically configure their preferred language at the OS level. English is universally understood for UI element descriptions. Adding translation keys for 3–4 short labels adds maintenance overhead with minimal benefit for Phase 1.

**Decision: `params.locale` for date formatting (not `useLocale()`)**
- **Options:** A) `useLocale()` from next-intl, B) `params.locale` from `useParams()`
- **Chosen:** B — `params.locale` — already available in both components, avoids adding another import
- **Rationale:** Functionally identical for our two locales (`en`, `pt-BR`); `params.locale` was already imported in both `PokCard` and `ViewPokPage`

### Deviations from Spec
- Audit found 2 additional gaps not in the original spec: `toLocaleDateString()` with no locale in `poks/[id]/page.tsx` (view timestamps), and missing locale prefix in `poks/new/page.tsx` redirect. Both fixed in the i18n commit.
- Dark mode audit confirmed FR6 was already fully satisfied — no component changes needed.

### Lessons Learned
- `getByRole('button', { name: /EN/i })` fails when `aria-label` is set, because `aria-label` overrides the accessible name (even when visible text content is present). Use `toHaveTextContent('EN')` to check visible text independently.
- ICU plural syntax in next-intl: `{count, plural, =1 {singular} other {# plural}}` — the `#` expands to the count value.
