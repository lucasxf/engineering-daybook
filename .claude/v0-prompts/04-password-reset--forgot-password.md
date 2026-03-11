I'm redesigning the **Forgot Password** screen for **learnimo**, a personal learning journal app.

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

### Screen: Forgot Password

**Purpose:** Let users recover access to their account by requesting a password reset email. The page is intentionally neutral — it always shows the same confirmation after submission to prevent email enumeration (no hint of whether the address is registered or not).

**Layout (top → bottom):**

1. **Header / Brand bar** — centred wordmark "learnimo" (Bricolage Grotesque: "learn" regular + "imo" bold) linking back to the login page. No nav links.
2. **Card / Form container** — centred, max-width ~400px, vertically centred on the viewport.
3. **Page title** — "Forgot your password?" (Sora 600, large). PT-BR: "Esqueceu sua senha?"
4. **Subtitle** — "Enter your email and we'll send a reset link." (DM Sans, muted). PT-BR: "Informe seu e-mail e enviaremos um link para redefinir sua senha."
5. **Email field** — label "Email" / "E-mail" above the input. Full-width input with placeholder `you@example.com`. Inline error shown below the field when invalid.
6. **Submit button** — full-width, ember-CTA colour. Label: "Send reset link" / "Enviar link de redefinição". Loading state label: "Sending…" / "Enviando…" (spinner inside button, button disabled).
7. **Back to sign in link** — below the button, text link: "Back to sign in" / "Voltar para o login". Left-aligned or centred.
8. **Footer** — minimal, no distractions.

**Confirmation state (replaces form after submit):**

After the user submits (regardless of whether the email exists), the form is replaced by a success panel:
- Icon: envelope or inbox illustration (outlined, ember-CTA stroke)
- Title: "Check your inbox" / "Verifique seu e-mail" (Sora 600)
- Message: "If an account with that email exists, we've sent a password reset link. Check your inbox (and spam folder)." / "Se houver uma conta com esse e-mail, enviamos um link de redefinição. Verifique sua caixa de entrada (e a pasta de spam)."
- Link: "Back to sign in" / "Voltar para o login"

**States to design:**

- **Default** — empty email field, submit button active
- **Validation error** — inline error below the email field: "Email is required" / "E-mail é obrigatório" or "Invalid email format" / "Formato de e-mail inválido"; field border highlighted in red/amber
- **Loading / submitting** — button shows spinner + "Sending…" / "Enviando…"; input disabled; no other change to layout
- **Confirmation** — form replaced by the success panel (see above); no error is ever shown, even if the email is unknown (by design)
- **Unexpected error** — rare fallback toast or inline alert: "Something went wrong. Please try again." / "Algo deu errado. Tente novamente." — shown without revealing whether the address exists

**Dark mode** (primary):
- Background: #0F1B2D
- Card bg: #1A365D with 1px border #2B4A78
- Title text: #F5F0E8
- Subtitle / muted text: #8899AA
- Input bg: #0F1B2D, border #2B4A78, focus ring #D4854A
- Label text: #F5F0E8
- Inline error text: #FF8080
- Submit button: #D4854A background, white text
- Back link: #8899AA, hover #F5F0E8
- Confirmation icon stroke: #D4854A
- Confirmation panel bg: #1A365D, border #2B4A78

**Light mode:**
- Background: #F5F0E8
- Card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Title text: #1A1A2E
- Subtitle / muted text: #666666
- Input bg: #FFFFFF, border #CCC, focus ring #D4854A
- Label text: #1A1A2E
- Inline error text: #CC3333
- Submit button: #D4854A background, white text
- Back link: #666666, hover #1A1A2E
- Confirmation icon stroke: #D4854A
- Confirmation panel bg: #FFF8F3, border #E8DDD5

**Component framework:** Use shadcn/ui components (Card, Input, Label, Button, Alert). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~400px centred on desktop.

Generate both dark and light mode previews side by side.
