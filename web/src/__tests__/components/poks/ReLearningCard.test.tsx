import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import { ReLearningCard } from '@/components/poks/ReLearningCard';
import type { PokShare } from '@/lib/pokApi';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock pokApi
const mockUnshare = vi.hoisted(() => vi.fn());
vi.mock('@/lib/pokApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokApi')>();
  return {
    ...actual,
    pokApi: {
      ...actual.pokApi,
      unshare: mockUnshare,
    },
  };
});

const messages = {
  poks: {
    share: {
      button: 'Re-learn',
      remove: 'Remove re-learning',
      removeConfirmTitle: 'Remove re-learning?',
      removeConfirmMessage: 'This will remove your re-learning.',
      removeConfirmButton: 'Remove',
      cancelButton: 'Cancel',
      removing: 'Removing...',
      removeSuccess: 'Re-learning removed',
    },
  },
};

const originalPok = {
  type: 'owned' as const,
  id: 'pok-123',
  userId: 'user-bob',
  title: "Bob's Learning",
  content: 'Some interesting content',
  visibility: 'PUBLIC' as const,
  deletedAt: null,
  createdAt: '2026-03-07T10:00:00Z',
  updatedAt: '2026-03-07T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
};

const baseShare: PokShare = {
  type: 'shared',
  id: 'share-456',
  originalPokId: 'pok-123',
  originalPok,
  sharedByHandle: 'alice',
  note: null,
  visibility: 'PUBLIC',
  createdAt: '2026-03-07T12:00:00Z',
};

describe('ReLearningCard', () => {
  const mockOnRemoved = vi.fn();

  const renderCard = (share = baseShare, isOwner = false) =>
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ReLearningCard share={share} isOwner={isOwner} onRemoved={mockOnRemoved} />
      </NextIntlClientProvider>
    );

  beforeEach(() => {
    mockOnRemoved.mockClear();
    mockUnshare.mockClear();
  });

  it('renders original pok title as header', () => {
    renderCard();

    expect(screen.getByText("Bob's Learning")).toBeInTheDocument();
  });

  it('renders content preview', () => {
    renderCard();

    expect(screen.getByText('Some interesting content')).toBeInTheDocument();
  });

  it('renders sharer handle attribution', () => {
    renderCard();

    expect(screen.getByText(/@alice/)).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    const { container } = renderCard();

    // <time> has no standard ARIA role in most jsdom versions; query directly
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('dateTime', '2026-03-07T12:00:00Z');
  });

  it('renders note as blockquote when present', () => {
    const shareWithNote = { ...baseShare, note: 'Great insight!' };
    renderCard(shareWithNote);

    const blockquote = screen.getByText('Great insight!').closest('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('does not render blockquote when note is null', () => {
    const { container } = renderCard(baseShare);

    expect(container.querySelector('blockquote')).not.toBeInTheDocument();
  });

  it('links to original pok detail page', () => {
    renderCard();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/poks/pok-123');
  });

  it('does not show remove button when not owner', () => {
    renderCard(baseShare, false);

    expect(screen.queryByRole('button', { name: 'Remove re-learning' })).not.toBeInTheDocument();
  });

  it('shows remove button when owner', () => {
    renderCard(baseShare, true);

    expect(screen.getByRole('button', { name: 'Remove re-learning' })).toBeInTheDocument();
  });

  it('opens confirmation dialog when remove clicked', async () => {
    const user = userEvent.setup();
    renderCard(baseShare, true);

    await user.click(screen.getByRole('button', { name: 'Remove re-learning' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Remove re-learning?')).toBeInTheDocument();
    });
  });

  it('calls unshare and onRemoved when confirm clicked', async () => {
    const user = userEvent.setup();
    mockUnshare.mockResolvedValue(undefined);
    renderCard(baseShare, true);

    await user.click(screen.getByRole('button', { name: 'Remove re-learning' }));
    await waitFor(() => screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(mockUnshare).toHaveBeenCalledWith('share-456');
      expect(mockOnRemoved).toHaveBeenCalledTimes(1);
    });
  });

  it('closes dialog without calling unshare when cancel clicked', async () => {
    const user = userEvent.setup();
    renderCard(baseShare, true);

    await user.click(screen.getByRole('button', { name: 'Remove re-learning' }));
    await waitFor(() => screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockUnshare).not.toHaveBeenCalled();
  });

  it('closes dialog on Escape key', async () => {
    const user = userEvent.setup();
    renderCard(baseShare, true);

    await user.click(screen.getByRole('button', { name: 'Remove re-learning' }));
    await waitFor(() => screen.getByRole('dialog'));

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('uses content as header when title is absent', () => {
    const shareNoTitle = {
      ...baseShare,
      originalPok: { ...originalPok, title: null },
    };
    renderCard(shareNoTitle);

    // Content preview should be truncated to 50 chars
    expect(screen.getAllByText(/Some interesting content/).length).toBeGreaterThan(0);
  });
});
