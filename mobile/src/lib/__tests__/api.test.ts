import { apiFetch, apiPublicFetch, ApiRequestError, setAuthFailureListener } from '../api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: { apiUrl: 'http://localhost:8080/api/v1' },
    },
  },
}));

// Mock the tokenStore module so we can control its state without SecureStore
jest.mock('../tokenStore', () => ({
  tokenStore: {
    getAccessToken: jest.fn(() => null as string | null),
    getRefreshToken: jest.fn(() => null as string | null),
    setAccessToken: jest.fn(async () => undefined),
    setRefreshToken: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
  },
}));

import { tokenStore } from '../tokenStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = 'http://localhost:8080/api/v1';

function mockOk(body: unknown, status = 200): Response {
  return {
    ok: true,
    status,
    json: async () => body,
    statusText: 'OK',
  } as unknown as Response;
}

function mockError(status: number, body?: unknown): Response {
  return {
    ok: false,
    status,
    json: async () => body ?? { message: `Error ${status}` },
    statusText: `Error ${status}`,
  } as unknown as Response;
}

function mockNoContent(): Response {
  return {
    ok: true,
    status: 204,
    json: async () => null,
    statusText: 'No Content',
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);
  (tokenStore.getRefreshToken as jest.Mock).mockReturnValue(null);
});

// ---------------------------------------------------------------------------
// apiFetch — success paths
// ---------------------------------------------------------------------------

describe('apiFetch', () => {
  it('sends request with Authorization header when token is present', async () => {
    (tokenStore.getAccessToken as jest.Mock).mockReturnValue('my-access-token');
    global.fetch = jest.fn().mockResolvedValue(mockOk({ id: '1' }));

    await apiFetch('/poks');

    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/poks`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-access-token',
        }),
      })
    );
  });

  it('returns parsed JSON on 200', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockOk({ content: [] }));

    const result = await apiFetch<{ content: unknown[] }>('/poks');

    expect(result).toEqual({ content: [] });
  });

  it('returns undefined on 204 No Content', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockNoContent());

    const result = await apiFetch<void>('/poks/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('throws ApiRequestError with status and message on non-401 error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockError(404, { message: 'Not found' }));

    await expect(apiFetch('/poks/missing')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      message: 'Not found',
    });
  });
});

// ---------------------------------------------------------------------------
// apiFetch — 401 → silent refresh → retry (AC5)
// ---------------------------------------------------------------------------

describe('apiFetch — 401 refresh flow (AC5)', () => {
  it('retries with new token after a successful silent refresh', async () => {
    (tokenStore.getAccessToken as jest.Mock)
      .mockReturnValueOnce('stale-access')  // first request
      .mockReturnValueOnce('new-access');   // retry after refresh

    (tokenStore.getRefreshToken as jest.Mock).mockReturnValue('valid-refresh');

    global.fetch = jest
      .fn()
      // First attempt → 401
      .mockResolvedValueOnce(mockError(401))
      // Refresh token call → 200 with new tokens
      .mockResolvedValueOnce(
        mockOk({ accessToken: 'new-access', refreshToken: 'new-refresh' })
      )
      // Retry → 200
      .mockResolvedValueOnce(mockOk({ id: '1' }));

    const result = await apiFetch<{ id: string }>('/poks/1');

    expect(result).toEqual({ id: '1' });
    expect(tokenStore.setAccessToken).toHaveBeenCalledWith('new-access');
    expect(tokenStore.setRefreshToken).toHaveBeenCalledWith('new-refresh');
    // fetch called 3 times: original + refresh + retry
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('retries with Authorization header containing new access token', async () => {
    (tokenStore.getAccessToken as jest.Mock)
      .mockReturnValueOnce('stale-access')
      .mockReturnValueOnce('new-access');
    (tokenStore.getRefreshToken as jest.Mock).mockReturnValue('valid-refresh');

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockError(401))
      .mockResolvedValueOnce(
        mockOk({ accessToken: 'new-access', refreshToken: 'new-refresh' })
      )
      .mockResolvedValueOnce(mockOk({}));

    await apiFetch('/poks/1');

    const retryCall = (fetch as jest.Mock).mock.calls[2];
    expect(retryCall[1].headers).toMatchObject({
      Authorization: 'Bearer new-access',
    });
  });
});

// ---------------------------------------------------------------------------
// apiFetch — double-401 (AC6): clear tokens + notify AuthContext
// ---------------------------------------------------------------------------

describe('apiFetch — double-401 auth failure (AC6)', () => {
  it('clears tokens and calls authFailureListener when refresh fails', async () => {
    (tokenStore.getRefreshToken as jest.Mock).mockReturnValue('expired-refresh');
    const authFailureListener = jest.fn();
    setAuthFailureListener(authFailureListener);

    global.fetch = jest
      .fn()
      // Original request → 401
      .mockResolvedValueOnce(mockError(401))
      // Refresh → 401 (refresh token also expired)
      .mockResolvedValueOnce(mockError(401));

    await expect(apiFetch('/poks')).rejects.toMatchObject({
      status: 401,
    });

    expect(tokenStore.clear).toHaveBeenCalled();
    expect(authFailureListener).toHaveBeenCalled();
  });

  it('clears tokens when no refresh token is available', async () => {
    (tokenStore.getRefreshToken as jest.Mock).mockReturnValue(null);
    setAuthFailureListener(jest.fn());

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockError(401));

    await expect(apiFetch('/poks')).rejects.toMatchObject({ status: 401 });

    expect(tokenStore.clear).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// apiPublicFetch — unauthenticated requests
// ---------------------------------------------------------------------------

describe('apiPublicFetch', () => {
  it('does not inject Authorization header', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockOk({ message: 'ok' }));

    await apiPublicFetch('/auth/login', { method: 'POST', body: '{}' });

    const [, options] = (fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockOk({ userId: 'u1' }));

    const result = await apiPublicFetch<{ userId: string }>('/auth/me');

    expect(result).toEqual({ userId: 'u1' });
  });

  it('throws ApiRequestError on error response', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockError(400, { message: 'Invalid credentials' }));

    await expect(apiPublicFetch('/auth/login')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      message: 'Invalid credentials',
    });
  });

  it('returns undefined on 204', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockNoContent());

    const result = await apiPublicFetch<void>('/auth/logout', { method: 'POST' });

    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ApiRequestError
// ---------------------------------------------------------------------------

describe('ApiRequestError', () => {
  it('has correct name and status', () => {
    const err = new ApiRequestError(403, 'Forbidden');

    expect(err.name).toBe('ApiRequestError');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
    expect(err instanceof Error).toBe(true);
  });
});
