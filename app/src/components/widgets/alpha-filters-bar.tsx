"use client";

import { useState } from "react";

interface FilterGroup {
  label: string;
  options: string[];
}

const filterGroups: FilterGroup[] = [
  { label: "TIME REMAINING", options: ["All", "< 10 hrs", "< 1d", "< 3days", "< 7d"] },
  { label: "DISPUTED", options: ["Yes"] },
  { label: "ORACLE TYPE", options: ["All", "Polymarket internal", "UMA", "Feed"] },
  { label: "FEES", options: ["All", "No fees", "UMA", "Feed"] },
  { label: "AMBIGUOUS RULE", options: ["Yes"] },
  { label: "PRICE SWING POTENTIAL", options: ["All", "Low", "Medium", "High"] },
  { label: "TAIL BIAS", options: ["All", "Left", "Neutral", "High"] },
  { label: "RECENT ACTIVITY", options: ["All", "Whales", "Crowd only"] },
  { label: "TAGS", options: ["All", "Trump", "China", "China", "Economic Growth", "Africa", "Space", "Wars"] },
];

export function AlphaFiltersBar() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const toggleFilter = (group: string, option: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [group]: prev[group] === option ? "" : option,
    }));
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="bg-bg-base-1" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
      {/* Filter groups */}
      <div className="flex items-center gap-0 overflow-x-auto px-3 py-1.5">
        <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-quaternary">
          <span className="text-xs">◎</span>
        </div>
        <span className="mr-3 flex-shrink-0 text-[10px] font-medium text-text-secondary">
          Alpha Filters
        </span>

        {filterGroups.map((group) => (
          <div
            key={group.label}
            className="flex flex-shrink-0 items-center px-3" style={{ boxShadow: "inset -1px 0 0 0 var(--color-divider-thin)" }}
          >
            <span className="mr-2 text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
              {group.label}
            </span>
            <div className="flex items-center gap-0.5">
              {group.options.map((option) => {
                const isActive = activeFilters[group.label] === option || (option === "All" && !activeFilters[group.label]);
                return (
                  <button
                    key={`${group.label}-${option}`}
                    onClick={() => toggleFilter(group.label, option)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                      isActive
                        ? "bg-signal-green text-bg-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Filter actions */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 px-3 py-1.5" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
          <button className="flex items-center gap-1.5 rounded border border-border-secondary bg-bg-surface px-3 py-1 text-[11px] font-medium text-signal-green transition-colors duration-150 hover:bg-action-translucent-hover">
            <span>⊿</span> LOAD FILTER
          </button>
          <button className="flex items-center gap-1.5 rounded border border-border-secondary bg-bg-surface px-3 py-1 text-[11px] font-medium text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover">
            <span>×</span> CLEAR FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
