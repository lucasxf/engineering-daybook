/**
 * ErrorMessage component tests.
 * Runs in the 'components' jest project (node environment).
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        error: '#C0392B',
        errorBackground: '#FFF0F0',
        textPrimary: '#111',
        textSecondary: '#555',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      radii: { sm: 4, md: 8, lg: 12 },
      typography: {
        sizes: { xs: 11, sm: 13, md: 15 },
        weights: { regular: '400', medium: '500' },
        fontFamily: { body: 'DMSans_400Regular', bodyMedium: 'DMSans_500Medium', heading: 'Sora_600SemiBold' },
      },
    },
  }),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native', () => ({
  View: 'View',
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { ErrorMessage } from '../ErrorMessage';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ErrorMessage', () => {
  it('returns null when message is undefined', () => {
    const result = ErrorMessage({});
    expect(result).toBeNull();
  });

  it('returns null when message is null', () => {
    const result = ErrorMessage({ message: null });
    expect(result).toBeNull();
  });

  it('returns null when message is empty string', () => {
    const result = ErrorMessage({ message: '' });
    expect(result).toBeNull();
  });

  it('renders when message is provided', () => {
    const result = ErrorMessage({ message: 'Something went wrong' });
    expect(result).toBeTruthy();
  });

  it('container uses errorBackground color', () => {
    const result = ErrorMessage({ message: 'Error' }) as React.ReactElement;
    const style = (result.props as { style: Array<Record<string, unknown>> }).style[0];
    expect(style.backgroundColor).toBe('#FFF0F0');
  });
});
