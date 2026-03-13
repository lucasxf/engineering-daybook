---
name: mobile-design-system
description: Learnimo's "Library at Dusk" design system for mobile (Expo/React Native). Provides exact color tokens, component recipes, typography, layout patterns, and screen templates for achieving visual parity between web and mobile. Use this skill whenever working on mobile screens, mobile UI components, mobile styling, tokens.ts updates, mobile visual parity, mobile theme changes, React Native component design, or any mobile task involving @pixl or @hedy agents. Also use when creating new mobile screens, updating existing mobile components, reviewing mobile UI for design consistency, or implementing mobile feature specs.
---

# Mobile Design System — Library at Dusk

## Design Language

"Library at Dusk" is Learnimo's visual brand: warm parchment backgrounds (#F5F0E8), ember-orange CTAs (#D4854A), and deep navy for dark mode (#0F1B2D). The palette evokes a study room at dusk — paper, ink, candlelight. It replaces the previous indigo/gray Tailwind defaults across all surfaces.

The web source of truth is `web/src/app/globals.css` and `web/tailwind.config.ts`. For exact hex values and the full mapping table, read `references/tokens-reference.md`.

---

## Token Architecture

All mobile styling flows through `mobile/src/theme/tokens.ts` → `ThemeContext` → `useTheme()`.

```typescript
const { theme } = useTheme();
// theme.colors.*, theme.spacing.*, theme.radii.*, theme.typography.*
```

**Rules:**
- Preserve the `buildTheme(scheme: 'light' | 'dark')` function and `AppTheme` type — 2,800 lines of code depend on them
- Extend `colors` in `buildTheme()` by adding new keys; do not rename or remove existing ones
- Add `typography.fontFamily` with DM Sans and Sora variants
- Replace `palette` entirely with Library at Dusk values (see `references/tokens-reference.md`)
- All component styling stays as inline objects — do not switch to `StyleSheet.create`

**New color keys to add to `buildTheme()`:**
`inputBg`, `inputBorder`, `inputPlaceholder`, `disabledBg`, `disabledText`, `tagPillBg`, `tagPillText`, `contentBody`

---

## Component Recipes

### Button

4 variants + disabled state. Press feedback: `opacity: 0.8` on Pressable `pressed`.

| Variant | Background | Text color | Border |
|---------|------------|------------|--------|
| `primary` | `colors.primary` (#D4854A) | `colors.textInverse` | none |
| `secondary` | `colors.surfaceAlt` | `colors.textPrimary` | 1px `colors.border` |
| `ghost` | transparent | `colors.primary` | none |
| `danger` | `colors.error` | `colors.textInverse` | none |
| disabled (any) | `colors.disabledBg` | `colors.disabledText` | none |

Padding: vertical 10px, horizontal 16px (`spacing.md`). Border radius: `radii.md` (8px). No shadow.

### Card

1px border, no shadow. Light: `surface` (#FFFFFF) bg, `#E8E4DF` border. Dark: `#1A365D` bg, `#2B4A78` border.
Border radius: `radii.lg` (12px). Padding: `spacing.md` (16px).
`PressableCard` adds `opacity: 0.85` on press.

### Text

7 variants. Headings use Sora (`typography.fontFamily.heading`); body text uses DM Sans.

| Variant | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| `title` | 30px (xxxl) | bold | Sora | textPrimary |
| `heading` | 20px (xl) | semibold | Sora | textPrimary |
| `subheading` | 17px (lg) | medium | Sora | textPrimary |
| `label` | 15px (md) | medium | DM Sans | textPrimary |
| `body` | 15px (md) | regular | DM Sans | textPrimary |
| `bodySm` | 13px (sm) | regular | DM Sans | textSecondary |
| `caption` | 11px (xs) | regular | DM Sans | textSecondary |

The `color` prop overrides the variant default when provided.

### TextInput

1px border, `radii.md`, padding h=`spacing.md`, v=10px. Color: `colors.textPrimary`.
- Normal: `colors.inputBg` bg, `colors.inputBorder` border
- Focus: `colors.primary` (#D4854A) border
- Error: `colors.error` border
- Placeholder: `colors.inputPlaceholder`
- Error text below: `caption` variant in `colors.error`

Note: Do NOT use `colors.surface` as input bg in dark mode — it would be #1A365D (card blue), not the correct #0F1B2D. Use the new `colors.inputBg` token.

### ErrorMessage

Background: `colors.errorBackground`. Border radius: `radii.md`. Padding: `spacing.sm`.
Text: `bodySm` variant in `colors.error`. Renders nothing when message is null/empty.

### MarkdownContent

Built with `react-native-markdown-display`. Styles derived from `useTheme()`:
- Headings: match Text variant sizes (h1=xxxl, h2=xxl, h3=xl)
- Inline code: `colors.surfaceAlt` bg, `radii.sm`
- Code blocks: `colors.surfaceAlt` bg, `radii.md`, `spacing.sm` padding
- Blockquotes: 3px left border (`colors.border`), `colors.surface` bg
- Links: `colors.primary`
- Body text: `colors.contentBody` (not `textPrimary` — see gotchas)

### Avatar

Circular (`borderRadius: size / 2`). Shows `avatarUrl` image or initials placeholder.
Initials bg: deterministic from handle hash — update hardcoded `INITIALS_COLORS` array to Library at Dusk brand accents:
`['#D4854A', '#1A365D', '#2B4A78', '#8B5E3C', '#6B4226', '#C07340', '#0F1B2D', '#A05C32']`

---

## Screen Layout Patterns

### Screen root (all screens)
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
  {/* content */}
</SafeAreaView>
```
Always import `SafeAreaView` from `react-native-safe-area-context`.

### List screens (FlatList)
```tsx
<FlatList
  contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm, flexGrow: 1 }}
  onRefresh={refresh}
  refreshing={refreshing}
  onEndReached={loadMore}
  onEndReachedThreshold={0.3}
/>
```
Loading: centered `<ActivityIndicator size="large" color={theme.colors.primary} />`.
Empty: centered View with `bodySm` + `caption` text + secondary Button.

### Form screens
```tsx
<ScrollView
  contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
  keyboardShouldPersistTaps="handled"
/>
```
Auth screens (login, register) also wrap in `KeyboardAvoidingView`:
```tsx
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} flex={1} />
```

### Bottom tab bar
```tsx
tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }
tabBarActiveTintColor: theme.colors.primary
tabBarInactiveTintColor: theme.colors.textSecondary
```

### Spacing conventions
- Container padding: `spacing.md` (16px) or `spacing.lg` (24px) for auth screens
- Sibling gap: use the `gap` prop, not margins
- Action button rows: `flexDirection: 'row', gap: spacing.sm`, each button `flex: 1`

### Tag / chip pattern
```tsx
{ backgroundColor: colors.tagPillBg, borderRadius: radii.full,
  paddingHorizontal: spacing.sm, paddingVertical: 2 }
// Text: caption variant in colors.tagPillText
```

### Modal / bottom sheet
Semi-transparent backdrop (`rgba(0,0,0,0.4)`), `borderTopLeftRadius: radii.lg`, max height 400.
Use `Modal transparent animationType="slide"`.

---

## Font Loading

Load via `expo-font` in `App.tsx` before rendering. Keep `SplashScreen` visible until fonts are ready.

```typescript
// Fonts to load:
'DMSans_400Regular'  // DM Sans Regular — body text
'DMSans_500Medium'   // DM Sans Medium — labels, buttons
'Sora_600SemiBold'   // Sora SemiBold — all headings
```

Do NOT load Bricolage Grotesque — it's the wordmark font (web only). Use a static image for the wordmark on mobile.

Add to `typography` in `tokens.ts`:
```typescript
fontFamily: {
  body:       'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  heading:    'Sora_600SemiBold',
}
```

---

## Shadows

Current mobile convention: 1px borders instead of shadows (no `shadow*` props anywhere). This is intentional — cross-platform shadows are noisy. Maintain this convention unless a specific design calls for elevation.

If elevation is ever needed, use these RN-equivalent recipes:
| Web shadow | iOS | Android |
|---|---|---|
| `shadow-sm` | `shadowOffset:{w:0,h:1}` `shadowOpacity:0.05` `shadowRadius:2` | `elevation:1` |
| `shadow-md` | `shadowOffset:{w:0,h:4}` `shadowOpacity:0.10` `shadowRadius:6` | `elevation:3` |
| `shadow-lg` | `shadowOffset:{w:0,h:10}` `shadowOpacity:0.15` `shadowRadius:15` | `elevation:5` |

Always set `shadowColor: '#000'`.

---

## Animations

Web uses CSS keyframes; RN equivalents via `Animated` API:

**fadeIn** (150ms, easeOut):
```typescript
Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true })
```

**slideUp** (200ms, easeOut):
```typescript
Animated.parallel([
  Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
  Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
])
// Start translateY from 8 (matches Tailwind's 0.5rem = 8px)
```

---

## Known Gotchas

1. **`errorBackground` not theme-switched in current code** — it maps to `palette.errorLight` for both modes. Dark mode target is `#2D1A1A`. Fix: make it conditional in `buildTheme()`.

2. **`textInverse` hex values change** — current: white (light) / gray-900 (dark). Target: parchment #F5F0E8 (light) / ink #1A1A2E (dark). These are close but not identical — update explicitly.

3. **Avatar hardcodes initials colors** — `INITIALS_COLORS` array in `Avatar.tsx` uses random web colors. Update to Library at Dusk brand accents (see Avatar recipe above).

4. **TextInput background** — current code uses `colors.surface` as input bg. In dark mode, `surface` = #1A365D (card blue), but target input bg = #0F1B2D (background). Always use the new `colors.inputBg` token in TextInput, not `surface`.

5. **`contentBody` vs `textPrimary`** — MarkdownContent body text should use `colors.contentBody` (#333333 / #C8D4E0), which is softer than `textPrimary` (#1A1A2E / #F5F0E8). The distinction exists on web and should be preserved on mobile.

---

## Reference

For full hex tables, the complete palette replacement, and the ember-CTA scale, read:
`references/tokens-reference.md`
