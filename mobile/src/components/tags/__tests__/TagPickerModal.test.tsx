/**
 * TagPickerModal unit tests.
 * Runs in the 'components' jest project (node environment).
 * Covers: render, search filter, create-row visibility, loading states, callbacks.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// State sequencing (tagQuery is the only managed state: call 1)
// ---------------------------------------------------------------------------

let mockStateCallCount = 0;
const mockSetTagQuery = jest.fn();

let mockTagQuery = '';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => {
      mockStateCallCount++;
      if (mockStateCallCount === 1) return [mockTagQuery, mockSetTagQuery];
      return [init, jest.fn()];
    },
    useEffect: jest.fn(),
  };
});

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

// ---------------------------------------------------------------------------
// UI component mocks
// ---------------------------------------------------------------------------

jest.mock('@/components/ui/Text', () => ({
  Text: ({ children, ...props }: Record<string, unknown>) =>
    require('react').createElement('Text', props, children),
}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) =>
    require('react').createElement('TextInput', props),
}));

// ---------------------------------------------------------------------------
// Import under test
// ---------------------------------------------------------------------------

import { TagPickerModal } from '../TagPickerModal';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tagA = {
  tagId: 'global-a',
  id: 'sub-a',
  name: 'react',
  displayName: 'React',
  color: '#61dafb',
  createdAt: '2026-01-01T00:00:00Z',
  pokCount: 10,
};

const tagB = {
  tagId: 'global-b',
  id: 'sub-b',
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

const defaultProps = {
  visible: true,
  selectedTagIds: [] as string[],
  onClose: jest.fn(),
  onSelect: jest.fn(),
  onCreate: jest.fn(),
  allTags: [tagA, tagB],
  listLoading: false,
  actionLoading: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TagPickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStateCallCount = 0;
    mockTagQuery = '';
    const reactMock = require('react') as Record<string, unknown>;
    reactMock.useEffect = jest.fn();
  });

  describe('visibility', () => {
    it('renders closed when visible=false', () => {
      const result = TagPickerModal({ ...defaultProps, visible: false });
      const modals = findAllByType(result, 'Modal');
      expect(modals.length).toBe(1);
      expect(modals[0].props.visible).toBe(false);
    });

    it('renders open when visible=true', () => {
      const result = TagPickerModal(defaultProps);
      const modals = findAllByType(result, 'Modal');
      expect(modals[0].props.visible).toBe(true);
    });
  });

  describe('tag list', () => {
    it('renders all available tags when no query and none selected', () => {
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists.length).toBe(1);
      expect((flatLists[0].props.data as unknown[]).length).toBe(2);
    });

    it('excludes already-selected tags (by tagId) from the available list', () => {
      const result = TagPickerModal({ ...defaultProps, selectedTagIds: [tagA.tagId] });
      const flatLists = findAllByType(result, 'FlatList');
      const data = flatLists[0].props.data as typeof tagA[];
      expect(data.every((t) => t.tagId !== tagA.tagId)).toBe(true);
      expect(data.length).toBe(1);
    });

    it('calls onSelect with the tag when an existing row is tapped', () => {
      const onSelect = jest.fn();
      const result = TagPickerModal({ ...defaultProps, onSelect });
      const flatLists = findAllByType(result, 'FlatList');
      const renderItem = flatLists[0].props.renderItem as (arg: { item: typeof tagA }) => AnyEl;
      const row = renderItem({ item: tagA });
      (row.props.onPress as () => void)();
      expect(onSelect).toHaveBeenCalledWith(tagA);
    });
  });

  describe('search filter', () => {
    it('filters tags by displayName (case-insensitive) when query is set', () => {
      mockTagQuery = 'react';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      const data = flatLists[0].props.data as typeof tagA[];
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('react');
    });

    it('filters tags by name field as well', () => {
      mockTagQuery = 'type';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      const data = flatLists[0].props.data as typeof tagB[];
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('typescript');
    });
  });

  describe('"Create new tag" row visibility', () => {
    it('does NOT show create row when query is empty', () => {
      mockTagQuery = '';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists[0].props.ListFooterComponent).toBeNull();
    });

    it('does NOT show create row when query exactly matches an existing tag name', () => {
      mockTagQuery = 'react'; // exact match tagA.name
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists[0].props.ListFooterComponent).toBeNull();
    });

    it('shows create row when query has no exact match', () => {
      mockTagQuery = 'golang';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      expect(footer).not.toBeNull();
    });

    it('calls onCreate with the current query when create row is tapped', () => {
      mockTagQuery = 'golang';
      const onCreate = jest.fn();
      const result = TagPickerModal({ ...defaultProps, onCreate });
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      (footer.props.onPress as () => void)();
      expect(onCreate).toHaveBeenCalledWith('golang');
    });
  });

  describe('loading states', () => {
    it('renders spinner when actionLoading=true (hides FlatList)', () => {
      const result = TagPickerModal({ ...defaultProps, actionLoading: true });
      const spinners = findAllByType(result, 'ActivityIndicator');
      const flatLists = findAllByType(result, 'FlatList');
      expect(spinners.length).toBeGreaterThan(0);
      expect(flatLists.length).toBe(0);
    });

    it('renders spinner when listLoading=true and allTags is empty', () => {
      const result = TagPickerModal({ ...defaultProps, allTags: [], listLoading: true });
      const spinners = findAllByType(result, 'ActivityIndicator');
      const flatLists = findAllByType(result, 'FlatList');
      expect(spinners.length).toBeGreaterThan(0);
      expect(flatLists.length).toBe(0);
    });

    it('does NOT show spinner when listLoading=true but allTags is already populated', () => {
      const result = TagPickerModal({ ...defaultProps, listLoading: true });
      // allTags has data, spinner should not show (FlatList visible instead)
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists.length).toBe(1);
    });
  });

  describe('empty state messages', () => {
    it('shows noTagsAvailable message when allTags is empty and no query', () => {
      const result = TagPickerModal({ ...defaultProps, allTags: [] });
      const texts = findAllByType(result, 'Text');
      const emptyMsg = texts.find((el) =>
        el.props.children === 'learnings.detail.noTagsAvailable'
      );
      expect(emptyMsg).toBeDefined();
    });

    it('shows noMoreTagsToAdd when all tags are already selected and no query', () => {
      const result = TagPickerModal({
        ...defaultProps,
        selectedTagIds: [tagA.tagId, tagB.tagId],
      });
      const texts = findAllByType(result, 'Text');
      const msg = texts.find((el) =>
        el.props.children === 'learnings.detail.noMoreTagsToAdd'
      );
      expect(msg).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // Regression tests: Android hyphen input bug (fix/mobile-tag-hyphen-input)
  //
  // Bug: typing "-" at the end of a tag name caused it to immediately vanish.
  // Root cause: the onChangeText handler ran `.replace(/^-+|-+$/g, '')` on
  // EVERY keystroke, stripping the trailing hyphen instantly.
  // Fix: defer leading/trailing strip to the onCreate call site only.
  // ---------------------------------------------------------------------------

  describe('tag name normalisation — onChangeText', () => {
    function getTextInputOnChangeText(result: unknown): (text: string) => void {
      const inputs = findAllByType(result, 'TextInput');
      expect(inputs.length).toBeGreaterThan(0);
      return inputs[0].props.onChangeText as (text: string) => void;
    }

    it('accepts a trailing hyphen mid-typing (does NOT strip it)', () => {
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('system-');
      // setTagQuery must be called with "system-" — trailing dash preserved during typing
      expect(mockSetTagQuery).toHaveBeenCalledWith('system-');
    });

    it('accepts a leading hyphen mid-typing (does NOT strip it)', () => {
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('-system');
      expect(mockSetTagQuery).toHaveBeenCalledWith('-system');
    });

    it('preserves a hyphen between words (system-design)', () => {
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('system-design');
      expect(mockSetTagQuery).toHaveBeenCalledWith('system-design');
    });

    it('replaces spaces with hyphens', () => {
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('system design');
      expect(mockSetTagQuery).toHaveBeenCalledWith('system-design');
    });

    it('collapses consecutive hyphens to one', () => {
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('system--design');
      expect(mockSetTagQuery).toHaveBeenCalledWith('system-design');
    });

    it('replaces a space with a hyphen and keeps it (space→hyphen, no strip)', () => {
      // Typing a space after "system" produces "system-" — this must NOT be
      // stripped, otherwise the user has no way to continue typing the second word.
      const result = TagPickerModal(defaultProps);
      const onChangeText = getTextInputOnChangeText(result);
      onChangeText('system ');
      // space→hyphen, trailing hyphen kept: "system-"
      expect(mockSetTagQuery).toHaveBeenCalledWith('system-');
    });
  });

  describe('tag name normalisation — onCreate (trailing/leading strip at submit)', () => {
    function getCreateRowOnPress(result: unknown): () => void {
      const flatLists = findAllByType(result, 'FlatList');
      const footer = flatLists[0].props.ListFooterComponent as AnyEl;
      return footer.props.onPress as () => void;
    }

    it('strips trailing hyphen before calling onCreate', () => {
      mockTagQuery = 'system-';
      const onCreate = jest.fn();
      const result = TagPickerModal({ ...defaultProps, onCreate });
      getCreateRowOnPress(result)();
      expect(onCreate).toHaveBeenCalledWith('system');
    });

    it('strips leading hyphen before calling onCreate', () => {
      mockTagQuery = '-system';
      const onCreate = jest.fn();
      const result = TagPickerModal({ ...defaultProps, onCreate });
      getCreateRowOnPress(result)();
      expect(onCreate).toHaveBeenCalledWith('system');
    });

    it('calls onCreate with clean slug for "system-design"', () => {
      mockTagQuery = 'system-design';
      const onCreate = jest.fn();
      const result = TagPickerModal({ ...defaultProps, onCreate });
      getCreateRowOnPress(result)();
      expect(onCreate).toHaveBeenCalledWith('system-design');
    });

    it('does NOT show create row when tagQuery is only dashes (cleanTagQuery is empty)', () => {
      // "---" → cleanTagQuery = "" → showCreateRow = false.
      // filteredTags also = [] (no tag named "---"), so the component renders an
      // empty-state Text rather than a FlatList. Verify no create row by checking
      // there is no FlatList (and no onCreate button) in the tree at all.
      mockTagQuery = '---';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists.length).toBe(0);
    });

    it('does NOT show create row when tagQuery is a single hyphen', () => {
      mockTagQuery = '-';
      const result = TagPickerModal(defaultProps);
      const flatLists = findAllByType(result, 'FlatList');
      expect(flatLists.length).toBe(0);
    });
  });
});
