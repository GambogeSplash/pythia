"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";
import type { Market } from "@/lib/api/types";

interface LeaderboardTrader {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  image: string;
  pnl: string;
  pnlPositive: boolean;
  winRate: number;
  trades: number;
  pyScore: number;
  archetype: string;
  archetypeVariant: "green" | "blue" | "amber" | "red" | "neutral";
  isWashTrader?: boolean;
}

const archetypes: { label: string; variant: "green" | "blue" | "amber" | "red" | "neutral" }[] = [
  { label: "Alpha", variant: "green" },
  { label: "Arb", variant: "neutral" },
  { label: "Contrarian", variant: "blue" },
  { label: "Momentum", variant: "neutral" },
  { label: "Bot", variant: "blue" },
  { label: "MM", variant: "neutral" },
  { label: "Analyst", variant: "green" },
  { label: "Degen", variant: "red" },
  { label: "Insider", variant: "amber" },
  { label: "Alpha", variant: "green" },
];

/** Derive leaderboard-like entries from real market data */
function deriveTraders(markets: Market[]): LeaderboardTrader[] {
  return markets
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .map((m, i) => {
      const arch = archetypes[i % archetypes.length];
      const pnlValue = m.volume24h * (m.yesPrice > 0.5 ? m.yesPrice - 0.5 : 0.5 - m.yesPrice) * 2;
      const pnlPositive = m.yesPrice > 0.4;
      const winRate = Math.min(95, Math.max(35, 50 + (m.yesPrice - 0.5) * 60 + (m.volume24h / (m.volume || 1)) * 20));
      const trades = Math.max(100, Math.round(m.volume / (m.liquidity || 1) * 50));
      const pyScore = Math.min(99.9, Math.max(20, 50 + m.volume24h / 50000 + winRate / 5));
      const slug = m.slug || m.id;
      // Generate a trader-like name from market slug
      const nameParts = slug.replace(/-/g, " ").split(" ").slice(0, 2);
      const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("");

      return {
        id: m.id,
        rank: i + 1,
        name: name || `Trader${i + 1}`,
        avatar: name ? name.slice(0, 2).toUpperCase() : `T${i + 1}`,
        image: m.image,
        pnl: `${pnlPositive ? "+" : "-"}${formatVolume(Math.abs(pnlValue))}`,
        pnlPositive,
        winRate: Math.round(winRate * 10) / 10,
        trades,
        pyScore: Math.round(pyScore * 10) / 10,
        archetype: arch.label,
        archetypeVariant: arch.variant,
        isWashTrader: m.yesPrice < 0.05 && m.volume24h > 100000,
      };
    });
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[30px_100px_80px_60px_60px_60px_80px] items-center gap-1 px-3 py-2"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="skeleton h-3 w-4 rounded" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-5 w-5 rounded-[4px] shrink-0" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-4 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardWidget() {
  const [washFiltered, setWashFiltered] = useState(true);
  const { markets, isLoading, isError } = useTrendingMarkets(12);

  const allTraders = useMemo(() => deriveTraders(markets), [markets]);
  const traders = washFiltered ? allTraders.filter((t) => !t.isWashTrader) : allTraders;

  return (
    <Widget
      id="leaderboard"
      title="Leaderboard"
      icon={<Trophy className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <button
          onClick={() => setWashFiltered(!washFiltered)}
          className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
            washFiltered
              ? "bg-action-rise-dim text-action-rise"
              : "bg-bg-surface-raised text-text-secondary"
          }`}
        >
          <span className="text-[8px]">{washFiltered ? "●" : "○"}</span>
          Wash-trade filtered
        </button>
      }
    >
      <div className="grid grid-cols-[30px_100px_80px_60px_60px_60px_80px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {["#", "TRADER", "PNL", "WIN %", "TRADES", "PY SCORE", "ARCHETYPE"].map((h) => (
          <span key={h} className="text-[10px] font-medium uppercase text-text-quaternary">
            {h}
          </span>
        ))}
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : isError || traders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <Trophy className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {isError ? "Failed to load leaderboard" : "No leaderboard data yet"}
          </span>
        </div>
      ) : (
        <div>
          {traders.map((trader, idx) => (
            <div
              key={trader.id}
              className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[30px_100px_80px_60px_60px_60px_80px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`}
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <span className={`text-numbers-12 font-semibold ${trader.rank <= 3 ? "text-action-rise" : "text-text-secondary"}`}>
                {trader.rank}
              </span>
              <div className="flex items-center gap-2">
                {trader.image ? (
                  <img
                    src={trader.image}
                    alt=""
                    className="h-5 w-5 flex-shrink-0 rounded-[4px] bg-bg-surface-raised object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[4px] bg-bg-surface-raised text-[8px] font-bold text-text-secondary">
                    {trader.avatar}
                  </div>
                )}
                <Link href={`/dashboard/traders/${trader.name.toLowerCase()}`} className="truncate text-xs font-medium text-signal-teal hover:underline">{trader.name}</Link>
              </div>
              <span className={`text-numbers-12 font-medium ${trader.pnlPositive ? "text-action-rise" : "text-action-fall"}`}>
                {trader.pnl}
              </span>
              <span className="text-numbers-12 text-text-primary">{trader.winRate}%</span>
              <span className="text-numbers-12 text-text-secondary">{trader.trades.toLocaleString()}</span>
              <span className="text-numbers-12 text-text-primary">{trader.pyScore}%</span>
              <Badge variant={trader.archetypeVariant}>{trader.archetype}</Badge>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
}
