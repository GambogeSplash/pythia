"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Search,
  Filter,
  ArrowUpDown,
  Zap,
  Globe,
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Clock,
  Activity,
  Eye,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Layers,
} from "lucide-react";
import { VenueIcon } from "@/components/icons/venue-icons";
import { useSearchMarkets, useTrendingMarkets, useMarketStats } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import type { Market } from "@/lib/api/types";

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                  */
/* ------------------------------------------------------------------ */

const pageStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const arbCardStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const arbCardItem = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_OPTIONS = ["All", "Crypto", "Sports", "Politics", "Culture", "Science", "Economics"] as const;

const SORT_OPTIONS = [
  ["relevance", "Relevance"],
  ["volume", "Volume"],
  ["closing", "Closing Soon"],
] as const;

/* ------------------------------------------------------------------ */
/*  Mini Sparkline (placeholder from price)                            */
/* ------------------------------------------------------------------ */

function MiniSparkline({ price, positive }: { price: number; positive: boolean }) {
  const w = 72;
  const h = 24;
  const color = positive ? "var(--color-signal-green)" : "var(--color-signal-red)";
  // Generate a simple sparkline from the price value as seed
  const seed = Math.round(price * 100);
  const data = Array.from({ length: 11 }, (_, i) => {
    const base = price * 100;
    const jitter = Math.sin(seed + i * 1.7) * 4 + Math.cos(seed * 0.3 + i * 2.3) * 2;
    return base + jitter;
  });

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = points + ` ${w},${h} 0,${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${seed})`} />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
      />
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2}
        r="2"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = import("framer-motion").then(({ animate }) => {
      animate(mv, value, { duration: 0.8, ease: "easeOut" });
    });
    return () => { controls.then(() => mv.stop()); };
  }, [value, mv]);

  return <motion.span className={className}>{display}</motion.span>;
}

/* ------------------------------------------------------------------ */
/*  Hover Tooltip                                                      */
/* ------------------------------------------------------------------ */

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-bg-base-3 px-2 py-1 text-[10px] font-medium text-text-primary"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function MarketCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[18px] bg-bg-base-1 px-4 py-3"
      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
    >
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-3.5 rounded bg-bg-base-3" />
        <div className="h-4 flex-1 rounded bg-bg-base-3" />
        <div className="h-4 w-14 rounded bg-bg-base-3" />
        <div className="h-6 w-[72px] rounded bg-bg-base-3" />
        <div className="h-6 w-16 rounded bg-bg-base-3" />
      </div>
    </div>
  );
}

function TrendingCardSkeleton() {
  return (
    <div
      className="animate-pulse px-4 py-3"
      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="h-4 flex-1 rounded bg-bg-base-3" />
        <div className="h-4 w-10 rounded bg-bg-base-3" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded bg-bg-base-3" />
        <div className="h-3 w-20 rounded bg-bg-base-3" />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-2 gap-2 rounded-[18px] bg-bg-base-1 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[10px] bg-bg-base-2 p-2.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
          <div className="mb-1 h-3 w-12 rounded bg-bg-base-3" />
          <div className="h-6 w-16 rounded bg-bg-base-3" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CrossVenueSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"relevance" | "volume" | "closing">("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredMarketId, setHoveredMarketId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Real data hooks
  const { markets: searchResults, isLoading: searchLoading } = useSearchMarkets(query, 30);
  const { markets: trendingMarkets, isLoading: trendingLoading } = useTrendingMarkets(10);
  const { stats, isLoading: statsLoading } = useMarketStats();

  // Keyboard shortcut: "/" to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && !searchFocused && document.activeElement?.tagName !== "INPUT") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    if (e.key === "Escape" && searchFocused) {
      searchInputRef.current?.blur();
    }
  }, [searchFocused]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Determine which markets to show: search results (if query >= 2 chars) or trending
  const isSearchActive = query.trim().length >= 2;
  const baseMarkets = isSearchActive ? searchResults : trendingMarkets;
  const isLoadingMarkets = isSearchActive ? searchLoading : trendingLoading;

  const filtered = useMemo(() => {
    let results = baseMarkets;

    if (selectedCategory !== "All") {
      results = results.filter(
        (m) => m.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "volume") {
      results = [...results].sort((a, b) => b.volume24h - a.volume24h);
    } else if (sortBy === "closing") {
      results = [...results].sort((a, b) => {
        const aEnd = new Date(a.endDate).getTime();
        const bEnd = new Date(b.endDate).getTime();
        return aEnd - bEnd;
      });
    }

    return results;
  }, [baseMarkets, selectedCategory, sortBy]);

  // Trending sidebar: top markets by 24h volume from trendingMarkets
  const topTrending = useMemo(() => {
    return [...trendingMarkets]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 8);
  }, [trendingMarkets]);

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" as const }}
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Globe className="h-3 w-3 text-signal-blue" />
          CROSS-VENUE SEARCH
        </div>
        <div className="ml-4 hidden items-center gap-4 md:flex">
          <Tooltip label="Total indexed markets across all venues">
            <div className="flex items-center gap-1 cursor-default">
              <span className="text-[10px] text-text-quaternary">Markets</span>
              {statsLoading ? (
                <span className="h-3 w-8 animate-pulse rounded bg-bg-base-3" />
              ) : (
                <AnimatedNumber value={stats?.totalMarkets ?? 0} className="text-numbers-12 font-medium text-text-primary" />
              )}
            </div>
          </Tooltip>
          <Tooltip label="Connected prediction market platforms">
            <div className="flex items-center gap-1 cursor-default">
              <span className="text-[10px] text-text-quaternary">Venues</span>
              <span className="text-numbers-12 font-medium text-text-primary">1</span>
            </div>
          </Tooltip>
          <Tooltip label="Categories with active markets">
            <div className="flex items-center gap-1 cursor-default">
              <span className="text-[10px] text-text-quaternary">Categories</span>
              {statsLoading ? (
                <span className="h-3 w-6 animate-pulse rounded bg-bg-base-3" />
              ) : (
                <span className="text-numbers-12 font-medium text-signal-amber">{stats?.topCategories?.length ?? 0}</span>
              )}
            </div>
          </Tooltip>
          <Tooltip label="Combined 24h volume across all venues">
            <div className="flex items-center gap-1 cursor-default">
              <span className="text-[10px] text-text-quaternary">Volume 24h</span>
              {statsLoading ? (
                <span className="h-3 w-12 animate-pulse rounded bg-bg-base-3" />
              ) : (
                <span className="text-numbers-12 font-medium text-text-primary">{formatVolume(stats?.totalVolume24h ?? 0)}</span>
              )}
            </div>
          </Tooltip>
          <div className="flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-green" />
            </span>
            <span className="text-numbers-10 font-medium text-signal-green">Live</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex h-6 items-center rounded-[4px] bg-bg-base-2 outline outline-1 -outline-offset-1 outline-divider-heavy">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex h-full items-center px-2 text-[10px] font-medium transition-colors ${
                viewMode === "cards" ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              <Layers className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`flex h-full items-center px-2 text-[10px] font-medium transition-colors ${
                viewMode === "compact" ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              <BarChart3 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div variants={pageStagger} initial="hidden" animate="show" className="min-h-0 flex-1 overflow-auto p-2">
        <div className="flex h-full gap-2">
          {/* Left: search + results */}
          <div className="flex flex-1 flex-col gap-2">
            {/* Search bar + filters */}
            <motion.div
              variants={fadeUp}
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <motion.div
                animate={{
                  boxShadow: searchFocused
                    ? "inset 0 0 0 1.5px var(--color-signal-green), 0 0 20px rgba(0, 255, 133, 0.08)"
                    : "inset 0 0 0 1px var(--color-divider-heavy)",
                }}
                transition={{ duration: 0.2 }}
                className="flex h-11 items-center gap-3 rounded-[10px] bg-bg-base-2 px-4"
              >
                <Search className={`h-4 w-4 shrink-0 transition-colors duration-200 ${searchFocused ? "text-signal-green" : "text-text-quaternary"}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search markets across all venues..."
                  className="flex-1 bg-transparent text-body-12 text-text-primary placeholder-text-quaternary outline-none"
                />
                {query ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setQuery("")}
                    className="text-text-quaternary transition-colors hover:text-text-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                ) : !searchFocused ? (
                  <motion.kbd
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-5 items-center rounded-[4px] bg-bg-base-3 px-1.5 text-[9px] font-medium text-text-muted"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                  >
                    /
                  </motion.kbd>
                ) : null}
                <div className="h-4 w-px bg-divider-heavy" />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 rounded-[6px] px-2 py-1 text-[10px] font-medium uppercase transition-colors ${
                    showFilters
                      ? "bg-signal-blue/10 text-signal-blue"
                      : "text-text-quaternary hover:text-text-secondary"
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  Filters
                  <ChevronDown
                    className={`h-2.5 w-2.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </motion.div>

              {/* Filter chips */}
              <AnimatePresence initial={false}>
                {showFilters && (
                  <motion.div
                    key="filters"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" as const } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2.5">
                      {/* Category filters */}
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] font-medium uppercase text-text-quaternary">
                          Category
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_OPTIONS.map((cat) => (
                            <motion.button
                              key={cat}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setSelectedCategory(cat)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                                selectedCategory === cat
                                  ? "bg-bg-base-3 text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy"
                                  : "text-text-secondary hover:bg-bg-base-2 hover:text-text-primary"
                              }`}
                            >
                              {cat}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {/* Sort */}
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] font-medium uppercase text-text-quaternary">
                          Sort
                        </span>
                        <div className="flex gap-1.5">
                          {SORT_OPTIONS.map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => setSortBy(key as "relevance" | "volume" | "closing")}
                              className={`relative flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                                sortBy === key
                                  ? "text-text-primary"
                                  : "text-text-secondary hover:bg-bg-base-2 hover:text-text-primary"
                              }`}
                            >
                              {sortBy === key && (
                                <motion.span
                                  layoutId="sort-indicator"
                                  className="absolute inset-0 rounded-full bg-bg-base-3 outline outline-1 -outline-offset-1 outline-divider-heavy"
                                  transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative flex items-center gap-1">
                                <ArrowUpDown className="h-2.5 w-2.5" />
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active filter summary */}
              {selectedCategory !== "All" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 flex items-center gap-2 overflow-hidden"
                >
                  <span className="text-[10px] text-text-quaternary">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""} in {selectedCategory}
                  </span>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="text-[10px] text-signal-blue transition-colors hover:text-signal-blue/80"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Results header */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-medium uppercase text-text-quaternary">
                {isSearchActive ? `Search results for "${query}"` : "Trending Markets"}
              </span>
              {isLoadingMarkets && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-3 w-3 animate-spin rounded-full border border-signal-green/30 border-t-signal-green"
                />
              )}
              <span className="text-[10px] text-text-quaternary">
                {!isLoadingMarkets && `${filtered.length} market${filtered.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Results */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
              {/* Loading skeletons */}
              {isLoadingMarkets && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MarketCardSkeleton key={i} />
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {!isLoadingMarkets && filtered.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-1 items-center justify-center rounded-[18px] bg-bg-base-1 py-16"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                  >
                    <div className="text-center">
                      <Search className="mx-auto mb-2 h-6 w-6 text-text-quaternary" />
                      <p className="text-body-12 text-text-secondary">
                        {isSearchActive ? "No markets found" : "No trending markets available"}
                      </p>
                      <p className="text-[11px] text-text-quaternary">
                        {isSearchActive ? "Try different keywords or filters" : "Check back soon for updates"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!isLoadingMarkets && filtered.map((market) => {
                  const probability = Math.round(market.yesPrice * 100);
                  const isPositive = market.yesPrice >= 0.5;
                  const isExpanded = expandedMarketId === market.id;
                  const isWatched = watchlist.has(market.id);

                  return (
                    <motion.div
                      key={market.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, layout: { duration: 0.3 } }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      onHoverStart={() => setHoveredMarketId(market.id)}
                      onHoverEnd={() => setHoveredMarketId(null)}
                      className="group/card rounded-[18px] bg-bg-base-1 transition-shadow duration-200"
                      style={{
                        boxShadow: hoveredMarketId === market.id
                          ? "inset 0 0 0 1px rgba(179,200,224,0.14), 0 0 16px rgba(255,255,255,0.02)"
                          : "inset 0 0 0 1px var(--color-divider-heavy)",
                        transition: "box-shadow 0.2s ease",
                      }}
                    >
                      {/* Market header row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          {/* Watchlist toggle */}
                          <Tooltip label={isWatched ? "Remove from watchlist" : "Add to watchlist"}>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => toggleWatchlist(market.id)}
                              className="flex-shrink-0"
                            >
                              <AnimatePresence mode="wait">
                                {isWatched ? (
                                  <motion.div key="checked" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring" as const, stiffness: 500, damping: 20 }}>
                                    <BookmarkCheck className="h-3.5 w-3.5 text-signal-amber" />
                                  </motion.div>
                                ) : (
                                  <motion.div key="unchecked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <Bookmark className="h-3.5 w-3.5 text-text-muted hover:text-text-quaternary transition-colors" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </Tooltip>

                          <Link
                            href={`/dashboard/markets/${market.id}`}
                            className="truncate text-body-12 font-semibold text-text-primary transition-colors hover:text-signal-green"
                          >
                            {market.question}
                          </Link>

                          <span className="flex-shrink-0 rounded-[4px] bg-bg-base-2 px-1.5 py-0.5 text-[10px] text-text-quaternary">
                            {market.category}
                          </span>

                          <span className="flex-shrink-0 flex items-center gap-1 rounded-[4px] bg-signal-blue/10 px-1.5 py-0.5 text-[10px] text-signal-blue">
                            {(() => {
                              const Icon = VenueIcon[market.venue];
                              return Icon ? <Icon size={10} className="flex-shrink-0" /> : null;
                            })()}
                            {market.venue}
                          </span>
                        </div>

                        {/* Right side: sparkline + stats + expand */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Probability badge */}
                          <div className="flex items-center gap-0.5">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3 text-signal-green" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-signal-red" />
                            )}
                            <span
                              className={`text-numbers-10 font-medium ${
                                isPositive ? "text-signal-green" : "text-signal-red"
                              }`}
                            >
                              {probability}%
                            </span>
                          </div>

                          {/* Sparkline */}
                          <MiniSparkline price={market.yesPrice} positive={isPositive} />

                          {/* YES price */}
                          <div className="flex flex-col items-end">
                            <span className="text-numbers-12 font-semibold text-text-primary">{probability}&cent;</span>
                            <span className="text-[9px] text-text-quaternary">YES</span>
                          </div>

                          {/* Volume badge */}
                          <div className="flex flex-col items-end">
                            <span className="text-numbers-10 font-medium text-text-secondary">{formatVolume(market.volume24h)}</span>
                            <span className="text-[9px] text-text-quaternary">24h vol</span>
                          </div>

                          {/* Quick trade button (hover reveal) */}
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                              opacity: hoveredMarketId === market.id ? 1 : 0,
                              width: hoveredMarketId === market.id ? "auto" : 0,
                            }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <Link
                              href={`/dashboard/markets/${market.id}`}
                              className="flex h-6 items-center gap-1 whitespace-nowrap rounded-[6px] bg-signal-green/10 px-2 text-[10px] font-semibold text-signal-green transition-colors hover:bg-signal-green/15"
                            >
                              <ArrowRight className="h-3 w-3" />
                              Trade
                            </Link>
                          </motion.div>

                          {/* Expand button */}
                          <Tooltip label={isExpanded ? "Collapse" : "Expand details"}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setExpandedMarketId(isExpanded ? null : market.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-base-2 text-text-quaternary transition-colors hover:bg-bg-base-3 hover:text-text-secondary"
                            >
                              <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" as const }}
                                className="flex items-center justify-center"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </motion.span>
                            </motion.button>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" as const }}
                            className="overflow-hidden"
                            style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
                          >
                            <div className="px-4 py-3">
                              {/* Stats row */}
                              <div className="mb-3 flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <BarChart3 className="h-3 w-3 text-text-quaternary" />
                                  <span className="text-[10px] text-text-quaternary">Total Vol</span>
                                  <span className="text-numbers-10 font-medium text-text-primary">
                                    {formatVolume(market.volume)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Activity className="h-3 w-3 text-text-quaternary" />
                                  <span className="text-[10px] text-text-quaternary">24h Vol</span>
                                  <span className="text-numbers-10 font-medium text-text-primary">
                                    {formatVolume(market.volume24h)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-text-quaternary" />
                                  <span className="text-[10px] text-text-quaternary">Ends</span>
                                  <span className="text-numbers-10 font-medium text-text-primary">
                                    {formatTimeLeft(market.endDate)}
                                  </span>
                                </div>
                                <Link
                                  href={`/dashboard/markets/${market.id}`}
                                  className="ml-auto flex items-center gap-1 text-[10px] font-medium text-signal-green transition-colors hover:text-signal-green/80"
                                >
                                  Full details <ArrowRight className="h-3 w-3" />
                                </Link>
                              </div>

                              {/* Price detail table */}
                              <div className="rounded-[10px] bg-bg-base-2" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                                <div className="grid grid-cols-[1fr_80px_80px_100px_100px] items-center gap-2 px-3 py-1.5 text-[9px] font-medium uppercase text-text-quaternary">
                                  <span>Venue</span>
                                  <span className="text-right">YES</span>
                                  <span className="text-right">NO</span>
                                  <span className="text-right">Volume</span>
                                  <span className="text-right">Liquidity</span>
                                </div>
                                <motion.div
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05, duration: 0.2 }}
                                  className="grid grid-cols-[1fr_80px_80px_100px_100px] items-center gap-2 px-3 py-2 transition-colors duration-150 hover:bg-action-translucent-hover"
                                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {(() => {
                                      const Icon = VenueIcon[market.venue];
                                      return Icon ? <Icon size={14} className="flex-shrink-0" /> : (
                                        <span className="h-2 w-2 rounded-full flex-shrink-0 bg-chart-purple" />
                                      );
                                    })()}
                                    <span className="text-body-12 text-text-secondary capitalize">{market.venue}</span>
                                  </div>
                                  <span className="text-right text-numbers-12 font-medium text-signal-green">
                                    {Math.round(market.yesPrice * 100)}&cent;
                                  </span>
                                  <span className="text-right text-numbers-12 font-medium text-text-primary">
                                    {Math.round(market.noPrice * 100)}&cent;
                                  </span>
                                  <span className="text-right text-numbers-10 text-text-secondary">
                                    {formatVolume(market.volume)}
                                  </span>
                                  <span className="text-right text-numbers-10 text-text-quaternary">
                                    {formatVolume(market.liquidity)}
                                  </span>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Trending + Stats Panel */}
          <motion.div variants={fadeUp} className="hidden w-72 shrink-0 flex-col gap-2 lg:flex">
            {/* Quick stats */}
            {statsLoading ? (
              <StatsSkeleton />
            ) : (
              <div
                className="grid grid-cols-2 gap-2 rounded-[18px] bg-bg-base-1 p-3"
                style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
              >
                <motion.div whileHover={{ scale: 1.03, y: -1 }} transition={{ duration: 0.15 }} className="rounded-[10px] bg-bg-base-2 p-2.5 cursor-default" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                  <div className="text-[9px] font-medium uppercase text-text-quaternary">Markets</div>
                  <div className="text-numbers-12 font-semibold text-text-primary">
                    <AnimatedNumber value={stats?.totalMarkets ?? 0} />
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} transition={{ duration: 0.15 }} className="rounded-[10px] bg-bg-base-2 p-2.5 cursor-default" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                  <div className="text-[9px] font-medium uppercase text-text-quaternary">Watchlist</div>
                  <motion.div key={watchlist.size} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-numbers-12 font-semibold text-text-primary">{watchlist.size}</motion.div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} transition={{ duration: 0.15 }} className="rounded-[10px] bg-bg-base-2 p-2.5 cursor-default" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                  <div className="text-[9px] font-medium uppercase text-text-quaternary">24h Volume</div>
                  <div className="text-numbers-12 font-semibold text-signal-green">
                    {formatVolume(stats?.totalVolume24h ?? 0)}
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} transition={{ duration: 0.15 }} className="rounded-[10px] bg-bg-base-2 p-2.5 cursor-default" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                  <div className="text-[9px] font-medium uppercase text-text-quaternary">Liquidity</div>
                  <div className="text-numbers-12 font-semibold text-signal-blue">
                    {formatVolume(stats?.totalLiquidity ?? 0)}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Trending Markets */}
            <div
              className="flex flex-1 flex-col rounded-[18px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-10 items-center gap-2 px-4 text-body-12 font-semibold text-text-primary"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <Zap className="h-3.5 w-3.5 text-signal-amber" />
                Trending Markets
                <span className="ml-auto rounded-full bg-signal-amber/10 px-2 py-0.5 text-numbers-10 font-semibold text-signal-amber">
                  {topTrending.length}
                </span>
              </div>

              <motion.div
                variants={arbCardStagger}
                initial="hidden"
                animate="show"
                className="scrollbar-hide flex-1 overflow-y-auto"
              >
                {trendingLoading && (
                  <div className="flex flex-col">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TrendingCardSkeleton key={i} />
                    ))}
                  </div>
                )}

                {!trendingLoading && topTrending.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex flex-col items-center justify-center px-4 py-8 text-center"
                  >
                    <AlertTriangle className="mb-2 h-5 w-5 text-text-quaternary" />
                    <p className="text-body-12 text-text-secondary">No trending markets</p>
                    <p className="text-[10px] text-text-quaternary">Check back soon for updates</p>
                  </motion.div>
                )}

                {!trendingLoading && topTrending.map((market) => {
                  const probability = Math.round(market.yesPrice * 100);
                  const isPositive = market.yesPrice >= 0.5;

                  return (
                    <motion.div
                      key={market.id}
                      variants={arbCardItem}
                      whileHover={{ backgroundColor: "rgba(0,255,133,0.02)", x: 2 }}
                      className="px-4 py-3 transition-colors cursor-pointer"
                      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Link
                          href={`/dashboard/markets/${market.id}`}
                          className="text-body-12 font-medium text-text-primary transition-colors hover:text-signal-green leading-tight"
                        >
                          {market.question}
                        </Link>
                        <span className="flex-shrink-0 rounded-[4px] bg-bg-base-2 px-1.5 py-0.5 text-[9px] text-text-quaternary">
                          {market.category}
                        </span>
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <span className={`flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-bold ${
                          isPositive ? "bg-signal-green/10 text-signal-green" : "bg-signal-red/10 text-signal-red"
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-2.5 w-2.5" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5" />
                          )}
                          {probability}%
                        </span>
                        <span className="text-[9px] text-text-quaternary">
                          {formatVolume(market.volume24h)} 24h
                        </span>
                      </div>

                      {/* Volume + time bar */}
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] text-text-quaternary">
                          <BarChart3 className="h-2.5 w-2.5" />
                          {formatVolume(market.volume)} total
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-quaternary">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTimeLeft(market.endDate)}
                        </span>
                      </div>

                      {/* Progress bar based on probability */}
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg-base-2">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: isPositive
                              ? "linear-gradient(90deg, var(--color-signal-green), var(--color-signal-green))"
                              : "linear-gradient(90deg, var(--color-signal-red), var(--color-signal-red))",
                            opacity: 0.6,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${probability}%` }}
                          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
                        />
                      </div>

                      {/* Quick action */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2"
                      >
                        <Link
                          href={`/dashboard/markets/${market.id}`}
                          className="flex h-6 w-full items-center justify-center gap-1 rounded-[6px] bg-signal-green/10 text-[10px] font-semibold text-signal-green transition-colors hover:bg-signal-green/15"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Market
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Bottom: top categories */}
              <div className="px-4 py-3" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
                <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">Top Categories</div>
                <motion.div
                  className="flex flex-wrap gap-x-3 gap-y-1"
                  variants={pageStagger}
                  initial="hidden"
                  animate="show"
                >
                  {(stats?.topCategories ?? []).slice(0, 6).map((cat) => (
                    <motion.span
                      key={cat.name}
                      variants={scaleIn}
                      whileHover={{ scale: 1.08, x: 2 }}
                      onClick={() => setSelectedCategory(cat.name)}
                      className="flex items-center gap-1.5 text-[10px] text-text-quaternary transition-colors hover:text-text-secondary cursor-pointer"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
                      {cat.name}
                      <span className="text-[8px] text-text-muted">({cat.count})</span>
                    </motion.span>
                  ))}
                </motion.div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-quaternary">
                  <span className="text-signal-green">*</span> Powered by Polymarket
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
