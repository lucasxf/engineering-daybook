I'm redesigning the **Tag-Grouped Feed** screen for **learnimo**, a personal learning journal app.

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

### Screen: Tag-Grouped Feed

**Purpose:** Presents a learner's knowledge base organized by topic rather than time — learnings are grouped under their tags, alphabetically, so the learner can instantly see how much they've captured about each subject and browse by interest area.

**Layout (top → bottom):**

1. **Top navigation bar** — learnimo wordmark (left), user avatar/menu (right)
2. **View switcher tabs** — `role="tablist"` with three tabs: **Feed** | **Tags** | **Timeline** (Tags tab is active/selected). Tabs are full-width on mobile, inline on desktop. Switching tabs preserves active search/sort state in the URL.
3. **Toolbar row** — Search bar (keyword input, left-aligned) + Sort dropdown (right-aligned). Sort options: "Newest first" (default), "Oldest first", "Recently updated". Single horizontal row.
4. **Tag group sections** — vertically stacked, one section per tag, alphabetically ordered (A → Z):
   - **Tag section header** (`<h2>`) — tag name as a typographic separator with a count badge beside it (e.g. "React · 7 learnings" / "React · 7 aprendizados"). NOT a card — a visual divider with the tag name prominent. A subtle colored left border or accent mark in the ember/brown palette distinguishes it from month headers.
   - **Learning cards** within the section — same card style as the main feed: title (or placeholder if untitled), first ~120 chars of content, tags as chips, `createdAt` date. Cards stacked vertically.
   - A learning with multiple tags appears once in EACH of its tag sections.
5. **Untagged section** — always rendered last, below all tag sections. Header reads "Untagged" / "Sem etiqueta" with a count badge. Only present when at least one learning has no tags.
6. **Tag nudge (contextual)** — shown inside the Untagged section (or as the only section) when ALL learnings are untagged: a subtle inline message "Add tags to your learnings to organize them by topic" / "Adicione etiquetas para organizar seus aprendizados por tema" with a link/button to start tagging.
7. **Empty state** — centered when no learnings exist at all.

**States to design:**

- **Populated (default)** — 3–4 tag sections (e.g. "Architecture", "React", "Testing", "TypeScript"), each with 2–3 learning cards; Untagged section at bottom if applicable
- **All untagged** — only the "Untagged" section renders, with the tag nudge message inside it prompting the learner to start tagging
- **Single tag** — only one named tag section; no Untagged section (all learnings are tagged)
- **Loading** — skeleton pulse for section header and 2–3 card skeletons per group; toolbar still visible
- **Empty (no learnings)** — no sections rendered; headline "You haven't saved any learnings yet" / "Você ainda não salvou nenhum aprendizado"; CTA button "Save your first learning" / "Salvar seu primeiro aprendizado"
- **Empty (search returns no results)** — headline "No learnings match \"{keyword}\"" / "Nenhum aprendizado encontrado para \"{keyword}\""; no tag sections visible
- **Error loading** — inline error "Couldn't load your learnings. Try again." / "Não foi possível carregar. Tente novamente." with a retry button

**i18n examples (EN / PT-BR):**

| Element | EN | PT-BR |
|---------|-----|-------|
| Active tab | Tags | Tags |
| Feed tab | Feed | Feed |
| Timeline tab | Timeline | Linha do Tempo |
| Tag header (example) | React · 7 learnings | React · 7 aprendizados |
| Untagged header | Untagged · 3 learnings | Sem etiqueta · 3 aprendizados |
| Tag nudge | Add tags to your learnings to organize them by topic | Adicione etiquetas para organizar seus aprendizados por tema |
| Tag nudge link | Start tagging | Começar a etiquetar |
| Sort: newest | Newest first | Mais recentes |
| Sort: oldest | Oldest first | Mais antigas |
| Sort: updated | Recently updated | Atualizados recentemente |
| Search placeholder | Search your learnings… | Buscar aprendizados… |
| Empty headline | You haven't saved any learnings yet | Você ainda não salvou nenhum aprendizado |
| Empty CTA | Save your first learning | Salvar seu primeiro aprendizado |
| No results | No learnings match "{keyword}" | Nenhum aprendizado encontrado para "{keyword}" |
| Error | Couldn't load your learnings. Try again. | Não foi possível carregar. Tente novamente. |

**Dark mode** (primary):
- Page background: #0F1B2D
- Nav bar bg: #0F1B2D, bottom border #1A365D
- View switcher: active tab #D4854A text + 2px bottom border #D4854A; inactive #8899AA
- Search input bg: #1A365D, border #2B4A78, text #F5F0E8, placeholder #4A6080
- Sort dropdown bg: #1A365D, border #2B4A78, text #F5F0E8
- Tag section header text: #F5F0E8 (Sora 600); left accent bar: #8B5E3C (branch-brown); count badge: #2B4A78 bg, #8899AA text
- Untagged section header: same style, accent bar: #4A6080 (muted, de-emphasized vs named tags)
- Tag nudge text: #8899AA; nudge link/button: #D4854A text, underline on hover
- Card bg: #1A365D, border 1px #2B4A78
- Card title: #F5F0E8 (DM Sans 500)
- Card body text: #8899AA
- Tag chips on cards: #2B4A78 bg, #8B9EC2 text
- Card date: #4A6080
- Empty state CTA: #D4854A bg, white text
- Skeleton pulse: #1A365D → #2B4A78 gradient

**Light mode:**
- Page background: #F5F0E8
- Nav bar bg: #F5F0E8, bottom border #E8E4DF
- View switcher: active tab #D4854A text + 2px bottom border; inactive #666666
- Search input bg: #FFFFFF, border #CCC, text #1A1A2E, placeholder #AAAAAA
- Sort dropdown bg: #FFFFFF, border #CCC, text #1A1A2E
- Tag section header text: #1A1A2E (Sora 600); left accent bar: #8B5E3C; count badge: #E8E4DF bg, #666666 text
- Untagged section header: same, accent bar: #AAAAAA (muted)
- Tag nudge text: #666666; nudge link: #D4854A text
- Card bg: #FFFFFF, border 1px #E8E4DF, subtle box-shadow
- Card title: #1A1A2E (DM Sans 500)
- Card body text: #666666
- Tag chips on cards: #E0E8F2 bg, #1A365D text
- Card date: #999999
- Empty state CTA: #D4854A bg, white text
- Skeleton pulse: #E8E4DF → #F5F0E8 gradient

**Interactions and behavior notes:**
- The Tags tab is the active tab on this screen (`aria-selected="true"`)
- Switching to Feed or Timeline tabs carries the active `keyword` and sort params in the new URL — no state reset
- Sort dropdown changes the ordering of cards within each tag section; tag sections themselves stay alphabetical regardless of sort
- The Untagged section is always last — it does not sort into the alphabetical order even if "U" would place it elsewhere
- Search filters cards across all sections; tag sections with zero matching cards collapse and disappear entirely; the Untagged section also collapses if its learnings don't match
- A learning with multiple tags appears in each of its tag sections — this is by design, not a bug. The card is duplicated intentionally.
- Clicking a learning card navigates to its detail view
- The tag nudge link/button navigates the learner to their learnings feed where they can add tags

**Accessibility requirements:**
- Tag section headers are `<h2>` elements for screen reader heading navigation
- Untagged section header is also `<h2>`
- View switcher uses `role="tablist"` / `role="tab"` / `aria-selected`; keyboard-operable with arrow keys
- Search input: `aria-label="Search your learnings"` / `aria-label="Buscar aprendizados"`
- Loading container has `aria-busy="true"`
- Tag nudge CTA is a visible, focusable button or link with descriptive label

**Component framework:** Use shadcn/ui components (Tabs, Input, Select/DropdownMenu, Card, Badge, Skeleton, Button). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
