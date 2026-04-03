/**
 * DiscoverScreen tests — search input and render states.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// State sequencing (mockStateCallCount satisfies Jest hoisting exception)
// ---------------------------------------------------------------------------

// useState call order in DiscoverScreen:
// 1=query  2=results
let mockStateCallCount = 0;

interface DiscoverTestState {
  query: string;
  results: unknown[];
}

let mockTestState: DiscoverTestState = { query: '', results: [] };

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => {
      mockStateCallCount++;
      switch (mockStateCallCount) {
        case 1: return [mockTestState.query, jest.fn()];
        case 2: return [mockTestState.results, jest.fn()];
        default: return [init, jest.fn()];
      }
    },
    useEffect: jest.fn(),
    useLayoutEffect: jest.fn(),
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

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { handle: 'alice' } }),
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, setOptions: jest.fn() }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

interface SearchHookReturn {
  results: unknown[];
  loading: boolean;
  error: string | null;
}
let mockSearchReturn: SearchHookReturn = { results: [], loading: false, error: null };

jest.mock('@/hooks/useLearnerSearch', () => ({
  useLearnerSearch: () => mockSearchReturn,
}));

jest.mock('@/lib/learnerApi', () => ({}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) =>
    require('react').createElement('TextInput', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) =>
    require('react').createElement('Text', props),
}));

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: (props: Record<string, unknown>) =>
    require('react').createElement('ErrorMessage', props),
}));

jest.mock('@/components/discover/LearnerResultCard', () => ({
  LearnerResultCard: (props: Record<string, unknown>) =>
    require('react').createElement('LearnerResultCard', props),
}));

jest.mock('@/navigation/AppStack', () => ({}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { DiscoverScreen } from '../DiscoverScreen';

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

describe('DiscoverScreen', () => {
  beforeEach(() => {
    mockStateCallCount = 0;
    mockTestState = { query: '', results: [] };
    mockSearchReturn = { results: [], loading: false, error: null };
    jest.resetAllMocks();
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
    (require('react') as Record<string, unknown>).useLayoutEffect = jest.fn();
  });

  it('renders a search TextInput', () => {
    const result = DiscoverScreen();
    const inputs = findAllByType(result, 'TextInput');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('shows minCharsPrompt when query is empty', () => {
    // Default state: query = '' (length 0 < 2)
    const result = DiscoverScreen();
    const texts = findAllByType(result, 'Text');
    const prompt = texts.find((t) => t.props.children === 'discover.minCharsPrompt');
    expect(prompt).toBeDefined();
  });

  it('shows noResults message when query >= 2 and search returns nothing', () => {
    mockTestState = { query: 'ab', results: [] };
    mockSearchReturn = { results: [], loading: false, error: null };
    const result = DiscoverScreen();
    const texts = findAllByType(result, 'Text');
    const noResults = texts.find((t) => t.props.children === 'discover.noResults');
    expect(noResults).toBeDefined();
  });

  it('renders FlatList with correct data when query >= 2 and results exist', () => {
    // FlatList is a React element in the tree but NOT called in plain-function-call style.
    // We find it via findAllByType and check its data prop directly.
    const fakeResults = [
      { handle: 'bob', displayName: 'Bob', relationship: 'NONE' },
      { handle: 'carol', displayName: 'Carol', relationship: 'NONE' },
    ];
    mockTestState = { query: 'bo', results: fakeResults };
    mockSearchReturn = { results: fakeResults, loading: false, error: null };
    const result = DiscoverScreen();
    const flatLists = findAllByType(result, 'FlatList');
    expect(flatLists).toHaveLength(1);
    expect((flatLists[0].props.data as unknown[]).length).toBe(2);
  });

  it('calls navigate with LearnerProfile when a card onPress is invoked', () => {
    // FlatList is not called in plain-function-call style, so we invoke renderItem
    // directly to get the LearnerResultCard element, then call its onPress.
    const fakeResults = [{ handle: 'bob', displayName: 'Bob', relationship: 'NONE' }];
    mockTestState = { query: 'bo', results: fakeResults };
    mockSearchReturn = { results: fakeResults, loading: false, error: null };
    const result = DiscoverScreen();
    const flatList = findAllByType(result, 'FlatList')[0];
    const itemEl = (flatList.props.renderItem as (info: { item: unknown }) => unknown)({
      item: fakeResults[0],
    });
    const card = findAllByType(itemEl, 'LearnerResultCard')[0];
    (card.props.onPress as (handle: string) => void)('bob');
    expect(mockNavigate).toHaveBeenCalledWith('LearnerProfile', { handle: 'bob' });
  });
});
