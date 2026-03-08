"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { AlphaFilter } from "@/components/ui/alpha-filter";
import { PriceDisplay } from "@/components/ui/price-display";
import { useTrendingMarkets } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";
import { ChevronDown } from "lucide-react";

export function SignalWidget() {
  const { markets, isLoading } = useTrendingMarkets(8);

  return (
    <Widget
      id="signal"
      title="Signal (Politics)"
      liveIndicator
      accentColor="#00FF85"
      icon={<span className="text-xs">&#x229E;</span>}
      actions={
        <div className="flex items-center gap-1">
          <FilterPill label="Period: 24hr" />
          <FilterPill label="Volatility" icon />
        </div>
      }
    >
      <AlphaFilter />
      {/* Table Header */}
      <div
        className="grid grid-cols-[1fr_60px_60px_70px_70px] gap-1 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          VOL.
          <br />
          <span className="text-[9px] text-text-muted">24H</span>
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          Spread
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          VOL/LIQ
          <br />
          <span className="text-[9px] text-text-muted">Ratio</span>
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          SLIPPAGE
          <br />
          <span className="text-[9px] text-text-muted">est.</span>
        </span>
      </div>

      {/* Rows */}
      <div>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_60px_60px_70px_70px] gap-1 px-3 py-2"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="h-8 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
            </div>
          ))
        ) : markets.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No signal data available
          </div>
        ) : (
          markets.map((market, idx) => {
            const yesCents = Math.round(market.yesPrice * 100);
            const noCents = Math.round(market.noPrice * 100);
            const spreadCents = Math.max(0, 100 - yesCents - noCents);
            const volLiqRatio = market.liquidity > 0
              ? (market.volume24h / market.liquidity).toFixed(1)
              : "0";
            const slippageEst = market.liquidity > 0
              ? Math.min(((500 / market.liquidity) * 100), 99).toFixed(1)
              : "N/A";

            return (
              <div
                key={market.id}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_60px_60px_70px_70px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`}
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                {/* Market */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{categoryIcon(market.category)}</span>
                    <Link href={`/dashboard/markets/${market.id}`} className="truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">
                      {market.question}
                    </Link>
                  </div>
                  <div className="ml-7">
                    <PriceDisplay
                      yes={yesCents}
                      spread={spreadCents}
                      no={noCents}
                    />
                  </div>
                </div>

                {/* VOL 24H */}
                <div className="text-right">
                  <span className="text-numbers-12 text-text-primary">
                    {formatVolume(market.volume24h)}
                  </span>
                </div>

                {/* Spread */}
                <div className="text-right">
                  <span className="text-numbers-12 text-text-primary">
                    {spreadCents}c
                  </span>
                </div>

                {/* Vol/Liq ratio */}
                <div className="text-right">
                  <span className="text-numbers-12 text-text-primary">
                    {volLiqRatio}x
                  </span>
                </div>

                {/* Slippage est */}
                <div className="text-right">
                  <span className="text-numbers-12 text-text-primary">
                    {slippageEst === "N/A" ? slippageEst : `${slippageEst}%`}
                  </span>
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

function FilterPill({ label, icon }: { label: string; icon?: boolean }) {
  return (
    <button className="flex h-5 items-center gap-1 rounded-[4px] bg-action-secondary px-2 text-[10px] text-text-secondary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary active:bg-action-secondary-active">
      {icon && <span className="text-[9px]">&#x229E;</span>}
      <span className="text-[10px]">&#x25B3;</span>
      {label}
      <ChevronDown className="h-2.5 w-2.5 opacity-48" />
    </button>
  );
}
