import Constants from 'expo-constants';
import { tokenStore } from './tokenStore';

const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:8080/api/v1';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Auth failure event (replaces cookie-based silent redirect)
// ---------------------------------------------------------------------------

type AuthFailureListener = () => void;
let _authFailureListener: AuthFailureListener | null = null;

/**
 * Register a callback to be invoked when both access and refresh tokens are
 * exhausted (double-401). AuthContext uses this to clear user state and
 * trigger navigation to the Login screen.
 */
export function setAuthFailureListener(listener: AuthFailureListener): void {
  _authFailureListener = listener;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return (body.message ?? body.error ?? response.statusText) as string;
  } catch {
    return response.statusText;
  }
}

interface BackendTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Attempts to rotate the refresh token.
 * Sends the current refresh token in the request body (mobile pattern — no cookie).
 * On success, stores the new pair in tokenStore.
 */
async function silentRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as BackendTokenResponse;
    await tokenStore.setAccessToken(data.accessToken);
    await tokenStore.setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function buildAuthHeaders(accessToken: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Makes an authenticated API request.
 * - Injects `Authorization: Bearer <token>` from the in-memory token cache.
 * - On 401: attempts a silent token refresh (body-based, mobile pattern) and retries once.
 * - On double-401: clears tokens and notifies AuthContext via the registered listener.
 * - Supports cancellation via AbortSignal.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const makeRequest = (accessToken: string | null): Promise<Response> =>
    fetch(url, {
      ...options,
      headers: {
        ...buildAuthHeaders(accessToken),
        ...((options.headers as Record<string, string>) ?? {}),
      },
      signal,
    });

  let response = await makeRequest(tokenStore.getAccessToken());

  if (response.status === 401) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      response = await makeRequest(tokenStore.getAccessToken());
    } else {
      await tokenStore.clear();
      _authFailureListener?.();
      throw new ApiRequestError(401, 'Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiRequestError(response.status, message);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Makes an unauthenticated API request (login, register, Google OAuth, etc.).
 * No token injection, no retry logic.
 */
export async function apiPublicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiRequestError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
