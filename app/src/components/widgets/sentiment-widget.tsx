"use client";

import { Widget } from "@/components/ui/widget";
import { Activity } from "lucide-react";

// ── Widget ──────────────────────────────────────────────────────────────

export function SentimentWidget() {
  return (
    <Widget
      id="sentiment"
      title="Sentiment Engine"
      liveIndicator
      accentColor="#9B59FF"
      icon={<Activity className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      {/* Table Header */}
      <div
        className="grid grid-cols-[1fr_52px_48px_54px_64px] gap-1 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-[10px] font-medium uppercase text-text-quaternary">
          Market
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Score
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          Trend
        </span>
        <span className="text-center text-[10px] font-medium uppercase text-text-quaternary">
          S/P
        </span>
        <span className="text-right text-[10px] font-medium uppercase text-text-quaternary">
          7D
        </span>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Activity className="mb-2 h-8 w-8 text-text-muted" />
        <p className="text-body-12 text-text-quaternary text-center">Sentiment data requires external API integration</p>
      </div>
    </Widget>
  );
}
