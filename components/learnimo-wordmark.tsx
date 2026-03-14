export function LearnimoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-wordmark text-foreground tracking-tight select-none ${className ?? ""}`}
      aria-label="learnimo"
    >
      <span className="font-normal">learn</span>
      <span className="font-bold">imo</span>
    </span>
  );
}
