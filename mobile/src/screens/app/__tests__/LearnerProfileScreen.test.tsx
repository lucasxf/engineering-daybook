/**
 * LearnerProfileScreen tests — render state branches.
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

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { handle: 'alice' } }),
}));

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, setOptions: mockSetOptions }),
  useRoute: () => ({ params: { handle: 'bob' } }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

interface ProfileHookReturn {
  profile: unknown;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

let mockProfileReturn: ProfileHookReturn = {
  profile: null,
  loading: false,
  error: null,
  reload: jest.fn(),
};

jest.mock('@/hooks/useLearnerProfile', () => ({
  useLearnerProfile: () => mockProfileReturn,
}));

jest.mock('@/lib/learnerApi', () => ({}));
jest.mock('@/lib/pokApi', () => ({}));
jest.mock('@/navigation/AppStack', () => ({}));

jest.mock('@/components/ui/Avatar', () => ({
  Avatar: (props: Record<string, unknown>) =>
    require('react').createElement('Avatar', props),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: Record<string, unknown>) =>
    require('react').createElement('Button', props),
}));

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: (props: Record<string, unknown>) =>
    require('react').createElement('ErrorMessage', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) =>
    require('react').createElement('Text', props),
}));

jest.mock('@/components/feed/LearningCard', () => ({
  LearningCard: (props: Record<string, unknown>) =>
    require('react').createElement('LearningCard', props),
}));

jest.mock('@/components/learners/FollowButton', () => ({
  FollowButton: (props: Record<string, unknown>) =>
    require('react').createElement('FollowButton', props),
}));

jest.mock('@/components/relearnings/ReLearningModal', () => ({
  ReLearningModal: (props: Record<string, unknown>) =>
    require('react').createElement('ReLearningModal', props),
}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { LearnerProfileScreen } from '../LearnerProfileScreen';

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

describe('LearnerProfileScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (require('react') as Record<string, unknown>).useState = (init: unknown) => [init, jest.fn()];
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
    mockProfileReturn = { profile: null, loading: false, error: null, reload: jest.fn() };
  });

  it('shows loading spinner when profile is loading', () => {
    mockProfileReturn = { profile: null, loading: true, error: null, reload: jest.fn() };
    const result = LearnerProfileScreen();
    // ActivityIndicator is a React element in the tree (not called in plain-function style).
    // findAllByType finds it via el.type.name === 'ActivityIndicator'.
    const indicators = findAllByType(result, 'ActivityIndicator');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('shows error message and retry button when load fails', () => {
    mockProfileReturn = { profile: null, loading: false, error: 'fetch failed', reload: jest.fn() };
    const result = LearnerProfileScreen();
    const errors = findAllByType(result, 'ErrorMessage');
    expect(errors.length).toBeGreaterThan(0);
    const retryBtn = findAllByType(result, 'Button').find(
      (b) => b.props.label === 'learnerProfile.retry'
    );
    expect(retryBtn).toBeDefined();
  });

  it('shows private profile message when profile is private with no learnings', () => {
    mockProfileReturn = {
      profile: {
        handle: 'bob',
        displayName: 'Bob',
        bio: null,
        avatarUrl: null,
        profileVisibility: 'PRIVATE',
        learnings: null,
        relationshipStatus: 'NONE',
      },
      loading: false,
      error: null,
      reload: jest.fn(),
    };
    const result = LearnerProfileScreen();
    const texts = findAllByType(result, 'Text');
    const privateMsg = texts.find((t) => t.props.children === 'learnerProfile.privateProfile');
    expect(privateMsg).toBeDefined();
  });

  it('renders a FlatList with the learnings data when profile is loaded', () => {
    const learnings = [
      { id: 'l1', content: 'Learning 1', createdAt: '2026-01-01', visibility: 'PUBLIC' },
    ];
    mockProfileReturn = {
      profile: {
        handle: 'bob',
        displayName: 'Bob',
        bio: 'A bio',
        avatarUrl: null,
        profileVisibility: 'PUBLIC',
        learnings,
        relationshipStatus: 'NONE',
      },
      loading: false,
      error: null,
      reload: jest.fn(),
    };
    const result = LearnerProfileScreen();
    // FlatList is a React element in the tree with type=FlatList (mock function).
    // findAllByType finds it via el.type.name === 'FlatList'.
    const flatLists = findAllByType(result, 'FlatList');
    expect(flatLists).toHaveLength(1);
    // The data prop should contain the learnings
    expect((flatLists[0].props.data as unknown[]).length).toBeGreaterThan(0);
  });
});
