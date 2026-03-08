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

describe('pokApi.share', () => {
  const originalPokId = 'pok-123';
  const shareResponse = {
    type: 'shared',
    id: 'share-456',
    originalPokId: 'pok-123',
    originalPok: null,
    sharedByHandle: 'alice',
    note: null,
    visibility: 'PUBLIC',
    createdAt: '2026-03-07T00:00:00Z',
  };

  it('POSTs to /poks/{id}/share with note and visibility', async () => {
    mockOkResponse(shareResponse);

    await pokApi.share(originalPokId, { note: 'Great insight', visibility: 'PUBLIC' });

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/poks/${originalPokId}/share`);
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body as string);
    expect(body.note).toBe('Great insight');
    expect(body.visibility).toBe('PUBLIC');
  });

  it('POSTs to /poks/{id}/share with null note when omitted', async () => {
    mockOkResponse(shareResponse);

    await pokApi.share(originalPokId, {});

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.note).toBeUndefined();
  });

  it('returns the PokShare response', async () => {
    mockOkResponse(shareResponse);

    const result = await pokApi.share(originalPokId, { visibility: 'PUBLIC' });

    expect(result.type).toBe('shared');
    expect(result.id).toBe('share-456');
    expect(result.originalPokId).toBe('pok-123');
  });
});

describe('pokApi.unshare', () => {
  it('DELETEs /poks/shared/{shareId}', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: async () => null });

    await pokApi.unshare('share-456');

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/poks/shared/share-456');
    expect(options.method).toBe('DELETE');
  });
});

describe('pokApi.getShareById', () => {
  it('GETs /poks/shared/{shareId}', async () => {
    const shareResponse = {
      type: 'shared',
      id: 'share-789',
      originalPokId: 'pok-123',
      originalPok: null,
      sharedByHandle: 'bob',
      note: 'Helpful!',
      visibility: 'PUBLIC',
      createdAt: '2026-03-07T00:00:00Z',
    };
    mockOkResponse(shareResponse);

    const result = await pokApi.getShareById('share-789');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/poks/shared/share-789');
    expect(result.note).toBe('Helpful!');
  });
});
