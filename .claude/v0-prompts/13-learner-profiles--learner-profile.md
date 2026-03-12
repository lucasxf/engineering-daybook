I'm redesigning the **Learner Profile** screen for **learnimo**, a personal learning journal app.

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

### Screen: Learner Profile

**Purpose:** Shows a learner's public identity — avatar, display name, handle, bio — and their public learnings. If the profile is private, visitors see only the handle and a polite private message with no personal details exposed.

**Layout (top → bottom):**
1. **App header** — logo wordmark left; viewer's own avatar thumbnail (32px) + `@handle` link right (or Sign in link for unauthenticated visitors)
2. **Profile hero block** — centered or left-aligned card containing:
   - Avatar: 80px circle; shows the learner's photo OR an initials circle (first letter of display name, deterministic blue background e.g. #2B4A78)
   - Display name (Sora 600, ~22px)
   - `@handle` in muted smaller text below the display name
   - Bio: short paragraph in body text, max 2–3 lines, truncated with "show more" if longer
   - **Follow button** (right side or below bio): primary action — "Follow" (#D4854A) when not following, "Following" (ghost/secondary) when already following. Hidden on own profile.
3. **Tab bar or section divider** — "Learnings" tab (active by default). Future-friendly slot for a second tab.
4. **Learnings feed** — vertical list of learning cards. Each card shows: title, content excerpt (2 lines), tags as chips, relative timestamp. Same card style as the main feed.
5. **Empty learnings state** — centered illustration placeholder + "No public learnings yet" message

**Private profile variant (replaces sections 2–5):**
- Small lock icon above the handle
- `@handle` centered in Sora 600
- Subtitle: "This profile is private" (EN) / "Este perfil é privado" (PT-BR)
- No avatar, no bio, no learnings, no follow button

**States to design:**
- **Public profile — populated** — avatar/initials, display name, @handle, bio, follow button, list of learning cards
- **Public profile — no avatar** — initials circle in place of photo (first letter of display name, #2B4A78 bg on dark, #E0E8F2 bg on light)
- **Public profile — no bio** — bio row simply absent; no placeholder text shown
- **Public profile — empty learnings** — profile hero visible; feed area shows empty state ("No public learnings yet" / "Nenhum aprendizado público ainda")
- **Public profile — loading** — skeleton loaders for avatar circle, name line, bio lines, and 3 card placeholders
- **Private profile** — lock icon + handle + private message only; no hero, no feed
- **Own profile** — same as public populated, but Follow button is hidden; subtle "Edit profile" or "Go to Settings" link shown instead
- **Not found** — clean 404 message: "Learner not found" / "Perfil não encontrado"

**Dark mode** (primary):
- Page background: #0F1B2D
- Profile hero card bg: #1A365D with 1px border #2B4A78
- Display name text: #F5F0E8 (Sora 600)
- Handle text: #8899AA
- Bio text: #AABBCC
- Initials avatar bg: #2B4A78, text: #F5F0E8
- Follow button (active): #D4854A with white text
- Following button (inactive): transparent, border #2B4A78, text #8899AA
- Learning card bg: #1A365D, border #2B4A78
- Card title: #F5F0E8
- Card body text: #8899AA
- Tag chips: #2B4A78 bg, #8B9EC2 text
- Timestamp: #66778A
- Lock icon (private): #8899AA
- Private message text: #8899AA

**Light mode:**
- Page background: #F5F0E8
- Profile hero card bg: #FFFFFF, 1px border #E8E4DF, subtle shadow
- Display name text: #1A1A2E
- Handle text: #666666
- Bio text: #444444
- Initials avatar bg: #E0E8F2, text: #1A365D
- Follow button (active): #D4854A with white text
- Following button (inactive): transparent, border #CCC, text #666666
- Learning card bg: #FFFFFF, border #E8E4DF, subtle shadow
- Card title: #1A1A2E
- Card body text: #666666
- Tag chips: #E0E8F2 bg, #1A365D text
- Timestamp: #999999
- Lock icon (private): #999999
- Private message text: #666666

**i18n examples (EN / PT-BR):**
- Follow button: "Follow" / "Seguir"
- Following button: "Following" / "Seguindo"
- Edit profile link (own profile): "Edit profile" / "Editar perfil"
- Learnings section heading: "Learnings" / "Aprendizados"
- Empty learnings: "No public learnings yet" / "Nenhum aprendizado público ainda"
- Private profile message: "This profile is private" / "Este perfil é privado"
- Not found: "Learner not found" / "Perfil não encontrado"
- Loading aria label: "Loading profile" / "Carregando perfil"

**Accessibility:**
- Avatar `<img>` has `alt="[Display name]'s avatar"` or `aria-label="[Display name] initials"` for initials circle
- Follow button has `aria-pressed` state
- Private lock icon is `aria-hidden="true"` with adjacent visible text
- Learning cards are keyboard-navigable with visible focus rings

**Component framework:** Use shadcn/ui components (Card, Avatar, Button, Badge, Skeleton, Separator). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~680px centered on desktop. Show all three variants: public populated, private, and loading skeleton.

Generate both dark and light mode previews side by side.
