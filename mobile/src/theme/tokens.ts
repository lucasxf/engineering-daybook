/**
 * Design tokens — single source of truth for colors, spacing, typography, radii.
 * Used by ThemeContext to produce a typed theme object for the active color scheme.
 */

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

  // Input / muted warm neutrals
  warmMuted:       '#EDE9E4',  // light surfaceAlt
  warmBorder:      '#E8E4DF',  // light card border
  warmInput:       '#CCCCCC',  // light input border
  warmPlaceholder: '#999999',

  // Disabled
  disabledLight: '#E0D8D0',
  disabledDark:  '#3A4A5A',

  // Feedback
  error:       '#C0392B',
  errorDark:   '#FF8A8A',
  errorBg:     '#FFF0F0',
  errorBgDark: '#2D1A1A',
  success:     '#27AE60',
  successDark: '#50C878',
  warning:     '#E67E22',
  warningDark: '#F0A03C',

  // Tag pills
  tagPillBg:   '#E0E8F2',
  tagPillText: '#1A365D',
} as const;

export const brandAccents = {
  deepNavy:    '#0F1B2D',
  primaryBlue: '#1A365D',
  midBlue:     '#2B4A78',
  branchBrown: '#8B5E3C',
  darkLeather: '#6B4226',
  emberCta:    '#D4854A',
  parchment:   '#F5F0E8',
  ink:         '#1A1A2E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontFamily: {
    body:       'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    heading:    'Sora_600SemiBold',
  },
} as const;

// ---------------------------------------------------------------------------
// Theme objects
// ---------------------------------------------------------------------------

function buildTheme(scheme: 'light' | 'dark') {
  const dark = scheme === 'dark';
  return {
    scheme,
    colors: {
      primary:     '#D4854A',
      primaryDark: '#C07340',

      // Backgrounds
      background: dark ? palette.deepNavy    : palette.parchment,
      surface:    dark ? palette.primaryBlue : '#FFFFFF',
      surfaceAlt: dark ? palette.muted       : palette.warmMuted,

      // Borders
      border:      dark ? palette.midBlue   : palette.warmBorder,
      borderFocus: '#D4854A',

      // Text
      textPrimary:   dark ? palette.parchment       : palette.ink,
      textSecondary: dark ? '#8899AA'               : '#666666',
      textDisabled:  dark ? '#4A5A6A'               : palette.warmPlaceholder,
      textInverse:   dark ? palette.ink             : palette.parchment,

      // Inputs
      inputBg:          dark ? palette.deepNavy   : '#FFFFFF',
      inputBorder:      dark ? palette.midBlue    : palette.warmInput,
      inputPlaceholder: dark ? '#4A5A6A'          : palette.warmPlaceholder,

      // Disabled
      disabledBg:   dark ? palette.disabledDark  : palette.disabledLight,
      disabledText: dark ? '#6A7A8A'             : palette.warmPlaceholder,

      // Feedback
      error:            dark ? palette.errorDark   : palette.error,
      errorBackground:  dark ? palette.errorBgDark : palette.errorBg,
      success:          dark ? palette.successDark : palette.success,
      warning:          dark ? palette.warningDark : palette.warning,

      // Content
      tagPillBg:   dark ? 'rgba(43,74,120,0.35)' : palette.tagPillBg,
      tagPillText: dark ? '#8B9EC2'              : palette.tagPillText,
      contentBody: dark ? '#C8D4E0'              : '#333333',
    },
    spacing,
    radii,
    typography,
  } as const;
}

export type AppTheme = ReturnType<typeof buildTheme>;

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
