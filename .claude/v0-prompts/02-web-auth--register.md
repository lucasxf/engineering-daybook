I'm redesigning the **Register** screen for **learnimo**, a personal learning journal app.

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

### Screen: Register

**Purpose:** Lets a new user create a learnimo account. The form collects an email, password, display name, and a unique handle — the user's permanent public identifier in the app.

**Layout (top → bottom):**

1. **Top utility bar** — right-aligned row with a language toggle (EN / PT-BR) and a theme toggle (sun/moon icon). No nav links; this is a public auth page.
2. **Wordmark** — centered "learnimo" in Bricolage Grotesque ("learn" regular weight, "imo" bold), linking to the landing page. Sits above the card.
3. **Auth card** — centered, max-width 420px, with subtle border and shadow.
   - **Heading:** "Create your account" (EN) / "Crie sua conta" (PT-BR) — Sora 600, large.
   - **Subheading:** "Capture and grow your knowledge." (EN) / "Capture e expanda seu conhecimento." (PT-BR) — muted, DM Sans.
4. **Form fields (top → bottom inside the card):**
   - **Display Name** — text input, label "Display name" / "Nome de exibição", placeholder "Jane Doe"
   - **Email** — email input, label "Email", placeholder "jane@example.com"
   - **Handle** — text input, label "Handle" / "Identificador", placeholder "janedoe", prefix `@` shown inside the input. Below the input, show an inline availability badge: a spinner while checking, a green checkmark + "Handle available" / "Identificador disponível" when free, or a red X + "Handle taken" / "Identificador já em uso" when taken.
   - **Password** — password input with eye-icon toggle for visibility, label "Password" / "Senha". Below the input, show a password strength bar: three segments (weak / medium / strong) filled with red → amber → green based on strength. Strength label text: "Weak" / "Fraca", "Medium" / "Média", "Strong" / "Forte".
   - **Confirm Password** — password input with eye-icon toggle, label "Confirm password" / "Confirmar senha".
5. **Inline validation errors** — appear below each field in red, smaller text. Examples:
   - "Invalid email format" / "Formato de e-mail inválido"
   - "Min. 8 characters, 1 uppercase, 1 lowercase, 1 number" / "Mín. 8 caracteres, 1 maiúsculo, 1 minúsculo, 1 número"
   - "Passwords do not match" / "As senhas não coincidem"
   - "Handle must be 3–30 lowercase letters, numbers, or hyphens" / "O identificador deve ter 3–30 letras minúsculas, números ou hifens"
6. **Submit button** — full-width, ember CTA color (#D4854A), white text, label "Create account" / "Criar conta". Shows a spinner and is disabled while submitting or the form is invalid.
7. **Server error banner** — appears above the submit button when the server returns an error (e.g. 409 Conflict). Red-tinted alert with icon. Examples: "Email already in use" / "E-mail já cadastrado", "Handle already taken" / "Identificador já em uso".
8. **Login link** — below the button, centered: "Already have an account? Log in" / "Já tem uma conta? Entrar". "Log in" / "Entrar" is a link in ember color.

**States to design:**

- **Idle (empty form)** — all fields blank, submit button disabled, no errors shown.
- **Typing / partial validation** — individual field errors appear on blur. Handle field shows spinner while checking availability, then resolves to available (green) or taken (red).
- **Password strength feedback** — strength bar updates live as the user types the password.
- **Form invalid** — one or more field errors visible, submit button remains disabled.
- **Submitting** — all fields disabled, submit button shows inline spinner, text changes to "Creating account…" / "Criando conta…".
- **Server error** — form re-enabled, submit button active again, error banner shown above the button.
- **Success** — (no visible state to design; the user is redirected away immediately after successful registration).

**Dark mode** (primary):
- Page background: #0F1B2D
- Card background: #1A365D with 1px border #2B4A78
- Heading/label text: #F5F0E8
- Muted subheading/body text: #8899AA
- Input background: #0F1B2D, border #2B4A78
- Input focus border: #D4854A (ember)
- Placeholder text: #4A607A
- `@` prefix inside handle input: #8899AA
- Password strength bar track: #2B4A78; filled segments: red #E53E3E → amber #DD6B20 → green #38A169
- Error text: #FC8181
- Error banner: #2D1515 background, #FC8181 border, #FEB2B2 text
- Handle available: #68D391 (green)
- Handle taken: #FC8181 (red)
- CTA button: #D4854A background, white text
- Link color: #D4854A
- Theme/language toggles: #2B4A78 background, #F5F0E8 icon/text

**Light mode:**
- Page background: #F5F0E8
- Card background: #FFFFFF with 1px border #E8E4DF and subtle shadow
- Heading/label text: #1A1A2E
- Muted subheading text: #666666
- Input background: #FFFFFF, border #CCC
- Input focus border: #D4854A
- Placeholder text: #AAAAAA
- `@` prefix inside handle input: #999999
- Password strength bar track: #E8E4DF; filled segments: red #E53E3E → amber #DD6B20 → green #38A169
- Error text: #C53030
- Error banner: #FFF5F5 background, #FC8181 border, #C53030 text
- Handle available: #276749 (dark green)
- Handle taken: #C53030 (dark red)
- CTA button: #D4854A background, white text
- Link color: #D4854A
- Theme/language toggles: #E8E4DF background, #1A1A2E icon/text

**Component framework:** Use shadcn/ui components — `Input`, `Button`, `Label`, `Alert`, `Badge`. Style with Tailwind CSS utility classes. Make it fully responsive — single column on mobile (full-width form), max-width 420px centered on desktop.

Generate both dark and light mode previews side by side.
