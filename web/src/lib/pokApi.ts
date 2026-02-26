import { apiFetch } from './api';
import type { Tag, TagSuggestion } from './tagApi';

/**
 * POK (Piece of Knowledge) data types.
 */
export interface Pok {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  pendingSuggestions: TagSuggestion[];
}

export interface CreatePokDto {
  title?: string | null;
  content: string;
}

export interface UpdatePokDto {
  title?: string | null;
  content: string;
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
   * @returns a page of matching POKs
   * @throws ApiRequestError on validation errors (400), unauthorized (401)
   */
  async getAll(params?: PokSearchParams): Promise<PokPage> {
    const queryParams = new URLSearchParams();

    // Add parameters only if they have values
    if (params?.keyword) queryParams.set('keyword', params.keyword);
    if (params?.searchMode) queryParams.set('searchMode', params.searchMode);
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
    return apiFetch<PokPage>(`/poks?${queryString}`);
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
};
