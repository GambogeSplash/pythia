"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { AlphaFilter } from "@/components/ui/alpha-filter";
import { PriceDisplay } from "@/components/ui/price-display";
import { useClosingSoonMarkets } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import { ExternalLink, Clock, AlertTriangle } from "lucide-react";

function deriveGoodDeal(market: { liquidity: number; yesPrice: number; noPrice: number }) {
  const spread = Math.abs(market.yesPrice - (1 - market.noPrice));
  const tightSpread = spread < 0.05;
  const highLiquidity = market.liquidity > 50_000;

  const pctChange = tightSpread && highLiquidity ? 1.3 : tightSpread ? 0.4 : -0.2;
  const fillQuality: "High Fill" | "OK Fill" = highLiquidity ? "High Fill" : "OK Fill";
  const flow = highLiquidity ? "Buy 84%" : "Sell 54%";

  return { pctChange, fillQuality, flow };
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_120px_50px_100px] items-center gap-1 px-3 py-3"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="skeleton h-6 w-6 rounded-full shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="mt-1 flex gap-2">
                  <div className="skeleton h-2.5 w-10 rounded" />
                  <div className="skeleton h-2.5 w-10 rounded" />
                  <div className="skeleton h-2.5 w-10 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="skeleton mx-auto h-3 w-20 rounded" />
          <div className="skeleton mx-auto h-3 w-8 rounded" />
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-2.5 w-14 rounded" />
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClosingSoonWidget() {
  const { markets, isLoading, isError } = useClosingSoonMarkets(10);

  return (
    <Widget
      id="closing-soon"
      title="Markets Closing Soon"
      icon={<span className="text-xs">⊞</span>}
      actions={
        <button className="flex items-center gap-1 rounded border border-border-primary bg-bg-surface px-2 py-0.5 text-[10px] text-text-secondary">
          △ Period: 24hr
        </button>
      }
    >
      <AlphaFilter extraFilters={["Disputed"]} />

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_120px_50px_100px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Price
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          <Clock className="inline h-3 w-3" />
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          GOOD DEAL?
        </span>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonRows />}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <AlertTriangle className="h-5 w-5 text-signal-amber" />
          <span className="text-body-12">Failed to load closing markets</span>
        </div>
      )}

      {/* Rows */}
      {!isLoading && !isError && (
        <div>
          {markets.map((market, idx) => {
            const priceYes = Math.round(market.yesPrice * 100);
            const priceNo = Math.round((1 - market.yesPrice) * 100);
            const spread = Math.round(Math.abs(priceYes - priceNo));
            const timeLeft = formatTimeLeft(market.endDate);
            const volumeStr = formatVolume(market.volume);
            const liquidityStr = formatVolume(market.liquidity);
            const goodDeal = deriveGoodDeal(market);

            return (
              <div
                key={market.id}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_120px_50px_100px] items-center gap-1 px-3 py-3 transition-colors duration-150 hover:bg-action-translucent-hover`}
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                {/* Market */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {market.image ? (
                      <img
                        src={market.image}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 shrink-0 rounded-full bg-bg-surface" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/markets/${market.slug || market.id}`} className="truncate text-body-12 font-medium text-text-primary hover:text-signal-green transition-colors">
                          {market.question}
                        </Link>
                        <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 text-text-quaternary" />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-numbers-10 text-text-quaternary">
                        <span>
                          <span className="text-text-muted">⊞</span> {volumeStr}
                        </span>
                        <span>
                          <span className="text-text-muted">◇</span> {liquidityStr}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  <PriceDisplay
                    yes={priceYes}
                    spread={spread}
                    no={priceNo}
                  />
                </div>

                {/* Time */}
                <div className="text-center">
                  <span className="text-numbers-12 text-text-secondary">
                    {timeLeft}
                  </span>
                </div>

                {/* Good Deal */}
                <div className="text-right">
                  <div
                    className={`text-numbers-10 font-medium ${
                      goodDeal.pctChange >= 0
                        ? "text-action-rise"
                        : "text-action-fall"
                    }`}
                  >
                    ${" "}
                    {goodDeal.pctChange >= 0 ? "+" : ""}
                    {goodDeal.pctChange}%
                  </div>
                  <div className="text-[10px] text-action-rise">
                    ✓ {goodDeal.fillQuality}
                  </div>
                  <div
                    className={`text-[10px] ${
                      goodDeal.flow.includes("Sell")
                        ? "text-action-fall"
                        : "text-action-rise"
                    }`}
                  >
                    ⟐ {goodDeal.flow}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
