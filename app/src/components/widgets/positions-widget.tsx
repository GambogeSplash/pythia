"use client";

import { useState } from "react";
import { Widget } from "@/components/ui/widget";
import { Wallet, ArrowUp, ArrowDown, X, Plus } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "open" | "pending" | "history";

interface Position {
  id: string;
  market: string;
  side: "YES" | "NO";
  qty: number;
  avgEntry: number;
  current: number;
  pnl: number;
  direction: "up" | "down";
}

const MOCK_POSITIONS: Position[] = [
  { id: "1", market: "Trump wins 2028?", side: "YES", qty: 500, avgEntry: 0.42, current: 0.58, pnl: 80, direction: "up" },
  { id: "2", market: "Fed cuts rates by June?", side: "NO", qty: 300, avgEntry: 0.65, current: 0.52, pnl: 39, direction: "down" },
  { id: "3", market: "BTC above 100K Dec?", side: "YES", qty: 1000, avgEntry: 0.33, current: 0.41, pnl: 80, direction: "up" },
  { id: "4", market: "AI passes bar exam 2026?", side: "YES", qty: 200, avgEntry: 0.71, current: 0.68, pnl: -6, direction: "down" },
  { id: "5", market: "S&P 500 above 6000?", side: "NO", qty: 400, avgEntry: 0.45, current: 0.38, pnl: 28, direction: "down" },
  { id: "6", market: "ETH ETF approved?", side: "YES", qty: 750, avgEntry: 0.55, current: 0.62, pnl: 52.5, direction: "up" },
];

function getPnlPct(pos: Position): number {
  const cost = pos.qty * pos.avgEntry;
  return cost > 0 ? (pos.pnl / cost) * 100 : 0;
}

export function PositionsWidget() {
  const [tab, setTab] = useState<Tab>("open");
  const positions = tab === "open" ? MOCK_POSITIONS : [];

  const totalValue = 4230;
  const unrealizedPnl = 312;
  const unrealizedPnlPct = 7.9;
  const positionCount = MOCK_POSITIONS.length;
  const totalExposure = 2450;

  return (
    <Widget
      id="positions"
      title="Positions"
      liveIndicator
      accentColor="#00FF85"
      icon={<Wallet className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <div className="flex items-center gap-1">
          {(["open", "pending", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-signal-green text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t === "open" ? "Open" : t === "pending" ? "Pending" : "History"}
            </button>
          ))}
        </div>
      }
    >
      {positions.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
          <Wallet className="h-6 w-6 text-text-quaternary" />
          <span className="text-body-12 text-text-secondary">No open positions</span>
          <button className="mt-1 rounded-[6px] bg-action-translucent-hover px-3 py-1 text-body-12 text-signal-green transition-colors hover:bg-action-translucent-active">
            Start trading
          </button>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div
            className="grid grid-cols-3 gap-3 px-3 py-2.5"
            style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
          >
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Total Value</div>
              <div className="font-data text-body-14 font-semibold text-text-primary">${totalValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Unrealized P/L</div>
              <div className="font-data text-body-14 font-semibold text-action-rise">
                +${unrealizedPnl}
                <span className="ml-1 text-xs">(+{unrealizedPnlPct}%)</span>
              </div>
            </div>
            <div>
              <div className="text-numbers-10 font-medium uppercase text-text-quaternary">Positions</div>
              <div className="font-data text-body-14 font-semibold text-text-primary">{positionCount} positions</div>
            </div>
          </div>

          {/* Column headers */}
          <div
            className="grid grid-cols-[1fr_40px_45px_50px_55px_75px_50px] gap-1 px-3 py-1.5"
            style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
          >
            {["Market", "Side", "Qty", "Entry", "Current", "P/L", ""].map((h) => (
              <span key={h} className="text-[10px] font-medium uppercase text-text-quaternary">{h}</span>
            ))}
          </div>

          {/* Position rows */}
          <div>
            {positions.map((pos, idx) => {
              const pnlPositive = pos.pnl >= 0;
              const pnlPct = getPnlPct(pos);

              return (
                <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="group/row grid grid-cols-[1fr_40px_45px_50px_55px_75px_50px] items-center gap-1 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover"
                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                >
                  {/* Market */}
                  <span className="truncate text-body-12 text-text-primary transition-colors hover:text-signal-green cursor-pointer">
                    {pos.market}
                  </span>

                  {/* Side badge */}
                  <span>
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        pos.side === "YES"
                          ? "bg-action-buy/15 text-action-buy"
                          : "bg-action-sell/15 text-action-sell"
                      }`}
                    >
                      {pos.side}
                    </span>
                  </span>

                  {/* Qty */}
                  <span className="text-numbers-12 text-text-primary">{pos.qty.toLocaleString()}</span>

                  {/* Avg Entry */}
                  <span className="text-numbers-12 text-text-secondary">{Math.round(pos.avgEntry * 100)}c</span>

                  {/* Current */}
                  <span className="flex items-center gap-0.5 text-numbers-12 text-text-primary">
                    {Math.round(pos.current * 100)}c
                    {pos.direction === "up" ? (
                      <ArrowUp className="h-2.5 w-2.5 text-action-rise" />
                    ) : (
                      <ArrowDown className="h-2.5 w-2.5 text-action-fall" />
                    )}
                  </span>

                  {/* P/L */}
                  <span
                    className={`text-numbers-12 font-medium pnl-pulse ${
                      pnlPositive ? "text-action-rise" : "text-action-fall"
                    }`}
                  >
                    {pnlPositive ? "+" : ""}${Math.abs(pos.pnl).toFixed(pos.pnl % 1 === 0 ? 0 : 1)}
                    <span className="ml-0.5 text-numbers-10">
                      ({pnlPositive ? "+" : ""}{pnlPct.toFixed(1)}%)
                    </span>
                  </span>

                  {/* Actions (hover reveal) */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100">
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-action-secondary text-text-secondary transition-all duration-150 hover:bg-action-fall/20 hover:text-action-fall hover:scale-110 active:scale-95"
                      title="Close position"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-action-secondary text-text-secondary transition-all duration-150 hover:bg-action-rise/20 hover:text-action-rise hover:scale-110 active:scale-95"
                      title="Add to position"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
          >
            <button className="rounded-[6px] bg-action-translucent-hover px-3 py-1 text-body-12 text-text-secondary transition-colors hover:bg-action-translucent-active hover:text-text-primary">
              Close All
            </button>
            <span className="text-numbers-10 text-text-quaternary">
              Total Exposure: <span className="font-semibold text-text-secondary">${totalExposure.toLocaleString()}</span>
            </span>
          </div>
        </>
      )}

      {/* P/L pulse animation */}
      <style jsx>{`
        @keyframes pnl-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pnl-pulse {
          animation: pnl-blink 2s ease-in-out 1;
        }
      `}</style>
    </Widget>
  );
}
