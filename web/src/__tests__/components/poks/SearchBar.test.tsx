import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '@/components/poks/SearchBar';
import { NextIntlClientProvider } from 'next-intl';

// Mock useDebounce to avoid timing issues in tests
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const messages = {
  poks: {
    search: {
      placeholder: 'Search your learnings...',
      button: 'Search',
    },
  },
};

const renderSearchBar = (props: Parameters<typeof SearchBar>[0] = { onSearch: vi.fn() }) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchBar {...props} />
    </NextIntlClientProvider>
  );
};

describe('SearchBar', () => {
  it('should render search input with placeholder', () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText('Search your learnings...');
    expect(input).toBeInTheDocument();
  });

  it('should render custom placeholder when provided', () => {
    renderSearchBar({ onSearch: vi.fn(), placeholder: 'Custom placeholder' });

    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    renderSearchBar();

    const button = screen.getByLabelText('Search');
    expect(button).toBeInTheDocument();
  });

  it('should call onSearch when Enter key is pressed', () => {
    const onSearch = vi.fn();
    renderSearchBar({ onSearch });

    const input = screen.getByPlaceholderText('Search your learnings...');
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should call onSearch when search button is clicked', () => {
    const onSearch = vi.fn();
    renderSearchBar({ onSearch });

    const input = screen.getByPlaceholderText('Search your learnings...');
    const button = screen.getByLabelText('Search');

    fireEvent.change(input, { target: { value: 'docker' } });
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('docker');
  });

  it('should call onSearch with debounced value (auto-trigger)', async () => {
    const onSearch = vi.fn();
    renderSearchBar({ onSearch });

    const input = screen.getByPlaceholderText('Search your learnings...');
    fireEvent.change(input, { target: { value: 'spring' } });

    // Since we mocked useDebounce to return value immediately,
    // onSearch should be called via useEffect
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('spring');
    });
  });

  it('should update input value on change', () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText('Search your learnings...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(input.value).toBe('new value');
  });

  it('should initialize with initial value', () => {
    renderSearchBar({ onSearch: vi.fn(), initialValue: 'initial search' });

    const input = screen.getByPlaceholderText('Search your learnings...') as HTMLInputElement;
    expect(input.value).toBe('initial search');
  });
});
