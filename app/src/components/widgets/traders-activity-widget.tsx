"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, User, ExternalLink } from "lucide-react";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { formatVolume, truncate } from "@/lib/format";
import type { Market } from "@/lib/api/types";

interface TraderActivity {
  id: string;
  name: string;
  image: string;
  market: string;
  marketSlug: string;
  bet: "YES" | "NO";
  size: string;
  pnl: string;
  pnlPositive: boolean;
  pyScore: number;
  archetypes: string[];
}

const archetypeColors: Record<string, "green" | "blue" | "amber" | "red" | "neutral"> = {
  Arb: "neutral",
  Trnd: "neutral",
  Bot: "blue",
  Deg: "red",
  MM: "neutral",
  Insd: "amber",
  Alp: "green",
};

const archetypePool = [
  ["Arb", "Trnd"],
  ["Bot", "Deg"],
  ["MM", "Bot"],
  ["Bot", "Arb", "Insd"],
  ["Arb", "Trnd"],
  ["MM", "Trnd"],
  ["Insd"],
  ["Alp", "Trnd", "MM"],
  ["Arb", "MM"],
];

/** Derive activity-like entries from real market data */
function deriveActivities(markets: Market[]): TraderActivity[] {
  return markets
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 9)
    .map((m, i) => {
      const slug = m.slug || m.id;
      const nameParts = slug.replace(/-/g, " ").split(" ").slice(0, 2);
      const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");
      const bet: "YES" | "NO" = m.yesPrice > 0.5 ? "YES" : "NO";
      const sizeValue = m.volume24h * 0.01;
      const pnlValue = sizeValue * (m.yesPrice - 0.5) * (bet === "YES" ? 1 : -1);
      const pnlPositive = pnlValue >= 0;
      const pyScore = Math.min(99.9, Math.max(20, 50 + m.volume24h / 50000 + (m.yesPrice > 0.5 ? 15 : -5)));

      return {
        id: m.id,
        name: name || `Trader${i + 1}`,
        image: m.image,
        market: truncate(m.question, 45),
        marketSlug: m.slug || m.id,
        bet,
        size: formatVolume(sizeValue),
        pnl: `${pnlPositive ? "" : "-"}${formatVolume(Math.abs(pnlValue))}`,
        pnlPositive,
        pyScore: Math.round(pyScore * 10) / 10,
        archetypes: archetypePool[i % archetypePool.length],
      };
    });
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_1fr_50px_70px_80px_70px_100px_50px] items-center gap-1 px-3 py-2"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="skeleton h-3 w-16 rounded" />
          <div className="flex items-center gap-1.5">
            <div className="skeleton h-4 w-4 rounded-[4px] shrink-0" />
            <div className="skeleton h-3 flex-1 rounded" />
          </div>
          <div className="skeleton h-3 w-6 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="flex gap-1">
            <div className="skeleton h-4 w-8 rounded" />
            <div className="skeleton h-4 w-8 rounded" />
          </div>
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TradersActivityWidget() {
  const { markets, isLoading, isError } = useTrendingMarkets(12);
  const activities = useMemo(() => deriveActivities(markets), [markets]);

  return (
    <Widget id="traders-activity" title="Top Traders Activity" liveIndicator accentColor="#2DD4BF" icon={<span className="text-xs">⊞</span>}>
      {/* Table Header */}
      <div className="grid grid-cols-[100px_1fr_50px_70px_80px_70px_100px_50px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {["TRADER", "MARKET", "BET", "SIZE", "MARKET PnL", "PY (\u03B1) SCORE", "ARCHETYPE", ""].map(
          (h) => (
            <span
              key={h || "actions"}
              className="text-[10px] font-medium uppercase text-text-quaternary"
            >
              {h}
            </span>
          )
        )}
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : isError || activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <User className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {isError ? "Failed to load activity" : "No trader activity yet"}
          </span>
        </div>
      ) : (
        <div>
          {activities.map((trader, idx) => (
            <div
              key={trader.id}
              className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[100px_1fr_50px_70px_80px_70px_100px_50px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`}
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              {/* Trader name */}
              <Link href={`/dashboard/traders/${trader.name.toLowerCase()}`} className="truncate text-xs font-medium text-signal-teal hover:underline">
                {trader.name}
              </Link>

              {/* Market */}
              <div className="flex min-w-0 items-center gap-1.5">
                {trader.image ? (
                  <img
                    src={trader.image}
                    alt=""
                    className="h-4 w-4 flex-shrink-0 rounded-[4px] bg-bg-surface-raised object-cover"
                  />
                ) : (
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-bg-base-2 text-[8px] text-text-quaternary">
                    ?
                  </div>
                )}
                <Link href={`/dashboard/markets/${trader.marketSlug}`} className="truncate text-body-12 text-text-secondary hover:text-text-primary transition-colors">
                  {trader.market}
                </Link>
              </div>

              {/* Bet */}
              <span
                className={`text-xs font-semibold ${
                  trader.bet === "YES" ? "text-action-buy" : "text-action-sell"
                }`}
              >
                {trader.bet}
              </span>

              {/* Size */}
              <span className="text-numbers-12 text-text-primary">
                {trader.size}
              </span>

              {/* PnL */}
              <span
                className={`text-numbers-12 font-medium ${
                  trader.pnlPositive ? "text-action-rise" : "text-action-fall"
                }`}
              >
                {trader.pnl}
              </span>

              {/* Py Score */}
              <span className="text-numbers-12 text-text-primary">
                {trader.pyScore}%
              </span>

              {/* Archetypes */}
              <div className="flex gap-1">
                {trader.archetypes.map((arch) => (
                  <Badge
                    key={arch}
                    variant={archetypeColors[arch] || "neutral"}
                  >
                    {arch}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button className="text-text-tertiary hover:text-text-secondary">
                  <MoreVertical className="h-3 w-3" />
                </button>
                <button className="text-text-tertiary hover:text-text-secondary">
                  <User className="h-3 w-3" />
                </button>
                <button className="text-text-tertiary hover:text-text-secondary">
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}
