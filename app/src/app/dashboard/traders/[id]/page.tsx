"use client";

import { use } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, AlertTriangle } from "lucide-react";

function ScoreColor(score: number) {
  if (score >= 80) return "text-signal-green";
  if (score >= 60) return "text-signal-amber";
  return "text-signal-red";
}

export default function TraderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const trader = {
    name: "ShimaTakashi",
    archetype: "Alpha",
    archetypeVariant: "green" as const,
    pyScore: 99.3,
    tagline: "Disciplined contrarian. Enters early, sizes responsibly.",
    followers: 1243,
    copiers: 89,
    isWashTrader: false,
    stats: {
      winRate: 78.3, pnl: "+$1.24M", sharpe: 2.41, maxDrawdown: "-12.3%", trades: 1243,
      kelly: 0.18, winStreak: 14, herdIndex: 0.31,
    },
    subScores: [
      { label: "Skill", score: 95 },
      { label: "Alpha Timing", score: 92 },
      { label: "Risk Management", score: 88 },
      { label: "Robustness", score: 85 },
      { label: "Contrarianism", score: 78 },
    ],
    focus: [
      { category: "Politics", pct: 40 },
      { category: "Macro", pct: 30 },
      { category: "Crypto", pct: 20 },
      { category: "Sports", pct: 10 },
    ],
    categoryRanks: [
      { category: "Politics", rank: 3, total: 1240 },
      { category: "Macro", rank: 7, total: 890 },
      { category: "Crypto", rank: 12, total: 2100 },
    ],
    venueRanks: [
      { venue: "Polymarket", rank: 2, total: 5400 },
      { venue: "Kalshi", rank: 15, total: 3200 },
    ],
    // Alpha Timing scatter data (entry timing vs crowd)
    alphaTimingData: [
      { market: "Fed rate cut", entryTime: -4.2, crowdEntry: 0, pnl: 6200 },
      { market: "OpenAI IPO", entryTime: -2.8, crowdEntry: 0, pnl: 12000 },
      { market: "Gold $3000", entryTime: -1.5, crowdEntry: 0, pnl: 8100 },
      { market: "Taiwan", entryTime: 0.3, crowdEntry: 0, pnl: -503 },
      { market: "NYC Mayor", entryTime: -3.1, crowdEntry: 0, pnl: 4200 },
      { market: "Ethereum $6K", entryTime: -0.8, crowdEntry: 0, pnl: 1800 },
      { market: "Trump Nobel", entryTime: -5.2, crowdEntry: 0, pnl: 15400 },
    ],
    recentTrades: [
      { id: "1", market: "Fed decrease interest by 50+ bps", icon: "🏦", side: "YES" as const, size: "$56K", pnl: "+$6.2K", positive: true, time: "2h ago" },
      { id: "2", market: "Will OpenAI IPO by end of 2025?", icon: "🤖", side: "YES" as const, size: "$23K", pnl: "+$12K", positive: true, time: "5h ago" },
      { id: "3", market: "Gold price to hit $3000/oz", icon: "🥇", side: "YES" as const, size: "$45K", pnl: "+$8.1K", positive: true, time: "1d ago" },
      { id: "4", market: "Will China invade Taiwan?", icon: "🇨🇳", side: "NO" as const, size: "$12K", pnl: "-$503", positive: false, time: "2d ago" },
      { id: "5", market: "NYC Mayoral Election: Cuomo", icon: "🗽", side: "YES" as const, size: "$34K", pnl: "+$4.2K", positive: true, time: "3d ago" },
    ],
    publishedBots: [
      { name: "Alpha Momentum v3", type: "Momentum", pnl: "+$89K", winRate: 72, copiers: 34 },
      { name: "Fed Watcher", type: "Event-Driven", pnl: "+$23K", winRate: 68, copiers: 12 },
    ],
  };

  const focusColors = ["bg-signal-green", "bg-signal-green/60", "bg-signal-green/35", "bg-signal-green/15"];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Sub-header */}
      <div
        className="flex h-8 items-center px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-body-12 font-semibold text-text-primary">TRADER PROFILE</span>
        <span className="ml-3 text-numbers-10 text-text-quaternary">ID: {id}</span>
        <div className="ml-auto flex items-center gap-3">
          <button className="flex h-6 items-center gap-1 rounded-[4px] bg-signal-green/12 px-2 text-body-12 font-semibold text-signal-green hover:bg-signal-green/20">
            <Users className="h-3 w-3" /> Follow
          </button>
          <button className="flex h-6 items-center gap-1 rounded-[4px] bg-signal-blue/12 px-2 text-body-12 font-semibold text-signal-blue hover:bg-signal-blue/20">
            <Copy className="h-3 w-3" /> Copy Trade
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-5 rounded-[12px] bg-bg-base-1 px-5 py-4" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-base-2 text-header-20 font-bold text-text-secondary" style={{ boxShadow: "inset 0 0 0 2px var(--color-signal-green)" }}>
          ST
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-body-14 font-bold text-text-primary">{trader.name}</h1>
            <Badge variant={trader.archetypeVariant}>{trader.archetype}</Badge>
            {trader.isWashTrader && (
              <Badge variant="red"><AlertTriangle className="mr-1 inline h-3 w-3" />Wash Trade Flag</Badge>
            )}
          </div>
          <p className="mt-0.5 text-body-12 italic text-text-secondary">&ldquo;{trader.tagline}&rdquo;</p>
          <div className="mt-1.5 flex items-center gap-4 text-caption-10 text-text-tertiary">
            <span><strong className="text-text-secondary">{trader.followers.toLocaleString()}</strong> followers</span>
            <span><strong className="text-text-secondary">{trader.copiers}</strong> copiers</span>
            <span>Herd Index: <strong className="text-signal-green">{trader.stats.herdIndex}</strong> (contrarian)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-label-9 text-text-tertiary">Pythia Score</div>
          <div className={`text-numbers-12 text-header-20 font-bold ${ScoreColor(trader.pyScore)}`}>
            {trader.pyScore}
          </div>
          <div className="text-caption-10 text-text-tertiary">/ 100</div>
        </div>
      </div>

      {/* Stats Row — expanded */}
      <div className="grid grid-cols-7 gap-2">
        {[
          { label: "Win Rate", value: `${trader.stats.winRate}%`, color: "text-signal-green" },
          { label: "Realized PnL", value: trader.stats.pnl, color: "text-signal-green" },
          { label: "Sharpe Ratio", value: trader.stats.sharpe.toString(), color: "text-text-primary" },
          { label: "Max Drawdown", value: trader.stats.maxDrawdown, color: "text-signal-red" },
          { label: "Kelly Score", value: trader.stats.kelly.toString(), color: "text-signal-blue" },
          { label: "Win Streak", value: trader.stats.winStreak.toString(), color: "text-signal-green" },
          { label: "Total Trades", value: trader.stats.trades.toLocaleString(), color: "text-text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[8px] bg-bg-base-1 px-3 py-2.5 text-center" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
            <div className="text-label-9 text-text-tertiary">{stat.label}</div>
            <div className={`text-numbers-12 font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {/* Sub-scores */}
          <Widget title="Score Breakdown">
            <div className="space-y-3 px-3 py-3">
              {trader.subScores.map((sub) => (
                <div key={sub.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-body-12 text-text-secondary">{sub.label}</span>
                    <span className={`text-numbers-10 font-medium ${ScoreColor(sub.score)}`}>{sub.score}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-base-3">
                    <div
                      className={`h-full rounded-full ${sub.score >= 80 ? "bg-signal-green" : sub.score >= 60 ? "bg-signal-amber" : "bg-signal-red"}`}
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Widget>

          {/* Category & Venue Rankings */}
          <Widget title="Rankings">
            <div className="px-3 py-2">
              <div className="mb-2 text-label-9 text-text-quaternary">By Category</div>
              <div className="space-y-1.5">
                {trader.categoryRanks.map((r) => (
                  <div key={r.category} className="flex items-center justify-between rounded-[6px] bg-bg-base-2 px-2 py-1.5">
                    <span className="text-body-12 text-text-primary">{r.category}</span>
                    <span className="text-numbers-10 text-signal-green">#{r.rank} <span className="text-text-quaternary">/ {r.total.toLocaleString()}</span></span>
                  </div>
                ))}
              </div>
              <div className="mb-2 mt-3 text-label-9 text-text-quaternary">By Venue</div>
              <div className="space-y-1.5">
                {trader.venueRanks.map((r) => (
                  <div key={r.venue} className="flex items-center justify-between rounded-[6px] bg-bg-base-2 px-2 py-1.5">
                    <span className="text-body-12 text-text-primary">{r.venue}</span>
                    <span className="text-numbers-10 text-signal-green">#{r.rank} <span className="text-text-quaternary">/ {r.total.toLocaleString()}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>
        </div>

        {/* Middle + Right — Recent Trades and Alpha Timing */}
        <div className="col-span-2 flex flex-col gap-3">
          {/* Alpha Timing Scatter Chart */}
          <Widget title="Alpha Timing">
            <div className="px-3 py-3">
              <div className="mb-2 text-caption-10 text-text-quaternary">
                Entry timing vs. crowd consensus. Negative = entered before the crowd.
              </div>
              <div className="relative h-[140px] rounded-[6px] bg-bg-base-2 p-2">
                {/* Y-axis label */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-label-9 text-text-quaternary">PnL</div>
                {/* X-axis label */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-label-9 text-text-quaternary">Hours before crowd</div>
                {/* Zero lines */}
                <div className="absolute left-8 right-2 top-1/2 h-px bg-divider-heavy" />
                <div className="absolute bottom-4 left-1/2 top-2 w-px bg-divider-heavy" />
                {/* Scatter dots */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 140" preserveAspectRatio="none">
                  {trader.alphaTimingData.map((d, i) => {
                    const x = 150 + (d.entryTime / 6) * 120;
                    const y = 70 - (d.pnl / 20000) * 60;
                    const color = d.pnl > 0 ? "#00FF85" : "#FF3B3B";
                    return (
                      <circle key={i} cx={x} cy={y} r={5} fill={color} opacity={0.7} />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-2 flex items-center gap-4 text-caption-10">
                <span className="text-text-quaternary">Avg entry: <span className="text-signal-green">2.5h before crowd</span></span>
                <span className="text-text-quaternary">Alpha accuracy: <span className="text-signal-green">85.7%</span></span>
              </div>
            </div>
          </Widget>

          {/* Recent Trades */}
          <Widget title="Recent Trades">
            <div className="grid grid-cols-[1fr_40px_60px_70px_70px] gap-1 border-b border-divider-heavy px-3 py-1.5">
              {["MARKET", "SIDE", "SIZE", "PNL", "TIME"].map((h) => (
                <span key={h} className="text-label-10 text-text-tertiary">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-divider-heavy">
              {trader.recentTrades.map((trade) => (
                <div key={trade.market} className="grid grid-cols-[1fr_40px_60px_70px_70px] items-center gap-1 px-3 py-2 transition-colors hover:bg-action-translucent-hover">
                  <Link href={`/dashboard/markets/${trade.id}`} className="flex min-w-0 items-center gap-1.5">
                    <span className="text-body-12">{trade.icon}</span>
                    <span className="truncate text-body-12 text-text-primary hover:text-signal-green">{trade.market}</span>
                  </Link>
                  <span className={`text-body-12 font-semibold ${trade.side === "YES" ? "text-signal-green" : "text-signal-red"}`}>
                    {trade.side}
                  </span>
                  <span className="text-numbers-10 text-text-primary">{trade.size}</span>
                  <span className={`text-numbers-10 font-medium ${trade.positive ? "text-signal-green" : "text-signal-red"}`}>
                    {trade.pnl}
                  </span>
                  <span className="text-caption-10 text-text-tertiary">{trade.time}</span>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Market Focus */}
        <Widget title="Market Focus">
          <div className="px-3 py-2">
            <div className="flex h-3 overflow-hidden rounded-full">
              {trader.focus.map((seg, i) => (
                <div key={seg.category} className={focusColors[i]} style={{ width: `${seg.pct}%` }} />
              ))}
            </div>
            <div className="mt-2 flex gap-4">
              {trader.focus.map((seg, i) => (
                <span key={seg.category} className="flex items-center gap-1.5 text-caption-10 text-text-tertiary">
                  <span className={`inline-block h-2 w-2 rounded-full ${focusColors[i]}`} />
                  {seg.category} {seg.pct}%
                </span>
              ))}
            </div>
          </div>
        </Widget>

        {/* Published Bot Strategies */}
        <Widget title="Published Bot Strategies">
          <div className="divide-y divide-divider-heavy">
            {trader.publishedBots.map((bot) => (
              <div key={bot.name} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="text-body-12 font-medium text-text-primary">{bot.name}</div>
                  <div className="text-caption-10 text-text-quaternary">{bot.type}</div>
                </div>
                <span className="text-numbers-10 text-signal-green">{bot.pnl}</span>
                <span className="text-numbers-10 text-text-secondary">{bot.winRate}% WR</span>
                <span className="text-caption-10 text-text-quaternary">{bot.copiers} copiers</span>
                <button className="rounded-[4px] bg-signal-green/12 px-2 py-1 text-caption-10 font-semibold text-signal-green hover:bg-signal-green/20">
                  Fork
                </button>
              </div>
            ))}
          </div>
        </Widget>
      </div>
    </div>
  );
}
