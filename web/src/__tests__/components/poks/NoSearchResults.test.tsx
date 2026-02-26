import { render, screen, fireEvent } from '@testing-library/react';
import { NoSearchResults } from '@/components/poks/NoSearchResults';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  poks: {
    search: {
      noResults: 'No learnings found matching your search',
      noResultsHint: 'Try adjusting your search terms or filters',
      noResultsSemantic: 'No learnings found',
      noResultsSemanticHint: 'Try rephrasing your search — semantic search looks for meaning, not exact words',
      clearButton: 'Clear search',
    },
  },
};

const renderNoSearchResults = (props: Parameters<typeof NoSearchResults>[0]) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NoSearchResults {...props} />
    </NextIntlClientProvider>
  );
};

describe('NoSearchResults', () => {
  it('should render no results message', () => {
    renderNoSearchResults({ onClearSearch: vi.fn() });

    expect(screen.getByText('No learnings found matching your search')).toBeInTheDocument();
  });

  it('should render semantic hint text', () => {
    renderNoSearchResults({ onClearSearch: vi.fn() });

    expect(
      screen.getByText('Try rephrasing your search — semantic search looks for meaning, not exact words')
    ).toBeInTheDocument();
  });

  it('should render clear search button', () => {
    renderNoSearchResults({ onClearSearch: vi.fn() });

    const button = screen.getByRole('button', { name: 'Clear search' });
    expect(button).toBeInTheDocument();
  });

  it('should call onClearSearch when button is clicked', () => {
    const onClearSearch = vi.fn();
    renderNoSearchResults({ onClearSearch });

    const button = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(button);

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it('should have role="status" for accessibility', () => {
    renderNoSearchResults({ onClearSearch: vi.fn() });

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
  });

  it('should render search icon', () => {
    const { container } = renderNoSearchResults({ onClearSearch: vi.fn() });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
