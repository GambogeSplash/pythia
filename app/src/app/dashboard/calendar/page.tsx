"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Vote,
  BarChart3,
  Trophy,
  Zap,
  Timer,
  Eye,
  ArrowUpRight,
  Crosshair,
  CalendarDays,
  LayoutGrid,
  Rows3,
  Target,
  Activity,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClosingSoonMarkets, useEvents } from "@/hooks/use-markets";
import { formatVolume, formatTimeLeft } from "@/lib/format";

/* ────────────────────────────────────────────
   ANIMATION VARIANTS
   ──────────────────────────────────────────── */

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.015 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const cellVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const panelSlide = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

const monthTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

type EventType =
  | "market_expiry"
  | "economic"
  | "political"
  | "earnings"
  | "sports";

type ViewMode = "month" | "week";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string;
  marketId: string;
  relatedMarkets: number;
  description: string;
  impact: "high" | "medium" | "low";
}

/* ────────────────────────────────────────────
   EVENT TYPE CONFIG
   ──────────────────────────────────────────── */

const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }
> = {
  market_expiry: {
    label: "Market Expiry",
    color: "text-signal-green",
    bg: "bg-signal-green/10",
    dot: "var(--color-signal-green)",
    icon: <Timer className="h-3.5 w-3.5" />,
  },
  economic: {
    label: "Economic Data",
    color: "text-signal-blue",
    bg: "bg-signal-blue/10",
    dot: "var(--color-signal-blue)",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
  },
  political: {
    label: "Political Event",
    color: "text-signal-amber",
    bg: "bg-signal-amber/10",
    dot: "var(--color-signal-amber)",
    icon: <Vote className="h-3.5 w-3.5" />,
  },
  earnings: {
    label: "Earnings",
    color: "text-chart-purple",
    bg: "bg-chart-purple/10",
    dot: "var(--color-chart-purple)",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
  sports: {
    label: "Sports",
    color: "text-signal-teal",
    bg: "bg-signal-teal/10",
    dot: "var(--color-signal-teal)",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
};

/* ────────────────────────────────────────────
   CATEGORY → EVENT TYPE MAPPING
   ──────────────────────────────────────────── */

function categoryToEventType(category: string): EventType {
  const lower = (category || "").toLowerCase();
  if (lower.includes("politic") || lower.includes("election")) return "political";
  if (lower.includes("sport") || lower.includes("nba") || lower.includes("nfl") || lower.includes("ufc")) return "sports";
  if (lower.includes("earning") || lower.includes("business")) return "earnings";
  if (lower.includes("econ") || lower.includes("macro") || lower.includes("fed") || lower.includes("finance")) return "economic";
  return "market_expiry";
}

/* ────────────────────────────────────────────
   UTILITY HELPERS
   ──────────────────────────────────────────── */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getCountdown(dateStr: string, timeStr: string): string {
  const target = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Passed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function getWeekDates(year: number, month: number, day: number): { year: number; month: number; day: number }[] {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - dayOfWeek);
  const dates: { year: number; month: number; day: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
  }
  return dates;
}

/* ────────────────────────────────────────────
   IMPACT BADGE
   ──────────────────────────────────────────── */

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const cfg = {
    high: { label: "HIGH", color: "text-signal-red", bg: "bg-signal-red/10" },
    medium: { label: "MED", color: "text-signal-amber", bg: "bg-signal-amber/10" },
    low: { label: "LOW", color: "text-text-quaternary", bg: "bg-bg-base-3" },
  }[impact];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

/* ────────────────────────────────────────────
   PAGE COMPONENT
   ──────────────────────────────────────────── */

export default function CalendarPage() {
  const { markets: closingMarkets, isLoading: closingLoading } = useClosingSoonMarkets(30);
  const { events: apiEvents, isLoading: eventsLoading } = useEvents(20);

  // Derive calendar events from closing markets + API events
  const allEvents: CalendarEvent[] = useMemo(() => {
    const items: CalendarEvent[] = [];

    // Markets closing soon → market_expiry events
    for (const m of closingMarkets) {
      if (!m.endDate) continue;
      const d = new Date(m.endDate);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      items.push({
        id: `m-${m.id}`,
        title: m.question,
        type: categoryToEventType(m.category),
        date: dateStr,
        time: timeStr,
        marketId: m.id,
        relatedMarkets: 1,
        description: m.description || `Market expiry. Volume: ${formatVolume(m.volume)}. ${formatTimeLeft(m.endDate)} left.`,
        impact: m.volume24h > 500_000 ? "high" : m.volume24h > 50_000 ? "medium" : "low",
      });
    }

    // API events
    for (const ev of apiEvents) {
      if (!ev.endDate) continue;
      const d = new Date(ev.endDate);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      items.push({
        id: `ev-${ev.id}`,
        title: ev.title,
        type: "market_expiry",
        date: dateStr,
        time: timeStr,
        marketId: ev.slug,
        relatedMarkets: ev.markets?.length ?? 0,
        description: ev.description || "",
        impact: ev.volume > 1_000_000 ? "high" : ev.volume > 100_000 ? "medium" : "low",
      });
    }

    // Deduplicate by id
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [closingMarkets, apiEvents]);

  const now = new Date();
  const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  const [currentYear, setCurrentYear] = useState(today.year);
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDate(today.year, today.month, today.day)
  );
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [filterType, setFilterType] = useState<EventType | "all">("all");
  const [monthKey, setMonthKey] = useState(0);

  // ── Navigation ──
  const goToday = useCallback(() => {
    setCurrentYear(today.year);
    setCurrentMonth(today.month);
    setSelectedDate(formatDate(today.year, today.month, today.day));
    setMonthKey((k) => k + 1);
  }, [today.year, today.month, today.day]);

  const goNext = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
    setMonthKey((k) => k + 1);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
    setMonthKey((k) => k + 1);
  }, []);

  // ── Events index ──
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of allEvents) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, []);

  const filteredEvents = useMemo(() => {
    if (filterType === "all") return allEvents;
    return allEvents.filter((e) => e.type === filterType);
  }, [filterType]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const evts = eventsByDate[selectedDate] || [];
    if (filterType === "all") return evts;
    return evts.filter((e) => e.type === filterType);
  }, [selectedDate, eventsByDate, filterType]);

  // ── Stats ──
  const upcomingCount = useMemo(() => {
    const todayStr = formatDate(today.year, today.month, today.day);
    return allEvents.filter((e) => e.date >= todayStr).length;
  }, [today]);

  const expiringThisWeek = useMemo(() => {
    const weekStart = formatDate(today.year, today.month, today.day);
    const end = new Date(today.year, today.month, today.day + 7);
    const weekEnd = formatDate(end.getFullYear(), end.getMonth(), end.getDate());
    return allEvents.filter(
      (e) => e.type === "market_expiry" && e.date >= weekStart && e.date <= weekEnd
    ).length;
  }, [today]);

  const highImpactCount = useMemo(
    () => allEvents.filter((e) => e.impact === "high").length,
    []
  );

  // ── Calendar grid ──
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today.year, today.month, today.day);

  // ── Week view ──
  const selectedOrToday = selectedDate || todayStr;
  const weekDates = useMemo(() => {
    const [y, m, d] = selectedOrToday.split("-").map(Number);
    return getWeekDates(y, m - 1, d);
  }, [selectedOrToday]);

  // Build grid cells for month
  const gridCells = useMemo(() => {
    const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];
    // Previous month padding
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const pm = currentMonth === 0 ? 11 : currentMonth - 1;
      const py = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({ day: d, inMonth: false, dateStr: formatDate(py, pm, d) });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, dateStr: formatDate(currentYear, currentMonth, d) });
    }
    // Next month padding
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nm = currentMonth === 11 ? 0 : currentMonth + 1;
      const ny = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ day: d, inMonth: false, dateStr: formatDate(ny, nm, d) });
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDay]);

  // ── Upcoming events list (sorted) ──
  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 10);
  }, [filteredEvents, todayStr]);

  return (
    <div className="flex h-full flex-col">
      {/* ── Sub-header strip ── */}
      <div
        className="flex h-8 shrink-0 items-center gap-4 bg-bg-base-0 px-4"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-signal-green" />
          <span className="text-body-12 font-semibold text-text-primary">Event Calendar</span>
        </div>
        <div className="mx-2 h-3 w-px bg-bg-base-3" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase text-text-quaternary">
            Upcoming{" "}
            <span className="text-numbers-12 text-text-primary">{upcomingCount}</span>
          </span>
          <span className="text-[10px] font-medium uppercase text-text-quaternary">
            Expiring This Week{" "}
            <span className="text-numbers-12 text-signal-green">{expiringThisWeek}</span>
          </span>
          <span className="text-[10px] font-medium uppercase text-text-quaternary">
            High Impact{" "}
            <span className="text-numbers-12 text-signal-red">{highImpactCount}</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex items-center rounded-md bg-bg-base-2 p-0.5"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-bg-base-3 text-text-primary"
                  : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              Month
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-bg-base-3 text-text-primary"
                  : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              <Rows3 className="h-3 w-3" />
              Week
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* ── Left: Calendar Grid ── */}
        <motion.div
          className="flex flex-1 flex-col rounded-[18px] bg-bg-base-1"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-body-14 font-semibold text-text-primary">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToday}
                className="rounded-md bg-signal-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-signal-green transition-colors hover:bg-signal-green/20"
              >
                Today
              </motion.button>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-quaternary transition-colors hover:bg-bg-base-2 hover:text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-quaternary transition-colors hover:bg-bg-base-2 hover:text-text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 px-5 pb-3">
            {(["all", "market_expiry", "economic", "political", "earnings", "sports"] as const).map(
              (type) => {
                const isAll = type === "all";
                const active = filterType === type;
                const cfg = isAll ? null : EVENT_TYPE_CONFIG[type];
                return (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setFilterType(type)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      active
                        ? isAll
                          ? "bg-text-primary text-bg-base-0"
                          : `${cfg!.bg} ${cfg!.color}`
                        : "bg-bg-base-2 text-text-quaternary hover:text-text-secondary"
                    }`}
                  >
                    {isAll ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      cfg!.icon
                    )}
                    {isAll ? "All" : cfg!.label}
                  </motion.button>
                );
              }
            )}
          </div>

          {/* Calendar body */}
          <div className="flex-1 overflow-auto px-5 pb-5">
            <AnimatePresence mode="wait">
              {viewMode === "month" ? (
                <motion.div
                  key={`month-${monthKey}`}
                  variants={monthTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* Day headers */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((d) => (
                      <div
                        key={d}
                        className="py-1.5 text-center text-[10px] font-medium uppercase text-text-quaternary"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <motion.div
                    className="grid grid-cols-7 gap-1"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {gridCells.map((cell, idx) => {
                      const isToday = cell.dateStr === todayStr;
                      const isSelected = cell.dateStr === selectedDate;
                      const dayEvents = (eventsByDate[cell.dateStr] || []).filter(
                        (e) => filterType === "all" || e.type === filterType
                      );
                      const hasEvents = dayEvents.length > 0;

                      return (
                        <motion.button
                          key={`${cell.dateStr}-${idx}`}
                          variants={cellVariant}
                          whileHover={{
                            y: -2,
                            boxShadow: cell.inMonth
                              ? "0 4px 16px rgba(0, 255, 133, 0.06)"
                              : "none",
                          }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`relative flex min-h-[72px] flex-col items-start rounded-[10px] p-2 text-left transition-colors ${
                            !cell.inMonth
                              ? "bg-transparent text-text-muted/40"
                              : isSelected
                              ? "bg-signal-green/10 ring-1 ring-signal-green/30"
                              : isToday
                              ? "bg-bg-base-3"
                              : "bg-bg-base-2 hover:bg-bg-base-3"
                          }`}
                          style={
                            cell.inMonth && !isSelected
                              ? { boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }
                              : undefined
                          }
                        >
                          <span
                            className={`text-numbers-12 ${
                              !cell.inMonth
                                ? "text-text-muted/30"
                                : isToday
                                ? "flex h-5 w-5 items-center justify-center rounded-full bg-signal-green text-[11px] font-bold text-bg-base-0"
                                : isSelected
                                ? "text-signal-green font-semibold"
                                : "text-text-secondary"
                            }`}
                          >
                            {cell.day}
                          </span>

                          {/* Event dots */}
                          {hasEvents && (
                            <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
                              {dayEvents.slice(0, 4).map((evt) => (
                                <div
                                  key={evt.id}
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: EVENT_TYPE_CONFIG[evt.type].dot }}
                                  title={evt.title}
                                />
                              ))}
                              {dayEvents.length > 4 && (
                                <span className="text-[8px] text-text-muted">
                                  +{dayEvents.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                          {hasEvents && (
                            <div className="mt-0.5 w-full truncate text-[9px] text-text-quaternary">
                              {dayEvents[0].title.length > 18
                                ? dayEvents[0].title.slice(0, 18) + "..."
                                : dayEvents[0].title}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ) : (
                /* ── Week View ── */
                <motion.div
                  key={`week-${selectedOrToday}`}
                  variants={monthTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-2"
                >
                  {/* Week header */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((wd, i) => {
                      const ds = formatDate(wd.year, wd.month, wd.day);
                      const isToday2 = ds === todayStr;
                      const isSelected2 = ds === selectedDate;
                      return (
                        <motion.button
                          key={ds}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedDate(ds)}
                          className={`flex flex-col items-center rounded-[10px] py-2 transition-colors ${
                            isSelected2
                              ? "bg-signal-green/10 ring-1 ring-signal-green/30"
                              : isToday2
                              ? "bg-bg-base-3"
                              : "bg-bg-base-2 hover:bg-bg-base-3"
                          }`}
                          style={
                            !isSelected2
                              ? { boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }
                              : undefined
                          }
                        >
                          <span className="text-[10px] font-medium uppercase text-text-quaternary">
                            {DAY_NAMES_SHORT[i]}
                          </span>
                          <span
                            className={`text-numbers-12 mt-1 ${
                              isToday2
                                ? "flex h-6 w-6 items-center justify-center rounded-full bg-signal-green font-bold text-bg-base-0"
                                : isSelected2
                                ? "text-signal-green font-semibold"
                                : "text-text-primary"
                            }`}
                          >
                            {wd.day}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Week events timeline */}
                  <div className="mt-2 flex flex-col gap-2">
                    {weekDates.map((wd) => {
                      const ds = formatDate(wd.year, wd.month, wd.day);
                      const dayEvts = (eventsByDate[ds] || []).filter(
                        (e) => filterType === "all" || e.type === filterType
                      );
                      if (dayEvts.length === 0) return null;
                      return (
                        <div key={ds}>
                          <div className="mb-1 text-[10px] font-medium uppercase text-text-quaternary">
                            {DAY_NAMES[new Date(wd.year, wd.month, wd.day).getDay()]},{" "}
                            {MONTH_NAMES[wd.month].slice(0, 3)} {wd.day}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {dayEvts.map((evt) => {
                              const cfg = EVENT_TYPE_CONFIG[evt.type];
                              return (
                                <Link
                                  key={evt.id}
                                  href={`/dashboard/markets/${evt.marketId}`}
                                >
                                  <motion.div
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-3 rounded-[10px] bg-bg-base-2 px-3 py-2.5"
                                    style={{
                                      boxShadow:
                                        "inset 0 0 0 1px var(--color-divider-thin)",
                                    }}
                                  >
                                    <div
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${cfg.bg}`}
                                    >
                                      <span className={cfg.color}>{cfg.icon}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-body-12 font-medium text-text-primary">
                                        {evt.title}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-text-quaternary">
                                        <span className="text-numbers-10">{evt.time}</span>
                                        <span>{cfg.label}</span>
                                      </div>
                                    </div>
                                    <ImpactBadge impact={evt.impact} />
                                    <span className="text-numbers-10 text-text-muted">
                                      {getCountdown(evt.date, evt.time)}
                                    </span>
                                  </motion.div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {weekDates.every(
                      (wd) =>
                        (eventsByDate[formatDate(wd.year, wd.month, wd.day)] || []).filter(
                          (e) => filterType === "all" || e.type === filterType
                        ).length === 0
                    ) && (
                      <div className="flex flex-col items-center justify-center py-16 text-text-quaternary">
                        <CalendarDays className="mb-2 h-8 w-8 text-text-muted" />
                        <span className="text-body-12">No events this week</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Right: Side Panel ── */}
        <motion.div
          className="flex w-[340px] shrink-0 flex-col gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          {/* Selected Day Events */}
          <div
            className="flex flex-col rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={selectedDate}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="text-body-12 font-semibold text-text-primary"
                >
                  {selectedDate
                    ? (() => {
                        const [y, m, d] = selectedDate.split("-").map(Number);
                        return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
                      })()
                    : "Select a Day"}
                </motion.h3>
              </AnimatePresence>
              <span className="text-numbers-10 text-text-quaternary">
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="max-h-[280px] overflow-auto px-3 pb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDate}-${filterType}`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-2"
                >
                  {selectedDayEvents.length === 0 ? (
                    <motion.div
                      variants={listItem}
                      className="flex flex-col items-center py-8 text-text-quaternary"
                    >
                      <CalendarDays className="mb-2 h-6 w-6 text-text-muted" />
                      <span className="text-body-12">No events on this day</span>
                    </motion.div>
                  ) : (
                    selectedDayEvents.map((evt) => {
                      const cfg = EVENT_TYPE_CONFIG[evt.type];
                      return (
                        <motion.div key={evt.id} variants={listItem}>
                          <Link href={`/dashboard/markets/${evt.marketId}`}>
                            <motion.div
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              className="group rounded-[10px] bg-bg-base-2 p-3"
                              style={{
                                boxShadow: "inset 0 0 0 1px var(--color-divider-thin)",
                              }}
                            >
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${cfg.bg}`}
                                >
                                  <span className={cfg.color}>{cfg.icon}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-body-12 font-medium text-text-primary group-hover:text-signal-green transition-colors">
                                      {evt.title}
                                    </span>
                                    <ArrowUpRight className="h-3 w-3 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}
                                    >
                                      {cfg.label}
                                    </span>
                                    <ImpactBadge impact={evt.impact} />
                                  </div>
                                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-quaternary line-clamp-2">
                                    {evt.description}
                                  </p>
                                  <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span className="text-numbers-10">{evt.time}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      {evt.relatedMarkets} markets
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      <span className="text-numbers-10">
                                        {getCountdown(evt.date, evt.time)}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming Events */}
          <div
            className="flex flex-1 flex-col rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-body-12 font-semibold text-text-primary">
                Upcoming Events
              </h3>
              <span className="text-[10px] font-medium uppercase text-text-quaternary">
                Next 10
              </span>
            </div>

            <div className="flex-1 overflow-auto px-3 pb-3">
              <motion.div
                className="flex flex-col gap-1.5"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {upcomingEvents.map((evt) => {
                  const cfg = EVENT_TYPE_CONFIG[evt.type];
                  const [, m, d] = evt.date.split("-").map(Number);
                  const countdown = getCountdown(evt.date, evt.time);
                  const isPassed = countdown === "Passed";

                  return (
                    <motion.div key={evt.id} variants={listItem}>
                      <Link href={`/dashboard/markets/${evt.marketId}`}>
                        <motion.div
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex items-center gap-2.5 rounded-[10px] bg-bg-base-2 px-3 py-2"
                          style={{
                            boxShadow: "inset 0 0 0 1px var(--color-divider-thin)",
                          }}
                        >
                          {/* Date chip */}
                          <div className="flex w-9 shrink-0 flex-col items-center rounded-md bg-bg-base-3 py-1">
                            <span className="text-[9px] font-medium uppercase text-text-muted">
                              {MONTH_NAMES[m - 1].slice(0, 3)}
                            </span>
                            <span className="text-numbers-12 font-semibold text-text-primary">
                              {d}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-body-12 text-text-primary group-hover:text-signal-green transition-colors">
                              {evt.title}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-0.5 text-[9px] font-medium ${cfg.color}`}
                              >
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: cfg.dot }}
                                />
                                {cfg.label}
                              </span>
                              <span className="text-[10px] text-text-muted">
                                {evt.relatedMarkets} mkts
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-0.5">
                            <ImpactBadge impact={evt.impact} />
                            <span
                              className={`text-numbers-10 ${
                                isPassed ? "text-text-muted" : "text-text-quaternary"
                              }`}
                            >
                              {countdown}
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Legend */}
          <div
            className="rounded-[18px] bg-bg-base-1 px-4 py-3"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div className="text-[10px] font-medium uppercase text-text-quaternary mb-2">
              Event Types
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(
                ([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cfg.dot }}
                    />
                    <span className="text-[10px] text-text-quaternary">{cfg.label}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
