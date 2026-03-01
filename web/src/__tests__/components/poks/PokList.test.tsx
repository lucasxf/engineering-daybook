import { render, screen } from '@testing-library/react';
import { PokList } from '@/components/poks/PokList';
import { Pok } from '@/lib/pokApi';

const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('PokList', () => {
  const mockPoks: Pok[] = [
    {
      id: '1',
      userId: 'user-1',
      title: 'POK 1',
      content: 'Content 1',
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
});
