import { apiPublicFetch, apiFetch } from './api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  handle: string;
  userId: string;
  expiresIn: number;
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
  accessToken: string | null;
  refreshToken: string | null;
  handle: string | null;
  userId: string | null;
  expiresIn: number | null;
}

export interface CompleteGoogleSignupPayload {
  tempToken: string;
  handle: string;
  displayName: string;
}

export function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return apiPublicFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  return apiPublicFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshApi(refreshToken: string): Promise<AuthResponse> {
  return apiPublicFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutApi(refreshToken: string): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function checkHandleApi(
  handle: string
): Promise<HandleAvailabilityResponse> {
  return apiPublicFetch<HandleAvailabilityResponse>(
    `/auth/handle/available?h=${encodeURIComponent(handle)}`
  );
}

export function googleLoginApi(idToken: string): Promise<GoogleLoginResponse> {
  return apiPublicFetch<GoogleLoginResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export function completeGoogleSignupApi(
  payload: CompleteGoogleSignupPayload
): Promise<AuthResponse> {
  return apiPublicFetch<AuthResponse>('/auth/google/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
