import { LogoLink } from "@/components/ui/LogoLink";
import { Avatar } from "@/components/ui/Avatar";

export function LearningNavBar() {
  return (
    <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
      <LogoLink />

      {/* User avatar (mock for demo) */}
      <button
        aria-label="Menu do usuário"
        className="rounded-full ring-2 ring-transparent transition-all hover:ring-[var(--color-input-focus)] focus-visible:outline-none focus-visible:ring-[var(--color-input-focus)]"
      >
        <Avatar
          displayName="John Doe"
          handle="johndoe"
          size={32}
        />
      </button>
    </header>
  );
}
