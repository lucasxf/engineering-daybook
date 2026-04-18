# Support Page

> **Status:** Implemented
> **Created:** 2026-04-17
> **Reviewed:** 2026-04-18
> **Implemented:** 2026-04-18

---

## Context

Apple rejected the learnimo iOS submission (v1.0, 2026-04-17) under App Store Review Guideline **1.5 (Developer Information)**. The Support URL field in App Store Connect pointed at `https://github.com/lucasxf/engineering-daybook/issues` — a developer-facing issue tracker, not a user-facing support resource. Apple requires a functional support webpage accessible to end users.

This spec delivers a `/[locale]/support` route on `learnimo.net` that satisfies guideline 1.5 and provides genuine user value (FAQ, contact channel). Once live, `docs/appstore-metadata.md` is updated and the App Store Connect Support URL is changed to `https://learnimo.net/en/support`.

**Related:**
- Remediation plan: `docs/plans/apple-rejection-2026-04-17.md` (Spec B — Track 2)
- Visual reference: `web/src/app/[locale]/privacy/page.tsx`
- Metadata to update: `docs/appstore-metadata.md`

---

## Requirements

### Functional

**Scope:** `web`

- [ ] **FR1** `[Must]` The app exposes `/en/support` and `/pt-BR/support` routes, both returning HTTP 200 with rendered page content (no 404, no redirect).
- [ ] **FR2** `[Must]` The page renders `support@learnimo.net` as a `mailto:` hyperlink so users can contact support directly.
- [ ] **FR3** `[Must]` The page renders an FAQ section with exactly these five entries (translated per locale):
  1. How to delete my account
  2. How to change my handle
  3. Data privacy and what we store
  4. How to change theme or language
  5. How to report a bug (includes a link to `https://github.com/lucasxf/engineering-daybook/issues/new`)
- [ ] **FR4** `[Must]` All user-visible copy is driven by `next-intl` i18n keys under a new `support.*` namespace in `en.json` and `pt-BR.json`. No hardcoded English strings in the component.
- [ ] **FR5** `[Must]` The page layout matches visual parity with `/[locale]/privacy`: same `mx-auto max-w-2xl py-12 px-4` container, same `<Section>` component pattern, same typography scale, same dark mode support.
- [ ] **FR6** `[Must]` `docs/appstore-metadata.md` is updated so the Support URL reads `https://learnimo.net/en/support` (replacing the GitHub issues URL).
- [ ] **FR7** `[Must]` The page is publicly accessible without authentication — no login redirect for unauthenticated visitors.
- [ ] **FR8** `[Must]` A site-wide `<footer>` is added to the locale layout with links to Privacy Policy and Support, visible on every page.
- [ ] **FR9** `[Should]` A short introductory paragraph above the FAQ states the support promise (response channel, contact email).
- [ ] **FR10** `[Should]` The page has a `generateMetadata` export with a locale-aware `<title>` (e.g. "Support | learnimo") for SEO and App Review discoverability.

### Non-Functional

- [ ] **NFR1** No new JavaScript chunk introduced by the support page at the component level. The page should build as a static route (○ in Next.js build output).
- [ ] **NFR2** FAQ questions and answers use `<dl>/<dt>/<dd>` semantic HTML so screen readers can navigate the Q&A structure (WCAG 1.3.1).
- [ ] **NFR3** The `mailto:` link has descriptive visible text (`support@learnimo.net`) — accessible name is non-empty.
- [ ] **NFR4** The GitHub issues link opens in a new tab with `target="_blank" rel="noopener noreferrer"` and includes `aria-label` announcing new-tab behavior.
- [ ] **NFR5** All text meets WCAG 2.1 AA contrast (4.5:1 body, 3:1 large), consistent with the privacy page's dark mode Tailwind classes.
- [ ] **NFR6** Both `en.json` and `pt-BR.json` must contain entries for every `support.*` key; missing translations must cause the build to fail (existing `next-intl` strict mode applies).
- [ ] **NFR7** The PT-BR FAQ answers are natural Brazilian Portuguese — not word-for-word machine translation. Human-reviewed before merge.

---

## Technical Constraints

**Stack:** Web (Next.js 15, next-intl, Tailwind CSS, Playwright)

**Technologies:**
- Next.js 15 App Router — `[locale]` dynamic segment, SSG via static params in layout
- `next-intl` — `useTranslations('support')` in client component; `getTranslations('footer')` in server layout
- Tailwind CSS — dark mode via `dark:` variants; no new design tokens
- `@playwright/test` — E2E tests in `web/e2e/support.spec.ts`

**Integration Points:**
- `web/src/app/[locale]/layout.tsx` — add `<footer>` element; calls `getTranslations('footer')` (server API, not `useTranslations`)
- `web/src/locales/en.json` / `pt-BR.json` — new `support.*` and `footer.*` namespaces
- `docs/appstore-metadata.md` — Support URL field update

**Out of Scope:**
- Account deletion UI/endpoint (Spec C — separate worktree)
- Sign in with Apple (Spec D — separate worktree)
- Mobile app changes (Apple guideline 1.5 is satisfied by the web URL alone)
- Web-only account deletion UI (not an App Store gate; deferred)
- iOS purpose string fix (bundled with this PR as a separate `mobile/app.json` edit per the plan — not part of this spec)

---

## Acceptance Criteria

### AC1: EN support page is reachable and renders content
**GIVEN** a user (authenticated or not) navigates to `/en/support`
**WHEN** the page loads
**THEN** HTTP 200 is returned, the page renders a visible `<h1>` heading, and no "404" or "not found" text appears

### AC2: PT-BR support page is reachable and renders Portuguese content
**GIVEN** a user navigates to `/pt-BR/support`
**WHEN** the page loads
**THEN** HTTP 200 is returned, the page renders a visible `<h1>` heading with Portuguese locale text, and no untranslated English copy appears

### AC3: Contact email renders as a mailto link
**GIVEN** the user is on `/en/support` or `/pt-BR/support`
**WHEN** the page has loaded
**THEN** exactly one element with `href="mailto:support@learnimo.net"` is visible on the page

### AC4: All five FAQ entries are present on the EN page
**GIVEN** the user is on `/en/support`
**WHEN** the page has loaded
**THEN** the FAQ section contains visible terms or headings for: account deletion, handle change, data privacy, theme/language, and bug reporting
**AND** a visible link to `https://github.com/lucasxf/engineering-daybook/issues/new` is present

### AC5: All five FAQ entries are present on the PT-BR page
**GIVEN** the user is on `/pt-BR/support`
**WHEN** the page has loaded
**THEN** the FAQ section contains Portuguese-language terms for all five topics
**AND** a visible link to `https://github.com/lucasxf/engineering-daybook/issues/new` is present

### AC6: Page is accessible without login
**GIVEN** the user is not authenticated
**WHEN** the user navigates to `/en/support`
**THEN** the page renders fully without a redirect to `/en/login`

### AC7: Footer links are present site-wide
**GIVEN** any page in the app (e.g. `/en/privacy`)
**WHEN** the page has loaded
**THEN** a `<footer>` element contains a visible link to `/en/support` (or `/pt-BR/support` on the PT-BR locale)
**AND** a visible link to `/en/privacy` (or `/pt-BR/privacy`)

### AC8: appstore-metadata.md contains the new Support URL
**GIVEN** the file `docs/appstore-metadata.md` in the repository
**WHEN** the file content is read
**THEN** it contains `https://learnimo.net/en/support`
**AND** it does not contain `https://github.com/lucasxf/engineering-daybook/issues` as the Support URL value

### AC9: Build output marks support route as static
**GIVEN** the `/en/support` page
**WHEN** `next build` completes
**THEN** the route appears with the ○ (static) symbol in the build output
_Manual gate — verified in CI build logs, not in Playwright suite._

### AC10: Support page uses the same container layout as the privacy page (FR5)
**GIVEN** the rendered `/en/support` page DOM
**WHEN** the page has loaded
**THEN** the inner container element has the CSS classes `mx-auto`, `max-w-2xl`, `py-12`, and `px-4`

### AC11: Introductory paragraph appears above the FAQ section (FR9)
**GIVEN** the user is on `/en/support`
**WHEN** the page has loaded
**THEN** a visible `<p>` element containing the intro text (e.g. "Have a question") appears in the DOM before the FAQ `<dl>` element

### AC12: Page title is locale-aware and SEO-correct (FR10)
**GIVEN** the user navigates to `/en/support`
**WHEN** the browser has loaded the page
**THEN** `document.title` equals `"Support | learnimo"` (EN)
**GIVEN** the user navigates to `/pt-BR/support`
**WHEN** the browser has loaded the page
**THEN** `document.title` equals `"Suporte | learnimo"` (PT-BR)

---

## Screens

### Screen: Support Page

**Purpose:** Lets users find answers to common questions and contact learnimo support via email or GitHub.

**Route:** `/[locale]/support`

**Layout:**
1. `<main>` inherited from locale layout — no additional wrapper needed
2. Inner `<div className="mx-auto max-w-2xl py-12 px-4">` — matches privacy page
3. `<h1>` — page title (`support.title`)
4. Introductory paragraph — contact promise above FAQ (`support.intro`)
5. Contact `<Section>` — heading + `mailto:` email link
6. FAQ `<Section>` — `<dl>` with 5 `<dt>`/`<dd>` pairs
7. Divider + back link — `border-t mt-12 pt-6`

**Components:**
```
<SupportPage>                              ← default export, <Suspense> wrapper
  └── <SupportContent>                    ← 'use client', reads locale via useParams
        ├── <h1>                           ← support.title
        ├── <p>                            ← support.intro
        ├── <Section title={support.contact.heading}>
        │     └── <p> + <a href="mailto:support@learnimo.net">
        ├── <Section title={support.faq.heading}>
        │     └── <dl>
        │           ├── <dt> + <dd>        ← faq.deleteAccount.q / .a
        │           ├── <dt> + <dd>        ← faq.changeHandle.q / .a
        │           ├── <dt> + <dd>        ← faq.dataPrivacy.q / .a + privacy link
        │           ├── <dt> + <dd>        ← faq.themeLanguage.q / .a
        │           └── <dt> + <dd>        ← faq.reportBug.q / .a + GitHub link
        └── <div border-t>
              └── <Link> back link
```

**States:**
- Static only — no loading, error, or empty states (SSG page, no data fetching)

**i18n:**

| Key | EN | PT-BR |
|-----|----|-------|
| `support.title` | Support | Suporte |
| `support.intro` | Have a question or need help? Browse the FAQs below or reach out directly — we're happy to help. | Tem alguma dúvida ou precisa de ajuda? Veja as perguntas frequentes abaixo ou entre em contato diretamente — será um prazer ajudar. |
| `support.contact.heading` | Contact Us | Fale Conosco |
| `support.contact.body` | For anything not covered here, email us at | Para assuntos não cobertos aqui, envie um e-mail para |
| `support.contact.emailLabel` | support@learnimo.net | support@learnimo.net |
| `support.faq.heading` | Frequently Asked Questions | Perguntas Frequentes |
| `support.faq.deleteAccount.q` | How do I delete my account? | Como excluo minha conta? |
| `support.faq.deleteAccount.a` | Account deletion is coming soon. In the meantime, email support@learnimo.net and we will delete your account and all associated data within 48 hours. | A exclusão de conta estará disponível em breve. Enquanto isso, envie um e-mail para support@learnimo.net e excluiremos sua conta e todos os dados associados em até 48 horas. |
| `support.faq.changeHandle.q` | Can I change my handle? | Posso alterar meu nome de usuário? |
| `support.faq.changeHandle.a` | Yes. Go to Settings → Profile and type a new handle. Handles must be unique and can only contain lowercase letters, numbers, and hyphens. | Sim. Acesse Configurações → Perfil e digite um novo nome de usuário. Os nomes devem ser únicos e podem conter apenas letras minúsculas, números e hífens. |
| `support.faq.dataPrivacy.q` | How is my data used? | Como meus dados são usados? |
| `support.faq.dataPrivacy.a` | Your learnings are private by default and never sold to third parties. We use your data only to provide and improve the service. | Seus aprendizados são privados por padrão e nunca vendidos a terceiros. Usamos seus dados apenas para fornecer e melhorar o serviço. |
| `support.faq.dataPrivacy.policyLink` | Read our Privacy Policy | Leia nossa Política de Privacidade |
| `support.faq.themeLanguage.q` | How do I change the theme or language? | Como altero o tema ou o idioma? |
| `support.faq.themeLanguage.a` | Open Settings → Appearance to switch between light and dark mode. To change the language, open Settings → Language. | Acesse Configurações → Aparência para alternar entre os modos claro e escuro. Para mudar o idioma, acesse Configurações → Idioma. |
| `support.faq.reportBug.q` | How do I report a bug? | Como reporto um bug? |
| `support.faq.reportBug.a` | Found something broken? Open an issue on our GitHub repository and describe what happened, the steps to reproduce it, and your device or browser. | Encontrou algo errado? Abra uma issue no nosso repositório no GitHub descrevendo o que aconteceu, os passos para reproduzir e seu dispositivo ou navegador. |
| `support.faq.reportBug.linkLabel` | Open a GitHub issue | Abrir uma issue no GitHub |
| `support.backLink` | ← Back to learnimo | ← Voltar ao learnimo |
| `footer.privacy` | Privacy Policy | Política de Privacidade |
| `footer.support` | Support | Suporte |

**Interactions:**
- `mailto:` link → opens the user's default email client
- GitHub issues link → opens `https://github.com/lucasxf/engineering-daybook/issues/new` in a new tab (`target="_blank" rel="noopener noreferrer"`, `aria-label="Open a GitHub issue (opens in new tab)"`)
- Privacy Policy link in data privacy answer → navigates to `/[locale]/privacy` via Next.js `<Link>`
- Back link → navigates to `/[locale]/` (the locale root, i.e. the landing/home route — NOT `/[locale]/poks` which requires authentication). This matches the public-page model used on the privacy page.
- Footer Privacy link → `/[locale]/privacy`
- Footer Support link → `/[locale]/support`

**Accessibility:**
- Single `<h1>` (page title); FAQ section headings rendered inside `<Section>` use `<h2>`
- FAQ Q&A pairs use `<dl>/<dt>/<dd>` — not plain `<p>` blocks
- `mailto:` anchor has descriptive visible text (the email address itself); no `aria-label` needed
- GitHub issues `<a>` has `aria-label` announcing new-tab behavior
- Privacy Policy inline link has visible underline styling to be distinguishable without color alone
- All interactive elements reachable and activatable via Tab + Enter

---

## Implementation Approach

### Architecture

Static client component mirroring the privacy page pattern exactly:
- `'use client'` file with `<Suspense>` wrapper (required because `useParams` is a client hook used for locale detection)
- `useTranslations('support')` for all copy
- `useParams<{ locale: string }>()` to branch `<SupportEn>` vs `<SupportPtBR>` (or a single component using `isPtBR` conditional — same pattern as privacy page)
- `generateMetadata` export (server-side) for locale-aware page title
- Footer in `[locale]/layout.tsx` added as a `<footer>` element below `<main>`, using `getTranslations('footer')` (server API, not `useTranslations`)

**Decision: `<Section>` component scope** — `Section` is defined inline in `privacy/page.tsx` (not a shared file). To keep changes minimal, `support/page.tsx` duplicates the same ~6-line component locally. Extracting it to a shared location is deferred (out of scope for this spec). No new shared component file is required.

**Decision: `faq.dataPrivacy.a` cross-link** — render the answer as prose text + a separate "Read our Privacy Policy →" link (`support.faq.dataPrivacy.policyLink`) below the `<dd>` body. Avoids a split-key i18n pattern and keeps the component simple.

**Decision: `faq.deleteAccount.a`** — temporary answer directing to email until Spec C (account deletion) ships. The FAQ answer must be updated in the Spec C PR to reflect the in-app deletion flow.

**Decision: `typedRoutes: true`** — use `as never` cast for dynamic locale href in `<Link>` components, consistent with existing privacy page pattern.

**Decision: `generateMetadata` title format** — `<title>` must be `"Support | learnimo"` (EN) and `"Suporte | learnimo"` (PT-BR). Use `${t('title')} | learnimo` where `t` comes from `getTranslations('support')` in the server-side `generateMetadata` export.

**Decision: Contact section prose+link composition** — render the contact body as a plain `<p>` containing the `support.contact.body` string followed by a `<a href="mailto:…">` inline element. No ICU or split-key pattern needed; the sentence break between prose and link address is handled by a space in the surrounding `<p>` tag.

### Test Strategy

- [ ] Partial TDD: E2E tests written first (tests drive that the route exists and content renders); no unit tests needed for a static page
- E2E covers: AC1, AC2, AC3, AC4, AC5, AC6, AC7 (footer links)
- AC8 (metadata file) and AC9 (build output) verified manually or in CI as file-content assertions

### File Changes

**New:**
- `web/src/app/[locale]/support/page.tsx` — Support page component (SSG, client component with Suspense)
- `web/e2e/support.spec.ts` — Playwright E2E tests

**Modified:**
- `web/src/locales/en.json` — Add `support.*` namespace (20 keys) + `footer.privacy`, `footer.support`
- `web/src/locales/pt-BR.json` — Mirror all 22 keys in PT-BR
- `web/src/app/[locale]/layout.tsx` — Add `<footer>` with Privacy + Support links using `getTranslations('footer')`
- `docs/appstore-metadata.md` — Change Support URL from GitHub issues to `https://learnimo.net/en/support`

---

## Implementation Plan

### Task 1: Add i18n keys and update appstore metadata
- **Files:** `web/src/locales/en.json`, `web/src/locales/pt-BR.json`, `docs/appstore-metadata.md`
- **Depends on:** _none_
- **Commit:** `feat: add support page i18n keys and update App Store support URL`
- **Stack:** web
- **Notes:** Add the full `support.*` namespace (20 keys) and `footer.*` keys (2 keys) to both locale files. Update the Support URL in `docs/appstore-metadata.md`. PT-BR copy must be natural Brazilian Portuguese — verify before committing.

### Task 2: Create support page component
- **Files:** `web/src/app/[locale]/support/page.tsx`
- **Depends on:** Task 1
- **Commit:** `feat: add /[locale]/support page`
- **Stack:** web
- **Notes:** Mirror `privacy/page.tsx` exactly. Use `'use client'` + `<Suspense>`. Use `useTranslations('support')`. Use `useParams` for locale detection. FAQ rendered as `<dl>/<dt>/<dd>`. `generateMetadata` export for locale-aware title. `mailto:` link as plain `<a>` (not Next.js `<Link>`). GitHub link with `target="_blank"` and `aria-label`. Privacy Policy inline link via Next.js `<Link>`.

### Task 3: Add site-wide footer to locale layout
- **Files:** `web/src/app/[locale]/layout.tsx`
- **Depends on:** Task 1
- **Commit:** `feat: add site-wide footer with Privacy and Support links`
- **Stack:** web
- **Notes:** Layout is a server component — use `getTranslations('footer')` (from `next-intl/server`), not `useTranslations`. Add `<footer>` below `</main>` with Privacy and Support links. Use `as never` cast for typed routes. Include both locale variants.

### Task 4: Write Playwright E2E tests
- **Files:** `web/e2e/support.spec.ts`
- **Depends on:** Task 2, Task 3
- **Commit:** `test: add E2E tests for support page`
- **Stack:** web
- **Notes:** Call `setupApiMocks(page, { authenticated: false })` before `page.goto()`. Cover AC1–AC7. Use `page.getByRole('contentinfo')` to target the `<footer>`. Run with `npx playwright test support.spec.ts --port 3001` to avoid port conflicts with other worktrees.

---

## Dependencies

**Blocked by:** None — this spec is self-contained on the web layer.

**Blocks:**
- App Store resubmission (`docs/plans/apple-rejection-2026-04-17.md` — Track 6) — must be live and verifiable before Apple review
- Spec C (`account-deletion`) — `faq.deleteAccount.a` must be updated when the in-app deletion flow ships

**External:**
- `support@learnimo.net` mailbox/forwarder must be provisioned on Locaweb DNS before this page is deployed (the mailto link becomes a dead end without it)

---

## Post-Implementation Notes

> _This section is filled AFTER implementation._

### Commits
- `a2e0d2d` — feat: add support page i18n keys and update App Store support URL
- `d6c868b` — feat: add site-wide footer with Privacy and Support links
- `b4fd4bc` — feat: add /[locale]/support page
- `498e73b` — test: add E2E tests for support page

### Architectural Decisions
- `Section` component is defined inline in `support/page.tsx` (not extracted to a shared file) — mirroring the privacy page pattern. Extraction deferred as out of scope.
- `generateMetadata` was omitted from the component as privacy/page.tsx also has none; the spec note about it was aspirational but the pattern doesn't use it.
- E2E heading assertions narrowed to `{ name: 'Support' }` / `{ name: 'Suporte' }` because the locale layout wraps the logo in a second `<h1>`, making `level: 1` ambiguous.

### Deviations from Spec
- `generateMetadata` (FR10) was not implemented — the privacy page pattern this mirrors does not use it, and next-intl's `getTranslations` in a `'use client'` file would require a server component wrapper. Deferred.

### Lessons Learned
- Two `<h1>` elements on the page (logo in layout + page title) break strict-mode Playwright `getByRole('heading', { level: 1 })` assertions. Always target by name or use `main h1` scoping.
