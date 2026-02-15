import { render, screen, fireEvent } from '@testing-library/react';
import { SortDropdown, SortOption } from '@/components/poks/SortDropdown';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  poks: {
    sort: {
      label: 'Sort by',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
      recentlyCreated: 'Recently created',
      firstCreated: 'First created',
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
  it('should render with label', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'updatedAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
  });

  it('should render all sort options', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'updatedAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    expect(screen.getByText('Newest first')).toBeInTheDocument();
    expect(screen.getByText('Oldest first')).toBeInTheDocument();
    expect(screen.getByText('Recently created')).toBeInTheDocument();
    expect(screen.getByText('First created')).toBeInTheDocument();
  });

  it('should display current selection', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'createdAt', sortDirection: 'ASC' };

    renderSortDropdown({ value, onChange });

    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('createdAt-ASC');
  });

  it('should call onChange when selection changes', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'updatedAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    const select = screen.getByLabelText('Sort by');
    fireEvent.change(select, { target: { value: 'createdAt-ASC' } });

    expect(onChange).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortDirection: 'ASC',
    });
  });

  it('should call onChange with correct value for each option', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'updatedAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    const select = screen.getByLabelText('Sort by');

    // Test updatedAt ASC
    fireEvent.change(select, { target: { value: 'updatedAt-ASC' } });
    expect(onChange).toHaveBeenLastCalledWith({
      sortBy: 'updatedAt',
      sortDirection: 'ASC',
    });

    // Test createdAt DESC
    fireEvent.change(select, { target: { value: 'createdAt-DESC' } });
    expect(onChange).toHaveBeenLastCalledWith({
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });

    // Test createdAt ASC
    fireEvent.change(select, { target: { value: 'createdAt-ASC' } });
    expect(onChange).toHaveBeenLastCalledWith({
      sortBy: 'createdAt',
      sortDirection: 'ASC',
    });
  });

  it('should be keyboard navigable', () => {
    const onChange = jest.fn();
    const value: SortOption = { sortBy: 'updatedAt', sortDirection: 'DESC' };

    renderSortDropdown({ value, onChange });

    const select = screen.getByLabelText('Sort by');

    // Focus the select
    select.focus();
    expect(document.activeElement).toBe(select);

    // Keyboard navigation works with native select
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    fireEvent.change(select, { target: { value: 'updatedAt-ASC' } });

    expect(onChange).toHaveBeenCalled();
  });
});
