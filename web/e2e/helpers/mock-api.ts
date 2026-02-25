import { type Page } from '@playwright/test';

const API = 'http://localhost:8080/api/v1';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

export const MOCK_USER = {
  userId: 'user-1',
  email: 'test@example.com',
  handle: 'testuser',
};

export interface MockPok {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: unknown[];
  pendingSuggestions: unknown[];
}

export const MOCK_POK: MockPok = {
  id: 'pok-1',
  userId: 'user-1',
  title: 'Test Learning',
  content: 'This is test content for a learning.',
  deletedAt: null,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
};

function makePokPage(poks: MockPok[]) {
  return {
    content: poks,
    page: 0,
    size: 20,
    totalElements: poks.length,
    totalPages: Math.ceil(poks.length / 20) || 1,
    number: 0,
  };
}

// ---------------------------------------------------------------------------
// Mock configuration
// ---------------------------------------------------------------------------

export interface ApiMockConfig {
  /** Whether GET /auth/me succeeds. Defaults to true. */
  authenticated?: boolean;
  /** Override the user returned by /auth/me. Defaults to MOCK_USER. */
  user?: typeof MOCK_USER;
  /** POKs returned by GET /poks. Defaults to []. */
  poks?: MockPok[];
  /** POK returned by GET /poks/{id}. Defaults to MOCK_POK. */
  pok?: MockPok;
  /** Response body for POST /auth/login. Defaults to MOCK_USER. */
  loginResponse?: typeof MOCK_USER;
  /** POK returned by POST /poks (create). Defaults to MOCK_POK. */
  createdPok?: MockPok;
  /** POK returned by PUT /poks/{id} (update). Defaults to pok. */
  updatedPok?: MockPok;
}

// ---------------------------------------------------------------------------
// Main setup function
// ---------------------------------------------------------------------------

/**
 * Registers page.route() handlers that intercept all API calls to
 * http://localhost:8080/api/v1/** so tests run without a live backend.
 *
 * Call this BEFORE page.goto() to ensure the mock is in place.
 *
 * @example
 * await setupApiMocks(page, { authenticated: true, poks: [MOCK_POK] });
 * await page.goto('/en/poks');
 */
export async function setupApiMocks(page: Page, config: ApiMockConfig = {}) {
  const {
    authenticated = true,
    user = MOCK_USER,
    poks = [],
    pok = MOCK_POK,
    loginResponse = MOCK_USER,
    createdPok = MOCK_POK,
    updatedPok,
  } = config;

  await page.route(`${API}/**`, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const path = url.pathname.replace('/api/v1', '');

    // --- Auth endpoints ---

    if (path === '/auth/me' && method === 'GET') {
      if (authenticated) {
        await route.fulfill({ json: user });
      } else {
        await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
      }
      return;
    }

    if (path === '/auth/refresh' && method === 'POST') {
      if (authenticated) {
        await route.fulfill({ json: user });
      } else {
        await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
      }
      return;
    }

    if (path === '/auth/login' && method === 'POST') {
      await route.fulfill({ json: loginResponse });
      return;
    }

    if (path === '/auth/logout' && method === 'POST') {
      await route.fulfill({ status: 204 });
      return;
    }

    // --- POK list (GET /poks, POST /poks) ---

    if (path === '/poks' && method === 'GET') {
      await route.fulfill({ json: makePokPage(poks) });
      return;
    }

    if (path === '/poks' && method === 'POST') {
      await route.fulfill({ status: 201, json: createdPok });
      return;
    }

    // --- POK item (GET/PUT/DELETE /poks/{id}) ---

    const pokItemMatch = path.match(/^\/poks\/([^/]+)$/);
    if (pokItemMatch) {
      if (method === 'GET') {
        await route.fulfill({ json: pok });
        return;
      }
      if (method === 'PUT') {
        await route.fulfill({ json: updatedPok ?? pok });
        return;
      }
      if (method === 'DELETE') {
        await route.fulfill({ status: 204 });
        return;
      }
    }

    // Unrecognized route — abort to avoid connection errors to localhost:8080
    await route.abort('failed');
  });
}
