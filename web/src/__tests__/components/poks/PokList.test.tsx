import { render, screen } from '@testing-library/react';
import { PokList } from '@/components/poks/PokList';
import { Pok } from '@/lib/pokApi';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  poks: {
    emptyState: {
      message: 'No POKs yet. Start capturing what you learn!',
      cta: 'Create your first POK',
    },
  },
};

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
    },
    {
      id: '2',
      userId: 'user-1',
      title: null,
      content: 'Content 2 without title',
      deletedAt: null,
      createdAt: '2026-02-14T09:00:00Z',
      updatedAt: '2026-02-14T09:00:00Z',
    },
  ];

  const renderList = (poks: Pok[]) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PokList poks={poks} />
      </NextIntlClientProvider>
    );
  };

  it('renders POK cards in a grid layout', () => {
    renderList(mockPoks);

    expect(screen.getByRole('heading', { name: 'POK 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Content 2 without title/ })).toBeInTheDocument();
  });

  it('renders multiple POK cards', () => {
    renderList(mockPoks);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });

  it('shows empty state when no POKs', () => {
    renderList([]);

    expect(screen.getByText(/No POKs yet/i)).toBeInTheDocument();
  });

  it('shows empty state with create CTA', () => {
    renderList([]);

    const createLink = screen.getByRole('link', { name: /create/i });
    expect(createLink).toHaveAttribute('href', expect.stringContaining('/poks/new'));
  });

  it('applies grid layout classes', () => {
    const { container } = renderList(mockPoks);

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });
});
