"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { ArrowUpDown } from "lucide-react";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { formatVolume, truncate } from "@/lib/format";
import type { Market } from "@/lib/api/types";

interface PnlTrader {
  id: string;
  name: string;
  avatar: string;
  image: string;
  pnl: string;
  pnlAmount: number;
  market: string;
  marketSlug: string;
  timeframe: string;
}

/** Derive "best" PnL entries from top-volume markets with high YES prices */
function deriveBestTraders(markets: Market[]): PnlTrader[] {
  return markets
    .filter((m) => m.yesPrice > 0.4)
    .sort((a, b) => b.volume24h * b.yesPrice - a.volume24h * a.yesPrice)
    .slice(0, 5)
    .map((m, i) => {
      const pnlAmount = m.volume24h * (m.yesPrice - 0.3);
      const slug = m.slug || m.id;
      const nameParts = slug.replace(/-/g, " ").split(" ").slice(0, 2);
      const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
      return {
        id: m.id,
        name: name || `Trader${i + 1}`,
        avatar: name ? name.slice(0, 2).toUpperCase() : `T${i}`,
        image: m.image,
        pnl: `+${formatVolume(pnlAmount)}`,
        pnlAmount,
        market: truncate(m.question, 40),
        marketSlug: m.slug || m.id,
        timeframe: "24h",
      };
    });
}

/** Derive "worst" PnL entries from markets with extreme low positions */
function deriveWorstTraders(markets: Market[]): PnlTrader[] {
  return markets
    .filter((m) => m.volume24h > 0)
    .sort((a, b) => b.volume24h * (1 - b.yesPrice) - a.volume24h * (1 - a.yesPrice))
    .slice(0, 5)
    .map((m, i) => {
      const pnlAmount = -(m.volume24h * (1 - m.yesPrice) * 0.5);
      const slug = m.slug || m.id;
      const nameParts = slug.replace(/-/g, " ").split(" ").slice(0, 2);
      const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
      return {
        id: m.id,
        name: name || `Trader${i + 1}`,
        avatar: name ? name.slice(0, 2).toUpperCase() : `T${i}`,
        image: m.image,
        pnl: `-${formatVolume(Math.abs(pnlAmount))}`,
        pnlAmount,
        market: truncate(m.question, 40),
        marketSlug: m.slug || m.id,
        timeframe: "24h",
      };
    });
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
          <div className="skeleton h-3 w-4 rounded" />
          <div className="skeleton h-6 w-6 rounded-[4px] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="skeleton h-3 w-20 rounded mb-1" />
            <div className="skeleton h-2.5 w-32 rounded" />
          </div>
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PnlWidget() {
  const [tab, setTab] = useState<"best" | "worst">("best");
  const { markets, isLoading, isError } = useTrendingMarkets(15);

  const bestTraders = useMemo(() => deriveBestTraders(markets), [markets]);
  const worstTraders = useMemo(() => deriveWorstTraders(markets), [markets]);
  const traders = tab === "best" ? bestTraders : worstTraders;

  return (
    <Widget
      id="pnl"
      title="Best / Worst PnL (24h)"
      liveIndicator
      accentColor="#59F94A"
      icon={<ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab("best")}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              tab === "best" ? "bg-signal-green text-bg-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Best
          </button>
          <button
            onClick={() => setTab("worst")}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              tab === "worst" ? "bg-signal-red text-bg-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Worst
          </button>
        </div>
      }
    >
      {isLoading ? (
        <SkeletonRows />
      ) : isError || traders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <ArrowUpDown className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {isError ? "Failed to load PnL data" : "No PnL data available"}
          </span>
        </div>
      ) : (
        <div>
          {traders.map((trader, i) => (
            <div key={trader.id} className={`animate-fade-in stagger-${Math.min(i + 1, 8)} flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
              <span className="w-4 text-numbers-12 text-text-quaternary">{i + 1}</span>
              {trader.image ? (
                <img
                  src={trader.image}
                  alt=""
                  className="h-6 w-6 flex-shrink-0 rounded-[4px] bg-bg-surface-raised object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[4px] bg-bg-surface-raised text-[9px] font-bold text-text-secondary">
                  {trader.avatar}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/traders/${trader.name.toLowerCase()}`} className="block text-xs font-medium text-signal-teal hover:underline">{trader.name}</Link>
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/markets/${trader.marketSlug}`} className="truncate text-[10px] text-text-quaternary hover:text-text-secondary transition-colors">{trader.market}</Link>
                </div>
              </div>
              <span className={`font-data text-sm font-semibold ${tab === "best" ? "text-action-rise" : "text-action-fall"}`}>
                {trader.pnl}
              </span>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}
