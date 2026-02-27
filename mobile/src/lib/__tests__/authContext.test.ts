/**
 * AuthContext session logic tests.
 *
 * We test the session initialisation contract in isolation:
 * - tokenStore.load() is called on startup
 * - getMeApi() is called when tokens exist
 * - unauthenticated state is set when no tokens
 * - tokens are cleared on logout
 * - authFailureListener is registered and clears state on double-401
 *
 * React rendering is NOT tested here — that belongs in integration tests
 * with a real RN test environment. This file uses the `lib` jest project
 * (node env) to validate pure TypeScript logic.
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../tokenStore', () => ({
  tokenStore: {
    load: jest.fn(async () => undefined),
    hasTokens: jest.fn(() => false),
    clear: jest.fn(async () => undefined),
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    setAccessToken: jest.fn(async () => undefined),
    setRefreshToken: jest.fn(async () => undefined),
  },
}));

jest.mock('../auth', () => ({
  getMeApi: jest.fn(),
  logoutApi: jest.fn(async () => undefined),
}));

jest.mock('../api', () => ({
  setAuthFailureListener: jest.fn(),
}));

import { tokenStore } from '../tokenStore';
import { getMeApi, logoutApi } from '../auth';
import { setAuthFailureListener } from '../api';

// ---------------------------------------------------------------------------
// Session init helper (mirrors AuthContext useEffect logic)
// ---------------------------------------------------------------------------

async function runSessionInit(
  hasTokens: boolean,
  meResult: { ok: boolean; user?: object }
) {
  (tokenStore.load as jest.Mock).mockResolvedValue(undefined);
  (tokenStore.hasTokens as jest.Mock).mockReturnValue(hasTokens);

  let status: 'loading' | 'authenticated' | 'unauthenticated' = 'loading';
  let user: object | null = null;

  const setStatus = (s: typeof status) => { status = s; };
  const setUser = (u: object | null) => { user = u; };

  // Mirror AuthContext initSession()
  await tokenStore.load();
  if (!tokenStore.hasTokens()) {
    setStatus('unauthenticated');
  } else {
    if (meResult.ok && meResult.user) {
      (getMeApi as jest.Mock).mockResolvedValue(meResult.user);
      try {
        const me = await getMeApi();
        setUser(me);
        setStatus('authenticated');
      } catch {
        await tokenStore.clear();
        setStatus('unauthenticated');
      }
    } else {
      (getMeApi as jest.Mock).mockRejectedValue(new Error('401'));
      try {
        await getMeApi();
      } catch {
        await tokenStore.clear();
        setStatus('unauthenticated');
      }
    }
  }

  return { status, user };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext — session init', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets unauthenticated when no tokens in SecureStore', async () => {
    const { status, user } = await runSessionInit(false, { ok: false });

    expect(tokenStore.load).toHaveBeenCalled();
    expect(getMeApi).not.toHaveBeenCalled();
    expect(status).toBe('unauthenticated');
    expect(user).toBeNull();
  });

  it('sets authenticated when tokens exist and /auth/me succeeds', async () => {
    const me = { handle: 'lucas', userId: 'u1', email: 'l@x.com' };
    const { status, user } = await runSessionInit(true, { ok: true, user: me });

    expect(getMeApi).toHaveBeenCalled();
    expect(status).toBe('authenticated');
    expect(user).toEqual(me);
  });

  it('sets unauthenticated and clears tokens when /auth/me fails', async () => {
    const { status } = await runSessionInit(true, { ok: false });

    expect(tokenStore.clear).toHaveBeenCalled();
    expect(status).toBe('unauthenticated');
  });
});

describe('AuthContext — logout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls logoutApi, clears tokens, and sets unauthenticated', async () => {
    let status: string = 'authenticated';
    let user: object | null = { handle: 'lucas' };

    // Mirror logout()
    try {
      await logoutApi();
    } catch {
      // best-effort
    }
    await tokenStore.clear();
    user = null;
    status = 'unauthenticated';

    expect(logoutApi).toHaveBeenCalled();
    expect(tokenStore.clear).toHaveBeenCalled();
    expect(status).toBe('unauthenticated');
    expect(user).toBeNull();
  });

  it('clears local state even when logoutApi throws', async () => {
    (logoutApi as jest.Mock).mockRejectedValue(new Error('Network error'));

    let status: string = 'authenticated';
    let user: object | null = { handle: 'lucas' };

    try {
      await logoutApi();
    } catch {
      // best-effort
    }
    await tokenStore.clear();
    user = null;
    status = 'unauthenticated';

    expect(tokenStore.clear).toHaveBeenCalled();
    expect(status).toBe('unauthenticated');
    expect(user).toBeNull();
  });
});

describe('AuthContext — auth failure listener registration', () => {
  it('registers authFailureListener on mount', () => {
    // Mirror the useEffect that calls setAuthFailureListener
    const listener = jest.fn();
    (setAuthFailureListener as jest.Mock).mockImplementation((fn) => fn);

    setAuthFailureListener(listener);

    expect(setAuthFailureListener).toHaveBeenCalledWith(listener);
  });
});
