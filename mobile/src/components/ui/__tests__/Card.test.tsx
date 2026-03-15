/**
 * Card and PressableCard component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function and invokes the Pressable style callback
 * to cover the pressed/unpressed branches.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        border: '#E8E4DF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      radii: { sm: 4, md: 8, lg: 12 },
    },
  }),
}));

jest.mock('react-native', () => ({
  View: 'View',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: object) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Card, PressableCard } from '../Card';

// ---------------------------------------------------------------------------
// Helper — invoke Pressable style callback
// ---------------------------------------------------------------------------

function invokeStyle(
  element: ReturnType<typeof PressableCard>,
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

describe('Card', () => {
  it('renders without errors', () => {
    const result = Card({ children: 'content' });
    expect(result).toBeTruthy();
  });

  it('applies custom style', () => {
    const result = Card({ style: { margin: 8 }, children: 'content' });
    expect(result).toBeTruthy();
  });

  it('uses colors.surface for background', () => {
    const result = Card({ children: 'content' });
    const styleProp = (result as React.ReactElement).props.style as object[];
    const baseStyle = styleProp[0] as Record<string, unknown>;
    expect(baseStyle.backgroundColor).toBe('#FFFFFF');
  });

  it('uses colors.border for border', () => {
    const result = Card({ children: 'content' });
    const styleProp = (result as React.ReactElement).props.style as object[];
    const baseStyle = styleProp[0] as Record<string, unknown>;
    expect(baseStyle.borderColor).toBe('#E8E4DF');
  });

  it('renders children', () => {
    const result = Card({ children: React.createElement('span', null, 'child') });
    expect(result).toBeTruthy();
    const children = (result as React.ReactElement).props.children;
    expect(children).toBeTruthy();
  });
});

describe('PressableCard', () => {
  it('renders without errors', () => {
    const result = PressableCard({ children: 'content' });
    expect(result).toBeTruthy();
  });

  it('style callback returns array when not pressed', () => {
    const result = PressableCard({ children: 'content' });
    const styles = invokeStyle(result);
    expect(Array.isArray(styles)).toBe(true);
  });

  it('opacity is 1 when not pressed', () => {
    const result = PressableCard({ children: 'content' });
    const styles = invokeStyle(result, false) as Record<string, unknown>[];
    const baseStyle = styles[0];
    expect(baseStyle.opacity).toBe(1);
  });

  it('opacity is 0.85 when pressed', () => {
    const result = PressableCard({ children: 'content' });
    const styles = invokeStyle(result, true) as Record<string, unknown>[];
    const baseStyle = styles[0];
    expect(baseStyle.opacity).toBe(0.85);
  });

  it('uses colors.surface for background', () => {
    const result = PressableCard({ children: 'content' });
    const styles = invokeStyle(result) as Record<string, unknown>[];
    expect(styles[0].backgroundColor).toBe('#FFFFFF');
  });

  it('uses colors.border for border', () => {
    const result = PressableCard({ children: 'content' });
    const styles = invokeStyle(result) as Record<string, unknown>[];
    expect(styles[0].borderColor).toBe('#E8E4DF');
  });

  it('applies custom style as second style array entry', () => {
    const result = PressableCard({ style: { margin: 8 }, children: 'content' });
    const styles = invokeStyle(result) as unknown[];
    expect(styles.length).toBe(2);
  });
});
