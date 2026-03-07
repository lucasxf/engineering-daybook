export interface Tag {
  id: string;
  name: string;
  displayName: string;
}

export interface Learning {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export type SortOption = "newest" | "oldest" | "recentlyUpdated" | "firstCreated";

export type FeedState = "loading" | "populated" | "empty" | "noResults" | "error";
