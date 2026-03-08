"use client";

import Link from "next/link";
import useSWR from "swr";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { formatVolume, formatTimeAgo, truncate } from "@/lib/format";
import { Sparkles, AlertTriangle } from "lucide-react";
import type { Market, ApiResponse } from "@/lib/api/types";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
});

const signalConfig = {
  hot: { variant: "green" as const, label: "Hot" },
  warming: { variant: "amber" as const, label: "Warming" },
  quiet: { variant: "neutral" as const, label: "Quiet" },
};

type EarlySignal = keyof typeof signalConfig;

function deriveSignal(volume24h: number): EarlySignal {
  if (volume24h > 100_000) return "hot";
  if (volume24h > 10_000) return "warming";
  return "quiet";
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_70px_50px_60px_70px] items-center gap-1 px-3 py-2"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="skeleton h-4 w-4 rounded-full shrink-0" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
            <div className="ml-6 mt-1">
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
          </div>
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton ml-auto h-3 w-8 rounded" />
          <div className="skeleton ml-auto h-3 w-10 rounded" />
          <div className="skeleton ml-auto h-4 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

export function NewMarketsWidget() {
  const { data, error, isLoading } = useSWR<ApiResponse<Market[]>>(
    "/api/markets?limit=10&offset=0",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  // Sort by createdAt descending to get newest first
  const markets = [...(data?.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const isError = !!error;

  return (
    <Widget
      id="new-markets"
      title="New Markets"
      icon={<Sparkles className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_70px_50px_60px_70px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-[10px] font-medium uppercase text-text-quaternary">Market</span>
        <span className="text-[10px] font-medium uppercase text-text-quaternary">Category</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Age</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Volume</span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">Signal</span>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonRows />}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <AlertTriangle className="h-5 w-5 text-signal-amber" />
          <span className="text-body-12">Failed to load new markets</span>
        </div>
      )}

      {/* Rows */}
      {!isLoading && !isError && (
        <div>
          {markets.map((market, idx) => {
            const priceYes = Math.round(market.yesPrice * 100);
            const priceNo = Math.round((1 - market.yesPrice) * 100);
            const spread = Math.round(Math.abs(priceYes - priceNo));
            const createdAgo = formatTimeAgo(market.createdAt);
            const volumeStr = formatVolume(market.volume24h);
            const earlySignal = deriveSignal(market.volume24h);
            const signal = signalConfig[earlySignal];

            return (
              <div
                key={market.id}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_70px_50px_60px_70px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`}
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {market.image ? (
                      <img
                        src={market.image}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 shrink-0 rounded-[3px] object-cover"
                      />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-[3px] bg-bg-surface" />
                    )}
                    <Link href={`/dashboard/markets/${market.slug || market.id}`} className="truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">{truncate(market.question, 50)}</Link>
                  </div>
                  <div className="ml-6">
                    <PriceDisplay yes={priceYes} spread={spread} no={priceNo} />
                  </div>
                </div>
                <Badge variant="neutral">{market.category}</Badge>
                <span className="text-right text-numbers-12 text-text-secondary">{createdAgo}</span>
                <span className="text-right text-numbers-12 text-text-primary">{volumeStr}</span>
                <div className="flex justify-end">
                  <Badge variant={signal.variant}>{signal.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
