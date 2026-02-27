import { apiFetch } from './api';

export interface Tag {
  id: string;
  tagId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TagSuggestion {
  id: string;
  pokId: string;
  suggestedName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CreateTagDto { name: string; }
export interface UpdateTagDto { name: string; }

export const tagApi = {
  async list(): Promise<Tag[]> {
    return apiFetch<Tag[]>('/tags');
  },
  async create(data: CreateTagDto): Promise<Tag> {
    return apiFetch<Tag>('/tags', { method: 'POST', body: JSON.stringify(data) });
  },
  async rename(tagId: string, data: UpdateTagDto): Promise<Tag> {
    return apiFetch<Tag>(`/tags/${tagId}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(tagId: string): Promise<void> {
    return apiFetch<void>(`/tags/${tagId}`, { method: 'DELETE' });
  },
  async assign(pokId: string, tagId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/${tagId}`, { method: 'POST' });
  },
  async remove(pokId: string, tagId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/${tagId}`, { method: 'DELETE' });
  },
  async getSuggestions(pokId: string): Promise<TagSuggestion[]> {
    return apiFetch<TagSuggestion[]>(`/poks/${pokId}/tags/suggestions`);
  },
  async approveSuggestion(pokId: string, suggestionId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/suggestions/${suggestionId}/approve`, {
      method: 'POST',
    });
  },
  async rejectSuggestion(pokId: string, suggestionId: string): Promise<void> {
    return apiFetch<void>(`/poks/${pokId}/tags/suggestions/${suggestionId}/reject`, {
      method: 'POST',
    });
  },
};
