'use client';

export default function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-border bg-card/50 p-4 dark:border-mid-blue dark:bg-primary-blue/50"
        >
          <div className="space-y-3">
            {/* Title skeleton */}
            <div className="h-6 w-3/4 rounded bg-input dark:bg-mid-blue/50 animate-pulse" />

            {/* Content skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-input dark:bg-mid-blue/50 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-input dark:bg-mid-blue/50 animate-pulse" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="h-6 w-16 rounded bg-input dark:bg-mid-blue/50 animate-pulse"
                />
              ))}
            </div>

            {/* Timestamps skeleton */}
            <div className="h-3 w-1/2 rounded bg-input dark:bg-mid-blue/50 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
