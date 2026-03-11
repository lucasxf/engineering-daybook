import { apiFetch } from './api';
import type { PokVisibility } from './pokApi';
import type { ProfileVisibility } from './auth';

export interface UpdateUserSettingsPayload {
  defaultPokVisibility?: PokVisibility;
  profileVisibility?: ProfileVisibility;
  bio?: string;
  displayName?: string;
}

/**
 * Updates the authenticated user's privacy and preference settings.
 * Only non-undefined fields are sent. Returns nothing on success (204).
 */
export function updateUserSettings(payload: UpdateUserSettingsPayload): Promise<void> {
  return apiFetch<void>('/users/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Uploads an avatar image. Accepted formats: JPEG, PNG, WebP (max 2 MB).
 * The server resizes to 200×200 JPEG before persisting.
 */
export function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<{ avatarUrl: string }>('/users/me/avatar', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Removes the authenticated user's avatar image.
 */
export function deleteAvatar(): Promise<void> {
  return apiFetch<void>('/users/me/avatar', { method: 'DELETE' });
}
