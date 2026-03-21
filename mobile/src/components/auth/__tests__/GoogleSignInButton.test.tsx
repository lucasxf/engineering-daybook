/**
 * GoogleSignInButton component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function — no RTL render needed.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#000',
        background: '#fff',
        border: '#ccc',
        textSecondary: '#666',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    },
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: any) => props,
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: any) => props,
}));

jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: { create: (s: any) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GoogleSignInButton } from '../GoogleSignInButton';

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

function findAllByType(element: any, type: string): any[] {
  const results: any[] = [];
  function walk(el: any) {
    if (!el || typeof el !== 'object') return;
    if (el.type === type || (el.type as any)?.name === type) results.push(el);
    [el.props?.children].flat().forEach(walk);
  }
  walk(element);
  return results;
}

function findAllText(element: any): string[] {
  const texts: string[] = [];
  function walk(el: any) {
    if (!el) return;
    if (typeof el === 'string') { texts.push(el); return; }
    if (Array.isArray(el)) { el.forEach(walk); return; }
    if (typeof el !== 'object') return;
    if (typeof el.props?.children === 'string') texts.push(el.props.children);
    const children = el.props?.children;
    if (Array.isArray(children)) {
      children.forEach(walk);
    } else if (children) {
      walk(children);
    }
  }
  walk(element);
  return texts;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GoogleSignInButton', () => {
  it('renders without errors when not disabled', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    expect(result).not.toBeNull();
    expect(result).toBeTruthy();
  });

  it('returns null when disabled=true (FR9: no client ID)', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), disabled: true });
    expect(result).toBeNull();
  });

  it('renders a Button component', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const buttons = findAllByType(result, 'Button');
    expect(buttons).toHaveLength(1);
  });

  it('Button has variant="secondary"', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.variant).toBe('secondary');
  });

  it('Button label is the i18n key auth.login.googleButton', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.label).toBe('auth.login.googleButton');
  });

  it('Button accessibilityLabel is the i18n key auth.login.googleButton', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.accessibilityLabel).toBe('auth.login.googleButton');
  });

  it('Button loading prop defaults to false when loading not provided', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.loading).toBe(false);
  });

  it('Button loading prop is true when loading=true is passed (FR8)', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), loading: true });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.loading).toBe(true);
  });

  it('Button disabled prop is true when loading=true (prevent double-tap, FR8)', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), loading: true });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.disabled).toBe(true);
  });

  it('Button disabled prop is false when loading=false', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), loading: false });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.disabled).toBe(false);
  });

  it('Button accessibilityState has disabled=true and busy=true when loading (FR8)', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), loading: true });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.accessibilityState).toEqual({ disabled: true, busy: true });
  });

  it('Button accessibilityState has disabled=false and busy=false when not loading', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), loading: false });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.accessibilityState).toEqual({ disabled: false, busy: false });
  });

  it('renders the divider with orContinueWith i18n text', () => {
    const result = GoogleSignInButton({ onPress: jest.fn() });
    const texts = findAllByType(result, 'Text');
    const labels = texts.map((t: any) => t.props.children ?? t.props.label);
    // The divider Text element should contain the i18n key
    expect(labels).toContain('auth.login.orContinueWith');
  });

  it('passes onPress down to Button', () => {
    const onPress = jest.fn();
    const result = GoogleSignInButton({ onPress });
    const buttons = findAllByType(result, 'Button');
    expect(buttons[0].props.onPress).toBe(onPress);
  });

  it('does not render anything when disabled=true (divider also hidden, FR9)', () => {
    const result = GoogleSignInButton({ onPress: jest.fn(), disabled: true });
    // null means nothing rendered at all
    expect(result).toBeNull();
  });
});
