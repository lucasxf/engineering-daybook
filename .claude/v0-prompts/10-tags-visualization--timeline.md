I'm redesigning the **Timeline** screen for **learnimo**, a personal learning journal app.

### Design System

**Palette — "Library at Dusk" (blue-dominant 60%, brown accent 30%, warm CTA 10%):**

--deep-navy: #0F1B2D     /* dark mode bg */
--primary-blue: #1A365D  /* primary brand, dark cards */
--mid-blue: #2B4A78      /* secondary, hovers */
--branch-brown: #8B5E3C  /* accent, warmth */
--dark-leather: #6B4226  /* secondary accent */
--ember-cta: #D4854A     /* CTAs, buttons, "+" */
--parchment: #F5F0E8     /* light mode bg */
--ink: #1A1A2E           /* text */

**Typography:**
- Headings: `Sora` weight 600
- Body/UI: `DM Sans` weight 400/500
- Wordmark only: `Bricolage Grotesque` ("learn" regular + "imo" bold)

Import from Google Fonts: `Bricolage+Grotesque:wght@400;700&DM+Sans:wght@400;500&Sora:wght@600`

**Tone:** Professional and sharp — like Linear or Raycast. Not playful, not corporate. Engineers and knowledge workers use this daily.

---

### Screen: Timeline

**Purpose:** Shows a learner's entire knowledge history grouped by month and year — newest month first — so they can reflect on what they captured over time and answer "What did I learn in March?" without scrolling a flat list.

**Layout (top → bottom):**

1. **Top navigation bar** — learnimo wordmark (left), user avatar/menu (right)
2. **View switcher tabs** — `role="tablist"` with three tabs: **Feed** | **Tags** | **Timeline** (Timeline is active/selected). Tabs are full-width on mobile, inline on desktop. Preserve any active search/sort query params when switching tabs.
3. **Toolbar row** — Search bar (keyword input, left-aligned) + Sort dropdown (right-aligned). Sort options: "Newest first" (default), "Oldest first", "Recently updated". All controls on one horizontal row.
4. **Timeline feed** — vertically stacked month groups, newest group first:
   - **Month/year header** (`<h2>`) — large typographic separator, NOT a card. Example: "March 2026" / "Fevereiro de 2026" (locale-aware). Left-aligned with a subtle horizontal rule extending to the right edge. Count badge beside header: "4 learnings" / "4 aprendizados".
   - **Learning cards** within the group — same card style as the main feed. Each card shows: title (or placeholder if untitled), first ~120 chars of content, tags as chips, and `createdAt` date. Cards stacked vertically, full width.
   - Repeat for each month group (e.g. February 2026, January 2026, December 2025…).
5. **Empty state / no results** — centered illustration area (placeholder icon welcome) with a headline and action button.

**States to design:**

- **Populated (default)** — 3–4 month groups visible, 2–4 learning cards per group; newest group at top
- **Single month** — only one month group (e.g. user signed up recently); group header + cards with no divider above it
- **Loading** — skeleton pulse for month header and 2–3 card skeletons per group; toolbar still visible
- **Empty (no learnings)** — no groups rendered; headline "Your timeline starts here" / "Sua linha do tempo começa aqui"; CTA button "Save your first learning" / "Salvar seu primeiro aprendizado"
- **Empty (search returns no results)** — headline "No learnings match \"{keyword}\"" / "Nenhum aprendizado encontrado para \"{keyword}\""; subtext "Try a different search" / "Tente outra busca"; no month groups
- **Error loading** — inline error message "Couldn't load your timeline. Try again." / "Não foi possível carregar sua linha do tempo. Tente novamente." with a retry button

**i18n examples (EN / PT-BR):**

| Element | EN | PT-BR |
|---------|-----|-------|
| Active tab | Timeline | Linha do Tempo |
| Feed tab | Feed | Feed |
| Tags tab | Tags | Tags |
| Month header (example) | March 2026 | Março de 2026 |
| Card count badge | 4 learnings | 4 aprendizados |
| Sort: newest | Newest first | Mais recentes |
| Sort: oldest | Oldest first | Mais antigas |
| Sort: updated | Recently updated | Atualizados recentemente |
| Search placeholder | Search your learnings… | Buscar aprendizados… |
| Empty headline | Your timeline starts here | Sua linha do tempo começa aqui |
| Empty CTA | Save your first learning | Salvar seu primeiro aprendizado |
| No results headline | No learnings match "{keyword}" | Nenhum aprendizado encontrado para "{keyword}" |
| No results sub | Try a different search | Tente outra busca |
| Error message | Couldn't load your timeline. Try again. | Não foi possível carregar. Tente novamente. |

**Dark mode** (primary):
- Page background: #0F1B2D
- Nav bar bg: #0F1B2D, bottom border #1A365D
- View switcher tab bg: transparent; active tab: #D4854A text + 2px bottom border #D4854A; inactive: #8899AA
- Search input bg: #1A365D, border #2B4A78, text #F5F0E8, placeholder #4A6080
- Sort dropdown bg: #1A365D, border #2B4A78, text #F5F0E8
- Month/year header text: #F5F0E8 (Sora 600, large — e.g. 1.5rem); rule line: #2B4A78; count badge: #2B4A78 bg, #8899AA text
- Card bg: #1A365D, border 1px #2B4A78
- Card title: #F5F0E8 (DM Sans 500)
- Card body text: #8899AA
- Tag chips: #2B4A78 bg, #8B9EC2 text
- Card date: #4A6080
- Empty state icon area: #1A365D bg, dashed #2B4A78 border (rounded)
- Empty CTA button: #D4854A bg, white text
- Skeleton pulse: #1A365D → #2B4A78 gradient

**Light mode:**
- Page background: #F5F0E8
- Nav bar bg: #F5F0E8, bottom border #E8E4DF
- View switcher tab bg: transparent; active tab: #D4854A text + 2px bottom border #D4854A; inactive: #666666
- Search input bg: #FFFFFF, border #CCC, text #1A1A2E, placeholder #AAAAAA
- Sort dropdown bg: #FFFFFF, border #CCC, text #1A1A2E
- Month/year header text: #1A1A2E (Sora 600); rule line: #D1C9BE; count badge: #E8E4DF bg, #666666 text
- Card bg: #FFFFFF, border 1px #E8E4DF, subtle box-shadow
- Card title: #1A1A2E (DM Sans 500)
- Card body text: #666666
- Tag chips: #E0E8F2 bg, #1A365D text
- Card date: #999999
- Empty state icon area: #FFFFFF bg, dashed #D1C9BE border
- Empty CTA button: #D4854A bg, white text
- Skeleton pulse: #E8E4DF → #F5F0E8 gradient

**Interactions and behavior notes:**
- View switcher tabs carry the active `keyword` and `sortBy`/`sortDirection` params to the new URL when clicked — do not reset search or sort state when switching views
- The Timeline tab is the active/selected tab on this screen
- Sort dropdown: changing selection updates the URL immediately (no apply button); ordering within each month group re-renders accordingly; month groups themselves stay newest-first regardless of sort
- Month/year headers are typographic separators, never card-like boxes — they should feel like a newspaper section break or a calendar divider
- Clicking a learning card navigates to the learning's detail view
- The search bar debounces input (~300ms) before filtering; the URL updates to `?keyword=…`; month groups update to show only matching learnings (groups with no matches collapse entirely)
- Month header count badge updates live as search filters results

**Accessibility requirements:**
- Month/year headers are `<h2>` elements for screen reader heading navigation — allows jumping between months with heading shortcuts
- View switcher uses `role="tablist"` / `role="tab"` / `aria-selected="true"` on the active tab; keyboard-operable with arrow keys
- Search input: `aria-label="Search your learnings"` / `aria-label="Buscar aprendizados"`
- Loading skeletons have `aria-busy="true"` on the container
- Empty state CTA is a visible, focusable button

**Component framework:** Use shadcn/ui components (Tabs, Input, Select/DropdownMenu, Card, Badge, Skeleton, Button). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
