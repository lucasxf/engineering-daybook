import { apiFetch, apiPublicFetch } from './api';
import { tokenStore } from './tokenStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** User identity returned to consumers (no tokens). */
export interface AuthResponse {
  handle: string;
  userId: string;
  email: string;
}

/** Backend response shape — includes tokens in body (RISK-1, mobile support). */
interface BackendAuthResponse extends AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface HandleAvailabilityResponse {
  available: boolean;
  handle: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  handle: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginResponse {
  requiresHandle: boolean;
  tempToken: string | null;
  handle: string | null;
  userId: string | null;
  email: string | null;
  /** Present when requiresHandle=false — store in SecureStore. */
  accessToken: string | null;
  /** Present when requiresHandle=false — store in SecureStore. */
  refreshToken: string | null;
}

export interface CompleteGoogleSignupPayload {
  tempToken: string;
  handle: string;
  displayName: string;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/**
 * Stores tokens in SecureStore and returns only the identity fields.
 * All token-issuing API calls funnel through here.
 */
async function storeTokensAndReturn(data: BackendAuthResponse): Promise<AuthResponse> {
  await tokenStore.setAccessToken(data.accessToken);
  await tokenStore.setRefreshToken(data.refreshToken);
  return { handle: data.handle, userId: data.userId, email: data.email };
}

// ---------------------------------------------------------------------------
// Auth API calls
// ---------------------------------------------------------------------------

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiPublicFetch<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return storeTokensAndReturn(data);
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiPublicFetch<BackendAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return storeTokensAndReturn(data);
}

/**
 * Fetches the current user's identity using the access token in the store.
 * Used during session initialisation on app launch.
 */
export function getMeApi(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/me');
}

export function logoutApi(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

export function checkHandleApi(handle: string): Promise<HandleAvailabilityResponse> {
  return apiPublicFetch<HandleAvailabilityResponse>(
    `/auth/handle/available?h=${encodeURIComponent(handle)}`
  );
}

export async function googleLoginApi(idToken: string): Promise<GoogleLoginResponse> {
  const data = await apiPublicFetch<GoogleLoginResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });

  // Existing user path — store tokens immediately
  if (!data.requiresHandle && data.accessToken && data.refreshToken) {
    await tokenStore.setAccessToken(data.accessToken);
    await tokenStore.setRefreshToken(data.refreshToken);
  }

  return data;
}

export async function completeGoogleSignupApi(
  payload: CompleteGoogleSignupPayload
): Promise<AuthResponse> {
  const data = await apiPublicFetch<BackendAuthResponse>('/auth/google/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return storeTokensAndReturn(data);
}

export function requestPasswordResetApi(email: string): Promise<{ message: string }> {
  return apiPublicFetch<{ message: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function validatePasswordResetTokenApi(token: string): Promise<{ valid: string }> {
  return apiPublicFetch<{ valid: string }>(
    `/auth/password-reset/validate?token=${encodeURIComponent(token)}`
  );
}

export function confirmPasswordResetApi(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiPublicFetch<{ message: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
