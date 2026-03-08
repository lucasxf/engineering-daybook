# Google Play Store Listing — learnimo

## App Metadata

| Field | Value |
|-------|-------|
| **App name** | learnimo |
| **Package** | `net.learnimo.app` |
| **Category** | Productivity |
| **Content rating** | Everyone (PEGI 3) |
| **Price** | Free |
| **Default language** | English (US) |
| **Additional language** | Portuguese (Brazil) |

---

## Short Description (max 80 chars)

**EN:** Capture, organize, and recall what you learn — your knowledge journal.

**PT-BR:** Capture, organize e lembre o que aprendeu — seu diário de conhecimento.

---

## Full Description (max 4000 chars)

### English

learnimo is your personal learning journal. Every day you discover something new — a coding trick, a concept from a book, an insight from a conversation. learnimo makes it effortless to capture and find it again later.

**Capture learnings in seconds**
- Write a quick note or a detailed entry
- Add tags to organize your knowledge
- Set visibility to private (only you) or public (share with others)

**Find anything instantly**
- Hybrid search combines keyword and semantic search — find learnings even when you don't remember the exact words
- Tag-based navigation to browse by topic
- Smart tag suggestions powered by AI

**Write in rich format**
- Full Markdown support: headings, bold, italics, code blocks, lists
- Content always stays exactly as you wrote it — no AI modifications

**Your data, your control**
- All learnings are private by default
- Choose what to make public
- No ads, no tracking, no selling your data

**Works your way**
- Dark and light themes
- English and Portuguese (Brazil) support
- Works across mobile and web (learnimo.net)

---

### Português (Brasil)

learnimo é seu diário de aprendizado pessoal. Todo dia você descobre algo novo — um truque de programação, um conceito de um livro, uma ideia de uma conversa. learnimo torna fácil capturar e encontrar de novo mais tarde.

**Capture aprendizados em segundos**
- Escreva uma nota rápida ou uma entrada detalhada
- Adicione etiquetas para organizar seu conhecimento
- Defina a visibilidade como privada (só você) ou pública (compartilhe com outros)

**Encontre qualquer coisa instantaneamente**
- Busca híbrida combina busca por palavras-chave e semântica — encontre aprendizados mesmo quando não lembra as palavras exatas
- Navegação por etiquetas para explorar por tópico
- Sugestões inteligentes de etiquetas com IA

**Escreva em formato rico**
- Suporte completo a Markdown: títulos, negrito, itálico, blocos de código, listas
- O conteúdo sempre fica exatamente como você escreveu — sem modificações por IA

**Seus dados, seu controle**
- Todos os aprendizados são privados por padrão
- Escolha o que tornar público
- Sem anúncios, sem rastreamento, sem venda de dados

**Funciona do seu jeito**
- Temas escuro e claro
- Suporte a inglês e português (Brasil)
- Funciona no celular e na web (learnimo.net)

---

## Store Graphics Checklist

| Asset | Size | Status |
|-------|------|--------|
| High-res icon | 512×512 px PNG | ⏳ Pending — provide `store-assets/icon-512.png` |
| Feature graphic | 1024×500 px PNG/JPEG | ⏳ Pending — provide `store-assets/feature-graphic.png` |
| Screenshot 1: Login | Min 320px, max 3840px | ⏳ Pending |
| Screenshot 2: Feed with learnings | Min 320px, max 3840px | ⏳ Pending |
| Screenshot 3: Create new learning | Min 320px, max 3840px | ⏳ Pending |
| Screenshot 4: Learning detail (markdown + tags) | Min 320px, max 3840px | ⏳ Pending |

> Screenshots can be taken from a physical Android device or an emulator.
> Use Android Studio's screenshot tool (camera icon in the emulator toolbar) or `adb shell screencap`.

---

## Content Rating Questionnaire (IARC)

Answers for the IARC questionnaire in Google Play Console:

| Question | Answer |
|----------|--------|
| Does the app contain violence? | No |
| Does the app contain sexual content? | No |
| Does the app contain profanity? | No |
| Does the app contain substances (drugs, alcohol, tobacco)? | No |
| Does the app allow users to generate content visible to others? | Yes — learnings can be made public |
| Does the app include social features (messaging, profiles, follow)? | Yes — public profiles, following |
| Is the app a news or journalism app? | No |
| Does the app include ads? | No |

Expected rating: **Everyone / PEGI 3**

---

## Data Safety Section (Google Play Console)

| Data type | Collected | Purpose | Encrypted in transit | Can user request deletion |
|-----------|-----------|---------|----------------------|--------------------------|
| Email address | Yes | Account registration and login | Yes (HTTPS) | Yes |
| User ID (handle) | Yes | Account identification | Yes (HTTPS) | Yes |
| Name (display name) | Yes | Profile display | Yes (HTTPS) | Yes |
| Photos/videos (avatar) | Optional | Profile picture | Yes (HTTPS) | Yes |
| User-generated content (learnings, tags, bio) | Yes | Core app functionality | Yes (HTTPS) | Yes |
| App preferences (theme, language, visibility) | Yes | Personalization | Yes (HTTPS) | Yes |

**Data is not:**
- Shared with third parties (except Supabase hosting, HuggingFace processing)
- Used for advertising or profiling
- Sold to any party

---

## App Access for Google Reviewers

The app requires a login. Provide test credentials when submitting:

- **Email:** `reviewer@learnimo.net` *(create this account before submission)*
- **Password:** *(set a secure temporary password)*

Alternatively, enable the registration screen and note in the reviewer instructions that reviewers can create a free account.

---

## Privacy Policy URL

`https://learnimo.net/en/privacy`

---

## EAS Initialization

Run these in order from `mobile/`:

```bash
npm install eas-cli
npx eas init
```

> `eas init` alone fails — `eas-cli` must be installed locally first via npm before using `npx eas`.

After `eas init` completes, update the `projectId` in:
- `mobile/app.json` → `extra.eas.projectId`
- `mobile/app.config.ts` → `extra.eas.projectId`

---

## App Icons and Splash Screen (in-app assets)

Place these files in `mobile/assets/` before running `eas build`:

| File | Size | Notes |
|------|------|-------|
| `icon.png` | 1024×1024 px | Used for iOS icon and fallback Android icon |
| `adaptive-icon.png` | 1024×1024 px | Android adaptive icon foreground (safe zone: inner 66%) |
| `splash.png` | 1284×2778 px | Splash screen (use `contain` resize mode) |
| `favicon.png` | 48×48 px | Web favicon (optional) |

Brand colors:
- Primary: `#6366F1` (indigo-500)
- Background: `#0f172a` (slate-900)
- Adaptive icon background: `#0f172a` (already set in `app.json`)
