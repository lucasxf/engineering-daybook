import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import { QuickEntry } from '@/components/poks/QuickEntry';
import { pokApi, type Pok } from '@/lib/pokApi';

vi.mock('@/lib/pokApi', () => ({
  pokApi: { create: vi.fn() },
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

const messages = {
  poks: {
    form: {
      titleLabel: 'Title',
      titlePlaceholder: 'Optional - give your learning a title',
      createButton: 'Save learning',
    },
    quickEntry: {
      placeholder: 'What did you learn?',
      hint: 'Ctrl+Enter to save',
      saving: 'Saving...',
    },
    errors: {
      unexpected: 'Something went wrong. Please try again.',
    },
  },
};

const mockCreate = vi.mocked(pokApi.create);

const makePok = (overrides?: Partial<Pok>): Pok => ({
  id: 'pok-1',
  userId: 'user-1',
  title: null,
  content: 'Some content',
  deletedAt: null,
  createdAt: '2026-02-25T10:00:00Z',
  updatedAt: '2026-02-25T10:00:00Z',
  ...overrides,
});

const renderQuickEntry = (onSaved = vi.fn()) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QuickEntry onSaved={onSaved} />
    </NextIntlClientProvider>
  );

describe('QuickEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title input and content textarea', () => {
    renderQuickEntry();

    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /what did you learn/i })).toBeInTheDocument();
  });

  it('renders a save button', () => {
    renderQuickEntry();

    expect(screen.getByRole('button', { name: /save learning/i })).toBeInTheDocument();
  });

  it('save button is disabled when content is empty', () => {
    renderQuickEntry();

    expect(screen.getByRole('button', { name: /save learning/i })).toBeDisabled();
  });

  it('save button is enabled when content has text', async () => {
    const user = userEvent.setup();
    renderQuickEntry();

    await user.type(screen.getByRole('textbox', { name: /what did you learn/i }), 'Learned something');

    expect(screen.getByRole('button', { name: /save learning/i })).toBeEnabled();
  });

  it('calls pokApi.create with content only when no title is provided', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mockCreate.mockResolvedValue(makePok());
    renderQuickEntry(onSaved);

    await user.type(screen.getByRole('textbox', { name: /what did you learn/i }), 'Learned something');
    await user.click(screen.getByRole('button', { name: /save learning/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ title: null, content: 'Learned something' });
    });
  });

  it('calls pokApi.create with title and content when both are provided', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mockCreate.mockResolvedValue(makePok({ title: 'My Title' }));
    renderQuickEntry(onSaved);

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'My Title');
    await user.type(screen.getByRole('textbox', { name: /what did you learn/i }), 'Learned something');
    await user.click(screen.getByRole('button', { name: /save learning/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ title: 'My Title', content: 'Learned something' });
    });
  });

  it('clears both fields and calls onSaved after successful save', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const savedPok = makePok({ title: 'T', content: 'C' });
    mockCreate.mockResolvedValue(savedPok);
    renderQuickEntry(onSaved);

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'T');
    await user.type(screen.getByRole('textbox', { name: /what did you learn/i }), 'C');
    await user.click(screen.getByRole('button', { name: /save learning/i }));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(savedPok);
    });

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /what did you learn/i })).toHaveValue('');
  });

  it('shows an error when pokApi.create fails', async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValue(new Error('Server error'));
    renderQuickEntry();

    await user.type(screen.getByRole('textbox', { name: /what did you learn/i }), 'Something');
    await user.click(screen.getByRole('button', { name: /save learning/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('submits on Ctrl+Enter in the textarea', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mockCreate.mockResolvedValue(makePok());
    renderQuickEntry(onSaved);

    const textarea = screen.getByRole('textbox', { name: /what did you learn/i });
    await user.type(textarea, 'Learned something');
    await user.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
