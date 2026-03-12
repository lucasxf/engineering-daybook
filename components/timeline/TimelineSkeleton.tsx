"use client";

function SkeletonPulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--color-card) 0%, var(--color-card-border) 50%, var(--color-card) 100%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-card-border bg-card p-4">
      {/* Title */}
      <SkeletonPulse className="mb-3 h-5 w-3/4" />
      {/* Body lines */}
      <SkeletonPulse className="mb-2 h-3.5 w-full" />
      <SkeletonPulse className="mb-3 h-3.5 w-5/6" />
      {/* Tags */}
      <div className="mb-2 flex gap-1.5">
        <SkeletonPulse className="h-5 w-12 rounded-full" />
        <SkeletonPulse className="h-5 w-16 rounded-full" />
      </div>
      {/* Date */}
      <SkeletonPulse className="h-3 w-24" />
    </div>
  );
}

function MonthGroupSkeleton() {
  return (
    <div className="mb-10">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <SkeletonPulse className="h-7 w-40" />
        <SkeletonPulse className="h-5 w-20 rounded-full" />
        <div className="h-px flex-1 bg-card-border" />
      </div>
      {/* Cards */}
      <div className="flex flex-col gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div aria-busy="true" aria-label="Carregando linha do tempo…" className="px-5 py-4">
        <MonthGroupSkeleton />
        <MonthGroupSkeleton />
      </div>
    </>
  );
}
