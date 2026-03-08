"use client";

import { useMemo } from "react";
import { Widget } from "@/components/ui/widget";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";

// ── Widget ──────────────────────────────────────────────────────────────

export function SentimentWidget() {
  const { markets, isLoading } = useMarkets({ limit: 20 });

  const sentiment = useMemo(() => {
    if (markets.length === 0) return null;

    const bullish = markets.filter((m) => m.yesPrice > 0.5).length;
    const bearish = markets.length - bullish;
    const ratio = bullish / markets.length;
    const score = Math.round(ratio * 100);

    let label: string;
    let color: string;
    if (ratio >= 0.65) {
      label = "Bullish";
      color = "text-action-rise";
    } else if (ratio <= 0.35) {
      label = "Bearish";
      color = "text-action-fall";
    } else {
      label = "Neutral";
      color = "text-signal-amber";
    }

    return { bullish, bearish, ratio, score, label, color, total: markets.length };
  }, [markets]);

  // Build per-market sentiment rows from trending markets
  const marketRows = useMemo(() => {
    return markets.slice(0, 8).map((m) => {
      const yesPercent = Math.round(m.yesPrice * 100);
      const isBullish = m.yesPrice > 0.5;
      // Simple sentiment score based on distance from 50%
      const sentimentScore = Math.round(Math.abs(m.yesPrice - 0.5) * 200);
      return {
        id: m.id,
        question: m.question,
        yesPercent,
        isBullish,
        sentimentScore,
        volume24h: m.volume24h,
      };
    });
  }, [markets]);

  return (
    <Widget
      id="sentiment"
      title="Sentiment Engine"
      liveIndicator
      accentColor="#9B59FF"
      icon={<Activity className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      {/* Aggregate Gauge */}
      {isLoading ? (
        <div className="px-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-bg-base-3" />
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-bg-base-3" />
              <div className="h-3 w-28 animate-pulse rounded bg-bg-base-3" />
            </div>
          </div>
        </div>
      ) : sentiment ? (
        <div
          className="flex items-center gap-4 px-3 py-3"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          {/* Score circle */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="var(--color-bg-base-3)"
                strokeWidth="3"
              />
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke={sentiment.ratio >= 0.5 ? "var(--color-action-rise)" : "var(--color-action-fall)"}
                strokeWidth="3"
                strokeDasharray={`${sentiment.ratio * 125.6} 125.6`}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
              />
            </svg>
            <span className={`text-numbers-12 font-bold ${sentiment.color}`}>
              {sentiment.score}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              {sentiment.ratio >= 0.5 ? (
                <TrendingUp className={`h-3.5 w-3.5 ${sentiment.color}`} />
              ) : (
                <TrendingDown className={`h-3.5 w-3.5 ${sentiment.color}`} />
              )}
              <span className={`text-body-14 font-semibold ${sentiment.color}`}>
                {sentiment.label}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-quaternary">
              <span>{sentiment.bullish} bullish</span>
              <span className="text-text-muted">/</span>
              <span>{sentiment.bearish} bearish</span>
              <span className="text-text-muted">of {sentiment.total} markets</span>
            </div>
          </div>
          {/* Bar */}
          <div className="flex w-20 flex-col gap-1">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-base-3">
              <div
                className="h-full rounded-full bg-action-rise transition-all duration-500"
                style={{ width: `${sentiment.ratio * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-action-fall">Bear</span>
              <span className="text-action-rise">Bull</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Table Header */}
      <div
        className="grid grid-cols-[1fr_52px_48px_54px_64px] gap-1 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Score
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Trend
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Yes%
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          Signal
        </span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <div className="h-3 flex-1 animate-pulse rounded bg-bg-base-3" />
                <div className="h-3 w-10 animate-pulse rounded bg-bg-base-3" />
              </div>
            ))}
          </div>
        ) : marketRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Activity className="mb-2 h-8 w-8 text-text-muted" />
            <p className="text-body-12 text-text-quaternary text-center">No market data available</p>
          </div>
        ) : (
          marketRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_52px_48px_54px_64px] items-center gap-1 px-3 py-2 transition-colors hover:bg-action-translucent-hover"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <span className="truncate text-body-12 text-text-primary">
                {row.question}
              </span>
              <span className={`text-center text-numbers-10 font-medium ${row.isBullish ? "text-action-rise" : "text-action-fall"}`}>
                {row.sentimentScore}
              </span>
              <span className="flex items-center justify-center">
                {row.isBullish ? (
                  <TrendingUp className="h-3 w-3 text-action-rise" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-action-fall" />
                )}
              </span>
              <span className="text-center text-numbers-10 text-text-secondary">
                {row.yesPercent}%
              </span>
              <span className={`text-right text-[10px] font-medium ${row.isBullish ? "text-action-rise" : "text-action-fall"}`}>
                {row.isBullish ? "BUY" : "SELL"}
              </span>
            </div>
          ))
        )}
      </div>
    </Widget>
  );
}
