"use client";

import { Widget } from "@/components/ui/widget";
import { AlphaFilter } from "@/components/ui/alpha-filter";
import { PriceDisplay } from "@/components/ui/price-display";
import { useNewMarkets } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";
import { ChevronDown } from "lucide-react";

export function SignalVolSpikeWidget() {
  const { markets, isLoading } = useNewMarkets(6);

  return (
    <Widget
      id="signal-volspike"
      title="Signal (Politics)"
      icon={<span className="text-body-12">⊞</span>}
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded border border-border-primary bg-bg-surface px-2 py-0.5 text-caption-10 text-text-secondary">
            △ Period: 24hr <ChevronDown className="h-2.5 w-2.5" />
          </button>
          <button className="flex items-center gap-1 rounded border border-border-primary bg-bg-surface px-2 py-0.5 text-caption-10 text-text-secondary">
            ⊞ Vol. Spike (5m) <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </div>
      }
    >
      <AlphaFilter />

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_60px_70px_120px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-label-10 text-text-quaternary">Market</span>
        <span className="text-right text-label-10 text-text-quaternary">
          VOL.
          <br />
          <span className="text-numbers-10 text-text-muted">24H</span>
        </span>
        <span className="text-center text-label-10 text-text-quaternary">
          DEPTH
          <br />
          <span className="text-numbers-10 text-text-muted">LIQ</span>
        </span>
        <span className="text-right text-label-10 text-text-quaternary">
          NOTIONAL
          <br />
          <span className="text-numbers-10 text-text-muted">TOTAL VOL</span>
        </span>
      </div>

      {/* Rows */}
      <div>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_60px_70px_120px] gap-1 px-3 py-2.5"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="h-8 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
            </div>
          ))
        ) : markets.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No volume spike data available
          </div>
        ) : (
          markets.map((market) => {
            const yesCents = Math.round(market.yesPrice * 100);
            const noCents = Math.round(market.noPrice * 100);
            const spreadCents = Math.max(0, 100 - yesCents - noCents);
            const depthLabel = market.liquidity > 50000 ? "Thick" : market.liquidity > 10000 ? "Med" : "Thin";
            const depthColor = market.liquidity > 50000 ? "bg-signal-green" : market.liquidity > 10000 ? "bg-signal-amber" : "bg-signal-red";

            return (
              <div
                key={market.id}
                className="grid grid-cols-[1fr_60px_70px_120px] items-center gap-1 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                {/* Market */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-bg-base-2">
                      {market.image ? (
                        <img src={market.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-caption-10">{categoryIcon(market.category)}</span>
                      )}
                    </div>
                    <span className="truncate text-body-12 text-text-primary">{market.question}</span>
                  </div>
                  <div className="ml-7">
                    <PriceDisplay yes={yesCents} spread={spreadCents} no={noCents} />
                  </div>
                </div>

                {/* VOL 24H */}
                <div className="text-right">
                  <span className="text-numbers-12 font-medium text-text-primary">{formatVolume(market.volume24h)}</span>
                </div>

                {/* Depth */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-body-12 text-text-secondary">{depthLabel}</span>
                  <div className={`h-3 w-1 rounded-sm ${depthColor}`} />
                </div>

                {/* Notional */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-caption-10 text-action-rise">↗</span>
                    <span className="font-data text-body-14 font-semibold text-text-primary">
                      {formatVolume(market.volume)}
                    </span>
                  </div>
                  <div className="text-numbers-10 text-text-quaternary">
                    Liq {formatVolume(market.liquidity)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Widget>
  );
}

function categoryIcon(category: string): string {
  const map: Record<string, string> = {
    Politics: "🏛️",
    Crypto: "⟠",
    Sports: "⚽",
    Tech: "🤖",
    Science: "🔬",
    Finance: "🏦",
    Entertainment: "🎬",
    World: "🌍",
  };
  return map[category] || "📊";
}
