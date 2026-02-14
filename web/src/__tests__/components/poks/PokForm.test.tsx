import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokForm } from '@/components/poks/PokForm';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';

// Mock translations
const messages = {
  poks: {
    form: {
      titleLabel: 'Title',
      titlePlaceholder: 'Optional',
      contentLabel: 'Content',
      contentPlaceholder: 'What did you learn today?',
      createButton: 'Create POK',
      updateButton: 'Update POK',
      submitting: 'Saving...',
    },
    errors: {
      titleTooLong: 'Title must be 200 characters or less',
      contentRequired: 'Content is required and must not be blank',
      contentTooLong: 'Content must be between 1 and 50,000 characters',
    },
  },
};

describe('PokForm', () => {
  const mockOnSubmit = vi.fn();

  const renderForm = (props = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PokForm onSubmit={mockOnSubmit} {...props} />
      </NextIntlClientProvider>
    );
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders title and content fields with correct labels', () => {
    renderForm();

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('shows "Optional" placeholder for title field', () => {
    renderForm();

    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toHaveAttribute('placeholder', 'Optional');
  });

  it('shows submit button with correct text for create mode', () => {
    renderForm({ mode: 'create' });

    expect(screen.getByRole('button', { name: 'Create POK' })).toBeInTheDocument();
  });

  it('shows submit button with correct text for edit mode', () => {
    renderForm({ mode: 'edit' });

    expect(screen.getByRole('button', { name: 'Update POK' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when content is provided', async () => {
    const user = userEvent.setup();
    renderForm();

    const contentInput = screen.getByLabelText('Content');
    await user.type(contentInput, 'Test content');

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '',
        content: 'Test content',
      });
    });
  });

  it('calls onSubmit with title and content when both provided', async () => {
    const user = userEvent.setup();
    renderForm();

    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');

    await user.type(titleInput, 'Test Title');
    await user.type(contentInput, 'Test content');

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test content',
      });
    });
  });

  it('shows validation error when content is empty', async () => {
    const user = userEvent.setup();
    renderForm();

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Content is required and must not be blank')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when title exceeds 200 characters', async () => {
    const user = userEvent.setup();
    renderForm();

    const titleInput = screen.getByLabelText('Title');
    const longTitle = 'a'.repeat(201);

    await user.type(titleInput, longTitle);
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Title must be 200 characters or less')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pre-populates fields with initialData when provided', () => {
    const initialData = {
      title: 'Existing Title',
      content: 'Existing content',
    };

    renderForm({ initialData });

    expect(screen.getByLabelText('Title')).toHaveValue('Existing Title');
    expect(screen.getByLabelText('Content')).toHaveValue('Existing content');
  });

  it('allows submitting with content only (no title)', async () => {
    const user = userEvent.setup();
    renderForm();

    const contentInput = screen.getByLabelText('Content');
    await user.type(contentInput, 'Content without title');

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '',
        content: 'Content without title',
      });
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderForm();

    const contentInput = screen.getByLabelText('Content');
    await user.type(contentInput, 'Test content');

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
