"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExpandedMarket {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  chance: number;
  chanceChange: number;
  timeLeft: string;
  priceYes: number;
  priceSpread: number;
  priceNo: number;
  openInterestHigh: string;
  openInterestLow: string;
  oiChangeHigh: number;
  oiChangeLow: number;
  ySentiment: "Bullish" | "Bearish" | "Neutral" | "Unclear";
  ySentScore: number;
  nSentiment: "Bullish" | "Bearish" | "Neutral" | "Unclear";
  nSentScore: number;
  liquidity: string;
  liquidityChange: number;
  volume: string;
  volumeChange: number;
  depth: string;
  newsVel: string;
  newsVelChange: number;
  category: string;
  tags: string[];
}

const markets: ExpandedMarket[] = [
  {
    id: "1", title: "Will China invade Taiwan in Oct 2025?", subtitle: "Will China invade in 2025?", icon: "🇨🇳",
    chance: 24, chanceChange: 3, timeLeft: "4m", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$2.3M", openInterestLow: "$1M", oiChangeHigh: 3, oiChangeLow: -9,
    ySentiment: "Bullish", ySentScore: 0.8, nSentiment: "Bullish", nSentScore: 0.8,
    liquidity: "1.2K", liquidityChange: 12, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Politics",
    tags: ["War", "Politics", "Military", "China"],
  },
  {
    id: "2", title: "Will Ethereum ETF be approved by end of Oct 2025?", subtitle: "Eth approval 2025", icon: "⟠",
    chance: 24, chanceChange: -34, timeLeft: "1h 4m", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$1.3M", openInterestLow: "$9M", oiChangeHigh: -12, oiChangeLow: 2,
    ySentiment: "Bearish", ySentScore: 0.2, nSentiment: "Unclear", nSentScore: 0.2,
    liquidity: "1.2K", liquidityChange: 3, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Other",
    tags: ["Music", "Reviews", "Celebrity", "Music"],
  },
  {
    id: "3", title: "S&P 500 to close above 6000 in 2025?", subtitle: "S&P 500 price 2025", icon: "📈",
    chance: 24, chanceChange: 3, timeLeft: "1h 4m", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$2M", openInterestLow: "$1.1M", oiChangeHigh: 3, oiChangeLow: -9,
    ySentiment: "Bullish", ySentScore: 0.8, nSentiment: "Bearish", nSentScore: 0.2,
    liquidity: "1.2K", liquidityChange: 3, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Tech",
    tags: ["Music", "Reviews", "Military", "China"],
  },
  {
    id: "4", title: "US unemployment rate above 6% in 2025?", subtitle: "US unemployment rate", icon: "📊",
    chance: 24, chanceChange: 3, timeLeft: "1h 4m", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$3M", openInterestLow: "$43k", oiChangeHigh: 3, oiChangeLow: -9,
    ySentiment: "Neutral", ySentScore: 0.5, nSentiment: "Neutral", nSentScore: 0.5,
    liquidity: "1.2K", liquidityChange: -12, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Business",
    tags: ["Film & TV", "Celebrity", "Film & TV", "Music"],
  },
  {
    id: "5", title: "Gold price to hit $3000/oz in 2025?", subtitle: "Gold Price", icon: "🥇",
    chance: 24, chanceChange: 3, timeLeft: "1h 4m", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$43k", openInterestLow: "$21k", oiChangeHigh: 3, oiChangeLow: -9,
    ySentiment: "Bullish", ySentScore: 0.8, nSentiment: "Bearish", nSentScore: 0.2,
    liquidity: "1.2K", liquidityChange: 12, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Tech",
    tags: ["Reviews", "Politics", "Reviews", "Film & TV"],
  },
  {
    id: "6", title: "Will Taiwan hold independence referendum in 2025?", subtitle: "Taiwan independence duration", icon: "🇹🇼",
    chance: 24, chanceChange: 3, timeLeft: "1d 4h", priceYes: 12, priceSpread: 2.1, priceNo: 86.9,
    openInterestHigh: "$2.3M", openInterestLow: "$1.1M", oiChangeHigh: 3, oiChangeLow: -9,
    ySentiment: "Bearish", ySentScore: 0.2, nSentiment: "Unclear", nSentScore: 0.2,
    liquidity: "1.2K", liquidityChange: 3, volume: "$63.3M", volumeChange: 12,
    depth: "Thin", newsVel: "533/hr", newsVelChange: -0.3, category: "Finance",
    tags: ["Interviews", "Reviews", "Music", "China"],
  },
];

const sentimentColor: Record<string, string> = {
  Bullish: "bg-action-rise-dim text-action-rise",
  Bearish: "bg-action-fall-dim text-action-fall",
  Neutral: "bg-bg-surface-raised text-text-secondary",
  Unclear: "bg-signal-amber-dim text-signal-amber",
};

export function ClosingSoonExpandedWidget() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border-primary bg-bg-base-1">
      {/* Header */}
      <div className="flex h-9 items-center gap-2 px-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-xs text-text-quaternary">⊞</span>
        <span className="text-body-12 font-semibold text-text-primary">Markets Closing Soon</span>
        <ChevronDown className="h-3 w-3 text-text-tertiary" />
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-1 text-[10px] text-text-secondary">
            △ Delta Period: 24hr <ChevronDown className="h-2.5 w-2.5" />
          </button>
          <button className="flex items-center gap-1 text-[10px] text-text-secondary">
            ⊞ Columns
          </button>
          <button className="flex items-center gap-1 text-[10px] text-text-secondary">
            ▽ Filter
          </button>
          <button className="text-text-quaternary text-xs">⋯</button>
          <button className="text-text-quaternary text-xs">⤢</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead>
            <tr style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
              {["MARKETS", "CHANCE", "TIME LEFT", "PRICE", "PRICE CHART\n24H", "OPEN INTEREST", "Y SENT.", "N SENT.", "LIQUIDITY", "VOLUME", "DEPTH\n@ $500", "NEWS VEL.", "CATEGORY", "TAGS"].map((h) => (
                <th key={h} className="px-3 py-1.5 text-left text-[10px] font-medium uppercase text-text-quaternary whitespace-pre-line">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.id} className="transition-colors duration-150 hover:bg-action-translucent-hover" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                {/* Market */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.icon}</span>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-text-primary">
                        {m.title}
                        <span className="text-text-quaternary text-[10px]">↗</span>
                      </div>
                      <div className="text-[10px] text-text-quaternary">{m.subtitle}</div>
                    </div>
                  </div>
                </td>

                {/* Chance */}
                <td className="px-3 py-2.5">
                  <span className="text-numbers-12 text-text-primary">{m.chance}%</span>
                  <div className={`text-numbers-10 ${m.chanceChange >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {m.chanceChange >= 0 ? "▲" : "▼"} {Math.abs(m.chanceChange)}%
                  </div>
                </td>

                {/* Time Left */}
                <td className="px-3 py-2.5 text-numbers-12 text-text-secondary">{m.timeLeft}</td>

                {/* Price */}
                <td className="px-3 py-2.5">
                  <span className="text-numbers-10">
                    <span className="text-action-buy">{m.priceYes}¢</span>
                    <span className="text-text-muted"> [{m.priceSpread}¢] </span>
                    <span className="text-action-sell">{m.priceNo}¢</span>
                  </span>
                </td>

                {/* Price Chart - mini sparkline placeholder */}
                <td className="px-3 py-2.5">
                  <div className="h-6 w-16">
                    <svg viewBox="0 0 64 24" className="h-full w-full">
                      <polyline
                        points={generateSparkline()}
                        fill="none"
                        stroke={m.chanceChange >= 0 ? "#00FF85" : "#FF3B3B"}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </td>

                {/* Open Interest */}
                <td className="px-3 py-2.5">
                  <div className="text-numbers-10">
                    <span className="text-action-buy">{m.openInterestHigh}</span>
                    <span className={`ml-1 text-numbers-10 ${m.oiChangeHigh >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                      {m.oiChangeHigh >= 0 ? "▲" : "▼"} {Math.abs(m.oiChangeHigh)}%
                    </span>
                  </div>
                  <div className="text-numbers-10">
                    <span className="text-action-sell">{m.openInterestLow}</span>
                    <span className={`ml-1 text-numbers-10 ${m.oiChangeLow >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                      {m.oiChangeLow >= 0 ? "▲" : "▼"} {Math.abs(m.oiChangeLow)}%
                    </span>
                  </div>
                </td>

                {/* Y Sentiment */}
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${sentimentColor[m.ySentiment]}`}>
                    {m.ySentiment}
                  </span>
                  <div className="mt-0.5 h-1.5 w-12 rounded-full bg-bg-surface">
                    <div
                      className={`h-full rounded-full ${m.ySentiment === "Bullish" ? "bg-action-rise" : m.ySentiment === "Bearish" ? "bg-action-fall" : "bg-text-quaternary"}`}
                      style={{ width: `${m.ySentScore * 100}%` }}
                    />
                  </div>
                </td>

                {/* N Sentiment */}
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${sentimentColor[m.nSentiment]}`}>
                    {m.nSentiment}
                  </span>
                  <div className="mt-0.5 h-1.5 w-12 rounded-full bg-bg-surface">
                    <div
                      className={`h-full rounded-full ${m.nSentiment === "Bullish" ? "bg-action-rise" : m.nSentiment === "Bearish" ? "bg-action-fall" : m.nSentiment === "Unclear" ? "bg-signal-amber" : "bg-text-quaternary"}`}
                      style={{ width: `${m.nSentScore * 100}%` }}
                    />
                  </div>
                </td>

                {/* Liquidity */}
                <td className="px-3 py-2.5">
                  <span className="text-numbers-12 text-text-primary">{m.liquidity}</span>
                  <div className={`text-numbers-10 ${m.liquidityChange >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {m.liquidityChange >= 0 ? "▲" : "▼"} {Math.abs(m.liquidityChange)}%
                  </div>
                </td>

                {/* Volume */}
                <td className="px-3 py-2.5">
                  <span className="text-numbers-12 text-text-primary">{m.volume}</span>
                  <div className={`text-numbers-10 ${m.volumeChange >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {m.volumeChange >= 0 ? "▲" : "▼"} {Math.abs(m.volumeChange)}%
                  </div>
                </td>

                {/* Depth */}
                <td className="px-3 py-2.5 text-numbers-12 text-text-secondary">{m.depth}</td>

                {/* News Vel */}
                <td className="px-3 py-2.5">
                  <span className="text-numbers-12 text-text-primary">{m.newsVel}</span>
                  <div className={`text-numbers-10 ${m.newsVelChange >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {m.newsVelChange >= 0 ? "▲" : "▼"}{Math.abs(m.newsVelChange)}%
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-2.5 text-body-12 text-text-secondary">{m.category}</td>

                {/* Tags */}
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((tag, i) => (
                      <Badge key={`${tag}-${i}`} variant="neutral">{tag}</Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function generateSparkline(): string {
  const points: string[] = [];
  let y = 12;
  for (let x = 0; x <= 64; x += 8) {
    y = Math.max(2, Math.min(22, y + (Math.random() - 0.5) * 8));
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}
