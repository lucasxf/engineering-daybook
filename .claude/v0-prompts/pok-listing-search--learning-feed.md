I'm redesigning the **Learning Feed** screen for **learnimo**, a personal learning journal app where users capture, organize, and recall what they learn.

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

### Screen: Learning Feed

**Purpose:** The primary screen users land on after logging in. Displays their personal collection of learnings with tools to search, sort, and browse efficiently. Replaces endless scrolling with targeted retrieval — "find what I learned about X last week."

**Layout (top → bottom):**
1. **Top nav bar** — "learnimo" wordmark (left), user avatar/menu (right)
2. **Page header** — "My Learnings" (h1, Sora 600), count badge (e.g. "42 learnings"), "+ New Learning" CTA button in ember-cta on the right
3. **Search + Sort toolbar** — full-width search input with magnifying glass icon (left) and a sort dropdown (right). Search placeholder: "Search your learnings..." (EN) / "Pesquisar seus aprendizados..." (PT-BR). Sort options: "Recently updated" (default, updatedAt DESC), "Oldest updated" (updatedAt ASC), "Recently created" (createdAt DESC), "First created" (createdAt ASC)
4. **Learning cards list** — vertical stack of cards, each showing:
   - Title (Sora 600, prominent)
   - Content preview (2–3 lines, truncated with ellipsis)
   - Tag pills (small, muted) — e.g. "react", "architecture"
   - Timestamps: "Created Jan 14" · "Updated 3 days ago"
   - Subtle hover state revealing quick actions (edit, delete icons)
5. **Pagination row** — centered, shows "Page 1 of 4", Previous / Next buttons, disabled when on boundary

**States to design:**

- **Populated (default):** Feed shows 10 learning cards per page. Search bar empty. Sort set to "Newest first." Pagination visible at bottom.
- **Loading:** 3 skeleton cards replace the card list area. Nav, header, and search toolbar remain visible and interactive. "+ New Learning" button stays visible.
- **Empty (no learnings yet):** Large centered illustration area (book/quill icon) + heading "Your knowledge journey starts here" + subtext "Save your first learning to get started." + prominent "+ Save Learning" button. No search bar shown (nothing to search).
- **No search results:** Search bar shows the entered query. Card area replaced by a centered icon + "No learnings found matching your search" (EN) / "Nenhum aprendizado encontrado para sua pesquisa" (PT-BR) + muted subtext "Try adjusting your search terms or filters" + "Clear search" button (secondary style). "+ New Learning" button still visible in header.
- **Error:** Card area replaced by a centered warning icon + "Failed to load your learnings. Please try again." (EN) / "Falha ao carregar seus aprendizados. Tente novamente." (PT-BR) + "Retry" button.

**Dark mode** (primary):
- Page background: #0F1B2D
- Nav bar bg: #1A365D with 1px bottom border #2B4A78
- Card bg: #1A365D with 1px border #2B4A78, subtle inner glow on hover
- Card title: #F5F0E8 (Sora 600)
- Card body text: #8899AA (muted blue-gray)
- Tag pills: #2B4A78 bg, #8B9EC2 text, 4px radius
- Timestamp text: #6B7A8A (dimmed)
- Search input bg: #0F1B2D, border #2B4A78, focus border #D4854A, text #F5F0E8, placeholder #4A5A6A
- Sort dropdown: same as search input
- "+ New Learning" button: #D4854A bg, white text, slight shadow
- "Clear search" / secondary buttons: transparent bg, #D4854A border, #D4854A text
- Pagination buttons: #1A365D bg, #F5F0E8 text; disabled: #0F1B2D bg, #3A4A5A text
- Empty/error state icon color: #2B4A78
- Count badge: #2B4A78 bg, #8B9EC2 text

**Light mode:**
- Page background: #F5F0E8
- Nav bar bg: #FFFFFF with 1px bottom border #E8E4DF
- Card bg: #FFFFFF with 1px border #E8E4DF, subtle box shadow on hover
- Card title: #1A1A2E (Sora 600)
- Card body text: #555555
- Tag pills: #E0E8F2 bg, #1A365D text, 4px radius
- Timestamp text: #999999
- Search input bg: #FFFFFF, border #CCC, focus border #D4854A, text #1A1A2E, placeholder #AAAAAA
- Sort dropdown: same as search input
- "+ New Learning" button: #D4854A bg, white text
- "Clear search" / secondary buttons: transparent bg, #D4854A border, #D4854A text
- Pagination buttons: #FFFFFF bg, #1A365D text, border #CCC; disabled: #F0EDE8 bg, #AAAAAA text
- Empty/error state icon color: #CCCCCC
- Count badge: #E0E8F2 bg, #1A365D text

**Behavioral notes:**
- The search input debounces 300ms — show a subtle loading indicator inside the input (spinning icon replacing magnifying glass) while the API responds
- Changing the sort dropdown immediately re-fetches — no submit button needed
- "Clear search" resets both the input and the sort to default, re-fetching the full list
- Search and sort state is reflected in the URL query string (e.g. `?keyword=react&sortBy=updatedAt&sortDirection=DESC`) so the page is bookmarkable
- Card hover should be smooth (150ms ease) with a subtle left border accent in #D4854A or a slight elevation

**Accessibility:**
- Search input must have a visible `<label>` or `aria-label="Search learnings"`
- Sort dropdown must be keyboard-navigable (arrow keys + Enter)
- Empty and no-results states use `role="status"` for screen reader announcement
- Pagination Previous/Next buttons have `aria-disabled` when on boundary pages

**Component framework:** Use shadcn/ui components: `Input`, `Button`, `Select`, `Card`, `Badge`, `Skeleton` (for loading cards instead of spinner — consider 3 skeleton cards as the loading state). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
