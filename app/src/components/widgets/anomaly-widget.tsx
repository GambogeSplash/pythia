"use client";

import { useState } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from "@/hooks/use-markets";
import { formatVolume, formatTimeAgo } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

function deriveAnomalyType(market: { volume24h: number; liquidity: number; yesPrice: number }): "whale" | "insider" | "wash" | "divergence" {
  const volLiqRatio = market.liquidity > 0 ? market.volume24h / market.liquidity : 0;
  if (volLiqRatio > 5) return "whale";
  if (market.yesPrice > 0.85 || market.yesPrice < 0.15) return "divergence";
  if (volLiqRatio > 2) return "insider";
  return "wash";
}

function deriveSeverity(volume24h: number): "critical" | "high" | "medium" | "low" {
  if (volume24h > 1_000_000) return "critical";
  if (volume24h > 500_000) return "high";
  if (volume24h > 100_000) return "medium";
  return "low";
}

const typeConfig = {
  whale: { variant: "blue" as const, label: "Whale" },
  insider: { variant: "amber" as const, label: "Insider" },
  wash: { variant: "red" as const, label: "Wash" },
  divergence: { variant: "green" as const, label: "Divergence" },
};

const severityDot = {
  critical: "bg-signal-red animate-pulse",
  high: "bg-signal-amber",
  medium: "bg-signal-blue",
  low: "bg-text-tertiary",
};

const filterOptions = ["All", "Whales", "Insider", "Wash Trade", "Divergence"] as const;
const filterMap: Record<string, string | undefined> = {
  All: undefined,
  Whales: "whale",
  Insider: "insider",
  "Wash Trade": "wash",
  Divergence: "divergence",
};

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

export function AnomalyWidget() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const { markets, isLoading } = useMarkets({ limit: 5, mode: "movers" });

  const items = markets.map((market) => {
    const anomalyType = deriveAnomalyType(market);
    const severity = deriveSeverity(market.volume24h);
    return {
      id: market.id,
      type: anomalyType,
      title: anomalyType === "whale"
        ? "High volume activity"
        : anomalyType === "divergence"
          ? "Extreme price position"
          : anomalyType === "insider"
            ? "Unusual volume pattern"
            : "Volume anomaly detected",
      market: market.question,
      marketIcon: categoryIcon(market.category),
      marketImage: market.image,
      size: formatVolume(market.volume24h),
      timestamp: formatTimeAgo(market.updatedAt),
      severity,
      description: `${formatVolume(market.volume24h)} 24h volume with ${formatVolume(market.liquidity)} liquidity. Yes: ${Math.round(market.yesPrice * 100)}c / No: ${Math.round(market.noPrice * 100)}c.`,
    };
  });

  const filtered = filterMap[activeFilter]
    ? items.filter((item) => item.type === filterMap[activeFilter])
    : items;

  return (
    <Widget
      id="anomaly"
      title="Anomaly Feed"
      liveIndicator
      accentColor="#FF3B3B"
      icon={<AlertTriangle className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {filterOptions.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeFilter === filter
                ? "bg-signal-green text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="px-3 py-2.5"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-bg-base-3" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-bg-base-2" />
                  <div className="h-3 w-full animate-pulse rounded bg-bg-base-2" />
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-bg-base-2" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No anomalies detected
          </div>
        ) : (
          filtered.map((item, idx) => {
            const type = typeConfig[item.type];
            return (
              <div key={item.id} className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover`} style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                <div className="flex items-start gap-2.5">
                  <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${severityDot[item.severity]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={type.variant}>{type.label}</Badge>
                      <span className="text-body-12 font-medium text-text-primary">{item.title}</span>
                      <span className="ml-auto flex-shrink-0 text-[10px] text-text-quaternary">{item.timestamp}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-bg-base-2">
                        {item.marketImage ? (
                          <img src={item.marketImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[8px]">{item.marketIcon}</span>
                        )}
                      </div>
                      <Link href={`/dashboard/markets/${item.id}`} className="text-text-secondary hover:text-text-primary transition-colors">{item.market}</Link>
                      <span className="ml-auto font-data font-medium text-text-primary">{item.size}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-quaternary">{item.description}</p>
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
