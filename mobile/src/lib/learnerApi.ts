import { apiFetch } from './api';
import type { Pok } from './pokApi';

/** A re-learning (shared POK) created by one learner referencing another's public learning. */
export interface PokShare {
  type: 'shared';
  id: string;
  originalPokId: string;
  originalPok: Pok | null;
  sharedByHandle: string;
  note: string | null;
  visibility: string;
  createdAt: string;
  originalAuthorHandle: string | null;
  originalAuthorDisplayName: string | null;
  originalAuthorAvatarUrl: string | null;
}

/** An owned POK returned as part of the social feed (includes author identity fields). */
export interface OwnedFeedItem extends Pok {
  type: 'owned';
  authorHandle: string | null;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
}

/** Union type for feed items — an owned POK or a re-learning. */
export type FeedItem = OwnedFeedItem | PokShare;

/** Page of feed items (owned POKs mixed with re-learnings). */
export interface FeedPage {
  content: FeedItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

/**
 * Returns the discovery feed for the authenticated user (social feed).
 * Items are sorted newest-first and include learnings from followed learners.
 */
export function getFeed(
  params?: { page?: number; size?: number },
  signal?: AbortSignal
): Promise<FeedPage> {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.size !== undefined) search.set('size', String(params.size));
  const qs = search.toString();
  return apiFetch<FeedPage>(`/feed${qs ? '?' + qs : ''}`, {}, signal);
}
