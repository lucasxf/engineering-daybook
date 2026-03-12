"use client";

export interface TagChip {
  id: string;
  label: string;
}

export interface LearningItem {
  id: string;
  title?: string;
  content: string;
  tags: TagChip[];
  createdAt: string;
}

interface LearningCardProps {
  item: LearningItem;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max) + "…";
}

export function LearningCard({ item }: LearningCardProps) {
  const header = item.title?.trim()
    ? item.title
    : truncate(item.content, 50);
  const preview = truncate(item.content, 120);

  return (
    <article
      className="group relative rounded-xl border transition-all duration-150 cursor-pointer hover:-translate-y-px"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-card-border)",
      }}
      tabIndex={0}
      role="article"
      aria-label={`Aprendizado: ${header}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
        }
      }}
    >
      <div className="p-4">
        {/* Title */}
        <h3
          className="mb-1.5 font-sans text-sm font-medium leading-snug text-balance"
          style={{ color: "var(--color-card-foreground)" }}
        >
          {header}
        </h3>

        {/* Content preview */}
        <p
          className="mb-3 text-xs leading-relaxed text-pretty"
          style={{ color: "var(--color-nudge-text)" }}
        >
          {preview}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-chip-bg)",
                  color: "var(--color-chip-text)",
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <time
          dateTime={item.createdAt}
          className="text-xs"
          style={{ color: "var(--color-tag-count-text)" }}
        >
          {formatDate(item.createdAt)}
        </time>
      </div>
    </article>
  );
}
