/**
 * VisibilityPicker and VisibilityBadge component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls components as plain functions — no RTL render needed.
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
        surfaceAlt: '#F0F0F0',
        border: '#CCC',
        textSecondary: '#555',
        warning: '#E67E22',
      },
      spacing: { xs: 4, sm: 8, md: 16 },
      radii: { md: 8, full: 999 },
    },
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native', () => ({
  TouchableOpacity: 'TouchableOpacity',
  View: 'View',
}));

jest.mock('../Text', () => ({
  Text: (props: { children?: React.ReactNode }) => props.children,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { VisibilityBadge, VisibilityPicker, getDisabledValues } from '../VisibilityPicker';
import type { PokVisibility } from '@/lib/pokApi';

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

function walkTree(el: any, visitor: (node: any) => void): void {
  if (!el) return;
  if (Array.isArray(el)) {
    el.forEach((child) => walkTree(child, visitor));
    return;
  }
  if (typeof el !== 'object') return;
  visitor(el);
  const children = el.props?.children;
  if (Array.isArray(children)) {
    children.forEach((child: any) => walkTree(child, visitor));
  } else if (children) {
    walkTree(children, visitor);
  }
}

function findAllByType(element: any, type: string): any[] {
  const results: any[] = [];
  walkTree(element, (el) => {
    if (el.type === type || (el.type as any)?.name === type) results.push(el);
  });
  return results;
}

function findByAccessibilityRole(element: any, role: string): any[] {
  const results: any[] = [];
  walkTree(element, (el) => {
    if (el.props?.accessibilityRole === role) results.push(el);
  });
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
// VisibilityBadge tests
// ---------------------------------------------------------------------------

describe('VisibilityBadge', () => {
  const cases: Array<[PokVisibility, string, string]> = [
    ['PRIVATE',         '🔒', 'learnings.visibility.private'],
    ['FOLLOWERS_ONLY',  '👥', 'learnings.visibility.followersOnly'],
    ['COLLEAGUES_ONLY', '🤝', 'learnings.visibility.colleaguesOnly'],
    ['PUBLIC',          '🌐', 'learnings.visibility.public'],
  ];

  test.each(cases)('renders without errors for %s', (visibility) => {
    const result = VisibilityBadge({ visibility });
    expect(result).toBeTruthy();
  });

  test.each(cases)('shows correct icon for %s', (visibility, expectedIcon) => {
    const result = VisibilityBadge({ visibility });
    const allText = findAllText(result);
    expect(allText).toContain(expectedIcon);
  });

  test.each(cases)('shows correct i18n key for %s', (visibility, _icon, expectedKey) => {
    const result = VisibilityBadge({ visibility });
    const allText = findAllText(result);
    expect(allText).toContain(expectedKey);
  });

  it('has accessibilityRole="text" on outer View', () => {
    const result = VisibilityBadge({ visibility: 'PRIVATE' });
    expect((result as React.ReactElement).props.accessibilityRole).toBe('text');
  });
});

// ---------------------------------------------------------------------------
// VisibilityPicker tests
// ---------------------------------------------------------------------------

describe('VisibilityPicker', () => {
  it('renders without errors with value=PRIVATE and no disabledValues', () => {
    const result = VisibilityPicker({ value: 'PRIVATE', onChange: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('contains all 4 option rows (TouchableOpacity)', () => {
    const result = VisibilityPicker({ value: 'PRIVATE', onChange: jest.fn() });
    const rows = findAllByType(result, 'TouchableOpacity');
    expect(rows).toHaveLength(4);
  });

  it('calls onChange with the correct value when a non-disabled row is pressed', () => {
    const onChange = jest.fn();
    const result = VisibilityPicker({ value: 'PRIVATE', onChange });
    const rows = findAllByType(result, 'TouchableOpacity');
    // Find any non-selected, non-disabled row that has an onPress — Array.find returns the first match
    const publicRow = rows.find((r: any) => r.props.accessibilityState?.selected === false && !r.props.accessibilityState?.disabled && r.props.onPress);
    expect(publicRow).toBeDefined();
    publicRow.props.onPress();
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange with COLLEAGUES_ONLY when that row is pressed', () => {
    const onChange = jest.fn();
    const result = VisibilityPicker({ value: 'PRIVATE', onChange });
    const rows = findAllByType(result, 'TouchableOpacity');
    // Second row is COLLEAGUES_ONLY
    const colleaguesRow = rows[1];
    expect(colleaguesRow.props.onPress).toBeDefined();
    colleaguesRow.props.onPress();
    expect(onChange).toHaveBeenCalledWith('COLLEAGUES_ONLY');
  });

  it('does NOT call onChange when a disabled row has no onPress', () => {
    const onChange = jest.fn();
    const result = VisibilityPicker({
      value: 'PUBLIC',
      onChange,
      disabledValues: ['PRIVATE'],
    });
    const rows = findAllByType(result, 'TouchableOpacity');
    // PRIVATE row is disabled — it has no onPress
    const privateRow = rows.find((r: any) => r.props.accessibilityState?.disabled === true);
    expect(privateRow).toBeDefined();
    expect(privateRow.props.onPress).toBeUndefined();
    // Confirm onChange is never triggered
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selected row has accessibilityState.selected === true', () => {
    const result = VisibilityPicker({ value: 'FOLLOWERS_ONLY', onChange: jest.fn() });
    const rows = findAllByType(result, 'TouchableOpacity');
    const selectedRow = rows.find((r: any) => r.props.accessibilityState?.selected === true);
    expect(selectedRow).toBeDefined();
    // Verify the selected row corresponds to FOLLOWERS_ONLY (3rd in list, index 2)
    expect(rows[2]).toBe(selectedRow);
  });

  it('disabled row has accessibilityState.disabled === true', () => {
    const result = VisibilityPicker({
      value: 'PUBLIC',
      onChange: jest.fn(),
      disabledValues: ['PRIVATE', 'COLLEAGUES_ONLY'],
    });
    const rows = findAllByType(result, 'TouchableOpacity');
    const disabledRows = rows.filter((r: any) => r.props.accessibilityState?.disabled === true);
    expect(disabledRows).toHaveLength(2);
  });

  it('shows public warning when showPublicWarning=true and value=PUBLIC', () => {
    const result = VisibilityPicker({
      value: 'PUBLIC',
      onChange: jest.fn(),
      showPublicWarning: true,
    });
    const allText = findAllText(result);
    expect(allText).toContain('learnings.visibility.publicWarning');
  });

  it('does NOT show public warning when showPublicWarning is false (default)', () => {
    const result = VisibilityPicker({ value: 'PUBLIC', onChange: jest.fn() });
    const allText = findAllText(result);
    expect(allText).not.toContain('learnings.visibility.publicWarning');
  });

  it('does NOT show public warning when showPublicWarning=true but value is not PUBLIC', () => {
    const result = VisibilityPicker({
      value: 'PRIVATE',
      onChange: jest.fn(),
      showPublicWarning: true,
    });
    const allText = findAllText(result);
    expect(allText).not.toContain('learnings.visibility.publicWarning');
  });
});

// ---------------------------------------------------------------------------
// VisibilityPicker compact mode tests
// ---------------------------------------------------------------------------

describe('VisibilityPicker compact', () => {
  it('renders without errors in compact mode', () => {
    const result = VisibilityPicker({ value: 'PRIVATE', onChange: jest.fn(), compact: true });
    expect(result).toBeTruthy();
  });

  it('contains all 4 pill buttons in compact mode', () => {
    const result = VisibilityPicker({ value: 'PRIVATE', onChange: jest.fn(), compact: true });
    const buttons = findByAccessibilityRole(result, 'button');
    expect(buttons).toHaveLength(4);
  });

  it('selected pill has accessibilityState.selected === true', () => {
    const result = VisibilityPicker({ value: 'FOLLOWERS_ONLY', onChange: jest.fn(), compact: true });
    const buttons = findByAccessibilityRole(result, 'button');
    const selected = buttons.filter((b: any) => b.props.accessibilityState?.selected === true);
    expect(selected).toHaveLength(1);
    // FOLLOWERS_ONLY is 3rd in list (index 2)
    expect(buttons[2].props.accessibilityState?.selected).toBe(true);
  });

  it('calls onChange with correct value when a compact pill is pressed', () => {
    const onChange = jest.fn();
    const result = VisibilityPicker({ value: 'PRIVATE', onChange, compact: true });
    const buttons = findByAccessibilityRole(result, 'button');
    // Second button is COLLEAGUES_ONLY
    buttons[1].props.onPress();
    expect(onChange).toHaveBeenCalledWith('COLLEAGUES_ONLY');
  });

  it('shows selected tier description in compact mode', () => {
    const result = VisibilityPicker({ value: 'PUBLIC', onChange: jest.fn(), compact: true });
    const allText = findAllText(result);
    expect(allText).toContain('learnings.visibility.public');
    expect(allText).toContain('learnings.visibility.publicDesc');
  });

  it('shows public warning in compact mode when showPublicWarning=true and value=PUBLIC', () => {
    const result = VisibilityPicker({
      value: 'PUBLIC',
      onChange: jest.fn(),
      compact: true,
      showPublicWarning: true,
    });
    const allText = findAllText(result);
    expect(allText).toContain('learnings.visibility.publicWarning');
  });

  it('does not call onChange for a disabled pill in compact mode', () => {
    const onChange = jest.fn();
    const result = VisibilityPicker({
      value: 'PUBLIC',
      onChange,
      compact: true,
      disabledValues: ['PRIVATE'],
    });
    const buttons = findByAccessibilityRole(result, 'button');
    const disabledPill = buttons.find((b: any) => b.props.accessibilityState?.disabled === true);
    expect(disabledPill).toBeDefined();
    expect(disabledPill.props.onPress).toBeUndefined();
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getDisabledValues tests
// ---------------------------------------------------------------------------

describe('getDisabledValues', () => {
  it('returns [] for PRIVATE', () => {
    expect(getDisabledValues('PRIVATE')).toEqual([]);
  });

  it('returns [PRIVATE] for COLLEAGUES_ONLY', () => {
    expect(getDisabledValues('COLLEAGUES_ONLY')).toEqual(['PRIVATE']);
  });

  it('returns [PRIVATE, COLLEAGUES_ONLY] for FOLLOWERS_ONLY', () => {
    expect(getDisabledValues('FOLLOWERS_ONLY')).toEqual(['PRIVATE', 'COLLEAGUES_ONLY']);
  });

  it('returns [PRIVATE, COLLEAGUES_ONLY, FOLLOWERS_ONLY] for PUBLIC', () => {
    expect(getDisabledValues('PUBLIC')).toEqual(['PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY']);
  });
});
