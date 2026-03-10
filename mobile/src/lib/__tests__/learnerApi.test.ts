jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/lib/api';
import {
  getLearnerProfile,
  followLearner,
  unfollowLearner,
  searchLearners,
  type LearnerProfileResponse,
  type LearnerSearchPage,
} from '@/lib/learnerApi';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getLearnerProfile
// ---------------------------------------------------------------------------

describe('getLearnerProfile', () => {
  it('resolves with the learner profile on success', async () => {
    const profile: LearnerProfileResponse = {
      handle: 'alice',
      displayName: 'Alice',
      avatarUrl: null,
      bio: 'Software engineer',
      profileVisibility: 'PUBLIC',
      learnings: [{ id: '1', title: 'First learning', content: 'content', createdAt: '2026-01-01T00:00:00Z' }],
      relationshipStatus: 'FOLLOWING',
      followerCount: 10,
      followingCount: 5,
      colleagueCount: 2,
    };
    mockApiFetch.mockResolvedValueOnce(profile);

    const result = await getLearnerProfile('alice');

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice');
    expect(result).toEqual(profile);
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Not found'));

    await expect(getLearnerProfile('unknown')).rejects.toThrow('Not found');
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/unknown');
  });
});

// ---------------------------------------------------------------------------
// followLearner
// ---------------------------------------------------------------------------

describe('followLearner', () => {
  it('calls POST /learners/{handle}/follow', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);

    await followLearner('alice');

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'POST' });
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(followLearner('alice')).rejects.toThrow('Forbidden');
  });
});

// ---------------------------------------------------------------------------
// unfollowLearner
// ---------------------------------------------------------------------------

describe('unfollowLearner', () => {
  it('calls DELETE /learners/{handle}/follow', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);

    await unfollowLearner('alice');

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'DELETE' });
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Not following'));

    await expect(unfollowLearner('alice')).rejects.toThrow('Not following');
  });
});

// ---------------------------------------------------------------------------
// searchLearners
// ---------------------------------------------------------------------------

describe('searchLearners', () => {
  const page: LearnerSearchPage = {
    content: [{ handle: 'alice', displayName: 'Alice', avatarUrl: null, bio: null, relationship: 'NONE' }],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20,
  };

  it('builds URL with just the query parameter when no pagination params are provided', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    const result = await searchLearners('alice');

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=alice');
    expect(result).toEqual(page);
  });

  it('includes page and size when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('alice', { page: 2, size: 10 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=alice&page=2&size=10');
  });

  it('includes only page when size is omitted', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('bob', { page: 1 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=bob&page=1');
  });

  it('includes only size when page is omitted', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('bob', { size: 5 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=bob&size=5');
  });

  it('URL-encodes special characters in the query', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('hello world');

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=hello+world');
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Server error'));

    await expect(searchLearners('fail')).rejects.toThrow('Server error');
  });
});
