const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message || body.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

/**
 * Attempts a silent token refresh via the refresh_token cookie.
 * Returns true if the backend issued a new access_token cookie.
 */
async function silentRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Makes an authenticated API request. Cookies are sent automatically.
 * On 401, attempts a silent token refresh once and retries.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const requestInit: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
    credentials: 'include',
  };

  let response = await fetch(url, requestInit);

  // On 401, try refreshing the access token once via cookie and retry
  if (response.status === 401) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      response = await fetch(url, requestInit);
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

  return response.json();
}

/**
 * Makes an unauthenticated API request (for login, register, etc.).
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
      ...((options.headers as Record<string, string>) || {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiRequestError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
