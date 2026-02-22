import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, apiPublicFetch, ApiRequestError } from '../api';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiPublicFetch', () => {
  it('sends request with correct URL and headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    });

    const result = await apiPublicFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('throws ApiRequestError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid credentials' }),
    });

    try {
      await apiPublicFetch('/auth/login');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRequestError);
      expect((error as ApiRequestError).status).toBe(401);
      expect((error as ApiRequestError).message).toBe('Invalid credentials');
    }
  });

  it('returns undefined for 204 responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await apiPublicFetch('/auth/logout');
    expect(result).toBeUndefined();
  });
});

describe('apiFetch', () => {
  it('sends request with credentials:include and no Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch('/poks');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'include',
      })
    );
    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('retries on 401 after silent refresh succeeds via cookie', async () => {
    // First call: original request → 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expired' }),
    });
    // Second call: POST /auth/refresh → 200 (sets new cookie)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    // Third call: retry original request → 200
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    });

    const result = await apiFetch('/poks');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ data: 'success' });
    // Second call must be the refresh endpoint
    expect(mockFetch.mock.calls[1][0]).toContain('/auth/refresh');
  });

  it('throws when 401 persists after silent refresh fails', async () => {
    // Original request → 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expired' }),
    });
    // Refresh → 401 (refresh token expired)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    });

    await expect(apiFetch('/poks')).rejects.toThrow(ApiRequestError);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
