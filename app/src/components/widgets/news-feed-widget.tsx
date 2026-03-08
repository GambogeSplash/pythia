"use client";

import { useState } from "react";
import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { useEvents } from "@/hooks/use-markets";
import { formatVolume, formatTimeAgo } from "@/lib/format";
import { ChevronDown, Bookmark } from "lucide-react";

export function NewsFeedWidget() {
  const { events, isLoading } = useEvents(8);

  return (
    <Widget
      id="news-feed"
      title="News Feed"
      liveIndicator
      accentColor="#3B82F6"
      icon={<span className="text-xs text-signal-blue">N</span>}
      actions={
        <button className="text-[10px] font-medium text-signal-green hover:underline">
          Customize
        </button>
      }
    >
      {/* Filter dropdowns */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        {["All category", "Volume relevance", "Active only"].map(
          (filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 rounded-full bg-bg-base-2 px-2.5 py-1 text-[10px] text-text-secondary transition-colors duration-150 hover:bg-bg-base-3 hover:text-text-primary"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              {filter}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          )
        )}
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-3 py-3"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-bg-base-3" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-bg-base-2" />
                  <div className="h-4 w-full animate-pulse rounded bg-bg-base-2" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-bg-base-2" />
                </div>
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
            No events available
          </div>
        ) : (
          events.map((event, idx) => (
            <Link
              href={event.markets[0] ? `/dashboard/markets/${event.markets[0].id}` : "#"}
              key={event.id}
              className={`block animate-fade-in stagger-${Math.min(idx + 1, 8)} group/news cursor-pointer px-3 py-3 transition-colors duration-150 hover:bg-action-translucent-hover`}
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              {/* Author row */}
              <div className="flex items-start gap-2.5">
                {/* Avatar / image */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] bg-bg-base-3 text-[10px] font-bold text-text-secondary overflow-hidden">
                  {event.image ? (
                    <img src={event.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "EV"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title + time */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-body-12 font-bold text-text-primary">
                      Polymarket
                    </span>
                    <span className="text-body-12 text-text-quaternary">
                      -- {formatTimeAgo(event.endDate)}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="mt-1 text-[13px] leading-relaxed text-text-primary">
                    {event.title}
                  </p>

                  {event.description && (
                    <p className="mt-1 text-[11px] leading-relaxed text-text-quaternary line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="flex cursor-pointer items-center gap-1 rounded bg-bg-base-3 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                      {event.markets.length} market{event.markets.length !== 1 ? "s" : ""}
                    </span>
                    {event.volume24h > 0 && (
                      <span className="rounded bg-action-rise-dim px-2 py-0.5 text-[10px] font-medium text-action-rise">
                        {formatVolume(event.volume24h)} 24h
                      </span>
                    )}
                    {event.liquidity > 0 && (
                      <span className="rounded bg-bg-base-3 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        {formatVolume(event.liquidity)} liq
                      </span>
                    )}
                    <span className="ml-auto opacity-0 transition-opacity duration-150 group-hover/news:opacity-100">
                      <Bookmark className="h-3.5 w-3.5 text-text-tertiary hover:text-text-secondary" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Widget>
  );
}
