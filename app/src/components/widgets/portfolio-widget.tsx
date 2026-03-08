"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Wallet } from "lucide-react";

interface PortfolioPosition {
  id: string;
  market: string;
  marketIcon: string;
  side: "YES" | "NO";
  size: string;
  avgEntry: number;
  currentPrice: number;
  pnl: string;
  pnlPct: number;
  pnlPositive: boolean;
  venue: string;
  expiry: string;
}

interface PortfolioSummary {
  totalValue: string;
  totalPnl: string;
  totalPnlPct: number;
  pnlPositive: boolean;
  positions: number;
  venues: number;
  exposure: { category: string; pct: number }[];
}

const portfolioPositions: PortfolioPosition[] = [
  { id: "1", market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", side: "YES", size: "$12.4K", avgEntry: 28, currentPrice: 34, pnl: "+$2.6K", pnlPct: 21.4, pnlPositive: true, venue: "Polymarket", expiry: "Mar 19" },
  { id: "2", market: "Will China invade Taiwan?", marketIcon: "🇨🇳", side: "NO", size: "$8.1K", avgEntry: 88, currentPrice: 86, pnl: "-$184", pnlPct: -2.3, pnlPositive: false, venue: "Polymarket", expiry: "Oct 31" },
  { id: "3", market: "NYC Mayoral Election: Cuomo", marketIcon: "🗽", side: "YES", size: "$5.6K", avgEntry: 41, currentPrice: 45, pnl: "+$547", pnlPct: 9.8, pnlPositive: true, venue: "Kalshi", expiry: "Mar 22" },
  { id: "4", market: "Will Ethereum hit $6,000?", marketIcon: "⟠", side: "YES", size: "$3.2K", avgEntry: 31, currentPrice: 23, pnl: "-$827", pnlPct: -25.8, pnlPositive: false, venue: "Polymarket", expiry: "Dec 31" },
  { id: "5", market: "Gold price to hit $3000/oz", marketIcon: "🥇", side: "YES", size: "$15.8K", avgEntry: 72, currentPrice: 78, pnl: "+$1.3K", pnlPct: 8.3, pnlPositive: true, venue: "Kalshi", expiry: "Dec 31" },
];

const portfolioSummary: PortfolioSummary = {
  totalValue: "$45.1K",
  totalPnl: "+$3.44K",
  totalPnlPct: 8.3,
  pnlPositive: true,
  positions: 5,
  venues: 2,
  exposure: [
    { category: "Macro", pct: 42 },
    { category: "Politics", pct: 30 },
    { category: "Crypto", pct: 18 },
    { category: "Commodities", pct: 10 },
  ],
};

const exposureColors = ["bg-signal-green", "bg-signal-green/60", "bg-signal-green/35", "bg-signal-green/15"];

export function PortfolioWidget() {
  return (
    <Widget id="portfolio" title="Portfolio" icon={<Wallet className="h-3.5 w-3.5 text-text-tertiary" />}>
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3 px-3 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div>
          <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Total Value</div>
          <div className="font-data text-body-14 font-semibold text-text-primary">{portfolioSummary.totalValue}</div>
        </div>
        <div>
          <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Total PnL</div>
          <div className={`font-data text-body-14 font-semibold ${portfolioSummary.pnlPositive ? "text-action-rise" : "text-action-fall"}`}>
            {portfolioSummary.totalPnl}
            <span className="ml-1 text-xs">({portfolioSummary.pnlPositive ? "+" : ""}{portfolioSummary.totalPnlPct}%)</span>
          </div>
        </div>
        <div>
          <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Positions</div>
          <div className="font-data text-body-14 font-semibold text-text-primary">{portfolioSummary.positions}</div>
        </div>
        <div>
          <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Venues</div>
          <div className="font-data text-body-14 font-semibold text-text-primary">{portfolioSummary.venues}</div>
        </div>
      </div>
      {/* Exposure bar */}
      <div className="px-3 py-2" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div className="mb-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">Exposure</div>
        <div className="flex h-2 overflow-hidden rounded-full">
          {portfolioSummary.exposure.map((seg, i) => (
            <div key={seg.category} className={exposureColors[i] || "bg-bg-surface-raised"} style={{ width: `${seg.pct}%` }} />
          ))}
        </div>
        <div className="mt-1.5 flex gap-3">
          {portfolioSummary.exposure.map((seg, i) => (
            <span key={seg.category} className="flex items-center gap-1 text-numbers-10 text-text-quaternary">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${exposureColors[i] || "bg-bg-surface-raised"}`} />
              {seg.category} {seg.pct}%
            </span>
          ))}
        </div>
      </div>
      {/* Positions table */}
      <div className="grid grid-cols-[1fr_35px_55px_45px_50px_65px_70px_50px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {["MARKET", "SIDE", "SIZE", "ENTRY", "NOW", "PNL", "VENUE", "EXP"].map((h) => (
          <span key={h} className="text-[10px] font-medium uppercase text-text-quaternary">{h}</span>
        ))}
      </div>
      <div>
        {portfolioPositions.map((pos, idx) => (
          <div key={pos.id} className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_35px_55px_45px_50px_65px_70px_50px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="text-xs">{pos.marketIcon}</span>
              <Link href={`/dashboard/markets/${pos.id}`} className="truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">{pos.market}</Link>
            </div>
            <span className={`text-xs font-semibold ${pos.side === "YES" ? "text-action-buy" : "text-action-sell"}`}>{pos.side}</span>
            <span className="text-numbers-12 text-text-primary">{pos.size}</span>
            <span className="text-numbers-12 text-text-secondary">{pos.avgEntry}c</span>
            <span className="text-numbers-12 text-text-primary">{pos.currentPrice}c</span>
            <span className={`text-numbers-12 font-medium ${pos.pnlPositive ? "text-action-rise" : "text-action-fall"}`}>
              {pos.pnl}
            </span>
            <span className="text-[10px] text-text-secondary">{pos.venue}</span>
            <span className="text-numbers-10 text-text-quaternary">{pos.expiry}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}
