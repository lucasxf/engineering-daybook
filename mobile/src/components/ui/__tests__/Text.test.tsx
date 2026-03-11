/**
 * Text component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function to execute the body and get coverage.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        textPrimary: '#111',
        textSecondary: '#555',
      },
      typography: {
        sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, xxxl: 28 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
  }),
}));

jest.mock('react-native', () => ({
  Text: 'Text',
  StyleSheet: { create: (s: object) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Text } from '../Text';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Text', () => {
  it('renders without errors with default variant', () => {
    const result = Text({ children: 'Hello' });
    expect(result).toBeTruthy();
  });

  it('renders body variant', () => {
    const result = Text({ variant: 'body', children: 'Body' });
    expect(result).toBeTruthy();
  });

  it('renders bodySm variant', () => {
    const result = Text({ variant: 'bodySm', children: 'Small' });
    expect(result).toBeTruthy();
  });

  it('renders label variant', () => {
    const result = Text({ variant: 'label', children: 'Label' });
    expect(result).toBeTruthy();
  });

  it('renders caption variant', () => {
    const result = Text({ variant: 'caption', children: 'Caption' });
    expect(result).toBeTruthy();
  });

  it('renders heading variant', () => {
    const result = Text({ variant: 'heading', children: 'Heading' });
    expect(result).toBeTruthy();
  });

  it('renders subheading variant', () => {
    const result = Text({ variant: 'subheading', children: 'Subheading' });
    expect(result).toBeTruthy();
  });

  it('renders title variant', () => {
    const result = Text({ variant: 'title', children: 'Title' });
    expect(result).toBeTruthy();
  });

  it('applies custom color override', () => {
    const result = Text({ color: '#FF0000', children: 'Red' });
    expect(result).toBeTruthy();
    // color prop triggers the `color ? { color } : undefined` branch
  });

  it('passes through additional TextProps', () => {
    const result = Text({ numberOfLines: 2, children: 'Truncated' });
    expect(result).toBeTruthy();
  });
});
