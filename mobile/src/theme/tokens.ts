/**
 * Design tokens — single source of truth for colors, spacing, typography, radii.
 * Used by ThemeContext to produce a typed theme object for the active color scheme.
 */

export const palette = {
  // Brand
  primary: '#6366F1',       // indigo-500
  primaryDark: '#4F46E5',   // indigo-600

  // Neutral
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Feedback
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#22C55E',
  warning: '#F59E0B',
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
} as const;

// ---------------------------------------------------------------------------
// Theme objects
// ---------------------------------------------------------------------------

function buildTheme(scheme: 'light' | 'dark') {
  const dark = scheme === 'dark';
  return {
    scheme,
    colors: {
      primary: palette.primary,
      primaryDark: palette.primaryDark,

      // Backgrounds
      background: dark ? palette.gray900 : palette.white,
      surface: dark ? palette.gray800 : palette.gray50,
      surfaceAlt: dark ? palette.gray700 : palette.gray100,

      // Borders
      border: dark ? palette.gray700 : palette.gray200,
      borderFocus: palette.primary,

      // Text
      textPrimary: dark ? palette.white : palette.gray900,
      textSecondary: dark ? palette.gray400 : palette.gray500,
      textDisabled: dark ? palette.gray600 : palette.gray300,
      textInverse: dark ? palette.gray900 : palette.white,

      // Feedback
      error: palette.error,
      errorBackground: palette.errorLight,
      success: palette.success,
      warning: palette.warning,
    },
    spacing,
    radii,
    typography,
  } as const;
}

export type AppTheme = ReturnType<typeof buildTheme>;

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
