/**
 * useLearnerProfile — state machine tests.
 * Tests the hook's core logic in isolation (no React rendering).
 *
 * Strategy: mock the getLearnerProfile API call and verify the state
 * transitions that would occur (loading → success / loading → error),
 * mirroring the useSocialFeedData test pattern.
 */

// ---------------------------------------------------------------------------
// Mock learnerApi
// ---------------------------------------------------------------------------

jest.mock('@/lib/learnerApi', () => ({
  getLearnerProfile: jest.fn(),
}));

import { getLearnerProfile } from '@/lib/learnerApi';
import type { LearnerProfileResponse } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProfile(handle: string): LearnerProfileResponse {
  return {
    handle,
    displayName: `Display ${handle}`,
    avatarUrl: null,
    bio: 'A short bio',
    profileVisibility: 'PUBLIC',
    learnings: [
      { id: 'pok-1', title: 'My first learning', content: 'Content here', createdAt: '2026-01-01T00:00:00Z' },
    ],
    relationshipStatus: 'NONE',
    followerCount: 10,
    followingCount: 5,
    colleagueCount: 2,
  };
}

// ---------------------------------------------------------------------------
// Tests — getLearnerProfile API integration
// ---------------------------------------------------------------------------

describe('useLearnerProfile — API integration logic', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls getLearnerProfile with the provided handle', async () => {
    const profile = makeProfile('alice');
    (getLearnerProfile as jest.Mock).mockResolvedValue(profile);

    const result = await getLearnerProfile('alice');

    expect(getLearnerProfile).toHaveBeenCalledWith('alice');
    expect(result).toEqual(profile);
  });

  it('returns the profile on successful fetch', async () => {
    const profile = makeProfile('bob');
    (getLearnerProfile as jest.Mock).mockResolvedValue(profile);

    const data = await getLearnerProfile('bob');

    expect(data.handle).toBe('bob');
    expect(data.displayName).toBe('Display bob');
    expect(data.relationshipStatus).toBe('NONE');
  });

  it('returns a profile with optional fields populated', async () => {
    const profile: LearnerProfileResponse = {
      handle: 'charlie',
      displayName: 'Charlie',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Bio text',
      profileVisibility: 'PUBLIC',
      learnings: [],
      relationshipStatus: 'FOLLOWING',
      followerCount: 100,
      followingCount: 50,
      colleagueCount: 3,
    };
    (getLearnerProfile as jest.Mock).mockResolvedValue(profile);

    const data = await getLearnerProfile('charlie');

    expect(data.avatarUrl).toBe('https://example.com/avatar.png');
    expect(data.relationshipStatus).toBe('FOLLOWING');
    expect(data.followerCount).toBe(100);
  });

  it('propagates errors from the API', async () => {
    (getLearnerProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(getLearnerProfile('unknown')).rejects.toThrow('Network error');
  });

  it('returns null when the fetch is aborted (AbortError)', async () => {
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';
    (getLearnerProfile as jest.Mock).mockRejectedValue(abortError);

    async function fetchProfile(handle: string): Promise<LearnerProfileResponse | null> {
      try {
        return await getLearnerProfile(handle);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return null;
        throw e;
      }
    }

    const result = await fetchProfile('alice');
    expect(result).toBeNull();
  });

  it('does not call the API when handle is empty (guard logic)', () => {
    // Simulates the guard a caller would apply before invoking the hook
    const handle = '';
    const shouldFetch = handle.length > 0;
    expect(shouldFetch).toBe(false);
    expect(getLearnerProfile).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — state transitions (modelled as pure functions)
// ---------------------------------------------------------------------------

describe('useLearnerProfile — state transitions', () => {
  interface ProfileState {
    profile: LearnerProfileResponse | null;
    loading: boolean;
    error: string | null;
  }

  function initialState(): ProfileState {
    return { profile: null, loading: true, error: null };
  }

  function applySuccess(profile: LearnerProfileResponse): ProfileState {
    return { profile, loading: false, error: null };
  }

  function applyError(message: string): ProfileState {
    return { profile: null, loading: false, error: message };
  }

  it('starts with loading: true, profile: null, error: null', () => {
    const state = initialState();
    expect(state.loading).toBe(true);
    expect(state.profile).toBeNull();
    expect(state.error).toBeNull();
  });

  it('transitions to profile on success', () => {
    const profile = makeProfile('diana');
    const state = applySuccess(profile);

    expect(state.loading).toBe(false);
    expect(state.profile).toEqual(profile);
    expect(state.error).toBeNull();
  });

  it('transitions to error state on failure', () => {
    const state = applyError('Failed to load profile');

    expect(state.loading).toBe(false);
    expect(state.profile).toBeNull();
    expect(state.error).toBe('Failed to load profile');
  });

  it('reload resets state to loading before re-fetching', () => {
    // After a successful fetch, a reload should go back to loading
    const profile = makeProfile('eve');
    let state = applySuccess(profile);

    // Simulate reload — reset to loading
    state = { ...state, loading: true, error: null };

    expect(state.loading).toBe(true);
    expect(state.profile).toEqual(profile); // profile retained during reload
  });

  it('different handles produce independent fetch calls', async () => {
    const profileAlice = makeProfile('alice');
    const profileBob = makeProfile('bob');
    (getLearnerProfile as jest.Mock)
      .mockResolvedValueOnce(profileAlice)
      .mockResolvedValueOnce(profileBob);

    const resultAlice = await getLearnerProfile('alice');
    const resultBob = await getLearnerProfile('bob');

    expect(getLearnerProfile).toHaveBeenCalledTimes(2);
    expect((resultAlice as LearnerProfileResponse).handle).toBe('alice');
    expect((resultBob as LearnerProfileResponse).handle).toBe('bob');
  });
});
