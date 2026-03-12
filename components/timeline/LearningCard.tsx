"use client";

import type { Learning } from "./types";
import { Calendar } from "lucide-react";

interface LearningCardProps {
  learning: Learning;
}

export function LearningCard({ learning }: LearningCardProps) {
  // Title = learning.title or first 50 chars of content
  const header =
    learning.title && learning.title.trim()
      ? learning.title
      : truncate(learning.content, 50);

  // Content preview: first 120 chars
  const contentPreview = truncate(learning.content, 120);

  // Format date (locale-aware placeholder, hardcoded for now)
  const date = new Date(learning.createdAt);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className="
        group relative overflow-hidden rounded-lg border shadow-sm
        transition-all duration-200
        bg-card border-card-border
        hover:-translate-y-0.5 hover:shadow-md hover:border-[#2B4A78]
        dark:hover:border-[#2B4A78]
      "
    >
      <a href="#" className="block p-4">
        <h3 className="mb-2 text-balance text-lg font-medium leading-snug text-card-foreground">
          {header}
        </h3>
        <p className="mb-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          {contentPreview}
        </p>

        {/* Tags */}
        {learning.tags && learning.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {learning.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="
                  inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                  dark:bg-[#2B4A78] dark:text-[#8B9EC2]
                  bg-[#E0E8F2] text-[#1A365D]
                "
              >
                {tag.displayName}
              </span>
            ))}
            {learning.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                +{learning.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <time dateTime={learning.createdAt}>{formattedDate}</time>
        </div>
      </a>
    </article>
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
