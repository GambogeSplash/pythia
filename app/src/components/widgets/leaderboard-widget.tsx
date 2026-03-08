"use client";

import { useState } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface LeaderboardTrader {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  pnl: string;
  pnlPositive: boolean;
  winRate: number;
  trades: number;
  pyScore: number;
  archetype: string;
  archetypeVariant: "green" | "blue" | "amber" | "red" | "neutral";
  isWashTrader?: boolean;
}

const leaderboardTraders: LeaderboardTrader[] = [
  { id: "1", rank: 1, name: "ShimaTakashi", avatar: "ST", pnl: "+$1.24M", pnlPositive: true, winRate: 78.3, trades: 1243, pyScore: 99.3, archetype: "Alpha", archetypeVariant: "green" },
  { id: "2", rank: 2, name: "AidaYudai", avatar: "AY", pnl: "+$892K", pnlPositive: true, winRate: 72.1, trades: 3412, pyScore: 95.2, archetype: "Arb", archetypeVariant: "neutral" },
  { id: "3", rank: 3, name: "IkedaSuzuka", avatar: "IS", pnl: "+$743K", pnlPositive: true, winRate: 69.8, trades: 892, pyScore: 88.1, archetype: "Contrarian", archetypeVariant: "blue" },
  { id: "4", rank: 4, name: "KawakamiTok", avatar: "KT", pnl: "+$521K", pnlPositive: true, winRate: 65.4, trades: 2104, pyScore: 80.0, archetype: "Momentum", archetypeVariant: "neutral" },
  { id: "5", rank: 5, name: "MiyamotoRiko", avatar: "MR", pnl: "+$498K", pnlPositive: true, winRate: 61.2, trades: 5621, pyScore: 68.0, archetype: "Bot", archetypeVariant: "blue" },
  { id: "6", rank: 6, name: "DoiYukiko", avatar: "DY", pnl: "+$312K", pnlPositive: true, winRate: 58.7, trades: 1876, pyScore: 56.9, archetype: "MM", archetypeVariant: "neutral" },
  { id: "7", rank: 7, name: "KamiyaKokona", avatar: "KK", pnl: "+$287K", pnlPositive: true, winRate: 55.2, trades: 4310, pyScore: 83.5, archetype: "MM", archetypeVariant: "neutral" },
  { id: "8", rank: 8, name: "AndouYukio", avatar: "AYu", pnl: "-$61K", pnlPositive: false, winRate: 42.1, trades: 823, pyScore: 64.2, archetype: "Insider", archetypeVariant: "amber", isWashTrader: true },
  { id: "9", rank: 9, name: "TejimaKouzou", avatar: "TK", pnl: "+$198K", pnlPositive: true, winRate: 53.6, trades: 2901, pyScore: 40.6, archetype: "Degen", archetypeVariant: "red" },
  { id: "10", rank: 10, name: "NakamuraYui", avatar: "NY", pnl: "+$156K", pnlPositive: true, winRate: 51.8, trades: 1456, pyScore: 72.4, archetype: "Analyst", archetypeVariant: "green" },
];

export function LeaderboardWidget() {
  const [washFiltered, setWashFiltered] = useState(true);

  const traders = washFiltered
    ? leaderboardTraders.filter((t) => !t.isWashTrader)
    : leaderboardTraders;

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
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-surface-raised text-[8px] font-bold text-text-secondary">
                {trader.avatar}
              </div>
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
    </Widget>
  );
}
