"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { formatVolume, truncate } from "@/lib/format";
import { TrendingUp, AlertTriangle } from "lucide-react";

const momentumConfig = {
  surging: { variant: "green" as const, label: "Surging" },
  rising: { variant: "green" as const, label: "Rising" },
  warming: { variant: "amber" as const, label: "Warming" },
  fading: { variant: "amber" as const, label: "Fading" },
  crashing: { variant: "red" as const, label: "Crashing" },
};

type Momentum = keyof typeof momentumConfig;

function deriveMomentum(volume24h: number): Momentum {
  if (volume24h > 1_000_000) return "surging";
  if (volume24h > 100_000) return "rising";
  if (volume24h > 10_000) return "warming";
  return "fading";
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_50px_60px_70px_60px_80px] items-center gap-1 px-3 py-2"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="skeleton h-5 w-5 rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton mt-1 h-2.5 w-12 rounded" />
            </div>
          </div>
          <div className="skeleton ml-auto h-3 w-8 rounded" />
          <div className="skeleton ml-auto h-3 w-10 rounded" />
          <div className="skeleton ml-auto h-3 w-12 rounded" />
          <div className="skeleton ml-auto h-3 w-8 rounded" />
          <div className="skeleton ml-auto h-4 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TrendingWidget() {
  const { markets, isLoading, isError } = useTrendingMarkets(10);

  return (
    <Widget
      id="trending"
      title="Trending & Momentum"
      liveIndicator
      icon={<TrendingUp className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      <div className="grid grid-cols-[1fr_50px_60px_70px_60px_80px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-[10px] font-medium uppercase text-text-quaternary">Market</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">YES</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">24h</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Volume</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Vol Δ</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Momentum</span>
      </div>

      {isLoading && <SkeletonRows />}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <AlertTriangle className="h-5 w-5 text-signal-amber" />
          <span className="text-body-12">Failed to load trending markets</span>
        </div>
      )}

      {!isLoading && !isError && (
        <div>
          {markets.map((market, idx) => {
            const priceYes = Math.round(market.yesPrice * 100);
            const volume24hFormatted = formatVolume(market.volume24h);
            const momentum = deriveMomentum(market.volume24h);
            const momentumCfg = momentumConfig[momentum];
            // We don't have historical price data for change24h or volumeDelta from the API,
            // so we derive reasonable defaults: 0% change, 0% delta
            const change24h = 0;
            const volumeDelta = 0;

            return (
              <div key={market.id} className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_50px_60px_70px_60px_80px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                <div className="flex min-w-0 items-center gap-2">
                  {market.image ? (
                    <img
                      src={market.image}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 shrink-0 rounded-[4px] object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-[4px] bg-bg-surface" />
                  )}
                  <div className="min-w-0">
                    <Link href={`/dashboard/markets/${market.slug || market.id}`} className="block truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">{truncate(market.question, 50)}</Link>
                    <Badge variant="neutral" className="mt-0.5">{market.category}</Badge>
                  </div>
                </div>
                <span className="text-right text-numbers-12 text-action-buy">{priceYes}¢</span>
                <span className={`text-right text-numbers-12 font-medium ${change24h >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                  {change24h >= 0 ? "+" : ""}{change24h}%
                </span>
                <span className="text-right text-numbers-12 text-text-primary">{volume24hFormatted}</span>
                <span className={`text-right text-numbers-10 ${volumeDelta >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                  {volumeDelta >= 0 ? "▲" : "▼"} {Math.abs(volumeDelta)}%
                </span>
                <div className="flex justify-end">
                  <Badge variant={momentumCfg.variant}>{momentumCfg.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
