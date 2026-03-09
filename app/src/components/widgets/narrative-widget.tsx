"use client";

import { useState } from "react";
import { Widget } from "@/components/ui/widget";
import { Zap } from "lucide-react";
import { useEvents } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function VolatilityBars({ level }: { level: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "text-signal-red", bgColor: "bg-signal-red", label: "High", bars: 3 },
    medium: { color: "text-signal-amber", bgColor: "bg-signal-amber", label: "Med", bars: 2 },
    low: { color: "text-text-quaternary", bgColor: "bg-text-quaternary", label: "Low", bars: 1 },
  }[level];
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${i <= config.bars ? config.bgColor : "bg-bg-base-3"}`}
            style={{ height: `${6 + i * 3}px` }}
          />
        ))}
      </div>
      <span className={`text-caption-10 ${config.color}`}>{config.label}</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type Tab = "live" | "upcoming";

export function NarrativeWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const { events, isLoading } = useEvents(10);

  const tabs: { key: Tab; label: string }[] = [
    { key: "live", label: "Live Narratives" },
    { key: "upcoming", label: "Upcoming Events" },
  ];

  // Derive narratives from events: group by title, count markets, sum volume
  const narratives = events.map((event) => {
    const marketCount = event.markets?.length ?? 0;
    const totalVolume = event.volume24h ?? event.volume ?? 0;
    const volatility: "high" | "medium" | "low" =
      totalVolume > 500000 ? "high" : totalVolume > 100000 ? "medium" : "low";
    return {
      id: event.id,
      title: event.title,
      marketCount,
      totalVolume,
      volatility,
      endDate: event.endDate,
      active: event.active,
    };
  });

  // For "upcoming" tab, show events ending soonest
  const upcomingEvents = [...narratives]
    .filter((n) => n.active)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 8);

  // For "live" tab, show by volume
  const liveNarratives = [...narratives]
    .filter((n) => n.active)
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 8);

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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="h-3 w-3/5 animate-pulse rounded bg-bg-base-3" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-bg-base-3" />
              </div>
            ))}
          </div>
        ) : narratives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Zap className="mb-2 h-8 w-8 text-text-muted" />
            <p className="text-body-12 text-text-quaternary text-center">No active narratives</p>
          </div>
        ) : activeTab === "live" ? (
          <div>
            {liveNarratives.map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-action-translucent-hover"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-12 font-medium text-text-primary">
                    {n.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-caption-10 text-text-quaternary">
                      {n.marketCount} market{n.marketCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-caption-10 text-text-quaternary">
                      Vol {formatVolume(n.totalVolume)}
                    </span>
                  </div>
                </div>
                <VolatilityBars level={n.volatility} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {upcomingEvents.map((n) => {
              const endDate = new Date(n.endDate);
              const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
              return (
                <div
                  key={n.id}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-action-translucent-hover"
                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-12 font-medium text-text-primary">
                      {n.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-caption-10 text-text-quaternary">
                        {n.marketCount} market{n.marketCount !== 1 ? "s" : ""}
                      </span>
                      <span className="text-caption-10 text-signal-amber">
                        {daysLeft === 0 ? "Ending today" : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                  <VolatilityBars level={n.volatility} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Widget>
  );
}
