import { tokenStore } from '../tokenStore';

// ---------------------------------------------------------------------------
// Mock expo-secure-store
// ---------------------------------------------------------------------------

const secureStoreData: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => secureStoreData[key] ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStoreData[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStoreData[key];
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCESS_KEY = 'learnimo:access_token';
const REFRESH_KEY = 'learnimo:refresh_token';

beforeEach(async () => {
  // Reset SecureStore backing store
  Object.keys(secureStoreData).forEach((k) => delete secureStoreData[k]);
  // Clear in-memory cache by calling clear() which also clears SecureStore
  await tokenStore.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tokenStore', () => {
  describe('initial state', () => {
    it('returns null for both tokens before any load', () => {
      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
    });

    it('hasTokens() returns false when no tokens', () => {
      expect(tokenStore.hasTokens()).toBe(false);
    });
  });

  describe('setAccessToken / setRefreshToken', () => {
    it('stores access token in memory and SecureStore', async () => {
      await tokenStore.setAccessToken('access-abc');

      expect(tokenStore.getAccessToken()).toBe('access-abc');
      expect(secureStoreData[ACCESS_KEY]).toBe('access-abc');
    });

    it('stores refresh token in memory and SecureStore', async () => {
      await tokenStore.setRefreshToken('refresh-xyz');

      expect(tokenStore.getRefreshToken()).toBe('refresh-xyz');
      expect(secureStoreData[REFRESH_KEY]).toBe('refresh-xyz');
    });

    it('hasTokens() returns true after both tokens are set', async () => {
      await tokenStore.setAccessToken('access-abc');
      await tokenStore.setRefreshToken('refresh-xyz');

      expect(tokenStore.hasTokens()).toBe(true);
    });

    it('hasTokens() returns false if only access token is set', async () => {
      await tokenStore.setAccessToken('access-abc');

      expect(tokenStore.hasTokens()).toBe(false);
    });
  });

  describe('load()', () => {
    it('populates in-memory cache from SecureStore on app restart', async () => {
      // Simulate tokens written to SecureStore by a previous session
      secureStoreData[ACCESS_KEY] = 'persisted-access';
      secureStoreData[REFRESH_KEY] = 'persisted-refresh';

      await tokenStore.load();

      expect(tokenStore.getAccessToken()).toBe('persisted-access');
      expect(tokenStore.getRefreshToken()).toBe('persisted-refresh');
    });

    it('sets tokens to null when SecureStore is empty', async () => {
      await tokenStore.setAccessToken('temp');
      // Simulate SecureStore having no tokens (e.g., first install)
      Object.keys(secureStoreData).forEach((k) => delete secureStoreData[k]);

      await tokenStore.load();

      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
    });
  });

  describe('clear()', () => {
    it('removes both tokens from memory and SecureStore', async () => {
      await tokenStore.setAccessToken('access-abc');
      await tokenStore.setRefreshToken('refresh-xyz');

      await tokenStore.clear();

      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
      expect(secureStoreData[ACCESS_KEY]).toBeUndefined();
      expect(secureStoreData[REFRESH_KEY]).toBeUndefined();
    });

    it('hasTokens() returns false after clear', async () => {
      await tokenStore.setAccessToken('access-abc');
      await tokenStore.setRefreshToken('refresh-xyz');
      await tokenStore.clear();

      expect(tokenStore.hasTokens()).toBe(false);
    });
  });
});
