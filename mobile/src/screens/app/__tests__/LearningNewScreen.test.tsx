/**
 * LearningNewScreen tests — form submission, navigation, and inline tag picker.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// State sequencing (mockStateCallCount satisfies Jest hoisting exception)
// ---------------------------------------------------------------------------

let mockStateCallCount = 0;
const mockSetSelectedTags = jest.fn();

interface TestState {
  serverError: string | null;
  visibility: string;
  formKey: number;
  selectedTags: unknown[];
  allTags: unknown[];
  tagModalVisible: boolean;
  tagListLoading: boolean;
  tagActionLoading: boolean;
}

let mockTestState: TestState = {
  serverError: null,
  visibility: 'PRIVATE',
  formKey: 0,
  selectedTags: [],
  allTags: [],
  tagModalVisible: false,
  tagListLoading: false,
  tagActionLoading: false,
};

// useState call order in LearningNewScreen (8 calls):
// 1=serverError  2=visibility  3=formKey
// 4=selectedTags  5=allTags  6=tagModalVisible  7=tagListLoading  8=tagActionLoading
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => {
      mockStateCallCount++;
      switch (mockStateCallCount) {
        case 1: return [mockTestState.serverError, jest.fn()];
        case 2: return [mockTestState.visibility, jest.fn()];
        case 3: return [mockTestState.formKey, jest.fn()];
        case 4: return [mockTestState.selectedTags, mockSetSelectedTags];
        case 5: return [mockTestState.allTags, jest.fn()];
        case 6: return [mockTestState.tagModalVisible, jest.fn()];
        case 7: return [mockTestState.tagListLoading, jest.fn()];
        case 8: return [mockTestState.tagActionLoading, jest.fn()];
        default: return [init, jest.fn()];
      }
    },
    useEffect: jest.fn(),
    useCallback: (fn: unknown) => fn,
    useMemo: (fn: () => unknown) => fn(),
  };
});

// ---------------------------------------------------------------------------
// Navigation mocks
// ---------------------------------------------------------------------------

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, setOptions: jest.fn() }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));
jest.mock('@react-navigation/bottom-tabs', () => ({}));

// ---------------------------------------------------------------------------
// Context mocks
// ---------------------------------------------------------------------------

const mockUser = { userId: 'user-1', defaultPokVisibility: 'PRIVATE' as const, handle: 'alice' };

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
  useAuth: () => ({ user: mockUser }),
}));

// ---------------------------------------------------------------------------
// API mocks
// ---------------------------------------------------------------------------

const mockPokCreate = jest.fn();
const mockTagCreate = jest.fn();
const mockTagList = jest.fn();

jest.mock('@/lib/pokApi', () => ({
  pokApi: { create: (...args: unknown[]) => mockPokCreate(...args) },
}));

jest.mock('@/lib/tagApi', () => ({
  tagApi: {
    list: (...args: unknown[]) => mockTagList(...args),
    create: (...args: unknown[]) => mockTagCreate(...args),
  },
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

// ---------------------------------------------------------------------------
// UI component mocks
// ---------------------------------------------------------------------------

jest.mock('@/components/feed/LearningForm', () => ({
  LearningForm: (props: Record<string, unknown>) =>
    require('react').createElement('LearningForm', props),
}));

jest.mock('@/components/ui/VisibilityPicker', () => ({
  VisibilityPicker: (props: Record<string, unknown>) =>
    require('react').createElement('VisibilityPicker', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: ({ children, ...props }: Record<string, unknown>) =>
    require('react').createElement('Text', props, children),
}));

jest.mock('@/components/tags/TagPickerModal', () => ({
  TagPickerModal: (props: Record<string, unknown>) =>
    require('react').createElement('TagPickerModal', props),
}));

jest.mock('@/navigation/AppStack', () => ({}));
jest.mock('@/navigation/AppTabs', () => ({}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { Alert } from 'react-native';
import { LearningNewScreen } from '../LearningNewScreen';

const mockAlert = Alert.alert as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tagA = {
  tagId: 'tag-a',
  id: 'utag-a',
  name: 'react',
  displayName: 'React',
  color: '#61dafb',
  createdAt: '2026-01-01T00:00:00Z',
  pokCount: 10,
};

const tagB = {
  tagId: 'tag-b',
  id: 'utag-b',
  name: 'typescript',
  displayName: 'TypeScript',
  color: '#3178c6',
  createdAt: '2026-01-01T00:00:00Z',
  pokCount: 8,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AnyEl = { type: unknown; props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): AnyEl[] {
  const results: AnyEl[] = [];
  function walk(node: unknown) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    const el = node as AnyEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = el.props?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}

function findTagPickerModal(result: unknown): AnyEl {
  const modals = findAllByType(result, 'TagPickerModal');
  expect(modals.length).toBe(1);
  return modals[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LearningNewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStateCallCount = 0;
    mockTestState = {
      serverError: null,
      visibility: 'PRIVATE',
      formKey: 0,
      selectedTags: [],
      allTags: [],
      tagModalVisible: false,
      tagListLoading: false,
      tagActionLoading: false,
    };
    const reactMock = require('react') as Record<string, unknown>;
    reactMock.useEffect = jest.fn();
    reactMock.useCallback = (fn: unknown) => fn;
    reactMock.useMemo = (fn: () => unknown) => fn();
  });

  describe('core form render', () => {
    it('renders LearningForm and VisibilityPicker', () => {
      const result = LearningNewScreen({} as never);
      expect(findAllByType(result, 'LearningForm')).toHaveLength(1);
      expect(findAllByType(result, 'VisibilityPicker')).toHaveLength(1);
    });

    it('navigates to Feed on cancel', () => {
      const result = LearningNewScreen({} as never);
      const form = findAllByType(result, 'LearningForm')[0];
      (form.props.onCancel as () => void)();
      expect(mockNavigate).toHaveBeenCalledWith('Feed');
    });

    it('does not navigate when API call fails', async () => {
      mockPokCreate.mockRejectedValue(new Error('network error'));
      const result = LearningNewScreen({} as never);
      const form = findAllByType(result, 'LearningForm')[0];
      await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
        title: '',
        content: 'Content',
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('inline tag picker — present before any save (bug #1 regression)', () => {
    it('renders "+ Add tag" button on mount without requiring a prior save', () => {
      const result = LearningNewScreen({} as never);
      const texts = findAllByType(result, 'Text');
      const addTagText = texts.find((el) => {
        const c = el.props.children;
        if (Array.isArray(c)) return c.some((item) => typeof item === 'string' && item.includes('learnings.detail.addTag'));
        return typeof c === 'string' && c.includes('learnings.detail.addTag');
      });
      expect(addTagText).toBeDefined();
    });

    it('renders TagPickerModal component on mount', () => {
      const result = LearningNewScreen({} as never);
      expect(findAllByType(result, 'TagPickerModal')).toHaveLength(1);
    });

    it('passes listLoading and actionLoading from state to TagPickerModal', () => {
      mockTestState.tagListLoading = true;
      mockTestState.tagActionLoading = true;
      const result = LearningNewScreen({} as never);
      const modal = findTagPickerModal(result);
      expect(modal.props.listLoading).toBe(true);
      expect(modal.props.actionLoading).toBe(true);
    });
  });

  describe('chip renders for selected tags', () => {
    it('renders chip with displayName for each selected tag', () => {
      mockTestState.selectedTags = [tagA, tagB];
      const result = LearningNewScreen({} as never);
      const texts = findAllByType(result, 'Text');
      const labels = texts
        .filter((el) => ['React', 'TypeScript'].includes(el.props.children as string))
        .map((el) => el.props.children as string);
      expect(labels).toContain('React');
      expect(labels).toContain('TypeScript');
    });

    it('renders remove button for each selected tag chip', () => {
      mockTestState.selectedTags = [tagA];
      const result = LearningNewScreen({} as never);
      const touchables = findAllByType(result, 'TouchableOpacity');
      const removeBtn = touchables.find((el) =>
        typeof el.props.accessibilityLabel === 'string' &&
        (el.props.accessibilityLabel as string).includes('removeTagAccessibilityLabel')
      );
      expect(removeBtn).toBeDefined();
    });
  });

  describe('TagPickerModal.onSelect — pick existing tag', () => {
    it('calls setSelectedTags updater that appends the tag', () => {
      const result = LearningNewScreen({} as never);
      const modal = findTagPickerModal(result);
      (modal.props.onSelect as (tag: typeof tagA) => void)(tagA);
      expect(mockSetSelectedTags).toHaveBeenCalled();
      const updater = mockSetSelectedTags.mock.calls[0][0] as (prev: typeof tagA[]) => typeof tagA[];
      expect(updater([])).toContain(tagA);
    });
  });

  describe('TagPickerModal.onCreate — create new tag', () => {
    it('calls tagApi.create and appends result to selectedTags on success', async () => {
      mockTagCreate.mockResolvedValue(tagA);
      const result = LearningNewScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('react');
      expect(mockTagCreate).toHaveBeenCalledWith({ name: 'react' });
      expect(mockSetSelectedTags).toHaveBeenCalled();
      const updater = mockSetSelectedTags.mock.calls[0][0] as (prev: typeof tagA[]) => typeof tagA[];
      expect(updater([])).toContain(tagA);
    });

    it('shows tagCreateError alert on failure and does NOT update selectedTags', async () => {
      mockTagCreate.mockRejectedValue(new Error('server error'));
      const result = LearningNewScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('react');
      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagCreateError');
      expect(mockSetSelectedTags).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — tagIds included in pokApi.create call', () => {
    it('passes selected tag subscription ids to pokApi.create', async () => {
      mockTestState.selectedTags = [tagA, tagB];
      mockPokCreate.mockResolvedValue({ id: 'new-pok-1' });

      const result = LearningNewScreen({} as never);
      const form = findAllByType(result, 'LearningForm')[0];
      await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
        title: 'My Learning',
        content: 'Some content',
      });

      expect(mockPokCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: [tagA.id, tagB.id],
        })
      );
    });

    it('passes empty tagIds array when no tags selected', async () => {
      mockTestState.selectedTags = [];
      mockPokCreate.mockResolvedValue({ id: 'new-pok-2' });

      const result = LearningNewScreen({} as never);
      const form = findAllByType(result, 'LearningForm')[0];
      await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
        title: '',
        content: 'Content',
      });

      expect(mockPokCreate).toHaveBeenCalledWith(
        expect.objectContaining({ tagIds: [] })
      );
    });

    it('navigates to LearningDetail with pokId after successful save', async () => {
      mockPokCreate.mockResolvedValue({ id: 'new-pok-3' });

      const result = LearningNewScreen({} as never);
      const form = findAllByType(result, 'LearningForm')[0];
      await (form.props.onSubmit as (data: { title: string; content: string }) => Promise<void>)({
        title: 'Title',
        content: 'Content',
      });

      expect(mockNavigate).toHaveBeenCalledWith('LearningDetail', { pokId: 'new-pok-3' });
    });
  });
});
