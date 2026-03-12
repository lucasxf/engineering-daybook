export interface Tag {
  id: string;
  name: string;
  displayName: string;
}

export interface Learning {
  id: string;
  title?: string;
  content: string;
  tags: Tag[];
  createdAt: string;
}

export interface MonthGroup {
  monthKey: string; // "2026-03"
  monthDate: string; // ISO string for any day in that month
  learnings: Learning[];
}

export type SortOption = "newest" | "oldest" | "updated";

export type TimelineState =
  | "populated"
  | "single-month"
  | "loading"
  | "empty"
  | "no-results"
  | "error";
