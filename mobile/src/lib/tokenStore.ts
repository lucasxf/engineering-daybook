import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore key names — all tokens are namespaced under `learnimo:`.
 * Only two keys are stored: access token (short-lived JWT) and refresh token (opaque).
 */
const KEYS = {
  ACCESS_TOKEN: 'learnimo:access_token',
  REFRESH_TOKEN: 'learnimo:refresh_token',
} as const;

/**
 * In-memory cache backed by SecureStore.
 *
 * All auth code reads and writes tokens through this module exclusively (NFR3).
 * The in-memory cache enables synchronous reads in the hot path (apiFetch header
 * injection). SecureStore provides persistence across app restarts.
 *
 * Usage:
 * 1. Call `tokenStore.load()` once at app startup before rendering navigation.
 * 2. After login/register: tokens are stored automatically by `auth.ts` helpers.
 * 3. On logout: call `tokenStore.clear()`.
 */
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const tokenStore = {
  /** Synchronous — reads the in-memory cache. */
  getAccessToken(): string | null {
    return _accessToken;
  },

  /** Synchronous — reads the in-memory cache. */
  getRefreshToken(): string | null {
    return _refreshToken;
  },

  /** Writes to both in-memory cache and SecureStore. */
  async setAccessToken(token: string): Promise<void> {
    _accessToken = token;
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  },

  /** Writes to both in-memory cache and SecureStore. */
  async setRefreshToken(token: string): Promise<void> {
    _refreshToken = token;
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Loads tokens from SecureStore into the in-memory cache.
   * Must be called once during app initialisation before any API call.
   */
  async load(): Promise<void> {
    _accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    _refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  /**
   * Clears both in-memory cache and SecureStore entries.
   * Called on logout and when refresh fails (AC6, AC7).
   */
  async clear(): Promise<void> {
    _accessToken = null;
    _refreshToken = null;
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },

  /**
   * Returns true if an access token is present in the cache.
   * Does NOT validate the token's expiry — use /auth/me for that.
   */
  hasTokens(): boolean {
    return _accessToken !== null && _refreshToken !== null;
  },
};
