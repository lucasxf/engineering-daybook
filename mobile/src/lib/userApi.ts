import Constants from 'expo-constants';
import { apiFetch } from './api';
import { tokenStore } from './tokenStore';
import type { PokVisibility, ProfileVisibility } from './auth';
import { ApiRequestError } from './api';

const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:8080/api/v1';

export interface UpdateUserSettingsPayload {
  defaultPokVisibility?: PokVisibility;
  profileVisibility?: ProfileVisibility;
  bio?: string;
  displayName?: string;
}

/**
 * Updates the authenticated user's privacy and preference settings.
 * Only non-undefined fields are applied. Returns nothing on success (204).
 */
export function updateUserSettings(payload: UpdateUserSettingsPayload): Promise<void> {
  return apiFetch<void>('/users/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Uploads an avatar image. Accepted formats: JPEG, PNG, WebP (max 2 MB).
 * Uses a raw fetch with Bearer token to avoid the automatic Content-Type: application/json header.
 */
export async function uploadAvatar(
  uri: string,
  type: string,
  fileName: string
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  // React Native FormData file object shape
  formData.append('file', { uri, type, name: fileName } as unknown as Blob);

  const accessToken = tokenStore.getAccessToken();
  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json() as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch { /* ignore */ }
    throw new ApiRequestError(response.status, message);
  }

  return response.json() as Promise<{ avatarUrl: string }>;
}

/**
 * Removes the authenticated user's avatar image.
 */
export function deleteAvatar(): Promise<void> {
  return apiFetch<void>('/users/me/avatar', { method: 'DELETE' });
}
