"use client";

interface LearningCardProps {
  title: string;
  excerpt: string;
  tags: string[];
  timestamp: string;
}

export function LearningCard({ title, excerpt, tags, timestamp }: LearningCardProps) {
  return (
    <article
      tabIndex={0}
      className="rounded-xl border border-card-border bg-card px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] transition-colors hover:border-[var(--color-mid-blue,#2B4A78)] cursor-pointer"
    >
      <h3 className="font-heading text-[15px] font-semibold leading-snug text-card-foreground text-balance">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {excerpt}
      </p>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-tag-bg, #2B4A78)",
                color: "var(--color-tag-text, #8B9EC2)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs" style={{ color: "var(--color-timestamp, #66778A)" }}>
        {timestamp}
      </p>
    </article>
  );
}

export function LearningCardSkeleton() {
  return (
    <div className="rounded-xl border border-card-border bg-card px-5 py-4 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-card-border" />
      <div className="mt-2 h-3 w-full rounded bg-card-border" />
      <div className="mt-1 h-3 w-2/3 rounded bg-card-border" />
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-14 rounded bg-card-border" />
        <div className="h-5 w-10 rounded bg-card-border" />
      </div>
      <div className="mt-3 h-3 w-20 rounded bg-card-border" />
    </div>
  );
}
