import { LearnimoWordmark } from "@/components/learnimo-wordmark";

export function LearningNavBar() {
  return (
    <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
      <a
        href="#"
        aria-label="learnimo — ir para o feed"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
      >
        <LearnimoWordmark className="text-xl" />
      </a>

      {/* User avatar (mock) */}
      <button
        aria-label="Menu do usuário"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#2B4A78] text-xs font-semibold text-[#8B9EC2] ring-2 ring-transparent transition-all hover:ring-[var(--color-input-focus)] focus-visible:outline-none focus-visible:ring-[var(--color-input-focus)]"
      >
        JD
      </button>
    </header>
  );
}
