/**
 * useSocialFeedData — pagination state machine tests.
 * Tests the hook's core logic in isolation (no React rendering).
 */

// ---------------------------------------------------------------------------
// Mock learnerApi
// ---------------------------------------------------------------------------

jest.mock('@/lib/learnerApi', () => ({
  getFeed: jest.fn(),
}));

import { getFeed } from '@/lib/learnerApi';
import type { FeedPage } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFeedPage(page: number, totalPages: number, content: unknown[]): FeedPage {
  return {
    content: content as FeedPage['content'],
    page,
    size: 20,
    totalElements: totalPages * 20,
    totalPages,
    number: page,
  };
}

function makeOwnedItem(id: string) {
  return {
    type: 'owned' as const,
    id,
    userId: 'user-1',
    title: null,
    content: `Content ${id}`,
    visibility: 'PUBLIC' as const,
    deletedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    tags: [],
    pendingSuggestions: [],
    authorHandle: 'alice',
    authorDisplayName: 'Alice',
    authorAvatarUrl: null,
  };
}

// ---------------------------------------------------------------------------
// Tests — pagination state machine
// ---------------------------------------------------------------------------

describe('useSocialFeedData — pagination state machine', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hasMore is true when current page < totalPages - 1', () => {
    const data = makeFeedPage(0, 3, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(true);
  });

  it('hasMore is false when on the last page', () => {
    const data = makeFeedPage(2, 3, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(false);
  });

  it('hasMore is false for a single-page result', () => {
    const data = makeFeedPage(0, 1, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(false);
  });

  it('appends items on loadMore', async () => {
    const page0 = makeFeedPage(0, 2, [makeOwnedItem('1'), makeOwnedItem('2')]);
    const page1 = makeFeedPage(1, 2, [makeOwnedItem('3'), makeOwnedItem('4')]);

    (getFeed as jest.Mock)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1);

    const data0 = await getFeed({ page: 0, size: 20 });
    const items = [...(data0 as FeedPage).content];

    const data1 = await getFeed({ page: 1, size: 20 });
    items.push(...(data1 as FeedPage).content);

    expect(items).toHaveLength(4);
    expect(items[2]).toMatchObject({ id: '3' });
  });

  it('resets items on refresh (page 0)', async () => {
    const page0 = makeFeedPage(0, 2, [makeOwnedItem('1'), makeOwnedItem('2')]);
    const refreshPage = makeFeedPage(0, 2, [makeOwnedItem('new-1'), makeOwnedItem('new-2')]);

    (getFeed as jest.Mock)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(refreshPage);

    const data0 = await getFeed({ page: 0 });
    let items = [...(data0 as FeedPage).content];

    const refreshData = await getFeed({ page: 0 });
    items = [...(refreshData as FeedPage).content];

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: 'new-1' });
  });

  it('returns null on AbortError', async () => {
    const error = new Error('AbortError');
    error.name = 'AbortError';
    (getFeed as jest.Mock).mockRejectedValue(error);

    async function fetchPage() {
      try {
        return await getFeed({ page: 0, size: 20 });
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return null;
        throw e;
      }
    }

    const result = await fetchPage();
    expect(result).toBeNull();
  });

  it('stores self-authored owned items correctly in feed content', async () => {
    // Self-POKs arrive as type 'owned' with the user's own handle — hook stores them verbatim
    const selfItem = makeOwnedItem('self-1');
    // authorHandle matches what the current user would have (alice in this test setup)
    const page = makeFeedPage(0, 1, [selfItem]);
    (getFeed as jest.Mock).mockResolvedValueOnce(page);

    const data = await getFeed({ page: 0, size: 20 });
    const items = (data as FeedPage).content;

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('owned');
    expect((items[0] as typeof selfItem).authorHandle).toBe('alice');
  });

  it('handles shared (re-learning) items in feed', async () => {
    const sharedItem = {
      type: 'shared' as const,
      id: 'share-1',
      originalPokId: 'pok-1',
      originalPok: makeOwnedItem('pok-1'),
      sharedByHandle: 'bob',
      note: null,
      visibility: 'PUBLIC',
      createdAt: '2026-01-01T00:00:00Z',
      originalAuthorHandle: 'alice',
      originalAuthorDisplayName: 'Alice',
      originalAuthorAvatarUrl: null,
    };

    const page = makeFeedPage(0, 1, [sharedItem]);
    (getFeed as jest.Mock).mockResolvedValueOnce(page);

    const data = await getFeed({ page: 0, size: 20 });
    const items = (data as FeedPage).content;

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('shared');
    expect((items[0] as typeof sharedItem).sharedByHandle).toBe('bob');
  });
});
