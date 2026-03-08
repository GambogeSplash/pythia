"use client";

import { useMemo } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useClosingSoonMarkets } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft, truncate } from "@/lib/format";
import type { Market } from "@/lib/api/types";

interface ExpandedMarket {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
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

function deriveSentiment(price: number): { label: "Bullish" | "Bearish" | "Neutral" | "Unclear"; score: number } {
  if (price > 0.7) return { label: "Bullish", score: price };
  if (price > 0.5) return { label: "Bullish", score: price * 0.9 };
  if (price > 0.4) return { label: "Neutral", score: 0.5 };
  if (price > 0.2) return { label: "Bearish", score: 1 - price };
  return { label: "Bearish", score: 1 - price };
}

function deriveDepth(liquidity: number): string {
  if (liquidity > 500000) return "Deep";
  if (liquidity > 100000) return "Medium";
  return "Thin";
}

function deriveTags(category: string, question: string): string[] {
  const tags: string[] = [category];
  const q = question.toLowerCase();
  if (q.includes("trump") || q.includes("biden") || q.includes("election")) tags.push("Politics");
  if (q.includes("bitcoin") || q.includes("ethereum") || q.includes("crypto")) tags.push("Crypto");
  if (q.includes("war") || q.includes("invade") || q.includes("military")) tags.push("Military");
  if (q.includes("fed") || q.includes("interest") || q.includes("rate")) tags.push("Macro");
  if (q.includes("oil") || q.includes("gold") || q.includes("commodity")) tags.push("Commodities");
  if (tags.length < 2) tags.push("Markets");
  return tags.slice(0, 4);
}

function mapMarket(m: Market): ExpandedMarket {
  const yesPercent = Math.round(m.yesPrice * 100);
  const noPercent = Math.round(m.noPrice * 100);
  const spread = Math.round(Math.abs(m.yesPrice - (1 - m.noPrice)) * 1000) / 10;
  const ySent = deriveSentiment(m.yesPrice);
  const nSent = deriveSentiment(m.noPrice);
  // Approximate change using volume ratio as proxy
  const chanceChange = m.volume24h > 0 ? Math.round((m.volume24h / (m.volume || 1)) * 100 - 50) / 10 : 0;

  return {
    id: m.id,
    slug: m.slug || m.id,
    title: m.question,
    subtitle: truncate(m.description || m.question, 30),
    image: m.image,
    chance: yesPercent,
    chanceChange,
    timeLeft: formatTimeLeft(m.endDate),
    priceYes: yesPercent,
    priceSpread: spread,
    priceNo: noPercent,
    openInterestHigh: formatVolume(m.volume * 0.6),
    openInterestLow: formatVolume(m.volume * 0.4),
    oiChangeHigh: Math.round(chanceChange * 2),
    oiChangeLow: -Math.round(chanceChange * 1.5),
    ySentiment: ySent.label,
    ySentScore: ySent.score,
    nSentiment: nSent.label,
    nSentScore: nSent.score,
    liquidity: formatVolume(m.liquidity),
    liquidityChange: Math.round(chanceChange * 1.2),
    volume: formatVolume(m.volume),
    volumeChange: m.volume24h > 0 ? Math.round((m.volume24h / (m.volume || 1)) * 1000) / 10 : 0,
    depth: deriveDepth(m.liquidity),
    newsVel: `${Math.max(1, Math.round(m.volume24h / 10000))}/hr`,
    newsVelChange: Math.round(chanceChange * 0.3 * 10) / 10,
    category: m.category || "Other",
    tags: deriveTags(m.category || "Other", m.question),
  };
}

const sentimentColor: Record<string, string> = {
  Bullish: "bg-action-rise-dim text-action-rise",
  Bearish: "bg-action-fall-dim text-action-fall",
  Neutral: "bg-bg-surface-raised text-text-secondary",
  Unclear: "bg-signal-amber-dim text-signal-amber",
};

function SkeletonRows() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="skeleton h-5 w-5 rounded-[4px] shrink-0" />
              <div>
                <div className="skeleton h-3 w-40 rounded mb-1" />
                <div className="skeleton h-2.5 w-20 rounded" />
              </div>
            </div>
          </td>
          {Array.from({ length: 13 }).map((_, j) => (
            <td key={j} className="px-3 py-2.5">
              <div className="skeleton h-3 w-12 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function ClosingSoonExpandedWidget() {
  const { markets: rawMarkets, isLoading, isError } = useClosingSoonMarkets(10);
  const markets = useMemo(() => rawMarkets.map(mapMarket), [rawMarkets]);

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
          {isLoading ? (
            <SkeletonRows />
          ) : isError || markets.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={14} className="px-3 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-text-quaternary" />
                    <span className="text-body-12 text-text-secondary">
                      {isError ? "Failed to load markets" : "No markets closing soon"}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {markets.map((m) => (
                <tr key={m.id} className="transition-colors duration-150 hover:bg-action-translucent-hover" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                  {/* Market */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt=""
                          className="h-5 w-5 shrink-0 rounded-[4px] bg-bg-base-2 object-cover"
                        />
                      ) : (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-bg-base-2 text-[10px] text-text-quaternary">
                          ?
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-text-primary">
                          {truncate(m.title, 50)}
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

                  {/* Price Chart - mini sparkline */}
                  <td className="px-3 py-2.5">
                    <div className="h-6 w-16">
                      <svg viewBox="0 0 64 24" className="h-full w-full">
                        <polyline
                          points={generateSparkline(m.chance)}
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
          )}
        </table>
      </div>
    </div>
  );
}

/** Generate a seeded sparkline based on the chance value for consistent rendering */
function generateSparkline(seed: number): string {
  const points: string[] = [];
  let y = 12 + (seed % 10) - 5;
  let s = seed;
  for (let x = 0; x <= 64; x += 8) {
    // Simple deterministic pseudo-random based on seed
    s = ((s * 1103515245 + 12345) & 0x7fffffff) % 100;
    y = Math.max(2, Math.min(22, y + (s / 50 - 1) * 4));
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}
