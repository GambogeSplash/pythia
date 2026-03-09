"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Widget, WidgetPill, useWidgetFullscreen } from "@/components/ui/widget";
import { useMarkets } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";
import { LayoutGrid, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

type SizeBy = "volume" | "liquidity" | "change";

/** Derive a short ticker-style name from a market question */
function deriveShortName(question: string): string {
  // Remove common prefixes
  const cleaned = question
    .replace(/^(Will|Is|Are|Does|Do|Has|Have|Can|Could|Should|Would)\s+/i, "")
    .replace(/\?$/, "");

  // Extract key words: uppercase words, proper nouns, numbers, short meaningful tokens
  const words = cleaned.split(/\s+/);
  const keywords: string[] = [];

  for (const word of words) {
    const stripped = word.replace(/[^a-zA-Z0-9]/g, "");
    if (!stripped) continue;
    // Keep proper nouns (capitalized), numbers, and acronyms
    if (
      /^[A-Z]/.test(stripped) ||
      /^\d+/.test(stripped) ||
      /^[A-Z]{2,}$/.test(stripped)
    ) {
      keywords.push(stripped.toUpperCase());
    }
    if (keywords.length >= 3) break;
  }

  // Fallback: just take first 2-3 words
  if (keywords.length === 0) {
    return words
      .slice(0, 2)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
      .filter(Boolean)
      .join(" ");
  }

  return keywords.join(" ");
}

/** Derive a mock 24h change from market data */
function deriveChange(market: { yesPrice: number }, idx: number): number {
  return Number(
    ((market.yesPrice - 0.5) * 20 + Math.sin(idx) * 5).toFixed(1)
  );
}

/** Get background color style based on price change */
function getCellColor(change: number): React.CSSProperties {
  if (change > 5) return { backgroundColor: "var(--color-action-rise)", opacity: 0.7 };
  if (change > 1) return { backgroundColor: "var(--color-action-rise)", opacity: 0.4 };
  if (change >= -1) return { backgroundColor: "var(--color-bg-base-3)" };
  if (change >= -5) return { backgroundColor: "var(--color-action-fall)", opacity: 0.4 };
  return { backgroundColor: "var(--color-action-fall)", opacity: 0.7 };
}

/** Get text color class for change value */
function getChangeTextColor(change: number): string {
  if (change > 1) return "text-action-rise";
  if (change < -1) return "text-action-fall";
  return "text-text-secondary";
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-[2px] p-2">
      {Array.from({ length: 18 }).map((_, i) => {
        const isLarge = i < 3;
        const isMedium = i >= 3 && i < 8;
        return (
          <div
            key={i}
            className={`skeleton rounded-[4px] ${
              isLarge
                ? "col-span-2 row-span-2 min-h-[100px]"
                : isMedium
                  ? "col-span-2 min-h-[50px]"
                  : "min-h-[50px]"
            }`}
          />
        );
      })}
    </div>
  );
}

export function HeatmapWidget() {
  const [sizeBy, setSizeBy] = useState<SizeBy>("volume");
  const { markets, isLoading, isError } = useMarkets({ limit: 50, mode: "trending" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isFullscreen = useWidgetFullscreen();

  const sortedMarkets = useMemo(() => {
    if (!markets.length) return [];

    const withChange = markets.map((m, idx) => ({
      ...m,
      change: deriveChange(m, idx),
      shortName: deriveShortName(m.question),
    }));

    // Sort by the selected metric descending
    return withChange.sort((a, b) => {
      switch (sizeBy) {
        case "volume":
          return b.volume24h - a.volume24h;
        case "liquidity":
          return b.liquidity - a.liquidity;
        case "change":
          return Math.abs(b.change) - Math.abs(a.change);
      }
    });
  }, [markets, sizeBy]);

  return (
    <Widget
      id="heatmap"
      title="Heat Map"
      icon={<LayoutGrid className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <>
          <WidgetPill active={sizeBy === "volume"} onClick={() => setSizeBy("volume")}>
            Volume
          </WidgetPill>
          <WidgetPill active={sizeBy === "liquidity"} onClick={() => setSizeBy("liquidity")}>
            Liquidity
          </WidgetPill>
          <WidgetPill active={sizeBy === "change"} onClick={() => setSizeBy("change")}>
            Change
          </WidgetPill>
        </>
      }
    >
      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <AlertTriangle className="h-5 w-5 text-signal-amber" />
          <span className="text-body-12">Failed to load market data</span>
        </div>
      )}

      {!isLoading && !isError && sortedMarkets.length > 0 && (
        <div
          className={`relative grid gap-[2px] p-2 ${
            isFullscreen
              ? "h-full grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
              : "grid-cols-[repeat(auto-fill,minmax(80px,1fr))] auto-rows-[50px]"
          }`}
          style={isFullscreen ? { gridAutoRows: "1fr" } : undefined}
        >
          {sortedMarkets.map((market, idx) => {
            const isTop3 = idx < 3;
            const isTop8 = idx >= 3 && idx < 8;
            const cellColor = getCellColor(market.change);
            const isHovered = hoveredId === market.id;

            return (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.02,
                  ease: "easeOut",
                }}
                className={`${
                  isTop3
                    ? "col-span-2 row-span-2"
                    : isTop8
                      ? "col-span-2"
                      : ""
                }`}
              >
                <Link
                  href={`/dashboard/markets/${market.slug || market.id}`}
                  className="group/cell relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[4px] p-2 transition-all duration-150"
                  style={{
                    ...cellColor,
                    ...(isHovered
                      ? {
                          filter: "brightness(1.3)",
                          boxShadow: `inset 0 0 0 1px ${
                            market.change > 1
                              ? "var(--color-action-rise)"
                              : market.change < -1
                                ? "var(--color-action-fall)"
                                : "var(--color-text-quaternary)"
                          }, 0 0 12px ${
                            market.change > 1
                              ? "rgba(0,255,133,0.3)"
                              : market.change < -1
                                ? "rgba(255,59,59,0.3)"
                                : "rgba(255,255,255,0.1)"
                          }`,
                        }
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredId(market.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Market name */}
                  <span
                    className={`font-bold text-white ${
                      isTop3 ? (isFullscreen ? "text-body-14" : "text-body-12") : isFullscreen ? "text-body-12" : "text-caption-10 leading-tight"
                    }`}
                    style={{
                      textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: isTop3 ? 2 : 1,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {market.shortName}
                  </span>

                  {/* Change % */}
                  <span
                    className={`text-numbers-10 font-medium ${getChangeTextColor(market.change)}`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {market.change >= 0 ? "+" : ""}
                    {market.change}%
                  </span>

                  {/* Volume (corner, semi-transparent) */}
                  {isTop3 && (
                    <span className="absolute bottom-1.5 right-1.5 text-numbers-10 text-white/40">
                      {formatVolume(market.volume24h)}
                    </span>
                  )}

                  {/* Hover overlay with full details */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 z-10 flex flex-col justify-center bg-bg-base-0/85 p-2 backdrop-blur-sm"
                    >
                      <span className="text-body-12 font-semibold text-text-primary leading-tight line-clamp-2">
                        {market.question}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-numbers-10 text-text-secondary">
                          {Math.round(market.yesPrice * 100)}c
                        </span>
                        <span
                          className={`text-numbers-10 font-medium ${getChangeTextColor(market.change)}`}
                        >
                          {market.change >= 0 ? "+" : ""}
                          {market.change}%
                        </span>
                        <span className="text-numbers-10 text-text-quaternary">
                          {formatVolume(market.volume24h)}
                        </span>
                      </div>
                      <span className="mt-0.5 text-label-9 text-text-quaternary">
                        {market.category}
                      </span>
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && sortedMarkets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <LayoutGrid className="h-5 w-5 text-text-quaternary" />
          <span className="text-body-12">No market data available</span>
        </div>
      )}
    </Widget>
  );
}
