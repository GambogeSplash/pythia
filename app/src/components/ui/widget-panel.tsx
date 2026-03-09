"use client";

import { useRef, useState } from "react";
import { X, Check, Activity, Zap, Newspaper, Users, Clock, TrendingUp, Trophy, Wallet, Calendar, AlertTriangle, CandlestickChart, Layers, BarChart3, Sparkles, Heart, GitBranch, BookOpen, Star, List, Crosshair, LayoutGrid, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_WIDGETS } from "@/lib/widget-registry";
import { useAppStore } from "@/lib/store";

interface WidgetMeta {
  icon: React.ReactNode;
  description: string;
  accent: string;
  liveIndicator?: boolean;
}

const WIDGET_META: Record<string, WidgetMeta> = {
  signal: { icon: <Activity className="h-5 w-5" />, description: "Live signal heatmap with volatility & momentum", accent: "#00FF85", liveIndicator: true },
  "mm-opportunities": { icon: <Zap className="h-5 w-5" />, description: "Top market making reward opportunities", accent: "#FFB800" },
  "news-feed": { icon: <Newspaper className="h-5 w-5" />, description: "Aggregated news from Twitter, Reddit, media", accent: "#3B82F6", liveIndicator: true },
  "traders-activity": { icon: <Users className="h-5 w-5" />, description: "Real-time trader bets and PnL feed", accent: "#2DD4BF", liveIndicator: true },
  "market-chart": { icon: <CandlestickChart className="h-5 w-5" />, description: "Custom SVG probability chart", accent: "#00FF85" },
  "tv-chart": { icon: <BarChart3 className="h-5 w-5" />, description: "TradingView live candlestick chart", accent: "#00FF85", liveIndicator: true },
  "closing-soon": { icon: <Clock className="h-5 w-5" />, description: "Markets expiring within 24 hours", accent: "#FF3B3B" },
  "new-markets": { icon: <Sparkles className="h-5 w-5" />, description: "Recently launched prediction markets", accent: "#854DFF" },
  calendar: { icon: <Calendar className="h-5 w-5" />, description: "Upcoming events & market expiries", accent: "#3B82F6" },
  leaderboard: { icon: <Trophy className="h-5 w-5" />, description: "Top traders ranked by performance", accent: "#FFB800" },
  pnl: { icon: <TrendingUp className="h-5 w-5" />, description: "Your profit and loss overview", accent: "#00FF85", liveIndicator: true },
  trending: { icon: <TrendingUp className="h-5 w-5" />, description: "Markets trending by volume & momentum", accent: "#00FF85", liveIndicator: true },
  anomaly: { icon: <AlertTriangle className="h-5 w-5" />, description: "Whale alerts, insider signals, anomalies", accent: "#FF3B3B", liveIndicator: true },
  portfolio: { icon: <Wallet className="h-5 w-5" />, description: "Your positions and exposure breakdown", accent: "#2DD4BF" },
  sentiment: { icon: <Heart className="h-5 w-5" />, description: "NLP sentiment scores & price divergence", accent: "#9B59FF", liveIndicator: true },
  correlation: { icon: <GitBranch className="h-5 w-5" />, description: "Cross-market correlation explorer", accent: "#4DA6FF" },
  narrative: { icon: <BookOpen className="h-5 w-5" />, description: "News-to-price impact tracker", accent: "#FFB800", liveIndicator: true },
  "ai-signals": { icon: <Sparkles className="h-5 w-5" />, description: "AI-powered trading signals & predictions", accent: "#9B59FF", liveIndicator: true },
  watchlist: { icon: <Star className="h-5 w-5" />, description: "Track your favorite markets with sparklines", accent: "#FFB800" },
  orderbook: { icon: <BarChart3 className="h-5 w-5" />, description: "Live bid/ask depth visualization", accent: "#00FF85", liveIndicator: true },
  positions: { icon: <Wallet className="h-5 w-5" />, description: "Open positions, PnL & risk exposure", accent: "#2DD4BF" },
  screener: { icon: <List className="h-5 w-5" />, description: "Filter & sort markets by key metrics", accent: "#3B82F6" },
  "ticker-tape": { icon: <Activity className="h-5 w-5" />, description: "Scrolling live market ticker", accent: "#00FF85", liveIndicator: true },
  heatmap: { icon: <LayoutGrid className="h-5 w-5" />, description: "Visual market heatmap by category", accent: "#FF3B3B" },
};

export function WidgetPanel() {
  const widgetPanelOpen = useAppStore((s) => s.widgetPanelOpen);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const dashboardWidgets = useAppStore((s) => s.dashboardWidgets);
  const addWidget = useAppStore((s) => s.addWidget);
  const removeWidget = useAppStore((s) => s.removeWidget);
  const setDraggingFromPanel = useAppStore((s) => s.setDraggingFromPanel);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredWidgets = searchTerm
    ? ALL_WIDGETS.filter((w) => {
        const term = searchTerm.toLowerCase();
        const meta = WIDGET_META[w.id];
        return (
          w.title.toLowerCase().includes(term) ||
          (meta?.description ?? "").toLowerCase().includes(term)
        );
      })
    : ALL_WIDGETS;

  if (!widgetPanelOpen) return null;

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: typeof window !== "undefined" && window.innerWidth < 640 ? window.innerWidth : 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="relative z-40 flex h-full flex-shrink-0 flex-col overflow-hidden bg-bg-base-1"
      style={{
        boxShadow: "inset 1px 0 0 0 var(--color-divider-heavy)",
      }}
    >
      {/* Header */}
      <div
        className="flex h-10 items-center justify-between px-4"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-signal-green/12 text-signal-green">
            <Layers className="h-3 w-3" />
          </div>
          <span className="text-body-12 font-semibold text-text-primary">Widgets</span>
          <span className="rounded-full bg-bg-base-2 px-1.5 py-0.5 text-numbers-10 text-text-quaternary">
            {searchTerm
              ? `${filteredWidgets.length} of ${ALL_WIDGETS.length}`
              : `${dashboardWidgets.length}/${ALL_WIDGETS.length}`}
          </span>
        </div>
        <button
          onClick={() => setWidgetPanelOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Instruction */}
      <div className="px-4 py-2">
        <span className="text-[10px] text-text-quaternary">
          Drag to dashboard or click to toggle
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div
          className="relative flex items-center rounded-[6px] bg-bg-base-2 h-7 px-2 focus-within:ring-1 focus-within:ring-signal-green/30"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <Search className="h-3 w-3 text-text-quaternary flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search widgets..."
            className="ml-1.5 flex-1 bg-transparent text-body-12 text-text-primary placeholder:text-text-quaternary outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-text-quaternary transition-colors hover:text-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Widget grid */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-2 pb-4">
        {filteredWidgets.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-12 text-text-quaternary">No widgets found</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredWidgets.map((w) => {
              const meta = WIDGET_META[w.id];
              const isActive = dashboardWidgets.includes(w.id);

              return (
                <WidgetCard
                  key={w.id}
                  widget={w}
                  meta={meta}
                  isActive={isActive}
                  onToggle={() => (isActive ? removeWidget(w.id) : addWidget(w.id))}
                  onDragStart={() => setDraggingFromPanel(true)}
                  onDragEnd={() => {
                    setDraggingFromPanel(false);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2"
        style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
      >
        <button
          onClick={() => {
            ALL_WIDGETS.forEach((w) => {
              if (!dashboardWidgets.includes(w.id)) addWidget(w.id);
            });
          }}
          className="flex h-7 w-full items-center justify-center rounded-[6px] bg-action-translucent text-body-12 font-medium text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
        >
          Add All
        </button>
      </div>
    </motion.aside>
  );
}

function WidgetCard({
  widget,
  meta,
  isActive,
  onToggle,
  onDragStart: onDragStartProp,
  onDragEnd: onDragEndProp,
}: {
  widget: { id: string; title: string };
  meta: WidgetMeta | undefined;
  isActive: boolean;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("widget-id", widget.id);
    e.dataTransfer.effectAllowed = "copy";
    onDragStartProp();
    // Create a styled drag ghost
    const ghost = document.createElement("div");
    ghost.textContent = widget.title;
    ghost.style.cssText = "position:fixed;top:-200px;padding:8px 16px;border-radius:12px;background:#0F1012;color:#f0f0f0;font-size:12px;font-weight:600;border:1px solid rgba(0,255,133,0.3);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px rgba(0,255,133,0.1);white-space:nowrap;pointer-events:none;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    requestAnimationFrame(() => ghost.remove());
  };

  return (
    <button
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEndProp}
      onClick={onToggle}
      className={`group relative flex flex-col rounded-[10px] p-3 text-left transition-all duration-150 ${
        isActive
          ? "bg-signal-green/[0.06]"
          : "hover:bg-bg-base-2"
      }`}
      style={{
        boxShadow: isActive
          ? "inset 0 0 0 1px rgba(0,255,133,0.2)"
          : "inset 0 0 0 1px var(--color-divider-heavy)",
        cursor: "grab",
      }}
    >
      {/* Live indicator */}
      {meta?.liveIndicator && (
        <div className="absolute right-2 top-2">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: meta.accent }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: meta.accent }}
            />
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors duration-150"
        style={{
          backgroundColor: isActive
            ? `${meta?.accent ?? "#00FF85"}20`
            : "var(--color-bg-base-2)",
          color: isActive
            ? meta?.accent ?? "#00FF85"
            : "var(--color-text-tertiary)",
        }}
      >
        {meta?.icon ?? <BarChart3 className="h-5 w-5" />}
      </div>

      {/* Title */}
      <span className="text-body-12 font-semibold text-text-primary leading-tight">
        {widget.title}
      </span>

      {/* Description */}
      <span className="mt-0.5 text-[10px] leading-tight text-text-quaternary">
        {meta?.description ?? "Widget"}
      </span>

      {/* Active check */}
      {isActive && (
        <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-signal-green">
          <Check className="h-2.5 w-2.5 text-bg-base-0" />
        </div>
      )}
    </button>
  );
}
