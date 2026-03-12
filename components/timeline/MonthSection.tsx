"use client";

import type { MonthGroup } from "./types";
import { LearningCard } from "./LearningCard";

interface MonthSectionProps {
  group: MonthGroup;
}

function formatMonthHeader(monthDate: string): string {
  const date = new Date(monthDate);
  const raw = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  // Capitalize first letter, e.g. "março de 2026" → "Março de 2026"
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function MonthSection({ group }: MonthSectionProps) {
  const label = formatMonthHeader(group.monthDate);
  const count = group.learnings.length;

  return (
    <section className="mb-10" aria-labelledby={`month-${group.monthKey}`}>
      {/* Month/year header — typographic separator, never card-like */}
      <div className="mb-5 flex items-center gap-3">
        <h2
          id={`month-${group.monthKey}`}
          className="
            shrink-0 font-heading text-2xl font-semibold text-balance text-foreground
          "
          style={{ fontFamily: "var(--font-sora)" }}
        >
          {label}
        </h2>

        {/* Count badge */}
        <span
          className="
            inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium
            dark:bg-[#2B4A78] dark:text-[#8899AA]
            bg-[#E8E4DF] text-[#666666]
          "
        >
          {count} {count === 1 ? "aprendizado" : "aprendizados"}
        </span>

        {/* Horizontal rule extends to the right */}
        <div
          className="h-px flex-1"
          style={{ backgroundColor: "var(--color-card-border)" }}
          aria-hidden="true"
        />
      </div>

      {/* Learning cards */}
      <div className="flex flex-col gap-3">
        {group.learnings.map((learning) => (
          <LearningCard key={learning.id} learning={learning} />
        ))}
      </div>
    </section>
  );
}
