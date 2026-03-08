import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PokList } from '@/components/poks/PokList';
import { Pok } from '@/lib/pokApi';

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
  const mockPoks: Pok[] = [
    {
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
    },
    {
      id: '2',
      userId: 'user-1',
      title: null,
      content: 'Content 2 without title',
      deletedAt: null,
      createdAt: '2026-02-14T09:00:00Z',
      updatedAt: '2026-02-14T09:00:00Z',
      tags: [],
      pendingSuggestions: [],
    },
  ];

  const renderList = (poks: Pok[]) => render(<PokList poks={poks} />);

  it('renders POK cards', () => {
    renderList(mockPoks);

    expect(screen.getByRole('heading', { name: 'POK 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content 2 without title/ })).toBeInTheDocument();
  });

  it('renders one link per POK', () => {
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
    const publicPoks: Pok[] = [
      { ...mockPoks[0], id: '1', visibility: 'PUBLIC' },
      { ...mockPoks[1], id: '2', visibility: 'PUBLIC' },
    ];

    render(<PokList poks={publicPoks} onSharePok={mockOnSharePok} />);

    const reLearnButtons = screen.getAllByRole('button', { name: 'Re-learn' });
    await user.click(reLearnButtons[0]);

    expect(mockOnSharePok).toHaveBeenCalledWith(publicPoks[0]);
  });
});
