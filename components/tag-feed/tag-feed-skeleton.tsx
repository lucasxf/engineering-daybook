"use client";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className ?? ""}`}
      style={{
        background: `linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-to) 50%, var(--color-skeleton-from) 75%)`,
        backgroundSize: "800px 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
      }}
      aria-hidden="true"
    />
  );
}

function CardSkeleton() {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-card-border)",
      }}
    >
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <SkeletonBox className="h-5 w-14 rounded-full" />
        <SkeletonBox className="h-5 w-10 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-20" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="mb-8">
      {/* Section header skeleton */}
      <div className="mb-4 flex items-center gap-3 pl-3 border-l-2" style={{ borderColor: "var(--color-skeleton-to)" }}>
        <SkeletonBox className="h-5 w-24" />
        <SkeletonBox className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

interface TagFeedSkeletonProps {
  sections?: number;
}

export function TagFeedSkeleton({ sections = 3 }: TagFeedSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando aprendizados"
      className="px-4 py-4"
    >
      {Array.from({ length: sections }).map((_, i) => (
        <SectionSkeleton key={i} />
      ))}
    </div>
  );
}
