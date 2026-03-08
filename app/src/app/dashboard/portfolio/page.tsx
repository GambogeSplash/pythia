"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Activity,
  Shield,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Filter,
  ExternalLink,
  X,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePositions, useTrades } from "@/hooks/use-user-data";
import { formatVolume } from "@/lib/format";


// ── Venue breakdown, PnL chart, and sparklines are
//    derived from real API data or shown as empty states ──────────────

// ── Exposure donut colors ────────────────────────────────────────────
const EXPOSURE_COLORS = [
  "var(--color-signal-green)",
  "rgba(0, 255, 133, 0.6)",
  "rgba(0, 255, 133, 0.35)",
  "rgba(0, 255, 133, 0.15)",
];
const EXPOSURE_BG_CLASSES = ["bg-signal-green", "bg-signal-green/60", "bg-signal-green/35", "bg-signal-green/15"];

// ── Sorting ──────────────────────────────────────────────────────────
type SortKey = "pnl" | "size" | "expiry" | null;
type SortDir = "asc" | "desc";

function parseValue(v: string): number {
  const cleaned = v.replace(/[^0-9.\-+]/g, "").replace("K", "");
  return parseFloat(cleaned) || 0;
}

// ── Stagger animation variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 35 },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
};

// ── Mini Sparkline Component ─────────────────────────────────────────
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 48;
  const h = 20;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--color-signal-green)" : "var(--color-signal-red)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Progress Ring Component ──────────────────────────────────────────
function ProgressRing({ pct, size = 48, stroke = 4 }: { pct: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="flex-shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-bg-base-3)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-signal-green)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      />
    </svg>
  );
}

// ── Donut Chart Component ────────────────────────────────────────────
function DonutChart({ segments }: { segments: { category: string; pct: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const size = 120;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const segLen = (seg.pct / 100) * circumference;
          const gap = 3;
          const dashLen = Math.max(segLen - gap, 1);
          const dashOffset = circumference - cumulativeOffset;
          cumulativeOffset += segLen;

          return (
            <motion.circle
              key={seg.category}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={EXPOSURE_COLORS[i]}
              strokeWidth={hovered === i ? stroke + 4 : stroke}
              strokeLinecap="butt"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: hovered === i ? "brightness(1.3)" : "none" }}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-numbers-10 text-text-quaternary">EXPOSURE</span>
        <span className="text-numbers-12 font-semibold text-text-primary">
          {hovered !== null ? `${segments[hovered].pct}%` : "100%"}
        </span>
        {hovered !== null && (
          <span className="text-body-12 text-text-secondary">{segments[hovered].category}</span>
        )}
      </div>
    </div>
  );
}

// ── PnL Equity Curve ─────────────────────────────────────────────────
function PnLChart({ data }: { data: number[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartW = 600;
  const chartH = 160;
  const padTop = 10;
  const padBottom = 20;
  const innerH = chartH - padTop - padBottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const getX = (i: number) => (i / (data.length - 1)) * chartW;
  const getY = (v: number) => padTop + innerH - ((v - min) / range) * innerH;

  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(v)}`).join(" ");
  const areaPath = `${linePath} L${getX(data.length - 1)},${chartH - padBottom} L0,${chartH - padBottom} Z`;

  // Grid labels
  const gridValues = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="h-44 w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-signal-green)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-signal-green)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x="0" y="0" width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {gridValues.map((val, i) => (
          <line
            key={i}
            x1={0}
            y1={getY(val)}
            x2={chartW}
            y2={getY(val)}
            stroke="var(--color-divider-heavy)"
            strokeWidth={0.5}
            strokeDasharray={i === 0 || i === gridValues.length - 1 ? "none" : "4 4"}
          />
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#pnlGradient)"
          clipPath="url(#chartClip)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-signal-green)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Hover hit areas */}
        {data.map((v, i) => (
          <rect
            key={i}
            x={getX(i) - chartW / data.length / 2}
            y={0}
            width={chartW / data.length}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            className="cursor-crosshair"
          />
        ))}

        {/* Hover crosshair */}
        {hoveredIdx !== null && (
          <>
            <line
              x1={getX(hoveredIdx)}
              y1={padTop}
              x2={getX(hoveredIdx)}
              y2={chartH - padBottom}
              stroke="var(--color-signal-green)"
              strokeWidth={0.5}
              strokeDasharray="4 2"
              opacity={0.5}
            />
            <circle
              cx={getX(hoveredIdx)}
              cy={getY(data[hoveredIdx])}
              r={4}
              fill="var(--color-signal-green)"
              stroke="var(--color-bg-base-1)"
              strokeWidth={2}
            />
          </>
        )}

        {/* End dot */}
        <motion.circle
          cx={getX(data.length - 1)}
          cy={getY(data[data.length - 1])}
          r={3.5}
          fill="var(--color-signal-green)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 500 }}
        />
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute top-2 rounded-[6px] bg-bg-base-3 px-2.5 py-1.5"
            style={{
              left: `${(hoveredIdx / (data.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
              boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="text-numbers-10 text-text-quaternary">PnL</div>
            <div className={`text-numbers-12 font-semibold ${data[hoveredIdx] >= 0 ? "text-action-rise" : "text-action-fall"}`}>
              {data[hoveredIdx] >= 0 ? "+" : ""}${data[hoveredIdx].toLocaleString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Y-axis labels */}
      <div className="pointer-events-none absolute inset-y-0 right-1 flex flex-col justify-between py-2">
        {[...gridValues].reverse().map((val, i) => (
          <span key={i} className="text-numbers-10 text-text-quaternary">
            ${Math.round(val / 1000 * 10) / 10}K
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Stat Sparkline (for Total Value card) ────────────────────────────
function StatSparkline() {
  const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="flex-shrink-0 opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-signal-green)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════
export default function PortfolioPage() {
  const { positions: apiPositions, isLoading: positionsLoading, isAuthenticated } = usePositions();
  const { trades: apiTrades, isLoading: tradesLoading } = useTrades(100);

  const [tab, setTab] = useState<"positions" | "history">("positions");
  const [filter, setFilter] = useState<"all" | "winning" | "losing">("all");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>("3M");

  // Map API positions to local format
  interface LocalPosition {
    id: string;
    market: string;
    marketIcon: string;
    side: "YES" | "NO";
    size: string;
    avgEntry: number;
    currentPrice: number;
    pnl: string;
    pnlPct: number;
    pnlPositive: boolean;
    venue: string;
    expiry: string;
  }

  const portfolioPositions: LocalPosition[] = useMemo(() => {
    return apiPositions.map((p) => ({
      id: p.id,
      market: p.marketQuestion,
      marketIcon: "",
      side: (p.side === "YES" || p.side === "NO" ? p.side : "YES") as "YES" | "NO",
      size: formatVolume(p.marketValue),
      avgEntry: Math.round(p.avgPrice * 100),
      currentPrice: Math.round(p.currentPrice * 100),
      pnl: `${p.pnl >= 0 ? "+" : ""}${formatVolume(Math.abs(p.pnl))}`,
      pnlPct: p.pnlPercent,
      pnlPositive: p.pnl >= 0,
      venue: p.venue,
      expiry: "",
    }));
  }, [apiPositions]);

  // Compute portfolio summary from positions
  const portfolioSummary = useMemo(() => {
    const totalValue = apiPositions.reduce((s, p) => s + p.marketValue, 0);
    const totalPnlNum = apiPositions.reduce((s, p) => s + p.pnl, 0);
    const totalCost = apiPositions.reduce((s, p) => s + p.costBasis, 0);
    const totalPnlPct = totalCost > 0 ? (totalPnlNum / totalCost) * 100 : 0;
    const venues = new Set(apiPositions.map((p) => p.venue));

    // Group by category for exposure
    const catTotals: Record<string, number> = {};
    for (const p of apiPositions) {
      const cat = p.category || "Other";
      catTotals[cat] = (catTotals[cat] || 0) + p.marketValue;
    }
    const exposure = Object.entries(catTotals)
      .map(([category, val]) => ({ category, pct: totalValue > 0 ? Math.round((val / totalValue) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);

    return {
      totalValue: formatVolume(totalValue),
      totalPnl: `${totalPnlNum >= 0 ? "+" : ""}${formatVolume(Math.abs(totalPnlNum))}`,
      totalPnlPct: Math.round(totalPnlPct * 10) / 10,
      pnlPositive: totalPnlNum >= 0,
      positions: apiPositions.length,
      venues: venues.size,
      exposure,
    };
  }, [apiPositions]);

  // Map API trades to trade history format
  const TRADE_HISTORY = useMemo(() => {
    return apiTrades.map((t) => {
      const d = new Date(t.executedAt);
      const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
      return {
        id: t.id,
        market: t.marketQuestion,
        side: (t.side === "YES" || t.side === "NO" ? t.side : "YES") as "YES" | "NO",
        action: t.action,
        amount: formatVolume(t.amount),
        price: `${Math.round(t.price * 100)}¢`,
        date: `${month} ${d.getDate()}`,
        pnl: t.pnl !== null ? `${t.pnl >= 0 ? "+" : ""}${formatVolume(Math.abs(t.pnl))}` : "--",
        pnlPositive: (t.pnl ?? 0) >= 0,
        venue: t.venue,
        time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      };
    });
  }, [apiTrades]);

  // ── Filtering ──────────────────────────────────────────────────────
  const filteredPositions = useMemo(() => {
    let items = portfolioPositions.filter((p) => {
      if (filter === "winning") return p.pnlPositive;
      if (filter === "losing") return !p.pnlPositive;
      return true;
    });

    if (sortKey) {
      items = [...items].sort((a, b) => {
        let aVal: number, bVal: number;
        if (sortKey === "pnl") {
          aVal = a.pnlPct;
          bVal = b.pnlPct;
        } else if (sortKey === "size") {
          aVal = parseValue(a.size);
          bVal = parseValue(b.size);
        } else {
          // expiry — rough sort by string
          aVal = a.expiry.localeCompare(b.expiry) as unknown as number;
          bVal = 0;
          return sortDir === "asc" ? a.expiry.localeCompare(b.expiry) : b.expiry.localeCompare(a.expiry);
        }
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return items;
  }, [portfolioPositions, filter, sortKey, sortDir]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  const toggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const chartData: number[] = [];

  const winCount = portfolioPositions.filter((p) => p.pnlPositive).length;
  const loseCount = portfolioPositions.filter((p) => !p.pnlPositive).length;
  const totalTrades = winCount + loseCount;
  const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;

  // ── Empty state when no positions ──
  if (!positionsLoading && portfolioPositions.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <Wallet className="mb-4 h-12 w-12 text-text-muted" />
        <h2 className="mb-2 text-body-14 font-semibold text-text-primary">No positions yet</h2>
        <p className="mb-6 max-w-sm text-center text-body-12 text-text-quaternary">
          Start trading to build your portfolio. Your positions, PnL, and trade history will appear here.
        </p>
        <Link
          href="/dashboard/trade"
          className="flex h-8 items-center gap-1.5 rounded-[8px] bg-signal-green px-4 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover"
        >
          <TrendingUp className="h-3.5 w-3.5" /> Start Trading
        </Link>
      </motion.div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Sub-header ──────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex h-8 items-center px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-signal-green/12 text-signal-green">
            <Wallet className="h-3 w-3" />
          </div>
          <span className="text-body-12 font-semibold text-text-primary">PORTFOLIO</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-numbers-10 text-text-quaternary">Last updated: just now</span>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex h-5 items-center gap-1 rounded-[4px] bg-action-translucent px-2 text-body-12 font-medium text-text-secondary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
          >
            <ExternalLink className="h-3 w-3" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total Value */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-[18px] bg-bg-base-1 px-4 py-3.5"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">
              <DollarSign className="h-3 w-3" /> Total Value
            </div>
            <StatSparkline />
          </div>
          <div className="mt-2 text-numbers-12 text-xl font-bold text-text-primary">{portfolioSummary.totalValue}</div>
          <div className="mt-1 text-body-12 text-text-tertiary">
            Across {portfolioSummary.venues} venues
          </div>
          {/* Glow on hover */}
          <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-signal-green/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>

        {/* Total PnL */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-[18px] bg-bg-base-1 px-4 py-3.5"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div className="flex items-center gap-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">
            <TrendingUp className="h-3 w-3" /> Total PnL
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-numbers-12 text-xl font-bold ${
                portfolioSummary.pnlPositive ? "text-action-rise" : "text-action-fall"
              }`}
            >
              {portfolioSummary.totalPnl}
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 500 }}
              className={`flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-semibold ${
                portfolioSummary.pnlPositive
                  ? "bg-action-rise/12 text-action-rise"
                  : "bg-action-fall/12 text-action-fall"
              }`}
            >
              {portfolioSummary.pnlPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {portfolioSummary.totalPnlPct}%
            </motion.span>
          </div>
          <div className="mt-1 text-body-12 text-text-tertiary">All time</div>
          <div
            className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
              portfolioSummary.pnlPositive ? "bg-signal-green/5" : "bg-signal-red/5"
            }`}
          />
        </motion.div>

        {/* Win Rate */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-[18px] bg-bg-base-1 px-4 py-3.5"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">
                <Activity className="h-3 w-3" /> Win Rate
              </div>
              <div className="mt-2 text-numbers-12 text-xl font-bold text-text-primary">{winRate}%</div>
              <div className="mt-1 text-body-12 text-text-tertiary">
                {winCount}W / {loseCount}L across {totalTrades} trades
              </div>
            </div>
            <ProgressRing pct={winRate} size={52} stroke={5} />
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-signal-green/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>

        {/* Open Positions */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-[18px] bg-bg-base-1 px-4 py-3.5"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div className="flex items-center gap-1.5 text-numbers-10 font-medium uppercase text-text-quaternary">
            <BarChart3 className="h-3 w-3" /> Open Positions
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-numbers-12 text-xl font-bold text-text-primary">
              {portfolioSummary.positions}
            </span>
            {portfolioSummary.positions > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-0.5 text-numbers-10 text-text-quaternary"
            >
              active
            </motion.div>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-body-12">
            <span className="text-action-rise">{winCount}W</span>
            <span className="text-text-quaternary">/</span>
            <span className="text-action-fall">{loseCount}L</span>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-signal-green/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>
      </div>

      {/* ── PnL Chart + Right Column ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* PnL Equity Curve — 2/3 width */}
        <motion.div
          variants={itemVariants}
          className="rounded-[18px] bg-bg-base-1 p-4 lg:col-span-2"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-14 font-semibold text-text-primary">Cumulative PnL</span>
              <span
                className={`text-numbers-10 font-medium ${
                  portfolioSummary.pnlPositive ? "text-action-rise" : "text-action-fall"
                }`}
              >
                {portfolioSummary.totalPnl} ({portfolioSummary.totalPnlPct}%)
              </span>
            </div>
            <div className="flex items-center gap-0.5 rounded-[6px] bg-bg-base-2 p-0.5">
              {["1W", "1M", "3M", "ALL"].map((tf) => (
                <motion.button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-[4px] px-2.5 py-1 text-numbers-10 font-medium transition-colors ${
                    timeframe === tf
                      ? "text-bg-base-0"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {timeframe === tf && (
                    <motion.div
                      layoutId="tf-pill"
                      className="absolute inset-0 rounded-[4px] bg-signal-green"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tf}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <PnLChart data={chartData} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="mb-2 h-6 w-6 text-text-muted" />
              <p className="text-body-12 text-text-quaternary">Trade history will generate PnL charts</p>
            </div>
          )}
        </motion.div>

        {/* Right column — 1/3 width */}
        <div className="flex flex-col gap-3">
          {/* Exposure Donut */}
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] bg-bg-base-1 p-4"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="mb-3 flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-text-tertiary" />
              <span className="text-body-12 font-semibold text-text-primary">Exposure</span>
            </div>
            <div className="flex justify-center py-2">
              <DonutChart segments={portfolioSummary.exposure} />
            </div>
            <div className="mt-3 space-y-2">
              {portfolioSummary.exposure.map((seg, i) => (
                <motion.div
                  key={seg.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5 text-body-12 text-text-secondary">
                    <span className={`inline-block h-2.5 w-2.5 rounded-[3px] ${EXPOSURE_BG_CLASSES[i]}`} />
                    {seg.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-bg-base-3">
                      <motion.div
                        className={EXPOSURE_BG_CLASSES[i]}
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        style={{ height: "100%" }}
                      />
                    </div>
                    <span className="text-numbers-12 font-medium text-text-primary">{seg.pct}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Venue Breakdown */}
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] bg-bg-base-1 p-4"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="mb-3 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-text-tertiary" />
              <span className="text-body-12 font-semibold text-text-primary">By Venue</span>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <Shield className="mb-2 h-5 w-5 text-text-muted" />
              <p className="text-[11px] text-text-quaternary text-center">Open positions to see venue breakdown</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Positions / History Table ───────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-[18px] bg-bg-base-1"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
      >
        {/* Tab header */}
        <div
          className="flex h-11 items-center justify-between px-4"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          <div className="flex items-center gap-1">
            {(["positions", "history"] as const).map((t) => (
              <motion.button
                key={t}
                onClick={() => setTab(t)}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-[6px] px-3 py-1.5 text-body-12 font-semibold transition-colors ${
                  tab === t ? "text-text-primary" : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-[6px] bg-bg-base-3"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {t === "positions" ? "Open Positions" : "Trade History"}
                </span>
              </motion.button>
            ))}
          </div>
          {tab === "positions" && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1"
            >
              {(["all", "winning", "losing"] as const).map((f) => (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-[4px] px-2.5 py-0.5 text-numbers-10 font-medium capitalize transition-colors ${
                    filter === f
                      ? "text-bg-base-0"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-[4px] bg-signal-green"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{f}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {tab === "positions" ? (
            <motion.div
              key="positions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <div className="min-w-[640px]">
              {/* Positions header */}
              <div
                className="grid grid-cols-[1fr_48px_48px_72px_56px_56px_80px_72px_56px] items-center gap-1 px-4 py-2"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Market</span>
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Side</span>
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Trend</span>
                <button
                  onClick={() => handleSort("size")}
                  className="flex items-center gap-0.5 text-numbers-10 font-medium uppercase text-text-quaternary transition-colors hover:text-text-secondary"
                >
                  Size
                  {sortKey === "size" && (
                    sortDir === "desc" ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />
                  )}
                </button>
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Entry</span>
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Now</span>
                <button
                  onClick={() => handleSort("pnl")}
                  className="flex items-center gap-0.5 text-numbers-10 font-medium uppercase text-text-quaternary transition-colors hover:text-text-secondary"
                >
                  PnL
                  {sortKey === "pnl" && (
                    sortDir === "desc" ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />
                  )}
                </button>
                <span className="text-numbers-10 font-medium uppercase text-text-quaternary">Venue</span>
                <button
                  onClick={() => handleSort("expiry")}
                  className="flex items-center gap-0.5 text-numbers-10 font-medium uppercase text-text-quaternary transition-colors hover:text-text-secondary"
                >
                  Expiry
                  {sortKey === "expiry" && (
                    sortDir === "desc" ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />
                  )}
                </button>
              </div>

              {/* Position rows */}
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {filteredPositions.map((pos) => (
                    <motion.div key={pos.id} variants={rowVariants} layout>
                      {/* Main row */}
                      <div
                        onClick={() => toggleRow(pos.id)}
                        className="grid cursor-pointer grid-cols-[1fr_48px_48px_72px_56px_56px_80px_72px_56px] items-center gap-1 px-4 py-2.5 transition-colors duration-150 hover:bg-bg-base-2/50"
                        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="text-sm">{pos.marketIcon}</span>
                          <Link
                            href={`/dashboard/markets/${pos.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="truncate text-body-12 text-text-primary transition-colors hover:text-signal-green"
                          >
                            {pos.market}
                          </Link>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-semibold ${
                            pos.side === "YES"
                              ? "bg-action-buy/12 text-action-buy"
                              : "bg-action-sell/12 text-action-sell"
                          }`}
                        >
                          {pos.side}
                        </span>
                        <MiniSparkline
                          data={[50, 50]}
                          positive={pos.pnlPositive}
                        />
                        <span className="text-numbers-12 text-text-primary">{pos.size}</span>
                        <span className="text-numbers-12 text-text-secondary">{pos.avgEntry}¢</span>
                        <span className="text-numbers-12 text-text-primary">{pos.currentPrice}¢</span>
                        <div>
                          <span
                            className={`text-numbers-12 font-medium ${
                              pos.pnlPositive ? "text-action-rise" : "text-action-fall"
                            }`}
                          >
                            {pos.pnl}
                          </span>
                          <span
                            className={`ml-1 text-numbers-10 ${
                              pos.pnlPositive ? "text-action-rise/70" : "text-action-fall/70"
                            }`}
                          >
                            {pos.pnlPositive ? "+" : ""}
                            {pos.pnlPct}%
                          </span>
                        </div>
                        <span className="text-numbers-10 text-text-secondary">{pos.venue}</span>
                        <span className="text-numbers-10 text-text-quaternary">{pos.expiry}</span>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedRow === pos.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div
                              className="grid grid-cols-4 gap-4 bg-bg-base-2/50 px-6 py-4"
                              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                            >
                              <div>
                                <div className="text-numbers-10 uppercase text-text-quaternary">Entry Date</div>
                                <div className="mt-1 text-body-12 text-text-primary">Feb 14, 2026</div>
                              </div>
                              <div>
                                <div className="text-numbers-10 uppercase text-text-quaternary">Avg Cost Basis</div>
                                <div className="mt-1 text-numbers-12 text-text-primary">{pos.avgEntry}¢ / share</div>
                              </div>
                              <div>
                                <div className="text-numbers-10 uppercase text-text-quaternary">Current Value</div>
                                <div className="mt-1 text-numbers-12 text-text-primary">{pos.size}</div>
                              </div>
                              <div className="flex items-end gap-2">
                                <Link
                                  href={`/dashboard/markets/${pos.id}`}
                                  className="flex h-7 items-center gap-1 rounded-[6px] bg-bg-base-3 px-3 text-body-12 font-medium text-text-secondary transition-colors hover:bg-bg-base-3/80 hover:text-text-primary"
                                >
                                  <ExternalLink className="h-3 w-3" /> View Market
                                </Link>
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  className="flex h-7 items-center gap-1 rounded-[6px] bg-signal-red/12 px-3 text-body-12 font-medium text-signal-red transition-colors hover:bg-signal-red/20"
                                >
                                  <X className="h-3 w-3" /> Close Position
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Positions footer */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-numbers-10 text-text-quaternary">
                  Showing {filteredPositions.length} of {portfolioPositions.length} position{portfolioPositions.length !== 1 ? "s" : ""}
                </span>
                <span className="text-numbers-10 text-text-quaternary">
                  Total exposure: {portfolioSummary.totalValue}
                </span>
              </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <div className="min-w-[640px]">
              {/* History header */}
              <div
                className="grid grid-cols-[1fr_48px_56px_72px_56px_56px_80px_72px] items-center gap-1 px-4 py-2"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                {["Market", "Side", "Action", "Amount", "Price", "Date", "PnL", "Venue"].map(
                  (h) => (
                    <span
                      key={h}
                      className="text-numbers-10 font-medium uppercase text-text-quaternary"
                    >
                      {h}
                    </span>
                  )
                )}
              </div>

              {/* History rows */}
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {TRADE_HISTORY.map((t) => (
                  <motion.div
                    key={t.id}
                    variants={rowVariants}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    className="grid grid-cols-[1fr_48px_56px_72px_56px_56px_80px_72px] items-center gap-1 px-4 py-2.5 transition-colors duration-150"
                    style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                  >
                    <span className="truncate text-body-12 text-text-primary">{t.market}</span>
                    <span
                      className={`inline-flex w-fit items-center rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-semibold ${
                        t.side === "YES"
                          ? "bg-action-buy/12 text-action-buy"
                          : "bg-action-sell/12 text-action-sell"
                      }`}
                    >
                      {t.side}
                    </span>
                    <span
                      className={`text-body-12 font-medium ${
                        t.action === "Buy" ? "text-action-buy" : "text-action-sell"
                      }`}
                    >
                      {t.action}
                    </span>
                    <span className="text-numbers-12 text-text-primary">{t.amount}</span>
                    <span className="text-numbers-12 text-text-secondary">{t.price}</span>
                    <div>
                      <div className="text-numbers-10 text-text-quaternary">{t.date}</div>
                      <div className="text-numbers-10 text-text-quaternary/60">{t.time}</div>
                    </div>
                    <span
                      className={`text-numbers-12 font-medium ${
                        t.pnlPositive ? "text-action-rise" : "text-action-fall"
                      }`}
                    >
                      {t.pnl}
                    </span>
                    <span
                      className={`inline-flex w-fit items-center rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-medium ${
                        t.venue === "Polymarket"
                          ? "bg-signal-green/8 text-signal-green"
                          : "bg-signal-blue/8 text-signal-blue"
                      }`}
                    >
                      {t.venue}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* History footer */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-numbers-10 text-text-quaternary">
                  Showing {TRADE_HISTORY.length} recent trades
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1 rounded-[6px] bg-bg-base-3 px-3 py-1 text-body-12 font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  View All History
                  <ArrowUpRight className="h-3 w-3" />
                </motion.button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
