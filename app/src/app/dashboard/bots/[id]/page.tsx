"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Settings, Trash2, Bot,
  Target, Activity, Shield, BarChart3, Zap,
} from "lucide-react";
import { useBots } from "@/hooks/use-user-data";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const STAT_LABELS = [
  { label: "Total PnL", color: "text-text-primary" },
  { label: "PnL %", color: "text-text-primary" },
  { label: "Capital Deployed", color: "text-text-primary" },
  { label: "Win Rate", color: "text-text-primary" },
  { label: "Sharpe Ratio", color: "text-text-primary" },
  { label: "Max Drawdown", color: "text-text-primary" },
  { label: "Total Trades", color: "text-text-primary" },
  { label: "Uptime", color: "text-text-primary" },
];

export default function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bots, isLoading } = useBots();
  const bot = bots.find((b) => b.id === id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-signal-green border-t-transparent" />
          <p className="text-body-12 text-text-quaternary">Loading bot...</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="flex h-full flex-col">
        <div
          className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          <Link
            href="/dashboard/bots"
            className="mr-2 flex h-5 w-5 items-center justify-center rounded text-text-quaternary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
            <Bot className="h-3 w-3 text-text-muted" />
            Bot Detail
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center py-24">
          <Bot className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-body-12 font-medium text-text-secondary">Bot not found</p>
          <p className="mt-1 text-[11px] text-text-quaternary text-center">Bot not found or database not connected</p>
          <Link
            href="/dashboard/bots"
            className="mt-4 flex h-7 items-center gap-1 rounded-[6px] bg-action-translucent px-3 text-body-12 font-medium text-text-primary transition-colors hover:bg-action-translucent-hover"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Bots
          </Link>
        </div>
      </div>
    );
  }

  const botName = bot.name || "Unnamed Bot";
  const botStatus = bot.status || "stopped";
  const isRunning = botStatus === "running";

  return (
    <div className="flex h-full flex-col">
      {/* ---- Sub-header strip ---- */}
      <div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <Link
          href="/dashboard/bots"
          className="mr-2 flex h-5 w-5 items-center justify-center rounded text-text-quaternary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>

        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Bot className={`h-3 w-3 ${isRunning ? "text-signal-green" : "text-text-muted"}`} />
          {botName}
        </div>

        {isRunning && (
          <>
            <span className="ml-3 rounded-full bg-action-rise-dim px-2 py-0.5 text-[9px] font-medium text-action-rise">
              Running
            </span>
            <span className="ml-1.5 rounded-full bg-action-rise-dim px-2 py-0.5 text-[9px] font-medium text-action-rise">
              Live
            </span>
          </>
        )}
        {!isRunning && (
          <span className="ml-3 rounded-full bg-bg-base-3 px-2 py-0.5 text-[9px] font-medium text-text-quaternary">
            {botStatus.charAt(0).toUpperCase() + botStatus.slice(1)}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-bg-base-2 text-text-secondary transition-colors hover:bg-bg-base-3 hover:text-text-primary">
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-bg-base-2 text-text-muted transition-colors hover:bg-action-fall-dim hover:text-action-fall">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ---- Stats row ---- */}
      <div className="grid shrink-0 grid-cols-8 gap-2 px-2 pt-2">
        {STAT_LABELS.map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] bg-bg-base-1 px-3 py-2.5"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="text-[10px] text-text-quaternary">{s.label}</div>
            <div className={`text-numbers-12 font-semibold ${s.color}`}>--</div>
          </div>
        ))}
      </div>

      {/* ---- Main content ---- */}
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        {/* ---- Left column (2/3) ---- */}
        <div className="flex flex-[2] flex-col gap-2">
          {/* Equity Curve */}
          <div
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <span className="text-[10px] font-medium uppercase text-text-quaternary">
                Equity Curve
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Activity className="mb-2 h-6 w-6 text-text-muted" />
              <p className="text-body-12 text-text-quaternary">Connect to a database to see equity curve</p>
            </div>
          </div>

          {/* Trade History */}
          <div
            className="flex min-h-0 flex-1 flex-col rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex shrink-0 items-center justify-between px-4 py-2"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <span className="text-[10px] font-medium uppercase text-text-quaternary">
                Trade History
              </span>
            </div>

            {/* Table header */}
            <div
              className="grid shrink-0 grid-cols-[50px_120px_1fr_42px_65px_55px_55px_65px_50px] gap-2 px-4 py-1.5 text-[10px] font-medium uppercase text-text-quaternary"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <span>ID</span>
              <span>Time</span>
              <span>Market</span>
              <span>Side</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Entry</span>
              <span className="text-right">Exit</span>
              <span className="text-right">PnL</span>
              <span className="text-right">Status</span>
            </div>

            {/* Trade rows */}
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="mb-2 h-6 w-6 text-text-muted" />
                <p className="text-body-12 text-text-quaternary">Connect to a database to see bot activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Right column (1/3) ---- */}
        <div className="flex w-80 flex-col gap-2 overflow-auto">
          {/* Signal Accuracy Log */}
          <div
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <span className="text-[10px] font-medium uppercase text-text-quaternary">
                Signal Accuracy Log
              </span>
            </div>
            <div className="px-4 py-8 text-center">
              <Activity className="mx-auto mb-2 h-6 w-6 text-text-muted" />
              <p className="text-body-12 text-text-quaternary">Connect to a database to see bot activity</p>
            </div>
          </div>

          {/* Active Positions */}
          <div
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              Active Positions (0)
            </div>
            <div className="px-4 py-8 text-center">
              <Target className="mx-auto mb-2 h-6 w-6 text-text-muted" />
              <p className="text-body-12 text-text-quaternary">Connect to a database to see bot activity</p>
            </div>
          </div>

          {/* Bot Configuration */}
          <div
            className="rounded-[18px] bg-bg-base-1 p-4"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="mb-3 text-[10px] font-medium uppercase text-text-quaternary">
              Bot Configuration
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Settings className="mb-2 h-5 w-5 text-text-muted" />
              <p className="text-[11px] text-text-quaternary text-center">Connect to a database to view bot configuration</p>
            </div>
            <Link
              href="/dashboard/bots/create"
              className="mt-3 flex h-7 w-full items-center justify-center gap-1.5 rounded-[6px] bg-action-translucent text-body-12 font-medium text-text-primary transition-colors hover:bg-action-translucent-hover"
            >
              <Settings className="h-3.5 w-3.5" /> Edit Configuration
            </Link>
          </div>

          {/* Risk Metrics */}
          <div
            className="rounded-[18px] bg-bg-base-1 p-4"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase text-text-quaternary">
              <Shield className="h-3 w-3" /> Risk Metrics
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Zap className="mb-2 h-5 w-5 text-text-muted" />
              <p className="text-[11px] text-text-quaternary text-center">Risk metrics require trade history data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
