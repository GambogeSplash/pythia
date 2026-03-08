"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { useMarket, useOrderbook } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import type { PricePoint } from "@/lib/api/types";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Clock,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Droplets,
  Eye,
  ChevronRight,
  Target,
  Globe,
  Scale,
  DollarSign,
  ShoppingCart,
  Check,
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
  // Add 10% padding so the line doesn't touch edges
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
    const frac = 1 - i / (count - 1); // top to bottom
    const val = minP + frac * (maxP - minP);
    labels.push(`${Math.round(val * 100)}%`);
  }
  return labels;
}

// ─── Volume data (needs trade history API) ──────────────────────────────────
const volumeBars: { height: number; isGreen: boolean }[] = [];

// ─── Traders (needs wallet tracking) ────────────────────────────────────────
const topTraders: { id: string; name: string; side: "YES" | "NO"; size: string; pnl: string; score: number; avatar: string }[] = [];

// ─── News (needs news API) ──────────────────────────────────────────────────
const newsItems: { source: string; title: string; time: string; impact: string; sentiment: "bullish" | "bearish" | "neutral"; category: string }[] = [];

// ─── Keywords (needs keyword tracking) ──────────────────────────────────────
const trackedKeywords: { keyword: string; mentions: number; trend: "up" | "down" | "stable"; delta: string; nextEvent: string; sparkline: number[] }[] = [];

// ─── Cross-venue data (only Polymarket for now) ─────────────────────────────
const crossVenue: { venue: string; yes: number; no: number; vol: string; liquidity: string; best: boolean; change: string }[] = [];

// ─── Loading skeleton ──────────────────────────────────────────────────────
function MarketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Sub-header skeleton */}
      <div className="flex h-9 items-center px-3">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="ml-auto flex gap-4">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-5 w-20 rounded" />
        </div>
      </div>
      {/* Header card skeleton */}
      <div className="rounded-[18px] bg-bg-base-1 px-5 py-4" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
        <div className="flex items-center gap-5">
          <div className="skeleton h-12 w-12 rounded-[12px]" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-80 rounded" />
            <div className="flex gap-2">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          </div>
          <div className="skeleton h-20 w-24 rounded-[10px]" />
          <div className="flex gap-3">
            <div className="skeleton h-20 w-24 rounded-[10px]" />
            <div className="skeleton h-20 w-24 rounded-[10px]" />
          </div>
        </div>
      </div>
      {/* Chart skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <div className="rounded-[12px] bg-bg-base-1 p-4" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
            <div className="skeleton mb-3 h-4 w-24 rounded" />
            <div className="skeleton h-[200px] w-full rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-[12px] bg-bg-base-1 p-4" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
            <div className="skeleton mb-3 h-4 w-24 rounded" />
            <div className="space-y-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="skeleton h-6 w-full rounded" />
              ))}
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

  const [activeTimeframe, setActiveTimeframe] = useState(2); // 1d default
  const [activeView, setActiveView] = useState(0); // Probability default
  const [hoveredBid, setHoveredBid] = useState<number | null>(null);
  const [hoveredAsk, setHoveredAsk] = useState<number | null>(null);
  const [hoveredNews, setHoveredNews] = useState<number | null>(null);

  // ── Quick Trade state ─────────────────────────────────────────────────
  const [tradeSide, setTradeSide] = useState<"yes" | "no">("yes");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePlacing, setTradePlacing] = useState(false);
  const [tradePlaced, setTradePlaced] = useState(false);

  const timeframes = ["1hr", "6hr", "1d", "1w", "All"];
  const views = ["Probability", "Depth", "Sentiment", "Flow"];

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
    const rows = orderbook.bids.map((level) => {
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
    const rows = orderbook.asks.map((level) => {
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
    <motion.div
      className="flex flex-col gap-3"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Sub-header strip ─────────────────────────────────────────────── */}
      <motion.div
        variants={fadeIn}
        className="flex h-9 items-center px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-body-12 font-semibold tracking-wide text-text-primary">MARKET DETAIL</span>
          <span className="text-numbers-10 text-text-quaternary">ID: {id}</span>
          <div className="h-3 w-px bg-divider-heavy" />
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-signal-green" />
            <span className="text-numbers-10 text-signal-green">{market.active ? "LIVE" : "CLOSED"}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-numbers-10 text-text-quaternary">Pythia Score</span>
            <span className="flex h-5 items-center rounded-[4px] bg-signal-purple/12 px-1.5 text-numbers-12 font-bold text-signal-purple">72</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-numbers-10 text-text-quaternary">Settlement Risk</span>
            <Badge variant="green">Low Risk</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-numbers-10 text-text-quaternary">Confidence</span>
            <Badge variant="blue">High</Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Market Header Card ────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="group relative overflow-hidden rounded-[18px] bg-bg-base-1 px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-signal-green/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-center gap-5">
          {/* Icon / Image */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-bg-base-2"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            {market.image ? (
              <img src={market.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">&#x1F3E6;</span>
            )}
          </div>

          {/* Title block */}
          <div className="min-w-0 flex-1">
            <h1 className="text-body-14 font-semibold text-text-primary">
              {market.question}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <PriceDisplay yes={yesPercent} spread={spread} no={noPercent} />
              <Badge variant={market.active ? "green" : "neutral"}>{market.active ? "Active" : "Closed"}</Badge>
              <Badge variant="neutral">Binary</Badge>
              {market.category && <Badge variant="blue">{market.category}</Badge>}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-text-quaternary" />
                <span className="text-numbers-10 text-text-tertiary">Expires {endDateFormatted}</span>
              </div>
              <span className="text-numbers-10 font-semibold text-signal-amber">{timeLeft} left</span>
            </div>
          </div>

          {/* Pythia Score card */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
            className="flex flex-col items-center rounded-[10px] bg-signal-purple/8 px-4 py-2.5"
            style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-signal-purple) 30%, transparent)" }}
          >
            <span className="text-numbers-10 font-medium text-signal-purple">Pythia Score</span>
            <span className="font-data text-xl font-bold text-signal-purple">72</span>
            <span className="text-numbers-10 text-signal-purple/60">Slightly underpriced</span>
          </motion.div>

          {/* Stats cluster */}
          <div className="flex gap-3">
            <div className="rounded-[10px] bg-bg-base-2 px-3 py-2 text-center" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
              <div className="text-numbers-10 text-text-quaternary">Volume</div>
              <div className="font-data text-base font-semibold text-text-primary">{formatVolume(market.volume)}</div>
              <div className="flex items-center justify-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5 text-signal-green" />
                <span className="text-numbers-10 text-text-quaternary">24h: {formatVolume(market.volume24h)}</span>
              </div>
            </div>
            <div className="rounded-[10px] bg-bg-base-2 px-3 py-2 text-center" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
              <div className="text-numbers-10 text-text-quaternary">Liquidity</div>
              <div className="font-data text-base font-semibold text-text-primary">{formatVolume(market.liquidity)}</div>
              <div className="flex items-center justify-center gap-0.5">
                <Droplets className="h-2.5 w-2.5 text-signal-blue" />
                <span className="text-numbers-10 text-signal-blue">Pool</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description row */}
        {market.description && (
          <div className="relative mt-3 rounded-[8px] bg-bg-base-2 px-3 py-2 text-body-12 text-text-tertiary line-clamp-2" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
            {market.description}
          </div>
        )}
      </motion.div>

      {/* ── Main 3-column grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Left 2/3 */}
        <div className="col-span-2 flex flex-col gap-3">
          {/* ── Price Chart ─────────────────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Price Chart" liveIndicator>
              <div className="flex flex-col">
                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-divider-heavy px-3 py-1.5">
                  {timeframes.map((tf, i) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(i)}
                      className={`rounded-[6px] px-2.5 py-1 text-numbers-10 font-medium transition-all duration-200 ${
                        activeTimeframe === i
                          ? "bg-signal-green text-bg-base-0 shadow-[0_0_8px_rgba(0,255,133,0.25)]"
                          : "text-text-secondary hover:bg-bg-base-2 hover:text-text-primary"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-1">
                    {views.map((tab, i) => (
                      <button
                        key={tab}
                        onClick={() => setActiveView(i)}
                        className={`rounded-[6px] px-2 py-1 text-numbers-10 font-medium transition-all duration-200 ${
                          activeView === i
                            ? "bg-bg-base-2 text-signal-green"
                            : "text-text-tertiary hover:text-text-secondary"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart area */}
                <div className="relative px-3 py-3">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-3 flex h-[200px] flex-col justify-between py-1 pl-1">
                    {yLabels.map((label) => (
                      <span key={label} className="text-numbers-10 text-text-quaternary">{label}</span>
                    ))}
                  </div>

                  {/* Grid lines */}
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

                    {/* Gradient fill */}
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
                        {/* Area fill */}
                        <motion.path
                          d={areaPath}
                          fill="url(#chartGradient)"
                          clipPath="url(#chartClip)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1.2, delay: 0.3 }}
                        />

                        {/* Chart line with draw-in animation */}
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

                        {/* Current price dot */}
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

                {/* Volume bars */}
                <div className="border-t border-divider-heavy px-3 py-2">
                  {volumeBars.length > 0 ? (
                    <div className="flex h-14 items-end gap-px">
                      {volumeBars.map((bar, i) => (
                        <motion.div
                          key={i}
                          className={`flex-1 rounded-t transition-colors duration-150 ${
                            bar.isGreen
                              ? "bg-signal-green/30 hover:bg-signal-green/60"
                              : "bg-signal-red/25 hover:bg-signal-red/50"
                          }`}
                          style={{ height: `${bar.height}%` }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.02 * i, duration: 0.3 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <BarChart3 className="mb-2 h-5 w-5 text-text-muted" />
                      <p className="text-[11px] text-text-quaternary text-center">Volume data requires trade history API</p>
                    </div>
                  )}
                </div>

                {/* Chart stats footer */}
                <div className="flex items-center gap-4 border-t border-divider-heavy px-3 py-2">
                  {(chartStats ? [
                    { label: "Open", value: `${chartStats.openP}%`, color: "text-text-primary" },
                    { label: "High", value: `${chartStats.highP}%`, color: "text-signal-green" },
                    { label: "Low", value: `${chartStats.lowP}%`, color: "text-signal-red" },
                    { label: "Current", value: `${chartStats.currentP}%`, color: "text-signal-green" },
                    { label: "Change", value: `${chartStats.change >= 0 ? "+" : ""}${chartStats.change}%`, color: chartStats.change >= 0 ? "text-signal-green" : "text-signal-red" },
                    { label: "Vol", value: formatVolume(market.volume), color: "text-text-primary" },
                  ] : [
                    { label: "Open", value: "--", color: "text-text-primary" },
                    { label: "High", value: "--", color: "text-text-primary" },
                    { label: "Low", value: "--", color: "text-text-primary" },
                    { label: "Current", value: `${yesPercent}%`, color: "text-signal-green" },
                    { label: "Vol", value: formatVolume(market.volume), color: "text-text-primary" },
                  ]).map((stat) => (
                    <div key={stat.label} className="flex items-center gap-1.5">
                      <span className="text-numbers-10 text-text-quaternary">{stat.label}</span>
                      <span className={`text-numbers-12 font-medium ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Widget>
          </motion.div>

          {/* ── Crowd vs Expert Positioning ──────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Crowd vs Expert Positioning">
              <div className="px-3 py-3">
                <div className="grid grid-cols-2 gap-6">
                  {/* Crowd */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-signal-blue/10">
                        <Users className="h-4 w-4 text-signal-blue" />
                      </div>
                      <div>
                        <span className="text-body-12 font-semibold text-text-primary">Crowd Consensus</span>
                        <div className="text-numbers-10 text-text-quaternary">1,243 active traders</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex h-5 overflow-hidden rounded-full bg-bg-base-2">
                        <motion.div
                          className="flex items-center justify-center rounded-l-full bg-signal-green/80"
                          initial={{ width: 0 }}
                          animate={{ width: "62%" }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" as const }}
                        >
                          <span className="text-numbers-10 font-bold text-bg-base-0">62%</span>
                        </motion.div>
                        <motion.div
                          className="flex flex-1 items-center justify-center bg-signal-red/60"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        >
                          <span className="text-numbers-10 font-bold text-white/90">38%</span>
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-numbers-10">
                        <span className="text-signal-green">YES 62%</span>
                        <span className="text-signal-red">NO 38%</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-[6px] bg-bg-base-2 px-2 py-1.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                        <div className="text-numbers-10 text-text-quaternary">Avg Position</div>
                        <div className="text-numbers-12 font-medium text-text-primary">$340</div>
                      </div>
                      <div className="rounded-[6px] bg-bg-base-2 px-2 py-1.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                        <div className="text-numbers-10 text-text-quaternary">Avg Hold</div>
                        <div className="text-numbers-12 font-medium text-text-primary">3.2 days</div>
                      </div>
                    </div>
                  </div>

                  {/* Expert */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-signal-purple/10">
                        <Brain className="h-4 w-4 text-signal-purple" />
                      </div>
                      <div>
                        <span className="text-body-12 font-semibold text-text-primary">Expert View</span>
                        <div className="text-numbers-10 text-text-quaternary">PTS &gt; 80 traders</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex h-5 overflow-hidden rounded-full bg-bg-base-2">
                        <motion.div
                          className="flex items-center justify-center rounded-l-full bg-signal-green/80"
                          initial={{ width: 0 }}
                          animate={{ width: "78%" }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" as const }}
                        >
                          <span className="text-numbers-10 font-bold text-bg-base-0">78%</span>
                        </motion.div>
                        <motion.div
                          className="flex flex-1 items-center justify-center bg-signal-red/60"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.9 }}
                        >
                          <span className="text-numbers-10 font-bold text-white/90">22%</span>
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-numbers-10">
                        <span className="text-signal-green">YES 78%</span>
                        <span className="text-signal-red">NO 22%</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-[6px] bg-bg-base-2 px-2 py-1.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                        <div className="text-numbers-10 text-text-quaternary">Avg Position</div>
                        <div className="text-numbers-12 font-medium text-text-primary">$12.4K</div>
                      </div>
                      <div className="rounded-[6px] bg-bg-base-2 px-2 py-1.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                        <div className="text-numbers-10 text-text-quaternary">Avg Hold</div>
                        <div className="text-numbers-12 font-medium text-text-primary">8.1 days</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divergence alert */}
                <motion.div
                  className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-signal-amber/6 px-3 py-2.5"
                  style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-signal-amber) 25%, transparent)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-amber/15">
                    <Zap className="h-3 w-3 text-signal-amber" />
                  </div>
                  <div>
                    <div className="text-body-12 font-semibold text-signal-amber">Divergence Detected</div>
                    <span className="text-body-12 text-signal-amber/80">
                      Experts are 16% more bullish than the crowd. Historically, expert alignment predicts the correct outcome 73% of the time in similar markets.
                    </span>
                  </div>
                </motion.div>
              </div>
            </Widget>
          </motion.div>
        </div>

        {/* ── Right column 1/3 ──────────────────────────────────────────── */}
        <motion.div className="flex flex-col gap-3" variants={stagger}>
          {/* ── Quick Trade ────────────────────────────────────────────── */}
          <motion.div variants={scaleIn}>
            <Widget title="Quick Trade">
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
                        ? "bg-signal-red text-white shadow-[0_0_12px_rgba(255,160,158,0.3)]"
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
                  <span className={`font-data text-lg font-bold ${tradeSide === "yes" ? "text-signal-green" : "text-signal-red"}`}>
                    {Math.round(tradePrice * 100)}¢
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
                  {/* Quick-select amounts */}
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
                        {Math.round(tradePrice * 100)}¢
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
                          : "bg-signal-red text-white hover:shadow-[0_0_16px_rgba(255,160,158,0.35)] active:scale-[0.98]"
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
            </Widget>
          </motion.div>

          {/* ── Order Book ──────────────────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Order Book">
              <div className="px-3 py-2">
                {/* Header */}
                <div className="mb-2 flex justify-between text-numbers-10 font-medium uppercase text-text-quaternary">
                  <span>Size</span>
                  <span>Bid</span>
                  <span className="text-text-tertiary">Spread</span>
                  <span>Ask</span>
                  <span>Size</span>
                </div>

                {/* Spread indicator */}
                <div className="mb-2 flex items-center justify-center gap-2 rounded-[6px] bg-bg-base-2 py-1" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                  <span className="text-numbers-10 text-text-quaternary">Spread</span>
                  <span className="text-numbers-12 font-bold text-signal-amber">{orderbookSpread}</span>
                </div>

                {orderbookLoading && orderbookBids.length === 0 ? (
                  <div className="space-y-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="skeleton h-6 w-full rounded" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Bids */}
                    <div className="space-y-0.5">
                      {orderbookBids.map((row, i) => (
                        <motion.div
                          key={`bid-${row.price}-${i}`}
                          className="group/row relative flex cursor-pointer items-center overflow-hidden rounded-[4px] py-1 transition-colors duration-150 hover:bg-signal-green/8"
                          onMouseEnter={() => setHoveredBid(i)}
                          onMouseLeave={() => setHoveredBid(null)}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i + 0.2, duration: 0.3 }}
                        >
                          {/* Depth fill */}
                          <div
                            className="absolute inset-y-0 left-0 bg-signal-green/8 transition-all duration-200 group-hover/row:bg-signal-green/15"
                            style={{ width: `${row.depth}%` }}
                          />
                          <span className="relative z-10 w-16 text-right text-numbers-10 text-text-secondary">
                            {row.size >= 1000 ? `${(row.size / 1000).toFixed(1)}K` : row.size}
                          </span>
                          <span className="relative z-10 flex-1 text-center text-numbers-12 font-medium text-signal-green">
                            {row.price}%
                          </span>
                          {hoveredBid === i && (
                            <motion.span
                              className="absolute right-1 z-10 text-numbers-10 text-text-quaternary"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              ${row.total >= 1000 ? `${(row.total / 1000).toFixed(1)}K` : row.total} total
                            </motion.span>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="my-1 h-px bg-divider-heavy" />

                    {/* Asks */}
                    <div className="space-y-0.5">
                      {orderbookAsks.map((row, i) => (
                        <motion.div
                          key={`ask-${row.price}-${i}`}
                          className="group/row relative flex cursor-pointer items-center overflow-hidden rounded-[4px] py-1 transition-colors duration-150 hover:bg-signal-red/8"
                          onMouseEnter={() => setHoveredAsk(i)}
                          onMouseLeave={() => setHoveredAsk(null)}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i + 0.2, duration: 0.3 }}
                        >
                          {/* Depth fill */}
                          <div
                            className="absolute inset-y-0 right-0 bg-signal-red/8 transition-all duration-200 group-hover/row:bg-signal-red/15"
                            style={{ width: `${row.depth}%` }}
                          />
                          <span className="relative z-10 flex-1 text-center text-numbers-12 font-medium text-signal-red">
                            {row.price}%
                          </span>
                          <span className="relative z-10 w-16 text-left text-numbers-10 text-text-secondary">
                            {row.size >= 1000 ? `${(row.size / 1000).toFixed(1)}K` : row.size}
                          </span>
                          {hoveredAsk === i && (
                            <motion.span
                              className="absolute left-1 z-10 text-numbers-10 text-text-quaternary"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              ${row.total >= 1000 ? `${(row.total / 1000).toFixed(1)}K` : row.total} total
                            </motion.span>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {orderbookBids.length === 0 && orderbookAsks.length === 0 && !orderbookLoading && (
                      <div className="py-6 text-center text-numbers-10 text-text-quaternary">
                        No orderbook data available
                      </div>
                    )}
                  </>
                )}
              </div>
            </Widget>
          </motion.div>

          {/* ── Liquidity Health ─────────────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Liquidity Health">
              <div className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-signal-green" />
                    <span className="font-data text-xl font-bold text-signal-green">74</span>
                    <span className="text-numbers-10 text-text-tertiary">/ 100</span>
                  </div>
                  <Badge variant="green">Healthy</Badge>
                </div>

                {/* Animated progress bar */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-base-3">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-signal-green/60 to-signal-green"
                    initial={{ width: 0 }}
                    animate={{ width: "74%" }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" as const }}
                  />
                </div>

                <div className="mt-2 text-body-12 text-text-tertiary">
                  You can enter up to ~$50K without significant slippage
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: "Spread", value: orderbookSpread, icon: Target },
                    { label: "Depth +/-5%", value: "$124K", icon: BarChart3 },
                    { label: "Slippage 10K", value: "0.4%", icon: Activity },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      className="rounded-[6px] bg-bg-base-2 px-2 py-1.5 transition-transform duration-200 hover:-translate-y-0.5"
                      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-1">
                        <stat.icon className="h-2.5 w-2.5 text-text-quaternary" />
                        <span className="text-numbers-10 text-text-quaternary">{stat.label}</span>
                      </div>
                      <div className="text-numbers-12 font-medium text-text-primary">{stat.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Widget>
          </motion.div>

          {/* ── Top Traders ────────────────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Top Traders in Market">
              <div className="divide-y divide-divider-heavy">
                {topTraders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="mb-2 h-5 w-5 text-text-muted" />
                    <p className="text-[11px] text-text-quaternary text-center">Trader tracking coming soon</p>
                  </div>
                ) : topTraders.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.3, duration: 0.3 }}
                  >
                    <Link
                      href={`/dashboard/traders/${t.id}`}
                      className="group/trader flex items-center gap-2 px-3 py-2 transition-colors duration-150 hover:bg-bg-base-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-base-3 text-numbers-10 font-bold text-text-secondary">
                        {t.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-body-12 font-medium text-signal-green group-hover/trader:underline">
                            {t.name}
                          </span>
                          <ChevronRight className="h-3 w-3 text-text-quaternary opacity-0 transition-opacity group-hover/trader:opacity-100" />
                        </div>
                        <div className="text-numbers-10 text-text-quaternary">PTS {t.score}%</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-numbers-12 font-semibold ${t.side === "YES" ? "text-signal-green" : "text-signal-red"}`}>
                          {t.side}
                        </span>
                        <div className="text-numbers-10 text-text-secondary">{t.size}</div>
                      </div>
                      <span className={`text-numbers-10 ${t.pnl.startsWith("+") ? "text-signal-green" : "text-signal-red"}`}>
                        {t.pnl}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Widget>
          </motion.div>

          {/* ── Settlement & Resolution ──────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Settlement & Resolution">
              <div className="px-3 py-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-green/10">
                    <Shield className="h-3.5 w-3.5 text-signal-green" />
                  </div>
                  <span className="text-body-12 font-semibold text-text-primary">Low Risk</span>
                  <Badge variant="green">Verified</Badge>
                </div>

                <div className="space-y-1.5">
                  {[
                    { venue: "Polymarket", oracle: "UMA Optimistic Oracle", risk: "low" as const, icon: Globe },
                    { venue: "Kalshi", oracle: "CFTC Regulated Settlement", risk: "low" as const, icon: Scale },
                  ].map((s) => (
                    <div
                      key={s.venue}
                      className="flex items-center gap-2 rounded-[6px] bg-bg-base-2 px-2.5 py-2 transition-transform duration-200 hover:-translate-y-0.5"
                      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                    >
                      <s.icon className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="text-body-12 font-medium text-text-primary">{s.venue}</span>
                      <span className="ml-auto text-numbers-10 text-text-quaternary">{s.oracle}</span>
                      <div className={`h-2 w-2 rounded-full ${s.risk === "low" ? "bg-signal-green shadow-[0_0_4px_rgba(0,255,133,0.4)]" : "bg-signal-amber"}`} />
                    </div>
                  ))}
                </div>

                <div className="rounded-[6px] bg-bg-base-2 px-2.5 py-2 text-body-12 text-text-quaternary" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                  Both venues use consistent resolution criteria. Oracle mechanisms differ but settlement risk is minimal.
                </div>
              </div>
            </Widget>
          </motion.div>

          {/* ── Cross-Venue Comparison ──────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Widget title="Cross-Venue Comparison">
              {crossVenue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Globe className="mb-2 h-5 w-5 text-text-muted" />
                  <p className="text-[11px] text-text-quaternary text-center">Currently showing Polymarket only</p>
                </div>
              ) : (
                <div className="divide-y divide-divider-heavy">
                  {crossVenue.map((v, i) => (
                    <motion.div
                      key={v.venue}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-bg-base-2 ${
                        v.best ? "bg-signal-green/[0.03]" : ""
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i + 0.3, duration: 0.3 }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-body-12 font-medium ${v.best ? "text-signal-green" : "text-text-primary"}`}>
                            {v.venue}
                          </span>
                          {v.best && (
                            <span className="rounded-[3px] bg-signal-green/15 px-1 py-px text-numbers-10 font-bold text-signal-green shadow-[0_0_6px_rgba(0,255,133,0.15)]">
                              BEST
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <PriceDisplay yes={v.yes} spread={Math.abs(100 - v.yes - v.no)} no={v.no} />
                          <span className="text-numbers-10 text-signal-green">{v.change}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-numbers-12 text-text-secondary">{v.vol}</div>
                        <div className="text-numbers-10 text-text-quaternary">{v.liquidity} liq</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Widget>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* ── Related News ───────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Widget title="Related News">
            {newsItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="mb-2 h-5 w-5 text-text-muted" />
                <p className="text-[11px] text-text-quaternary text-center">News integration coming soon</p>
              </div>
            ) : (
            <div className="space-y-2 px-3 py-2">
              {newsItems.map((n, i) => (
                <motion.div
                  key={n.title}
                  className="group/news cursor-pointer rounded-[10px] bg-bg-base-2 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-bg-base-3"
                  style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.4, duration: 0.35 }}
                  whileHover={{ scale: 1.01 }}
                  onMouseEnter={() => setHoveredNews(i)}
                  onMouseLeave={() => setHoveredNews(null)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{n.source}</Badge>
                    <Badge variant="blue">{n.category}</Badge>
                    <span className="text-numbers-10 text-text-quaternary">{n.time} ago</span>
                    <div className="ml-auto flex items-center gap-1">
                      <span className={`text-numbers-12 font-semibold ${
                        parseFloat(n.impact) >= 0 ? "text-signal-green" : "text-signal-red"
                      }`}>
                        {parseFloat(n.impact) >= 0 ? "+" : ""}{n.impact}%
                      </span>
                      {parseFloat(n.impact) >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-signal-green" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-signal-red" />
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-body-12 text-text-secondary transition-colors group-hover/news:text-text-primary">
                    {n.title}
                  </p>
                  {/* Hover reveal */}
                  <AnimatePresence>
                    {hoveredNews === i && (
                      <motion.div
                        className="mt-2 flex items-center gap-1 text-numbers-10 text-signal-green"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-3 w-3" />
                        <span>View full analysis</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
            )}
          </Widget>
        </motion.div>

        {/* ── Mention Market Tracker ──────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Widget title="Mention Market Tracker">
            {trackedKeywords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Target className="mb-2 h-5 w-5 text-text-muted" />
                <p className="text-[11px] text-text-quaternary text-center">Keyword tracking coming soon</p>
              </div>
            ) : (
            <div className="px-3 py-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-signal-blue/10">
                  <MessageSquare className="h-3.5 w-3.5 text-signal-blue" />
                </div>
                <span className="text-body-12 text-text-secondary">Tracking keywords across speeches, press events, and filings</span>
              </div>

              <div className="space-y-2">
                {trackedKeywords.map((k, i) => (
                  <motion.div
                    key={k.keyword}
                    className="rounded-[10px] bg-bg-base-2 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-bg-base-3"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i + 0.4, duration: 0.35 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-body-14 font-semibold text-text-primary">&ldquo;{k.keyword}&rdquo;</span>
                      <div className="flex items-center gap-1">
                        <span className="text-numbers-12 font-medium text-text-secondary">{k.mentions}</span>
                        <span className="text-numbers-10 text-text-quaternary">mentions</span>
                      </div>
                      <span className={`text-numbers-10 font-semibold ${
                        k.trend === "up" ? "text-signal-green" : k.trend === "down" ? "text-signal-red" : "text-text-quaternary"
                      }`}>
                        {k.delta}
                      </span>
                      {k.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-signal-green" />
                      ) : k.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 text-signal-red" />
                      ) : (
                        <BarChart3 className="h-3 w-3 text-text-quaternary" />
                      )}

                      {/* Mini sparkline */}
                      <div className="ml-auto flex items-end gap-px">
                        {k.sparkline.map((val, si) => {
                          const max = Math.max(...k.sparkline);
                          const h = Math.max(3, (val / max) * 16);
                          return (
                            <motion.div
                              key={si}
                              className={`w-[3px] rounded-t ${
                                k.trend === "up" ? "bg-signal-green/50" : k.trend === "down" ? "bg-signal-red/40" : "bg-text-quaternary/30"
                              }`}
                              style={{ height: `${h}px` }}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.03 * si + 0.5 + 0.08 * i, duration: 0.2 }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-text-quaternary" />
                      <span className="text-numbers-10 text-text-quaternary">Next: {k.nextEvent}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            )}
          </Widget>
        </motion.div>
      </div>
    </motion.div>
  );
}
