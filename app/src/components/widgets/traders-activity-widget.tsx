"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, User, ExternalLink } from "lucide-react";

interface TraderActivity {
  id: string;
  name: string;
  market: string;
  marketIcon: string;
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

const traderActivities: TraderActivity[] = [
  { id: "1", name: "KawakamiTok", market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", bet: "YES", size: "$56k", pnl: "$6.2k", pnlPositive: true, pyScore: 80, archetypes: ["Arb", "Trnd"] },
  { id: "2", name: "MiyamotoRiko", market: "Will OpenAI IPO by end of 2025?", marketIcon: "🤖", bet: "YES", size: "$101k", pnl: "$53.2k", pnlPositive: true, pyScore: 68, archetypes: ["Bot", "Deg"] },
  { id: "3", name: "KamiyaKokona", market: "Will Zohran Mamdani win NYC race?", marketIcon: "🗳️", bet: "NO", size: "$450k", pnl: "-$503", pnlPositive: false, pyScore: 83.5, archetypes: ["MM", "Bot"] },
  { id: "4", name: "AidaYudai", market: "Fed increases interest by 25+ bps?", marketIcon: "🏦", bet: "YES", size: "$45k", pnl: "$34", pnlPositive: true, pyScore: 95.2, archetypes: ["Bot", "Arb", "Insd"] },
  { id: "5", name: "ShimaTakashi", market: "Will Donald Trump win Nobel Peace?", marketIcon: "🏆", bet: "YES", size: "$56k", pnl: "$1k", pnlPositive: true, pyScore: 99.3, archetypes: ["Arb", "Trnd"] },
  { id: "6", name: "DoiYukiko", market: "Will Joe Biden withdraw from race?", marketIcon: "🇺🇸", bet: "NO", size: "$23k", pnl: "$56k", pnlPositive: true, pyScore: 56.9, archetypes: ["MM", "Trnd"] },
  { id: "7", name: "AndouYukio", market: "Oil prices above $120/barrel in 2025?", marketIcon: "🛢️", bet: "YES", size: "$12k", pnl: "-$61k", pnlPositive: false, pyScore: 64.2, archetypes: ["Insd"] },
  { id: "8", name: "IkedaSuzuka", market: "Jerome Powell out as Fed Chair?", marketIcon: "🏦", bet: "NO", size: "$46k", pnl: "$115k", pnlPositive: true, pyScore: 70, archetypes: ["Alp", "Trnd", "MM"] },
  { id: "9", name: "TejimaKouzou", market: "Will Lewis Hamilton win?", marketIcon: "🏎️", bet: "NO", size: "$56k", pnl: "-$42", pnlPositive: false, pyScore: 40.6, archetypes: ["Arb", "MM"] },
];

export function TradersActivityWidget() {
  return (
    <Widget id="traders-activity" title="Top Traders Activity" liveIndicator accentColor="#2DD4BF" icon={<span className="text-xs">⊞</span>}>
      {/* Table Header */}
      <div className="grid grid-cols-[100px_1fr_50px_70px_80px_70px_100px_50px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {["TRADER", "MAKRET", "BET", "SIZE", "MARKET PnL", "PY (α) SCORE", "ARCHETYPE", ""].map(
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

      {/* Rows */}
      <div>
        {traderActivities.map((trader, idx) => (
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
              <span className="text-xs">{trader.marketIcon}</span>
              <Link href={`/dashboard/markets/${trader.id}`} className="truncate text-body-12 text-text-secondary hover:text-text-primary transition-colors">
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
    </Widget>
  );
}
