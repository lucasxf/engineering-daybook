import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FollowButton } from '../FollowButton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params?.handle) return `Unfollow @${params.handle}`;
    const labels: Record<string, string> = {
      'social.follow': 'Follow',
      'social.following': 'Following',
      'social.followBack': 'Follow back',
      'social.colleague': 'Colleague',
      'social.unfollow': 'Unfollow',
    };
    return labels[key] ?? key;
  },
}));

const mockFollowLearner = vi.fn().mockResolvedValue(undefined);
const mockUnfollowLearner = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/learnerApi', () => ({
  followLearner: (...args: unknown[]) => mockFollowLearner(...args),
  unfollowLearner: (...args: unknown[]) => mockUnfollowLearner(...args),
}));

describe('FollowButton', () => {
  beforeEach(() => {
    mockFollowLearner.mockClear();
    mockUnfollowLearner.mockClear();
  });

  it('shows "Follow" when relationship is NONE', () => {
    render(
      <FollowButton handle="alice" relationshipStatus="NONE" />
    );
    expect(screen.getByRole('button', { name: /^follow$/i })).toBeInTheDocument();
  });

  it('shows "Following" when relationship is FOLLOWING', () => {
    render(
      <FollowButton handle="alice" relationshipStatus="FOLLOWING" />
    );
    // aria-label is "Unfollow @alice" for accessibility; check visible text
    expect(screen.getByText(/following/i)).toBeInTheDocument();
  });

  it('shows "Follow back" when relationship is FOLLOWED_BY', () => {
    render(
      <FollowButton handle="alice" relationshipStatus="FOLLOWED_BY" />
    );
    expect(screen.getByText(/follow back/i)).toBeInTheDocument();
  });

  it('shows "Colleague" when relationship is COLLEAGUE', () => {
    render(
      <FollowButton handle="alice" relationshipStatus="COLLEAGUE" />
    );
    expect(screen.getByText(/colleague/i)).toBeInTheDocument();
  });

  it('calls followLearner and invokes onRelationshipChange on follow click', async () => {
    const onChange = vi.fn();
    render(
      <FollowButton handle="alice" relationshipStatus="NONE" onRelationshipChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^follow$/i }));

    await waitFor(() => {
      expect(mockFollowLearner).toHaveBeenCalledWith('alice');
      expect(onChange).toHaveBeenCalledWith('FOLLOWING');
    });
  });

  it('calls unfollowLearner and invokes onRelationshipChange on unfollow click', async () => {
    const onChange = vi.fn();
    render(
      <FollowButton handle="alice" relationshipStatus="FOLLOWING" onRelationshipChange={onChange} />
    );
    // Button is accessible as "Unfollow @alice" via aria-label
    fireEvent.click(screen.getByRole('button', { name: /unfollow @alice/i }));

    await waitFor(() => {
      expect(mockUnfollowLearner).toHaveBeenCalledWith('alice');
      expect(onChange).toHaveBeenCalledWith('NONE');
    });
  });

  it('transitions FOLLOWED_BY → COLLEAGUE on follow', async () => {
    const onChange = vi.fn();
    render(
      <FollowButton handle="alice" relationshipStatus="FOLLOWED_BY" onRelationshipChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^follow back$/i }));

    await waitFor(() => {
      expect(mockFollowLearner).toHaveBeenCalledWith('alice');
      expect(onChange).toHaveBeenCalledWith('COLLEAGUE');
    });
  });

  it('transitions COLLEAGUE → FOLLOWED_BY on unfollow', async () => {
    const onChange = vi.fn();
    render(
      <FollowButton handle="alice" relationshipStatus="COLLEAGUE" onRelationshipChange={onChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /unfollow @alice/i }));

    await waitFor(() => {
      expect(mockUnfollowLearner).toHaveBeenCalledWith('alice');
      expect(onChange).toHaveBeenCalledWith('FOLLOWED_BY');
    });
  });

  it('shows error alert when follow fails', async () => {
    mockFollowLearner.mockRejectedValueOnce(new Error('Network error'));
    render(<FollowButton handle="alice" relationshipStatus="NONE" />);
    fireEvent.click(screen.getByRole('button', { name: /^follow$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows error alert when unfollow fails', async () => {
    mockUnfollowLearner.mockRejectedValueOnce(new Error('Network error'));
    render(<FollowButton handle="alice" relationshipStatus="FOLLOWING" />);
    fireEvent.click(screen.getByRole('button', { name: /unfollow @alice/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('clears error on next successful click', async () => {
    mockFollowLearner.mockRejectedValueOnce(new Error('Network error'));
    const onChange = vi.fn();
    render(<FollowButton handle="alice" relationshipStatus="NONE" onRelationshipChange={onChange} />);
    const button = screen.getByRole('button', { name: /^follow$/i });
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    mockFollowLearner.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: /^follow$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith('FOLLOWING');
    });
  });
});
