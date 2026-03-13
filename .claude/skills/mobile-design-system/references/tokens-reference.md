# Library at Dusk — Token Reference

> Full hex mapping tables for updating `mobile/src/theme/tokens.ts`.
> Read this file when writing or reviewing tokens.ts changes.

---

## Light Mode Semantic Tokens

| Token name in `buildTheme()` | Target hex | Web source | Notes |
|---|---|---|---|
| `background` | `#F5F0E8` | parchment | Was `#FFFFFF` |
| `surface` | `#FFFFFF` | card | Was gray-50 |
| `surfaceAlt` | `#EDE9E4` | muted | Was gray-100 |
| `textPrimary` | `#1A1A2E` | ink/foreground | Was gray-900 |
| `textSecondary` | `#666666` | muted-foreground | Was gray-500 |
| `textDisabled` | `#999999` | input-placeholder | Was gray-300 |
| `textInverse` | `#F5F0E8` | parchment (on dark bg) | Was `#FFFFFF` |
| `primary` | `#D4854A` | ember-cta | Was indigo-500 |
| `primaryDark` | `#C07340` | primary-hover | Was indigo-600 |
| `border` | `#E8E4DF` | card-border | Was gray-200 |
| `borderFocus` | `#D4854A` | ember-cta | Was `primary` |
| `inputBg` | `#FFFFFF` | `--input` | **New token** |
| `inputBorder` | `#CCCCCC` | `--input-border` | **New token** |
| `inputPlaceholder` | `#999999` | `--input-placeholder` | **New token** |
| `disabledBg` | `#E0D8D0` | `--btn-disabled` | **New token** |
| `disabledText` | `#999999` | `--btn-disabled-text` | **New token** |
| `error` | `#C0392B` | destructive | Was `#EF4444` |
| `errorBackground` | `#FFF0F0` | destructive-background | Was `#FEE2E2` |
| `success` | `#27AE60` | — | Was `#22C55E` |
| `warning` | `#E67E22` | — | Was `#F59E0B` |
| `tagPillBg` | `#E0E8F2` | `--color-tag-pill-bg` | **New token** |
| `tagPillText` | `#1A365D` | `--color-tag-pill-text` | **New token** |
| `contentBody` | `#333333` | `--color-content-body` | **New token** |

---

## Dark Mode Semantic Tokens

| Token name in `buildTheme()` | Target hex | Web source | Notes |
|---|---|---|---|
| `background` | `#0F1B2D` | deep-navy | Was gray-900 |
| `surface` | `#1A365D` | primary-blue (card) | Was gray-800 |
| `surfaceAlt` | `#14243A` | muted dark | Was gray-700 |
| `textPrimary` | `#F5F0E8` | parchment | Was `#FFFFFF` |
| `textSecondary` | `#8899AA` | muted-foreground dark | Was gray-400 |
| `textDisabled` | `#4A5A6A` | input-placeholder dark | Was gray-600 |
| `textInverse` | `#1A1A2E` | ink (on light bg) | Was gray-900 |
| `primary` | `#D4854A` | ember-cta (same in dark) | Unchanged |
| `primaryDark` | `#C07340` | primary-hover (same) | Unchanged |
| `border` | `#2B4A78` | mid-blue | Was gray-700 |
| `borderFocus` | `#D4854A` | ember-cta | Unchanged |
| `inputBg` | `#0F1B2D` | deep-navy | **New token** |
| `inputBorder` | `#2B4A78` | mid-blue | **New token** |
| `inputPlaceholder` | `#4A5A6A` | `--input-placeholder` dark | **New token** |
| `disabledBg` | `#3A4A5A` | `--btn-disabled` dark | **New token** |
| `disabledText` | `#6A7A8A` | `--btn-disabled-text` dark | **New token** |
| `error` | `#FF8A8A` | destructive dark | Was `#EF4444` |
| `errorBackground` | `#2D1A1A` | destructive-background dark | Was `#FEE2E2` (wrong — was same as light) |
| `success` | `#50C878` | — | Was `#22C55E` |
| `warning` | `#F0A03C` | — | Was `#F59E0B` |
| `tagPillBg` | `rgba(43,74,120,0.35)` | `--color-tag-pill-bg` dark | **New token** |
| `tagPillText` | `#8B9EC2` | `--color-tag-pill-text` dark | **New token** |
| `contentBody` | `#C8D4E0` | `--color-content-body` dark | **New token** |

---

## Brand Accent Constants (Static — Not Theme-Switched)

Add as a `brandAccents` export alongside `palette`:

```
deepNavy:       #0F1B2D
primaryBlue:    #1A365D
midBlue:        #2B4A78
branchBrown:    #8B5E3C
darkLeather:    #6B4226
emberCta:       #D4854A
parchment:      #F5F0E8
ink:            #1A1A2E
```

---

## Ember-CTA Numeric Scale

```
50:   #FFF8F3
100:  #FFE8D6
200:  #FCCFB0
300:  #F4AD7D
400:  #E8955B
500:  #D4854A   ← primary
600:  #C07340   ← primaryDark / hover
700:  #A05C32
800:  #7A4225
900:  #5A2E19
950:  #3A1A0A
```

---

## Typography — Font Family Target

Add `fontFamily` to the `typography` export:

```typescript
fontFamily: {
  body:        'DMSans_400Regular',
  bodyMedium:  'DMSans_500Medium',
  heading:     'Sora_600SemiBold',
}
```

Use `fontFamily: typography.fontFamily.heading` in Text variants `title`, `heading`, `subheading`.
Use `fontFamily: typography.fontFamily.body` / `bodyMedium` for label, body, bodySm, caption.

---

## New Palette Object (Replaces Current `palette`)

The current palette uses indigo/gray Tailwind values. Replace entirely:

```typescript
export const palette = {
  // Brand
  emberCta:     '#D4854A',
  emberCtaDark: '#C07340',

  // Named brand surfaces
  parchment:    '#F5F0E8',
  ink:          '#1A1A2E',
  deepNavy:     '#0F1B2D',
  primaryBlue:  '#1A365D',
  midBlue:      '#2B4A78',
  muted:        '#14243A',

  // Input/muted warm neutrals
  warmMuted:    '#EDE9E4',   // light surfaceAlt
  warmBorder:   '#E8E4DF',  // light card border
  warmInput:    '#CCCCCC',  // light input border
  warmPlaceholder: '#999999',

  // Disabled
  disabledLight: '#E0D8D0',
  disabledDark:  '#3A4A5A',

  // Feedback
  error:        '#C0392B',
  errorDark:    '#FF8A8A',
  errorBg:      '#FFF0F0',
  errorBgDark:  '#2D1A1A',
  success:      '#27AE60',
  successDark:  '#50C878',
  warning:      '#E67E22',
  warningDark:  '#F0A03C',

  // Tag pills
  tagPillBg:    '#E0E8F2',
  tagPillText:  '#1A365D',
} as const;
```
