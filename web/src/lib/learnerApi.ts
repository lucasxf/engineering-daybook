import { apiFetch } from './api';
import type { ProfileVisibility } from './auth';
import type { PokVisibility } from './pokApi';

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
