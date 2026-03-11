I'm redesigning the **Choose Handle** screen for **learnimo**, a personal learning journal app.

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

### Screen: Choose Handle

**Purpose:** This is a one-time step that appears after a user signs in with Google for the very first time. Because learnimo identifies users by a unique handle (e.g. `@lucasxf`), Google OAuth alone isn't enough — the user must pick their handle before their account is created and they can access the app.

**Layout (top → bottom):**
1. **Page header** — centered learnimo wordmark ("learn" in regular weight + "imo" in bold, using Bricolage Grotesque). No navigation links — this is a focused, single-action screen.
2. **Hero heading** — "One last step" (Sora, large). Subtitle: "Choose a handle to identify yourself on learnimo." Small supporting note: "Your handle is permanent and can't be changed later. Choose wisely."
3. **Handle input field** — full-width text input. Left-prefix: `@` symbol styled as a non-editable inset label. Placeholder: `your-handle`. Below the field: a real-time status indicator showing one of several states (see States section). Format hint below: "3–30 characters · lowercase letters, numbers, hyphens · cannot start or end with a hyphen"
4. **Preview** — as the user types a valid-format handle, show a small preview pill: `@their-handle` rendered with the brand color (#8B5E3C) so they can see how it will appear in the UI.
5. **CTA button** — full-width "Claim my handle" button (#D4854A). Disabled until the handle is confirmed available. Shows a spinner when the claim request is in flight.
6. **Footer** — minimal: "Wrong account? Sign in again" link that returns to the login page.

**States to design:**

- **Idle / empty** — input empty, no status indicator visible, CTA button disabled
- **Typing / checking** — user is typing, status indicator shows a pulsing spinner with "Checking availability…" in muted text, CTA disabled
- **Available** — green checkmark icon + "✓ @handle is available" in success color. CTA enabled.
- **Taken** — red × icon + "@handle is already taken. Try another." CTA disabled.
- **Invalid format** — amber warning icon + inline message describing the rule violated (e.g. "Handle must be at least 3 characters", "Only lowercase letters, numbers, and hyphens allowed", "Handle cannot start or end with a hyphen"). CTA disabled.
- **Submitting** — CTA button shows spinner + "Claiming…" text; input disabled.
- **Error — token expired** — full-card error state (replaces form) with message: "Your Google sign-in session has expired. Please sign in again." and a single CTA button: "Sign in with Google". This happens if the temporary Google OAuth token expires before the user completes handle selection.
- **Generic error** — inline error banner below the CTA: "Something went wrong. Please try again." with a retry option.

**i18n examples:**

| Key | EN | PT-BR |
|-----|----|-------|
| `auth.chooseHandle.heading` | One last step | Último passo |
| `auth.chooseHandle.subtitle` | Choose a handle to identify yourself on learnimo. | Escolha um identificador para se apresentar no learnimo. |
| `auth.chooseHandle.permanentNote` | Your handle is permanent and can't be changed later. Choose wisely. | Seu identificador é permanente e não pode ser alterado depois. Escolha com cuidado. |
| `auth.chooseHandle.placeholder` | your-handle | seu-identificador |
| `auth.chooseHandle.formatHint` | 3–30 characters · lowercase letters, numbers, hyphens · cannot start or end with a hyphen | 3–30 caracteres · letras minúsculas, números, hífens · não pode começar ou terminar com hífen |
| `auth.chooseHandle.checking` | Checking availability… | Verificando disponibilidade… |
| `auth.chooseHandle.available` | @{handle} is available | @{handle} está disponível |
| `auth.chooseHandle.taken` | @{handle} is already taken. Try another. | @{handle} já está em uso. Tente outro. |
| `auth.chooseHandle.cta` | Claim my handle | Confirmar identificador |
| `auth.chooseHandle.submitting` | Claiming… | Confirmando… |
| `auth.chooseHandle.sessionExpired` | Your Google sign-in session has expired. Please sign in again. | Sua sessão do Google expirou. Por favor, faça login novamente. |
| `auth.chooseHandle.wrongAccount` | Wrong account? Sign in again | Conta errada? Entre novamente |

**Dark mode** (primary):
- Background: #0F1B2D
- Card/form bg: #1A365D with 1px border #2B4A78, subtle border radius 12px
- Page heading text: #F5F0E8
- Subtitle/supporting text: #8899AA (muted blue-gray)
- Input bg: #0F1B2D border #2B4A78, focus ring #D4854A
- `@` prefix inset: #2B4A78 bg with #8899AA text
- Handle preview pill: #2B4A78 bg with #8B5E3C text
- Status — available: #4ADE80 (green)
- Status — taken: #F87171 (red)
- Status — invalid: #FBBF24 (amber)
- Status — checking: #8899AA (muted, animated)
- CTA button: #D4854A bg with #F5F0E8 text, disabled: #4A3020 bg with #6B5040 text
- Footer link: #8899AA, hover #D4854A

**Light mode:**
- Background: #F5F0E8
- Card/form bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Page heading text: #1A1A2E
- Subtitle/supporting text: #666666
- Input bg: #FFFFFF border #CCC, focus ring #D4854A
- `@` prefix inset: #F0EDE8 bg with #888 text
- Handle preview pill: #E0E8F2 bg with #8B5E3C text
- Status — available: #16A34A (green)
- Status — taken: #DC2626 (red)
- Status — invalid: #D97706 (amber)
- Status — checking: #999999 (muted, animated)
- CTA button: #D4854A bg with white text, disabled: #E8C8B0 bg with #A0785A text
- Footer link: #888, hover #D4854A

**Interactions and behavior notes:**
- Handle availability check is debounced ~300ms after the user stops typing
- Format validation runs client-side immediately (before the network check) — fail fast with inline error before making any API call
- The `@` prefix is always shown as a non-editable inset inside the input — the user only types the handle part without `@`
- The handle preview pill appears as soon as the user has typed a format-valid handle (even before availability is confirmed), using muted/neutral color; it turns #8B5E3C once confirmed available
- The CTA button is only enabled when the server has confirmed the handle is available
- On submit, the button enters the "Claiming…" spinner state and the input is disabled to prevent double-submission
- On token expiration error (from the API), the entire form is replaced by the session-expired state — the user cannot retry the handle step without re-authenticating

**Accessibility:**
- Input must have an associated `<label>` ("Your handle") — visually hidden if design hides it, but present in DOM
- Status messages (available, taken, checking) must use `role="status"` and `aria-live="polite"` so screen readers announce them without interrupting the user
- Error messages must use `aria-describedby` linked to the input field
- CTA button must have `aria-disabled="true"` when disabled (not just the `disabled` HTML attribute) to ensure screen readers announce the state
- Color must not be the only indicator of status — always pair with an icon or text label

**Component framework:** Use shadcn/ui components (Input, Button, Badge for the preview pill, Alert for error banners). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~480px centered on desktop (tighter than the feed — this is a focused single-action screen).

Generate both dark and light mode previews side by side.
