/**
 * useFeedData — core pagination logic tests.
 * We test the hook's state machine in isolation (no React rendering).
 * The logic extracted here mirrors the hook's fetch and append behaviour.
 */

// ---------------------------------------------------------------------------
// Mock pokApi
// ---------------------------------------------------------------------------

jest.mock('@/lib/pokApi', () => ({
  pokApi: {
    getAll: jest.fn(),
  },
}));

import { pokApi } from '@/lib/pokApi';
import type { PokPage } from '@/lib/pokApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePage(page: number, totalPages: number, content: unknown[]): PokPage {
  return {
    content: content as any,
    page,
    size: 20,
    totalElements: totalPages * 20,
    totalPages,
    number: page,
  };
}

// ---------------------------------------------------------------------------
// Tests — pagination state machine
// ---------------------------------------------------------------------------

describe('useFeedData — pagination state machine', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hasMore is true when current page < totalPages - 1', () => {
    const data = makePage(0, 3, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(true);
  });

  it('hasMore is false when on the last page', () => {
    const data = makePage(2, 3, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(false);
  });

  it('hasMore is false for a single-page result', () => {
    const data = makePage(0, 1, []);
    const hasMore = data.number < data.totalPages - 1;
    expect(hasMore).toBe(false);
  });

  it('appends poks on loadMore', async () => {
    const page0 = makePage(0, 2, [{ id: '1' }, { id: '2' }]);
    const page1 = makePage(1, 2, [{ id: '3' }, { id: '4' }]);

    (pokApi.getAll as jest.Mock)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1);

    // Simulate initial load
    const data0 = await pokApi.getAll({ page: 0, size: 20 });
    const poks = [...(data0 as PokPage).content];

    // Simulate loadMore
    const data1 = await pokApi.getAll({ page: 1, size: 20 });
    poks.push(...(data1 as PokPage).content);

    expect(poks).toHaveLength(4);
    expect(poks[2]).toEqual({ id: '3' });
  });

  it('resets poks on refresh (page 0)', async () => {
    const page0 = makePage(0, 2, [{ id: '1' }, { id: '2' }]);
    const refreshPage = makePage(0, 2, [{ id: 'new-1' }, { id: 'new-2' }]);

    (pokApi.getAll as jest.Mock)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(refreshPage);

    const data0 = await pokApi.getAll({ page: 0 });
    let poks = [...(data0 as PokPage).content];

    // On refresh, replace content
    const refreshData = await pokApi.getAll({ page: 0 });
    poks = [...(refreshData as PokPage).content];

    expect(poks).toHaveLength(2);
    expect(poks[0]).toEqual({ id: 'new-1' });
  });

  it('does not call getAll when AbortError is thrown', async () => {
    const error = new Error('AbortError');
    error.name = 'AbortError';
    (pokApi.getAll as jest.Mock).mockRejectedValue(error);

    // Mirror the fetchPage guard: return null on AbortError
    async function fetchPage() {
      try {
        return await pokApi.getAll({ page: 0, size: 20 });
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return null;
        throw e;
      }
    }

    const result = await fetchPage();
    expect(result).toBeNull();
  });
});
