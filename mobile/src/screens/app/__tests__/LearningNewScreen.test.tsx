/**
 * LearningNewScreen tests — form submission and navigation.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
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
  };
});

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: require('../../../theme/tokens').lightTheme,
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mockUser = { defaultPokVisibility: 'PRIVATE' as const, handle: 'alice' };

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, setOptions: jest.fn() }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));
jest.mock('@react-navigation/bottom-tabs', () => ({}));

const mockPokCreate = jest.fn();

jest.mock('@/lib/pokApi', () => ({
  pokApi: { create: (...args: unknown[]) => mockPokCreate(...args) },
}));

jest.mock('@/lib/api', () => {
  class ApiRequestError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
      super(message);
      this.name = 'ApiRequestError';
      this.statusCode = statusCode;
    }
  }
  return { ApiRequestError };
});

jest.mock('@/lib/validations', () => ({}));

jest.mock('@/components/feed/LearningForm', () => ({
  LearningForm: (props: Record<string, unknown>) =>
    require('react').createElement('LearningForm', props),
}));

jest.mock('@/components/ui/VisibilityPicker', () => ({
  VisibilityPicker: (props: Record<string, unknown>) =>
    require('react').createElement('VisibilityPicker', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) =>
    require('react').createElement('Text', props),
}));

jest.mock('@/navigation/AppStack', () => ({}));
jest.mock('@/navigation/AppTabs', () => ({}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { LearningNewScreen } from '../LearningNewScreen';

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
    const children = el.props?.children;
    [children].flat().forEach(walk);
  }
  walk(element);
  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LearningNewScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (require('react') as Record<string, unknown>).useState = (init: unknown) => [init, jest.fn()];
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
  });

  it('renders LearningForm and VisibilityPicker', () => {
    const result = LearningNewScreen();
    expect(findAllByType(result, 'LearningForm')).toHaveLength(1);
    expect(findAllByType(result, 'VisibilityPicker')).toHaveLength(1);
  });

  it('calls pokApi.create with correct args on submit', async () => {
    mockPokCreate.mockResolvedValue({ id: 'pok-1' });
    const result = LearningNewScreen();
    const form = findAllByType(result, 'LearningForm')[0];
    await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
      title: '',
      content: 'I learned something',
    });
    expect(mockPokCreate).toHaveBeenCalledWith({
      title: null,
      content: 'I learned something',
      visibility: 'PRIVATE',
    });
  });

  it('navigates to LearningDetail on successful submit', async () => {
    mockPokCreate.mockResolvedValue({ id: 'pok-1' });
    const result = LearningNewScreen();
    const form = findAllByType(result, 'LearningForm')[0];
    await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
      title: 'My title',
      content: 'Content',
    });
    expect(mockNavigate).toHaveBeenCalledWith('LearningDetail', { pokId: 'pok-1' });
  });

  it('navigates to Feed on cancel', () => {
    const result = LearningNewScreen();
    const form = findAllByType(result, 'LearningForm')[0];
    (form.props.onCancel as () => void)();
    expect(mockNavigate).toHaveBeenCalledWith('Feed');
  });

  it('does not navigate when API call fails', async () => {
    mockPokCreate.mockRejectedValue(new Error('network error'));
    const result = LearningNewScreen();
    const form = findAllByType(result, 'LearningForm')[0];
    await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
      title: '',
      content: 'Content',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
