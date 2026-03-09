"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, TrendingUp, DollarSign, Shield, Globe,
  Copy, Check, Lock, Unlock, Info,
  ArrowUpRight, Award,
  Flame, Target, Activity, Server, Key, Wifi,
  Gift, CircleDot
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const tabContent = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/* ------------------------------------------------------------------ */
/*  DATA — empty until real API integration                           */
/* ------------------------------------------------------------------ */

const POOLS: {
  id: string; name: string; category: string; icon: React.ReactNode;
  color: string; apy: number; tvl: number; yourDeposit: number;
  risk: "Conservative" | "Moderate" | "Aggressive"; activeMarkets: number;
  spreadRange: string; description: string; curve: string;
}[] = [];

const RISK_CONFIG = {
  Conservative: { color: "text-action-rise", bg: "bg-action-rise-dim", dot: "var(--color-signal-green)" },
  Moderate: { color: "text-signal-amber", bg: "bg-signal-amber-dim", dot: "var(--color-signal-amber)" },
  Aggressive: { color: "text-action-fall", bg: "bg-action-fall-dim", dot: "var(--color-action-fall)" },
};

const SCANNER_CATEGORIES = ["All", "Politics", "Macro", "Crypto", "Sports"];

const SCANNER_MARKETS: {
  id: string; name: string; category: string; spread: number;
  liquidityScore: number; volume24h: number; estApy: number; risk: string;
}[] = [];

const MY_POSITIONS: {
  id: string; pool: string; market: string; deployed: number;
  currentValue: number; earnedYield: number; apy: number;
  status: "active" | "settling"; duration: string;
}[] = [];

const REWARD_TIERS: {
  level: string; minPoints: number; perks: string; color: string;
}[] = [];

const LEADERBOARD: {
  rank: number; name: string; id: string; points: number; apyEarned: number; tvl: number;
}[] = [];

const API_ENDPOINTS = [
  {
    method: "GET", path: "/api/v1/pools", description: "List all available liquidity pools with current stats",
    example: `{
  "pools": [
    {
      "id": "politics",
      "name": "Politics Pool",
      "apy": 18.4,
      "tvl": 2420000,
      "risk": "Moderate",
      "active_markets": 34,
      "spread_range": "2-5 bps"
    }
  ]
}`,
  },
  {
    method: "POST", path: "/api/v1/deposit", description: "Deposit capital into a specific pool",
    example: `{
  "pool_id": "politics",
  "amount": 5000,
  "currency": "USDC",
  "tx_hash": "0xabc...def",
  "status": "confirmed",
  "shares_received": 4987.5
}`,
  },
  {
    method: "GET", path: "/api/v1/positions", description: "Retrieve your active LP positions and earned yield",
    example: `{
  "positions": [
    {
      "pool_id": "politics",
      "deployed": 4200,
      "current_value": 4486,
      "earned_yield": 286,
      "apy": 18.4,
      "status": "active"
    }
  ],
  "total_value": 17650
}`,
  },
  {
    method: "POST", path: "/api/v1/withdraw", description: "Withdraw capital from a pool (instant or queued)",
    example: `{
  "pool_id": "politics",
  "amount": 2000,
  "status": "queued",
  "estimated_settlement": "2026-03-08T12:00:00Z",
  "exit_fee": 0.1
}`,
  },
  {
    method: "WS", path: "wss://api.pythia.io/mm/stream", description: "Live spread updates, inventory levels, and fill notifications",
    example: `{
  "type": "spread_update",
  "pool_id": "politics",
  "market_id": "trump-2028-iowa",
  "bid": 0.42,
  "ask": 0.46,
  "spread_bps": 4.0,
  "inventory_imbalance": 0.12,
  "timestamp": 1741363200
}`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-action-rise-dim text-action-rise",
  POST: "bg-signal-blue/15 text-signal-blue",
  WS: "bg-chart-purple/15 text-chart-purple",
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const panelStyle = { boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" };
const rowDivider = { boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" };
const heavyDivider = { boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" };

/* ------------------------------------------------------------------ */
/*  ANIMATED PROGRESS BAR                                             */
/* ------------------------------------------------------------------ */

function AnimatedBar({ widthPct, color }: { widthPct: string; color: string }) {
  return (
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: widthPct }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.2 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ANIMATED EQUITY CURVE                                             */
/* ------------------------------------------------------------------ */

function AnimatedEquityCurve({ curve, color, poolId }: { curve: string; color: string; poolId: string }) {
  return (
    <svg viewBox="0 0 200 50" className="mb-3 h-10 w-full">
      <defs>
        <linearGradient id={`grad-${poolId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={curve}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />
      <polyline
        points={`${curve} 200,50 0,50`}
        fill={`url(#grad-${poolId})`}
        stroke="none"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  TABS                                                              */
/* ------------------------------------------------------------------ */

type Tab = "pools" | "scanner" | "positions" | "rewards" | "api";

const TABS: { id: Tab; label: string }[] = [
  { id: "pools", label: "MM Pools" },
  { id: "scanner", label: "Opportunity Scanner" },
  { id: "positions", label: "My Positions" },
  { id: "rewards", label: "Rewards" },
  { id: "api", label: "API" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */

export default function EarnPage() {
  const [tab, setTab] = useState<Tab>("pools");
  const [scannerFilter, setScannerFilter] = useState("All");
  const [copiedKey, setCopiedKey] = useState(false);
  const [hoveredPool, setHoveredPool] = useState<string | null>(null);

  const totalStaked = MY_POSITIONS.reduce((s, p) => s + p.deployed, 0);
  const totalEarned = MY_POSITIONS.reduce((s, p) => s + p.earnedYield, 0);
  const currentApy = MY_POSITIONS.length > 0 ? MY_POSITIONS.reduce((s, p) => s + p.apy, 0) / MY_POSITIONS.length : 0;
  const activePools = MY_POSITIONS.filter((p) => p.status === "active").length;
  const repPoints = 0;

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  /* ---------- Scanner filtered data ---------- */
  const filteredMarkets = scannerFilter === "All"
    ? SCANNER_MARKETS
    : SCANNER_MARKETS.filter((m) => m.category === scannerFilter);

  return (
    <div className="flex h-full flex-col">
      {/* ============ SUB-HEADER ============ */}
      <motion.div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Droplets className="h-3 w-3 text-signal-green" />
          EARN &amp; MARKET MAKING
        </div>

        <motion.div
          className="ml-4 hidden items-center gap-4 md:flex"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Total Staked", value: fmtUsd(totalStaked), color: "text-text-primary" },
            { label: "Current APY", value: `${currentApy}%`, color: "text-action-rise" },
            { label: "Total Earned", value: fmtUsd(totalEarned), color: "text-action-rise" },
            { label: "Active Pools", value: String(activePools), color: "text-text-primary" },
            { label: "Rep Points", value: fmtNum(repPoints), color: "text-chart-purple" },
          ].map((stat) => (
            <motion.div key={stat.label} className="flex items-center gap-1" variants={fadeUp}>
              <span className="text-[10px] text-text-quaternary">{stat.label}</span>
              <span className={`text-numbers-12 font-medium ${stat.color}`}>{stat.value}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          className="ml-auto flex h-6 items-center gap-1 rounded-[4px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <DollarSign className="h-3 w-3" /> Deposit
        </motion.button>
      </motion.div>

      {/* ============ TAB BAR ============ */}
      <div
        className="flex h-10 shrink-0 items-center gap-5 bg-bg-base-0 px-4"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative pb-px text-body-12 font-semibold transition-colors duration-150 ${
              tab === t.id ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                className="absolute -bottom-[5px] left-0 right-0 h-[2px] rounded-full bg-signal-green"
                layoutId="earn-tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ============ CONTENT ============ */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <AnimatePresence mode="wait">

          {/* ==================== TAB: MM POOLS ==================== */}
          {tab === "pools" && (
            <motion.div
              key="pools"
              className="flex flex-col gap-2"
              variants={tabContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {POOLS.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Droplets className="mb-2 h-8 w-8 text-text-muted" />
                  <p className="text-body-12 font-medium text-text-secondary">Market Making Pools</p>
                  <p className="mt-1 max-w-sm text-[11px] text-text-quaternary text-center">Provide liquidity to prediction markets and earn yield from spreads. Pools are diversified across categories with automated rebalancing.</p>
                  <button className="mt-3 rounded-[8px] bg-signal-green/10 px-4 py-1.5 text-body-12 font-medium text-signal-green transition-colors hover:bg-signal-green/20">
                    Notify Me
                  </button>
                </div>
              ) : (
              <motion.div
                className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {POOLS.map((pool, idx) => (
                  <motion.div
                    key={pool.id}
                    className="group relative flex flex-col rounded-[18px] bg-bg-base-1 p-4 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      ...panelStyle,
                      ...(hoveredPool === pool.id ? { boxShadow: `inset 0 0 0 1px var(--color-divider-heavy), 0 0 20px -4px ${pool.color}40` } : {}),
                    }}
                    variants={fadeUp}
                    onMouseEnter={() => setHoveredPool(pool.id)}
                    onMouseLeave={() => setHoveredPool(null)}
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <motion.div
                          className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: `color-mix(in srgb, ${pool.color} 10%, transparent)`, color: pool.color }}
                          whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.4 } }}
                        >
                          {pool.icon}
                        </motion.div>
                        <div>
                          <div className="text-body-12 font-semibold text-text-primary">{pool.name}</div>
                          <div className="text-[10px] text-text-quaternary">{pool.description}</div>
                        </div>
                      </div>
                      <motion.span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${RISK_CONFIG[pool.risk].bg} ${RISK_CONFIG[pool.risk].color}`}
                        variants={scaleIn}
                      >
                        {pool.risk}
                      </motion.span>
                    </div>

                    {/* Stats grid */}
                    <motion.div
                      className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div variants={fadeUp}>
                        <div className="text-[10px] text-text-quaternary">APY</div>
                        <motion.div
                          className="text-numbers-12 font-semibold text-action-rise"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 + idx * 0.06, duration: 0.4, ease: "easeOut" }}
                          whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
                        >
                          {pool.apy}%
                        </motion.div>
                      </motion.div>
                      <motion.div variants={fadeUp}>
                        <div className="text-[10px] text-text-quaternary">TVL</div>
                        <div className="text-numbers-12 font-medium text-text-primary">{fmtUsd(pool.tvl)}</div>
                      </motion.div>
                      <motion.div variants={fadeUp}>
                        <div className="text-[10px] text-text-quaternary">Your Deposit</div>
                        <div className="text-numbers-12 font-medium text-text-primary">
                          {pool.yourDeposit > 0 ? fmtUsd(pool.yourDeposit) : "--"}
                        </div>
                      </motion.div>
                    </motion.div>

                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-text-quaternary">Active Markets</div>
                        <div className="text-numbers-12 text-text-primary">{pool.activeMarkets}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-quaternary">Dynamic Spread</div>
                        <div className="text-numbers-12 text-text-primary">{pool.spreadRange}</div>
                      </div>
                    </div>

                    {/* Equity curve - animated draw-in */}
                    <AnimatedEquityCurve curve={pool.curve} color={pool.color} poolId={pool.id} />

                    {/* Hover tooltip reveal */}
                    <AnimatePresence>
                      {hoveredPool === pool.id && (
                        <motion.div
                          className="mb-2 rounded-[8px] bg-bg-base-2 px-3 py-2 text-[10px] text-text-secondary"
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text-quaternary">Pool Utilization</span>
                            <span className="text-numbers-10 text-text-primary">{Math.round((pool.tvl / 5_200_000) * 100)}%</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-text-quaternary">Spread Efficiency</span>
                            <span className="text-numbers-10 text-action-rise">Optimal</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="mt-auto flex gap-1.5">
                      <motion.button
                        className="flex h-7 flex-1 items-center justify-center gap-1 rounded-[6px] bg-action-brand text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <DollarSign className="h-3 w-3" /> Deposit
                      </motion.button>
                      {pool.yourDeposit > 0 && (
                        <motion.button
                          className="flex h-7 flex-1 items-center justify-center gap-1 rounded-[6px] bg-bg-base-2 text-body-12 font-medium text-text-secondary transition-colors hover:bg-bg-base-3 hover:text-text-primary"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <Unlock className="h-3 w-3" /> Withdraw
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              )}

              {/* How Auto-MM Works */}
              <motion.div
                className="rounded-[18px] bg-bg-base-1 p-5"
                style={panelStyle}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-signal-green" />
                  <span className="text-body-12 font-semibold text-text-primary">How Auto-MM Works</span>
                </div>
                <motion.div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    { step: "1", title: "Deposit Capital", desc: "Choose a pool matching your risk appetite and deposit USDC. Your capital joins a shared liquidity reserve." },
                    { step: "2", title: "Algorithmic Distribution", desc: "Pythia's AMM engine distributes liquidity across order books using dynamic spreads, inventory signals, and risk/return optimization." },
                    { step: "3", title: "Earn Yield + Rewards", desc: "Earn yield from bid-ask spreads plus Pythia reputation points. Higher tiers unlock bonus APY and governance perks." },
                    { step: "4", title: "Withdraw Anytime", desc: "Withdraw your capital at any time. Pending settlements may queue for up to 24h during high-volume periods." },
                  ].map((item) => (
                    <motion.div key={item.step} className="flex gap-3" variants={fadeUp}>
                      <motion.span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal-green/15 text-[11px] font-bold text-signal-green"
                        variants={scaleIn}
                      >
                        {item.step}
                      </motion.span>
                      <div>
                        <div className="text-body-12 font-semibold text-text-primary">{item.title}</div>
                        <p className="mt-1 text-[10px] leading-relaxed text-text-quaternary">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== TAB: OPPORTUNITY SCANNER ==================== */}
          {tab === "scanner" && (
            <motion.div
              key="scanner"
              className="flex flex-col gap-2"
              variants={tabContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Filter chips */}
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-signal-green" />
                <span className="mr-2 text-body-12 font-semibold text-text-primary">Markets with MM Opportunity</span>
                {SCANNER_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setScannerFilter(cat)}
                    className={`rounded-[4px] px-2.5 py-1 text-[10px] font-medium transition-colors duration-150 ${
                      scannerFilter === cat
                        ? "bg-action-translucent-hover text-text-primary"
                        : "text-text-quaternary hover:bg-action-translucent-hover hover:text-text-secondary"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-[18px] bg-bg-base-1" style={panelStyle}>
                {filteredMarkets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Target className="mb-2 h-8 w-8 text-text-muted" />
                    <p className="text-body-12 font-medium text-text-secondary">Opportunity Scanner</p>
                    <p className="mt-1 max-w-sm text-[11px] text-text-quaternary text-center">Automatically scans markets for wide spreads and low liquidity -- ideal conditions for market making. Get alerts when high-yield opportunities appear.</p>
                    <button className="mt-3 rounded-[8px] bg-signal-green/10 px-4 py-1.5 text-body-12 font-medium text-signal-green transition-colors hover:bg-signal-green/20">
                      Learn More
                    </button>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                <div
                  className="grid grid-cols-[1fr_80px_100px_100px_80px_70px_110px] gap-2 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary"
                  style={heavyDivider}
                >
                  <span>Market</span>
                  <span className="text-right">Spread (bps)</span>
                  <span className="text-right">Liquidity Score</span>
                  <span className="text-right">Volume 24h</span>
                  <span className="text-right">Est. APY</span>
                  <span className="text-right">Risk</span>
                  <span />
                </div>
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  {filteredMarkets
                    .sort((a, b) => b.estApy - a.estApy)
                    .map((mkt) => {
                      const spreadColor = mkt.spread >= 7 ? "text-action-rise" : mkt.spread >= 4 ? "text-signal-amber" : "text-action-fall";
                      const riskColor = mkt.risk === "High" ? "text-action-fall bg-action-fall-dim" : mkt.risk === "Medium" ? "text-signal-amber bg-signal-amber-dim" : "text-action-rise bg-action-rise-dim";
                      return (
                        <motion.div
                          key={mkt.id}
                          className="grid grid-cols-[1fr_80px_100px_100px_80px_70px_110px] items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-action-translucent-hover"
                          style={rowDivider}
                          variants={fadeUp}
                        >
                          <Link href={`/dashboard/markets/${mkt.id}`} className="truncate text-body-12 font-medium text-text-primary hover:text-signal-green hover:underline">
                            {mkt.name}
                          </Link>
                          <span className={`text-right text-numbers-12 font-medium ${spreadColor}`}>{mkt.spread}</span>
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="h-1 w-14 overflow-hidden rounded-full bg-bg-base-3">
                              <AnimatedBar widthPct={`${mkt.liquidityScore}%`} color="bg-signal-green" />
                            </div>
                            <span className="text-numbers-10 text-text-secondary">{mkt.liquidityScore}</span>
                          </div>
                          <span className="text-right text-numbers-12 text-text-primary">{fmtUsd(mkt.volume24h)}</span>
                          <motion.span
                            className="text-right text-numbers-12 font-semibold text-action-rise"
                            whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
                          >
                            {mkt.estApy}%
                          </motion.span>
                          <div className="flex justify-end">
                            <motion.span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${riskColor}`}
                              variants={scaleIn}
                            >
                              {mkt.risk}
                            </motion.span>
                          </div>
                          <div className="flex justify-end">
                            <motion.button
                              className="flex h-6 items-center gap-1 rounded-[4px] bg-action-brand px-2.5 text-[10px] font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.94 }}
                            >
                              <Droplets className="h-3 w-3" /> Provide Liquidity
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                </motion.div>
                </div>
                </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================== TAB: MY POSITIONS ==================== */}
          {tab === "positions" && (
            <motion.div
              key="positions"
              className="flex flex-col gap-2"
              variants={tabContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Summary row */}
              <motion.div
                className="grid grid-cols-2 gap-2 md:grid-cols-4"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {[
                  { label: "Total Deployed", value: totalStaked > 0 ? fmtUsd(totalStaked) : "$0", icon: <DollarSign className="h-4 w-4" />, color: "text-text-primary" },
                  { label: "Unrealized PnL", value: MY_POSITIONS.length > 0 ? `+${fmtUsd(MY_POSITIONS.reduce((s, p) => s + (p.currentValue - p.deployed), 0))}` : "$0", icon: <TrendingUp className="h-4 w-4" />, color: "text-action-rise" },
                  { label: "Earned Yield", value: totalEarned > 0 ? `+${fmtUsd(totalEarned)}` : "$0", icon: <ArrowUpRight className="h-4 w-4" />, color: "text-action-rise" },
                  { label: "Pending Settlements", value: "$0", icon: <Activity className="h-4 w-4" />, color: "text-signal-amber" },
                ].map((stat) => (
                  <motion.div key={stat.label} className="rounded-[18px] bg-bg-base-1 p-4" style={panelStyle} variants={fadeUp}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-[8px] bg-bg-base-2 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-[10px] text-text-quaternary">{stat.label}</div>
                        <motion.div
                          className={`text-numbers-12 font-semibold ${stat.color}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.35 }}
                        >
                          {stat.value}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Positions table */}
              <motion.div
                className="rounded-[18px] bg-bg-base-1"
                style={panelStyle}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
              >
                <div className="flex h-10 items-center px-4" style={heavyDivider}>
                  <span className="text-body-12 font-semibold text-text-primary">Active LP Positions</span>
                </div>
                <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                <div
                  className="grid grid-cols-[1fr_100px_100px_90px_70px_80px_60px] gap-2 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary"
                  style={rowDivider}
                >
                  <span>Pool / Market</span>
                  <span className="text-right">Deployed</span>
                  <span className="text-right">Current Value</span>
                  <span className="text-right">Earned Yield</span>
                  <span className="text-right">APY</span>
                  <span className="text-right">Status</span>
                  <span className="text-right">Duration</span>
                </div>
                {MY_POSITIONS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <DollarSign className="mb-2 h-8 w-8 text-text-muted" />
                    <p className="text-body-12 font-medium text-text-secondary">No Active Positions</p>
                    <p className="mt-1 max-w-sm text-[11px] text-text-quaternary text-center">Your liquidity positions and earned yield will be tracked here. Deposit into a pool to start earning from market making spreads.</p>
                  </div>
                ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  {MY_POSITIONS.map((pos) => (
                    <motion.div
                      key={pos.id}
                      className="grid grid-cols-[1fr_100px_100px_90px_70px_80px_60px] items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-action-translucent-hover"
                      style={rowDivider}
                      variants={fadeUp}
                    >
                      <div>
                        <div className="text-body-12 font-medium text-text-primary">{pos.pool}</div>
                        <div className="text-[10px] text-text-quaternary">{pos.market}</div>
                      </div>
                      <span className="text-right text-numbers-12 text-text-primary">${pos.deployed.toLocaleString()}</span>
                      <span className="text-right text-numbers-12 text-text-primary">${pos.currentValue.toLocaleString()}</span>
                      <span className="text-right text-numbers-12 font-medium text-action-rise">+${pos.earnedYield.toLocaleString()}</span>
                      <motion.span
                        className="text-right text-numbers-12 font-medium text-action-rise"
                        whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
                      >
                        {pos.apy}%
                      </motion.span>
                      <div className="flex justify-end">
                        <motion.span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            pos.status === "active" ? "bg-action-rise-dim text-action-rise" : "bg-signal-amber-dim text-signal-amber"
                          }`}
                          variants={scaleIn}
                        >
                          {pos.status === "active" ? "Active" : "Settling"}
                        </motion.span>
                      </div>
                      <span className="text-right text-numbers-12 text-text-secondary">{pos.duration}</span>
                    </motion.div>
                  ))}
                </motion.div>
                )}
                </div>
                </div>
              </motion.div>

              {/* Exposure + Risk side by side */}
              <motion.div
                className="grid grid-cols-1 gap-2 md:grid-cols-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {/* Exposure breakdown */}
                <div className="rounded-[18px] bg-bg-base-1 p-4" style={panelStyle}>
                  <div className="mb-3 text-[10px] font-medium uppercase text-text-quaternary">Exposure Breakdown</div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <Droplets className="mb-2 h-6 w-6 text-text-muted" />
                    <p className="text-[11px] text-text-quaternary text-center">Deposit into pools to see exposure breakdown</p>
                  </div>
                </div>

                {/* Risk metrics */}
                <div className="rounded-[18px] bg-bg-base-1 p-4" style={panelStyle}>
                  <div className="mb-3 text-[10px] font-medium uppercase text-text-quaternary">Risk Metrics</div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <Shield className="mb-2 h-6 w-6 text-text-muted" />
                    <p className="text-[11px] text-text-quaternary text-center">Risk metrics will appear when positions are active</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== TAB: REWARDS ==================== */}
          {tab === "rewards" && (
            <motion.div
              key="rewards"
              className="flex flex-col gap-2 lg:flex-row"
              variants={tabContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Left column */}
              <motion.div
                className="flex flex-1 flex-col gap-2"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {/* Reputation card */}
                <motion.div className="rounded-[18px] bg-bg-base-1 p-5" style={panelStyle} variants={fadeUp}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-1 text-[10px] font-medium uppercase text-text-quaternary">Your Pythia Reputation Score</div>
                      <div className="flex items-center gap-3">
                        <motion.span
                          className="text-header-20 text-text-primary"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                        >
                          {fmtNum(repPoints)}
                        </motion.span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-body-12 font-semibold text-text-quaternary">--</span>
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] text-text-quaternary">Earn points by providing liquidity</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-text-quaternary">Points This Month</div>
                      <motion.div
                        className="text-numbers-12 font-semibold text-chart-purple"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        0
                      </motion.div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[10px] text-text-quaternary">
                      <span>Bronze (0)</span>
                      <span>Silver (5K)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg-base-3">
                      <motion.div
                        className="h-full rounded-full bg-bg-base-3"
                        initial={{ width: 0 }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Reward tiers table */}
                <motion.div className="rounded-[18px] bg-bg-base-1" style={panelStyle} variants={fadeUp}>
                  <div className="flex h-10 items-center px-4" style={heavyDivider}>
                    <Award className="mr-2 h-4 w-4 text-signal-green" />
                    <span className="text-body-12 font-semibold text-text-primary">Reward Tiers</span>
                  </div>
                  <div className="grid grid-cols-[100px_120px_1fr] gap-2 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary" style={rowDivider}>
                    <span>Level</span>
                    <span>Min Points</span>
                    <span>Perks</span>
                  </div>
                  {REWARD_TIERS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Award className="mb-2 h-8 w-8 text-text-muted" />
                      <p className="text-body-12 font-medium text-text-secondary">Reward Tiers</p>
                      <p className="mt-1 max-w-sm text-[11px] text-text-quaternary text-center">Earn points by providing liquidity. Higher tiers unlock reduced fees, priority pool access, and boosted APY multipliers.</p>
                      <button className="mt-3 rounded-[8px] bg-signal-green/10 px-4 py-1.5 text-body-12 font-medium text-signal-green transition-colors hover:bg-signal-green/20">
                        Notify Me
                      </button>
                    </div>
                  ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="show">
                    {REWARD_TIERS.map((tier) => {
                      const isActive = false;
                      return (
                        <motion.div
                          key={tier.level}
                          className={`grid grid-cols-[100px_120px_1fr] items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-action-translucent-hover ${isActive ? "bg-action-translucent-hover" : ""}`}
                          style={rowDivider}
                          variants={fadeUp}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div variants={scaleIn}>
                              <CircleDot className="h-3.5 w-3.5" style={{ color: tier.color }} />
                            </motion.div>
                            <span className="text-body-12 font-semibold" style={{ color: tier.color }}>{tier.level}</span>
                          </div>
                          <span className="text-numbers-12 text-text-primary">{tier.minPoints === 0 ? "0" : fmtNum(tier.minPoints)}</span>
                          <span className="text-[10px] text-text-secondary">{tier.perks}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                  )}
                </motion.div>

                {/* Referral card */}
                <motion.div className="rounded-[18px] bg-bg-base-1 p-4" style={panelStyle} variants={fadeUp}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-chart-purple" />
                      <span className="text-body-12 font-semibold text-text-primary">Refer a Market Maker</span>
                    </div>
                    <motion.span
                      className="rounded-full bg-chart-purple/15 px-2.5 py-0.5 text-[10px] font-semibold text-chart-purple"
                      variants={scaleIn}
                    >
                      +2,500 pts bonus
                    </motion.span>
                  </div>
                  <p className="mt-2 text-[10px] text-text-quaternary">
                    Invite other LPs to Pythia and earn 2,500 reputation points per referred depositor. Referred users also receive a 500-point welcome bonus and +0.3% APY for their first 30 days.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 rounded-[6px] bg-bg-base-2 px-3 py-1.5 text-numbers-12 text-text-secondary">
                      https://pythia.io/ref/usr_7x92kqm
                    </div>
                    <motion.button
                      className="flex h-7 items-center gap-1 rounded-[6px] bg-chart-purple/15 px-3 text-body-12 font-medium text-chart-purple transition-colors hover:bg-chart-purple/25"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right column: Leaderboard */}
              <motion.div
                className="w-full rounded-[18px] bg-bg-base-1 lg:w-80"
                style={panelStyle}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <div className="flex h-10 items-center px-4" style={heavyDivider}>
                  <Flame className="mr-2 h-4 w-4 text-signal-amber" />
                  <span className="text-body-12 font-semibold text-text-primary">Top Market Makers</span>
                </div>
                <div className="grid grid-cols-[40px_1fr_80px_65px_80px] gap-1 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary" style={rowDivider}>
                  <span>Rank</span>
                  <span>Name</span>
                  <span className="text-right">Points</span>
                  <span className="text-right">APY</span>
                  <span className="text-right">TVL</span>
                </div>
                {LEADERBOARD.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Flame className="mb-2 h-8 w-8 text-text-muted" />
                    <p className="text-body-12 font-medium text-text-secondary">Leaderboard</p>
                    <p className="mt-1 max-w-sm text-[11px] text-text-quaternary text-center">Top market makers ranked by volume, consistency, and risk-adjusted returns. Compete for bonus rewards and recognition.</p>
                    <button className="mt-3 rounded-[8px] bg-signal-green/10 px-4 py-1.5 text-body-12 font-medium text-signal-green transition-colors hover:bg-signal-green/20">
                      Notify Me
                    </button>
                  </div>
                ) : (
                <>
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  {LEADERBOARD.map((entry) => (
                    <motion.div
                      key={entry.rank}
                      className="grid grid-cols-[40px_1fr_80px_65px_80px] items-center gap-1 px-4 py-3 transition-colors duration-150 hover:bg-action-translucent-hover"
                      style={rowDivider}
                      variants={fadeUp}
                    >
                      <span className={`text-numbers-12 font-bold ${entry.rank <= 3 ? "text-signal-amber" : "text-text-secondary"}`}>
                        #{entry.rank}
                      </span>
                      <Link
                        href={`/dashboard/traders/${entry.id}`}
                        className="truncate text-body-12 font-medium text-text-primary hover:text-signal-green hover:underline"
                      >
                        {entry.name}
                      </Link>
                      <span className="text-right text-numbers-12 text-chart-purple">{fmtNum(entry.points)}</span>
                      <span className="text-right text-numbers-12 text-action-rise">{entry.apyEarned}%</span>
                      <span className="text-right text-numbers-12 text-text-primary">{fmtUsd(entry.tvl)}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="rounded-[10px] bg-bg-base-2 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                    <div className="mb-1 text-[10px] text-text-quaternary">Your Rank</div>
                    <div className="flex items-center justify-between">
                      <span className="text-numbers-12 font-bold text-text-primary">--</span>
                      <span className="text-numbers-12 text-chart-purple">{fmtNum(repPoints)} pts</span>
                    </div>
                    <div className="mt-1 text-[10px] text-text-quaternary">Start providing liquidity to earn a rank</div>
                  </div>
                </motion.div>
                </>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ==================== TAB: API ==================== */}
          {tab === "api" && (
            <motion.div
              key="api"
              className="flex flex-col gap-2"
              variants={tabContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              <motion.div
                className="rounded-[18px] bg-bg-base-1 p-5"
                style={panelStyle}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-signal-green" />
                      <span className="text-body-14 font-bold text-text-primary">Pythia Liquidity API</span>
                    </div>
                    <p className="mt-1 text-body-12 text-text-secondary">
                      For prediction market platforms looking to bootstrap liquidity depth. Plug in Pythia MM bots via a simple REST + WebSocket API.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="rounded-full bg-action-rise-dim px-2.5 py-0.5 text-[10px] font-medium text-action-rise"
                      variants={scaleIn}
                      initial="hidden"
                      animate="show"
                    >
                      v1.0 Stable
                    </motion.span>
                  </div>
                </div>

                {/* API Key */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-text-quaternary" />
                    <span className="text-[10px] font-medium text-text-quaternary">API Key</span>
                  </div>
                  <div className="flex-1 rounded-[6px] bg-bg-base-2 px-3 py-1.5 font-mono text-numbers-12 text-text-secondary">
                    pyth_sk_•••••••••••••••••••••••••••4f2a
                  </div>
                  <motion.button
                    onClick={handleCopyKey}
                    className="flex h-7 items-center gap-1.5 rounded-[6px] bg-bg-base-2 px-3 text-body-12 font-medium text-text-secondary transition-colors hover:bg-bg-base-3 hover:text-text-primary"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {copiedKey ? <Check className="h-3 w-3 text-action-rise" /> : <Copy className="h-3 w-3" />}
                    {copiedKey ? "Copied" : "Copy"}
                  </motion.button>
                </div>

                {/* Auth + Rate limits */}
                <motion.div
                  className="mt-3 flex gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div className="flex items-center gap-1.5" variants={fadeUp}>
                    <Lock className="h-3 w-3 text-text-quaternary" />
                    <span className="text-[10px] text-text-quaternary">Auth:</span>
                    <span className="text-[10px] text-text-secondary">Bearer token in Authorization header</span>
                  </motion.div>
                  <motion.div className="flex items-center gap-1.5" variants={fadeUp}>
                    <Wifi className="h-3 w-3 text-text-quaternary" />
                    <span className="text-[10px] text-text-quaternary">Rate limit:</span>
                    <span className="text-[10px] text-text-secondary">100 req/min (REST), unlimited (WS)</span>
                  </motion.div>
                  <motion.div className="flex items-center gap-1.5" variants={fadeUp}>
                    <Globe className="h-3 w-3 text-text-quaternary" />
                    <span className="text-[10px] text-text-quaternary">Base URL:</span>
                    <span className="font-mono text-[10px] text-text-secondary">https://api.pythia.io</span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Endpoint cards */}
              <motion.div
                className="flex flex-col gap-2"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {API_ENDPOINTS.map((ep) => (
                  <motion.div key={ep.path} className="rounded-[18px] bg-bg-base-1" style={panelStyle} variants={fadeUp}>
                    <div className="flex items-center gap-3 px-4 py-3" style={heavyDivider}>
                      <motion.span
                        className={`rounded-[4px] px-2 py-0.5 text-[10px] font-bold ${METHOD_COLORS[ep.method]}`}
                        variants={scaleIn}
                      >
                        {ep.method}
                      </motion.span>
                      <code className="font-mono text-body-12 font-medium text-text-primary">{ep.path}</code>
                      <span className="text-body-12 text-text-quaternary">{ep.description}</span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="mb-1.5 text-[10px] font-medium uppercase text-text-quaternary">Example Response</div>
                      <pre className="overflow-x-auto rounded-[8px] bg-bg-base-0 p-3 font-mono text-[11px] leading-relaxed text-text-secondary" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                        {ep.example}
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
