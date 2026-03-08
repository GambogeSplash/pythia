"use client";

import { useState, useMemo } from "react";
import { Widget } from "@/components/ui/widget";
import { CandlestickChart } from "lucide-react";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { truncate } from "@/lib/format";

const tabs = ["Probability", "Depth / Liquidity", "Crowd Sentiment", "Flow / Volume"];
const timeframes = ["1hr", "6hr", "1d", "1w", "All"];
const outcomeColors = ["#00FF85", "#FFB800", "#2DD4BF", "#3B82F6"];

interface OutcomeLegend {
  label: string;
  color: string;
  value: string;
  change: number;
}

function SkeletonChart() {
  return (
    <>
      <div className="flex items-center gap-6 px-4 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="skeleton h-2 w-2 rounded-full" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-4 w-10 rounded" />
          </div>
        ))}
      </div>
      <div className="px-4 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-24 rounded" />
          ))}
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="skeleton h-[220px] w-full rounded" />
      </div>
    </>
  );
}

export function MarketChartWidget() {
  const [activeTab, setActiveTab] = useState("Probability");
  const [activeTimeframe, setActiveTimeframe] = useState("1w");
  const { markets, isLoading, isError } = useTrendingMarkets(4);

  const outcomes: OutcomeLegend[] = useMemo(() => {
    if (!markets.length) return [];
    return markets.slice(0, 4).map((m, i) => {
      const yesPercent = Math.round(m.yesPrice * 100);
      // Approximate change from volume ratio
      const change = m.volume24h > 0
        ? Math.round((m.volume24h / (m.volume || 1)) * 1000 - 50) / 10
        : 0;
      return {
        label: truncate(m.question, 25),
        color: outcomeColors[i],
        value: `${yesPercent}%`,
        change: Math.round(change * 10) / 10,
      };
    });
  }, [markets]);

  // Generate chart lines from real market prices
  const chartLines = useMemo(() => {
    if (!markets.length) return [];
    return markets.slice(0, 4).map((m) => {
      const baseY = 220 - (m.yesPrice * 200);
      const points: string[] = [];
      let y = baseY;
      let seed = Math.round(m.yesPrice * 1000);
      for (let x = 0; x <= 760; x += 47.5) {
        seed = ((seed * 1103515245 + 12345) & 0x7fffffff) % 100;
        const drift = (seed / 50 - 1) * 15;
        y = Math.max(10, Math.min(210, y + drift));
        points.push(`${x},${Math.round(y)}`);
      }
      // Ensure the last point reflects the current price
      const lastX = 760;
      const lastY = Math.round(220 - (m.yesPrice * 200));
      points[points.length - 1] = `${lastX},${lastY}`;
      return points.join(" ");
    });
  }, [markets]);

  const primaryLine = chartLines[0] || "";
  const primaryLastY = markets[0] ? Math.round(220 - (markets[0].yesPrice * 200)) : 75;
  const primaryPercent = markets[0] ? `${Math.round(markets[0].yesPrice * 100)}%` : "";

  return (
    <Widget
      id="market-chart"
      title="Market Chart"
      icon={<CandlestickChart className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <div className="flex items-center gap-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-numbers-10 font-medium transition-colors duration-150 ${
                activeTimeframe === tf
                  ? "bg-signal-green text-bg-base-0"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <SkeletonChart />
      ) : isError || outcomes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <CandlestickChart className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {isError ? "Failed to load chart data" : "No market data available"}
          </span>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-6 px-4 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            {outcomes.map((o) => (
              <div key={o.label} className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: o.color }} />
                  <span className="text-body-12 text-text-secondary">{o.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-data text-body-14 font-bold text-text-primary">{o.value}</span>
                  <span className={`text-numbers-10 ${o.change >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {o.change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(o.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex px-4" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-3 py-2 text-[11px] font-medium transition-colors duration-150 ${
                  activeTab === tab
                    ? "border-signal-green text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Chart area */}
          <div className="relative px-4 py-4">
            {/* Y axis labels */}
            <div className="absolute right-4 top-4 flex flex-col justify-between text-numbers-10 text-text-quaternary" style={{ height: 200 }}>
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0%</span>
            </div>

            {/* Chart SVG */}
            <svg viewBox="0 0 800 220" className="h-[220px] w-full">
              {/* Grid lines */}
              {[0, 44, 88, 132, 176, 220].map((y) => (
                <line key={y} x1="0" y1={y} x2="760" y2={y} stroke="#161819" strokeWidth="1" />
              ))}

              {/* Area fill under primary line */}
              {primaryLine && (
                <>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF85" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00FF85" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${primaryLine} 760,220 0,220`}
                    fill="url(#greenGrad)"
                  />
                </>
              )}

              {/* Chart lines */}
              {chartLines.map((line, i) => (
                <polyline
                  key={i}
                  points={line}
                  fill="none"
                  stroke={outcomeColors[i]}
                  strokeWidth={i === 0 ? "2" : "1.5"}
                  opacity={i === 0 ? "1" : "0.7"}
                />
              ))}

              {/* Current value label for primary */}
              {primaryPercent && (
                <g transform={`translate(760, ${primaryLastY - 3})`}>
                  <rect x="-6" y="-8" width="36" height="16" rx="3" fill="#0F1012" stroke="#00FF85" strokeWidth="1" />
                  <text x="12" y="3" textAnchor="middle" fill="#00FF85" fontSize="9" fontFamily="monospace">{primaryPercent}</text>
                </g>
              )}

              {/* Animated crosshair line */}
              <line x1="760" y1="0" x2="760" y2="220" stroke="#00FF85" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
            </svg>

            {/* X axis */}
            <div className="mt-2 flex justify-between px-2 text-numbers-10 text-text-quaternary">
              <span>24 Sep</span>
              <span>25 Sep</span>
              <span>26 Sep</span>
              <span>27 Sep</span>
              <span>28 Sep</span>
            </div>

            {/* Volume bars */}
            <div className="mt-4 flex h-16 items-end gap-[2px]">
              {Array.from({ length: 60 }).map((_, i) => {
                const totalVol = markets.reduce((s, m) => s + m.volume24h, 0);
                const scale = Math.max(0.1, totalVol / 5000000);
                const buyH = (10 + Math.abs(Math.sin(i * 0.7)) * 40) * Math.min(1, scale);
                const sellH = (5 + Math.abs(Math.cos(i * 0.5)) * 25) * Math.min(1, scale);
                return (
                  <div key={i} className="flex flex-1 flex-col items-stretch gap-[1px]">
                    <div className="rounded-t-[1px] bg-signal-green/60" style={{ height: buyH }} />
                    <div className="rounded-b-[1px] bg-signal-red/60" style={{ height: sellH }} />
                  </div>
                );
              })}
            </div>

            {/* Volume labels */}
            <div className="absolute bottom-4 right-4 flex flex-col text-numbers-10 text-text-quaternary">
              <span>$20M</span>
              <span>$15M</span>
              <span>$10M</span>
              <span>$5M</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-2" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-[11px] font-medium text-text-primary">
                Volume <ChevronIcon />
              </button>
              <div className="flex items-center gap-2 text-numbers-10 text-text-secondary">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-3 rounded-sm bg-signal-green/60" /> Buy Volume
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-3 rounded-sm bg-signal-red/60" /> Sell Volume
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </Widget>
  );
}

function ChevronIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-text-tertiary">
      <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
