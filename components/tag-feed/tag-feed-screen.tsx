"use client";

import { useState, useMemo } from "react";
import { LearnimoNav } from "./learnimo-nav";
import { ViewSwitcherTabs, type ActiveView } from "./view-switcher-tabs";
import { SearchSortToolbar, type SortOption } from "./search-sort-toolbar";
import { TagGroupSection } from "./tag-group-section";
import { TagFeedSkeleton } from "./tag-feed-skeleton";
import {
  TagFeedEmpty,
  TagFeedNoResults,
  TagFeedError,
} from "./tag-feed-states";
import type { LearningItem } from "./learning-card";

/* ——————————————————————————————————————————————
   Sample data
—————————————————————————————————————————————— */
const ALL_LEARNINGS: LearningItem[] = [
  // Architecture
  {
    id: "a1",
    title: "Hexagonal Architecture vs. Layered",
    content:
      "Hexagonal (ports & adapters) inverts dependencies so the domain stays pure. Unlike layers, it makes the boundary explicit via interfaces rather than convention.",
    tags: [
      { id: "t-arch", label: "Architecture" },
      { id: "t-ts", label: "TypeScript" },
    ],
    createdAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "a2",
    title: "Event Sourcing fundamentals",
    content:
      "Rather than storing the latest state, event sourcing persists every state change as an immutable event. Replay gives you any past snapshot.",
    tags: [{ id: "t-arch", label: "Architecture" }],
    createdAt: "2024-11-15T08:30:00Z",
  },
  {
    id: "a3",
    title: "CQRS separates reads from writes",
    content:
      "Command Query Responsibility Segregation lets you scale reads and writes independently. The read model can be denormalised for performance.",
    tags: [
      { id: "t-arch", label: "Architecture" },
      { id: "t-test", label: "Testing" },
    ],
    createdAt: "2024-10-30T14:00:00Z",
  },

  // React
  {
    id: "r1",
    title: "useDeferredValue vs useTransition",
    content:
      "useDeferredValue is for deferring a value you receive; useTransition is for marking state updates as non-urgent. Both avoid blocking the UI.",
    tags: [{ id: "t-react", label: "React" }],
    createdAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "r2",
    title: "Server Components mental model",
    content:
      "RSC run only on the server — zero JS sent to the client. They can be async, fetch directly, and nest Client Components, but not vice versa.",
    tags: [
      { id: "t-react", label: "React" },
      { id: "t-ts", label: "TypeScript" },
    ],
    createdAt: "2024-11-28T11:00:00Z",
  },
  {
    id: "r3",
    title: "Context selectors avoid unnecessary re-renders",
    content:
      "Without selectors every consumer re-renders when any part of the context changes. useSyncExternalStore or Zustand selectors solve this elegantly.",
    tags: [{ id: "t-react", label: "React" }],
    createdAt: "2024-11-10T07:45:00Z",
  },

  // Testing
  {
    id: "test1",
    title: "Test boundary = behaviour, not implementation",
    content:
      "Tests coupled to internals break on refactors. Test what the user observes: rendered output, side effects, network calls — not private methods.",
    tags: [{ id: "t-test", label: "Testing" }],
    createdAt: "2024-11-25T16:00:00Z",
  },
  {
    id: "test2",
    title: "MSW intercepts at the network layer",
    content:
      "Mock Service Worker replaces network calls without patching fetch. Works in both browser (Service Worker) and Node (interceptor) — same handlers.",
    tags: [{ id: "t-test", label: "Testing" }],
    createdAt: "2024-11-05T13:30:00Z",
  },

  // TypeScript
  {
    id: "ts1",
    title: "Branded types prevent primitive obsession",
    content:
      "type UserId = string & { _brand: 'UserId' } makes IDs incompatible with plain strings. Zero runtime cost, full type safety.",
    tags: [{ id: "t-ts", label: "TypeScript" }],
    createdAt: "2024-12-03T10:00:00Z",
  },
  {
    id: "ts2",
    title: "Discriminated unions > nullable fields",
    content:
      "Instead of optional fields, model states explicitly: { status: 'loading' } | { status: 'ok'; data: T } | { status: 'error'; reason: string }.",
    tags: [{ id: "t-ts", label: "TypeScript" }],
    createdAt: "2024-11-22T15:00:00Z",
  },

  // Untagged
  {
    id: "u1",
    content:
      "Pomodoro still works if you treat interruptions as a reset, not a failure. The goal is deep focus, not perfect 25-minute blocks.",
    tags: [],
    createdAt: "2024-12-02T08:00:00Z",
  },
  {
    id: "u2",
    content:
      "Writing down a problem before asking for help forces you to articulate it — often you find the answer yourself in the process.",
    tags: [],
    createdAt: "2024-11-18T12:00:00Z",
  },
];

/* ——————————————————————————————————————————————
   Types
—————————————————————————————————————————————— */
type FeedState = "populated" | "all-untagged" | "single-tag" | "loading" | "empty" | "no-results" | "error";

/* ——————————————————————————————————————————————
   Main screen
—————————————————————————————————————————————— */
interface TagFeedScreenProps {
  theme: "dark" | "light";
  onToggle: () => void;
  forcedState?: FeedState;
}

export function TagFeedScreen({
  theme,
  onToggle,
  forcedState,
}: TagFeedScreenProps) {
  const [activeView, setActiveView] = useState<ActiveView>("tags");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  // Derive learnings list based on forced state
  const baseLearnings: LearningItem[] = useMemo(() => {
    if (forcedState === "empty") return [];
    if (forcedState === "all-untagged")
      return ALL_LEARNINGS.filter((l) => l.tags.length === 0);
    if (forcedState === "single-tag")
      return ALL_LEARNINGS.filter((l) =>
        l.tags.some((t) => t.id === "t-react")
      );
    return ALL_LEARNINGS;
  }, [forcedState]);

  // Filter by keyword
  const filteredLearnings = useMemo(() => {
    if (!keyword.trim()) return baseLearnings;
    const q = keyword.toLowerCase();
    return baseLearnings.filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.content.toLowerCase().includes(q) ||
        l.tags.some((t) => t.label.toLowerCase().includes(q))
    );
  }, [baseLearnings, keyword]);

  // Sort within each section
  function sortItems(items: LearningItem[]): LearningItem[] {
    return [...items].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      if (sort === "oldest") return da - db;
      return db - da; // newest / updated
    });
  }

  // Group by tag
  const tagMap = useMemo(() => {
    const map = new Map<string, { label: string; items: LearningItem[] }>();
    for (const l of filteredLearnings) {
      for (const tag of l.tags) {
        if (!map.has(tag.id)) map.set(tag.id, { label: tag.label, items: [] });
        map.get(tag.id)!.items.push(l);
      }
    }
    return map;
  }, [filteredLearnings]);

  const sortedTagEntries = useMemo(
    () =>
      Array.from(tagMap.entries()).sort(([, a], [, b]) =>
        a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
      ),
    [tagMap]
  );

  const untagged = useMemo(
    () => filteredLearnings.filter((l) => l.tags.length === 0),
    [filteredLearnings]
  );

  const allUntagged = tagMap.size === 0 && untagged.length > 0;
  const hasResults =
    sortedTagEntries.length > 0 || untagged.length > 0;

  // Determine what to render
  const isLoading = forcedState === "loading";
  const isError = forcedState === "error";
  const isEmpty = baseLearnings.length === 0;
  const isNoResults = !isEmpty && keyword.trim() !== "" && !hasResults;

  return (
    <div
      className="flex min-h-full flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <LearnimoNav theme={theme} onToggle={onToggle} />

      <main
        className="flex-1 mx-auto w-full max-w-[720px] px-0"
        id="tabpanel-tags"
        role="tabpanel"
        aria-labelledby="tab-tags"
      >
        {/* View switcher */}
        <ViewSwitcherTabs activeView={activeView} onChangeView={setActiveView} />

        {/* Toolbar */}
        {!isError && (
          <SearchSortToolbar
            keyword={keyword}
            sort={sort}
            onKeywordChange={setKeyword}
            onSortChange={setSort}
          />
        )}

        {/* Content area */}
        <div className="px-4 pt-2 pb-8">
          {isLoading && <TagFeedSkeleton sections={3} />}
          {isError && <TagFeedError onRetry={() => {}} />}
          {!isLoading && !isError && isEmpty && <TagFeedEmpty />}
          {!isLoading && !isError && !isEmpty && isNoResults && (
            <TagFeedNoResults keyword={keyword} />
          )}
          {!isLoading && !isError && !isEmpty && !isNoResults && (
            <>
              {sortedTagEntries.map(([tagId, { label, items }]) => (
                <TagGroupSection
                  key={tagId}
                  label={label}
                  count={items.length}
                  items={sortItems(items)}
                />
              ))}

              {untagged.length > 0 && (
                <TagGroupSection
                  label="Sem etiqueta"
                  count={untagged.length}
                  items={sortItems(untagged)}
                  isUntagged
                  showNudge={allUntagged}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
