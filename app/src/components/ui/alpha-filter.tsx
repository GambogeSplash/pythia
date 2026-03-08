"use client";

import { useState } from "react";

const filters = ["All", "Long shots", "Can swing", "Sentiment Shifting", "Whales Moving"];

interface AlphaFilterProps {
  extraFilters?: string[];
}

export function AlphaFilter({ extraFilters }: AlphaFilterProps) {
  const [active, setActive] = useState("All");
  const allFilters = extraFilters ? [...filters.slice(0, 1), ...extraFilters, ...filters.slice(1)] : filters;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <span className="text-[10px] text-text-quaternary">
        <span className="mr-1">◎</span>Alpha Filter:
      </span>
      {allFilters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActive(filter)}
          className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors duration-150 ${
            active === filter
              ? "bg-signal-green text-bg-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
