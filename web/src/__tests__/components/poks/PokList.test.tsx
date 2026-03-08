import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PokList } from '@/components/poks/PokList';
import type { FeedItem, Pok, PokShare } from '@/lib/pokApi';

const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const keys: Record<string, string> = { 'share.button': 'Re-learn' };
    return keys[key] ?? key;
  },
}));

describe('PokList', () => {
  const mockPok1: Pok = {
    type: 'owned',
    id: '1',
    userId: 'user-1',
    title: 'POK 1',
    content: 'Content 1',
    visibility: 'PRIVATE',
    deletedAt: null,
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    tags: [],
    pendingSuggestions: [],
  };
  const mockPok2: Pok = {
    type: 'owned',
    id: '2',
    userId: 'user-1',
    title: null,
    content: 'Content 2 without title',
    visibility: 'PRIVATE',
    deletedAt: null,
    createdAt: '2026-02-14T09:00:00Z',
    updatedAt: '2026-02-14T09:00:00Z',
    tags: [],
    pendingSuggestions: [],
  };
  const mockPoks: Pok[] = [mockPok1, mockPok2];
  const mockShare: PokShare = {
    type: 'shared',
    id: 'share-1',
    originalPokId: 'orig-1',
    originalPok: { ...mockPok1, id: 'orig-1', userId: 'other-user' },
    sharedByHandle: 'myhandle',
    note: 'Great learning!',
    visibility: 'PUBLIC',
    createdAt: '2026-02-14T11:00:00Z',
  };

  const renderList = (items: FeedItem[]) => render(<PokList poks={items} />);

  it('renders owned POK cards', () => {
    renderList(mockPoks);

    expect(screen.getByRole('heading', { name: 'POK 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content 2 without title/ })).toBeInTheDocument();
  });

  it('renders one link per owned POK', () => {
    renderList(mockPoks);

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders nothing when poks is empty', () => {
    const { container } = renderList([]);

    expect(container.querySelector('[class*="flex-col"]')).toBeEmptyDOMElement();
  });

  it('uses a single-column vertical layout', () => {
    const { container } = renderList(mockPoks);

    expect(container.querySelector('[class*="flex-col"]')).toBeInTheDocument();
  });

  it('passes onShare to each PokCard for PUBLIC poks when onSharePok is provided', async () => {
    const user = userEvent.setup();
    const mockOnSharePok = vi.fn();
    const publicPoks: FeedItem[] = [
      { ...mockPok1, id: '1', visibility: 'PUBLIC' },
      { ...mockPok2, id: '2', visibility: 'PUBLIC' },
    ];

    render(<PokList poks={publicPoks} onSharePok={mockOnSharePok} />);

    const reLearnButtons = screen.getAllByRole('button', { name: 'Re-learn' });
    await user.click(reLearnButtons[0]);

    expect(mockOnSharePok).toHaveBeenCalledWith(publicPoks[0]);
  });

  it('renders ReLearningCard for PokShare items in the feed', () => {
    const feedItems: FeedItem[] = [mockPok1, mockShare];
    renderList(feedItems);

    // Owned pok still renders (multiple "POK 1" headings: one for the owned card, one inside ReLearningCard)
    expect(screen.getAllByRole('heading', { name: 'POK 1' }).length).toBeGreaterThanOrEqual(1);
    // Re-learning renders (ReLearningCard shows the original pok content attribution)
    expect(screen.getByText(/Great learning!/)).toBeInTheDocument();
  });
});
