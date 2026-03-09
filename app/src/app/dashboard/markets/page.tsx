"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  Activity,
  Clock,
  BarChart3,
  Flame,
  ChevronRight,
  SlidersHorizontal,
  Zap,
  Timer,
  Star,
  Eye,
  Package,
  Loader2,
} from "lucide-react";
import { VENUE_LOGOS } from "@/components/ui/venue-logos";
import {
  useMarkets,
  useTrendingMarkets,
  useSearchMarkets,
  useMarketStats,
} from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import type { Market } from "@/lib/api/types";

// ── Animation Variants ──────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const cardHover = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

type Category = "All" | "Politics" | "Crypto" | "Sports" | "Macro" | "Culture" | "Science";
type SortOption = "trending" | "volume" | "newest" | "closing-soon";

// ── Mini sparkline SVG ──────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 64;
  const h = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const color = positive ? "var(--color-signal-green)" : "var(--color-signal-red)";
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      <polygon fill={color} opacity="0.08" points={areaPoints} />
    </svg>
  );
}

// ── Probability Bar ─────────────────────────────────────────────────────────

function ProbabilityBar({ yesPrice }: { yesPrice: number }) {
  const yesPct = Math.round(yesPrice * 100);
  const noPct = 100 - yesPct;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-bg-base-3">
        <motion.div
          className="h-full rounded-full bg-signal-green"
          initial={{ width: 0 }}
          animate={{ width: `${yesPct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-numbers-10">
        <span className="text-signal-green">{yesPct}%</span>
        <span className="text-text-muted">/</span>
        <span className="text-signal-red">{noPct}%</span>
      </div>
    </div>
  );
}

// ── Venue Badge ─────────────────────────────────────────────────────────────

function VenueBadge({ venueId }: { venueId: string }) {
  const Logo = VENUE_LOGOS[venueId];
  if (Logo) {
    return <Logo size={16} />;
  }
  return (
    <span className="flex h-4 items-center rounded-[3px] bg-bg-base-3 px-1.5 text-label-9 text-text-quaternary">
      {venueId}
    </span>
  );
}

// ── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-[14px] bg-bg-base-2 animate-pulse"
      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
    >
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 rounded bg-bg-base-3" />
          <div className="h-3 w-10 rounded bg-bg-base-3" />
        </div>
        <div className="mt-2 h-4 w-full rounded bg-bg-base-3" />
        <div className="mt-1 h-4 w-2/3 rounded bg-bg-base-3" />
      </div>
      <div className="px-3 pt-3">
        <div className="h-1.5 w-full rounded-full bg-bg-base-3" />
      </div>
      <div className="flex items-center justify-between px-3 pt-3 pb-3">
        <div className="h-4 w-16 rounded bg-bg-base-3" />
        <div className="h-6 w-16 rounded bg-bg-base-3" />
      </div>
      <div className="border-t border-divider-thin px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="h-3 w-12 rounded bg-bg-base-3" />
          <div className="h-3 w-12 rounded bg-bg-base-3" />
        </div>
      </div>
    </div>
  );
}

// ── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["All", "Politics", "Crypto", "Sports", "Macro", "Culture", "Science"];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  All: <BarChart3 className="h-3 w-3" />,
  Politics: <Star className="h-3 w-3" />,
  Crypto: <Zap className="h-3 w-3" />,
  Sports: <Activity className="h-3 w-3" />,
  Macro: <TrendingUp className="h-3 w-3" />,
  Culture: <Eye className="h-3 w-3" />,
  Science: <Package className="h-3 w-3" />,
};

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "trending", label: "Trending", icon: <Flame className="h-3 w-3" /> },
  { value: "volume", label: "Volume", icon: <BarChart3 className="h-3 w-3" /> },
  { value: "newest", label: "Newest", icon: <Clock className="h-3 w-3" /> },
  { value: "closing-soon", label: "Closing Soon", icon: <Timer className="h-3 w-3" /> },
];

function sortToApiMode(sort: SortOption): "trending" | "new" | "closing" {
  switch (sort) {
    case "trending":
    case "volume":
      return "trending";
    case "newest":
      return "new";
    case "closing-soon":
      return "closing";
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function MarketsIndexPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  // API hooks
  const { markets: trendingMarkets, isLoading: trendingLoading } = useTrendingMarkets(4);

  const apiMode = sortToApiMode(sortBy);
  const {
    markets: browseMarkets,
    isLoading: browseLoading,
    meta: browseMeta,
  } = useMarkets(
    activeCategory === "All"
      ? { limit: LIMIT, offset, mode: apiMode }
      : { limit: LIMIT, offset, mode: "category", category: activeCategory }
  );

  const { markets: searchResults, isLoading: searchLoading } = useSearchMarkets(searchQuery, LIMIT);
  const { stats, isLoading: statsLoading } = useMarketStats();

  // Determine which markets to show
  const isSearching = searchQuery.trim().length >= 2;

  const displayMarkets = useMemo(() => {
    if (isSearching) return searchResults;
    return browseMarkets;
  }, [isSearching, searchResults, browseMarkets]);

  const isLoading = isSearching ? searchLoading : browseLoading;
  const hasMore = displayMarkets.length >= LIMIT;

  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Accumulate markets across pages
  const visibleMarkets = useMemo(() => {
    if (offset === 0) return displayMarkets;
    // Merge previously loaded with current
    const seen = new Set(allMarkets.map((m) => m.id));
    const merged = [...allMarkets];
    for (const m of displayMarkets) {
      if (!seen.has(m.id)) {
        merged.push(m);
        seen.add(m.id);
      }
    }
    return merged;
  }, [displayMarkets, allMarkets, offset]);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setAllMarkets(visibleMarkets);
    setOffset((prev) => prev + LIMIT);
    // Loading state will be cleared when new data arrives
    setTimeout(() => setIsLoadingMore(false), 1000);
  }, [visibleMarkets]);

  const handleCategoryChange = useCallback((cat: Category) => {
    setActiveCategory(cat);
    setOffset(0);
    setAllMarkets([]);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setOffset(0);
    setAllMarkets([]);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setOffset(0);
    setAllMarkets([]);
  }, []);

  // Stats
  const totalMarkets = stats?.totalMarkets ?? "--";
  const totalVolume = stats ? formatVolume(stats.totalVolume24h) : "--";
  const totalLiquidity = stats ? formatVolume(stats.totalLiquidity) : "--";

  return (
    <div className="flex h-full flex-col">
      {/* ── Sub-header strip ── */}
      <div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex h-6 items-center rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          MARKETS
        </div>
        <div className="ml-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-caption-10 text-text-quaternary">Total Markets</span>
            <span className="text-numbers-12 font-medium text-text-primary">{totalMarkets}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-caption-10 text-text-quaternary">24h Volume</span>
            <span className="text-numbers-12 font-medium text-signal-green">{totalVolume}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-caption-10 text-text-quaternary">Liquidity</span>
            <span className="text-numbers-12 font-medium text-text-primary">{totalLiquidity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-green" />
            </span>
            <span className="text-caption-10 font-medium text-signal-green">Live</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <motion.div
          className="flex flex-col gap-2"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* ── Featured / Trending Section ── */}
          {activeCategory === "All" && !isSearching && (
            <motion.div
              variants={fadeUp}
              className="rounded-[18px] bg-bg-base-1"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div
                className="flex h-10 items-center gap-2 px-4"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <Flame className="h-4 w-4 text-signal-amber" />
                <span className="text-body-12 font-semibold text-text-primary">
                  Trending Markets
                </span>
                <span className="rounded-full bg-signal-amber/10 px-1.5 py-0.5 text-label-9 font-bold text-signal-amber">
                  HOT
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : trendingMarkets.map((market, idx) => (
                      <motion.div
                        key={market.id}
                        variants={scaleIn}
                        initial="hidden"
                        animate="show"
                        whileHover="hover"
                        className="group"
                        custom={idx}
                      >
                        <Link href={`/dashboard/markets/${market.id}`}>
                          <motion.div
                            variants={cardHover}
                            className="relative flex flex-col overflow-hidden rounded-[14px] bg-bg-base-2 p-3 transition-colors duration-200 group-hover:bg-bg-base-3"
                            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                            whileHover={{
                              boxShadow: "inset 0 0 0 1px rgba(0,255,133,0.3), 0 0 20px rgba(0,255,133,0.05)",
                            }}
                          >
                            {/* Rank badge */}
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-signal-amber/10 text-label-9 font-bold text-signal-amber">
                              #{idx + 1}
                            </div>
                            {/* Category */}
                            <span className="text-label-10 text-text-quaternary">
                              {market.category}
                            </span>
                            {/* Name */}
                            <h3 className="mt-1 text-body-12 font-semibold leading-snug text-text-primary line-clamp-2 pr-6">
                              {market.question}
                            </h3>
                            {/* Probability */}
                            <div className="mt-2.5">
                              <ProbabilityBar yesPrice={market.yesPrice} />
                            </div>
                            {/* Price + Volume */}
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-numbers-12 font-semibold text-text-primary">
                                  {Math.round(market.yesPrice * 100)}¢
                                </span>
                                <span className="flex items-center text-numbers-10 text-text-quaternary">
                                  <BarChart3 className="mr-0.5 h-2.5 w-2.5" />
                                  {formatVolume(market.volume24h)}
                                </span>
                              </div>
                            </div>
                            {/* Meta row */}
                            <div className="mt-2.5 flex items-center gap-3 border-t border-divider-thin pt-2">
                              <div className="flex items-center gap-1 text-text-quaternary">
                                <BarChart3 className="h-3 w-3" />
                                <span className="text-numbers-10">{formatVolume(market.volume)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-text-quaternary">
                                <Clock className="h-3 w-3" />
                                <span className="text-numbers-10">{formatTimeLeft(market.endDate)}</span>
                              </div>
                              <div className="ml-auto flex items-center gap-1">
                                <VenueBadge venueId={market.venue} />
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          )}

          {/* ── Browse Section ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            {/* ── Header: Categories + Search + Sort ── */}
            <div
              className="flex flex-col gap-3 px-4 py-3"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              {/* Top row: category tabs + search */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Category tabs */}
                <div className="flex items-center gap-0.5 rounded-[8px] bg-bg-base-2 p-0.5" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`relative flex items-center gap-1 rounded-[6px] px-2.5 py-1 text-body-12 font-medium transition-colors duration-150 ${
                        activeCategory === cat
                          ? "text-text-primary"
                          : "text-text-quaternary hover:text-text-secondary"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {activeCategory === cat && (
                        <motion.div
                          layoutId="category-indicator"
                          className="absolute inset-0 rounded-[6px] bg-bg-base-3"
                          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                          transition={{ type: "spring" as const, stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1">
                        {CATEGORY_ICONS[cat]}
                        {cat}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative ml-auto min-w-[220px]">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <motion.input
                    type="text"
                    placeholder="Search markets..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="h-7 w-full rounded-[6px] bg-bg-base-2 pl-8 pr-3 text-body-12 text-text-primary placeholder-text-muted outline-none transition-all duration-200"
                    animate={{
                      boxShadow: searchFocused
                        ? "inset 0 0 0 1px rgba(0,255,133,0.5), 0 0 12px rgba(0,255,133,0.08)"
                        : "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              {/* Bottom row: sort options + result count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3 text-text-muted" />
                  <span className="mr-1 text-caption-10 text-text-quaternary">Sort:</span>
                  {SORT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-caption-10 font-medium transition-colors duration-150 ${
                        sortBy === opt.value
                          ? "bg-signal-green/10 text-signal-green"
                          : "text-text-quaternary hover:bg-action-translucent-hover hover:text-text-primary"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {opt.icon}
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
                <span className="text-caption-10 text-text-quaternary">
                  {visibleMarkets.length} market{visibleMarkets.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* ── Market Cards Grid ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${sortBy}-${searchQuery}`}
                variants={stagger}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="p-3"
              >
                {isLoading && visibleMarkets.length === 0 ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : visibleMarkets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {visibleMarkets.map((market) => (
                      <motion.div key={market.id} variants={fadeUp}>
                        <MarketCard market={market} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    variants={fadeUp}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-base-2" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                      <Search className="h-7 w-7 text-text-muted" />
                    </div>
                    <p className="mt-4 text-body-12 font-medium text-text-secondary">
                      No markets found
                    </p>
                    <p className="mt-1 text-body-12 text-text-quaternary">
                      Try adjusting your search or category filter
                    </p>
                    <motion.button
                      onClick={() => {
                        handleSearchChange("");
                        handleCategoryChange("All");
                      }}
                      className="mt-4 flex items-center gap-1 rounded-[6px] bg-bg-base-2 px-3 py-1.5 text-body-12 font-medium text-text-secondary transition-colors hover:text-text-primary"
                      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Clear filters
                    </motion.button>
                  </motion.div>
                )}

                {/* ── Load More ── */}
                {hasMore && visibleMarkets.length > 0 && !isSearching && (
                  <div className="mt-4 flex justify-center">
                    <motion.button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 rounded-[8px] bg-bg-base-2 px-5 py-2 text-body-12 font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                      whileHover={{ scale: 1.03, boxShadow: "inset 0 0 0 1px rgba(0,255,133,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load more markets
                          <ChevronRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Market Card Component ───────────────────────────────────────────────────

function MarketCard({ market }: { market: Market }) {
  const yesPct = Math.round(market.yesPrice * 100);
  const timeLeft = formatTimeLeft(market.endDate);
  const isClosingSoon = timeLeft !== "Ended" && !timeLeft.includes("d");

  return (
    <Link href={`/dashboard/markets/${market.id}`}>
      <motion.div
        className="group relative flex flex-col rounded-[14px] bg-bg-base-2 transition-colors duration-200 hover:bg-bg-base-3"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
        initial="rest"
        whileHover="hover"
        variants={cardHover}
        whileTap={{ scale: 0.995 }}
      >
        {/* Hover glow overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[14px]"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{ boxShadow: "inset 0 0 0 1px rgba(0,255,133,0.25), 0 0 16px rgba(0,255,133,0.04)" }}
        />

        {/* Top section */}
        <div className="p-3 pb-0">
          {/* Category + closing soon badge */}
          <div className="flex items-center justify-between">
            <span className="text-label-10 text-text-quaternary">
              {market.category}
            </span>
            {isClosingSoon ? (
              <span className="flex items-center gap-0.5 rounded-[3px] bg-signal-amber/10 px-1.5 py-0.5 text-label-9 font-bold text-signal-amber">
                <Timer className="h-2.5 w-2.5" />
                {timeLeft}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-label-9 text-text-muted">
                <Clock className="h-2.5 w-2.5" />
                {timeLeft}
              </span>
            )}
          </div>

          {/* Market name */}
          <h3 className="mt-1.5 text-body-12 font-semibold leading-snug text-text-primary line-clamp-2 group-hover:text-signal-green transition-colors duration-200">
            {market.question}
          </h3>
        </div>

        {/* Probability */}
        <div className="px-3 pt-2.5">
          <ProbabilityBar yesPrice={market.yesPrice} />
        </div>

        {/* Price + volume */}
        <div className="flex items-center justify-between px-3 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-numbers-12 font-semibold text-text-primary">
              {yesPct}¢
            </span>
            <span className="flex items-center gap-0.5 text-numbers-10 text-text-quaternary">
              <BarChart3 className="h-2.5 w-2.5" />
              {formatVolume(market.volume24h)} 24h
            </span>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-auto flex items-center gap-2.5 border-t border-divider-thin px-3 py-2 mt-2.5">
          <div className="flex items-center gap-1 text-text-quaternary" title="Total Volume">
            <BarChart3 className="h-3 w-3" />
            <span className="text-numbers-10">{formatVolume(market.volume)}</span>
          </div>
          <div className="flex items-center gap-1 text-text-quaternary" title="Liquidity">
            <Activity className="h-3 w-3" />
            <span className="text-numbers-10">{formatVolume(market.liquidity)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <VenueBadge venueId={market.venue} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
