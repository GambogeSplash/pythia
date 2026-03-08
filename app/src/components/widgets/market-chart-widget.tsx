"use client";

import { useState } from "react";
import { Widget } from "@/components/ui/widget";
import { CandlestickChart } from "lucide-react";

const tabs = ["Probability", "Depth / Liquidity", "Crowd Sentiment", "Flow / Volume"];
const timeframes = ["1hr", "6hr", "1d", "1w", "All"];

interface OutcomeLegend {
  label: string;
  color: string;
  value: string;
  change: number;
}

const outcomes: OutcomeLegend[] = [
  { label: "25 bps decrease", color: "#00FF85", value: "66%", change: 3 },
  { label: "No change", color: "#FFB800", value: "12%", change: 3 },
  { label: "50+ bps change", color: "#2DD4BF", value: "16%", change: 3 },
  { label: "25+ bps increase", color: "#3B82F6", value: "<1%", change: -12 },
];

export function MarketChartWidget() {
  const [activeTab, setActiveTab] = useState("Probability");
  const [activeTimeframe, setActiveTimeframe] = useState("1w");

  return (
    <Widget
      id="market-chart"
      title="Market Chart"
      icon={<CandlestickChart className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <div className="flex items-center gap-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-numbers-10 font-medium transition-colors duration-150 ${
                activeTimeframe === tf
                  ? "bg-signal-green text-bg-base-0"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      }
    >
      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {outcomes.map((o) => (
          <div key={o.label} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: o.color }} />
              <span className="text-body-12 text-text-secondary">{o.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-data text-body-14 font-bold text-text-primary">{o.value}</span>
              <span className={`text-numbers-10 ${o.change >= 0 ? "text-action-rise" : "text-action-fall"}`}>
                {o.change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(o.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex px-4" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-2 text-[11px] font-medium transition-colors duration-150 ${
              activeTab === tab
                ? "border-signal-green text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="relative px-4 py-4">
        {/* Y axis labels */}
        <div className="absolute right-4 top-4 flex flex-col justify-between text-numbers-10 text-text-quaternary" style={{ height: 200 }}>
          <span>100%</span>
          <span>80%</span>
          <span>60%</span>
          <span>40%</span>
          <span>20%</span>
          <span>0%</span>
        </div>

        {/* Chart SVG */}
        <svg viewBox="0 0 800 220" className="h-[220px] w-full">
          {/* Grid lines */}
          {[0, 44, 88, 132, 176, 220].map((y) => (
            <line key={y} x1="0" y1={y} x2="760" y2={y} stroke="#161819" strokeWidth="1" />
          ))}

          {/* Area fill under green line */}
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF85" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00FF85" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="0,120 80,130 160,125 200,40 240,50 320,100 360,60 400,45 440,80 480,60 520,50 560,55 600,30 640,35 680,20 720,60 760,75 760,220 0,220"
            fill="url(#greenGrad)"
          />

          {/* Green line (25 bps decrease) */}
          <polyline
            points="0,120 80,130 160,125 200,40 240,50 320,100 360,60 400,45 440,80 480,60 520,50 560,55 600,30 640,35 680,20 720,60 760,75"
            fill="none"
            stroke="#00FF85"
            strokeWidth="2"
          />

          {/* Amber line (No change) */}
          <polyline
            points="0,160 80,155 160,170 200,175 240,180 320,170 360,175 400,165 440,170 480,175 520,180 560,178 600,185 640,180 680,175 720,178 760,190"
            fill="none"
            stroke="#FFB800"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Teal line (50+ bps change) */}
          <polyline
            points="0,150 80,155 160,148 200,160 240,155 320,155 360,160 400,158 440,162 480,165 520,160 560,162 600,158 640,165 680,168 720,170 760,165"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Blue line (25+ bps increase) */}
          <polyline
            points="0,185 80,190 160,180 200,180 240,185 320,130 360,130 400,130 440,130 480,140 520,160 560,155 600,150 640,160 680,170 720,180 760,185"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Current value label */}
          <g transform="translate(760, 72)">
            <rect x="-6" y="-8" width="36" height="16" rx="3" fill="#0F1012" stroke="#00FF85" strokeWidth="1" />
            <text x="12" y="3" textAnchor="middle" fill="#00FF85" fontSize="9" fontFamily="monospace">66%</text>
          </g>

          {/* Animated crosshair line (current position) */}
          <line x1="760" y1="0" x2="760" y2="220" stroke="#00FF85" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
        </svg>

        {/* X axis */}
        <div className="mt-2 flex justify-between px-2 text-numbers-10 text-text-quaternary">
          <span>24 Sep</span>
          <span>25 Sep</span>
          <span>26 Sep</span>
          <span>27 Sep</span>
          <span>28 Sep</span>
        </div>

        {/* Volume bars */}
        <div className="mt-4 flex h-16 items-end gap-[2px]">
          {Array.from({ length: 60 }).map((_, i) => {
            const buyH = 10 + Math.random() * 40;
            const sellH = 5 + Math.random() * 25;
            return (
              <div key={i} className="flex flex-1 flex-col items-stretch gap-[1px]">
                <div className="rounded-t-[1px] bg-signal-green/60" style={{ height: buyH }} />
                <div className="rounded-b-[1px] bg-signal-red/60" style={{ height: sellH }} />
              </div>
            );
          })}
        </div>

        {/* Volume labels */}
        <div className="absolute bottom-4 right-4 flex flex-col text-numbers-10 text-text-quaternary">
          <span>$20M</span>
          <span>$15M</span>
          <span>$10M</span>
          <span>$5M</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[11px] font-medium text-text-primary">
            Volume <ChevronIcon />
          </button>
          <div className="flex items-center gap-2 text-numbers-10 text-text-secondary">
            <span className="flex items-center gap-1">
              <div className="h-2 w-3 rounded-sm bg-signal-green/60" /> Buy Volume
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-3 rounded-sm bg-signal-red/60" /> Sell Volume
            </span>
          </div>
        </div>
      </div>
    </Widget>
  );
}

function ChevronIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-text-tertiary">
      <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
