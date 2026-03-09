"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Wallet } from "lucide-react";
import { usePositions } from "@/hooks/use-user-data";
import { formatVolume } from "@/lib/format";

const exposureColors = ["bg-signal-green", "bg-signal-green/60", "bg-signal-green/35", "bg-signal-green/15"];

function SkeletonRows() {
  return (
    <>
      {/* Summary skeleton */}
      <div className="grid grid-cols-4 gap-3 px-3 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton h-2.5 w-14 rounded mb-1.5" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        ))}
      </div>
      {/* Exposure skeleton */}
      <div className="px-3 py-2" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div className="skeleton h-2.5 w-16 rounded mb-1.5" />
        <div className="skeleton h-2 w-full rounded-full" />
      </div>
      {/* Table skeleton */}
      <div className="px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div className="skeleton h-2.5 w-full rounded" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
          <div className="skeleton h-3 flex-1 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      ))}
    </>
  );
}

export function PortfolioWidget() {
  const { positions, isLoading, isError, isAuthenticated } = usePositions();

  const summary = useMemo(() => {
    if (!positions.length) return null;

    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const venues = new Set(positions.map((p) => p.venue)).size;

    // Compute category exposure
    const categoryMap: Record<string, number> = {};
    for (const p of positions) {
      const cat = p.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + p.marketValue;
    }
    const exposure = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([category, value]) => ({
        category,
        pct: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      }));

    return {
      totalValue: formatVolume(totalValue),
      totalPnl: `${totalPnl >= 0 ? "+" : ""}${formatVolume(Math.abs(totalPnl))}`,
      totalPnlPct: Math.round(totalPnlPct * 10) / 10,
      pnlPositive: totalPnl >= 0,
      positions: positions.length,
      venues,
      exposure,
    };
  }, [positions]);

  return (
    <Widget id="portfolio" title="Portfolio" icon={<Wallet className="h-3.5 w-3.5 text-text-tertiary" />}>
      {isLoading ? (
        <SkeletonRows />
      ) : isError || !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <Wallet className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">
            {isError ? "Failed to load portfolio" : "Sign in to view your portfolio"}
          </span>
        </div>
      ) : !summary || positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <Wallet className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">No open positions</span>
          <span className="text-caption-10 text-text-quaternary">Start trading to see your portfolio here</span>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-3 px-3 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Total Value</div>
              <div className="font-data text-body-14 font-semibold text-text-primary">{summary.totalValue}</div>
            </div>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Total PnL</div>
              <div className={`font-data text-body-14 font-semibold ${summary.pnlPositive ? "text-action-rise" : "text-action-fall"}`}>
                {summary.totalPnl}
                <span className="ml-1 text-body-12">({summary.pnlPositive ? "+" : ""}{summary.totalPnlPct}%)</span>
              </div>
            </div>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Positions</div>
              <div className="font-data text-body-14 font-semibold text-text-primary">{summary.positions}</div>
            </div>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Venues</div>
              <div className="font-data text-body-14 font-semibold text-text-primary">{summary.venues}</div>
            </div>
          </div>

          {/* Exposure bar */}
          <div className="px-3 py-2" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            <div className="mb-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">Exposure</div>
            <div className="flex h-2 overflow-hidden rounded-full">
              {summary.exposure.map((seg, i) => (
                <div key={seg.category} className={exposureColors[i] || "bg-bg-surface-raised"} style={{ width: `${seg.pct}%` }} />
              ))}
            </div>
            <div className="mt-1.5 flex gap-3">
              {summary.exposure.map((seg, i) => (
                <span key={seg.category} className="flex items-center gap-1 text-numbers-10 text-text-quaternary">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${exposureColors[i] || "bg-bg-surface-raised"}`} />
                  {seg.category} {seg.pct}%
                </span>
              ))}
            </div>
          </div>

          {/* Positions table */}
          <div className="grid grid-cols-[1fr_35px_55px_45px_50px_65px_70px_50px] gap-1 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            {["MARKET", "SIDE", "SIZE", "ENTRY", "NOW", "PNL", "VENUE", "EXP"].map((h) => (
              <span key={h} className="text-label-10 text-text-quaternary">{h}</span>
            ))}
          </div>
          <div>
            {positions.map((pos, idx) => {
              const pnlPositive = pos.pnl >= 0;
              const endDate = new Date(pos.openedAt);
              const expiry = `${endDate.toLocaleString("default", { month: "short" })} ${endDate.getDate()}`;

              return (
                <div key={pos.id} className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} grid grid-cols-[1fr_35px_55px_45px_50px_65px_70px_50px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Link href={`/dashboard/markets/${pos.marketId}`} className="truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">{pos.marketQuestion}</Link>
                  </div>
                  <span className={`text-body-12 font-semibold ${pos.side === "YES" ? "text-action-buy" : "text-action-sell"}`}>{pos.side}</span>
                  <span className="text-numbers-12 text-text-primary">{formatVolume(pos.marketValue)}</span>
                  <span className="text-numbers-12 text-text-secondary">{Math.round(pos.avgPrice * 100)}c</span>
                  <span className="text-numbers-12 text-text-primary">{Math.round(pos.currentPrice * 100)}c</span>
                  <span className={`text-numbers-12 font-medium ${pnlPositive ? "text-action-rise" : "text-action-fall"}`}>
                    {pnlPositive ? "+" : ""}{formatVolume(Math.abs(pos.pnl))}
                  </span>
                  <span className="text-caption-10 text-text-secondary capitalize">{pos.venue}</span>
                  <span className="text-numbers-10 text-text-quaternary">{expiry}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Widget>
  );
}
