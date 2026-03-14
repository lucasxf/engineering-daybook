I'm redesigning the **Create Learning** screen for **learnimo**, a personal learning journal app.

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

### Screen: Create Learning

**Purpose:** The primary capture surface — where a user records something they just learned. Designed for minimum friction: title is optional so users can capture raw insights without forced categorization. Content is the only required field. Think of it as a focused, distraction-free writing surface.

**Layout (top → bottom):**
1. Top navigation bar — wordmark "learnimo" (Bricolage Grotesque) on the left linking to the feed; right side has user avatar/menu
2. Page header — "New Learning" (EN) / "Novo aprendizado" (PT-BR), left-aligned, Sora 600; a subtle back arrow link to the feed
3. Form card (max-width ~680px, centered) containing:
   - Title input field — label "Title" (EN) / "Título" (PT-BR), placeholder "Optional — add a title if useful" (EN) / "Opcional — adicione um título se preferir" (PT-BR); character counter "0 / 200" right-aligned below the field, updates live
   - Content textarea — label "Content" (EN) / "Conteúdo" (PT-BR), taller textarea (min 180px, auto-expands); no placeholder or a subtle one like "What did you learn?" (EN) / "O que você aprendeu?" (PT-BR); character counter "0 / 50,000" below; this field is visually emphasized (slightly larger font, the true focus of the form)
   - Submit button — "Save Learning" (EN) / "Salvar aprendizado" (PT-BR), ember-CTA color, right-aligned; loading variant shows "Saving..." (EN) / "Salvando..." (PT-BR)
4. Cancel link — "Cancel" (EN) / "Cancelar" (PT-BR) left of the button, text-only, navigates back to the feed

**States to design:**

- **Default (empty):** Form with both fields empty; title counter shows 0/200, content counter shows 0/50,000; submit button is visually muted/disabled (not clickable without content)
- **Filling in (content entered):** Content has text, title may be empty; character counters update; submit button activates to full ember-CTA color; no validation shown yet (only on submit attempt)
- **Submitting (loading):** Submit button shows spinner + "Saving..." text; both fields disabled; no visual layout shift
- **Validation error — empty content:** Inline error below the content field: "Content is required" (EN) / "Conteúdo é obrigatório" (PT-BR); red/destructive color; content field border turns red; no error on title (it's optional)
- **Validation error — title too long:** Inline error below title: "Title must be 200 characters or less" (EN) / "O título deve ter no máximo 200 caracteres" (PT-BR); character counter turns red at limit
- **Validation error — content too long:** Inline error below content: "Content must be between 1 and 50,000 characters" (EN) / "O conteúdo deve ter entre 1 e 50.000 caracteres" (PT-BR); counter turns red
- **Success:** Full-page success state is NOT shown — after save, user is redirected to the feed. Design a brief success toast/banner: "Learning saved!" (EN) / "Aprendizado salvo!" (PT-BR) at the top of the screen, auto-dismisses

**Dark mode** (primary):
- Background: #0F1B2D
- Form card bg: #1A365D with 1px border #2B4A78
- Page heading: #F5F0E8
- Field label text: #8899AA
- Input/textarea bg: #0F1B2D with 1px border #2B4A78
- Input/textarea text: #F5F0E8
- Focused field border: #D4854A
- Placeholder text: #4A5C70
- Character counter (normal): #4A5C70
- Character counter (at/over limit): #E57373
- Submit button: #D4854A background, white text
- Submit button (disabled): #2B4A78 background, #4A5C70 text
- Cancel link: #8899AA, hover #F5F0E8
- Inline error text: #E57373
- Error field border: #E57373

**Light mode:**
- Background: #F5F0E8
- Form card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Page heading: #1A1A2E
- Field label text: #666666
- Input/textarea bg: #FFFFFF with 1px border #CCC
- Input/textarea text: #1A1A2E
- Focused field border: #D4854A
- Placeholder text: #AAAAAA
- Character counter (normal): #AAAAAA
- Character counter (at/over limit): #C62828
- Submit button: #D4854A background, white text
- Submit button (disabled): #E8E4DF background, #AAAAAA text
- Cancel link: #666666, hover #1A1A2E
- Inline error text: #C62828
- Error field border: #C62828

**i18n text examples (EN / PT-BR):**
- Page title: "New Learning" / "Novo aprendizado"
- Title label: "Title" / "Título"
- Title placeholder: "Optional — add a title if useful" / "Opcional — adicione um título se preferir"
- Content label: "Content" / "Conteúdo"
- Content placeholder: "What did you learn?" / "O que você aprendeu?"
- Submit: "Save Learning" / "Salvar aprendizado"
- Submitting: "Saving..." / "Salvando..."
- Cancel: "Cancel" / "Cancelar"
- Error — content required: "Content is required" / "Conteúdo é obrigatório"
- Error — title too long: "Title must be 200 characters or less" / "O título deve ter no máximo 200 caracteres"
- Success toast: "Learning saved!" / "Aprendizado salvo!"

**Interactions:**
- Title input is a single-line text field; pressing Tab moves focus to the content textarea
- Content textarea auto-expands vertically as the user types (no fixed height scroll); min height ~180px
- Character counters update on every keystroke; counter turns red when at or over the limit
- Submit button is visually disabled (muted colors, not clickable) until the content field has at least 1 character — no click needed to discover the error, just start typing
- Pressing Cmd/Ctrl+Enter anywhere in the form triggers submit (keyboard shortcut)
- On successful save, navigate to the feed and show the success toast; the toast auto-dismisses after 3 seconds
- Pressing Escape or clicking "Cancel" navigates back to the feed without saving; no confirmation dialog for an empty form; if content has been typed, no additional prompt either (browser default behavior is fine for MVP)

**Accessibility:**
- Title and Content fields each have an associated `<label>` element
- Inline error messages use `role="alert"` so screen readers announce them on submission
- Character counters are connected to their fields via `aria-describedby`
- Submit button has an `aria-disabled` state when content is empty (not `disabled` attribute, to keep it focusable)
- Keyboard: Tab order is Title → Content → Submit → Cancel

**Component framework:** Use shadcn/ui components (Input, Textarea, Button, Label, Card). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~680px centered on desktop.

Generate both dark and light mode previews side by side.
