"use client";

import { KeyboardEvent } from "react";

export type ActiveView = "feed" | "tags" | "timeline";

interface ViewSwitcherTabsProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
}

const TABS: { id: ActiveView; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "tags", label: "Tags" },
  { id: "timeline", label: "Linha do Tempo" },
];

export function ViewSwitcherTabs({
  activeView,
  onChangeView,
}: ViewSwitcherTabsProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      const next = (index + 1) % TABS.length;
      onChangeView(TABS[next].id);
    } else if (e.key === "ArrowLeft") {
      const prev = (index - 1 + TABS.length) % TABS.length;
      onChangeView(TABS[prev].id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Visualizações"
      className="flex border-b"
      style={{ borderColor: "var(--color-nav-border)" }}
    >
      {TABS.map((tab, i) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChangeView(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-input-focus)]"
            style={{
              color: isActive
                ? "var(--color-tab-active)"
                : "var(--color-tab-inactive)",
              borderBottom: isActive
                ? "2px solid var(--color-tab-active)"
                : "2px solid transparent",
              marginBottom: "-1px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
