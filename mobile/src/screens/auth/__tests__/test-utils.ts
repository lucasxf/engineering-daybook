/**
 * Shared test utilities for auth screen tests.
 * Import findAllByType and mockTheme into each screen test file to avoid duplication.
 */

export type ReactEl = { type: unknown; props: Record<string, unknown> };

export const mockTheme = {
  colors: {
    background: '#F5F0E8',
    primary: '#D4854A',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    surface: '#FFFFFF',
    surfaceAlt: '#EDE8E0',
    border: '#E8E4DF',
    inputBg: '#FDFCFA',
    inputBorder: '#D1CBC0',
    inputPlaceholder: '#9CA3AF',
    error: '#C0392B',
    errorBackground: '#FFF0F0',
    success: '#27AE60',
    textInverse: '#FFFFFF',
    disabledBg: '#E5E7EB',
    disabledText: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radii: { sm: 4, md: 8, lg: 12, full: 9999 },
  typography: {
    sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
    weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    fontFamily: { body: 'DMSans_400Regular', bodyMedium: 'DMSans_500Medium', heading: 'Sora_600SemiBold' },
  },
};

export function findAllByType(element: unknown, type: string): ReactEl[] {
  const results: ReactEl[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const el = node as ReactEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = (el.props as Record<string, unknown>)?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}
