import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from '@/theme/tokens';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ColorSchemeOverride = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: AppTheme;
  override: ColorSchemeOverride;
  setOverride: (override: ColorSchemeOverride) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [override, setOverride] = useState<ColorSchemeOverride>('system');

  const effectiveScheme = override === 'system' ? systemScheme : override;
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;

  const handleSetOverride = useCallback((value: ColorSchemeOverride) => {
    setOverride(value);
  }, []);

  const value = useMemo(
    () => ({ theme, override, setOverride: handleSetOverride }),
    [theme, override, handleSetOverride]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
