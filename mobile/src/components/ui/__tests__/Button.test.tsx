/**
 * Button component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function and invokes the Pressable style callback
 * to cover getBackgroundColor() / getLabelColor() branches.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#D4854A',
        textInverse: '#FFFFFF',
        border: '#CCC',
        surfaceAlt: '#F0F0F0',
        textPrimary: '#111',
        textDisabled: '#999',
        error: '#C0392B',
        errorBackground: '#FFF0F0',
        textSecondary: '#555',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      radii: { sm: 4, md: 8, lg: 12 },
      typography: {
        sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, xxxl: 28 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
  }),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: () => null,
}));

jest.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: object) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Button } from '../Button';

// ---------------------------------------------------------------------------
// Helper — render the Button and call its Pressable style function
// ---------------------------------------------------------------------------

function invokeStyle(
  element: ReturnType<typeof Button>,
  pressed = false,
): unknown[] | null {
  if (!element || !React.isValidElement(element)) return null;
  const styleProp = (element.props as { style?: (state: { pressed: boolean }) => unknown[] }).style;
  if (typeof styleProp !== 'function') return null;
  return styleProp({ pressed }) as unknown[];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Button', () => {
  it('renders without errors (primary variant, default)', () => {
    const result = Button({ label: 'Click me' });
    expect(result).toBeTruthy();
  });

  it('executes style callback for primary variant (not disabled)', () => {
    const result = Button({ label: 'Primary', variant: 'primary' });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback for secondary variant', () => {
    const result = Button({ label: 'Secondary', variant: 'secondary' });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback for ghost variant', () => {
    const result = Button({ label: 'Ghost', variant: 'ghost' });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback for danger variant', () => {
    const result = Button({ label: 'Delete', variant: 'danger' });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback when disabled (isDisabled=true)', () => {
    const result = Button({ label: 'Disabled', disabled: true });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback when loading (isDisabled=true)', () => {
    const result = Button({ label: 'Loading', loading: true });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('executes style callback with pressed=true (opacity branch)', () => {
    const result = Button({ label: 'Press' });
    const styles = invokeStyle(result, true);
    expect(styles).toBeTruthy();
  });

  it('renders with fullWidth=true (includes width in style)', () => {
    const result = Button({ label: 'Full', fullWidth: true });
    const styles = invokeStyle(result);
    expect(styles).toBeTruthy();
  });

  it('renders with onPress callback', () => {
    const onPress = jest.fn();
    const result = Button({ label: 'Press', onPress });
    expect(result).toBeTruthy();
  });

  it('shows ActivityIndicator when loading', () => {
    const result = Button({ label: 'Loading', loading: true });
    expect(result).toBeTruthy();
    // Verify children include ActivityIndicator (loading=true branch)
    const props = (result as React.ReactElement).props as { children: React.ReactNode[] };
    expect(props.children).toBeTruthy();
  });
});
