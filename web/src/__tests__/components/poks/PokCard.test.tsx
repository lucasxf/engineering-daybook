import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PokCard } from '@/components/poks/PokCard';
import { Pok } from '@/lib/pokApi';

const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const keys: Record<string, string> = { 'view.editButton': 'Edit' };
    return keys[key] ?? key;
  },
}));

describe('PokCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  const basePok: Pok = {
    id: '123',
    userId: 'user-1',
    title: 'Test Title',
    content: 'Test content',
    deletedAt: null,
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    tags: [],
    pendingSuggestions: [],
  };

  it('displays title as header when title is present', () => {
    render(<PokCard pok={basePok} />);

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('displays content preview (first 100 chars)', () => {
    const longContent = 'a'.repeat(200);
    const pok = { ...basePok, content: longContent };

    render(<PokCard pok={pok} />);

    // Should show first 100 chars + ellipsis
    expect(screen.getByText(/a{100}/)).toBeInTheDocument();
  });

  it('displays first 50 chars of content as header when no title', () => {
    const pok = { ...basePok, title: null, content: 'Content without title' };

    render(<PokCard pok={pok} />);

    // Header should show content snippet since no title
    expect(screen.getByRole('heading', { name: /Content without title/ })).toBeInTheDocument();
  });

  it('displays first 50 chars of content as header when title is empty string', () => {
    const pok = { ...basePok, title: '', content: 'Content with empty title' };

    render(<PokCard pok={pok} />);

    expect(screen.getByRole('heading', { name: /Content with empty title/ })).toBeInTheDocument();
  });

  it('truncates long content snippet in header to 50 chars', () => {
    const longContent = 'a'.repeat(100);
    const pok = { ...basePok, title: null, content: longContent };

    render(<PokCard pok={pok} />);

    const heading = screen.getByRole('heading');
    // Should be truncated to ~50 chars + ellipsis
    expect(heading.textContent?.length).toBeLessThan(55);
  });

  it('renders as a clickable link to POK detail page', () => {
    render(<PokCard pok={basePok} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/poks/123'));
  });

  it('displays formatted date', () => {
    render(<PokCard pok={basePok} />);

    // Should display updatedAt in some format
    expect(screen.getByText(/2026|Feb|14/)).toBeInTheDocument();
  });

  it('renders an edit icon button with correct aria-label', () => {
    render(<PokCard pok={basePok} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('navigates to edit page when edit icon is clicked without following card link', async () => {
    const user = userEvent.setup();
    render(<PokCard pok={basePok} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockPush).toHaveBeenCalledWith('/en/poks/123/edit');
  });
});
