"use client";

import { LearningCard, type LearningItem } from "./learning-card";

interface TagGroupSectionProps {
  label: string;
  count: number;
  items: LearningItem[];
  isUntagged?: boolean;
  showNudge?: boolean;
}

export function TagGroupSection({
  label,
  count,
  items,
  isUntagged = false,
  showNudge = false,
}: TagGroupSectionProps) {
  return (
    <section aria-labelledby={`section-${label.replace(/\s+/g, "-")}`} className="mb-8">
      {/* Section header — visual divider with accent bar */}
      <div
        className="mb-4 flex items-center gap-3 pl-3 border-l-2"
        style={{
          borderColor: isUntagged
            ? "var(--color-tag-untagged-bar)"
            : "var(--color-tag-accent)",
        }}
      >
        <h2
          id={`section-${label.replace(/\s+/g, "-")}`}
          className="font-heading text-base font-semibold tracking-tight"
          style={{ color: "var(--color-tag-header-text)" }}
        >
          {label}
        </h2>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-tag-count)",
            color: "var(--color-tag-count-text)",
          }}
          aria-label={`${count} aprendizado${count !== 1 ? "s" : ""}`}
        >
          {count} aprendizado{count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Learning cards */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <LearningCard key={item.id} item={item} />
        ))}
      </div>

      {/* Tag nudge — shown inside Untagged when showNudge=true */}
      {showNudge && (
        <div className="mt-4 rounded-lg border border-dashed px-4 py-3" style={{ borderColor: "var(--color-card-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-nudge-text)" }}>
            Adicione etiquetas para organizar seus aprendizados por tema.{" "}
            <a
              href="#"
              className="font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
              style={{ color: "var(--color-nudge-link)" }}
            >
              Começar a etiquetar
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
