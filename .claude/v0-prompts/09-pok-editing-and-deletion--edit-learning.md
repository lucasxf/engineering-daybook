I'm redesigning the **Edit Learning** screen for **learnimo**, a personal learning journal app.

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

### Screen: Edit Learning

**Purpose:** Allows an authenticated learner to update the title and/or content of an existing learning they own. The form pre-populates with the current values so the learner can make targeted edits. On success, a toast notification confirms the save and the learner returns to the learning's detail view.

**Layout (top → bottom):**

1. **Top navigation bar** — learnimo wordmark (left), user avatar/menu (right)
2. **Breadcrumb row** — "My Learnings / [Learning Title or "Untitled"] / Edit" with back arrow linking to the detail view
3. **Page header** — heading "Edit Learning" (Sora 600, large), subtitle "Make changes to your learning below"
4. **Edit form card** — prominent card, full-width up to max ~720px centered:
   - **Title field** (optional) — labeled "Title", placeholder "Give this learning a title (optional)", single-line text input, pre-populated with current title or empty. Helper text: "Max 200 characters"
   - **Content field** (required) — labeled "What did you learn?", multi-line textarea, pre-populated with current content, minimum ~8 rows, auto-expands, character count shown below (e.g. "2,341 / 50,000"). Required.
   - **Action row** — "Save Changes" CTA button (ember orange, full-width on mobile, right-aligned on desktop) + "Cancel" ghost button (left of CTA)
5. **Success toast** — appears at top-right (or bottom-center on mobile) after successful save: "Learning updated successfully" / "Aprendizado atualizado com sucesso". Auto-dismisses after ~4s. Has a close (×) button.
6. **Error toast** — appears if save fails: "Something went wrong. Please try again." / "Algo deu errado. Por favor, tente novamente."

**States to design:**

- **Default / pre-populated** — form loaded with existing title and content, Save button enabled
- **Editing** — user is actively typing, character counter updates live, Save button remains enabled as long as content is non-empty
- **Loading / saving** — Save button shows spinner and "Saving…" text, both inputs disabled, Cancel button disabled
- **Validation error** — content field shows inline error "Content is required" (if blank) or "Content must be under 50,000 characters" (if too long); title shows "Title must be under 200 characters" if exceeded; Save blocked
- **Save success** — success toast appears; form may be replaced with a brief "Saved!" confirmation before navigating back to the detail view
- **Save error** — error toast appears; form remains editable so the learner can retry
- **Unauthorized (403)** — full-page error state: "You don't have permission to edit this learning." with a link back to "My Learnings"
- **Not found (404)** — full-page error: "This learning doesn't exist or has been deleted." with a link back to "My Learnings"

**i18n examples (EN / PT-BR):**

| Key | EN | PT-BR |
|-----|-----|-------|
| Page heading | Edit Learning | Editar Aprendizado |
| Title label | Title | Título |
| Title placeholder | Give this learning a title (optional) | Dê um título a este aprendizado (opcional) |
| Content label | What did you learn? | O que você aprendeu? |
| Save button | Save Changes | Salvar Alterações |
| Saving state | Saving… | Salvando… |
| Cancel button | Cancel | Cancelar |
| Success toast | Learning updated successfully | Aprendizado atualizado com sucesso |
| Error toast | Something went wrong. Please try again. | Algo deu errado. Por favor, tente novamente. |
| Content required | Content is required | O conteúdo é obrigatório |
| Content too long | Content must be under 50,000 characters | O conteúdo deve ter menos de 50.000 caracteres |
| Title too long | Title must be under 200 characters | O título deve ter menos de 200 caracteres |
| Char counter | {n} / 50,000 | {n} / 50.000 |

**Dark mode** (primary):
- Background: #0F1B2D
- Card bg: #1A365D with 1px border #2B4A78
- Page heading: #F5F0E8
- Breadcrumb + label text: #8899AA (muted blue-gray)
- Input bg: #0F1B2D, border #2B4A78, text #F5F0E8
- Input focus ring: #D4854A
- Placeholder text: #4A6080
- Character counter: #8899AA
- Save CTA button: #D4854A background, white text
- Cancel button: transparent bg, #8899AA text, #2B4A78 border on hover
- Success toast: #1A3D1A bg, #6FCF97 left border, #F5F0E8 text
- Error toast: #3D1A1A bg, #EB5757 left border, #F5F0E8 text
- Inline validation error text: #EB5757

**Light mode:**
- Background: #F5F0E8
- Card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Page heading: #1A1A2E
- Breadcrumb + label text: #666666
- Input bg: #FFFFFF, border #CCC, text #1A1A2E
- Input focus ring: #D4854A
- Placeholder text: #AAAAAA
- Character counter: #999999
- Save CTA button: #D4854A background, white text
- Cancel button: transparent bg, #666666 text, #CCC border on hover
- Success toast: #F0FFF4 bg, #6FCF97 left border, #1A1A2E text
- Error toast: #FFF0F0 bg, #EB5757 left border, #1A1A2E text
- Inline validation error text: #CC0000

**Interactions and behavior notes:**
- Character counter for content updates on every keystroke
- Save button is disabled (greyed out) when content is empty or exceeds 50,000 characters, or title exceeds 200 characters
- Clicking Cancel navigates back to the learning detail view without saving
- On successful save, a toast appears confirming the update; navigation back to detail happens automatically (either on toast dismiss or after a short delay — show both states)
- Textarea should auto-expand as the user types (no fixed height cap, but minimum 8 visible rows)
- The breadcrumb "back" link (← arrow) also navigates to the detail view without saving

**Accessibility requirements:**
- Success/error toasts must have `role="status"` or `aria-live="polite"` so screen readers announce them
- Inline validation errors linked to inputs via `aria-describedby`
- Save button disabled state uses `aria-disabled="true"` and a visual greyed appearance
- Textarea and title input have visible, high-contrast focus rings

**Component framework:** Use shadcn/ui components (Textarea, Input, Button, Label, Alert/Toast). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~720px centered on desktop.

Generate both dark and light mode previews side by side.
