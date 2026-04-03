/**
 * FeedScreen smoke tests — tab header renders without throwing.
 * Runs in the 'screens' jest project (node environment).
 *
 * FeedScreen is the most complex screen (418 lines, 3 inline sub-components).
 * SocialContent and MyLearningsContent are passed as React elements, not called,
 * so their hooks (useSocialFeedData, useFeedData, useFocusEffect) are never invoked
 * when FeedScreen() is called as a plain function. This allows a clean smoke test.
 *
 * Deeper flow tests for SocialContent and MyLearningsContent are a future improvement.
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
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({}));
jest.mock('@react-navigation/bottom-tabs', () => ({}));

// SocialContent and MyLearningsContent are inline sub-components that call these hooks.
// They won't be invoked when calling FeedScreen() as a plain function, but Jest still
// resolves the imports at module load time, so we mock them to prevent resolution errors.
jest.mock('@/hooks/useSocialFeedData', () => ({
  useSocialFeedData: () => ({
    items: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    refresh: jest.fn(),
    loadMore: jest.fn(),
  }),
}));

jest.mock('@/hooks/useFeedData', () => ({
  useFeedData: () => ({
    poks: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    refresh: jest.fn(),
    loadMore: jest.fn(),
    setParams: jest.fn(),
  }),
}));

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}));

jest.mock('@/lib/learnerApi', () => ({
  unshareLearning: jest.fn(),
}));

jest.mock('@/lib/pokApi', () => ({}));
jest.mock('@/navigation/AppStack', () => ({}));
jest.mock('@/navigation/AppTabs', () => ({}));

jest.mock('@/components/feed/LearningCard', () => ({
  LearningCard: (props: Record<string, unknown>) =>
    require('react').createElement('LearningCard', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) =>
    require('react').createElement('Text', props),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: Record<string, unknown>) =>
    require('react').createElement('Button', props),
}));

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: (props: Record<string, unknown>) =>
    require('react').createElement('ErrorMessage', props),
}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) =>
    require('react').createElement('TextInput', props),
}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { FeedScreen } from '../FeedScreen';

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

describe('FeedScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (require('react') as Record<string, unknown>).useState = (init: unknown) => [init, jest.fn()];
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
    (require('react') as Record<string, unknown>).useCallback = (fn: unknown) => fn;
    (require('react') as Record<string, unknown>).useRef = (init: unknown) => ({ current: init });
  });

  it('renders without throwing', () => {
    expect(() => FeedScreen()).not.toThrow();
  });

  it('renders two tab buttons (Social and My Learnings)', () => {
    const result = FeedScreen();
    const tabButtons = findAllByType(result, 'TouchableOpacity').filter(
      (el) => el.props['aria-label'] === undefined && (el.props as { accessibilityRole?: string }).accessibilityRole === 'tab'
    );
    // Two tab pills: social and mine
    expect(tabButtons).toHaveLength(2);
  });

  it('renders the social tab content area by default (activeTab = social)', () => {
    // With useState returning init, activeTab = 'social'. SocialContent is a React element
    // in the tree but its function body is NOT called (plain-function call style).
    // findAllByType finds it via el.type.name === 'SocialContent'.
    const result = FeedScreen();
    const socialContent = findAllByType(result, 'SocialContent');
    expect(socialContent).toHaveLength(1);
  });
});
