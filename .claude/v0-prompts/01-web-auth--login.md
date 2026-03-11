I'm redesigning the **Login** screen for **learnimo**, a personal learning journal app for engineers and knowledge workers.

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

### Screen: Login

**Purpose:** Lets registered users authenticate into learnimo. The primary entry point for returning users — clean and frictionless with minimal fields. After login, the user is redirected to their learning feed.

**Layout (top → bottom):**
1. **Top bar** — learnimo wordmark (left), LanguageToggle + ThemeToggle (right)
2. **Centered card** — max-width 400px, vertically and horizontally centered on the page
   - App icon / small logo mark above the heading
   - Heading: "Welcome back" (EN) / "Bem-vindo de volta" (PT-BR)
   - Subheading: "Log in to your account" (EN) / "Entre na sua conta" (PT-BR)
   - **Email field** — label "Email", type email, placeholder "you@example.com", with inline error zone below
   - **Password field** — label "Password" / "Senha", type password, with eye-icon toggle (show/hide), inline error zone below
   - **Log In button** — full-width, ember-cta color (#D4854A), text "Log In" / "Entrar"
   - **Server error banner** — shown below the button when credentials are invalid; text "Invalid email or password" / "Email ou senha inválidos"; subtle red/alert styling
   - **Register link** — "Don't have an account? Sign up" / "Não tem uma conta? Cadastre-se" — link text in ember-cta color

**States to design:**
- **Default** — empty form, all fields blank, Log In button disabled
- **Filled / valid** — both fields populated, Log In button enabled and clickable
- **Submitting / loading** — Log In button shows a small spinner, is disabled; fields remain visible
- **Error — invalid credentials** — server error banner visible below the button: "Invalid email or password"; password field cleared
- **Error — client validation** — inline error below empty email field: "Email is required" / "Email obrigatório"; inline error below empty password field: "Password is required" / "Senha obrigatória"

**Dark mode** (primary):
- Page background: #0F1B2D
- Card background: #1A365D with 1px border #2B4A78, subtle shadow
- Heading text: #F5F0E8
- Body / label text: #8899AA (muted blue-gray)
- Input background: #0F1B2D, border: #2B4A78, text: #F5F0E8, placeholder: #4A5A6A
- Input focus: border #D4854A, glow ring rgba(212,133,74,0.25)
- Eye icon: #8899AA, hover: #F5F0E8
- Log In button: #D4854A background, white text, hover: #C07340
- Log In button disabled: #3A4A5A background, #6A7A8A text
- Server error banner: #2D1A1A background, #FF8A8A text, 1px border #5A2A2A
- Register link: #8899AA text, link portion: #D4854A
- Top bar background: #0F1B2D, border-bottom: #1A365D

**Light mode:**
- Page background: #F5F0E8
- Card background: #FFFFFF with 1px border #E8E4DF, subtle shadow
- Heading text: #1A1A2E
- Body / label text: #666666
- Input background: #FFFFFF, border: #CCC, text: #1A1A2E, placeholder: #999
- Input focus: border #D4854A, glow ring rgba(212,133,74,0.2)
- Eye icon: #999, hover: #1A1A2E
- Log In button: #D4854A background, white text, hover: #C07340
- Log In button disabled: #E0D8D0 background, #999 text
- Server error banner: #FFF0F0 background, #C0392B text, 1px border #F5C6C6
- Register link: #666 text, link portion: #D4854A
- Top bar background: #F5F0E8, border-bottom: #E8E4DF

**i18n examples (show EN copy in the design):**
- Heading: "Welcome back"
- Subheading: "Log in to your account"
- Email label: "Email"
- Password label: "Password"
- Password placeholder: "••••••••"
- Show/hide toggle aria-label: "Show password" / "Hide password"
- Submit button: "Log In"
- Submit button loading: "Logging in…"
- Validation — email required: "Email is required"
- Validation — password required: "Password is required"
- Server error: "Invalid email or password"
- Register link: "Don't have an account? Sign up"

**Accessibility requirements:**
- All inputs have associated `<label>` elements
- Error messages linked via `aria-describedby` and announced via `aria-live="polite"` region
- Password visibility toggle has visible accessible label ("Show password" / "Hide password")
- Tab order: Email → Password → eye toggle → Log In button → Sign up link
- Visible focus ring on all interactive elements (ember-cta accent)
- Form submits on Enter key from any field

**Component framework:** Use shadcn/ui components — Card, Input, Label, Button, Form (react-hook-form). Style with Tailwind CSS utility classes. Make it fully responsive — full-width card on mobile (padding 16px), max-width 400px centered on desktop.

Generate both dark and light mode previews side by side.
