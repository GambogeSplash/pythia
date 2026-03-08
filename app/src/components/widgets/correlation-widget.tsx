"use client";

import { useState, useMemo } from "react";
import { Widget } from "@/components/ui/widget";
import { GitBranch } from "lucide-react";
import { useMarkets } from "@/hooks/use-markets";

// ---------- Helpers ----------

function coefficientColor(coeff: number): string {
  const abs = Math.abs(coeff);
  if (abs >= 0.7) return coeff > 0 ? "text-signal-green" : "text-signal-red";
  if (abs >= 0.4) return "text-signal-amber";
  return "text-text-tertiary";
}

function trendIcon(trend: "strengthening" | "weakening" | "stable"): string {
  if (trend === "strengthening") return "\u25B2";
  if (trend === "weakening") return "\u25BC";
  return "\u25CF";
}

function trendColor(trend: "strengthening" | "weakening" | "stable"): string {
  if (trend === "strengthening") return "text-signal-green";
  if (trend === "weakening") return "text-signal-red";
  return "text-text-quaternary";
}

// ---------- Tabs ----------

const tabs = ["Market Pairs", "Category View"] as const;
type Tab = (typeof tabs)[number];

// ---------- Component ----------

export function CorrelationWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("Market Pairs");
  const { markets, isLoading } = useMarkets({ limit: 20, offset: 20 });

  // Generate correlation pairs from markets in the same category
  const correlationPairs = useMemo(() => {
    if (markets.length < 2) return [];

    const pairs: {
      id: string;
      marketA: { title: string; price: number };
      marketB: { title: string; price: number };
      coefficient: number;
      trend: "strengthening" | "weakening" | "stable";
      category: string;
    }[] = [];

    // Group markets by category
    const byCategory: Record<string, typeof markets> = {};
    for (const m of markets) {
      const cat = m.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(m);
    }

    // Create pairs from same-category markets
    for (const [cat, catMarkets] of Object.entries(byCategory)) {
      for (let i = 0; i < catMarkets.length && pairs.length < 8; i++) {
        for (let j = i + 1; j < catMarkets.length && pairs.length < 8; j++) {
          const a = catMarkets[i];
          const b = catMarkets[j];
          // Compute a simple correlation proxy based on price similarity
          const priceDiff = Math.abs(a.yesPrice - b.yesPrice);
          const coefficient = +(1 - priceDiff * 2).toFixed(2); // closer prices = higher correlation
          const trend: "strengthening" | "weakening" | "stable" =
            coefficient > 0.6 ? "strengthening" : coefficient < 0 ? "weakening" : "stable";

          pairs.push({
            id: `${a.id}-${b.id}`,
            marketA: { title: a.question, price: a.yesPrice },
            marketB: { title: b.question, price: b.yesPrice },
            coefficient,
            trend,
            category: cat,
          });
        }
      }
    }

    return pairs.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)).slice(0, 8);
  }, [markets]);

  // Category summary
  const categorySummary = useMemo(() => {
    const byCategory: Record<string, { count: number; avgPrice: number; totalVol: number }> = {};
    for (const m of markets) {
      const cat = m.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = { count: 0, avgPrice: 0, totalVol: 0 };
      byCategory[cat].count++;
      byCategory[cat].avgPrice += m.yesPrice;
      byCategory[cat].totalVol += m.volume24h;
    }
    return Object.entries(byCategory)
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        avgPrice: data.avgPrice / data.count,
        totalVol: data.totalVol,
      }))
      .sort((a, b) => b.totalVol - a.totalVol);
  }, [markets]);

  return (
    <Widget
      id="correlation"
      title="Correlation Board"
      icon={<GitBranch className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-signal-green text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-3">
                <div className="h-3 flex-1 animate-pulse rounded bg-bg-base-3" />
                <div className="h-3 w-12 animate-pulse rounded bg-bg-base-3" />
              </div>
            ))}
          </div>
        ) : activeTab === "Market Pairs" ? (
          correlationPairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <GitBranch className="mb-2 h-8 w-8 text-text-muted" />
              <p className="text-body-12 text-text-quaternary text-center">
                Not enough markets in the same category to show correlations
              </p>
            </div>
          ) : (
            correlationPairs.map((pair) => (
              <div
                key={pair.id}
                className="flex flex-col gap-1.5 px-3 py-2.5 transition-colors hover:bg-action-translucent-hover"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-text-primary">
                      {pair.marketA.title}
                    </p>
                    <p className="truncate text-[11px] text-text-secondary">
                      {pair.marketB.title}
                    </p>
                  </div>
                  <div className="ml-2 flex shrink-0 flex-col items-end gap-0.5">
                    <span className={`text-numbers-12 font-bold ${coefficientColor(pair.coefficient)}`}>
                      {pair.coefficient > 0 ? "+" : ""}{pair.coefficient.toFixed(2)}
                    </span>
                    <span className={`text-[10px] ${trendColor(pair.trend)}`}>
                      {trendIcon(pair.trend)} {pair.trend}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-bg-base-3 px-1.5 py-0.5 text-[9px] text-text-quaternary">
                    {pair.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-text-quaternary">
                    <span>{Math.round(pair.marketA.price * 100)}%</span>
                    <span className="text-text-muted">vs</span>
                    <span>{Math.round(pair.marketB.price * 100)}%</span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          /* Category View */
          categorySummary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <GitBranch className="mb-2 h-8 w-8 text-text-muted" />
              <p className="text-body-12 text-text-quaternary text-center">No category data</p>
            </div>
          ) : (
            categorySummary.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-action-translucent-hover"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-12 font-medium text-text-primary">{cat.category}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-quaternary">
                    <span>{cat.count} market{cat.count !== 1 ? "s" : ""}</span>
                    <span>Avg {Math.round(cat.avgPrice * 100)}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-numbers-10 font-medium ${cat.avgPrice > 0.5 ? "text-action-rise" : "text-action-fall"}`}>
                    {cat.avgPrice > 0.5 ? "Bullish" : "Bearish"}
                  </span>
                  <span className="text-[10px] text-text-quaternary">
                    ${cat.totalVol >= 1000000 ? `${(cat.totalVol / 1000000).toFixed(1)}M` : cat.totalVol >= 1000 ? `${(cat.totalVol / 1000).toFixed(0)}K` : cat.totalVol.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </Widget>
  );
}
