"use client";

import { useState } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { ArrowUpDown } from "lucide-react";

interface PnlTrader {
  id: string;
  name: string;
  avatar: string;
  pnl: string;
  pnlAmount: number;
  market: string;
  marketIcon: string;
  timeframe: string;
}

const bestPnlTraders: PnlTrader[] = [
  { id: "1", name: "ShimaTakashi", avatar: "ST", pnl: "+$342K", pnlAmount: 342000, market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", timeframe: "24h" },
  { id: "2", name: "AidaYudai", avatar: "AY", pnl: "+$198K", pnlAmount: 198000, market: "Will OpenAI IPO by end of 2025?", marketIcon: "🤖", timeframe: "24h" },
  { id: "3", name: "IkedaSuzuka", avatar: "IS", pnl: "+$156K", pnlAmount: 156000, market: "Gold price to hit $3000/oz", marketIcon: "🥇", timeframe: "24h" },
  { id: "4", name: "MiyamotoRiko", avatar: "MR", pnl: "+$89K", pnlAmount: 89000, market: "Will Ethereum ETF be approved?", marketIcon: "⟠", timeframe: "24h" },
  { id: "5", name: "KawakamiTok", avatar: "KT", pnl: "+$67K", pnlAmount: 67000, market: "NYC Mayoral Election", marketIcon: "🗽", timeframe: "24h" },
];

const worstPnlTraders: PnlTrader[] = [
  { id: "1", name: "TejimaKouzou", avatar: "TK", pnl: "-$421K", pnlAmount: -421000, market: "Will China invade Taiwan?", marketIcon: "🇨🇳", timeframe: "24h" },
  { id: "2", name: "AndouYukio", avatar: "AYu", pnl: "-$203K", pnlAmount: -203000, market: "S&P 500 above 6000 in 2025?", marketIcon: "📈", timeframe: "24h" },
  { id: "3", name: "SaitouHaruki", avatar: "SH", pnl: "-$147K", pnlAmount: -147000, market: "Oil prices above $120/barrel", marketIcon: "🛢️", timeframe: "24h" },
  { id: "4", name: "FujitaMasato", avatar: "FM", pnl: "-$98K", pnlAmount: -98000, market: "Trump wins Nobel Peace Prize?", marketIcon: "🏆", timeframe: "24h" },
  { id: "5", name: "OkadaRina", avatar: "OR", pnl: "-$56K", pnlAmount: -56000, market: "Will Lewis Hamilton win?", marketIcon: "🏎️", timeframe: "24h" },
];

export function PnlWidget() {
  const [tab, setTab] = useState<"best" | "worst">("best");
  const traders = tab === "best" ? bestPnlTraders : worstPnlTraders;

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
      <div>
        {traders.map((trader, i) => (
          <div key={trader.id} className={`animate-fade-in stagger-${Math.min(i + 1, 8)} flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
            <span className="w-4 text-numbers-12 text-text-quaternary">{i + 1}</span>
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-surface-raised text-[9px] font-bold text-text-secondary">
              {trader.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/dashboard/traders/${trader.name.toLowerCase()}`} className="block text-xs font-medium text-signal-teal hover:underline">{trader.name}</Link>
              <div className="flex items-center gap-1">
                <span className="text-xs">{trader.marketIcon}</span>
                <Link href={`/dashboard/markets/${trader.id}`} className="truncate text-[10px] text-text-quaternary hover:text-text-secondary transition-colors">{trader.market}</Link>
              </div>
            </div>
            <span className={`font-data text-sm font-semibold ${tab === "best" ? "text-action-rise" : "text-action-fall"}`}>
              {trader.pnl}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );
}
