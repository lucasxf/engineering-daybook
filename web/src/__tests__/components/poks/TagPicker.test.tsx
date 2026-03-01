import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import { TagPicker } from '@/components/poks/TagPicker';
import type { Tag } from '@/lib/tagApi';

const { mockCreateTag } = vi.hoisted(() => ({
  mockCreateTag: vi.fn(),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({
    tags: [
      { id: 'ut-1', tagId: 'tag-1', name: 'react', color: 'blue', createdAt: '2026-02-25T10:00:00Z' },
      { id: 'ut-2', tagId: 'tag-2', name: 'spring', color: 'green', createdAt: '2026-02-25T10:00:00Z' },
    ],
    isLoading: false,
    error: null,
    createTag: mockCreateTag,
    assignTag: vi.fn(),
    removeTag: vi.fn(),
    deleteTag: vi.fn(),
  }),
}));

const messages = {
  tags: {
    addTag: 'Add tag',
    createNew: 'New tag name...',
    badge: { remove: 'Remove tag' },
    errors: { createFailed: 'Failed to create tag' },
    suggestions: { label: '', approve: '', reject: '' },
  },
};

const renderPicker = (
  selectedTags: Tag[] = [],
  onSelectionChange = vi.fn()
) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TagPicker selectedTags={selectedTags} onSelectionChange={onSelectionChange} />
    </NextIntlClientProvider>
  );

describe('TagPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an "Add tag" button', () => {
    renderPicker();
    expect(screen.getByRole('button', { name: /add tag/i })).toBeInTheDocument();
  });

  it('shows available tags when "Add tag" is clicked', async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'spring' })).toBeInTheDocument();
  });

  it('calls onSelectionChange with the selected tag when a tag is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderPicker([], onSelectionChange);

    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.click(screen.getByRole('button', { name: 'react' }));

    expect(onSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'ut-1', name: 'react' }),
    ]);
  });

  it('does not show already-selected tags in the dropdown', async () => {
    const user = userEvent.setup();
    const selected: Tag[] = [
      { id: 'ut-1', tagId: 'tag-1', name: 'react', color: 'blue', createdAt: '2026-02-25T10:00:00Z' },
    ];
    renderPicker(selected);

    await user.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.queryByRole('button', { name: 'react' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'spring' })).toBeInTheDocument();
  });

  it('renders selected tags as badges with a remove button', () => {
    const selected: Tag[] = [
      { id: 'ut-1', tagId: 'tag-1', name: 'react', color: 'blue', createdAt: '2026-02-25T10:00:00Z' },
    ];
    renderPicker(selected);

    expect(screen.getByText('react')).toBeInTheDocument();
    // TagBadge renders a remove button with aria-label "Remove tag react"
    expect(screen.getByRole('button', { name: /remove tag react/i })).toBeInTheDocument();
  });

  it('calls onSelectionChange without the removed tag when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const selected: Tag[] = [
      { id: 'ut-1', tagId: 'tag-1', name: 'react', color: 'blue', createdAt: '2026-02-25T10:00:00Z' },
    ];
    const onSelectionChange = vi.fn();
    renderPicker(selected, onSelectionChange);

    await user.click(screen.getByRole('button', { name: /remove tag react/i }));

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows an error message when createTag fails (returns null)', async () => {
    const user = userEvent.setup();
    mockCreateTag.mockResolvedValue(null);
    renderPicker();

    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.type(screen.getByPlaceholderText(/new tag name/i), 'typescript');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Failed to create tag')).toBeInTheDocument();
    });
  });

  it('creates a new tag and calls onSelectionChange when submitted via input', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const newTag: Tag = { id: 'ut-new', tagId: 'tag-new', name: 'typescript', color: 'blue', createdAt: '2026-02-25T10:00:00Z' };
    mockCreateTag.mockResolvedValue(newTag);
    renderPicker([], onSelectionChange);

    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.type(screen.getByPlaceholderText(/new tag name/i), 'typescript');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith('typescript');
      expect(onSelectionChange).toHaveBeenCalledWith([newTag]);
    });
  });
});
