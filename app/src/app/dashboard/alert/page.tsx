"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Trash2,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Mail,
  MessageSquare,
  Send,
  Monitor,
  Pencil,
  Check,
  Clock,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Flame,
  Target,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "@/hooks/use-user-data";
import { useSearchMarkets } from "@/hooks/use-markets";

/* ────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────── */

type AlertType = "price" | "whale" | "volume" | "anomaly" | "sentiment";
type AlertStatus = "active" | "paused";
type DeliveryChannel = "inapp" | "email" | "telegram" | "discord";
type Severity = "critical" | "high" | "medium" | "low";

interface Alert {
  id: string;
  type: AlertType;
  market: string;
  marketId: string;
  condition: string;
  threshold: string;
  status: AlertStatus;
  triggered: number;
  lastTriggered: string | null;
  accuracy: number;
  channels: DeliveryChannel[];
  createdAt: string;
  sparkline: number[];
}

interface TriggerEvent {
  id: string;
  alertId: string;
  time: string;
  relativeTime: string;
  alertName: string;
  detail: string;
  type: AlertType;
  marketId: string;
  marketName: string;
  severity: Severity;
  read: boolean;
}

/* ────────────────────────────────────────────
   (Alerts are loaded from the API via useAlerts hook)
   ──────────────────────────────────────────── */


const ALERT_TYPE_META: Record<AlertType, { label: string; icon: React.ElementType; color: string; bgColor: string; description: string }> = {
  price: { label: "Price", icon: Zap, color: "text-signal-green", bgColor: "bg-signal-green/10", description: "Triggers when YES/NO price crosses your threshold" },
  whale: { label: "Whale", icon: Users, color: "text-signal-blue", bgColor: "bg-signal-blue/10", description: "Detects large wallet entries or exits above threshold" },
  volume: { label: "Volume", icon: TrendingUp, color: "text-signal-amber", bgColor: "bg-signal-amber/10", description: "Alerts on abnormal volume spikes within a time window" },
  anomaly: { label: "Anomaly", icon: Brain, color: "text-signal-red", bgColor: "bg-signal-red/10", description: "Flags insider patterns and statistical anomalies" },
  sentiment: { label: "Sentiment", icon: AlertTriangle, color: "text-signal-amber", bgColor: "bg-signal-amber/10", description: "Monitors social sentiment score shifts" },
};

const SEVERITY_CONFIG: Record<Severity, { color: string; bgColor: string; label: string }> = {
  critical: { color: "text-signal-red", bgColor: "bg-signal-red/10", label: "CRIT" },
  high: { color: "text-signal-amber", bgColor: "bg-signal-amber/10", label: "HIGH" },
  medium: { color: "text-signal-blue", bgColor: "bg-signal-blue/10", label: "MED" },
  low: { color: "text-text-quaternary", bgColor: "bg-bg-base-3", label: "LOW" },
};

const CHANNEL_META: Record<DeliveryChannel, { label: string; icon: React.ElementType }> = {
  inapp: { label: "In-app", icon: Monitor },
  email: { label: "Email", icon: Mail },
  telegram: { label: "Telegram", icon: Send },
  discord: { label: "Discord", icon: MessageSquare },
};


/* ────────────────────────────────────────────
   ANIMATION VARIANTS
   ──────────────────────────────────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const slideIn = {
  hidden: { opacity: 0, x: 320 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
  exit: { opacity: 0, x: 320, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
};

const expandCollapse = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
};

/* ────────────────────────────────────────────
   SPARKLINE COMPONENT
   ──────────────────────────────────────────── */

function MiniSparkline({ data, color = "var(--color-signal-green)", width = 64, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="shrink-0">
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ────────────────────────────────────────────
   TOGGLE SWITCH
   ──────────────────────────────────────────── */

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors duration-200 ${enabled ? "bg-signal-green/30" : "bg-bg-base-3"}`}
    >
      <motion.div
        className={`absolute top-[2px] h-[14px] w-[14px] rounded-full ${enabled ? "bg-signal-green" : "bg-text-quaternary"}`}
        animate={{ left: enabled ? 16 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

/* ────────────────────────────────────────────
   TRIGGER FREQUENCY BAR CHART
   ──────────────────────────────────────────── */

function TriggerFrequencyChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 64 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-[2px] bg-signal-green/40"
            initial={{ height: 0 }}
            animate={{ height: Math.max((d.value / max) * 52, 2) }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
          />
          <span className="text-numbers-10 text-text-quaternary">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */

export default function AlertPage() {
  const { alerts: apiAlerts, isLoading: alertsLoading, mutate } = useAlerts();

  // Map API alerts to local Alert shape
  const alerts: Alert[] = useMemo(() => {
    return apiAlerts.map((a) => ({
      id: a.id,
      type: (["price", "whale", "volume", "anomaly", "sentiment"].includes(a.type) ? a.type : "price") as AlertType,
      market: a.marketQuestion,
      marketId: a.marketId,
      condition: a.condition,
      threshold: a.threshold,
      status: (a.status === "active" || a.status === "paused" ? a.status : "active") as AlertStatus,
      triggered: a.triggered,
      lastTriggered: a.lastTriggeredAt,
      accuracy: 0,
      channels: a.channels as DeliveryChannel[],
      createdAt: a.createdAt,
      sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }));
  }, [apiAlerts]);

  const [triggers, setTriggers] = useState<TriggerEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"alerts" | "history">("alerts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<AlertType | "all">("all");

  // New alert form state
  const [newAlertType, setNewAlertType] = useState<AlertType>("price");
  const [newMarketSearch, setNewMarketSearch] = useState("");
  const [newMarketId, setNewMarketId] = useState("");
  const [newMarketName, setNewMarketName] = useState("");
  const [newCondition, setNewCondition] = useState<"above" | "below">("above");
  const [newThreshold, setNewThreshold] = useState("");
  const [newChannels, setNewChannels] = useState<DeliveryChannel[]>(["inapp"]);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const { markets: searchedMarkets } = useSearchMarkets(newMarketSearch, 10);

  // Computed stats
  const activeCount = alerts.filter((a) => a.status === "active").length;
  const triggered24h = alerts.reduce((sum, a) => sum + a.triggered, 0);
  const avgAccuracy = Math.round(alerts.reduce((sum, a) => sum + a.accuracy, 0) / alerts.length);
  const unreadCount = triggers.filter((t) => !t.read).length;

  const filteredAlerts = useMemo(() => {
    if (filterType === "all") return alerts;
    return alerts.filter((a) => a.type === filterType);
  }, [alerts, filterType]);

  // Frequency chart data — computed from real alerts (zeros when no data)
  const frequencyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (alerts.length === 0) return days.map(label => ({ label, value: 0 }));
    const counts: Record<string, number> = {};
    days.forEach(d => { counts[d] = 0; });
    for (const a of alerts) {
      if (a.lastTriggered) {
        const d = new Date(a.lastTriggered);
        const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (dayName) counts[dayName] += a.triggered;
      }
    }
    return days.map(label => ({ label, value: counts[label] ?? 0 }));
  }, [alerts]);

  // Type distribution
  const typeDistribution = useMemo(() => {
    const counts: Record<AlertType, number> = { price: 0, whale: 0, volume: 0, anomaly: 0, sentiment: 0 };
    alerts.forEach((a) => counts[a.type]++);
    return counts;
  }, [alerts]);

  // Most triggered
  const mostTriggered = useMemo(() => {
    return [...alerts].sort((a, b) => b.triggered - a.triggered).slice(0, 4);
  }, [alerts]);

  const toggleAlertStatus = useCallback(async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;
    const newStatus = alert.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/user/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update alert");
      mutate();
    } catch (err) {
      console.error("Toggle alert error:", err);
    }
  }, [alerts, mutate]);

  const deleteAlert = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/user/alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alert");
      if (expandedId === id) setExpandedId(null);
      mutate();
    } catch (err) {
      console.error("Delete alert error:", err);
    }
  }, [expandedId, mutate]);

  const markAsRead = useCallback((id: string) => {
    setTriggers((prev) => prev.map((t) => t.id === id ? { ...t, read: true } : t));
  }, []);

  const markAllRead = useCallback(() => {
    setTriggers((prev) => prev.map((t) => ({ ...t, read: true })));
  }, []);

  const toggleChannel = useCallback((ch: DeliveryChannel) => {
    setNewChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  }, []);

  const selectMarket = useCallback((id: string, name: string) => {
    setNewMarketId(id);
    setNewMarketName(name);
    setNewMarketSearch(name);
    setShowMarketDropdown(false);
  }, []);

  const filteredMarkets = useMemo(() => {
    const staticItems = [{ id: "all", name: "All Markets" }];
    if (!newMarketSearch) return staticItems;
    const fromApi = searchedMarkets.map((m) => ({ id: m.id, name: m.question }));
    return [...fromApi, ...staticItems];
  }, [newMarketSearch, searchedMarkets]);

  const [isCreating, setIsCreating] = useState(false);

  const createAlert = useCallback(async () => {
    if (!newMarketId || !newThreshold || isCreating) return;
    setIsCreating(true);
    const meta = ALERT_TYPE_META[newAlertType];
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newAlertType,
          marketId: newMarketId,
          marketQuestion: newMarketName,
          condition: `${meta.label} ${newCondition}`,
          threshold: newThreshold,
          channels: newChannels,
        }),
      });
      if (!res.ok) throw new Error("Failed to create alert");
      mutate();
      setDrawerOpen(false);
      resetForm();
    } catch (err) {
      console.error("Create alert error:", err);
    } finally {
      setIsCreating(false);
    }
  }, [newAlertType, newMarketId, newMarketName, newCondition, newThreshold, newChannels, isCreating, mutate]);

  const resetForm = () => {
    setNewAlertType("price");
    setNewMarketSearch("");
    setNewMarketId("");
    setNewMarketName("");
    setNewCondition("above");
    setNewThreshold("");
    setNewChannels(["inapp"]);
  };

  const getSparklineColor = (type: AlertType) => {
    const colors: Record<AlertType, string> = {
      price: "var(--color-signal-green)",
      whale: "var(--color-signal-blue)",
      volume: "var(--color-signal-amber)",
      anomaly: "var(--color-signal-red)",
      sentiment: "var(--color-signal-amber)",
    };
    return colors[type];
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Sub-header ── */}
      <div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex h-6 items-center rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          ALERTS
        </div>
        <div className="ml-4 hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-body-12 text-text-quaternary">Active</span>
            <span className="text-numbers-12 font-medium text-signal-green">{activeCount}</span>
          </div>
          <div className="h-3 w-px bg-divider-heavy" />
          <div className="flex items-center gap-1.5">
            <span className="text-body-12 text-text-quaternary">Triggered 24h</span>
            <span className="text-numbers-12 font-medium text-signal-amber">{triggered24h}</span>
          </div>
          <div className="h-3 w-px bg-divider-heavy" />
          <div className="flex items-center gap-1.5">
            <span className="text-body-12 text-text-quaternary">Accuracy</span>
            <span className="text-numbers-12 font-medium text-text-primary">{avgAccuracy}%</span>
          </div>
          <div className="h-3 w-px bg-divider-heavy" />
          <div className="flex items-center gap-1.5">
            <span className="text-body-12 text-text-quaternary">Unread</span>
            <span className={`text-numbers-12 font-medium ${unreadCount > 0 ? "text-signal-red" : "text-text-quaternary"}`}>{unreadCount}</span>
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="ml-auto flex h-6 items-center gap-1 rounded-[4px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-signal-green/80"
        >
          <Plus className="h-3 w-3" />
          <span className="text-body-12 font-semibold">New Alert</span>
        </button>
      </div>

      {/* ── Page content ── */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <motion.div
          className="flex h-full gap-2"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          {/* ══════════════════ LEFT: Main alerts panel ══════════════════ */}
          <motion.div
            variants={fadeUp}
            className="flex min-w-0 flex-1 flex-col rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            {/* Tabs + filter */}
            <div
              className="flex h-10 items-center justify-between px-4"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTab("alerts")}
                  className={`relative pb-px text-body-12 font-semibold transition-colors duration-150 ${tab === "alerts" ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"}`}
                >
                  My Alerts ({alerts.length})
                  {tab === "alerts" && (
                    <motion.span layoutId="tab-indicator" className="absolute -bottom-[5px] left-0 right-0 h-[2px] rounded-full bg-signal-green" />
                  )}
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={`relative pb-px text-body-12 font-semibold transition-colors duration-150 ${tab === "history" ? "text-text-primary" : "text-text-quaternary hover:text-text-secondary"}`}
                >
                  Trigger History
                  {unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-red/20 px-1 text-numbers-10 font-medium text-signal-red">
                      {unreadCount}
                    </span>
                  )}
                  {tab === "history" && (
                    <motion.span layoutId="tab-indicator" className="absolute -bottom-[5px] left-0 right-0 h-[2px] rounded-full bg-signal-green" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {tab === "alerts" && (
                  <div className="flex items-center gap-1">
                    {(["all", "price", "whale", "volume", "anomaly", "sentiment"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`rounded-[4px] px-2 py-0.5 text-body-12 transition-colors duration-150 ${filterType === t ? "bg-bg-base-3 text-text-primary" : "text-text-quaternary hover:text-text-secondary"}`}
                      >
                        {t === "all" ? "All" : ALERT_TYPE_META[t].label}
                      </button>
                    ))}
                  </div>
                )}
                {tab === "history" && unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-body-12 text-text-quaternary transition-colors hover:text-text-secondary"
                  >
                    <Check className="h-3 w-3" />
                    <span className="text-body-12">Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto overflow-x-auto">
              <AnimatePresence mode="wait">
                {tab === "alerts" ? (
                  <motion.div
                    key="alerts-tab"
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={stagger}
                  >
                    {filteredAlerts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16"
                      >
                        <Bell className="mb-3 h-8 w-8 text-text-muted" />
                        <p className="mb-1 text-body-12 font-medium text-text-secondary">No alerts configured</p>
                        <p className="mb-4 text-body-12 text-text-quaternary">Create your first alert to monitor market signals</p>
                        <button
                          onClick={() => setDrawerOpen(true)}
                          className="flex h-7 items-center gap-1 rounded-[6px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 hover:bg-action-brand-hover"
                        >
                          <Plus className="h-3 w-3" /> Create Alert
                        </button>
                      </motion.div>
                    ) : (<>
                    {/* Column headers */}
                    <div className="min-w-[700px]">
                    <div
                      className="grid grid-cols-[32px_72px_1fr_1fr_64px_72px_80px_32px_32px] items-center gap-2 px-4 py-2 text-body-12 font-medium uppercase text-text-quaternary"
                      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                    >
                      <span />
                      <span className="text-body-12">Type</span>
                      <span className="text-body-12">Market</span>
                      <span className="text-body-12">Condition</span>
                      <span className="text-body-12">Activity</span>
                      <span className="text-right text-body-12">Fired</span>
                      <span className="text-right text-body-12">Status</span>
                      <span />
                      <span />
                    </div>

                    {filteredAlerts.map((alert) => {
                      const meta = ALERT_TYPE_META[alert.type];
                      const Icon = meta.icon;
                      const isExpanded = expandedId === alert.id;

                      return (
                        <motion.div
                          key={alert.id}
                          variants={fadeUp}
                          layout
                          className="group"
                          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                        >
                          {/* Alert row */}
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                            className="grid cursor-pointer grid-cols-[32px_72px_1fr_1fr_64px_72px_80px_32px_32px] items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-bg-base-2/50"
                          >
                            {/* Expand chevron */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ChevronRight className="h-3.5 w-3.5 text-text-quaternary" />
                            </motion.div>

                            {/* Type badge */}
                            <div className={`flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 ${meta.bgColor}`}>
                              <Icon className={`h-3 w-3 ${meta.color}`} />
                              <span className={`text-body-12 font-medium ${meta.color}`}>{meta.label}</span>
                            </div>

                            {/* Market */}
                            <span className="truncate text-body-12 text-text-primary">{alert.market}</span>

                            {/* Condition */}
                            <span className="truncate text-body-12 text-text-secondary">
                              {alert.condition} {alert.threshold}
                            </span>

                            {/* Sparkline */}
                            <MiniSparkline data={alert.sparkline} color={getSparklineColor(alert.type)} />

                            {/* Triggered count */}
                            <div className="text-right">
                              <span className="text-numbers-12 text-text-primary">{alert.triggered}</span>
                              {alert.lastTriggered && (
                                <div className="text-numbers-10 text-text-quaternary">{alert.lastTriggered}</div>
                              )}
                            </div>

                            {/* Toggle */}
                            <div className="flex justify-end">
                              <ToggleSwitch
                                enabled={alert.status === "active"}
                                onToggle={() => toggleAlertStatus(alert.id)}
                              />
                            </div>

                            {/* Edit - visible on hover */}
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-quaternary opacity-0 transition-all duration-150 hover:bg-bg-base-3 hover:text-text-secondary group-hover:opacity-100"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>

                            {/* Delete - visible on hover */}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); }}
                              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-quaternary opacity-0 transition-all duration-150 hover:bg-signal-red/10 hover:text-signal-red group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={expandCollapse}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-4 gap-3 bg-bg-base-2/30 px-4 py-3">
                                  <div className="rounded-[10px] bg-bg-base-2 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                                    <div className="text-body-12 text-text-quaternary">Accuracy</div>
                                    <div className={`text-numbers-12 font-semibold ${alert.accuracy >= 80 ? "text-signal-green" : alert.accuracy >= 60 ? "text-signal-amber" : "text-signal-red"}`}>
                                      {alert.accuracy > 0 ? `${alert.accuracy}%` : "N/A"}
                                    </div>
                                  </div>
                                  <div className="rounded-[10px] bg-bg-base-2 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                                    <div className="text-body-12 text-text-quaternary">Created</div>
                                    <div className="text-numbers-12 text-text-primary">{alert.createdAt}</div>
                                  </div>
                                  <div className="rounded-[10px] bg-bg-base-2 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                                    <div className="text-body-12 text-text-quaternary">Channels</div>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      {alert.channels.map((ch) => {
                                        const ChIcon = CHANNEL_META[ch].icon;
                                        return <ChIcon key={ch} className="h-3.5 w-3.5 text-text-secondary" />;
                                      })}
                                    </div>
                                  </div>
                                  <div className="rounded-[10px] bg-bg-base-2 p-3" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}>
                                    <div className="text-body-12 text-text-quaternary">Last Triggered</div>
                                    <div className="text-numbers-12 text-text-primary">{alert.lastTriggered ?? "Never"}</div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}

                    </div>
                    </>)}
                  </motion.div>
                ) : (
                  /* ── Trigger History Tab ── */
                  <motion.div
                    key="history-tab"
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={stagger}
                  >
                    {triggers.map((trigger) => {
                      const meta = ALERT_TYPE_META[trigger.type];
                      const Icon = meta.icon;
                      const sev = SEVERITY_CONFIG[trigger.severity];

                      return (
                        <motion.div
                          key={trigger.id}
                          variants={fadeUp}
                          className={`group flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-bg-base-2/50 ${!trigger.read ? "bg-signal-green/[0.02]" : ""}`}
                          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                        >
                          {/* Unread dot */}
                          <div className="flex w-2 shrink-0 items-center pt-2">
                            {!trigger.read && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 rounded-full bg-signal-green"
                              />
                            )}
                          </div>

                          {/* Icon */}
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.bgColor}`}>
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-body-12 font-semibold text-text-primary">{trigger.alertName}</span>
                              <span className={`rounded-[4px] px-1.5 py-0.5 text-numbers-10 font-semibold ${sev.bgColor} ${sev.color}`}>
                                {sev.label}
                              </span>
                              <span className="text-numbers-10 text-text-quaternary">{trigger.relativeTime}</span>
                            </div>
                            <p className="mt-0.5 text-body-12 leading-relaxed text-text-secondary">{trigger.detail}</p>
                            <Link
                              href={`/dashboard/markets/${trigger.marketId}`}
                              className="mt-1 inline-flex items-center gap-1 text-body-12 text-signal-green transition-colors hover:text-signal-green/80"
                            >
                              {trigger.marketName}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            {!trigger.read && (
                              <button
                                onClick={() => markAsRead(trigger.id)}
                                className="flex h-6 items-center gap-1 rounded-[4px] px-2 text-body-12 text-text-quaternary transition-colors hover:bg-bg-base-3 hover:text-text-secondary"
                              >
                                <Eye className="h-3 w-3" />
                                <span className="text-body-12">Read</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ══════════════════ RIGHT: Analytics panel ══════════════════ */}
          <motion.div
            variants={fadeUp}
            className="hidden w-72 shrink-0 flex-col gap-2 lg:flex"
          >
            {/* Trigger frequency */}
            <div
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-body-12 font-semibold uppercase text-text-quaternary">Trigger Frequency</span>
                <span className="text-numbers-10 text-text-quaternary">Last 7 days</span>
              </div>
              <TriggerFrequencyChart data={frequencyData} />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-body-12 text-text-quaternary">Total this week</span>
                <span className="text-numbers-12 font-semibold text-text-primary">{frequencyData.reduce((s, d) => s + d.value, 0)}</span>
              </div>
            </div>

            {/* Alert accuracy stats */}
            <div
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-3 text-body-12 font-semibold uppercase text-text-quaternary">Accuracy Stats</div>
              <div className="space-y-2.5">
                {(["price", "whale", "volume", "anomaly", "sentiment"] as AlertType[]).map((type) => {
                  const meta = ALERT_TYPE_META[type];
                  const Icon = meta.icon;
                  const typeAlerts = alerts.filter((a) => a.type === type);
                  const acc = typeAlerts.length > 0 ? Math.round(typeAlerts.reduce((s, a) => s + a.accuracy, 0) / typeAlerts.length) : 0;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                      <span className="flex-1 text-body-12 text-text-secondary">{meta.label}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-base-3">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: acc >= 80 ? "var(--color-signal-green)" : acc >= 60 ? "var(--color-signal-amber)" : "var(--color-signal-red)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${acc}%` }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </div>
                      <span className="w-8 text-right text-numbers-10 text-text-primary">{acc > 0 ? `${acc}%` : "--"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most triggered */}
            <div
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-3 text-body-12 font-semibold uppercase text-text-quaternary">Most Triggered</div>
              <div className="space-y-2">
                {mostTriggered.map((alert, i) => {
                  const meta = ALERT_TYPE_META[alert.type];
                  const Icon = meta.icon;
                  return (
                    <div key={alert.id} className="flex items-center gap-2">
                      <span className="w-4 text-right text-numbers-10 text-text-quaternary">{i + 1}</span>
                      <Icon className={`h-3 w-3 shrink-0 ${meta.color}`} />
                      <span className="flex-1 truncate text-body-12 text-text-secondary">{alert.market}</span>
                      <span className="text-numbers-12 font-semibold text-text-primary">{alert.triggered}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type distribution */}
            <div
              className="rounded-[18px] bg-bg-base-1 p-4"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
            >
              <div className="mb-3 text-body-12 font-semibold uppercase text-text-quaternary">Alert Distribution</div>
              <div className="space-y-2">
                {(Object.entries(typeDistribution) as [AlertType, number][]).map(([type, count]) => {
                  const meta = ALERT_TYPE_META[type];
                  const Icon = meta.icon;
                  const pct = alerts.length > 0 ? Math.round((count / alerts.length) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                      <span className="w-16 text-body-12 text-text-secondary">{meta.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-base-3">
                        <motion.div
                          className={`h-full rounded-full ${meta.bgColor}`}
                          style={{ backgroundColor: `color-mix(in srgb, currentColor 60%, transparent)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className={`h-full w-full rounded-full opacity-60 ${meta.color.replace("text-", "bg-")}`} />
                        </motion.div>
                      </div>
                      <span className="w-6 text-right text-numbers-10 text-text-quaternary">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════════════════ NEW ALERT DRAWER ══════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-bg-base-1"
              style={{ boxShadow: "-1px 0 0 0 var(--color-divider-heavy), -8px 0 32px rgba(0,0,0,0.5)" }}
            >
              {/* Drawer header */}
              <div
                className="flex h-12 shrink-0 items-center justify-between px-5"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-signal-green" />
                  <span className="text-body-14 font-semibold text-text-primary">Create New Alert</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] text-text-quaternary transition-colors hover:bg-bg-base-3 hover:text-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  {/* Alert type selector */}
                  <div>
                    <label className="mb-2 block text-body-12 font-semibold uppercase text-text-quaternary">Alert Type</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(Object.entries(ALERT_TYPE_META) as [AlertType, typeof ALERT_TYPE_META[AlertType]][]).map(([type, meta]) => {
                        const Icon = meta.icon;
                        const selected = newAlertType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => setNewAlertType(type)}
                            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-all duration-150 ${
                              selected
                                ? "bg-bg-base-2 ring-1 ring-signal-green/40"
                                : "bg-bg-base-2/50 hover:bg-bg-base-2"
                            }`}
                            style={selected ? {} : { boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${meta.bgColor}`}>
                              <Icon className={`h-4 w-4 ${meta.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-body-12 font-semibold ${selected ? "text-text-primary" : "text-text-secondary"}`}>{meta.label}</div>
                              <div className="text-body-12 text-text-quaternary">{meta.description}</div>
                            </div>
                            {selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-green"
                              >
                                <Check className="h-3 w-3 text-bg-base-0" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Market search */}
                  <div>
                    <label className="mb-2 block text-body-12 font-semibold uppercase text-text-quaternary">Market</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-quaternary" />
                      <input
                        type="text"
                        value={newMarketSearch}
                        onChange={(e) => { setNewMarketSearch(e.target.value); setShowMarketDropdown(true); setNewMarketId(""); }}
                        onFocus={() => setShowMarketDropdown(true)}
                        placeholder="Search markets..."
                        className="h-9 w-full rounded-[6px] bg-bg-base-2 pl-9 pr-3 text-body-12 text-text-primary placeholder:text-text-quaternary outline-none"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                      />
                      <AnimatePresence>
                        {showMarketDropdown && !newMarketId && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-[10px] bg-bg-base-2 py-1"
                            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px rgba(0,0,0,0.4)" }}
                          >
                            {filteredMarkets.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => selectMarket(m.id, m.name)}
                                className="flex w-full items-center px-3 py-2 text-body-12 text-text-secondary transition-colors hover:bg-bg-base-3 hover:text-text-primary"
                              >
                                {m.name}
                              </button>
                            ))}
                            {filteredMarkets.length === 0 && (
                              <div className="px-3 py-2 text-body-12 text-text-quaternary">No markets found</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Condition builder */}
                  <div>
                    <label className="mb-2 block text-body-12 font-semibold uppercase text-text-quaternary">Condition</label>
                    <div className="flex gap-2">
                      <div className="flex overflow-hidden rounded-[6px]" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
                        <button
                          onClick={() => setNewCondition("above")}
                          className={`flex items-center gap-1 px-3 py-2 text-body-12 transition-colors ${newCondition === "above" ? "bg-signal-green/10 text-signal-green" : "bg-bg-base-2 text-text-quaternary hover:text-text-secondary"}`}
                        >
                          <ArrowUp className="h-3 w-3" />
                          <span className="text-body-12">Above</span>
                        </button>
                        <button
                          onClick={() => setNewCondition("below")}
                          className={`flex items-center gap-1 px-3 py-2 text-body-12 transition-colors ${newCondition === "below" ? "bg-signal-red/10 text-signal-red" : "bg-bg-base-2 text-text-quaternary hover:text-text-secondary"}`}
                        >
                          <ArrowDown className="h-3 w-3" />
                          <span className="text-body-12">Below</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(e.target.value)}
                        placeholder={newAlertType === "price" ? "e.g. 70¢" : newAlertType === "volume" ? "e.g. 200%" : "Threshold"}
                        className="h-9 flex-1 rounded-[6px] bg-bg-base-2 px-3 text-body-12 text-text-primary placeholder:text-text-quaternary outline-none"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                      />
                    </div>
                  </div>

                  {/* Delivery channels */}
                  <div>
                    <label className="mb-2 block text-body-12 font-semibold uppercase text-text-quaternary">Delivery</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(CHANNEL_META) as [DeliveryChannel, typeof CHANNEL_META[DeliveryChannel]][]).map(([ch, meta]) => {
                        const ChIcon = meta.icon;
                        const active = newChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            className={`flex items-center gap-2 rounded-[6px] px-3 py-2.5 transition-all duration-150 ${
                              active
                                ? "bg-signal-green/10 ring-1 ring-signal-green/30"
                                : "bg-bg-base-2 hover:bg-bg-base-3"
                            }`}
                            style={active ? {} : { boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
                          >
                            <ChIcon className={`h-3.5 w-3.5 ${active ? "text-signal-green" : "text-text-quaternary"}`} />
                            <span className={`text-body-12 ${active ? "text-signal-green" : "text-text-secondary"}`}>{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview */}
                  {newMarketId && newThreshold && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="mb-2 block text-body-12 font-semibold uppercase text-text-quaternary">Preview</label>
                      <div
                        className="rounded-[10px] bg-bg-base-2 p-3"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                      >
                        <div className="flex items-center gap-2">
                          {(() => { const Icon = ALERT_TYPE_META[newAlertType].icon; return <Icon className={`h-3.5 w-3.5 ${ALERT_TYPE_META[newAlertType].color}`} />; })()}
                          <span className="text-body-12 font-semibold text-text-primary">{ALERT_TYPE_META[newAlertType].label} Alert</span>
                        </div>
                        <p className="mt-1.5 text-body-12 text-text-secondary">
                          When <span className="text-text-primary">{newMarketName}</span> {ALERT_TYPE_META[newAlertType].label.toLowerCase()} goes {newCondition} <span className="text-numbers-12 font-semibold text-signal-green">{newThreshold}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-body-12 text-text-quaternary">Notify via:</span>
                          {newChannels.map((ch) => {
                            const ChIcon = CHANNEL_META[ch].icon;
                            return <ChIcon key={ch} className="h-3 w-3 text-text-secondary" />;
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div
                className="flex shrink-0 items-center gap-3 px-5 py-4"
                style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}
              >
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 flex-1 items-center justify-center rounded-[6px] bg-bg-base-3 text-body-12 font-semibold text-text-secondary transition-colors hover:bg-bg-base-2"
                >
                  Cancel
                </button>
                <button
                  onClick={createAlert}
                  disabled={!newMarketId || !newThreshold || isCreating}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[6px] bg-signal-green text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-signal-green/80 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-body-12 font-semibold">{isCreating ? "Creating..." : "Create Alert"}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
