/**
 * useGoogleAuth — unit tests (lib jest project, node env).
 *
 * Strategy: Call the hook as a plain function (no renderHook) by mocking all
 * React hooks at module scope. The response effect is tested by manually
 * invoking the effect callback captured by the useEffect mock.
 *
 * Jest hoisting rule: jest.mock() factories cannot reference out-of-scope
 * variables. Module-scope variables with a 'mock' prefix are allowed.
 */

// ---------------------------------------------------------------------------
// Module-scope mocks for useState — 'mock' prefix satisfies Jest hoisting rule
// ---------------------------------------------------------------------------
let mockStateCallCount = 0;
const mockSetLoading = jest.fn();
const mockUseState = jest.fn((init: unknown) => {
  mockStateCallCount++;
  return [init, mockSetLoading];
});
const mockUseEffect = jest.fn();

// ---------------------------------------------------------------------------
// React mock — declared before imports (Jest hoists jest.mock calls)
// ---------------------------------------------------------------------------
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (...args: unknown[]) => mockUseState(...args),
  useEffect: (...args: unknown[]) => mockUseEffect(...args),
}));

// ---------------------------------------------------------------------------
// expo-auth-session/providers/google mock
// ---------------------------------------------------------------------------
const mockPromptAsync = jest.fn();
const mockRequest: Record<string, unknown> = { clientId: 'test-client' };
let mockAuthResponse: Record<string, unknown> | null = null;
const mockUseAuthRequest = jest.fn(() => [mockRequest, mockAuthResponse, mockPromptAsync]);

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: (...args: unknown[]) => mockUseAuthRequest(...args),
}));

// ---------------------------------------------------------------------------
// expo-web-browser mock
// maybeCompleteAuthSession is called at module load time (top-level in the
// hook file), so the factory cannot reference module-scope variables.
// Use inline jest.fn() for it; warmUpAsync/coolDownAsync are called inside
// the hook body so they CAN reference module-scope mocks.
// ---------------------------------------------------------------------------
const mockWarmUpAsync = jest.fn().mockResolvedValue(undefined);
const mockCoolDownAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  warmUpAsync: (...args: unknown[]) => mockWarmUpAsync(...args),
  coolDownAsync: (...args: unknown[]) => mockCoolDownAsync(...args),
}));

// ---------------------------------------------------------------------------
// @/lib/auth mock
// ---------------------------------------------------------------------------
const mockGoogleLoginApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  googleLoginApi: (...args: unknown[]) => mockGoogleLoginApi(...args),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import { useGoogleAuth } from '../useGoogleAuth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Invoke the Nth useEffect callback registered during hook execution. */
function runEffect(nth = 0): void {
  const calls = mockUseEffect.mock.calls;
  if (calls.length <= nth) return;
  const effectFn = calls[nth][0] as () => unknown;
  effectFn();
}

/** Invoke the Nth useEffect callback and return its cleanup function. */
function runEffectWithCleanup(nth = 0): (() => void) | undefined {
  const calls = mockUseEffect.mock.calls;
  if (calls.length <= nth) return undefined;
  const effectFn = calls[nth][0] as () => (() => void) | void;
  return effectFn() ?? undefined;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockStateCallCount = 0;
  mockAuthResponse = null;
  mockUseState.mockClear();
  mockUseEffect.mockClear();
  mockSetLoading.mockClear();
  mockPromptAsync.mockClear();
  mockGoogleLoginApi.mockClear();
  mockUseAuthRequest.mockClear();
  mockUseAuthRequest.mockImplementation(() => [mockRequest, mockAuthResponse, mockPromptAsync]);
  // Provide a default client ID so the hook is enabled for all non-FR9 tests
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  delete process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useGoogleAuth', () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    onSuccess.mockClear();
    onError.mockClear();
  });

  describe('FR9 — disabled when no client IDs', () => {
    it('returns disabled=true and does NOT throw when all client IDs are absent', () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      expect(() => {
        const result = useGoogleAuth(onSuccess, onError);
        expect(result.disabled).toBe(true);
      }).not.toThrow();
    });

    it('passes dummy clientId to useAuthRequest to prevent invariant throw', () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      useGoogleAuth(onSuccess, onError);
      const callArgs = mockUseAuthRequest.mock.calls[0][0] as Record<string, unknown>;
      expect(callArgs.clientId).toBe('__disabled__');
    });

    it('returns disabled=false when webClientId is present', () => {
      // EXPO_PUBLIC_GOOGLE_CLIENT_ID already set in outer beforeEach
      const result = useGoogleAuth(onSuccess, onError);
      expect(result.disabled).toBe(false);
    });

    it('handlePress is a no-op when disabled', async () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      const result = useGoogleAuth(onSuccess, onError);
      await result.handlePress();
      expect(mockSetLoading).not.toHaveBeenCalled();
      expect(mockPromptAsync).not.toHaveBeenCalled();
    });
  });

  describe('FR8 — loading state', () => {
    it('sets loading=true and calls promptAsync when handlePress is called', async () => {
      mockPromptAsync.mockResolvedValue(undefined);
      const result = useGoogleAuth(onSuccess, onError);
      await result.handlePress();
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockPromptAsync).toHaveBeenCalled();
    });
  });

  describe('WebBrowser warm-up effect', () => {
    it('calls warmUpAsync on mount (first effect)', () => {
      useGoogleAuth(onSuccess, onError);
      runEffect(0);
      expect(mockWarmUpAsync).toHaveBeenCalled();
    });

    it('calls coolDownAsync on cleanup (first effect cleanup)', () => {
      useGoogleAuth(onSuccess, onError);
      const cleanup = runEffectWithCleanup(0);
      if (cleanup) cleanup();
      expect(mockCoolDownAsync).toHaveBeenCalled();
    });
  });

  describe('FR5 — cancel / dismiss (silent no-op)', () => {
    it('sets loading=false and does NOT call onError when response is cancel', () => {
      mockAuthResponse = { type: 'cancel' };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      useGoogleAuth(onSuccess, onError);
      // Second effect (index 1) is the response effect
      runEffect(1);

      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(onError).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('sets loading=false and does NOT call onError when response is dismiss', () => {
      mockAuthResponse = { type: 'dismiss' };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(onError).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('FR6 — Google-side OAuth error', () => {
    it('calls onError with googleFailed key when response.type is error', () => {
      mockAuthResponse = { type: 'error', error: { code: 'access_denied' } };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(onError).toHaveBeenCalledWith('auth.errors.googleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('FR3 — existing Google user', () => {
    it('calls onSuccess with type=existing when requiresHandle is false', async () => {
      const idToken = 'test-id-token';
      mockAuthResponse = { type: 'success', params: { id_token: idToken } };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      mockGoogleLoginApi.mockResolvedValue({
        requiresHandle: false,
        handle: 'alice',
        userId: 'user-123',
        email: 'alice@example.com',
        accessToken: 'tok-access',
        refreshToken: 'tok-refresh',
        tempToken: null,
      });

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      // Allow the promise chain to settle
      await new Promise((r) => setTimeout(r, 0));

      expect(mockGoogleLoginApi).toHaveBeenCalledWith(idToken);
      expect(onSuccess).toHaveBeenCalledWith({
        type: 'existing',
        user: { handle: 'alice', userId: 'user-123', email: 'alice@example.com' },
      });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('FR4 — new Google user (requiresHandle)', () => {
    it('calls onSuccess with type=new when requiresHandle is true', async () => {
      const idToken = 'new-user-token';
      mockAuthResponse = { type: 'success', params: { id_token: idToken } };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      mockGoogleLoginApi.mockResolvedValue({
        requiresHandle: true,
        tempToken: 'tmp-abc',
        email: 'newuser@example.com',
        handle: null,
        userId: null,
        accessToken: null,
        refreshToken: null,
      });

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      await new Promise((r) => setTimeout(r, 0));

      expect(onSuccess).toHaveBeenCalledWith({
        type: 'new',
        tempToken: 'tmp-abc',
        email: 'newuser@example.com',
      });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('FR6b — backend API error', () => {
    it('calls onError when googleLoginApi rejects', async () => {
      const idToken = 'bad-token';
      mockAuthResponse = { type: 'success', params: { id_token: idToken } };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      mockGoogleLoginApi.mockRejectedValue(new Error('Network error'));

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      await new Promise((r) => setTimeout(r, 0));

      expect(onError).toHaveBeenCalledWith('auth.errors.googleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onError when id_token is missing in both params and authentication', () => {
      mockAuthResponse = { type: 'success', params: {}, authentication: null };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(onError).toHaveBeenCalledWith('auth.errors.googleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('authentication.idToken fallback (Android code flow)', () => {
    it('uses authentication.idToken when params.id_token is absent', async () => {
      // Android code flow: expo-auth-session auto-exchanges the code and puts
      // the id_token in authentication.idToken rather than params.id_token.
      mockAuthResponse = {
        type: 'success',
        params: {},
        authentication: { idToken: 'android-id-token' },
      };
      mockUseAuthRequest.mockReturnValue([mockRequest, mockAuthResponse, mockPromptAsync]);

      mockGoogleLoginApi.mockResolvedValue({
        requiresHandle: false,
        handle: 'alice',
        userId: 'user-123',
        email: 'alice@example.com',
        accessToken: 'tok-access',
        refreshToken: 'tok-refresh',
        tempToken: null,
      });

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      await new Promise((r) => setTimeout(r, 0));

      expect(mockGoogleLoginApi).toHaveBeenCalledWith('android-id-token');
      expect(onSuccess).toHaveBeenCalledWith({
        type: 'existing',
        user: { handle: 'alice', userId: 'user-123', email: 'alice@example.com' },
      });
    });
  });

  describe('null response guard', () => {
    it('does nothing when response is null', () => {
      mockAuthResponse = null;
      mockUseAuthRequest.mockReturnValue([mockRequest, null, mockPromptAsync]);

      useGoogleAuth(onSuccess, onError);
      runEffect(1);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
