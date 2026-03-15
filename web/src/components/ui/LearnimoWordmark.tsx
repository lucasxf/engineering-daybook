export function LearnimoWordmark({ className, ariaHidden }: { className?: string; ariaHidden?: boolean }) {
  return (
    <span
      className={`font-wordmark text-foreground tracking-tight select-none ${className ?? ""}`}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : "learnimo"}
    >
      <span className="font-normal">learn</span>
      <span className="font-bold">imo</span>
    </span>
  );
}
