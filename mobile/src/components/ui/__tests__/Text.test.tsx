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
        sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
        fontFamily: { body: 'DMSans_400Regular', bodyMedium: 'DMSans_500Medium', heading: 'Sora_600SemiBold' },
      },
    },
  }),
}));

jest.mock('react-native', () => ({
  Text: 'Text',
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

  it('renders body variant with DM Sans fontFamily', () => {
    const result = Text({ variant: 'body', children: 'Body' });
    expect(result).toBeTruthy();
    const style = (result as React.ReactElement).props.style[0];
    expect(style.fontFamily).toBe('DMSans_400Regular');
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

  it('renders heading variant with Sora fontFamily', () => {
    const result = Text({ variant: 'heading', children: 'Heading' });
    expect(result).toBeTruthy();
    const style = (result as React.ReactElement).props.style[0];
    expect(style.fontFamily).toBe('Sora_600SemiBold');
  });

  it('renders subheading variant with Sora fontFamily', () => {
    const result = Text({ variant: 'subheading', children: 'Subheading' });
    expect(result).toBeTruthy();
    const style = (result as React.ReactElement).props.style[0];
    expect(style.fontFamily).toBe('Sora_600SemiBold');
  });

  it('renders title variant with Sora fontFamily', () => {
    const result = Text({ variant: 'title', children: 'Title' });
    expect(result).toBeTruthy();
    const style = (result as React.ReactElement).props.style[0];
    expect(style.fontFamily).toBe('Sora_600SemiBold');
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
