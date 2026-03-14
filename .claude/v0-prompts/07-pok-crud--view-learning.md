I'm redesigning the **View Learning** screen for **learnimo**, a personal learning journal app.

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

### Screen: View Learning

**Purpose:** Display a single learning in full — title (if present), complete content, and creation/update timestamps. Provides quick access to edit or delete the entry. This is the canonical reading view where users revisit and reflect on what they captured.

**Layout (top → bottom):**
1. **Nav bar** — "learnimo" wordmark (links to feed), user avatar/menu on the right
2. **Breadcrumb** — "← My Learnings" link back to the feed (EN) / "← Meus Aprendizados" (PT-BR)
3. **Page header row** — title of the learning (large, Sora 600) on the left; "Edit" and "Delete" action buttons on the right. If the learning has no title, show the first 60 characters of content as the heading (muted style).
4. **Metadata row** — "Saved Feb 14, 2026 at 3:30 PM · Updated Feb 15, 2026 at 9:00 AM" (EN) / "Salvo em 14 de fev. de 2026, 15:30 · Atualizado em 15 de fev. de 2026, 09:00" (PT-BR). Small muted text below the title.
5. **Content area** — full content in a readable prose block. Renders markdown (bold, italic, inline code, code blocks, bullet lists). No editing chrome — clean reading surface with generous line height (1.7).
6. **Tags row** (if any) — small pill badges below the content. Muted blue-gray style.
7. **Delete confirmation dialog** (modal, shown on "Delete" click):
   - Title: "Delete this learning?" (EN) / "Excluir este aprendizado?" (PT-BR)
   - Body: "This learning will be hidden from your list. This cannot be undone." (EN) / "Este aprendizado será ocultado da sua lista. Isso não pode ser desfeito." (PT-BR)
   - Buttons: "Cancel" (ghost) + "Delete" (destructive red)

**States to design:**
- **Loaded** — full title + content + metadata visible, Edit/Delete buttons active
- **No title** — content's first 60 chars used as page heading (in muted italic style to indicate it's auto-derived)
- **Loading** — skeleton: tall title bar placeholder, 3–4 lines of content shimmer, metadata row shimmer
- **Not found (404)** — centered message: "This learning doesn't exist or has been deleted." (EN) / "Este aprendizado não existe ou foi excluído." (PT-BR). CTA: "Go to My Learnings" / "Ir para Meus Aprendizados"
- **Forbidden (403)** — centered message: "You don't have permission to view this learning." (EN) / "Você não tem permissão para ver este aprendizado." (PT-BR). CTA: "Go to My Learnings"
- **Delete confirmation open** — rest of page dimmed behind modal

**Dark mode** (primary):
- Background: #0F1B2D
- Card / content area bg: #1A365D with 1px border #2B4A78
- Title text: #F5F0E8 (Sora 600)
- Metadata text: #8899AA (muted blue-gray, DM Sans 400)
- Content body text: #C8D4E0 (readable contrast on dark bg)
- Breadcrumb link: #8B9EC2 with #D4854A hover
- Edit button: outlined, #2B4A78 border + #8B9EC2 text, hover bg #2B4A78
- Delete button: outlined, destructive red border (#E53E3E) + red text, hover bg red/10
- Tag pills: #2B4A78 bg with #8B9EC2 text
- Modal overlay: rgba(0,0,0,0.7)
- Modal bg: #1A365D border #2B4A78
- Delete confirm button: #E53E3E bg, white text

**Light mode:**
- Background: #F5F0E8
- Content area bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Title text: #1A1A2E (Sora 600)
- Metadata text: #888888 (DM Sans 400)
- Content body text: #333333
- Breadcrumb link: #1A365D with #D4854A hover
- Edit button: outlined, #1A365D border + #1A365D text, hover bg #E8F0F8
- Delete button: outlined, #E53E3E border + #E53E3E text, hover bg red/5
- Tag pills: #E0E8F2 bg with #1A365D text
- Modal bg: #FFFFFF border #E8E4DF, shadow-lg
- Delete confirm button: #E53E3E bg, white text

**i18n examples:**
- Page title (EN): "Learning" / (PT-BR): "Aprendizado"
- Breadcrumb (EN): "← My Learnings" / (PT-BR): "← Meus Aprendizados"
- Metadata (EN): "Saved Feb 14, 2026 at 3:30 PM · Updated Feb 15, 2026 at 9:00 AM"
- Metadata (PT-BR): "Salvo em 14 de fev. de 2026, 15:30 · Atualizado em 15 de fev. de 2026, 09:00"
- Edit button (EN): "Edit" / (PT-BR): "Editar"
- Delete button (EN): "Delete" / (PT-BR): "Excluir"
- Delete confirm title (EN): "Delete this learning?" / (PT-BR): "Excluir este aprendizado?"
- Delete confirm body (EN): "This learning will be hidden from your list. This cannot be undone."
- Delete confirm body (PT-BR): "Este aprendizado será ocultado da sua lista. Isso não pode ser desfeito."
- Not found (EN): "This learning doesn't exist or has been deleted."
- Not found (PT-BR): "Este aprendizado não existe ou foi excluído."

**Accessibility:**
- Heading hierarchy: h1 for learning title, skip nav link for keyboard users
- "Edit" and "Delete" buttons have descriptive aria-labels (e.g. `aria-label="Edit this learning"`)
- Modal traps focus (focus-trap-react or native dialog element); Escape key closes it
- Delete confirm button has `aria-describedby` pointing to the warning text
- Metadata timestamps use `<time datetime="...">` elements

**Component framework:** Use shadcn/ui components (Button, Dialog, Badge, Skeleton). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
