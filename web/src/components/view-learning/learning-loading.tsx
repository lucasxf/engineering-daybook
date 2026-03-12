export function LearningLoading() {
  return (
    <div aria-busy="true" aria-label="Carregando aprendizado..." className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 h-4 w-36 rounded-md bg-card-border opacity-60" />

      {/* Header row skeleton */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-8 w-3/4 rounded-lg bg-card-border" />
          <div className="h-8 w-1/2 rounded-lg bg-card-border opacity-60" />
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="h-8 w-16 rounded-md bg-card-border opacity-70" />
          <div className="h-8 w-20 rounded-md bg-card-border opacity-70" />
        </div>
      </div>

      {/* Metadata row skeleton */}
      <div className="mb-6 flex gap-2">
        <div className="h-3 w-48 rounded bg-card-border opacity-50" />
        <div className="h-3 w-4 rounded bg-card-border opacity-30" />
        <div className="h-3 w-52 rounded bg-card-border opacity-50" />
      </div>

      {/* Content card skeleton */}
      <div className="rounded-xl border border-card-border bg-card p-6 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-card-border opacity-60" />
          <div className="h-4 w-5/6 rounded bg-card-border opacity-50" />
          <div className="h-4 w-full rounded bg-card-border opacity-60" />
          <div className="h-4 w-4/6 rounded bg-card-border opacity-40" />
        </div>
        <div className="mt-5 h-24 w-full rounded-lg bg-card-border opacity-30" />
        <div className="mt-5 space-y-3">
          <div className="h-4 w-full rounded bg-card-border opacity-50" />
          <div className="h-4 w-3/4 rounded bg-card-border opacity-40" />
          <div className="h-4 w-5/6 rounded bg-card-border opacity-50" />
        </div>
        {/* Tags skeleton */}
        <div className="mt-8 flex gap-2">
          {[64, 96, 80, 112].map((w) => (
            <div
              key={w}
              style={{ width: w }}
              className="h-5 rounded-full bg-card-border opacity-40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
