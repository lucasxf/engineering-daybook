I'm redesigning the **Settings** screen for **learnimo**, a personal learning journal app.

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

### Screen: Settings

**Purpose:** Lets an authenticated learner manage their full profile identity — avatar, display name, bio — and control privacy and preferences. This is the single page where personal identity and app behavior are configured.

**Layout (top → bottom):**
1. **App header** — logo wordmark left, avatar thumbnail (32px circle) + `@handle` link right
2. **Page title** — "Settings" (Sora 600, large) with a short subtitle: "Manage your profile and preferences"
3. **Section: Avatar** — centered avatar preview (96px circle showing image or initials placeholder), below it two buttons side by side: "Upload photo" (secondary) and "Remove" (ghost/destructive, only enabled when an avatar exists). File hint text: "JPEG, PNG or WebP · max 2 MB"
4. **Section: Profile** — two stacked labeled inputs:
   - "Display name" — text input, max 100 chars, required. Inline error if blank.
   - "Bio" — textarea, max 200 chars, with live character counter (e.g. "47 / 200") anchored bottom-right of the textarea. Inline error if a URL is detected.
   - "Save changes" CTA button (#D4854A) — right-aligned below the fields
5. **Section: Privacy** — a labeled `<select>` / segmented control for profile visibility:
   - Options: "Public" (anyone can view your profile and learnings), "Private" (only you can see your profile)
   - Current selection highlighted. Description text below each option.
   - "Save" button for this section
6. **Section: Appearance** — theme toggle (Light / Dark / System) rendered as a 3-option button group
7. **Section: Language** — language selector (English / Português)
8. **Divider + Danger zone** — "Delete account" link in muted red, right-aligned or in a distinct low-emphasis block

**States to design:**
- **Default / loaded** — all fields populated with the user's current values; avatar shows their image or an initials circle (first letter of display name, deterministic background color)
- **Avatar: no photo set** — initials circle placeholder (e.g. "L" on a #2B4A78 background); "Remove" button is disabled/hidden
- **Avatar: uploading** — upload button shows a spinner, disabled; progress or loading state on the avatar circle
- **Avatar: upload error** — inline error banner below the upload button: "File must be JPEG, PNG, or WebP and under 2 MB"
- **Avatar: upload success** — avatar circle updates to the new image; no toast needed (visual confirmation is enough)
- **Bio: URL detected** — red inline error beneath the bio textarea: "Bio cannot contain links" (EN) / "Bio não pode conter links" (PT-BR)
- **Display name: blank** — red inline error: "Display name is required" / "Nome de exibição é obrigatório"
- **Profile section: saving** — "Save changes" button shows spinner, disabled
- **Profile section: saved** — brief success state on the button ("Saved ✓") or a subtle inline confirmation, auto-resets after 2s
- **Unsaved changes** — "Save changes" button is visually active (#D4854A); when no changes pending, it is muted/disabled

**Dark mode** (primary):
- Page background: #0F1B2D
- Section card bg: #1A365D with 1px border #2B4A78
- Section heading text: #F5F0E8 (Sora 600)
- Body/label text: #8899AA
- Input bg: #0F1B2D, border #2B4A78, focus ring #D4854A
- Textarea bg: same as input; character counter: #8899AA
- Initials avatar circle bg: #2B4A78, text: #F5F0E8
- CTA button (Save changes): #D4854A with white text
- Secondary button (Upload photo): #1A365D border #2B4A78, text #F5F0E8
- Destructive ghost (Remove): transparent, text #C0392B
- Visibility option selected: #2B4A78 border #D4854A
- Visibility option unselected: #1A365D border #2B4A78
- Theme toggle active: #2B4A78 border #D4854A
- Danger zone text: #C0392B (muted, low emphasis)

**Light mode:**
- Page background: #F5F0E8
- Section card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Section heading text: #1A1A2E
- Body/label text: #666666
- Input bg: #FFFFFF, border #CCC, focus ring #D4854A
- Textarea bg: #FFFFFF; character counter: #999
- Initials avatar circle bg: #E0E8F2, text: #1A365D
- CTA button: #D4854A with white text
- Secondary button: #FFFFFF border #CCC, text #1A1A2E
- Destructive ghost: transparent, text #C0392B
- Visibility option selected: #E0E8F2 border #D4854A
- Danger zone text: #C0392B

**i18n examples (EN / PT-BR):**
- Page title: "Settings" / "Configurações"
- Avatar section heading: "Avatar" / "Avatar"
- Upload button: "Upload photo" / "Enviar foto"
- Remove button: "Remove" / "Remover"
- Avatar hint: "JPEG, PNG or WebP · max 2 MB" / "JPEG, PNG ou WebP · máx 2 MB"
- Display name label: "Display name" / "Nome de exibição"
- Bio label: "Bio" / "Bio"
- Bio placeholder: "Tell others what you're learning about…" / "Conte o que você está aprendendo…"
- Bio URL error: "Bio cannot contain links" / "Bio não pode conter links"
- Display name error: "Display name is required" / "Nome de exibição é obrigatório"
- Save button: "Save changes" / "Salvar alterações"
- Saved confirmation: "Saved ✓" / "Salvo ✓"
- Privacy section heading: "Privacy" / "Privacidade"
- Visibility public label: "Public" / "Público"
- Visibility public desc: "Anyone can view your profile and learnings" / "Qualquer pessoa pode ver seu perfil e aprendizados"
- Visibility private label: "Private" / "Privado"
- Visibility private desc: "Only you can see your profile" / "Só você pode ver seu perfil"
- Appearance heading: "Appearance" / "Aparência"
- Language heading: "Language" / "Idioma"
- Danger zone: "Delete account" / "Excluir conta"

**Component framework:** Use shadcn/ui components (Card, Input, Textarea, Button, Select, Avatar, Label, Separator, Badge). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~680px centered on desktop. Each settings section is a distinct Card with a section heading and subtle top border accent in #D4854A.

Generate both dark and light mode previews side by side.
