import { apiFetch } from './api';
import type { PokVisibility, ProfileVisibility } from './auth';

export interface UpdateUserSettingsPayload {
  defaultPokVisibility?: PokVisibility;
  profileVisibility?: ProfileVisibility;
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
