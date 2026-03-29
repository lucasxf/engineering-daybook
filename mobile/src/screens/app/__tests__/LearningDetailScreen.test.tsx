/**
 * LearningDetailScreen tests — tag creation flow.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// State sequencing (mockStateCallCount satisfies Jest hoisting exception)
// ---------------------------------------------------------------------------

let mockStateCallCount = 0;

// Setters we want to capture for assertions
const mockSetPok = jest.fn();
const mockSetTagActionLoading = jest.fn();

// Per-test state configuration — reset in beforeEach
interface TestState {
  pok: Record<string, unknown> | null;
  loading: boolean;
  allTags: unknown[];
  tagModalVisible: boolean;
  tagActionLoading: boolean;
  tagQuery: string;
}

let mockTestState: TestState = {
  pok: null,
  loading: false,
  allTags: [],
  tagModalVisible: false,
  tagActionLoading: false,
  tagQuery: '',
};

// useState call order in LearningDetailScreen (12 calls):
// 1=pok  2=loading  3=editing  4=error  5=serverError  6=editVisibility
// 7=reLearningModalVisible  8=hasRelearned  9=allTags  10=tagModalVisible
// 11=tagActionLoading  12=tagQuery
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => {
      mockStateCallCount++;
      switch (mockStateCallCount) {
        case 1: return [mockTestState.pok, mockSetPok];
        case 2: return [mockTestState.loading, jest.fn()];
        case 9: return [mockTestState.allTags, jest.fn()];
        case 10: return [mockTestState.tagModalVisible, jest.fn()];
        case 11: return [mockTestState.tagActionLoading, mockSetTagActionLoading];
        case 12: return [mockTestState.tagQuery, jest.fn()];
        default: return [init, jest.fn()];
      }
    },
    useEffect: jest.fn(),
    useCallback: (fn: unknown) => fn,
    useMemo: (fn: () => unknown) => fn(),
  };
});

// ---------------------------------------------------------------------------
// Navigation / route mocks
// ---------------------------------------------------------------------------

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
  useRoute: () => ({ params: { pokId: 'pok-1' } }),
  RouteProp: {},
}));

jest.mock('@react-navigation/native-stack', () => ({}));

// ---------------------------------------------------------------------------
// Context mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: require('../../../theme/tokens').lightTheme,
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) return `${key}:${JSON.stringify(params)}`;
      return key;
    },
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 'user-1', defaultPokVisibility: 'PRIVATE' },
  }),
}));

// ---------------------------------------------------------------------------
// API mocks
// ---------------------------------------------------------------------------

const mockTagCreate = jest.fn();
const mockTagAssign = jest.fn();
const mockTagRemove = jest.fn();
const mockTagList = jest.fn();

jest.mock('@/lib/tagApi', () => ({
  tagApi: {
    list: (...args: unknown[]) => mockTagList(...args),
    create: (...args: unknown[]) => mockTagCreate(...args),
    assign: (...args: unknown[]) => mockTagAssign(...args),
    remove: (...args: unknown[]) => mockTagRemove(...args),
    getSuggestions: jest.fn().mockResolvedValue([]),
    approveSuggestion: jest.fn(),
    rejectSuggestion: jest.fn(),
  },
}));

jest.mock('@/lib/pokApi', () => ({
  pokApi: {
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

// ---------------------------------------------------------------------------
// UI component mocks
// ---------------------------------------------------------------------------

jest.mock('@/components/ui/Text', () => ({
  Text: ({ children, ...props }: Record<string, unknown>) =>
    require('react').createElement('Text', props, children),
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

jest.mock('@/components/feed/LearningForm', () => ({
  LearningForm: (props: Record<string, unknown>) =>
    require('react').createElement('LearningForm', props),
}));

jest.mock('@/components/ui/MarkdownContent', () => ({
  MarkdownContent: (props: Record<string, unknown>) =>
    require('react').createElement('MarkdownContent', props),
}));

jest.mock('@/components/ui/VisibilityPicker', () => ({
  VisibilityPicker: (props: Record<string, unknown>) =>
    require('react').createElement('VisibilityPicker', props),
  VisibilityBadge: (props: Record<string, unknown>) =>
    require('react').createElement('VisibilityBadge', props),
  getDisabledValues: jest.fn(() => []),
}));

jest.mock('@/components/relearnings/ReLearningModal', () => ({
  ReLearningModal: (props: Record<string, unknown>) =>
    require('react').createElement('ReLearningModal', props),
}));

// ---------------------------------------------------------------------------
// Import under test (after all mocks)
// ---------------------------------------------------------------------------

import { Alert } from 'react-native';
import { LearningDetailScreen } from '../LearningDetailScreen';

const mockAlert = Alert.alert as jest.Mock;

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const existingTag = {
  tagId: 'tag-existing',
  id: 'utag-1',
  name: 'existing',
  displayName: 'Existing',
  color: '#ccc',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockPokWithTag = {
  id: 'pok-1',
  userId: 'user-1',
  title: 'Test Learning',
  content: 'Content',
  visibility: 'PRIVATE' as const,
  tags: [existingTag],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const newTag = {
  tagId: 'tag-new',
  id: 'utag-new',
  name: 'new-tag',
  displayName: 'New Tag',
  color: '#aaa',
  createdAt: '2026-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AnyEl = { type: unknown; props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): AnyEl[] {
  const results: AnyEl[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    // Traverse arrays from JSX .map() results
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const el = node as AnyEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) {
      results.push(el);
    }
    const children = el.props?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LearningDetailScreen — tag creation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStateCallCount = 0;
    mockTestState = {
      pok: mockPokWithTag,
      loading: false,
      allTags: [],
      tagModalVisible: false,
      tagActionLoading: false,
      tagQuery: '',
    };
    // Re-wire hooks after clearAllMocks
    const reactMock = require('react') as Record<string, unknown>;
    reactMock.useEffect = jest.fn();
    reactMock.useCallback = (fn: unknown) => fn;
    reactMock.useMemo = (fn: () => unknown) => fn();
  });

  describe('render', () => {
    it('renders remove button for each assigned tag', () => {
      const result = LearningDetailScreen({} as never);
      const touchables = findAllByType(result, 'TouchableOpacity');
      const removeBtn = touchables.find((el) =>
        typeof el.props.accessibilityLabel === 'string' &&
        (el.props.accessibilityLabel as string).includes('removeTagAccessibilityLabel')
      );
      expect(removeBtn).toBeDefined();
    });

    it('renders "Add tag" button', () => {
      const result = LearningDetailScreen({} as never);
      const texts = findAllByType(result, 'Text');
      const addTagText = texts.find((el) =>
        typeof el.props.children === 'string' &&
        (el.props.children as string).includes('learnings.detail.addTag')
      );
      expect(addTagText).toBeDefined();
    });

    it('shows loading spinner when loading=true', () => {
      mockTestState.loading = true;
      mockTestState.pok = null;
      const result = LearningDetailScreen({} as never);
      const spinners = findAllByType(result, 'ActivityIndicator');
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  describe('handleRemoveTag', () => {
    function findRemoveBtn(result: unknown): AnyEl {
      const touchables = findAllByType(result, 'TouchableOpacity');
      // The remove button has accessibilityLabel set to removeTagAccessibilityLabel
      const btn = touchables.find((el) =>
        typeof el.props.accessibilityLabel === 'string' &&
        (el.props.accessibilityLabel as string).includes('removeTagAccessibilityLabel')
      );
      expect(btn).toBeDefined();
      return btn!;
    }

    it('calls tagApi.remove with pokId and tagId', async () => {
      mockTagRemove.mockResolvedValue(undefined);
      const result = LearningDetailScreen({} as never);
      const removeBtn = findRemoveBtn(result);
      await (removeBtn.props.onPress as () => Promise<void>)();
      expect(mockTagRemove).toHaveBeenCalledWith('pok-1', existingTag.tagId);
    });

    it('shows tagRemoveError alert on remove failure', async () => {
      mockTagRemove.mockRejectedValue(new Error('network'));
      const result = LearningDetailScreen({} as never);
      const removeBtn = findRemoveBtn(result);
      await (removeBtn.props.onPress as () => Promise<void>)();
      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagRemoveError');
    });
  });

  describe('handleCreateTag — happy path', () => {
    it('calls tagApi.create then tagApi.assign on success', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockResolvedValue(undefined);
      mockTestState.tagModalVisible = true;
      mockTestState.tagQuery = 'new-tag';
      mockTestState.allTags = [];

      const result = LearningDetailScreen({} as never);
      // Find the "Create" row in the FlatList ListFooterComponent
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists.length).toBe(1);
      const footer = flatLists[0].props.ListFooterComponent as AnyEl | null;
      expect(footer).toBeTruthy();
      await (footer!.props.onPress as () => Promise<void>)();

      expect(mockTagCreate).toHaveBeenCalledWith({ name: 'new-tag' });
      expect(mockTagAssign).toHaveBeenCalledWith('pok-1', newTag.tagId);
    });

    it('calls setPok to add the new tag to the pok after success', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockResolvedValue(undefined);
      mockTestState.tagModalVisible = true;
      mockTestState.tagQuery = 'new-tag';

      const result = LearningDetailScreen({} as never);
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      await (footer.props.onPress as () => Promise<void>)();

      expect(mockSetPok).toHaveBeenCalled();
      const updater = mockSetPok.mock.calls[0][0] as (prev: typeof mockPokWithTag) => typeof mockPokWithTag;
      const updated = updater(mockPokWithTag);
      expect(updated.tags).toContain(newTag);
    });
  });

  describe('handleCreateTag — create fails', () => {
    it('shows tagCreateError alert and does NOT call assign', async () => {
      mockTagCreate.mockRejectedValue(new Error('server error'));
      mockTestState.tagModalVisible = true;
      mockTestState.tagQuery = 'new-tag';

      const result = LearningDetailScreen({} as never);
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      await (footer.props.onPress as () => Promise<void>)();

      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagCreateError');
      expect(mockTagAssign).not.toHaveBeenCalled();
    });
  });

  describe('handleCreateTag — assign fails after create succeeds', () => {
    it('shows tagAddError (not tagCreateError) when only assign fails', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockRejectedValue(new Error('assign error'));
      mockTestState.tagModalVisible = true;
      mockTestState.tagQuery = 'new-tag';

      const result = LearningDetailScreen({} as never);
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      await (footer.props.onPress as () => Promise<void>)();

      expect(mockTagCreate).toHaveBeenCalled();
      expect(mockTagAssign).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagAddError');
      expect(mockAlert).not.toHaveBeenCalledWith('learnings.detail.tagCreateError');
    });

    it('does NOT call setPok when assign fails', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockRejectedValue(new Error('assign error'));
      mockTestState.tagModalVisible = true;
      mockTestState.tagQuery = 'new-tag';

      const result = LearningDetailScreen({} as never);
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      await (footer.props.onPress as () => Promise<void>)();

      expect(mockSetPok).not.toHaveBeenCalled();
    });
  });

  describe('handleAddTag', () => {
    it('calls tagApi.assign and updates pok state on success', async () => {
      const availableTag = {
        tagId: 'tag-another',
        id: 'utag-2',
        name: 'another',
        displayName: 'Another',
        color: '#bbb',
        createdAt: '2026-01-01T00:00:00Z',
      };
      mockTagAssign.mockResolvedValue(undefined);
      mockTestState.tagModalVisible = true;
      mockTestState.allTags = [availableTag];

      const result = LearningDetailScreen({} as never);
      const flatLists = findAllByType(result, 'FlatList');
      const dataItem = flatLists[0].props.data as unknown[];
      expect(dataItem).toHaveLength(1); // availableTag only (existingTag already assigned)

      const renderItem = flatLists[0].props.renderItem as (arg: { item: unknown }) => AnyEl;
      const row = renderItem({ item: availableTag });
      await (row.props.onPress as () => Promise<void>)();

      expect(mockTagAssign).toHaveBeenCalledWith('pok-1', availableTag.tagId);
      expect(mockSetPok).toHaveBeenCalled();
    });
  });
});
