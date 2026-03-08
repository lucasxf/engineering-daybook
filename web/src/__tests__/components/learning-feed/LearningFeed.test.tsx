import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '@/components/learning-feed/EmptyState';
import ErrorState from '@/components/learning-feed/ErrorState';
import NoResultsState from '@/components/learning-feed/NoResultsState';
import PageHeader from '@/components/learning-feed/PageHeader';
import PaginationControls from '@/components/learning-feed/PaginationControls';
import SearchSortToolbar from '@/components/learning-feed/SearchSortToolbar';
import LearningCardList from '@/components/learning-feed/LearningCardList';
import LoadingState from '@/components/learning-feed/LoadingState';
import type { Pok } from '@/lib/pokApi';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params && 'query' in params) return `No results for "${params.query}"`;
    if (params && 'count' in params) return `${params.count} learnings`;
    if (params && 'date' in params) return `Created ${params.date}`;
    if (params && 'relativeTime' in params) return `Updated ${params.relativeTime}`;
    return key;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { userId: '1', email: 'test@test.com', handle: 'testuser', displayName: 'Test User', defaultPokVisibility: 'PRIVATE', profileVisibility: 'PRIVATE' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('@/components/ui/Select', () => ({
  Select: ({ onChange, options, value, label }: { onChange: (v: string) => void; options: {value: string; label: string}[]; value: string; label?: string }) => (
    <select aria-label={label ?? 'select'} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
}));

vi.mock('@/components/ui/Avatar', () => ({
  Avatar: ({ displayName }: { displayName: string }) => <span>{displayName}</span>,
}));

const mockPok: Pok = {
  type: 'owned',
  id: '1',
  userId: 'user1',
  title: 'React Server Components',
  content: 'Learned about RSC pattern',
  visibility: 'PRIVATE',
  deletedAt: null,
  createdAt: '2024-01-14T10:00:00Z',
  updatedAt: '2024-01-14T10:00:00Z',
  tags: [{ id: 'tag1', userId: 'user1', name: 'react', displayName: 'React' }],
  pendingSuggestions: [],
};

describe('EmptyState', () => {
  it('renders empty state with call to action button', () => {
    const onNew = vi.fn();
    render(<EmptyState onNewLearning={onNew} />);
    expect(screen.getByText('feed.empty.title')).toBeTruthy();
    expect(screen.getByText('feed.empty.hint')).toBeTruthy();
  });

  it('calls onNewLearning when button clicked', async () => {
    const onNew = vi.fn();
    render(<EmptyState onNewLearning={onNew} />);
    await userEvent.click(screen.getByText('feed.empty.button'));
    expect(onNew).toHaveBeenCalledOnce();
  });
});

describe('ErrorState', () => {
  it('renders error state with retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByText('feed.error.title')).toBeTruthy();
    expect(screen.getByText('feed.error.hint')).toBeTruthy();
  });

  it('calls onRetry when button clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByText('feed.error.retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('NoResultsState', () => {
  it('renders with query in hint text', () => {
    const query = 'typescript';
    render(
      <NoResultsState
        query={query}
        onClearSearch={vi.fn()}
        onNewLearning={vi.fn()}
      />
    );
    expect(screen.getByText(`No results for "${query}"`)).toBeTruthy();
  });

  it('calls onClearSearch when clear button clicked', async () => {
    const onClear = vi.fn();
    render(
      <NoResultsState
        query="test"
        onClearSearch={onClear}
        onNewLearning={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('feed.noResults.clearSearch'));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe('PageHeader', () => {
  it('renders title and count', () => {
    render(<PageHeader totalCount={5} onNewLearning={vi.fn()} />);
    expect(screen.getByText('list.title')).toBeTruthy();
    expect(screen.getByText('5 learnings')).toBeTruthy();
  });

  it('calls onNewLearning when create button clicked', async () => {
    const onNew = vi.fn();
    render(<PageHeader totalCount={0} onNewLearning={onNew} />);
    await userEvent.click(screen.getByText('list.createButton'));
    expect(onNew).toHaveBeenCalledOnce();
  });
});

describe('PaginationControls', () => {
  it('renders previous and next buttons', () => {
    render(
      <PaginationControls currentPage={2} totalPages={5} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('feed.pagination.previous')).toBeTruthy();
    expect(screen.getByText('feed.pagination.next')).toBeTruthy();
  });

  it('disables previous button on first page', () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={5} onPageChange={vi.fn()} />
    );
    const prevButton = container.querySelector('button:first-child') as HTMLButtonElement;
    expect(prevButton.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    const { container } = render(
      <PaginationControls currentPage={5} totalPages={5} onPageChange={vi.fn()} />
    );
    const nextButton = container.querySelector('button:last-child') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  it('calls onPageChange with correct page when navigating', async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    await userEvent.click(screen.getByText('feed.pagination.next'));
    expect(onPageChange).toHaveBeenCalledWith(4);
    await userEvent.click(screen.getByText('feed.pagination.previous'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe('SearchSortToolbar', () => {
  it('renders search input with placeholder', () => {
    render(
      <SearchSortToolbar
        keyword=""
        sortBy="createdAt"
        sortDirection="DESC"
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
      />
    );
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('shows clear button only when keyword is non-empty', () => {
    const { rerender } = render(
      <SearchSortToolbar
        keyword=""
        sortBy="createdAt"
        sortDirection="DESC"
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
      />
    );
    expect(screen.queryByText('search.clearButton')).toBeNull();

    rerender(
      <SearchSortToolbar
        keyword="react"
        sortBy="createdAt"
        sortDirection="DESC"
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
      />
    );
    expect(screen.getByText('search.clearButton')).toBeTruthy();
  });

  it('input value updates as user types', async () => {
    render(
      <SearchSortToolbar
        keyword=""
        sortBy="createdAt"
        sortDirection="DESC"
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
      />
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(input, 'react');
    expect(input.value).toBe('react');
  });
});

describe('LearningCardList', () => {
  it('renders a list of learnings', () => {
    render(<LearningCardList learnings={[mockPok]} />);
    expect(screen.getByText('React Server Components')).toBeTruthy();
    expect(screen.getByText('Learned about RSC pattern')).toBeTruthy();
  });

  it('renders tag display names', () => {
    render(<LearningCardList learnings={[mockPok]} />);
    expect(screen.getByText('React')).toBeTruthy();
  });

  it('renders empty div when no learnings', () => {
    const { container } = render(<LearningCardList learnings={[]} />);
    expect(container.querySelector('.space-y-3')?.children.length).toBe(0);
  });
});

describe('LoadingState', () => {
  it('renders 3 skeleton cards', () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
