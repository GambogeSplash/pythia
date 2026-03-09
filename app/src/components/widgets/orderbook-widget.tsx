"use client";

import { useState, useMemo } from "react";
import { Widget } from "@/components/ui/widget";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface OrderLevel {
  price: number;
  size: number;
  cumulative: number;
}

function generateBids(): OrderLevel[] {
  const levels: OrderLevel[] = [];
  let cumulative = 0;
  for (let i = 0; i < 12; i++) {
    const price = 71 - i;
    const size = Math.round(500 + Math.random() * 4500);
    cumulative += size;
    levels.push({ price, size, cumulative });
  }
  return levels;
}

function generateAsks(): OrderLevel[] {
  const levels: OrderLevel[] = [];
  let cumulative = 0;
  for (let i = 0; i < 12; i++) {
    const price = 73 + i;
    const size = Math.round(500 + Math.random() * 4500);
    cumulative += size;
    levels.push({ price, size, cumulative });
  }
  return levels;
}

export function OrderBookWidget() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const bids = useMemo(() => generateBids(), []);
  const asks = useMemo(() => generateAsks(), []);

  const maxBidSize = Math.max(...bids.map((b) => b.size));
  const maxAskSize = Math.max(...asks.map((a) => a.size));
  const maxBidCumulative = bids[bids.length - 1]?.cumulative ?? 1;
  const maxAskCumulative = asks[asks.length - 1]?.cumulative ?? 1;

  return (
    <Widget
      id="orderbook"
      title="Order Book"
      icon={<BarChart3 className="h-3.5 w-3.5 text-text-tertiary" />}
      accentColor="#00FF85"
      actions={
        <span className="flex items-center gap-1 rounded px-2 py-0.5 text-caption-10 font-medium bg-bg-base-2 text-text-secondary">
          Spread: 2¢
        </span>
      }
    >
      <div className="flex flex-col h-full">
        {/* Two-column layout */}
        <div className="grid grid-cols-2 flex-1 min-h-0">
          {/* Bids (left) */}
          <div className="flex flex-col overflow-hidden" style={{ boxShadow: "inset -1px 0 0 0 var(--color-divider-thin)" }}>
            {/* Column headers */}
            <div
              className="grid grid-cols-[1fr_1fr_1fr] gap-1 px-2 py-1"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <span className="text-label-10 text-text-quaternary">Price</span>
              <span className="text-right text-label-10 text-text-quaternary">Size</span>
              <span className="text-right text-label-10 text-text-quaternary">Total</span>
            </div>

            {/* Bid rows */}
            <div className="flex-1 overflow-auto">
              {bids.map((level, idx) => {
                const rowId = `bid-${level.price}`;
                const sizePercent = (level.size / maxBidSize) * 100;
                const cumulativePercent = (level.cumulative / maxBidCumulative) * 100;
                const isHovered = hoveredRow === rowId;

                return (
                  <motion.div
                    key={rowId}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`relative grid h-6 grid-cols-[1fr_1fr_1fr] items-center gap-1 px-2 cursor-default transition-colors duration-100 ${
                      isHovered ? "bg-action-translucent-hover" : ""
                    }`}
                    style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Depth bar — grows right-to-left */}
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0"
                      style={{
                        width: `${sizePercent}%`,
                        backgroundColor: "var(--color-action-buy)",
                        opacity: 0.12,
                      }}
                    />
                    {/* Cumulative depth bar */}
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0"
                      style={{
                        width: `${cumulativePercent}%`,
                        backgroundColor: "var(--color-action-buy)",
                        opacity: 0.05,
                      }}
                    />

                    <span className="relative z-10 text-numbers-12 font-medium text-action-buy">
                      {level.price}¢
                    </span>
                    <span className="relative z-10 text-right text-numbers-10 text-text-primary">
                      {level.size.toLocaleString()}
                    </span>
                    <span className="relative z-10 text-right text-numbers-10 text-text-tertiary">
                      {level.cumulative.toLocaleString()}
                    </span>

                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-20 rounded bg-bg-base-3 px-2 py-0.5 text-numbers-10 text-text-primary whitespace-nowrap"
                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
                      >
                        {level.size.toLocaleString()} @ {level.price}¢
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Asks (right) */}
          <div className="flex flex-col overflow-hidden">
            {/* Column headers */}
            <div
              className="grid grid-cols-[1fr_1fr_1fr] gap-1 px-2 py-1"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <span className="text-label-10 text-text-quaternary">Price</span>
              <span className="text-right text-label-10 text-text-quaternary">Size</span>
              <span className="text-right text-label-10 text-text-quaternary">Total</span>
            </div>

            {/* Ask rows */}
            <div className="flex-1 overflow-auto">
              {asks.map((level, idx) => {
                const rowId = `ask-${level.price}`;
                const sizePercent = (level.size / maxAskSize) * 100;
                const cumulativePercent = (level.cumulative / maxAskCumulative) * 100;
                const isHovered = hoveredRow === rowId;

                return (
                  <motion.div
                    key={rowId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`relative grid h-6 grid-cols-[1fr_1fr_1fr] items-center gap-1 px-2 cursor-default transition-colors duration-100 ${
                      isHovered ? "bg-action-translucent-hover" : ""
                    }`}
                    style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Depth bar — grows left-to-right */}
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0"
                      style={{
                        width: `${sizePercent}%`,
                        backgroundColor: "var(--color-action-fall)",
                        opacity: 0.12,
                      }}
                    />
                    {/* Cumulative depth bar */}
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0"
                      style={{
                        width: `${cumulativePercent}%`,
                        backgroundColor: "var(--color-action-fall)",
                        opacity: 0.05,
                      }}
                    />

                    <span className="relative z-10 text-numbers-12 font-medium text-action-fall">
                      {level.price}¢
                    </span>
                    <span className="relative z-10 text-right text-numbers-10 text-text-primary">
                      {level.size.toLocaleString()}
                    </span>
                    <span className="relative z-10 text-right text-numbers-10 text-text-tertiary">
                      {level.cumulative.toLocaleString()}
                    </span>

                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-20 rounded bg-bg-base-3 px-2 py-0.5 text-numbers-10 text-text-primary whitespace-nowrap"
                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
                      >
                        {level.size.toLocaleString()} @ {level.price}¢
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center spread display */}
        <div
          className="flex items-center justify-center gap-3 px-3 py-1.5"
          style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
        >
          <span className="text-numbers-10 text-text-quaternary">Mid</span>
          <span className="text-numbers-12 font-semibold text-text-primary">72¢</span>
          <span className="h-3 w-px bg-divider-heavy" />
          <span className="text-numbers-10 text-text-quaternary">Spread</span>
          <span className="text-numbers-12 font-semibold text-action-buy">2¢</span>
        </div>
      </div>
    </Widget>
  );
}
