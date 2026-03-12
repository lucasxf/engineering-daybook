"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TimelineNavBar } from "./TimelineNavBar";
import { ViewSwitcher } from "./ViewSwitcher";
import { SearchSortToolbar } from "./SearchSortToolbar";
import { MonthSection } from "./MonthSection";
import { TimelineSkeleton } from "./TimelineSkeleton";
import { EmptyState, NoResultsState, ErrorState } from "./TimelineEmptyStates";
import type { SortOption, TimelineState, MonthGroup } from "./types";
import { MOCK_MONTH_GROUPS, MOCK_SINGLE_MONTH } from "./mock-data";

interface TimelineScreenProps {
  /** Which demo state to show */
  demoState?: TimelineState;
}

export function TimelineScreen({ demoState = "populated" }: TimelineScreenProps) {
  // For "no-results" demo state, seed the keyword so the empty state is immediately visible
  const initialKeyword = demoState === "no-results" ? "quantum entanglement" : "";
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When demoState changes externally, reset keyword
  useEffect(() => {
    const kw = demoState === "no-results" ? "quantum entanglement" : "";
    setKeyword(kw);
    setDebouncedKeyword(kw);
  }, [demoState]);

  // Debounce keyword 300 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  // Source data depends on demo state
  const sourceGroups: MonthGroup[] = useMemo(() => {
    if (demoState === "single-month") return MOCK_SINGLE_MONTH;
    if (demoState === "loading" || demoState === "empty" || demoState === "error")
      return [];
    // "no-results" uses full data but the keyword filter collapses every group
    return MOCK_MONTH_GROUPS;
  }, [demoState]);

  // Filter and sort
  const filteredGroups = useMemo<MonthGroup[]>(() => {
    const kw = debouncedKeyword.trim().toLowerCase();

    let groups = sourceGroups.map((g) => {
      const learnings = kw
        ? g.learnings.filter(
            (l) =>
              l.title?.toLowerCase().includes(kw) ||
              l.content.toLowerCase().includes(kw) ||
              l.tags.some((t) => t.displayName.toLowerCase().includes(kw))
          )
        : g.learnings;
      return { ...g, learnings };
    });

    // Collapse empty groups
    groups = groups.filter((g) => g.learnings.length > 0);

    // Sort within each group
    groups = groups.map((g) => {
      const sorted = [...g.learnings].sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return sortBy === "oldest" ? ta - tb : tb - ta;
      });
      return { ...g, learnings: sorted };
    });

    return groups;
  }, [sourceGroups, debouncedKeyword, sortBy]);

  // Resolve which content area to render
  const isLoading = demoState === "loading";
  const isError = demoState === "error";
  const isEmptyBase = demoState === "empty";
  const hasNoResults =
    !isLoading && !isError && !isEmptyBase && filteredGroups.length === 0 && debouncedKeyword.trim() !== "";
  const isTrulyEmpty =
    !isLoading && !isError && !isEmptyBase && filteredGroups.length === 0 && debouncedKeyword.trim() === "";

  return (
    <div className="flex h-full min-h-full flex-col bg-background font-sans">
      <TimelineNavBar />
      <ViewSwitcher activeTab="timeline" />
      <SearchSortToolbar
        keyword={keyword}
        sortBy={sortBy}
        onKeywordChange={setKeyword}
        onSortChange={setSortBy}
      />

      <main
        id="tabpanel-timeline"
        role="tabpanel"
        aria-labelledby="tab-timeline"
        className="flex-1 px-5 py-6 overflow-y-auto"
      >
        {isLoading && <TimelineSkeleton />}

        {isError && <ErrorState />}

        {isEmptyBase && <EmptyState />}

        {hasNoResults && <NoResultsState keyword={debouncedKeyword} />}

        {isTrulyEmpty && !isEmptyBase && <EmptyState />}

        {!isLoading && !isError && !isEmptyBase && filteredGroups.length > 0 &&
          filteredGroups.map((group) => (
            <MonthSection key={group.monthKey} group={group} />
          ))}
      </main>
    </div>
  );
}
