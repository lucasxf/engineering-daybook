import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, apiPublicFetch, ApiRequestError, configureApiAuth } from '../api';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  configureApiAuth(
    () => null,
    async () => null
  );
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
  it('attaches Bearer token when available', async () => {
    configureApiAuth(
      () => 'test-token',
      async () => null
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch('/poks');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('retries on 401 with refreshed token', async () => {
    const newToken = 'refreshed-token';
    configureApiAuth(
      () => 'expired-token',
      async () => newToken
    );

    // First call returns 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expired' }),
    });

    // Retry after refresh returns 200
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    });

    const result = await apiFetch('/poks');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'success' });

    // Second call should use the refreshed token
    const secondCallHeaders = mockFetch.mock.calls[1][1].headers;
    expect(secondCallHeaders.Authorization).toBe(`Bearer ${newToken}`);
  });

  it('throws when 401 retry also fails', async () => {
    configureApiAuth(
      () => 'expired-token',
      async () => null // refresh fails
    );

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expired' }),
    });

    await expect(apiFetch('/poks')).rejects.toThrow(ApiRequestError);
  });
});
