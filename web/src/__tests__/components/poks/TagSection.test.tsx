import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import { TagSection } from '@/components/poks/TagSection';
import { tagsMessages } from '@/test/page-test-utils';

// vi.hoisted() ensures these fns are available when vi.mock factories are evaluated
const { mockCreateTag, mockAssignTag, mockRemoveTag } = vi.hoisted(() => ({
  mockCreateTag: vi.fn(),
  mockAssignTag: vi.fn(),
  mockRemoveTag: vi.fn(),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      { id: 'ut-10', tagId: 'tag-10', name: 'vue', color: 'green', createdAt: '2026-02-14T10:00:00Z' },
    ],
    isLoading: false,
    error: null,
    createTag: mockCreateTag,
    assignTag: mockAssignTag,
    removeTag: mockRemoveTag,
    deleteTag: vi.fn(),
  }),
}));

vi.mock('@/components/poks/TagSuggestionPrompt', () => ({
  TagSuggestionPrompt: ({ suggestions }: { suggestions: { suggestedName: string }[] }) => (
    <div data-testid="suggestion-prompt">
      {suggestions.map((s) => <span key={s.suggestedName}>{s.suggestedName}</span>)}
    </div>
  ),
}));

const assignedTag = { id: 'ut-1', tagId: 'tag-1', name: 'react', color: 'blue', createdAt: '2026-02-14T10:00:00Z' };

const renderSection = (overrides?: Partial<Parameters<typeof TagSection>[0]>) => {
  const props = {
    pokId: 'pok-abc',
    tags: [],
    pendingSuggestions: [],
    onChanged: vi.fn(),
    ...overrides,
  };
  return render(
    <NextIntlClientProvider locale="en" messages={tagsMessages}>
      <TagSection {...props} />
    </NextIntlClientProvider>
  );
};

describe('TagSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTag.mockResolvedValue(null);
    mockAssignTag.mockResolvedValue(undefined);
    mockRemoveTag.mockResolvedValue(undefined);
  });

  it('renders assigned tag badges', () => {
    renderSection({ tags: [assignedTag] });
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('renders the add tag button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /add tag/i })).toBeInTheDocument();
  });

  it('opens the tag picker on button click', async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    expect(screen.getByPlaceholderText(/new tag name/i)).toBeInTheDocument();
  });

  it('shows available (unassigned) tags in the picker', async () => {
    const user = userEvent.setup();
    // "vue" is in useTags mock; "react" is already assigned → "vue" appears as an option, "react" does not
    renderSection({ tags: [assignedTag] });
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    expect(screen.getByRole('button', { name: /^vue$/i })).toBeInTheDocument();
    // "react" may appear as a tag badge remove button but NOT as a picker option
    const pickerButtons = screen.queryAllByRole('button', { name: /^react$/i });
    expect(pickerButtons).toHaveLength(0);
  });

  it('calls assignTag and onChanged when an existing tag is selected', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    renderSection({ onChanged });
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.click(screen.getByRole('button', { name: /vue/i }));
    await waitFor(() => expect(mockAssignTag).toHaveBeenCalledWith('pok-abc', 'ut-10'));
    expect(onChanged).toHaveBeenCalled();
  });

  it('creates and assigns a new tag on Enter key', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    const newTag = { id: 'ut-99', tagId: 'tag-99', name: 'typescript', color: 'blue', createdAt: '2026-02-14T10:00:00Z' };
    mockCreateTag.mockResolvedValue(newTag);

    renderSection({ onChanged });
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.type(screen.getByPlaceholderText(/new tag name/i), 'typescript');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(mockCreateTag).toHaveBeenCalledWith('typescript'));
    await waitFor(() => expect(mockAssignTag).toHaveBeenCalledWith('pok-abc', 'ut-99'));
    expect(onChanged).toHaveBeenCalled();
  });

  it('calls removeTag and onChanged when a tag badge remove is clicked', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    renderSection({ tags: [assignedTag], onChanged });

    const removeBtn = screen.getByRole('button', { name: /remove tag react/i });
    await user.click(removeBtn);

    await waitFor(() => expect(mockRemoveTag).toHaveBeenCalledWith('pok-abc', 'ut-1'));
    expect(onChanged).toHaveBeenCalled();
  });

  it('renders TagSuggestionPrompt when suggestions exist', () => {
    renderSection({
      pendingSuggestions: [
        { id: 'sug-1', pokId: 'pok-abc', suggestedName: 'node', status: 'PENDING' },
      ],
    });
    expect(screen.getByTestId('suggestion-prompt')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
  });

  it('does not render TagSuggestionPrompt when no suggestions', () => {
    renderSection({ pendingSuggestions: [] });
    expect(screen.queryByTestId('suggestion-prompt')).not.toBeInTheDocument();
  });
});
