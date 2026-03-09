"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Widget, WidgetPill } from "@/components/ui/widget";
import { useMarkets } from "@/hooks/use-markets";
import { formatVolume, truncate } from "@/lib/format";
import { Star, Search, TrendingUp, TrendingDown, Eye } from "lucide-react";

const CATEGORIES = ["All", "Politics", "Crypto", "Sports", "Macro"] as const;

const categoryColors: Record<string, string> = {
  Politics: "#6366f1",
  Crypto: "#f59e0b",
  Sports: "#10b981",
  Macro: "#ef4444",
  Science: "#8b5cf6",
  Culture: "#ec4899",
};

/** Generate a deterministic-ish 24h change from market id */
function deriveChange24h(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Number(((((hash % 200) - 100) / 10)).toFixed(1));
}

/** Generate a mini sparkline SVG path from 7 points */
function MiniSparkline({ id, positive }: { id: string; positive: boolean }) {
  const points = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < id.length; i++) {
      seed = (seed * 37 + id.charCodeAt(i)) | 0;
    }
    const pts: number[] = [];
    let val = 8;
    for (let i = 0; i < 7; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      val += ((seed % 7) - 3);
      pts.push(Math.max(1, Math.min(15, val)));
    }
    return pts;
  }, [id]);

  const w = 40;
  const h = 16;
  const stepX = w / (points.length - 1);
  const d = points
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path
        d={d}
        fill="none"
        stroke={positive ? "var(--color-action-rise)" : "var(--color-action-fall)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_48px_52px_56px_44px] items-center gap-1 px-3 py-1.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="skeleton h-2 w-2 rounded-full shrink-0" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
          <div className="skeleton ml-auto h-3 w-8 rounded" />
          <div className="skeleton ml-auto h-3 w-9 rounded" />
          <div className="skeleton ml-auto h-3 w-10 rounded" />
          <div className="skeleton ml-auto h-3 w-9 rounded" />
        </div>
      ))}
    </div>
  );
}

export function WatchlistWidget() {
  const { markets, isLoading, isError } = useMarkets({ limit: 8 });
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = markets;
    if (activeCategory !== "All") {
      list = list.filter(
        (m) => m.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.question.toLowerCase().includes(q));
    }
    return list;
  }, [markets, activeCategory, searchQuery]);

  const filterPills = (
    <>
      {CATEGORIES.map((cat) => (
        <WidgetPill
          key={cat}
          active={activeCategory === cat}
          onClick={() => setActiveCategory(cat)}
        >
          {cat}
        </WidgetPill>
      ))}
    </>
  );

  return (
    <Widget
      id="watchlist"
      title="Watchlist"
      liveIndicator
      icon={<Star className="h-3.5 w-3.5 text-text-tertiary" />}
      accentColor="var(--color-signal-green)"
      actions={filterPills}
    >
      {/* Search bar */}
      <div className="px-3 py-1.5">
        <div
          className="flex items-center gap-1.5 rounded-[6px] bg-bg-base-2 px-2 py-1"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
        >
          <Search className="h-3 w-3 shrink-0 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-body-12 text-text-primary placeholder:text-text-quaternary outline-none"
          />
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-[1fr_48px_52px_56px_44px] gap-1 px-3 py-1"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          Price
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          24h%
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          Volume
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          Trend
        </span>
      </div>

      {/* Loading state */}
      {isLoading && <SkeletonRows />}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <Eye className="h-5 w-5 text-text-quaternary" />
          <span className="text-body-12">Failed to load watchlist</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <Star className="h-5 w-5 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {searchQuery
              ? "No markets match your search"
              : "No markets in your watchlist"}
          </span>
        </div>
      )}

      {/* Market rows */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div>
          {filtered.map((market, idx) => {
            const priceYes = Math.round(market.yesPrice * 100);
            const change24h = deriveChange24h(market.id);
            const isPositive = change24h >= 0;
            const vol = formatVolume(market.volume24h);
            const dotColor =
              categoryColors[market.category] || "var(--color-text-quaternary)";

            return (
              <Link
                key={market.id}
                href={`/dashboard/markets/${market.slug || market.id}`}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} group/row grid grid-cols-[1fr_48px_52px_56px_44px] items-center gap-1 px-3 py-1.5 transition-colors duration-150 hover:bg-action-translucent-hover`}
                style={{
                  boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)",
                }}
              >
                {/* Market name + category dot */}
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="truncate text-body-12 text-text-primary">
                    {truncate(market.question, 40)}
                  </span>
                  {/* Star on hover */}
                  <Star className="ml-auto h-3 w-3 shrink-0 fill-amber-400 text-amber-400 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100" />
                </div>

                {/* Price */}
                <span className="text-right text-numbers-12 text-action-buy">
                  {priceYes}¢
                </span>

                {/* 24h change */}
                <span
                  className={`flex items-center justify-end gap-0.5 text-right text-numbers-10 font-medium ${
                    isPositive ? "text-action-rise" : "text-action-fall"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {isPositive ? "+" : ""}
                  {change24h}%
                </span>

                {/* Volume */}
                <span className="text-right text-numbers-10 text-text-secondary">
                  {vol}
                </span>

                {/* Sparkline */}
                <div className="flex justify-end">
                  <MiniSparkline id={market.id} positive={isPositive} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
