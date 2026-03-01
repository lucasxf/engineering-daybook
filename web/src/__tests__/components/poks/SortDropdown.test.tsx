import { render, screen, fireEvent } from '@testing-library/react';
import { SortDropdown, SortOption } from '@/components/poks/SortDropdown';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  poks: {
    sort: {
      label: 'Sort by',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
      recentlyUpdated: 'Recently updated',
    },
  },
};

const renderSortDropdown = (props: Parameters<typeof SortDropdown>[0]) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SortDropdown {...props} />
    </NextIntlClientProvider>
  );
};

describe('SortDropdown', () => {
  it('renders with label', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
  });

  it('shows current selection in the trigger button', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'ASC' };

    renderSortDropdown({ value, onChange });

    expect(screen.getByText('Oldest first')).toBeInTheDocument();
  });

  it('opens dropdown and shows all options on click', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getAllByText('Newest first').length).toBeGreaterThan(0);
    expect(screen.getByText('Oldest first')).toBeInTheDocument();
    expect(screen.getByText('Recently updated')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Oldest first'));

    expect(onChange).toHaveBeenCalledWith({ sortBy: 'createdAt', sortDirection: 'ASC' });
  });

  it('calls onChange with correct value for recently updated', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Recently updated'));

    expect(onChange).toHaveBeenCalledWith({ sortBy: 'updatedAt', sortDirection: 'DESC' });
  });

  it('closes dropdown after selection', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Oldest first'));

    // After selection dropdown should close — listbox should be gone
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    const onChange = vi.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
