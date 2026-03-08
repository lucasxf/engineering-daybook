import { apiFetch } from './api';
import type { Tag, TagSuggestion } from './tagApi';

/**
 * POK (Piece of Knowledge) data types.
 */
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
}

export interface CreatePokDto {
  title?: string | null;
  content: string;
  tagIds?: string[];
  visibility?: PokVisibility;
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

// Note: When no filters are passed, /api/v1/poks returns FeedPage (mixed feed).
// When any filter is provided, it returns PokPage (owned POKs only).
export type PokListPage = PokPage | FeedPage;

export type SearchMode = 'hybrid' | 'semantic' | 'keyword';

/** A re-learning (shared POK) created by one learner referencing another learner's public learning. */
export interface PokShare {
  type: 'shared';
  id: string;
  originalPokId: string;
  originalPok: Pok;
  sharedByHandle: string;
  note: string | null;
  visibility: PokVisibility;
  createdAt: string;
  /** Original author's handle — populated in the discovery feed context; null on single-share detail. */
  originalAuthorHandle: string | null;
  /** Original author's display name — populated in the discovery feed context; null on single-share detail. */
  originalAuthorDisplayName: string | null;
  /** Original author's avatar URL — populated in the discovery feed context; null on single-share detail. */
  originalAuthorAvatarUrl: string | null;
}

/** Union type for feed items — an owned POK or a re-learning. */
export type FeedItem = (Pok & { type: 'owned' }) | PokShare;

/** Page of feed items (owned POKs mixed with re-learnings). */
export interface FeedPage {
  content: FeedItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface CreatePokShareDto {
  note?: string | null;
  visibility?: PokVisibility | null;
}

export interface PokSearchParams {
  keyword?: string;
  searchMode?: SearchMode;
  tagId?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  createdFrom?: string; // ISO 8601
  createdTo?: string;   // ISO 8601
  updatedFrom?: string; // ISO 8601
  updatedTo?: string;   // ISO 8601
  page?: number;
  size?: number;
}

/**
 * API client for POK CRUD operations.
 *
 * All endpoints require authentication (JWT token managed by apiFetch).
 */
export const pokApi = {
  /**
   * Creates a new POK.
   *
   * @param data POK creation data (title optional, content mandatory)
   * @returns the created POK
   * @throws ApiRequestError on validation errors (400), unauthorized (401)
   */
  async create(data: CreatePokDto): Promise<Pok> {
    return apiFetch<Pok>('/poks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Retrieves and searches POKs for the authenticated user.
   *
   * Supports:
   * - Keyword search (searches title and content)
   * - Sorting (by createdAt or updatedAt, ASC/DESC)
   * - Date range filtering (creation and update dates)
   * - Pagination
   *
   * @param params optional search/filter/sort parameters
   * @returns a page of matching POKs or feed items (mixed owned + shared) when no filters applied
   * @throws ApiRequestError on validation errors (400), unauthorized (401)
   */
  async getAll(params?: PokSearchParams): Promise<PokListPage> {
    const queryParams = new URLSearchParams();

    // Add parameters only if they have values
    if (params?.keyword) queryParams.set('keyword', params.keyword);
    if (params?.searchMode) queryParams.set('searchMode', params.searchMode);
    if (params?.tagId) queryParams.set('tagId', params.tagId);
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.set('sortDirection', params.sortDirection);
    if (params?.createdFrom) queryParams.set('createdFrom', params.createdFrom);
    if (params?.createdTo) queryParams.set('createdTo', params.createdTo);
    if (params?.updatedFrom) queryParams.set('updatedFrom', params.updatedFrom);
    if (params?.updatedTo) queryParams.set('updatedTo', params.updatedTo);

    // Always include page and size (with defaults)
    queryParams.set('page', (params?.page ?? 0).toString());
    queryParams.set('size', (params?.size ?? 20).toString());

    const queryString = queryParams.toString();
    return apiFetch<PokListPage>(`/poks?${queryString}`);
  },

  /**
   * Retrieves a single POK by ID.
   *
   * @param id POK ID
   * @returns the POK
   * @throws ApiRequestError on not found (404), forbidden (403), unauthorized (401)
   */
  async getById(id: string): Promise<Pok> {
    return apiFetch<Pok>(`/poks/${id}`);
  },

  /**
   * Updates a POK.
   *
   * @param id POK ID
   * @param data update data (title optional, content mandatory)
   * @returns the updated POK
   * @throws ApiRequestError on validation errors (400), not found (404), forbidden (403), unauthorized (401)
   */
  async update(id: string, data: UpdatePokDto): Promise<Pok> {
    return apiFetch<Pok>(`/poks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft deletes a POK.
   *
   * The POK is marked as deleted and will no longer appear in queries.
   * Restore functionality will be added in Phase 2.
   *
   * @param id POK ID
   * @throws ApiRequestError on not found (404), forbidden (403), unauthorized (401)
   */
  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/poks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Re-learns (shares) a public learning from another learner.
   *
   * Creates a reference to the original learning attributed to its author.
   * The original content is never modified.
   *
   * @param originalPokId ID of the original public learning to re-learn
   * @param data optional note and visibility (defaults to original's visibility)
   * @returns the created PokShare
   * @throws ApiRequestError on self-share or non-public original (400), not found (404),
   *         duplicate re-learning (409), unauthorized (401)
   */
  async share(originalPokId: string, data: CreatePokShareDto): Promise<PokShare> {
    return apiFetch<PokShare>(`/poks/${originalPokId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Removes a re-learning. Only the sharer can remove their own re-learning.
   *
   * @param shareId the re-learning ID to remove
   * @throws ApiRequestError on not owner (403), not found (404), unauthorized (401)
   */
  async unshare(shareId: string): Promise<void> {
    return apiFetch<void>(`/poks/shared/${shareId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Returns the detail for a re-learning by ID.
   *
   * Access is governed by the share's visibility tier and the requester's
   * relationship with the sharer.
   *
   * @param shareId the re-learning ID
   * @returns the PokShare detail
   * @throws ApiRequestError on access denied (403), not found (404), unauthorized (401)
   */
  async getShareById(shareId: string): Promise<PokShare> {
    return apiFetch<PokShare>(`/poks/shared/${shareId}`);
  },
};
