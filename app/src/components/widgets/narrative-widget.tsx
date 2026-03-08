"use client";

import { useState } from "react";
import { Widget } from "@/components/ui/widget";
import { Zap } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NarrativeStatus = "ACTIVE" | "FADING" | "EMERGING";

interface TimelineEvent {
  id: string;
  source: string;
  time: string;
  text: string;
  priceChange: number; // percentage
  marketSlug: string;
  marketName: string;
}

interface Narrative {
  id: string;
  title: string;
  status: NarrativeStatus;
  marketsAffected: number;
  timeline: TimelineEvent[];
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  markets: { slug: string; name: string }[];
  volatility: "high" | "medium" | "low";
}

/* Awaiting news API integration */

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const statusConfig: Record<NarrativeStatus, { variant: "green" | "amber" | "blue"; label: string }> = {
  ACTIVE: { variant: "green", label: "ACTIVE" },
  FADING: { variant: "amber", label: "FADING" },
  EMERGING: { variant: "blue", label: "EMERGING" },
};

const volatilityConfig: Record<string, { color: string; label: string; bars: number }> = {
  high: { color: "text-signal-red", label: "High", bars: 3 },
  medium: { color: "text-signal-amber", label: "Med", bars: 2 },
  low: { color: "text-text-quaternary", label: "Low", bars: 1 },
};

function VolatilityBars({ level }: { level: "high" | "medium" | "low" }) {
  const config = volatilityConfig[level];
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${i <= config.bars ? config.color.replace("text-", "bg-") : "bg-bg-base-3"}`}
            style={{ height: `${6 + i * 3}px` }}
          />
        ))}
      </div>
      <span className={`text-[10px] ${config.color}`}>{config.label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type Tab = "live" | "upcoming";

export function NarrativeWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [expandedNarrative, setExpandedNarrative] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "live", label: "Live Narratives" },
    { key: "upcoming", label: "Upcoming Events" },
  ];

  return (
    <Widget
      id="narrative"
      title="Narrative Tracker"
      icon={<Zap className="h-3.5 w-3.5 text-signal-purple" />}
      liveIndicator
      accentColor="#9B59FF"
    >
      {/* Tabs */}
      <div
        className="flex items-center gap-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-3 py-2 text-body-12 font-medium transition-colors duration-150 ${
              activeTab === tab.key
                ? "text-text-primary"
                : "text-text-quaternary hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-signal-purple" />
            )}
          </button>
        ))}
      </div>

      {/* Content — Empty State */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Zap className="mb-2 h-8 w-8 text-text-muted" />
          <p className="text-body-12 text-text-quaternary text-center">Narrative tracking requires news API integration</p>
        </div>
      </div>
    </Widget>
  );
}
