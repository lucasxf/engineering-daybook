/**
 * TextInput component tests.
 * Runs in the 'components' jest project (node environment).
 *
 * TextInput uses forwardRef, so we mock React.forwardRef to unwrap it
 * and allow direct function invocation — consistent with the Button/Text pattern.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Unwrap forwardRef so we can call the component as a plain function.
// forwardRef runs at module-init time, so must be a jest.mock (hoisted).
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, forwardRef: (fn: unknown) => fn };
});

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        inputBg: '#FFFFFF',
        inputBorder: '#CCCCCC',
        inputPlaceholder: '#999999',
        textPrimary: '#111111',
        error: '#C0392B',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      radii: { sm: 4, md: 8, lg: 12 },
      typography: {
        sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
        fontFamily: {
          body: 'DMSans_400Regular',
          bodyMedium: 'DMSans_500Medium',
          heading: 'Sora_600SemiBold',
        },
      },
    },
  }),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: ({ children }: { children: unknown }) =>
    require('react').createElement('span', null, children),
}));

jest.mock('react-native', () => ({
  TextInput: 'TextInput',
  View: 'View',
  StyleSheet: { create: (s: object) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { TextInput } from '../TextInput';

// ---------------------------------------------------------------------------
// Helper — extract the style object from the inner RNTextInput element
// ---------------------------------------------------------------------------

function getInputStyle(element: React.ReactElement): Record<string, unknown> {
  if (!element || !React.isValidElement(element)) return {};
  // TextInput renders a View > [label?] > RNTextInput > [error?]
  const viewProps = element.props as { children: React.ReactNode };
  const children = React.Children.toArray(viewProps.children);
  // Find the element with 'placeholderTextColor' prop (the RNTextInput)
  for (const child of children) {
    if (React.isValidElement(child) && (child.props as any).placeholderTextColor !== undefined) {
      const style = (child.props as { style: unknown[] }).style;
      return (Array.isArray(style) ? style[0] : style) as Record<string, unknown>;
    }
  }
  return {};
}

function getPlaceholderColor(element: React.ReactElement): string | undefined {
  if (!element || !React.isValidElement(element)) return undefined;
  const viewProps = element.props as { children: React.ReactNode };
  const children = React.Children.toArray(viewProps.children);
  for (const child of children) {
    if (React.isValidElement(child) && (child.props as any).placeholderTextColor !== undefined) {
      return (child.props as any).placeholderTextColor as string;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TextInput', () => {
  const Comp = TextInput as unknown as (props: Record<string, unknown>, ref: null) => React.ReactElement;

  it('renders without errors', () => {
    const result = Comp({}, null);
    expect(result).toBeTruthy();
  });

  it('renders with label', () => {
    const result = Comp({ label: 'Email' }, null);
    expect(result).toBeTruthy();
  });

  it('renders with error message', () => {
    const result = Comp({ error: 'Required' }, null);
    expect(result).toBeTruthy();
  });

  it('renders with containerStyle', () => {
    const result = Comp({ containerStyle: { marginBottom: 8 } }, null);
    expect(result).toBeTruthy();
  });

  it('uses inputBg for background color', () => {
    const result = Comp({}, null);
    const style = getInputStyle(result);
    expect(style.backgroundColor).toBe('#FFFFFF');
  });

  it('uses inputBorder for border color (no error)', () => {
    const result = Comp({}, null);
    const style = getInputStyle(result);
    expect(style.borderColor).toBe('#CCCCCC');
  });

  it('uses error color for border when error is set', () => {
    const result = Comp({ error: 'Required' }, null);
    const style = getInputStyle(result);
    expect(style.borderColor).toBe('#C0392B');
  });

  it('uses inputPlaceholder for placeholderTextColor', () => {
    const result = Comp({}, null);
    const color = getPlaceholderColor(result);
    expect(color).toBe('#999999');
  });

  it('paddingVertical is 10 (no arithmetic)', () => {
    const result = Comp({}, null);
    const style = getInputStyle(result);
    expect(style.paddingVertical).toBe(10);
  });

  it('sets fontFamily to body', () => {
    const result = Comp({}, null);
    const style = getInputStyle(result);
    expect(style.fontFamily).toBe('DMSans_400Regular');
  });
});
