"use client";

const TABS = [
  { id: "feed", label: "Feed" },
  { id: "tags", label: "Tags" },
  { id: "timeline", label: "Linha do Tempo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ViewSwitcherProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export function ViewSwitcher({
  activeTab = "timeline",
  onTabChange,
}: ViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Visualizações do diário"
      className="
        flex border-b border-card-border
        bg-background
      "
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange?.(tab.id)}
            className={[
              "relative flex-1 py-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-focus)]",
              isActive
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
