import { useTheme as useNextTheme } from 'next-themes';

/**
 * Custom hook for theme management.
 * Wraps next-themes useTheme with type safety.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  return {
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    setTheme,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
}
