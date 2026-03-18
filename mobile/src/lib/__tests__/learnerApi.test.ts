jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/lib/api';
import {
  getLearnerProfile,
  followLearner,
  unfollowLearner,
  searchLearners,
  shareLearning,
  unshareLearning,
  visibilityOptionsUpTo,
  type LearnerProfileResponse,
  type LearnerSearchPage,
  type PokShare,
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
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice', {}, undefined);
    expect(result).toEqual(profile);
  });

  it('forwards the AbortSignal to apiFetch', async () => {
    mockApiFetch.mockResolvedValueOnce({} as LearnerProfileResponse);
    const signal = new AbortController().signal;

    await getLearnerProfile('alice', signal);

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice', {}, signal);
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Not found'));

    await expect(getLearnerProfile('unknown')).rejects.toThrow('Not found');
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/unknown', {}, undefined);
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
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'POST' }, undefined);
  });

  it('forwards the AbortSignal to apiFetch', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);
    const signal = new AbortController().signal;

    await followLearner('alice', signal);

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'POST' }, signal);
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
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'DELETE' }, undefined);
  });

  it('forwards the AbortSignal to apiFetch', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);
    const signal = new AbortController().signal;

    await unfollowLearner('alice', signal);

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/alice/follow', { method: 'DELETE' }, signal);
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
    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=alice', {}, undefined);
    expect(result).toEqual(page);
  });

  it('includes page and size when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('alice', { page: 2, size: 10 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=alice&page=2&size=10', {}, undefined);
  });

  it('includes only page when size is omitted', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('bob', { page: 1 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=bob&page=1', {}, undefined);
  });

  it('includes only size when page is omitted', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('bob', { size: 5 });

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=bob&size=5', {}, undefined);
  });

  it('URL-encodes special characters in the query', async () => {
    mockApiFetch.mockResolvedValueOnce(page);

    await searchLearners('hello world');

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=hello+world', {}, undefined);
  });

  it('forwards the AbortSignal to apiFetch', async () => {
    mockApiFetch.mockResolvedValueOnce(page);
    const signal = new AbortController().signal;

    await searchLearners('alice', undefined, signal);

    expect(mockApiFetch).toHaveBeenCalledWith('/learners/search?q=alice', {}, signal);
  });

  it('propagates errors thrown by apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Server error'));

    await expect(searchLearners('fail')).rejects.toThrow('Server error');
  });
});

// ---------------------------------------------------------------------------
// shareLearning
// ---------------------------------------------------------------------------

describe('shareLearning', () => {
  const pokShare: PokShare = {
    type: 'shared',
    id: 'share-1',
    originalPokId: 'pok-1',
    originalPok: null,
    sharedByHandle: 'alice',
    note: null,
    visibility: 'PUBLIC',
    createdAt: '2026-03-17T00:00:00Z',
    originalAuthorHandle: 'bob',
    originalAuthorDisplayName: 'Bob',
    originalAuthorAvatarUrl: null,
  };

  it('POSTs to /poks/{pokId}/share and returns a PokShare', async () => {
    mockApiFetch.mockResolvedValueOnce(pokShare);

    const result = await shareLearning('pok-1', { visibility: 'PUBLIC' });

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/poks/pok-1/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'PUBLIC' }),
    });
    expect(result).toEqual(pokShare);
  });

  it('includes optional note in the request body', async () => {
    mockApiFetch.mockResolvedValueOnce({ ...pokShare, note: 'my note', visibility: 'FOLLOWERS_ONLY' });

    await shareLearning('pok-1', { note: 'my note', visibility: 'FOLLOWERS_ONLY' });

    expect(mockApiFetch).toHaveBeenCalledWith('/poks/pok-1/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'my note', visibility: 'FOLLOWERS_ONLY' }),
    });
  });

  it('rejects on 409 Conflict', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Conflict'));

    await expect(shareLearning('pok-1', { visibility: 'PUBLIC' })).rejects.toThrow('Conflict');
  });

  it('rejects on 400 Bad Request', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Bad Request'));

    await expect(shareLearning('pok-1', { visibility: 'PUBLIC' })).rejects.toThrow('Bad Request');
  });
});

// ---------------------------------------------------------------------------
// unshareLearning
// ---------------------------------------------------------------------------

describe('unshareLearning', () => {
  it('sends DELETE to /poks/shared/{shareId} and resolves void', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);

    await unshareLearning('share-1');

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/poks/shared/share-1', { method: 'DELETE' });
  });

  it('rejects on 403 Forbidden', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(unshareLearning('share-1')).rejects.toThrow('Forbidden');
  });

  it('rejects on 404 Not Found', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Not Found'));

    await expect(unshareLearning('share-1')).rejects.toThrow('Not Found');
  });
});

// ---------------------------------------------------------------------------
// visibilityOptionsUpTo
// ---------------------------------------------------------------------------

describe('visibilityOptionsUpTo', () => {
  it('returns only PRIVATE when max is PRIVATE', () => {
    expect(visibilityOptionsUpTo('PRIVATE')).toEqual(['PRIVATE']);
  });

  it('returns PRIVATE and COLLEAGUES_ONLY when max is COLLEAGUES_ONLY', () => {
    expect(visibilityOptionsUpTo('COLLEAGUES_ONLY')).toEqual(['PRIVATE', 'COLLEAGUES_ONLY']);
  });

  it('returns PRIVATE, COLLEAGUES_ONLY, and FOLLOWERS_ONLY when max is FOLLOWERS_ONLY', () => {
    expect(visibilityOptionsUpTo('FOLLOWERS_ONLY')).toEqual([
      'PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY',
    ]);
  });

  it('returns all four tiers when max is PUBLIC', () => {
    expect(visibilityOptionsUpTo('PUBLIC')).toEqual([
      'PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY', 'PUBLIC',
    ]);
  });
});
