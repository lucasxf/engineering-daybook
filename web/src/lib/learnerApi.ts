import { apiFetch } from './api';
import type { ProfileVisibility } from './auth';
import type { FeedPage, PokVisibility } from './pokApi';

export type RelationshipStatus = 'NONE' | 'FOLLOWING' | 'FOLLOWED_BY' | 'COLLEAGUE';

export interface LearnerPokSummary {
  id: string;
  title: string | null;
  content: string;
  /** Present only when the requesting user is the profile owner. */
  visibility?: PokVisibility;
  createdAt: string;
}

export interface LearnerProfileResponse {
  handle: string;
  /** Present only for full (non-private) profiles. */
  displayName?: string;
  /** Present only for full (non-private) profiles. */
  avatarUrl?: string;
  /** Present only for full (non-private) profiles. */
  bio?: string;
  /** Present only in private shell responses. */
  profileVisibility?: ProfileVisibility;
  /** Present only for full (non-private) profiles. */
  learnings?: LearnerPokSummary[];
  /** Present only when the requesting user is the profile owner. */
  learningCount?: number;
  /** Relationship of the requester to the profile owner. Absent for owners and private shells. */
  relationshipStatus?: RelationshipStatus;
  /** Present only when the requesting user is the profile owner (anti-vanity). */
  followerCount?: number;
  /** Present only when the requesting user is the profile owner (anti-vanity). */
  followingCount?: number;
  /** Present only when the requesting user is the profile owner (anti-vanity). */
  colleagueCount?: number;
}

/**
 * Fetches the learner profile for the given handle.
 * Returns either a full profile or a private shell depending on visibility.
 */
export function getLearnerProfile(handle: string): Promise<LearnerProfileResponse> {
  return apiFetch<LearnerProfileResponse>(`/learners/${encodeURIComponent(handle)}`);
}

/**
 * Follows the learner with the given handle.
 */
export function followLearner(handle: string): Promise<void> {
  return apiFetch<void>(`/learners/${encodeURIComponent(handle)}/follow`, {
    method: 'POST',
  });
}

/**
 * Unfollows the learner with the given handle.
 */
export function unfollowLearner(handle: string): Promise<void> {
  return apiFetch<void>(`/learners/${encodeURIComponent(handle)}/follow`, {
    method: 'DELETE',
  });
}

/** A single learner search result. */
export interface LearnerSearchResult {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  relationship: RelationshipStatus | null;
}

/** Paginated learner search response. */
export interface LearnerSearchPage {
  content: LearnerSearchResult[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Returns the discovery feed for the authenticated user (social feed).
 * Items are sorted newest-first and include learnings from followed learners.
 */
export function getFeed(params?: { page?: number; size?: number }): Promise<FeedPage> {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.size !== undefined) search.set('size', String(params.size));
  const qs = search.toString();
  return apiFetch<FeedPage>(`/feed${qs ? '?' + qs : ''}`);
}

/**
 * Searches PUBLIC learners by handle or display name.
 * Queries shorter than 2 characters return an empty page.
 */
export function searchLearners(
  q: string,
  params?: { page?: number; size?: number }
): Promise<LearnerSearchPage> {
  const search = new URLSearchParams({ q });
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.size !== undefined) search.set('size', String(params.size));
  return apiFetch<LearnerSearchPage>(`/learners/search?${search.toString()}`);
}
