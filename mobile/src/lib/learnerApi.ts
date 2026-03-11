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

// ---------------------------------------------------------------------------
// Social discovery types
// ---------------------------------------------------------------------------

export type RelationshipStatus = 'NONE' | 'FOLLOWING' | 'FOLLOWED_BY' | 'COLLEAGUE';

export interface LearnerPokSummary {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
}

export interface LearnerProfileResponse {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  profileVisibility?: string | null;
  learnings?: LearnerPokSummary[] | null;
  relationshipStatus?: RelationshipStatus | null;
  followerCount?: number | null;
  followingCount?: number | null;
  colleagueCount?: number | null;
}

export interface LearnerSearchResult {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  relationship?: RelationshipStatus | null;
}

export interface LearnerSearchPage {
  content: LearnerSearchResult[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ---------------------------------------------------------------------------
// Social discovery functions
// ---------------------------------------------------------------------------

/**
 * Fetches the public profile of a learner by handle.
 */
export function getLearnerProfile(handle: string, signal?: AbortSignal): Promise<LearnerProfileResponse> {
  return apiFetch<LearnerProfileResponse>(`/learners/${handle}`, {}, signal);
}

/**
 * Follows a learner by handle (POST /learners/{handle}/follow).
 */
export function followLearner(handle: string, signal?: AbortSignal): Promise<void> {
  return apiFetch<void>(`/learners/${handle}/follow`, { method: 'POST' }, signal);
}

/**
 * Unfollows a learner by handle (DELETE /learners/{handle}/follow).
 */
export function unfollowLearner(handle: string, signal?: AbortSignal): Promise<void> {
  return apiFetch<void>(`/learners/${handle}/follow`, { method: 'DELETE' }, signal);
}

/**
 * Searches for learners by query string with optional pagination.
 */
export function searchLearners(
  q: string,
  params?: { page?: number; size?: number },
  signal?: AbortSignal
): Promise<LearnerSearchPage> {
  const search = new URLSearchParams({ q });
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.size !== undefined) search.set('size', String(params.size));
  return apiFetch<LearnerSearchPage>(`/learners/search?${search.toString()}`, {}, signal);
}
