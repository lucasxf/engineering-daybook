import { apiFetch } from './api';
import type { ProfileVisibility } from './auth';
import type { PokVisibility } from './pokApi';

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
}

/**
 * Fetches the learner profile for the given handle.
 * Returns either a full profile or a private shell depending on visibility.
 */
export function getLearnerProfile(handle: string): Promise<LearnerProfileResponse> {
  return apiFetch<LearnerProfileResponse>(`/learners/${encodeURIComponent(handle)}`);
}
