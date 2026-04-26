import { apiFetch } from './api';
import type { Tag, TagSuggestion } from './tagApi';

// ---------------------------------------------------------------------------
// Types (mirror web/src/lib/pokApi.ts)
// ---------------------------------------------------------------------------

export type PokVisibility = 'PRIVATE' | 'COLLEAGUES_ONLY' | 'FOLLOWERS_ONLY' | 'PUBLIC';

export interface Pok {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  visibility: PokVisibility;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  pendingSuggestions: TagSuggestion[];
  /** Author's handle — populated in discovery feed context; absent in My Learnings. */
  authorHandle?: string | null;
  /** Author's display name — populated in discovery feed context; absent in My Learnings. */
  authorDisplayName?: string | null;
  /** Author's avatar URL — populated in discovery feed context; absent in My Learnings. */
  authorAvatarUrl?: string | null;
}

export interface CreatePokDto {
  title?: string | null;
  content: string;
  visibility?: PokVisibility;
  tagIds?: string[];
}

export interface UpdatePokDto {
  title?: string | null;
  content: string;
  visibility?: PokVisibility;
}

export interface PokPage {
  content: Pok[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export type SearchMode = 'hybrid' | 'semantic' | 'keyword';

export interface PokSearchParams {
  keyword?: string;
  searchMode?: SearchMode;
  tagId?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  size?: number;
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export const pokApi = {
  async create(data: CreatePokDto, signal?: AbortSignal): Promise<Pok> {
    return apiFetch<Pok>(
      '/poks',
      { method: 'POST', body: JSON.stringify(data) },
      signal
    );
  },

  async getAll(params?: PokSearchParams, signal?: AbortSignal): Promise<PokPage> {
    const qs = new URLSearchParams();
    if (params?.keyword) qs.set('keyword', params.keyword);
    if (params?.searchMode) qs.set('searchMode', params.searchMode);
    if (params?.tagId) qs.set('tagId', params.tagId);
    if (params?.sortBy) qs.set('sortBy', params.sortBy);
    if (params?.sortDirection) qs.set('sortDirection', params.sortDirection);
    if (params?.createdFrom) qs.set('createdFrom', params.createdFrom);
    if (params?.createdTo) qs.set('createdTo', params.createdTo);
    if (params?.updatedFrom) qs.set('updatedFrom', params.updatedFrom);
    if (params?.updatedTo) qs.set('updatedTo', params.updatedTo);
    qs.set('page', (params?.page ?? 0).toString());
    qs.set('size', (params?.size ?? 20).toString());
    return apiFetch<PokPage>(`/poks?${qs.toString()}`, {}, signal);
  },

  async getById(id: string, signal?: AbortSignal): Promise<Pok> {
    return apiFetch<Pok>(`/poks/${id}`, {}, signal);
  },

  async update(id: string, data: UpdatePokDto, signal?: AbortSignal): Promise<Pok> {
    // DEBUG: remove before merge — confirms what JSON body is sent over the wire.
    if (__DEV__) {
      console.log('[TitleUpdate] pokApi.update body:', JSON.stringify(data));
    }
    return apiFetch<Pok>(
      `/poks/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      signal
    );
  },

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/poks/${id}`, { method: 'DELETE' });
  },
};
