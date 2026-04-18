/**
 * useAppleAuth — unit tests (lib jest project, node env).
 *
 * Strategy: Call the hook as a plain function (no renderHook) by mocking all
 * React hooks at module scope. The AppleAuthentication.signInAsync call is
 * tested by controlling the resolved/rejected values of the mock.
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

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (...args: unknown[]) => mockUseState(...args),
}));

// ---------------------------------------------------------------------------
// expo-apple-authentication mock
// ---------------------------------------------------------------------------
const mockSignInAsync = jest.fn();

jest.mock('expo-apple-authentication', () => ({
  __esModule: true,
  signInAsync: (...args: unknown[]) => mockSignInAsync(...args),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationError: { CANCELED: 'ERR_REQUEST_CANCELED' },
}));

// ---------------------------------------------------------------------------
// @/lib/auth mock
// ---------------------------------------------------------------------------
const mockAppleLoginApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  appleLoginApi: (...args: unknown[]) => mockAppleLoginApi(...args),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import { useAppleAuth } from '../useAppleAuth';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockStateCallCount = 0;
  mockUseState.mockClear();
  mockSetLoading.mockClear();
  mockSignInAsync.mockClear();
  mockAppleLoginApi.mockClear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAppleAuth', () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    onSuccess.mockClear();
    onError.mockClear();
  });

  describe('cancel — silent no-op', () => {
    it('does NOT call onError when user cancels (CANCELED error code)', async () => {
      const cancelError = Object.assign(new Error('User cancelled'), {
        code: 'ERR_REQUEST_CANCELED',
      });
      mockSignInAsync.mockRejectedValue(cancelError);

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(onError).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('auth error — onError called', () => {
    it('calls onError with appleFailed key when signInAsync throws a non-cancel error', async () => {
      mockSignInAsync.mockRejectedValue(new Error('Unknown auth error'));

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(onError).toHaveBeenCalledWith('auth.errors.appleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('null identityToken — onError called', () => {
    it('calls onError with appleFailed key when identityToken is null', async () => {
      mockSignInAsync.mockResolvedValue({
        identityToken: null,
        user: 'apple-user-id',
        email: 'user@privaterelay.appleid.com',
        fullName: { givenName: 'John', familyName: 'Doe' },
      });

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(onError).toHaveBeenCalledWith('auth.errors.appleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('new user (requiresHandle=true)', () => {
    it('calls onSuccess with type=new and provider=apple when requiresHandle is true', async () => {
      mockSignInAsync.mockResolvedValue({
        identityToken: 'test-identity-token',
        user: 'apple-user-id',
        email: 'newuser@privaterelay.appleid.com',
        fullName: { givenName: 'Jane', familyName: 'Doe' },
      });

      mockAppleLoginApi.mockResolvedValue({
        requiresHandle: true,
        tempToken: 'tmp-apple-abc',
        email: 'newuser@privaterelay.appleid.com',
        handle: null,
        userId: null,
        accessToken: null,
        refreshToken: null,
      });

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(mockAppleLoginApi).toHaveBeenCalledWith('test-identity-token');
      expect(onSuccess).toHaveBeenCalledWith({
        type: 'new',
        tempToken: 'tmp-apple-abc',
        email: 'newuser@privaterelay.appleid.com',
      });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('existing user (requiresHandle=false)', () => {
    it('calls onSuccess with type=existing when requiresHandle is false', async () => {
      mockSignInAsync.mockResolvedValue({
        identityToken: 'existing-user-token',
        user: 'apple-user-id',
        email: null,
        fullName: null,
      });

      mockAppleLoginApi.mockResolvedValue({
        requiresHandle: false,
        tempToken: null,
        handle: 'applice',
        userId: 'user-456',
        email: 'alice@privaterelay.appleid.com',
        accessToken: 'tok-access',
        refreshToken: 'tok-refresh',
      });

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(mockAppleLoginApi).toHaveBeenCalledWith('existing-user-token');
      expect(onSuccess).toHaveBeenCalledWith({
        type: 'existing',
        user: { handle: 'applice', userId: 'user-456', email: 'alice@privaterelay.appleid.com' },
      });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('backend API error', () => {
    it('calls onError with appleFailed key when appleLoginApi rejects', async () => {
      mockSignInAsync.mockResolvedValue({
        identityToken: 'valid-token',
        user: 'apple-user-id',
        email: null,
        fullName: null,
      });

      mockAppleLoginApi.mockRejectedValue(new Error('Network error'));

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(onError).toHaveBeenCalledWith('auth.errors.appleFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('sets loading=true at start and loading=false after completion', async () => {
      mockSignInAsync.mockResolvedValue({
        identityToken: 'valid-token',
        user: 'apple-user-id',
        email: null,
        fullName: null,
      });

      mockAppleLoginApi.mockResolvedValue({
        requiresHandle: false,
        tempToken: null,
        handle: 'bob',
        userId: 'user-789',
        email: 'bob@privaterelay.appleid.com',
        accessToken: 'tok-access',
        refreshToken: 'tok-refresh',
      });

      const result = useAppleAuth(onSuccess, onError);
      await result.handlePress();

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});
