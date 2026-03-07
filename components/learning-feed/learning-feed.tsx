"use client";

import * as React from "react";
import { Navbar } from "./navbar";
import { PageHeader } from "./page-header";
import { SearchToolbar } from "./search-toolbar";
import { LearningCard } from "./learning-card";
import { LearningListSkeleton } from "./learning-card-skeleton";
import { Pagination } from "./pagination";
import { EmptyState } from "./empty-state";
import { NoResultsState } from "./no-results-state";
import { ErrorState } from "./error-state";
import type { Learning, SortOption, FeedState } from "@/lib/types";

interface LearningFeedProps {
  initialState?: FeedState;
  learnings?: Learning[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

export function LearningFeed({
  initialState = "populated",
  learnings = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
}: LearningFeedProps) {
  const [state, setState] = React.useState<FeedState>(initialState);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");
  const [isSearching, setIsSearching] = React.useState(false);
  const [page, setPage] = React.useState(currentPage);

  // Simulate search debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        setIsSearching(false);
        if (query.toLowerCase() === "noresults") {
          setState("noResults");
        } else {
          setState("populated");
        }
      }, 500);
    } else {
      setState(learnings.length > 0 ? "populated" : "empty");
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    // Would trigger re-fetch
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSortBy("newest");
    setState(learnings.length > 0 ? "populated" : "empty");
  };

  const handleRetry = () => {
    setState("loading");
    // Simulate retry
    setTimeout(() => {
      setState("populated");
    }, 1000);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Would trigger re-fetch
  };

  const showSearchToolbar = state !== "empty";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-6">
          {/* Page header */}
          <PageHeader
            learningCount={state === "empty" ? 0 : totalCount}
            showCta={state !== "empty"}
          />

          {/* Search toolbar */}
          {showSearchToolbar && (
            <SearchToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              isSearching={isSearching}
            />
          )}

          {/* Content area */}
          {state === "loading" && <LearningListSkeleton count={3} />}

          {state === "empty" && <EmptyState />}

          {state === "noResults" && (
            <NoResultsState
              searchQuery={searchQuery}
              onClearSearch={handleClearSearch}
            />
          )}

          {state === "error" && <ErrorState onRetry={handleRetry} />}

          {state === "populated" && (
            <>
              <div className="space-y-4">
                {learnings.map((learning) => (
                  <LearningCard
                    key={learning.id}
                    learning={learning}
                    onEdit={(id) => console.log("Edit:", id)}
                    onDelete={(id) => console.log("Delete:", id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
