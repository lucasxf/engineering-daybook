import { apiFetch } from './api';

/**
 * Tag subscription (per-user).
 */
export interface Tag {
  id: string;
  tagId: string;
  name: string;
  color: string;
  createdAt: string;
}

/**
 * AI-generated tag suggestion awaiting user decision.
 */
export interface TagSuggestion {
  id: string;
  pokId: string;
  suggestedName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name: string;
}

/**
 * API client for tag management and POK–tag assignments.
 *
 * All endpoints require authentication (JWT token managed by apiFetch).
 */
export const tagApi = {
  /**
   * Returns all active tag subscriptions for the authenticated user.
   */
  async list(): Promise<Tag[]> {
    return apiFetch<Tag[]>('/tags');
  },

  /**
   * Creates or reuses a global tag and subscribes the user to it. Idempotent.
   */
  async create(data: CreateTagDto): Promise<Tag> {
    return apiFetch<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Renames a tag subscription (soft-delete + new subscription).
   */
  async rename(tagId: string, data: UpdateTagDto): Promise<Tag> {
    return apiFetch<Tag>(`/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft-deletes a tag subscription and removes all POK assignments.
   */
  async delete(tagId: string): Promise<void> {
    return apiFetch<void>(`/tags/${tagId}`, { method: 'DELETE' });
  },

  /**
   * Assigns a tag to a POK with MANUAL source. Idempotent.
   */
  async assign(pokId: string, tagId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/${tagId}`, { method: 'POST' });
  },

  /**
   * Removes a tag assignment from a POK.
   */
  async remove(pokId: string, tagId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/${tagId}`, { method: 'DELETE' });
  },

  /**
   * Returns PENDING tag suggestions for a POK.
   */
  async getSuggestions(pokId: string): Promise<TagSuggestion[]> {
    return apiFetch<TagSuggestion[]>(`/poks/${pokId}/tags/suggestions`);
  },

  /**
   * Approves a tag suggestion, assigning the tag with AI source.
   */
  async approveSuggestion(pokId: string, suggestionId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/suggestions/${suggestionId}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Rejects a tag suggestion.
   */
  async rejectSuggestion(pokId: string, suggestionId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/suggestions/${suggestionId}/reject`, {
      method: 'POST',
    });
  },
};
