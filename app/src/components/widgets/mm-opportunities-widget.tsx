"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { PriceDisplay } from "@/components/ui/price-display";
import { useMarkets } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";

export function MMOpportunitiesWidget() {
  const { markets, isLoading } = useMarkets({ limit: 6, mode: "trending" });

  return (
    <Widget id="mm-opportunities" title="Top MM Opportunities" icon={<span className="text-xs">⊞</span>}>
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_80px_100px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Spread
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          GOOD?
        </span>
      </div>

      {/* Rows */}
      <div>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_80px_100px] gap-1 px-3 py-2.5"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="h-8 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 animate-pulse rounded bg-bg-base-2" />
            </div>
          ))
        ) : markets.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No MM opportunities found
          </div>
        ) : (
          markets.map((market, idx) => {
            const yesCents = Math.round(market.yesPrice * 100);
            const noCents = Math.round(market.noPrice * 100);
            const spreadCents = Math.max(0, 100 - yesCents - noCents);
            // Reward score: higher spread + higher volume = better MM opportunity
            const reward = Math.round(spreadCents * 10 + (market.volume24h / 100000));

            return (
              <div
                key={market.id}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_80px_100px] items-center gap-1 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover`}
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                {/* Market */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{categoryIcon(market.category)}</span>
                    <div className="min-w-0">
                      <Link href={`/dashboard/markets/${market.id}`} className="block truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">
                        {market.question}
                      </Link>
                      <PriceDisplay
                        yes={yesCents}
                        spread={spreadCents}
                        no={noCents}
                      />
                    </div>
                  </div>
                </div>

                {/* Spread */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-action-rise">◉</span>
                  <span className="font-data text-body-14 font-semibold text-text-primary">
                    {spreadCents > 0 ? spreadCents : "<1"}
                  </span>
                </div>

                {/* Good? */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-numbers-10">
                    <span className="text-text-quaternary">⊞</span>
                    <span className="text-action-rise">{formatVolume(market.volume24h)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-numbers-10">
                    <span className="text-text-quaternary">◇</span>
                    <span className="text-body-12 text-text-secondary">{formatVolume(market.liquidity)}</span>
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
