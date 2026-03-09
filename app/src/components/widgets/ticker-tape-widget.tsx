"use client";

import { Widget } from "@/components/ui/widget";
import { Activity } from "lucide-react";

const TICKERS = [
  { name: "TRUMP 2028", price: "58¢", change: "+3.2%", up: true },
  { name: "FED CUTS JUN", price: "42¢", change: "-1.8%", up: false },
  { name: "BTC 100K", price: "67¢", change: "+5.1%", up: true },
  { name: "AI TURING", price: "31¢", change: "+12.4%", up: true },
  { name: "ETH ETF", price: "72¢", change: "+0.8%", up: true },
  { name: "S&P 6000", price: "55¢", change: "-2.3%", up: false },
  { name: "RECESSION 26", price: "23¢", change: "-4.1%", up: false },
  { name: "GROK IPO", price: "15¢", change: "+8.7%", up: true },
  { name: "NVIDIA 200", price: "44¢", change: "+1.5%", up: true },
  { name: "UKRAINE PEACE", price: "38¢", change: "-0.9%", up: false },
  { name: "FIFA 2026 US", price: "61¢", change: "+2.1%", up: true },
  { name: "APPLE CAR", price: "8¢", change: "-6.2%", up: false },
  { name: "MARS 2030", price: "12¢", change: "+0.3%", up: true },
  { name: "OPENAI IPO", price: "45¢", change: "+4.8%", up: true },
  { name: "GOLD 3000", price: "78¢", change: "+1.1%", up: true },
];

function getChangeValue(change: string): number {
  return Math.abs(parseFloat(change));
}

function TickerItem({ name, price, change, up }: (typeof TICKERS)[number]) {
  const absChange = getChangeValue(change);
  const hasGlow = absChange > 5;
  const color = up ? "var(--color-action-rise)" : "var(--color-action-fall)";
  const arrow = up ? "▲" : "▼";

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-body-12 font-bold text-text-primary">{name}</span>
        <span className="text-numbers-12 text-text-primary">{price}</span>
        <span
          className="text-numbers-10 font-medium"
          style={{
            color,
            textShadow: hasGlow ? `0 0 8px ${color}, 0 0 16px ${color}` : undefined,
          }}
        >
          {arrow} {change}
        </span>
      </div>
      <div
        className="h-4 w-px shrink-0"
        style={{ backgroundColor: "var(--color-divider-heavy)" }}
      />
    </div>
  );
}

export function TickerTapeWidget() {
  return (
    <Widget
      id="ticker-tape"
      title="Ticker Tape"
      icon={<Activity className="h-3.5 w-3.5" />}
      accentColor="#00FF85"
      liveIndicator
    >
      <div className="overflow-hidden px-3 py-1">
        <div
          className="flex w-max items-center gap-3 hover:[animation-play-state:paused]"
          style={{
            animation: "ticker-scroll 30s linear infinite",
          }}
        >
          {/* First set */}
          {TICKERS.map((ticker, i) => (
            <TickerItem key={`a-${i}`} {...ticker} />
          ))}
          {/* Duplicate for seamless loop */}
          {TICKERS.map((ticker, i) => (
            <TickerItem key={`b-${i}`} {...ticker} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Widget>
  );
}
