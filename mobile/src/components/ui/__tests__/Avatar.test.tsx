/**
 * Avatar component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function to execute all branches.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        textInverse: '#F5F0E8',
      },
      typography: {
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

jest.mock('@/theme/tokens', () => ({
  palette: {
    emberCta:  '#D4854A',
    midBlue:   '#2B4A78',
    error:     '#C0392B',
    success:   '#27AE60',
    warning:   '#E67E22',
  },
  brandAccents: {
    primaryBlue: '#1A365D',
    branchBrown: '#8B5E3C',
    darkLeather: '#6B4226',
  },
}));

jest.mock('react-native', () => ({
  Image: 'Image',
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (s: object) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Avatar } from '../Avatar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = { displayName: 'Lucas Xavier', handle: 'lucasxf' };

function getPlaceholderStyle(element: React.ReactElement): Record<string, unknown> {
  if (!element || !React.isValidElement(element)) return {};
  // Avatar returns either <Image> or <View>. The View placeholder has a style array.
  const style = (element.props as { style?: unknown[] }).style;
  if (!Array.isArray(style)) return {};
  // style[1] has width/height/borderRadius/backgroundColor (the dynamic part)
  return (style[1] ?? style[0]) as Record<string, unknown>;
}

function getInitialElement(element: React.ReactElement): React.ReactElement | null {
  if (!element || !React.isValidElement(element)) return null;
  const children = (element.props as { children?: React.ReactNode }).children;
  return React.isValidElement(children) ? children : null;
}

function getInitialStyle(element: React.ReactElement): Record<string, unknown> {
  const initial = getInitialElement(element);
  if (!initial) return {};
  const style = (initial.props as { style?: unknown[] }).style;
  if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
  // style[1] contains the dynamic fontSize; style[0] has color/fontWeight/fontFamily
  return { ...(style[0] as object), ...(style[1] as object) };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Avatar', () => {
  it('renders an image when avatarUrl is provided', () => {
    const result = Avatar({ ...defaultProps, avatarUrl: 'https://example.com/pic.jpg' });
    expect(result).toBeTruthy();
    expect((result as React.ReactElement).type).toBe('Image');
  });

  it('renders an initials placeholder when no avatarUrl', () => {
    const result = Avatar({ ...defaultProps });
    expect(result).toBeTruthy();
    expect((result as React.ReactElement).type).toBe('View');
  });

  it('renders initials placeholder when avatarUrl is null', () => {
    const result = Avatar({ ...defaultProps, avatarUrl: null });
    expect((result as React.ReactElement).type).toBe('View');
  });

  it('uses first character of displayName as initial (uppercase)', () => {
    const result = Avatar({ ...defaultProps, displayName: 'lucas' });
    const initial = getInitialElement(result as React.ReactElement);
    expect((initial?.props as any).children).toBe('L');
  });

  it('falls back to ? when displayName is empty', () => {
    const result = Avatar({ ...defaultProps, displayName: '   ' });
    const initial = getInitialElement(result as React.ReactElement);
    expect((initial?.props as any).children).toBe('?');
  });

  it('default size is 40', () => {
    const result = Avatar({ ...defaultProps });
    const style = getPlaceholderStyle(result as React.ReactElement);
    expect(style.width).toBe(40);
    expect(style.height).toBe(40);
  });

  it('applies custom size', () => {
    const result = Avatar({ ...defaultProps, size: 60 });
    const style = getPlaceholderStyle(result as React.ReactElement);
    expect(style.width).toBe(60);
    expect(style.height).toBe(60);
  });

  it('fontSize scales with size (max(10, round(size * 0.4)))', () => {
    const result = Avatar({ ...defaultProps, size: 60 });
    const style = getInitialStyle(result as React.ReactElement);
    expect(style.fontSize).toBe(24); // round(60 * 0.4)
  });

  it('fontSize is at least 10 for very small sizes', () => {
    const result = Avatar({ ...defaultProps, size: 16 });
    const style = getInitialStyle(result as React.ReactElement);
    expect(style.fontSize).toBe(10); // max(10, round(16 * 0.4) = 6)
  });

  it('initials text color uses colors.textInverse', () => {
    const result = Avatar({ ...defaultProps });
    const style = getInitialStyle(result as React.ReactElement);
    expect(style.color).toBe('#F5F0E8');
  });

  it('initials fontFamily uses typography.fontFamily.bodyMedium', () => {
    const result = Avatar({ ...defaultProps });
    const style = getInitialStyle(result as React.ReactElement);
    expect(style.fontFamily).toBe('DMSans_500Medium');
  });

  it('initials fontWeight uses typography.weights.medium to match DMSans_500Medium', () => {
    const result = Avatar({ ...defaultProps });
    const style = getInitialStyle(result as React.ReactElement);
    expect(style.fontWeight).toBe('500');
  });

  it('colorForHandle is deterministic (same handle → same color)', () => {
    const r1 = Avatar({ ...defaultProps, handle: 'alice' });
    const r2 = Avatar({ ...defaultProps, handle: 'alice' });
    const bg1 = getPlaceholderStyle(r1 as React.ReactElement).backgroundColor;
    const bg2 = getPlaceholderStyle(r2 as React.ReactElement).backgroundColor;
    expect(bg1).toBe(bg2);
  });

  it('different handles can produce different colors', () => {
    const colors = new Set<unknown>();
    ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi'].forEach((h) => {
      const result = Avatar({ displayName: h, handle: h });
      colors.add(getPlaceholderStyle(result as React.ReactElement).backgroundColor);
    });
    // With 8 palette colors and 8 distinct handles, we expect variation
    expect(colors.size).toBeGreaterThan(1);
  });

  it('background color is one of the brand palette values', () => {
    const brandColors = [
      '#D4854A', '#1A365D', '#8B5E3C', '#2B4A78',
      '#C0392B', '#6B4226', '#27AE60', '#E67E22',
    ];
    const result = Avatar({ ...defaultProps });
    const bg = getPlaceholderStyle(result as React.ReactElement).backgroundColor as string;
    expect(brandColors).toContain(bg);
  });
});
