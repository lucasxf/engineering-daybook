import { type Page } from '@playwright/test';

const API = 'http://localhost:8080/api/v1';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

export const MOCK_USER = {
  userId: 'user-1',
  email: 'test@example.com',
  handle: 'testuser',
  defaultPokVisibility: 'PRIVATE' as const,
  profileVisibility: 'PRIVATE' as const,
};

export interface MockPok {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS_ONLY' | 'COLLEAGUES_ONLY';
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: unknown[];
  pendingSuggestions: unknown[];
  authorHandle: string | null;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
}

export const MOCK_POK: MockPok = {
  id: 'pok-1',
  userId: 'user-1',
  title: 'Test Learning',
  content: 'This is test content for a learning.',
  visibility: 'PRIVATE',
  deletedAt: null,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
  authorHandle: null,
  authorDisplayName: null,
  authorAvatarUrl: null,
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

export interface MockLearnerProfile {
  handle: string;
  displayName?: string;
  profileVisibility?: 'PRIVATE' | 'COLLEAGUES_ONLY' | 'FOLLOWERS_ONLY' | 'PUBLIC';
  learnings?: MockPok[];
  learningCount?: number;
  relationshipStatus?: 'NONE' | 'FOLLOWING' | 'FOLLOWED_BY' | 'COLLEAGUE';
  followerCount?: number;
  followingCount?: number;
  colleagueCount?: number;
}

export interface MockPokShare {
  type: 'shared';
  id: string;
  originalPokId: string;
  originalPok: MockPok | null;
  sharedByHandle: string;
  note: string | null;
  visibility: string;
  createdAt: string;
  originalAuthorHandle: string | null;
  originalAuthorDisplayName: string | null;
  originalAuthorAvatarUrl: string | null;
}

export const MOCK_POK_SHARE: MockPokShare = {
  type: 'shared',
  id: 'share-1',
  originalPokId: 'pok-1',
  originalPok: MOCK_POK,
  sharedByHandle: MOCK_USER.handle,
  note: null,
  visibility: 'PUBLIC',
  createdAt: '2026-03-07T12:00:00Z',
  originalAuthorHandle: null,
  originalAuthorDisplayName: null,
  originalAuthorAvatarUrl: null,
};

export interface ApiMockConfig {
  /** Whether GET /auth/me succeeds. Defaults to true. */
  authenticated?: boolean;
  /** Override the user returned by /auth/me. Defaults to MOCK_USER. */
  user?: typeof MOCK_USER;
  /** Learner profiles keyed by handle. Used for GET /learners/{handle}. */
  learnerProfiles?: Record<string, MockLearnerProfile>;
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
  /**
   * If true, follow/unfollow endpoints return 204.
   * If false, follow returns 409, unfollow returns 409.
   * Defaults to true.
   */
  followEnabled?: boolean;
  /** Response returned by POST /poks/{id}/share. Defaults to MOCK_POK_SHARE. */
  createdShare?: MockPokShare;
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
    learnerProfiles = {},
    followEnabled = true,
    createdShare = MOCK_POK_SHARE,
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

    // --- User settings ---

    if (path === '/users/me/settings' && method === 'PATCH') {
      await route.fulfill({ status: 204 });
      return;
    }

    // --- Learner profiles ---

    const learnerProfileMatch = path.match(/^\/learners\/([^/]+)$/);
    if (learnerProfileMatch && method === 'GET') {
      const handle = learnerProfileMatch[1];
      const profile = learnerProfiles[handle];
      if (profile) {
        await route.fulfill({ json: profile });
      } else {
        await route.fulfill({ status: 404, json: { message: 'Not found' } });
      }
      return;
    }

    const learnerPoksMatch = path.match(/^\/learners\/([^/]+)\/poks$/);
    if (learnerPoksMatch && method === 'GET') {
      const handle = learnerPoksMatch[1];
      const profile = learnerProfiles[handle];
      if (profile && profile.profileVisibility !== 'PRIVATE') {
        await route.fulfill({ json: makePokPage(profile.learnings ?? []) });
      } else {
        await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      }
      return;
    }

    // --- Follow / unfollow ---

    const learnerFollowMatch = path.match(/^\/learners\/([^/]+)\/follow$/);
    if (learnerFollowMatch) {
      if (method === 'POST' || method === 'DELETE') {
        if (followEnabled) {
          await route.fulfill({ status: 204 });
        } else {
          await route.fulfill({ status: 409, json: { message: 'Conflict' } });
        }
        return;
      }
    }

    // --- Re-learning (PokShare) endpoints ---

    const pokShareCreateMatch = path.match(/^\/poks\/([^/]+)\/share$/);
    if (pokShareCreateMatch && method === 'POST') {
      await route.fulfill({ status: 201, json: createdShare });
      return;
    }

    const pokSharedItemMatch = path.match(/^\/poks\/shared\/([^/]+)$/);
    if (pokSharedItemMatch) {
      if (method === 'GET') {
        await route.fulfill({ json: createdShare });
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
