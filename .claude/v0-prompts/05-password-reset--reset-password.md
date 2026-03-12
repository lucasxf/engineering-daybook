I'm redesigning the **Reset Password** screen for **learnimo**, a personal learning journal app.

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

### Screen: Reset Password

**Purpose:** Allows a user who received a password reset email to set a new password. The page validates the reset token on load — showing an error state immediately for stale or invalid links — and renders the new password form only when the token is confirmed valid. Redirects to login with a success message after a successful reset.

**Layout (top → bottom):**
1. Centered wordmark "learnimo" (Bricolage Grotesque) linking to the home page — top center, minimal
2. Centered card (max-width 420px) containing the active state (form OR error):
   - **Valid token state:** Heading "Set a new password" + subtitle "Choose a strong password for your account" + new password field with show/hide toggle + confirm password field with show/hide toggle + inline password requirements hint (8–128 chars, uppercase, lowercase, number) + "Set new password" submit button
   - **Invalid/expired token state:** Warning icon + heading "Link expired or invalid" + message "This reset link is no longer valid. Please request a new one." + prominent "Request a new link" button
   - **Loading state (token validation):** Skeleton/spinner centered in card while the token is being validated on page load
   - **Success state (post-submit):** Success icon + message "Password updated. Please sign in with your new password." + "Back to sign in" link
3. "Back to sign in" link below the card (shown in all states except success, where it's inside the card)

**States to design:**

- **Validating (page load):** Card shows a centered spinner or skeleton — token is being validated before rendering anything else
- **Form (valid token):** New password field + confirm password field + submit button; fields show inline validation errors if rules are violated; button shows "Setting password..." loading state while submitting
- **Error — invalid/expired token:** Warning icon, "Link expired or invalid" heading, explanation text, ember-CTA "Request a new link" button, subtle "Back to sign in" text link
- **Error — passwords don't match:** Inline error below confirm password field: "Passwords do not match" — form remains active
- **Error — weak password:** Inline error below new password field listing the broken rule (e.g., "Password must contain at least one uppercase letter") — form remains active, token NOT consumed
- **Error — unexpected API error:** Alert banner at top of card with "Something went wrong. Please try again." using role="alert"
- **Success:** Success icon (checkmark in ember-CTA circle), success message, "Back to sign in" link — no form visible

**Dark mode** (primary):
- Background: #0F1B2D
- Card bg: #1A365D with 1px border #2B4A78
- Heading text: #F5F0E8
- Body/label text: #8899AA (muted blue-gray)
- Input bg: #0F1B2D border #2B4A78, focused border #D4854A
- Input text: #F5F0E8
- Password hint text: #8899AA (smaller, below field)
- Show/hide toggle icon: #8899AA, hover #F5F0E8
- Primary button: #D4854A background, white text, hover darken 10%
- Secondary link: #8899AA, hover #F5F0E8
- Error state icon/heading: #E57373 (soft red)
- Success state icon: #D4854A circle with white checkmark
- Inline error text: #E57373
- Alert banner bg: rgba(229, 115, 115, 0.15) border #E57373

**Light mode:**
- Background: #F5F0E8
- Card bg: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Heading text: #1A1A2E
- Body/label text: #666666
- Input bg: #FFFFFF border #CCC, focused border #D4854A
- Input text: #1A1A2E
- Password hint text: #999999
- Show/hide toggle icon: #999999, hover #1A1A2E
- Primary button: #D4854A background, white text
- Secondary link: #666666, hover #1A1A2E
- Error state icon/heading: #C62828
- Success state icon: #D4854A circle with white checkmark
- Inline error text: #C62828
- Alert banner bg: #FFEBEE border #C62828

**i18n text examples (EN / PT-BR):**
- Heading (form): "Set a new password" / "Defina uma nova senha"
- New password label: "New password" / "Nova senha"
- Confirm label: "Confirm new password" / "Confirmar nova senha"
- Submit button: "Set new password" / "Redefinir senha"
- Submitting: "Setting password..." / "Redefinindo senha..."
- Error heading: "Link expired or invalid" / "Link expirado ou inválido"
- Error body: "This reset link is no longer valid. Please request a new one." / "Este link de redefinição não é mais válido. Solicite um novo."
- CTA on error: "Request a new link" / "Solicitar um novo link"
- Success: "Password updated. Please sign in with your new password." / "Senha atualizada. Faça login com sua nova senha."
- Back to sign in: "Back to sign in" / "Voltar para o login"

**Interactions:**
- On page load, immediately show the validating spinner — do not render the form until validation resolves
- Password fields include a show/hide toggle (eye icon) that toggles `type="password"` ↔ `type="text"`; toggle has an accessible aria-label ("Show password" / "Hide password")
- Password requirements hint appears below the new password field at all times (not just on error), listing the 4 rules in a small, muted checklist — rules highlight green as they are satisfied in real-time
- On submit, disable both fields and the button; show loading state on the button
- After successful submit, replace the entire card content with the success state (no navigation redirect needed in the design — just show success in place with a "Back to sign in" link)
- "Request a new link" button (error state) navigates to the forgot-password page
- "Back to sign in" link navigates to the login page

**Accessibility:**
- All inputs have associated `<label>` elements
- Error and success messages use `role="alert"` so screen readers announce them immediately
- Show/hide password toggles have descriptive `aria-label` attributes that update when state changes
- After form submission (success or error), focus moves to the status message
- Token-validation spinner has `aria-label="Validating reset link..."` or equivalent

**Component framework:** Use shadcn/ui components (Input, Button, Alert, Card, Skeleton, Label). Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile, max-width ~420px centered on desktop.

Generate both dark and light mode previews side by side.
