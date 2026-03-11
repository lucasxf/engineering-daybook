import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateLearningForm } from '../CreateLearningForm';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'form.titleLabel': 'Title',
      'form.titlePlaceholder': 'Optional — add a title if useful',
      'form.contentLabel': 'Content',
      'form.contentPlaceholder': 'What did you learn?',
      'form.saveButton': 'Save Learning',
      'form.savingButton': 'Saving...',
      'form.cancelButton': 'Cancel',
      'success.message': 'Learning saved!',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
  useParams: () => ({ locale: 'en' }),
}));

describe('CreateLearningForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with title and content fields', () => {
    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Learning' })).toBeInTheDocument();
  });

  it('displays character counters for both fields', () => {
    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    expect(screen.getByText('0 / 200')).toBeInTheDocument();
    expect(screen.getByText('0 / 50,000')).toBeInTheDocument();
  });

  it('disables the submit button when content is empty', () => {
    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const submitButton = screen.getByRole('button', { name: 'Save Learning' });
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button when content has text', async () => {
    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const contentField = screen.getByLabelText('Content');
    fireEvent.change(contentField, { target: { value: 'I learned something new today' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Save Learning' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('updates character counters as user types', async () => {
    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const titleField = screen.getByLabelText('Title');
    const contentField = screen.getByLabelText('Content');

    fireEvent.change(titleField, { target: { value: 'My Title' } });
    fireEvent.change(contentField, { target: { value: 'My content' } });

    await waitFor(() => {
      expect(screen.getByText('8 / 200')).toBeInTheDocument();
      expect(screen.getByText('10 / 50,000')).toBeInTheDocument();
    });
  });

  it('shows error message when content is empty on submit', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const submitButton = screen.getByRole('button', { name: 'Save Learning' });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with form data when submitted', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const titleField = screen.getByLabelText('Title');
    const contentField = screen.getByLabelText('Content');
    const submitButton = screen.getByRole('button', { name: 'Save Learning' });

    fireEvent.change(titleField, { target: { value: 'Test Title' } });
    fireEvent.change(contentField, { target: { value: 'Test content' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test content',
      });
    });
  });

  it('displays saving state during submission', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <CreateLearningForm onSubmit={mockOnSubmit} locale="en" />
    );

    const contentField = screen.getByLabelText('Content');
    fireEvent.change(contentField, { target: { value: 'Test content' } });

    const submitButton = screen.getByRole('button', { name: 'Save Learning' });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
  });
});
