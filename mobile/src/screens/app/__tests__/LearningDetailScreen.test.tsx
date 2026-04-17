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
  tagListLoading: boolean;
  tagsExpanded: boolean;
}

let mockTestState: TestState = {
  pok: null,
  loading: false,
  allTags: [],
  tagModalVisible: false,
  tagActionLoading: false,
  tagListLoading: false,
  tagsExpanded: false,
};

// useState call order in LearningDetailScreen (13 calls):
// 1=pok  2=loading  3=editing  4=error  5=serverError  6=editVisibility
// 7=reLearningModalVisible  8=hasRelearned  9=allTags  10=tagModalVisible
// 11=tagActionLoading  12=tagListLoading  13=tagsExpanded
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
        case 12: return [mockTestState.tagListLoading, jest.fn()];
        case 13: return [mockTestState.tagsExpanded, jest.fn()];
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
const mockPokLoadById = jest.fn();

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
    getById: (...args: unknown[]) => mockPokLoadById(...args),
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

jest.mock('@/components/tags/TagPickerModal', () => ({
  TagPickerModal: (props: Record<string, unknown>) =>
    require('react').createElement('TagPickerModal', props),
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
  pokCount: 5,
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
  pokCount: 1,
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

/** Find the TagPickerModal element in the render tree. */
function findTagPickerModal(result: unknown): AnyEl {
  const modals = findAllByType(result, 'TagPickerModal');
  expect(modals.length).toBe(1);
  return modals[0];
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
      tagListLoading: false,
      tagsExpanded: false,
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
      const addTagText = texts.find((el) => {
        const c = el.props.children;
        if (Array.isArray(c)) return c.some((item) => typeof item === 'string' && item.includes('learnings.detail.addTag'));
        return typeof c === 'string' && c.includes('learnings.detail.addTag');
      });
      expect(addTagText).toBeDefined();
    });

    it('shows loading spinner when loading=true', () => {
      mockTestState.loading = true;
      mockTestState.pok = null;
      const result = LearningDetailScreen({} as never);
      const spinners = findAllByType(result, 'ActivityIndicator');
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('renders TagPickerModal with selectedTagIds from pok.tags', () => {
      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      expect(modal.props.selectedTagIds).toEqual([existingTag.tagId]);
    });

    it('passes listLoading and actionLoading to TagPickerModal', () => {
      mockTestState.tagListLoading = true;
      mockTestState.tagActionLoading = true;
      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      expect(modal.props.listLoading).toBe(true);
      expect(modal.props.actionLoading).toBe(true);
    });
  });

  describe('handleRemoveTag', () => {
    function findRemoveBtn(result: unknown): AnyEl {
      const touchables = findAllByType(result, 'TouchableOpacity');
      const btn = touchables.find((el) =>
        typeof el.props.accessibilityLabel === 'string' &&
        (el.props.accessibilityLabel as string).includes('removeTagAccessibilityLabel')
      );
      expect(btn).toBeDefined();
      return btn!;
    }

    it('calls tagApi.remove with pokId and subscription id (tag.id, not tag.tagId)', async () => {
      mockTagRemove.mockResolvedValue(undefined);
      const result = LearningDetailScreen({} as never);
      const removeBtn = findRemoveBtn(result);
      await (removeBtn.props.onPress as () => Promise<void>)();
      // Subscription id is existingTag.id ('utag-1'), NOT existingTag.tagId ('tag-existing')
      expect(mockTagRemove).toHaveBeenCalledWith('pok-1', existingTag.id);
      expect(mockTagRemove).not.toHaveBeenCalledWith('pok-1', existingTag.tagId);
    });

    it('shows tagRemoveError alert on remove failure', async () => {
      mockTagRemove.mockRejectedValue(new Error('network'));
      const result = LearningDetailScreen({} as never);
      const removeBtn = findRemoveBtn(result);
      await (removeBtn.props.onPress as () => Promise<void>)();
      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagRemoveError');
    });
  });

  describe('handleCreateTag — via TagPickerModal.onCreate prop', () => {
    it('calls tagApi.create then tagApi.assign with subscription id (newTag.id)', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockResolvedValue(undefined);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      const onCreate = modal.props.onCreate as (name: string) => Promise<void>;

      await onCreate('new-tag');

      expect(mockTagCreate).toHaveBeenCalledWith({ name: 'new-tag' });
      // Must use newTag.id (subscription), not newTag.tagId (global)
      expect(mockTagAssign).toHaveBeenCalledWith('pok-1', newTag.id);
      expect(mockTagAssign).not.toHaveBeenCalledWith('pok-1', newTag.tagId);
    });

    it('calls setPok to add the new tag on success', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockResolvedValue(undefined);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('new-tag');

      expect(mockSetPok).toHaveBeenCalled();
      const updater = mockSetPok.mock.calls[0][0] as (prev: typeof mockPokWithTag) => typeof mockPokWithTag;
      const updated = updater(mockPokWithTag);
      expect(updated.tags).toContain(newTag);
    });

    it('shows tagCreateError alert and does NOT call assign when create fails', async () => {
      mockTagCreate.mockRejectedValue(new Error('server error'));

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('new-tag');

      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagCreateError');
      expect(mockTagAssign).not.toHaveBeenCalled();
    });

    it('shows tagAddError (not tagCreateError) and calls loadPok when only assign fails', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockRejectedValue(new Error('assign error'));
      mockPokLoadById.mockResolvedValue(mockPokWithTag);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('new-tag');

      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagAddError');
      expect(mockAlert).not.toHaveBeenCalledWith('learnings.detail.tagCreateError');
      // Reconcile: loadPok must be called to re-fetch true server state
      expect(mockPokLoadById).toHaveBeenCalledWith('pok-1');
    });

    it('does NOT call setPok with updater function (no tag appended) when assign fails', async () => {
      mockTagCreate.mockResolvedValue(newTag);
      mockTagAssign.mockRejectedValue(new Error('assign error'));
      mockPokLoadById.mockResolvedValue(mockPokWithTag);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onCreate as (name: string) => Promise<void>)('new-tag');

      // loadPok reconcile may call setPok(value) directly — that is expected.
      // What must NOT happen: setPok called with a function updater (the one that appends newTag).
      expect(mockSetPok).not.toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('handleAddTag — via TagPickerModal.onSelect prop', () => {
    const availableTag = {
      tagId: 'tag-another',
      id: 'utag-2',
      name: 'another',
      displayName: 'Another',
      color: '#bbb',
      createdAt: '2026-01-01T00:00:00Z',
      pokCount: 2,
    };

    it('calls tagApi.assign with subscription id (tag.id, not tag.tagId)', async () => {
      mockTagAssign.mockResolvedValue(undefined);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      const onSelect = modal.props.onSelect as (tag: typeof availableTag) => Promise<void>;

      await onSelect(availableTag);

      expect(mockTagAssign).toHaveBeenCalledWith('pok-1', availableTag.id);
      expect(mockTagAssign).not.toHaveBeenCalledWith('pok-1', availableTag.tagId);
    });

    it('calls setPok to append tag on success', async () => {
      mockTagAssign.mockResolvedValue(undefined);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onSelect as (tag: typeof availableTag) => Promise<void>)(availableTag);

      expect(mockSetPok).toHaveBeenCalled();
    });

    it('shows tagAddError and calls loadPok on assign failure', async () => {
      mockTagAssign.mockRejectedValue(new Error('network'));
      mockPokLoadById.mockResolvedValue(mockPokWithTag);

      const result = LearningDetailScreen({} as never);
      const modal = findTagPickerModal(result);
      await (modal.props.onSelect as (tag: typeof availableTag) => Promise<void>)(availableTag);

      expect(mockAlert).toHaveBeenCalledWith('learnings.detail.tagAddError');
      expect(mockPokLoadById).toHaveBeenCalledWith('pok-1');
    });
  });

  describe('tag sort and collapse', () => {
    const makeTag = (tagId: string, displayName: string, pokCount: number) => ({
      tagId,
      id: `sub-${tagId}`,
      name: displayName.toLowerCase(),
      displayName,
      color: '#ccc',
      createdAt: '2026-01-01T00:00:00Z',
      pokCount,
    });

    it('renders only 3 tags when there are more than 3 and not expanded', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
          makeTag('t3', 'Gamma', 5),
          makeTag('t4', 'Delta', 3),
        ],
      };
      mockTestState.tagsExpanded = false;

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const tagLabels = allTexts
        .filter(el => ['Alpha', 'Beta', 'Gamma', 'Delta'].includes(el.props.children as string))
        .map(el => el.props.children as string);
      expect(tagLabels).toHaveLength(3);
    });

    it('shows tags sorted by pokCount descending', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
          makeTag('t3', 'Gamma', 5),
        ],
      };

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const tagLabels = allTexts
        .filter(el => ['Alpha', 'Beta', 'Gamma'].includes(el.props.children as string))
        .map(el => el.props.children as string);
      expect(tagLabels).toEqual(['Beta', 'Gamma', 'Alpha']);
    });

    it('renders expand toggle when there are more than 3 tags', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
          makeTag('t3', 'Gamma', 5),
          makeTag('t4', 'Delta', 3),
        ],
      };
      mockTestState.tagsExpanded = false;

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const showAllText = allTexts.find(el =>
        typeof el.props.children === 'string' &&
        (el.props.children as string).includes('showAllTags')
      );
      expect(showAllText).toBeDefined();
    });

    it('shows "show less" toggle when expanded', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
          makeTag('t3', 'Gamma', 5),
          makeTag('t4', 'Delta', 3),
        ],
      };
      mockTestState.tagsExpanded = true;

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const showLessText = allTexts.find(el =>
        el.props.children === 'learnings.detail.showLessTags'
      );
      expect(showLessText).toBeDefined();
    });

    it('renders all tags when expanded', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
          makeTag('t3', 'Gamma', 5),
          makeTag('t4', 'Delta', 3),
        ],
      };
      mockTestState.tagsExpanded = true;

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const tagLabels = allTexts
        .filter(el => ['Alpha', 'Beta', 'Gamma', 'Delta'].includes(el.props.children as string))
        .map(el => el.props.children as string);
      expect(tagLabels).toHaveLength(4);
    });

    it('does not render expand toggle when 3 or fewer tags', () => {
      mockTestState.pok = {
        ...mockPokWithTag,
        tags: [
          makeTag('t1', 'Alpha', 1),
          makeTag('t2', 'Beta', 10),
        ],
      };

      const result = LearningDetailScreen({} as never);
      const allTexts = findAllByType(result, 'Text');
      const toggleText = allTexts.find(el =>
        typeof el.props.children === 'string' &&
        ((el.props.children as string).includes('showAllTags') ||
         (el.props.children as string).includes('showLessTags'))
      );
      expect(toggleText).toBeUndefined();
    });
  });
});
