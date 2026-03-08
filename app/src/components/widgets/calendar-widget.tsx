"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { useClosingSoonMarkets } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import { CalendarDays } from "lucide-react";

function categoryToType(category: string): "expiry" | "event" | "speech" | "economic" {
  const map: Record<string, "expiry" | "event" | "speech" | "economic"> = {
    Crypto: "expiry",
    Finance: "economic",
    Politics: "event",
    Tech: "event",
    Sports: "event",
    Science: "event",
  };
  return map[category] || "event";
}

const typeConfig = {
  expiry: { variant: "red" as const, label: "Expiry" },
  event: { variant: "blue" as const, label: "Event" },
  speech: { variant: "amber" as const, label: "Speech" },
  economic: { variant: "green" as const, label: "Economic" },
};

function categoryIcon(category: string): string {
  const map: Record<string, string> = {
    Politics: "🏛️",
    Crypto: "⟠",
    Sports: "⚽",
    Tech: "🤖",
    Science: "🔬",
    Finance: "🏦",
    Entertainment: "🎬",
    World: "🌍",
  };
  return map[category] || "📊";
}

function formatEndDate(endDate: string): { date: string; time: string } {
  const d = new Date(endDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = `${months[d.getMonth()]} ${d.getDate()}`;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short" });
  return { date, time };
}

export function CalendarWidget() {
  const { markets, isLoading } = useClosingSoonMarkets(10);

  return (
    <Widget
      id="calendar"
      title="Market Calendar"
      icon={<CalendarDays className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      <div>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-l-2 border-l-border-secondary px-3 py-2.5"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="w-16 flex-shrink-0">
                <div className="h-3 w-12 animate-pulse rounded bg-bg-base-2" />
                <div className="mt-1 h-2.5 w-10 animate-pulse rounded bg-bg-base-2" />
              </div>
              <div className="h-4 flex-1 animate-pulse rounded bg-bg-base-2" />
              <div className="h-4 w-12 animate-pulse rounded bg-bg-base-2" />
            </div>
          ))
        ) : markets.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No upcoming market closings
          </div>
        ) : (
          markets.map((market, idx) => {
            const eventType = categoryToType(market.category);
            const type = typeConfig[eventType];
            const { date, time } = formatEndDate(market.endDate);
            const timeLeft = formatTimeLeft(market.endDate);
            const importance = timeLeft.includes("d") ? (parseInt(timeLeft) <= 2 ? "high" : "medium") : "high";
            const importanceBorder = importance === "high" ? "border-l-signal-green" : importance === "medium" ? "border-l-signal-amber" : "border-l-border-secondary";

            return (
              <div
                key={market.id}
                className={`animate-fade-in stagger-${Math.min(idx + 1, 8)} flex items-center gap-3 border-l-2 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover ${importanceBorder}`}
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
              >
                <div className="w-16 flex-shrink-0 text-right">
                  <div className="text-numbers-12 font-medium text-text-primary">{date}</div>
                  <div className="text-numbers-10 text-text-quaternary">{timeLeft}</div>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-sm">{categoryIcon(market.category)}</span>
                  <Link href={`/dashboard/markets/${market.id}`} className="truncate text-body-12 text-text-primary hover:text-signal-green transition-colors">{market.question}</Link>
                </div>
                <Badge variant={type.variant}>{type.label}</Badge>
                <span className="flex-shrink-0 text-[10px] text-signal-teal">
                  {formatVolume(market.volume)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Widget>
  );
}
