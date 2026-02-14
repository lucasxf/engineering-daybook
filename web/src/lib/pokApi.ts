import { apiFetch } from './api';

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
   * Retrieves all POKs for the authenticated user with pagination.
   *
   * @param page page number (0-indexed, default 0)
   * @param size page size (default 20)
   * @returns a page of POKs sorted by most recently updated
   * @throws ApiRequestError on unauthorized (401)
   */
  async getAll(page = 0, size = 20): Promise<PokPage> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return apiFetch<PokPage>(`/poks?${queryParams}`);
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
