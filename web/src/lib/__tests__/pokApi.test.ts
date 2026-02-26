import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pokApi } from '../pokApi';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  // Stub document.cookie so apiFetch can read the JWT token
  Object.defineProperty(document, 'cookie', { value: '', configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockOkResponse(body: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

const EMPTY_PAGE = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 };

describe('pokApi.getAll — searchMode', () => {
  it('includes searchMode=hybrid in query string when provided', async () => {
    mockOkResponse(EMPTY_PAGE);

    await pokApi.getAll({ keyword: 'react', searchMode: 'hybrid' });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.get('searchMode')).toBe('hybrid');
    expect(url.searchParams.get('keyword')).toBe('react');
  });

  it('includes searchMode=semantic in query string when provided', async () => {
    mockOkResponse(EMPTY_PAGE);

    await pokApi.getAll({ keyword: 'react', searchMode: 'semantic' });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.get('searchMode')).toBe('semantic');
  });

  it('omits searchMode from query string when not provided', async () => {
    mockOkResponse(EMPTY_PAGE);

    await pokApi.getAll({ keyword: 'react' });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.has('searchMode')).toBe(false);
  });
});
