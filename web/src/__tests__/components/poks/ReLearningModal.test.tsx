import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import { ReLearningModal } from '@/components/poks/ReLearningModal';
import type { Pok, PokShare } from '@/lib/pokApi';

// Mock pokApi
const mockShare = vi.hoisted(() => vi.fn());
vi.mock('@/lib/pokApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokApi')>();
  return {
    ...actual,
    pokApi: {
      ...actual.pokApi,
      share: mockShare,
    },
  };
});

const messages = {
  poks: {
    share: {
      modalTitle: 'Re-learn this learning',
      noteLabel: 'Your note',
      notePlaceholder: 'Why did this learning resonate with you?',
      noteHint: 'Add context or personal reflection. Max 500 characters.',
      visibilityLabel: 'Visibility',
      submitButton: 'Re-learn',
      submitting: 'Saving...',
      success: 'Re-learning saved',
      cancelButton: 'Cancel',
      errors: {
        selfShare: 'You cannot re-learn your own learning',
        duplicate: 'You have already re-learned this learning',
        notPublic: 'Only public learnings can be re-learned',
        notFound: 'Learning not found',
        unexpected: 'Something went wrong. Please try again.',
      },
    },
    visibility: {
      private: 'Private',
      public: 'Public',
      followersOnly: 'Followers only',
      colleaguesOnly: 'Colleagues only',
      pickerLabel: 'Visibility',
      publicWarning: 'Public learnings cannot be made private.',
    },
  },
};

const basePok: Pok = {
  id: 'pok-123',
  userId: 'user-bob',
  title: "Bob's Learning",
  content: 'Some interesting content here',
  visibility: 'PUBLIC',
  deletedAt: null,
  createdAt: '2026-03-07T10:00:00Z',
  updatedAt: '2026-03-07T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
};

const mockShareResponse: PokShare = {
  type: 'shared',
  id: 'share-456',
  originalPokId: 'pok-123',
  originalPok: basePok,
  sharedByHandle: 'alice',
  note: null,
  visibility: 'PUBLIC',
  createdAt: '2026-03-07T12:00:00Z',
};

describe('ReLearningModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const renderModal = (pok = basePok) =>
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ReLearningModal pok={pok} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </NextIntlClientProvider>
    );

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSuccess.mockClear();
    mockShare.mockClear();
  });

  it('renders modal with title and form fields', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Re-learn this learning')).toBeInTheDocument();
    expect(screen.getByLabelText('Your note')).toBeInTheDocument();
    expect(screen.getByLabelText('Visibility')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Re-learn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows pok title in modal header when present', () => {
    renderModal();

    expect(screen.getByText(/Bob's Learning/)).toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape pressed', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits with note and calls onSuccess on success', async () => {
    const user = userEvent.setup();
    mockShare.mockResolvedValue({ ...mockShareResponse, note: 'Great insight' });

    renderModal();

    await user.type(screen.getByLabelText('Your note'), 'Great insight');
    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith('pok-123', {
        note: 'Great insight',
        visibility: 'PUBLIC',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'shared', id: 'share-456' })
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('submits with null note when note field is empty', async () => {
    const user = userEvent.setup();
    mockShare.mockResolvedValue(mockShareResponse);

    renderModal();

    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith('pok-123', {
        note: null,
        visibility: 'PUBLIC',
      });
    });
  });

  it('shows duplicate error on 409 response', async () => {
    const user = userEvent.setup();
    mockShare.mockRejectedValue({ status: 409 });

    renderModal();

    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'You have already re-learned this learning'
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows selfShare error on 400 response', async () => {
    const user = userEvent.setup();
    mockShare.mockRejectedValue({ status: 400, message: 'You cannot re-learn your own learning' });

    renderModal();

    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'You cannot re-learn your own learning'
      );
    });
  });

  it('shows unexpected error on unknown failure', async () => {
    const user = userEvent.setup();
    mockShare.mockRejectedValue(new Error('Network error'));

    renderModal();

    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong. Please try again.'
      );
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveShare!: (v: PokShare) => void;
    mockShare.mockReturnValue(new Promise<PokShare>((resolve) => { resolveShare = resolve; }));

    renderModal();

    await user.click(screen.getByRole('button', { name: 'Re-learn' }));

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();

    resolveShare(mockShareResponse);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
