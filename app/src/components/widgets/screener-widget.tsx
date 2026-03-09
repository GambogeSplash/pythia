"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  Zap,
} from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";
import { formatVolume, truncate, formatTimeLeft } from "@/lib/format";
import type { Market } from "@/lib/api/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["All", "Politics", "Crypto", "Sports", "Macro", "Tech", "Culture"] as const;

type SortField = "volume" | "price" | "change" | "liquidity" | "rvol";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortField, string> = {
  volume: "Volume",
  price: "Price",
  change: "Change",
  liquidity: "Liquidity",
  rvol: "RVOL",
};

type QuickFilter = "highVolume" | "volatile" | "underpriced" | "closingSoon";

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "highVolume", label: "High Volume" },
  { key: "volatile", label: "Volatile" },
  { key: "underpriced", label: "Underpriced (<20\u00A2)" },
  { key: "closingSoon", label: "Closing <24h" },
];

const categoryBadgeVariant: Record<string, "green" | "blue" | "amber" | "red" | "neutral"> = {
  Politics: "blue",
  Crypto: "amber",
  Sports: "green",
  Macro: "neutral",
  Tech: "blue",
  Culture: "red",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random from market id — used for RVOL & 24h change */
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deriveRvol(m: Market): number {
  const seed = hashSeed(m.id);
  // 0.5x - 15x, weighted toward lower values
  return +(0.5 + ((seed % 1000) / 1000) * 14.5).toFixed(1);
}

function derive24hChange(m: Market): number {
  const seed = hashSeed(m.id + "chg");
  // -25% to +40%
  return +(-25 + ((seed % 1000) / 1000) * 65).toFixed(1);
}

function liquidityScore(m: Market): number {
  // Normalize liquidity to 0-100 range
  return Math.min(100, Math.round((m.liquidity / 500_000) * 100));
}

/* ------------------------------------------------------------------ */
/*  Column header                                                      */
/* ------------------------------------------------------------------ */

function ColHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`group/col flex items-center gap-0.5 text-label-10 tracking-wider transition-colors ${
        align === "right" ? "justify-end" : ""
      } ${active ? "text-signal-green" : "text-text-quaternary hover:text-text-secondary"}`}
    >
      {label}
      <span className="inline-flex flex-col leading-none">
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-2.5 w-2.5" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5" />
          )
        ) : (
          <ArrowUpDown className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover/col:opacity-60" />
        )}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_72px_56px_56px_68px_64px_48px] items-center gap-2 px-3 py-1.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-subtle)" }}
        >
          <div className="h-3 w-3/4 animate-pulse rounded bg-bg-base-2" />
          <div className="h-3 w-10 animate-pulse rounded bg-bg-base-2" />
          <div className="h-3 w-8 animate-pulse rounded bg-bg-base-2 justify-self-end" />
          <div className="h-3 w-10 animate-pulse rounded bg-bg-base-2 justify-self-end" />
          <div className="h-3 w-12 animate-pulse rounded bg-bg-base-2 justify-self-end" />
          <div className="h-2 w-full animate-pulse rounded-full bg-bg-base-2" />
          <div className="h-3 w-8 animate-pulse rounded bg-bg-base-2 justify-self-end" />
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Liquidity bar                                                      */
/* ------------------------------------------------------------------ */

function LiquidityBar({ score }: { score: number }) {
  const color =
    score >= 60 ? "var(--color-action-rise)" : score >= 30 ? "var(--color-signal-amber)" : "var(--color-action-fall)";
  return (
    <div className="flex items-center gap-1">
      <div className="h-[3px] w-full rounded-full bg-bg-base-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-numbers-10 shrink-0 text-text-quaternary">{score}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main widget                                                        */
/* ------------------------------------------------------------------ */

export function ScreenerWidget() {
  const { markets, isLoading } = useMarkets({ limit: 200 });

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set());

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Toggle quick filter
  const toggleQuickFilter = (f: QuickFilter) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  // Filtered + sorted markets
  const { filtered, total } = useMemo(() => {
    let list = [...markets];
    const totalCount = list.length;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.question.toLowerCase().includes(q));
    }

    // Category
    if (activeCategory !== "All") {
      list = list.filter(
        (m) => m.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Quick filters
    if (activeQuickFilters.has("highVolume")) {
      list = list.filter((m) => m.volume24h >= 100_000);
    }
    if (activeQuickFilters.has("volatile")) {
      list = list.filter((m) => Math.abs(derive24hChange(m)) >= 10);
    }
    if (activeQuickFilters.has("underpriced")) {
      list = list.filter((m) => m.yesPrice < 0.2);
    }
    if (activeQuickFilters.has("closingSoon")) {
      const dayMs = 24 * 60 * 60 * 1000;
      list = list.filter(
        (m) => new Date(m.endDate).getTime() - Date.now() < dayMs && new Date(m.endDate).getTime() > Date.now()
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "volume":
          cmp = a.volume24h - b.volume24h;
          break;
        case "price":
          cmp = a.yesPrice - b.yesPrice;
          break;
        case "change":
          cmp = derive24hChange(a) - derive24hChange(b);
          break;
        case "liquidity":
          cmp = a.liquidity - b.liquidity;
          break;
        case "rvol":
          cmp = deriveRvol(a) - deriveRvol(b);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return { filtered: list, total: totalCount };
  }, [markets, searchQuery, activeCategory, sortField, sortDir, activeQuickFilters]);

  return (
    <Widget
      id="screener"
      title="Market Screener"
      icon={<Search className="h-3.5 w-3.5" />}
      accentColor="var(--color-signal-green)"
      actions={
        <Badge variant="neutral" className="ml-1">
          {isLoading ? "..." : filtered.length}
        </Badge>
      }
    >
      <div className="flex h-full flex-col">
        {/* Search bar */}
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-subtle)" }}
        >
          <Search className="h-3 w-3 shrink-0 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-body-12 text-text-primary placeholder:text-text-quaternary outline-none"
          />
          <SlidersHorizontal className="h-3 w-3 shrink-0 text-text-quaternary" />
        </div>

        {/* Category pills */}
        <div
          className="scrollbar-hide flex items-center gap-1 overflow-x-auto px-3 py-1.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-subtle)" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-[4px] px-2 py-0.5 text-body-12 font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-signal-green text-bg-base-0"
                  : "bg-bg-base-2 text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Sort buttons */}
          <div className="mx-1 h-3 w-px shrink-0 bg-divider-heavy" />
          {(Object.keys(SORT_LABELS) as SortField[]).slice(0, 4).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex shrink-0 items-center gap-0.5 rounded-[4px] px-2 py-0.5 text-body-12 font-medium transition-colors ${
                sortField === field
                  ? "bg-signal-green text-bg-base-0"
                  : "bg-bg-base-2 text-text-secondary hover:text-text-primary"
              }`}
            >
              {SORT_LABELS[field]}
              {sortField === field && (
                <span className="text-label-9">{sortDir === "desc" ? "\u2193" : "\u2191"}</span>
              )}
            </button>
          ))}
        </div>

        {/* Quick filter row */}
        <div
          className="scrollbar-hide flex items-center gap-1 overflow-x-auto px-3 py-1"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-subtle)" }}
        >
          <Filter className="mr-0.5 h-2.5 w-2.5 shrink-0 text-text-quaternary" />
          {QUICK_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleQuickFilter(key)}
              className={`flex shrink-0 items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-caption-10 font-medium transition-colors ${
                activeQuickFilters.has(key)
                  ? "bg-signal-green/20 text-signal-green"
                  : "bg-transparent text-text-quaternary hover:bg-bg-base-2 hover:text-text-secondary"
              }`}
            >
              {key === "volatile" && <Zap className="h-2.5 w-2.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div
          className="grid grid-cols-[1fr_72px_56px_56px_68px_64px_48px] items-center gap-2 px-3 py-1"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          <span className="text-label-10 tracking-wider text-text-quaternary">
            Market
          </span>
          <span className="text-label-10 tracking-wider text-text-quaternary">
            Category
          </span>
          <ColHeader label="Price" field="price" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
          <ColHeader label="24h" field="change" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
          <ColHeader label="Vol" field="volume" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
          <ColHeader label="Liq" field="liquidity" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
          <ColHeader label="RVOL" field="rvol" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
        </div>

        {/* Market rows */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-quaternary">
              <Search className="mb-2 h-5 w-5" />
              <span className="text-body-12">No markets match your filters</span>
            </div>
          ) : (
            filtered.map((m) => {
              const change = derive24hChange(m);
              const rvol = deriveRvol(m);
              const liqScore = liquidityScore(m);
              const priceInCents = Math.round(m.yesPrice * 100);
              const catVariant = categoryBadgeVariant[m.category] ?? "neutral";

              return (
                <Link
                  key={m.id}
                  href={`/markets/${m.slug || m.id}`}
                  className="group/row grid grid-cols-[1fr_72px_56px_56px_68px_64px_48px] items-center gap-2 px-3 py-1.5 transition-colors hover:bg-bg-base-2/60"
                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-subtle)" }}
                >
                  {/* Market question */}
                  <span className="truncate text-body-12 text-text-secondary group-hover/row:text-text-primary transition-colors">
                    {truncate(m.question, 60)}
                  </span>

                  {/* Category */}
                  <Badge variant={catVariant}>{m.category}</Badge>

                  {/* YES price */}
                  <span className="text-right font-mono text-numbers-12 text-text-primary">
                    {priceInCents}\u00A2
                  </span>

                  {/* 24h change */}
                  <span
                    className={`flex items-center justify-end gap-0.5 font-mono text-numbers-10 ${
                      change >= 0 ? "text-action-rise" : "text-action-fall"
                    }`}
                  >
                    {change >= 0 ? (
                      <ChevronUp className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronDown className="h-2.5 w-2.5" />
                    )}
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>

                  {/* Volume */}
                  <span className="text-right font-mono text-numbers-10 text-text-secondary">
                    {formatVolume(m.volume24h)}
                  </span>

                  {/* Liquidity bar */}
                  <LiquidityBar score={liqScore} />

                  {/* RVOL */}
                  <span
                    className={`text-right font-mono text-numbers-10 ${
                      rvol >= 3 ? "font-bold text-signal-green" : "text-text-quaternary"
                    }`}
                  >
                    {rvol.toFixed(1)}x
                  </span>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-3 py-1"
          style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-subtle)" }}
        >
          <span className="text-caption-10 text-text-quaternary">
            Showing {filtered.length} of {total} markets
          </span>
          <span className="text-caption-10 text-text-quaternary">
            Sorted by {SORT_LABELS[sortField]} {sortDir === "desc" ? "\u2193" : "\u2191"}
          </span>
        </div>
      </div>
    </Widget>
  );
}
