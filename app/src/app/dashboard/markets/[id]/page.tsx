"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useMarket, useOrderbook } from "@/hooks/use-markets";
import { useAIAnalysis } from "@/hooks/use-ai";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import type { PricePoint } from "@/lib/api/types";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  ExternalLink,
  Droplets,
  DollarSign,
  ShoppingCart,
  Check,
  Brain,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Animation variants ─────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

// ─── Chart helpers ──────────────────────────────────────────────────────────
const CHART_W = 700;
const CHART_H = 200;

/** Map timeframe button index to API interval */
const TIMEFRAME_TO_INTERVAL: Record<number, string> = {
  0: "1d",  // 1hr
  1: "1d",  // 6hr
  2: "1d",  // 1d
  3: "1w",  // 1w
  4: "all", // All
};

function buildChartPaths(
  priceHistory: PricePoint[],
  width: number,
  height: number,
): { linePath: string; areaPath: string; lastPrice: number; minP: number; maxP: number } {
  if (priceHistory.length === 0) {
    return { linePath: "", areaPath: "", lastPrice: 0, minP: 0, maxP: 1 };
  }

  const prices = priceHistory.map((pt) => pt.p);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const range = rawMax - rawMin || 0.1;
  const minP = rawMin - range * 0.1;
  const maxP = rawMax + range * 0.1;

  const xStep = width / Math.max(priceHistory.length - 1, 1);

  const pts = priceHistory.map((pt, i) => {
    const x = i * xStep;
    const y = height - ((pt.p - minP) / (maxP - minP)) * height;
    return `${x},${y}`;
  });

  const linePath = `M${pts.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return { linePath, areaPath, lastPrice: prices[prices.length - 1], minP, maxP };
}

/** Generate Y-axis labels from price range */
function getYLabels(minP: number, maxP: number, count: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const frac = 1 - i / (count - 1);
    const val = minP + frac * (maxP - minP);
    labels.push(`${Math.round(val * 100)}%`);
  }
  return labels;
}

// ─── Loading skeleton ──────────────────────────────────────────────────────
function MarketDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="flex h-9 shrink-0 items-center px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="flex h-full gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <div
              className="rounded-[12px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="skeleton mb-2 h-5 w-3/4 rounded" />
              <div className="flex gap-3">
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            </div>
            <div
              className="flex-1 rounded-[12px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="skeleton h-[200px] w-full rounded" />
            </div>
          </div>
          <div className="flex w-72 flex-shrink-0 flex-col gap-2">
            <div
              className="rounded-[12px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-full rounded" />
                ))}
              </div>
            </div>
            <div
              className="rounded-[12px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-6 w-full rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [activeTimeframe, setActiveTimeframe] = useState(2);
  const timeframes = ["1hr", "6hr", "1d", "1w", "All"];

  // ── Quick Trade state ─────────────────────────────────────────────────
  const [tradeSide, setTradeSide] = useState<"yes" | "no">("yes");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePlacing, setTradePlacing] = useState(false);
  const [tradePlaced, setTradePlaced] = useState(false);

  // ── AI Analysis ────────────────────────────────────────────────────────
  const { analysis, isLoading: aiLoading, refetch: refetchAI } = useAIAnalysis(id);

  // ── Real data hooks ─────────────────────────────────────────────────────
  const interval = TIMEFRAME_TO_INTERVAL[activeTimeframe] ?? "1d";
  const { market, priceHistory, isLoading: marketLoading, isError: marketError } = useMarket(id, { history: true, interval });
  const { orderbook, isLoading: orderbookLoading } = useOrderbook(id);

  // ── Derived chart data ──────────────────────────────────────────────────
  const { linePath: chartPath, areaPath, lastPrice, minP, maxP } = useMemo(
    () => buildChartPaths(priceHistory, CHART_W, CHART_H),
    [priceHistory],
  );

  const yLabels = useMemo(() => getYLabels(minP, maxP, 5), [minP, maxP]);

  // ── Derived prices ─────────────────────────────────────────────────────
  const yesPercent = market ? Math.round(market.yesPrice * 100) : 0;
  const noPercent = market ? Math.round(market.noPrice * 100) : 0;
  const spread = market ? Math.abs(100 - yesPercent - noPercent) : 0;
  const lastPricePercent = Math.round(lastPrice * 100);

  // ── Chart stats from price history ──────────────────────────────────────
  const chartStats = useMemo(() => {
    if (priceHistory.length === 0) return null;
    const prices = priceHistory.map((pt) => pt.p);
    const openP = Math.round(prices[0] * 100);
    const highP = Math.round(Math.max(...prices) * 100);
    const lowP = Math.round(Math.min(...prices) * 100);
    const currentP = Math.round(prices[prices.length - 1] * 100);
    const change = currentP - openP;
    return { openP, highP, lowP, currentP, change };
  }, [priceHistory]);

  // ── Orderbook derived data ─────────────────────────────────────────────
  const orderbookBids = useMemo(() => {
    if (!orderbook) return [];
    let cumTotal = 0;
    const rows = orderbook.bids.slice(0, 5).map((level) => {
      const price = Math.round(parseFloat(level.price) * 100);
      const size = Math.round(parseFloat(level.size));
      cumTotal += size;
      return { price, size, total: cumTotal, depth: 0 };
    });
    const maxTotal = cumTotal || 1;
    return rows.map((r) => ({ ...r, depth: Math.round((r.total / maxTotal) * 100) }));
  }, [orderbook]);

  const orderbookAsks = useMemo(() => {
    if (!orderbook) return [];
    let cumTotal = 0;
    const rows = orderbook.asks.slice(0, 5).map((level) => {
      const price = Math.round(parseFloat(level.price) * 100);
      const size = Math.round(parseFloat(level.size));
      cumTotal += size;
      return { price, size, total: cumTotal, depth: 0 };
    });
    const maxTotal = cumTotal || 1;
    return rows.map((r) => ({ ...r, depth: Math.round((r.total / maxTotal) * 100) }));
  }, [orderbook]);

  const orderbookSpread = orderbook ? `${(orderbook.spread * 100).toFixed(1)}%` : "--";

  // ── Format end date ────────────────────────────────────────────────────
  const endDateFormatted = market?.endDate
    ? new Date(market.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "--";
  const timeLeft = market?.endDate ? formatTimeLeft(market.endDate) : "--";

  // ── Quick Trade derived values ──────────────────────────────────────────
  const tradePrice = market ? (tradeSide === "yes" ? market.yesPrice : market.noPrice) : 0;
  const tradeAmountNum = parseFloat(tradeAmount) || 0;
  const tradeShares = tradePrice > 0 ? tradeAmountNum / tradePrice : 0;
  const tradePotentialProfit = tradePrice > 0 ? tradeAmountNum * ((1 - tradePrice) / tradePrice) : 0;

  const handlePlaceOrder = useCallback(async () => {
    if (!market || tradeAmountNum <= 0 || tradePlacing) return;
    setTradePlacing(true);
    try {
      const side = tradeSide.toUpperCase();
      const tradeBody = {
        marketId: market.id,
        marketQuestion: market.question,
        venue: "polymarket",
        side,
        action: "buy",
        shares: parseFloat(tradeShares.toFixed(2)),
        price: tradePrice,
        amount: tradeAmountNum,
        fee: 0,
      };
      const positionBody = {
        marketId: market.id,
        marketQuestion: market.question,
        venue: "polymarket",
        side,
        shares: parseFloat(tradeShares.toFixed(2)),
        avgPrice: tradePrice,
        currentPrice: tradePrice,
        costBasis: tradeAmountNum,
        marketValue: tradeAmountNum,
        pnl: 0,
        pnlPercent: 0,
        category: market.category || null,
        status: "open",
      };
      await Promise.all([
        fetch("/api/user/trades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tradeBody) }),
        fetch("/api/user/positions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(positionBody) }),
      ]);
      setTradePlaced(true);
      setTradeAmount("");
      setTimeout(() => setTradePlaced(false), 2000);
    } catch {
      // silently handle error for now
    } finally {
      setTradePlacing(false);
    }
  }, [market, tradeAmountNum, tradePlacing, tradeSide, tradeShares, tradePrice]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (marketLoading) {
    return <MarketDetailSkeleton />;
  }

  // ── Error / not found state ────────────────────────────────────────────
  if (marketError || !market) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-red/10">
          <AlertTriangle className="h-7 w-7 text-signal-red" />
        </div>
        <h2 className="text-header-20 text-text-primary">Market Not Found</h2>
        <p className="text-body-12 text-text-tertiary">
          The market with ID &ldquo;{id}&rdquo; could not be loaded. It may have been removed or the ID is invalid.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 rounded-[8px] bg-signal-green px-4 py-2 text-body-12 font-semibold text-bg-base-0 transition-transform hover:scale-105"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Sub-header breadcrumb ─────────────────────────────────────────── */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-numbers-10 text-text-quaternary hover:text-text-secondary transition-colors">
            Dashboard
          </Link>
          <span className="text-numbers-10 text-text-quaternary">/</span>
          <span className="text-body-12 font-semibold text-text-primary">Market Detail</span>
          <div className="h-3 w-px bg-divider-heavy" />
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-signal-green" />
            <span className="text-numbers-10 text-signal-green">{market.active ? "LIVE" : "CLOSED"}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <motion.div
          className="flex h-full gap-2"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* ── Left panel: header + chart + info ─────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Market header — compact */}
            <motion.div
              variants={fadeUp}
              className="rounded-[12px] bg-bg-base-1 px-4 py-3"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-bg-base-2"
                  style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                >
                  {market.image ? (
                    <img src={market.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-header-16">&#x1F3E6;</span>
                  )}
                </div>

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-body-14 font-semibold text-text-primary">
                    {market.question}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {market.category && (
                      <span className="rounded-[4px] bg-signal-blue/10 px-1.5 py-0.5 text-numbers-10 font-medium text-signal-blue">
                        {market.category}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-text-quaternary" />
                      <span className="text-numbers-10 text-text-tertiary">{endDateFormatted}</span>
                    </div>
                    <span className="text-numbers-10 font-semibold text-signal-amber">{timeLeft} left</span>
                  </div>
                </div>

                {/* Prices */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-numbers-10 text-text-quaternary">YES</div>
                    <div className="font-data text-header-16 font-bold text-signal-green">{yesPercent}&cent;</div>
                  </div>
                  <div className="text-center">
                    <div className="text-numbers-10 text-text-quaternary">NO</div>
                    <div className="font-data text-header-16 font-bold text-signal-red">{noPercent}&cent;</div>
                  </div>
                  <div className="h-8 w-px bg-divider-heavy" />
                  <div className="text-center">
                    <div className="text-numbers-10 text-text-quaternary">Volume</div>
                    <div className="text-numbers-12 font-medium text-text-primary">{formatVolume(market.volume24h)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-numbers-10 text-text-quaternary">Liquidity</div>
                    <div className="text-numbers-12 font-medium text-text-primary">{formatVolume(market.liquidity)}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Price chart */}
            <motion.div
              variants={fadeUp}
              className="flex flex-1 flex-col rounded-[12px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              {/* Timeframe bar */}
              <div
                className="flex h-9 items-center justify-between px-4"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <span className="text-body-12 font-semibold text-text-primary">Price Chart</span>
                <div className="flex items-center gap-1">
                  {timeframes.map((tf, i) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(i)}
                      className={`rounded-[4px] px-2 py-0.5 text-numbers-10 font-medium transition-colors duration-150 ${
                        activeTimeframe === i
                          ? "bg-signal-green text-bg-base-0"
                          : "text-text-secondary hover:bg-bg-base-2 hover:text-text-primary"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart area */}
              <div className="relative flex-1 px-3 py-3">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-3 flex h-[200px] flex-col justify-between py-1 pl-1">
                  {yLabels.map((label, i) => (
                    <span key={i} className="text-numbers-10 text-text-quaternary">{label}</span>
                  ))}
                </div>

                {/* Grid lines + chart */}
                <svg width="100%" height="200" className="ml-6" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                    <line
                      key={pct}
                      x1="0"
                      y1={CHART_H * pct}
                      x2={CHART_W}
                      y2={CHART_H * pct}
                      stroke="var(--color-divider-heavy)"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                  ))}

                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-signal-green)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-signal-green)" stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="chartClip">
                      <rect x="0" y="0" width={CHART_W} height={CHART_H} />
                    </clipPath>
                  </defs>

                  {priceHistory.length > 0 && (
                    <>
                      <motion.path
                        d={areaPath}
                        fill="url(#chartGradient)"
                        clipPath="url(#chartClip)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                      <motion.path
                        d={chartPath}
                        fill="none"
                        stroke="var(--color-signal-green)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: "easeInOut" as const }}
                      />
                      <motion.circle
                        cx={CHART_W}
                        cy={CHART_H - ((lastPrice - minP) / (maxP - minP)) * CHART_H}
                        r="4"
                        fill="var(--color-signal-green)"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.8, duration: 0.3 }}
                      />
                      <motion.circle
                        cx={CHART_W}
                        cy={CHART_H - ((lastPrice - minP) / (maxP - minP)) * CHART_H}
                        r="8"
                        fill="var(--color-signal-green)"
                        opacity="0.2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 0.3, 0] as const, scale: [0.5, 1.5, 2] as const }}
                        transition={{ delay: 1.8, duration: 2, repeat: Infinity }}
                      />
                    </>
                  )}

                  {priceHistory.length === 0 && (
                    <text x={CHART_W / 2} y={CHART_H / 2} textAnchor="middle" fill="var(--color-text-quaternary)" fontSize="12">
                      No price history available
                    </text>
                  )}
                </svg>

                {/* Current price label */}
                {priceHistory.length > 0 && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[4px] bg-signal-green px-1.5 py-0.5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8, duration: 0.4 }}
                  >
                    <span className="text-numbers-10 font-bold text-bg-base-0">{lastPricePercent}%</span>
                  </motion.div>
                )}
              </div>

              {/* Chart stats footer */}
              <div
                className="flex items-center gap-4 px-4 py-2"
                style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
              >
                {(chartStats ? [
                  { label: "Open", value: `${chartStats.openP}%`, color: "text-text-primary" },
                  { label: "High", value: `${chartStats.highP}%`, color: "text-signal-green" },
                  { label: "Low", value: `${chartStats.lowP}%`, color: "text-signal-red" },
                  { label: "Current", value: `${chartStats.currentP}%`, color: "text-signal-green" },
                  { label: "Change", value: `${chartStats.change >= 0 ? "+" : ""}${chartStats.change}%`, color: chartStats.change >= 0 ? "text-signal-green" : "text-signal-red" },
                ] : [
                  { label: "Open", value: "--", color: "text-text-primary" },
                  { label: "High", value: "--", color: "text-text-primary" },
                  { label: "Low", value: "--", color: "text-text-primary" },
                  { label: "Current", value: `${yesPercent}%`, color: "text-signal-green" },
                ]).map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <span className="text-numbers-10 text-text-quaternary">{stat.label}</span>
                    <span className={`text-numbers-12 font-medium ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Market description + details */}
            {(market.description || market.endDate) && (
              <motion.div
                variants={fadeUp}
                className="rounded-[12px] bg-bg-base-1 px-4 py-3"
                style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
              >
                <div className="text-body-12 font-semibold text-text-primary mb-2">Market Info</div>
                {market.description && (
                  <p className="text-body-12 text-text-tertiary leading-relaxed">
                    {market.description}
                  </p>
                )}
                {market.endDate && (
                  <div
                    className="mt-2 flex items-center gap-4 pt-2"
                    style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-thin)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-text-quaternary" />
                      <span className="text-numbers-10 text-text-quaternary">End Date</span>
                      <span className="text-numbers-12 text-text-secondary">{endDateFormatted}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-numbers-10 text-text-quaternary">Resolution</span>
                      <span className="text-numbers-10 text-text-secondary">Polymarket / UMA Oracle</span>
                    </div>
                    <a
                      href={`https://polymarket.com/event/${market.slug || market.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-numbers-10 text-text-quaternary hover:text-text-secondary transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Polymarket
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Analysis */}
            <motion.div
              variants={fadeUp}
              className="rounded-[12px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-9 items-center justify-between px-4"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-signal-green" />
                  <span className="text-body-12 font-semibold text-text-primary">Pythia AI Analysis</span>
                </div>
                <button
                  onClick={() => refetchAI()}
                  disabled={aiLoading}
                  className="flex h-5 items-center gap-1 rounded-[4px] bg-action-secondary px-2 text-caption-10 text-text-secondary transition-colors hover:bg-action-secondary-hover hover:text-text-primary disabled:opacity-50"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${aiLoading ? "animate-spin" : ""}`} />
                  {analysis ? "Refresh" : "Analyze"}
                </button>
              </div>
              <div className="px-4 py-3">
                {!analysis && !aiLoading && (
                  <p className="text-body-12 text-text-quaternary">
                    Click &ldquo;Analyze&rdquo; to get AI-powered insights for this market.
                  </p>
                )}
                {aiLoading && !analysis && (
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-4/5 rounded" />
                    <div className="skeleton h-3 w-3/5 rounded" />
                  </div>
                )}
                {analysis && (
                  <div className="prose-invert text-body-12 leading-relaxed text-text-secondary whitespace-pre-wrap">
                    {analysis}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Right panel: trade + orderbook + stats ────────────────────── */}
          <motion.div className="flex w-72 flex-shrink-0 flex-col gap-2" variants={stagger}>
            {/* Quick Trade */}
            <motion.div
              variants={scaleIn}
              className="rounded-[12px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-9 items-center px-4 text-body-12 font-semibold text-text-primary"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                Quick Trade
              </div>
              <div className="px-3 py-3 space-y-3">
                {/* YES / NO side selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeSide("yes")}
                    className={`flex items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-body-14 font-bold transition-all duration-200 ${
                      tradeSide === "yes"
                        ? "bg-signal-green text-bg-base-0 shadow-[0_0_12px_rgba(0,255,133,0.3)]"
                        : "bg-bg-base-2 text-text-secondary hover:bg-bg-base-3 hover:text-text-primary"
                    }`}
                    style={tradeSide !== "yes" ? { boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" } : undefined}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Buy YES
                  </button>
                  <button
                    onClick={() => setTradeSide("no")}
                    className={`flex items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-body-14 font-bold transition-all duration-200 ${
                      tradeSide === "no"
                        ? "bg-signal-red text-white shadow-[0_0_12px_rgba(255,59,59,0.3)]"
                        : "bg-bg-base-2 text-text-secondary hover:bg-bg-base-3 hover:text-text-primary"
                    }`}
                    style={tradeSide !== "no" ? { boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" } : undefined}
                  >
                    <TrendingDown className="h-4 w-4" />
                    Buy NO
                  </button>
                </div>

                {/* Price display */}
                <div
                  className="flex items-center justify-between rounded-[8px] bg-bg-base-2 px-3 py-2"
                  style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                >
                  <span className="text-numbers-10 text-text-quaternary">
                    {tradeSide === "yes" ? "YES" : "NO"} Price
                  </span>
                  <span className={`font-data text-header-16 font-bold ${tradeSide === "yes" ? "text-signal-green" : "text-signal-red"}`}>
                    {Math.round(tradePrice * 100)}&cent;
                  </span>
                </div>

                {/* Amount input */}
                <div>
                  <label className="mb-1.5 block text-numbers-10 text-text-quaternary">Amount</label>
                  <div
                    className="flex items-center rounded-[8px] bg-bg-base-2 px-3"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                  >
                    <DollarSign className="h-4 w-4 text-text-quaternary" />
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="flex-1 bg-transparent py-2.5 pl-1 text-body-14 font-medium text-text-primary outline-none placeholder:text-text-quaternary"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTradeAmount(String(amt))}
                        className={`rounded-[6px] py-1.5 text-numbers-12 font-medium transition-all duration-150 ${
                          tradeAmount === String(amt)
                            ? tradeSide === "yes"
                              ? "bg-signal-green/15 text-signal-green"
                              : "bg-signal-red/15 text-signal-red"
                            : "bg-bg-base-2 text-text-secondary hover:bg-bg-base-3 hover:text-text-primary"
                        }`}
                        style={tradeAmount !== String(amt) ? { boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" } : undefined}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shares & profit breakdown */}
                {tradeAmountNum > 0 && (
                  <motion.div
                    className="space-y-1.5 rounded-[8px] bg-bg-base-2 px-3 py-2.5"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-numbers-10 text-text-quaternary">Shares</span>
                      <span className="text-numbers-12 font-medium text-text-primary">
                        {tradeShares.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-numbers-10 text-text-quaternary">Avg Price</span>
                      <span className="text-numbers-12 font-medium text-text-primary">
                        {Math.round(tradePrice * 100)}&cent;
                      </span>
                    </div>
                    <div className="h-px bg-divider-heavy" />
                    <div className="flex items-center justify-between">
                      <span className="text-numbers-10 text-text-quaternary">Potential Profit</span>
                      <span className={`text-numbers-12 font-bold ${tradeSide === "yes" ? "text-signal-green" : "text-signal-red"}`}>
                        +${tradePotentialProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-numbers-10 text-text-quaternary">Return</span>
                      <span className={`text-numbers-12 font-bold ${tradeSide === "yes" ? "text-signal-green" : "text-signal-red"}`}>
                        {tradePrice > 0 ? `+${(((1 - tradePrice) / tradePrice) * 100).toFixed(0)}%` : "--"}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Buy button */}
                <AnimatePresence mode="wait">
                  {tradePlaced ? (
                    <motion.div
                      key="placed"
                      className="flex items-center justify-center gap-2 rounded-[8px] bg-signal-green/15 py-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-signal-green" />
                      <span className="text-body-12 font-semibold text-signal-green">Order Placed</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="buy"
                      onClick={handlePlaceOrder}
                      disabled={tradeAmountNum <= 0 || tradePlacing}
                      className={`flex w-full items-center justify-center gap-2 rounded-[8px] py-3 text-body-14 font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                        tradeSide === "yes"
                          ? "bg-signal-green text-bg-base-0 hover:shadow-[0_0_16px_rgba(0,255,133,0.35)] active:scale-[0.98]"
                          : "bg-signal-red text-white hover:shadow-[0_0_16px_rgba(255,59,59,0.35)] active:scale-[0.98]"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={tradeAmountNum > 0 ? { scale: 1.02 } : undefined}
                      whileTap={tradeAmountNum > 0 ? { scale: 0.98 } : undefined}
                    >
                      {tradePlacing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {tradePlacing
                        ? "Placing Order..."
                        : `Buy ${tradeSide === "yes" ? "YES" : "NO"}${tradeAmountNum > 0 ? ` — $${tradeAmountNum.toFixed(2)}` : ""}`
                      }
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Trade on Polymarket link */}
                <a
                  href={`https://polymarket.com/event/${market.slug || market.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-[8px] bg-bg-base-2 py-2 text-numbers-12 font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base-3 hover:text-text-primary"
                  style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                >
                  <ExternalLink className="h-3 w-3" />
                  Trade on Polymarket
                </a>
              </div>
            </motion.div>

            {/* Order Book */}
            <motion.div
              variants={fadeUp}
              className="rounded-[12px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-9 items-center justify-between px-4"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <span className="text-body-12 font-semibold text-text-primary">Order Book</span>
                <span className="text-numbers-10 text-signal-amber">Spread {orderbookSpread}</span>
              </div>
              <div className="px-3 py-2">
                {/* Column headers */}
                <div className="mb-1 flex justify-between text-numbers-10 font-medium uppercase text-text-quaternary">
                  <span>Price</span>
                  <span>Size</span>
                </div>

                {orderbookLoading && orderbookBids.length === 0 ? (
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-5 w-full rounded" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Bids */}
                    <div className="space-y-0.5">
                      {orderbookBids.map((row, i) => (
                        <div
                          key={`bid-${row.price}-${i}`}
                          className="group/row relative flex items-center overflow-hidden rounded-[4px] py-1 transition-colors duration-150 hover:bg-signal-green/8"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-signal-green/8 transition-all duration-200 group-hover/row:bg-signal-green/15"
                            style={{ width: `${row.depth}%` }}
                          />
                          <span className="relative z-10 flex-1 text-numbers-12 font-medium text-signal-green">
                            {row.price}&cent;
                          </span>
                          <span className="relative z-10 text-numbers-10 text-text-secondary">
                            {row.size >= 1000 ? `${(row.size / 1000).toFixed(1)}K` : row.size}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="my-1 h-px bg-divider-heavy" />

                    {/* Asks */}
                    <div className="space-y-0.5">
                      {orderbookAsks.map((row, i) => (
                        <div
                          key={`ask-${row.price}-${i}`}
                          className="group/row relative flex items-center overflow-hidden rounded-[4px] py-1 transition-colors duration-150 hover:bg-signal-red/8"
                        >
                          <div
                            className="absolute inset-y-0 right-0 bg-signal-red/8 transition-all duration-200 group-hover/row:bg-signal-red/15"
                            style={{ width: `${row.depth}%` }}
                          />
                          <span className="relative z-10 flex-1 text-numbers-12 font-medium text-signal-red">
                            {row.price}&cent;
                          </span>
                          <span className="relative z-10 text-numbers-10 text-text-secondary">
                            {row.size >= 1000 ? `${(row.size / 1000).toFixed(1)}K` : row.size}
                          </span>
                        </div>
                      ))}
                    </div>

                    {orderbookBids.length === 0 && orderbookAsks.length === 0 && !orderbookLoading && (
                      <div className="py-4 text-center text-numbers-10 text-text-quaternary">
                        No orderbook data available
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Market Stats */}
            <motion.div
              variants={fadeUp}
              className="rounded-[12px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-9 items-center px-4 text-body-12 font-semibold text-text-primary"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                Market Stats
              </div>
              <div className="grid grid-cols-2 gap-px bg-divider-heavy p-px">
                {[
                  { label: "Total Volume", value: formatVolume(market.volume) },
                  { label: "24h Volume", value: formatVolume(market.volume24h) },
                  { label: "Liquidity", value: formatVolume(market.liquidity) },
                  { label: "Spread", value: orderbookSpread },
                  {
                    label: "24h Change",
                    value: chartStats ? `${chartStats.change >= 0 ? "+" : ""}${chartStats.change}%` : "--",
                    color: chartStats ? (chartStats.change >= 0 ? "text-signal-green" : "text-signal-red") : undefined,
                  },
                  { label: "Status", value: market.active ? "Active" : "Closed", color: market.active ? "text-signal-green" : "text-signal-red" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-bg-base-1 px-3 py-2">
                    <div className="text-numbers-10 text-text-quaternary">{stat.label}</div>
                    <div className={`text-numbers-12 font-medium ${stat.color || "text-text-primary"}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
