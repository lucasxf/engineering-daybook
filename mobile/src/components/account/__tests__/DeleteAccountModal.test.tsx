/**
 * DeleteAccountModal component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function with fully mocked hooks and dependencies.
 *
 * State limitation: useState always returns initial values in this test style.
 * Tests for state transitions (mismatch text, API error display) verify handler
 * behaviour rather than rendered state — confirm disabled when handle wrong,
 * onDeleted not called when API throws.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => [init, jest.fn()],
    useEffect: jest.fn(),
    useCallback: (fn: unknown) => fn,
    useRef: (init: unknown) => ({ current: init }),
  };
});

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        error: '#C0392B',
        errorBackground: '#FFF0F0',
        border: '#CCC',
        disabledBg: '#DDD',
        disabledText: '#888',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      radii: { sm: 4, md: 8, lg: 12 },
    },
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mockDeleteAccountApi = jest.fn();
jest.mock('@/lib/userApi', () => ({
  deleteAccountApi: (...args: unknown[]) => mockDeleteAccountApi(...args),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: Record<string, unknown>) => require('react').createElement('Button', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) => require('react').createElement('Text', props),
}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) => require('react').createElement('TextInput', props),
}));

// BackHandler not in react-native.js mock — stub it here
jest.mock('react-native', () => {
  const rn = jest.requireActual('../../../__mocks__/react-native.js');
  return {
    ...rn,
    BackHandler: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { DeleteAccountModal } from '../DeleteAccountModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ReactEl = { type: unknown; props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): ReactEl[] {
  const results: ReactEl[] = [];
  function walk(node: unknown) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    const el = node as ReactEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = (el.props as Record<string, unknown>)?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}

function findButton(result: unknown, label: string): ReactEl | undefined {
  return findAllByType(result, 'Button').find((b) => b.props.label === label);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DeleteAccountModal', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Restore hook stubs cleared by resetAllMocks
    const r = require('react') as Record<string, unknown>;
    r.useState = (init: unknown) => [init, jest.fn()];
    r.useEffect = jest.fn();
    r.useCallback = (fn: unknown) => fn;
    r.useRef = (init: unknown) => ({ current: init });
  });

  it('renders confirm and cancel buttons when visible', () => {
    const result = DeleteAccountModal({
      visible: true,
      userHandle: 'alice',
      onCancel: jest.fn(),
      onDeleted: jest.fn(),
    });
    expect(result).toBeTruthy();
    expect(findButton(result, 'profile.deleteAccount.confirm')).toBeDefined();
    expect(findButton(result, 'profile.deleteAccount.cancel')).toBeDefined();
  });

  it('confirm button is disabled when typedHandle is empty (initial state)', () => {
    // typedHandle initialises to '' which never equals a non-empty handle
    const result = DeleteAccountModal({
      visible: true,
      userHandle: 'alice',
      onCancel: jest.fn(),
      onDeleted: jest.fn(),
    });
    const confirmBtn = findButton(result, 'profile.deleteAccount.confirm');
    expect(confirmBtn?.props.disabled).toBe(true);
  });

  it('confirm button is enabled when typedHandle matches userHandle (both empty)', () => {
    // userHandle='' matches initial typedHandle='' → isConfirmDisabled=false
    const result = DeleteAccountModal({
      visible: true,
      userHandle: '',
      onCancel: jest.fn(),
      onDeleted: jest.fn(),
    });
    const confirmBtn = findButton(result, 'profile.deleteAccount.confirm');
    expect(confirmBtn?.props.disabled).toBe(false);
  });

  it('renders a TextInput with correct accessibilityLabel', () => {
    const result = DeleteAccountModal({
      visible: true,
      userHandle: 'alice',
      onCancel: jest.fn(),
      onDeleted: jest.fn(),
    });
    const inputs = findAllByType(result, 'TextInput');
    const confirmInput = inputs.find(
      (i) => i.props.accessibilityLabel === 'profile.deleteAccount.confirmLabel',
    );
    expect(confirmInput).toBeDefined();
  });

  it('on confirm: calls deleteAccountApi and then onDeleted on success', async () => {
    mockDeleteAccountApi.mockResolvedValue(undefined);
    const onDeleted = jest.fn();
    const result = DeleteAccountModal({
      visible: true,
      userHandle: '',    // matches initial typedHandle so confirm is enabled
      onCancel: jest.fn(),
      onDeleted,
    });
    const confirmBtn = findButton(result, 'profile.deleteAccount.confirm');
    await (confirmBtn?.props.onPress as () => Promise<void>)();
    expect(mockDeleteAccountApi).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it('on API error: calls deleteAccountApi but does NOT call onDeleted', async () => {
    mockDeleteAccountApi.mockRejectedValue(new Error('server error'));
    const onDeleted = jest.fn();
    const result = DeleteAccountModal({
      visible: true,
      userHandle: '',
      onCancel: jest.fn(),
      onDeleted,
    });
    const confirmBtn = findButton(result, 'profile.deleteAccount.confirm');
    await (confirmBtn?.props.onPress as () => Promise<void>)();
    expect(mockDeleteAccountApi).toHaveBeenCalledTimes(1);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('cancel button calls onCancel', () => {
    const onCancel = jest.fn();
    const result = DeleteAccountModal({
      visible: true,
      userHandle: 'alice',
      onCancel,
      onDeleted: jest.fn(),
    });
    const cancelBtn = findButton(result, 'profile.deleteAccount.cancel');
    (cancelBtn?.props.onPress as () => void)();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('passes visible=false to the Modal element when not visible', () => {
    // Plain-function-call returns the React element tree — Modal is not evaluated;
    // verify the prop is forwarded correctly.
    const result = DeleteAccountModal({
      visible: false,
      userHandle: 'alice',
      onCancel: jest.fn(),
      onDeleted: jest.fn(),
    }) as ReactEl | null;
    expect(result).not.toBeNull();
    expect((result as ReactEl).props.visible).toBe(false);
  });
});
