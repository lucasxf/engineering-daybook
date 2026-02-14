import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeletePokButton } from '@/components/poks/DeletePokButton';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  poks: {
    delete: {
      button: 'Delete',
      confirmTitle: 'Delete POK?',
      confirmMessage: 'Are you sure you want to delete this POK? It will be hidden from your list.',
      confirmButton: 'Confirm',
      cancelButton: 'Cancel',
    },
  },
};

describe('DeletePokButton', () => {
  const mockOnDelete = jest.fn();

  const renderButton = (props = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <DeletePokButton onDelete={mockOnDelete} {...props} />
      </NextIntlClientProvider>
    );
  };

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('renders delete button', () => {
    renderButton();

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows confirmation dialog when clicked', async () => {
    const user = userEvent.setup();
    renderButton();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Delete POK?')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    });
  });

  it('calls onDelete when confirmed', async () => {
    const user = userEvent.setup();
    renderButton();

    // Click delete button
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Click confirm in dialog
    await waitFor(() => screen.getByRole('button', { name: 'Confirm' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onDelete when cancelled', async () => {
    const user = userEvent.setup();
    renderButton();

    // Click delete button
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Click cancel in dialog
    await waitFor(() => screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('closes dialog when cancelled', async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => screen.getByText('Delete POK?'));

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText('Delete POK?')).not.toBeInTheDocument();
    });
  });
});
