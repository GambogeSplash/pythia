"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Play, Pause, Settings, TrendingUp, Copy, Zap, Shield, Plus, BarChart3,
  RefreshCw, Newspaper, Trash2, Brain, Clock, Star, GitFork,
} from "lucide-react";
import { useBots } from "@/hooks/use-user-data";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const pageStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

const staggerList = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};

const listRow = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const templateCard = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const tabContent = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const detailPanel = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const BOT_TYPES = [
  {
    id: "arbitrage", icon: <Zap className="h-5 w-5" />, name: "Arbitrage Bot",
    desc: "Detects YES + NO < $1 on same venue, or cross-platform price divergence. Fee-aware, settlement-aware.",
    features: ["Single-market arb", "Cross-platform arb", "Fee & slippage aware", "Settlement risk flags"],
    difficulty: "Intermediate", avgReturn: "+12-24% APY", color: "var(--color-signal-amber)",
  },
  {
    id: "momentum", icon: <TrendingUp className="h-5 w-5" />, name: "Momentum Bot",
    desc: "Rides or fades trending probability swings. Signal-triggered from heatmap thresholds.",
    features: ["Momentum rider", "Contrarian mode", "Signal-triggered", "Configurable thresholds"],
    difficulty: "Beginner", avgReturn: "+8-18% APY", color: "var(--color-signal-green)",
  },
  {
    id: "alpha", icon: <Brain className="h-5 w-5" />, name: "Alpha Bot",
    desc: "Scans for Pythia Score anomalies, insider wallet clusters, sentiment-price divergence.",
    features: ["Pythia Score anomalies", "Insider pattern detection", "Sentiment divergence", "Auto-sizing"],
    difficulty: "Advanced", avgReturn: "+15-35% APY", color: "var(--color-chart-purple)",
  },
  {
    id: "news-reactor", icon: <Newspaper className="h-5 w-5" />, name: "News Reactor",
    desc: "Monitors live news feeds for keywords. Evaluates affected markets and places pre-set orders.",
    features: ["Keyword triggers", "Multi-source (X, Reddit, News)", "Latency-optimized", "Pre-set templates"],
    difficulty: "Intermediate", avgReturn: "+10-28% APY", color: "var(--color-signal-blue)",
  },
  {
    id: "portfolio-guard", icon: <Shield className="h-5 w-5" />, name: "Portfolio Guard",
    desc: "Exposure rebalancer, drawdown guard, Kelly-based position sizer. Auto allocation management.",
    features: ["Exposure rebalancing", "Drawdown protection", "Kelly criterion", "Category allocation"],
    difficulty: "Beginner", avgReturn: "Risk mgmt", color: "var(--color-signal-teal)",
  },
  {
    id: "copy-trade", icon: <Copy className="h-5 w-5" />, name: "Copy Trading Bot",
    desc: "Follow traders by wallet. Full or scaled copy, category-specific, whitelist/blacklist.",
    features: ["Full or scaled copy", "Category-specific", "Whitelist/blacklist", "Multi-trader"],
    difficulty: "Beginner", avgReturn: "Mirrors target", color: "var(--color-chart-peach)",
  },
];

interface LocalBot {
  id: string; name: string; type: string; typeId: string;
  status: "running" | "paused" | "stopped"; pnl: number; pnlPct: number;
  trades: number; winRate: number; uptime: string;
  capital: number; maxDrawdown: number; sharpe: number;
  lastTrade: string; markets: number; mode: "live" | "paper";
  recentTrades: { time: string; market: string; side: "YES" | "NO"; amount: string; pnl: string; positive: boolean }[];
}

const MARKETPLACE_BOTS = [
  { id: "m1", name: "Cross-Venue Arb Pro", author: "ShimaTakashi", authorId: "1", rating: 4.8, forks: 234, pnl30d: "+$12.4K", type: "Arbitrage", desc: "Simultaneous cross-platform arbitrage between Polymarket & Kalshi. Fee-aware, settlement-risk aware, no orphan legs.", license: "Free" },
  { id: "m2", name: "Sentiment Fade v3", author: "AidaYudai", authorId: "2", rating: 4.5, forks: 156, pnl30d: "+$8.9K", type: "Alpha", desc: "Fades sentiment-price divergences using NLP signals from Twitter/Reddit. Contrarian entries with tight stops.", license: "Free" },
  { id: "m3", name: "FOMC News Sniper", author: "IkedaSuzuka", authorId: "3", rating: 4.7, forks: 89, pnl30d: "+$6.2K", type: "Event-Driven", desc: "Monitors Fed speeches for keywords. Sub-second reaction to rate decision announcements across macro markets.", license: "Premium" },
  { id: "m4", name: "Kelly Rebalancer", author: "KawakamiTok", authorId: "4", rating: 4.3, forks: 312, pnl30d: "N/A", type: "Portfolio", desc: "Kelly criterion position sizer with drawdown guards. Auto-rebalances exposure across categories and venues.", license: "Free" },
  { id: "m5", name: "Whale Shadow", author: "MiyamotoRiko", authorId: "5", rating: 4.6, forks: 178, pnl30d: "+$15.1K", type: "Copy Trade", desc: "Follows top 5 whale wallets with 50% scaled copy. Category whitelist for politics & macro only.", license: "Premium" },
];

const statusConfig = {
  running: { color: "bg-action-rise", label: "Running", badge: "bg-action-rise-dim text-action-rise" },
  paused: { color: "bg-signal-amber", label: "Paused", badge: "bg-signal-amber-dim text-signal-amber" },
  stopped: { color: "bg-text-muted", label: "Stopped", badge: "bg-bg-base-3 text-text-quaternary" },
};

/* ------------------------------------------------------------------ */
/*  Animated equity curve component                                    */
/* ------------------------------------------------------------------ */

const EQUITY_POINTS = "0,55 20,50 40,45 60,48 80,35 100,30 120,25 140,28 160,15 180,10 200,8";

function EquityCurve({ botId }: { botId: string }) {
  return (
    <svg viewBox="0 0 200 60" className="h-16 w-full">
      <defs>
        <linearGradient id={`eqGrad-${botId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-signal-green)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-signal-green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={EQUITY_POINTS + " 200,60 0,60"}
        fill={`url(#eqGrad-${botId})`}
        stroke="none"
      />
      <motion.polyline
        points={EQUITY_POINTS}
        fill="none"
        stroke="var(--color-signal-green)"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status pulse dot                                                   */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: "running" | "paused" | "stopped" }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      {status === "running" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-action-rise opacity-50" />
      )}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusConfig[status].color}`} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BotsPage() {
  const { bots: apiBots, isLoading: botsLoading, mutate } = useBots();
  const [tab, setTab] = useState<"my-bots" | "templates" | "marketplace">("my-bots");
  const [bots, setBots] = useState<LocalBot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync API bots to local state
  const apiBotsJson = JSON.stringify(apiBots.map((b) => b.id));
  useEffect(() => {
    if (apiBots.length === 0 && bots.length === 0) return;
    const mapped: LocalBot[] = apiBots.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      typeId: b.type.toLowerCase().replace(/\s+/g, "-"),
      status: (b.status === "running" || b.status === "paused" || b.status === "stopped" ? b.status : "paused") as "running" | "paused" | "stopped",
      pnl: b.pnl,
      pnlPct: b.pnlPercent,
      trades: b.totalTrades,
      winRate: b.winRate,
      uptime: "",
      capital: b.capital,
      maxDrawdown: b.maxDrawdown,
      sharpe: b.sharpe,
      lastTrade: "",
      markets: b.marketsCount,
      mode: (b.mode === "paper" ? "paper" : "live") as "live" | "paper",
      recentTrades: [],
    }));
    setBots(mapped);
    if (!selectedBotId || !mapped.find((m) => m.id === selectedBotId)) {
      setSelectedBotId(mapped[0]?.id ?? null);
    }
  }, [apiBotsJson]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBot = bots.find((b) => b.id === selectedBotId) ?? bots[0] ?? null;

  const toggleBotStatus = async (id: string) => {
    const bot = bots.find((b) => b.id === id);
    if (!bot) return;
    const newStatus = bot.status === "running" ? "paused" : "running";
    // Optimistic update
    setBots((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: newStatus as "running" | "paused" }
          : b
      )
    );
    try {
      const res = await fetch(`/api/user/bots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update bot status");
      mutate();
    } catch {
      // Revert on failure
      setBots((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: bot.status } : b
        )
      );
    }
  };

  const killAllBots = async () => {
    const prevBots = bots;
    setBots((prev) => prev.map((b) => ({ ...b, status: "paused" as const })));
    try {
      await Promise.all(
        prevBots
          .filter((b) => b.status === "running")
          .map((b) =>
            fetch(`/api/user/bots/${b.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "paused" }),
            })
          )
      );
      mutate();
    } catch {
      setBots(prevBots);
    }
  };

  const deleteBot = async (id: string) => {
    const prevBots = bots;
    setBots((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (selectedBotId === id && next.length > 0) setSelectedBotId(next[0].id);
      return next;
    });
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/user/bots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bot");
      mutate();
    } catch {
      setBots(prevBots);
    }
  };

  const runningBots = bots.filter((b) => b.status === "running").length;
  const totalPnl = bots.reduce((sum, b) => sum + b.pnl, 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.trades, 0);
  const activeBots = bots.filter((b) => b.trades > 0);
  const avgWinRate = activeBots.length ? Math.round(activeBots.reduce((s, b) => s + b.winRate, 0) / activeBots.length) : 0;

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      {/* Sub-header */}
      <motion.div variants={fadeUp} className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Bot className="h-3 w-3 text-signal-green" />
          TRADING BOTS
        </div>
        <div className="ml-4 hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Active</span>
            <span className="text-numbers-12 font-medium text-signal-green">{runningBots}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Total PnL</span>
            <span className={`text-numbers-12 font-medium ${totalPnl >= 0 ? "text-action-rise" : "text-action-fall"}`}>
              {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Trades</span>
            <span className="text-numbers-12 font-medium text-text-primary">{totalTrades}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Win Rate</span>
            <span className="text-numbers-12 font-medium text-text-primary">{avgWinRate}%</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={killAllBots}
            className="flex h-6 items-center gap-1 rounded-[4px] bg-action-fall-dim px-2 text-body-12 font-medium text-action-fall transition-colors hover:bg-action-fall/20"
          >
            <Pause className="h-3 w-3" /> Kill All
          </motion.button>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/dashboard/bots/create" className="flex h-6 items-center gap-1 rounded-[4px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover">
              <Plus className="h-3 w-3" /> New Bot
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:flex-row">
        {/* Left: Bot list */}
        <div className="flex flex-1 flex-col rounded-[18px] bg-bg-base-1" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
          <div className="flex h-10 items-center gap-4 px-4" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            {([
              { id: "my-bots" as const, label: `My Bots (${bots.length})` },
              { id: "templates" as const, label: "Bot Builder" },
              { id: "marketplace" as const, label: "Marketplace" },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`relative pb-px text-body-12 font-semibold transition-colors duration-150 ${tab === t.id ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"}`}>
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="bots-tab-indicator"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-signal-green"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "my-bots" && (
              <motion.div
                key="my-bots"
                variants={tabContent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 overflow-auto"
              >
                {bots.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-1 flex-col items-center justify-center py-16"
                  >
                    <Bot className="mb-3 h-8 w-8 text-text-muted" />
                    <p className="mb-1 text-body-12 font-medium text-text-secondary">No bots yet</p>
                    <p className="mb-4 text-[11px] text-text-quaternary">Create your first trading bot to get started</p>
                    <Link href="/dashboard/bots/create" className="flex h-7 items-center gap-1 rounded-[6px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 hover:bg-action-brand-hover">
                      <Plus className="h-3 w-3" /> Create Bot
                    </Link>
                  </motion.div>
                ) : <>
                <div className="hidden md:grid grid-cols-[1fr_90px_80px_65px_65px_60px_55px_70px] gap-2 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                  <span>Bot</span><span>Type</span><span className="text-right">PnL</span><span className="text-right">Trades</span>
                  <span className="text-right">Win %</span><span className="text-right">Sharpe</span><span className="text-right">Mode</span><span />
                </div>
                <motion.div variants={staggerList} initial="hidden" animate="show">
                  {bots.map((bot) => (
                    <motion.button
                      key={bot.id}
                      variants={listRow}
                      onClick={() => setSelectedBotId(bot.id)}
                      whileHover={{ backgroundColor: "rgba(179, 200, 224, 0.06)", y: -1 }}
                      transition={{ duration: 0.15 }}
                      className={`flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors duration-150 md:grid md:grid-cols-[1fr_90px_80px_65px_65px_60px_55px_70px] md:items-center md:gap-2 ${selectedBotId === bot.id ? "bg-action-translucent-hover" : ""}`}
                      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot status={bot.status} />
                        <Link href={`/dashboard/bots/${bot.id}`} className="text-body-12 font-medium text-text-primary hover:text-signal-green hover:underline" onClick={(e) => e.stopPropagation()}>
                          {bot.name}
                        </Link>
                      </div>
                      <span className="hidden text-body-12 text-text-secondary md:block">{bot.type}</span>
                      <div className="flex flex-wrap items-center gap-2 md:contents">
                        <span className="text-body-12 text-text-secondary md:hidden">{bot.type}</span>
                        <span className={`text-numbers-12 md:text-right ${bot.pnl >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                          {bot.pnl >= 0 ? "+" : ""}${Math.abs(bot.pnl).toFixed(2)}
                        </span>
                        <span className="text-numbers-12 text-text-primary md:text-right">{bot.trades} trades</span>
                        <span className="hidden text-right text-numbers-12 text-text-primary md:block">{bot.winRate}%</span>
                        <span className="hidden text-right text-numbers-12 text-text-secondary md:block">{bot.sharpe.toFixed(2)}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${bot.mode === "paper" ? "bg-signal-amber-dim text-signal-amber" : "bg-action-rise-dim text-action-rise"}`}>
                          {bot.mode === "paper" ? "Paper" : "Live"}
                        </span>
                      </div>
                      <div className="flex justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); toggleBotStatus(bot.id); }}
                          className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                            bot.status === "running"
                              ? "bg-signal-amber-dim text-signal-amber hover:bg-signal-amber/20"
                              : "bg-action-rise-dim text-action-rise hover:bg-action-rise/20"
                          }`}
                          title={bot.status === "running" ? "Pause bot" : "Start bot"}
                        >
                          {bot.status === "running" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(bot.id); }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-action-secondary text-text-muted hover:bg-action-fall-dim hover:text-action-fall"
                          title="Delete bot"
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
                </>}
              </motion.div>
            )}

            {tab === "templates" && (
              <motion.div
                key="templates"
                variants={tabContent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 overflow-auto p-4"
              >
                <p className="mb-4 text-body-12 text-text-secondary">Choose a bot type to start building. Configure triggers, parameters, and deploy.</p>
                <motion.div
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  variants={staggerList}
                  initial="hidden"
                  animate="show"
                >
                  {BOT_TYPES.map((bt) => (
                    <motion.div key={bt.id} variants={templateCard} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                      <Link href={`/dashboard/bots/create?type=${bt.id}`} className="flex flex-col rounded-[12px] bg-bg-base-2 p-4 text-left transition-all duration-150 hover:bg-action-translucent-hover" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[8px]" style={{ backgroundColor: `color-mix(in srgb, ${bt.color} 12%, transparent)`, color: bt.color }}>
                            {bt.icon}
                          </div>
                          <span className="rounded-full bg-bg-base-3 px-2 py-0.5 text-[9px] text-text-quaternary">{bt.difficulty}</span>
                        </div>
                        <div className="text-body-12 font-semibold text-text-primary">{bt.name}</div>
                        <p className="mt-1 text-[10px] leading-relaxed text-text-quaternary">{bt.desc}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {bt.features.map((f) => (
                            <span key={f} className="rounded bg-bg-base-3 px-1.5 py-0.5 text-[9px] text-text-secondary">{f}</span>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-numbers-10 text-text-quaternary">Avg Return</span>
                          <span className="text-numbers-10 font-medium text-action-rise">{bt.avgReturn}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {tab === "marketplace" && (
              <motion.div
                key="marketplace"
                variants={tabContent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 overflow-auto"
              >
                <div className="px-4 py-2 text-body-12 text-text-secondary" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                  Community-published strategies. Fork, customize, and deploy.
                </div>
                <div className="hidden md:grid grid-cols-[1fr_100px_55px_55px_80px_80px_70px] gap-2 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}>
                  <span>Strategy</span><span>Type</span><span className="text-right">Rating</span>
                  <span className="text-right">Forks</span><span className="text-right">30d PnL</span><span>Author</span><span className="text-right">License</span>
                </div>
                <motion.div variants={staggerList} initial="hidden" animate="show">
                  {MARKETPLACE_BOTS.map((mb) => (
                    <motion.div
                      key={mb.id}
                      variants={listRow}
                      whileHover={{ backgroundColor: "rgba(179, 200, 224, 0.06)" }}
                      className="px-4 py-3 transition-colors duration-150"
                      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    >
                      <div className="flex flex-col gap-1 md:grid md:grid-cols-[1fr_100px_55px_55px_80px_80px_70px] md:items-center md:gap-2">
                        <span className="text-body-12 font-medium text-text-primary">{mb.name}</span>
                        <span className="text-body-12 text-text-secondary">{mb.type}</span>
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-signal-amber" />
                          <span className="text-numbers-10 text-text-primary">{mb.rating}</span>
                        </div>
                        <span className="text-right text-numbers-10 text-text-secondary">{mb.forks}</span>
                        <span className="text-right text-numbers-12 font-medium text-action-rise">{mb.pnl30d}</span>
                        <Link href={`/dashboard/traders/${mb.authorId}`} className="text-xs text-signal-green hover:underline">{mb.author}</Link>
                        <div className="flex justify-end gap-1">
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${mb.license === "Premium" ? "bg-signal-amber-dim text-signal-amber" : "bg-bg-base-3 text-text-quaternary"}`}>{mb.license}</span>
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-6 items-center gap-1 rounded-[4px] bg-action-translucent px-2 text-[10px] font-medium text-text-primary transition-colors hover:bg-action-translucent-hover"
                          >
                            <GitFork className="h-3 w-3" /> Fork
                          </motion.button>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-text-quaternary">{mb.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Bot detail */}
        <div className="hidden w-72 flex-col gap-2 md:flex">
          {!selectedBot ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-[18px] bg-bg-base-1 p-4" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
              <Bot className="mb-3 h-8 w-8 text-text-muted" />
              <p className="text-body-12 text-text-quaternary">Select a bot to view details</p>
            </div>
          ) : (<>
          <AnimatePresence mode="wait">
            <motion.div
              key={`detail-${selectedBot.id}`}
              variants={detailPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-body-12 font-semibold text-text-primary">{selectedBot.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${statusConfig[selectedBot.status].badge}`}>
                  {statusConfig[selectedBot.status].label}
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2 text-[10px] text-text-quaternary">
                <span>{selectedBot.type}</span><span>|</span>
                <span>{selectedBot.mode === "paper" ? "Paper" : "Live"}</span><span>|</span>
                <Clock className="h-3 w-3" /><span>{selectedBot.uptime}</span>
              </div>
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div>
                  <div className="text-[10px] text-text-quaternary">Total PnL</div>
                  <motion.div
                    key={`pnl-${selectedBot.id}`}
                    initial={{ scale: 1.08, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-numbers-12 font-semibold ${selectedBot.pnl >= 0 ? "text-action-rise" : "text-action-fall"}`}
                  >
                    {selectedBot.pnl >= 0 ? "+" : ""}${Math.abs(selectedBot.pnl).toFixed(2)}
                  </motion.div>
                  <div className={`text-numbers-10 ${selectedBot.pnlPct >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                    {selectedBot.pnlPct >= 0 ? "+" : ""}{selectedBot.pnlPct}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-quaternary">Capital</div>
                  <motion.div
                    key={`cap-${selectedBot.id}`}
                    initial={{ scale: 1.08, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-numbers-12 font-semibold text-text-primary"
                  >
                    ${selectedBot.capital.toLocaleString()}
                  </motion.div>
                  <div className="text-numbers-10 text-text-quaternary">{selectedBot.markets} markets</div>
                </div>
              </motion.div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] text-text-quaternary">Win Rate</div>
                  <motion.div key={`wr-${selectedBot.id}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-numbers-12 text-text-primary">{selectedBot.winRate}%</motion.div>
                </div>
                <div>
                  <div className="text-[10px] text-text-quaternary">Sharpe</div>
                  <motion.div key={`sh-${selectedBot.id}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-numbers-12 text-text-primary">{selectedBot.sharpe.toFixed(2)}</motion.div>
                </div>
                <div>
                  <div className="text-[10px] text-text-quaternary">Max DD</div>
                  <motion.div key={`dd-${selectedBot.id}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-numbers-12 text-action-fall">{selectedBot.maxDrawdown}%</motion.div>
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleBotStatus(selectedBot.id)}
                  className={`flex h-7 flex-1 items-center justify-center gap-1 rounded-[6px] text-body-12 font-medium transition-colors ${
                    selectedBot.status === "running" ? "bg-signal-amber-dim text-signal-amber hover:bg-signal-amber/20" : "bg-action-rise-dim text-action-rise hover:bg-action-rise/20"
                  }`}
                >
                  {selectedBot.status === "running" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
                </motion.button>
                <Link href={`/dashboard/bots/${selectedBot.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-bg-base-2 text-text-secondary hover:bg-bg-base-3 hover:text-text-primary"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setConfirmDeleteId(selectedBot.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-bg-base-2 text-text-muted hover:bg-action-fall-dim hover:text-action-fall"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`equity-${selectedBot.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">Equity Curve</div>
              <EquityCurve botId={selectedBot.id} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`trades-${selectedBot.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-hidden rounded-[18px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
                Recent Trades
              </div>
              <div className="scrollbar-hide overflow-auto">
                {selectedBot.recentTrades.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[10px] text-text-quaternary">No trades yet</div>
                ) : (
                  <motion.div variants={staggerList} initial="hidden" animate="show">
                    {selectedBot.recentTrades.map((t, i) => (
                      <motion.div
                        key={`${selectedBot.id}-trade-${i}`}
                        variants={listRow}
                        className="flex items-center justify-between px-4 py-2 transition-colors hover:bg-action-translucent-hover"
                        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold ${t.side === "YES" ? "text-action-buy" : "text-action-sell"}`}>{t.side}</span>
                            <Link href={`/dashboard/markets/${i + 1}`} className="truncate text-body-12 text-text-secondary hover:text-signal-green">{t.market}</Link>
                          </div>
                          <div className="flex items-center gap-2 text-numbers-10 text-text-quaternary">
                            <span>{t.time}</span><span>{t.amount}</span>
                          </div>
                        </div>
                        <span className={`text-numbers-12 font-medium ${t.positive ? "text-action-rise" : "text-action-fall"}`}>{t.pnl}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="rounded-[18px] bg-bg-base-1 p-4"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">Paper Trading</div>
            <p className="mb-3 text-[10px] text-text-quaternary">Test strategies with simulated funds before deploying real capital.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-7 w-full items-center justify-center gap-1.5 rounded-[6px] bg-action-translucent text-body-12 font-medium text-text-primary transition-colors hover:bg-action-translucent-hover"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Start Paper Mode
            </motion.button>
          </motion.div>
          </>)}
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-80 rounded-[18px] bg-bg-base-1 p-5"
              style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-1 text-body-12 font-semibold text-text-primary">Delete Bot</div>
              <p className="mb-4 text-[11px] text-text-secondary">
                Are you sure you want to delete <span className="font-medium text-text-primary">{bots.find((b) => b.id === confirmDeleteId)?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex h-8 flex-1 items-center justify-center rounded-[8px] bg-bg-base-2 text-body-12 font-medium text-text-secondary transition-colors hover:bg-bg-base-3 hover:text-text-primary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteBot(confirmDeleteId)}
                  className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[8px] bg-action-fall-dim text-body-12 font-semibold text-signal-red transition-colors hover:bg-signal-red/20"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
