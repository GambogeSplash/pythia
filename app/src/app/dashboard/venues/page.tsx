"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Key,
  RotateCw,
  Trash2,
  Plus,
  Link2,
  Unlink,
  Activity,
  Database,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { VENUE_LOGOS } from "@/components/ui/venue-logos";
import { useMarketStats } from "@/hooks/use-markets";
import { formatVolume } from "@/lib/format";

/* ── Animation Variants ── */

const pageStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: "easeOut" as const,
    },
  },
};

const sectionVariant = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const subHeaderVariant = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: {
      duration: 0.25,
      ease: "easeIn" as const,
    },
  },
};

const cardsStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const pipelineStageVariant = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const pipelineArrowVariant = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const tableRowVariant = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const tableStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const noteCardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const noteCardsStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const statVariant = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const statsStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

/* ── Venue Data ── */

type VenueStatus = "connected" | "available" | "coming-soon";

interface Venue {
  id: string;
  name: string;
  description: string;
  accent: string;
  accentBg: string;
  letter: string;
  status: VenueStatus;
  phase: "MVP" | "Phase 2" | "Phase 3";
  volume: string;
  markets: string;
  users?: string;
  chain?: string;
  settlement?: string;
  oracle?: string;
  api?: string;
  auth?: string;
  regulation?: string;
  feature?: string;
  connectionLabel?: string;
  extras?: string[];
}

const VENUES: Venue[] = [
  {
    id: "polymarket",
    name: "Polymarket",
    description: "Largest crypto prediction market. Binary outcomes on politics, sports, crypto, and world events.",
    accent: "#00FF85",
    accentBg: "rgba(0,255,133,0.12)",
    letter: "P",
    status: "connected",
    phase: "MVP",
    volume: "$21.5B (2025)",
    markets: "890+",
    chain: "Polygon",
    settlement: "USDC",
    oracle: "UMA Optimistic Oracle",
    api: "CLOB + WebSocket",
    auth: "EIP-712 + L2 HMAC",
    connectionLabel: "Real-time",
  },
  {
    id: "kalshi",
    name: "Kalshi",
    description: "CFTC-regulated exchange for event contracts. US-compliant with fiat on/off ramps.",
    accent: "#4DA6FF",
    accentBg: "rgba(77,166,255,0.12)",
    letter: "K",
    status: "connected",
    phase: "MVP",
    volume: "$17.1B (2025)",
    markets: "420+",
    regulation: "CFTC-regulated",
    settlement: "USD Fiat",
    api: "REST API",
    auth: "Demo + Production credentials",
  },
  {
    id: "opinion-labs",
    name: "Opinion Labs",
    description: "Next-gen prediction market with continuous and distribution market types.",
    accent: "#C084FC",
    accentBg: "rgba(192,132,252,0.12)",
    letter: "O",
    status: "connected",
    phase: "MVP",
    volume: "$10B+ in 55 days",
    markets: "240+",
    feature: "Continuous/distribution markets",
  },
  {
    id: "limitless",
    name: "Limitless",
    description: "High-frequency prediction trading on Base L2 with low-latency order matching.",
    accent: "#FFB800",
    accentBg: "rgba(255,184,0,0.12)",
    letter: "L",
    status: "available",
    phase: "Phase 2",
    volume: "$2.1B",
    markets: "180+",
    chain: "Base L2",
    feature: "High-frequency trading",
  },
  {
    id: "myriad",
    name: "Myriad",
    description: "Multi-chain prediction platform with AMM-based trading across Abstract, Linea, and Celo.",
    accent: "#FF6B6B",
    accentBg: "rgba(255,107,107,0.12)",
    letter: "M",
    status: "available",
    phase: "Phase 2",
    volume: "$890M",
    markets: "320+",
    users: "511K",
    chain: "Abstract, Linea, Celo",
    feature: "AMM model",
  },
  {
    id: "forecastex",
    name: "ForecastEx",
    description: "Interactive Brokers event futures exchange. Institutional-grade, macro-focused event contracts.",
    accent: "#666666",
    accentBg: "rgba(102,102,102,0.12)",
    letter: "F",
    status: "coming-soon",
    phase: "Phase 3",
    volume: "TBD",
    markets: "50+",
    feature: "Institutional/macro-focused",
  },
  {
    id: "robinhood-kalshi",
    name: "Robinhood / Kalshi",
    description: "Retail prediction market access via Robinhood app through Kalshi data partnership.",
    accent: "#666666",
    accentBg: "rgba(102,102,102,0.12)",
    letter: "R",
    status: "coming-soon",
    phase: "Phase 3",
    volume: "TBD",
    markets: "TBD",
    feature: "Via Kalshi data partnership",
  },
];

const API_KEYS = [
  {
    venue: "Polymarket",
    key: "pk_live_••••••••••••7f3a",
    status: "active" as const,
    lastSync: "2 min ago",
    accent: "#00FF85",
  },
  {
    venue: "Kalshi",
    key: "ks_prod_••••••••••••9b2e",
    status: "active" as const,
    lastSync: "5 min ago",
    accent: "#4DA6FF",
  },
  {
    venue: "Opinion Labs",
    key: "ol_api_••••••••••••4d1c",
    status: "active" as const,
    lastSync: "1 min ago",
    accent: "#C084FC",
  },
];

/* ── Helpers ── */

function StatusDot({ status }: { status: VenueStatus }) {
  const colors: Record<VenueStatus, string> = {
    connected: "bg-signal-green",
    available: "bg-signal-amber",
    "coming-soon": "bg-text-muted",
  };
  return (
    <span className="relative flex h-2 w-2">
      {status === "connected" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-40" />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${colors[status]}`} />
    </span>
  );
}

function StatusLabel({ status }: { status: VenueStatus }) {
  const labels: Record<VenueStatus, string> = {
    connected: "Connected",
    available: "Available",
    "coming-soon": "Coming Soon",
  };
  const colors: Record<VenueStatus, string> = {
    connected: "text-signal-green",
    available: "text-signal-amber",
    "coming-soon": "text-text-muted",
  };
  return (
    <div className="flex items-center gap-1.5">
      <StatusDot status={status} />
      <span className={`text-[10px] font-medium ${colors[status]}`}>{labels[status]}</span>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    MVP: "bg-signal-green/10 text-signal-green",
    "Phase 2": "bg-signal-amber/10 text-signal-amber",
    "Phase 3": "bg-text-muted/15 text-text-muted",
  };
  return (
    <span className={`rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold ${styles[phase]}`}>
      {phase.toUpperCase()}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-text-quaternary">{label}</span>
      <span className="text-numbers-10 text-text-secondary">{value}</span>
    </div>
  );
}

/* ── Venue Card ── */

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -3 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
      className="group flex flex-col rounded-[18px] bg-bg-base-1 transition-colors duration-200 hover:bg-bg-base-2"
      style={{
        boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${venue.accent}55, 0 0 20px ${venue.accent}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px var(--color-divider-heavy)";
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {(() => {
          const LogoComponent = VENUE_LOGOS[venue.id];
          if (LogoComponent) {
            return <LogoComponent size={40} />;
          }
          return (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-bold"
              style={{ backgroundColor: venue.accentBg, color: venue.accent }}
            >
              {venue.letter}
            </div>
          );
        })()}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body-12 font-semibold text-text-primary">{venue.name}</span>
            <PhaseBadge phase={venue.phase} />
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary line-clamp-2">
            {venue.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        className="mx-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-divider-thin py-3"
      >
        <InfoRow label="Volume" value={venue.volume} />
        <InfoRow label="Markets" value={venue.markets} />
        {venue.users && <InfoRow label="Users" value={venue.users} />}
        {venue.chain && <InfoRow label="Chain" value={venue.chain} />}
        {venue.settlement && <InfoRow label="Settlement" value={venue.settlement} />}
        {venue.oracle && <InfoRow label="Oracle" value={venue.oracle} />}
        {venue.api && <InfoRow label="API" value={venue.api} />}
        {venue.auth && <InfoRow label="Auth" value={venue.auth} />}
        {venue.regulation && <InfoRow label="Regulation" value={venue.regulation} />}
        {venue.feature && <InfoRow label="Feature" value={venue.feature} />}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-divider-thin px-4 py-3">
        <StatusLabel status={venue.status} />

        {venue.status === "connected" && venue.connectionLabel && (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-signal-green" style={{ backgroundColor: "rgba(0,255,133,0.08)" }}>
            {venue.connectionLabel}
          </span>
        )}

        {venue.status === "connected" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => alert(`Disconnect from ${venue.name} — API key management coming soon.`)}
            className="flex h-6 items-center gap-1 rounded-[4px] px-2 text-[10px] font-medium text-text-secondary outline outline-1 -outline-offset-1 outline-divider-heavy transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
          >
            <Unlink className="h-3 w-3" />
            Disconnect
          </motion.button>
        )}
        {venue.status === "available" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => alert(`${venue.name} API connection coming soon. You'll be able to add your API keys to trade directly.`)}
            className="flex h-6 items-center gap-1 rounded-[4px] px-2 text-[10px] font-semibold text-bg-base-0 transition-colors"
            style={{ backgroundColor: venue.accent }}
          >
            <Link2 className="h-3 w-3" />
            Connect
          </motion.button>
        )}
        {venue.status === "coming-soon" && (
          <button
            disabled
            className="flex h-6 cursor-not-allowed items-center gap-1 rounded-[4px] bg-bg-base-3 px-2 text-[10px] font-medium text-text-muted"
          >
            <Lock className="h-3 w-3" />
            Coming Soon
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Pipeline Stage Wrapper ── */

function PipelineStage({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      variants={pipelineStageVariant}
      custom={index}
    >
      {children}
    </motion.div>
  );
}

function PipelineArrow({ index }: { index: number }) {
  return (
    <motion.div
      variants={pipelineArrowVariant}
      className="flex flex-col items-center px-4"
      style={{ originX: 0 }}
    >
      <div className="h-px w-12 bg-divider-heavy" />
      <ArrowRight className="my-1 h-4 w-4 text-text-muted" />
      <div className="h-px w-12 bg-divider-heavy" />
    </motion.div>
  );
}

/* ── Main Page ── */

export default function VenuesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "connected" | "available">("all");

  const filteredVenues =
    activeTab === "all"
      ? VENUES
      : activeTab === "connected"
        ? VENUES.filter((v) => v.status === "connected")
        : VENUES.filter((v) => v.status !== "connected");

  const connectedCount = VENUES.filter((v) => v.status === "connected").length;
  const { stats } = useMarketStats();
  const totalMarkets = stats ? stats.totalMarkets.toLocaleString() : "—";
  const totalVolume24h = stats ? formatVolume(stats.totalVolume24h) : "—";
  const totalLiquidity = stats ? formatVolume(stats.totalLiquidity) : "—";

  const pipelineStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      {/* Sub-header */}
      <motion.div
        variants={subHeaderVariant}
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="flex h-6 items-center rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          VENUE INTEGRATIONS
        </div>
        <motion.div
          className="ml-4 hidden items-center gap-4 md:flex"
          variants={statsStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={statVariant} className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Connected Venues</span>
            <span className="text-numbers-12 font-medium text-signal-green">
              {connectedCount}/{VENUES.length}
            </span>
          </motion.div>
          <motion.div variants={statVariant} className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Total Markets</span>
            <span className="text-numbers-12 font-medium text-text-primary">{totalMarkets}</span>
          </motion.div>
          <motion.div variants={statVariant} className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">24h Volume</span>
            <span className="text-numbers-12 font-medium text-signal-green">{totalVolume24h}</span>
          </motion.div>
          <motion.div variants={statVariant} className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Liquidity</span>
            <span className="text-numbers-12 font-medium text-text-primary">{totalLiquidity}</span>
          </motion.div>
          <motion.div variants={statVariant} className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Data Freshness</span>
            <span className="flex items-center gap-1 text-numbers-12 font-medium text-signal-green">
              <Activity className="h-3 w-3" />
              Real-time
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Page content */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="flex flex-col gap-2">

          {/* Section 1: Connected Venues */}
          <motion.div
            variants={sectionVariant}
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex h-10 items-center justify-between px-4"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-signal-green" />
                <span className="text-body-12 font-semibold text-text-primary">
                  Prediction Market Venues
                </span>
                <span className="rounded-full bg-bg-base-3 px-1.5 py-0.5 text-[9px] font-bold text-text-quaternary">
                  {VENUES.length}
                </span>
              </div>
              <div className="relative flex items-center gap-1">
                {(["all", "connected", "available"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative rounded-[4px] px-2 py-0.5 text-[10px] font-medium transition-colors duration-150 ${
                      activeTab === tab
                        ? "text-text-primary"
                        : "text-text-quaternary hover:text-text-primary"
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="venue-tab"
                        className="absolute inset-0 rounded-[4px] bg-action-translucent-hover"
                        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab === "all" ? "All" : tab === "connected" ? "Connected" : "Available"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  className="col-span-full grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  variants={cardsStagger}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {filteredVenues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Section 2: Venue Connector Architecture */}
          <motion.div
            variants={sectionVariant}
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex h-10 items-center gap-2 px-4"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <Database className="h-4 w-4 text-signal-blue" />
              <span className="text-body-12 font-semibold text-text-primary">
                Venue-Agnostic Architecture
              </span>
            </div>

            <div className="p-4">
              {/* Pipeline diagram */}
              <motion.div
                className="flex items-center justify-center gap-0 overflow-x-auto py-4"
                variants={pipelineStagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Raw Data Sources */}
                <PipelineStage index={0}>
                  <div className="flex flex-col gap-1.5">
                    <div className="mb-1 text-center text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                      Raw Data
                    </div>
                    {[
                      { name: "Polymarket", format: "CLOB JSON", color: "#00FF85" },
                      { name: "Kalshi", format: "REST JSON", color: "#4DA6FF" },
                      { name: "Opinion Labs", format: "WS Stream", color: "#C084FC" },
                    ].map((src) => (
                      <div
                        key={src.name}
                        className="flex items-center gap-2 rounded-[8px] bg-bg-base-2 px-3 py-2"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                      >
                        {(() => {
                          const id = src.name.toLowerCase().replace(/ /g, "-");
                          const Logo = VENUE_LOGOS[id];
                          return Logo ? <Logo size={16} /> : <div className="h-2 w-2 rounded-full" style={{ backgroundColor: src.color }} />;
                        })()}
                        <div>
                          <div className="text-[11px] font-medium text-text-primary">{src.name}</div>
                          <div className="text-[9px] font-mono text-text-quaternary">{src.format}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PipelineStage>

                {/* Arrow */}
                <PipelineArrow index={1} />

                {/* Venue Connectors */}
                <PipelineStage index={2}>
                  <div className="flex flex-col gap-1.5">
                    <div className="mb-1 text-center text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                      Venue Connectors
                    </div>
                    {[
                      { name: "Polymarket Connector", color: "#00FF85" },
                      { name: "Kalshi Connector", color: "#4DA6FF" },
                      { name: "Opinion Labs Connector", color: "#C084FC" },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 rounded-[8px] px-3 py-2"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.3)",
                          boxShadow: `inset 0 0 0 1px ${c.color}33`,
                        }}
                      >
                        {(() => {
                          const id = c.name.replace(" Connector", "").toLowerCase().replace(/ /g, "-");
                          const Logo = VENUE_LOGOS[id];
                          return Logo ? <Logo size={16} /> : <Zap className="h-3 w-3" style={{ color: c.color }} />;
                        })()}
                        <span className="text-[11px] font-medium text-text-primary">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </PipelineStage>

                {/* Arrow */}
                <PipelineArrow index={3} />

                {/* Normalized Schema */}
                <PipelineStage index={4}>
                  <div className="flex flex-col gap-1.5">
                    <div className="mb-1 text-center text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                      Normalized Schema
                    </div>
                    <div
                      className="rounded-[8px] bg-bg-base-2 px-4 py-3"
                      style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                    >
                      <div className="space-y-1 font-mono text-[10px] text-text-secondary">
                        <div><span className="text-signal-purple">market</span>: MarketSchema</div>
                        <div><span className="text-signal-green">price</span>: ProbabilitySchema</div>
                        <div><span className="text-signal-blue">order</span>: UnifiedOrderSchema</div>
                        <div><span className="text-signal-amber">risk</span>: RiskScoreSchema</div>
                      </div>
                    </div>
                  </div>
                </PipelineStage>

                {/* Arrow */}
                <PipelineArrow index={5} />

                {/* Pythia Analytics */}
                <PipelineStage index={6}>
                  <div className="flex flex-col gap-1.5">
                    <div className="mb-1 text-center text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                      Pythia Analytics
                    </div>
                    <div
                      className="rounded-[8px] px-4 py-3"
                      style={{
                        backgroundColor: "rgba(0,255,133,0.06)",
                        boxShadow: "inset 0 0 0 1px rgba(0,255,133,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-signal-green" />
                        <div>
                          <div className="text-[11px] font-semibold text-text-primary">Core Engine</div>
                          <div className="text-[9px] text-text-quaternary">Arb detection, signals, risk</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PipelineStage>
              </motion.div>

              {/* Tagline */}
              <motion.div
                className="mt-2 text-center text-[11px] italic text-text-secondary"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" as const }}
              >
                Adding a new venue requires zero changes to core analytics
              </motion.div>

              {/* Technical notes */}
              <motion.div
                className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3"
                variants={noteCardsStagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {[
                  {
                    icon: <Zap className="h-3.5 w-3.5 text-signal-green" />,
                    title: "Cross-Venue Arb",
                    detail: "Simultaneous execution -- no orphan legs",
                  },
                  {
                    icon: <BarChart3 className="h-3.5 w-3.5 text-signal-blue" />,
                    title: "Price Normalization",
                    detail: "All prices converted to probability (0-100)",
                  },
                  {
                    icon: <Shield className="h-3.5 w-3.5 text-signal-purple" />,
                    title: "Settlement Mapping",
                    detail: "Different oracles mapped to unified risk score",
                  },
                ].map((note) => (
                  <motion.div
                    key={note.title}
                    variants={noteCardVariant}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                    className="rounded-[10px] bg-bg-base-2 p-3"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      {note.icon}
                      <span className="text-[11px] font-semibold text-text-primary">{note.title}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{note.detail}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Section 3: API Keys & Credentials */}
          <motion.div
            variants={sectionVariant}
            className="rounded-[18px] bg-bg-base-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
          >
            <div
              className="flex h-10 items-center justify-between px-4"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-signal-amber" />
                <span className="text-body-12 font-semibold text-text-primary">
                  API Keys &amp; Credentials
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-6 items-center gap-1 rounded-[4px] bg-signal-green px-2 text-[10px] font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover"
              >
                <Plus className="h-3 w-3" />
                Add API Key
              </motion.button>
            </div>

            {/* Table header */}
            <div className="overflow-x-auto">
            <div className="min-w-[580px]">
            <div
              className="grid grid-cols-[1fr_200px_80px_100px_100px] gap-4 px-4 py-2 text-[10px] font-medium uppercase text-text-quaternary"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
            >
              <span>Venue</span>
              <span>API Key</span>
              <span>Status</span>
              <span>Last Sync</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table rows */}
            <motion.div
              variants={tableStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {API_KEYS.map((row) => (
                <motion.div
                  key={row.venue}
                  variants={tableRowVariant}
                  className="grid grid-cols-[1fr_200px_80px_100px_100px] items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-action-translucent-hover"
                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const venueId = row.venue.toLowerCase().replace(/ /g, "-");
                      const LogoComponent = VENUE_LOGOS[venueId];
                      if (LogoComponent) {
                        return <LogoComponent size={24} />;
                      }
                      return (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[10px] font-bold"
                          style={{ backgroundColor: `${row.accent}1A`, color: row.accent }}
                        >
                          {row.venue[0]}
                        </div>
                      );
                    })()}
                    <span className="text-body-12 font-medium text-text-primary">{row.venue}</span>
                  </div>
                  <span className="font-mono text-numbers-12 text-text-secondary">{row.key}</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-signal-green" />
                    <span className="text-[10px] font-medium text-signal-green">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-text-quaternary" />
                    <span className="text-numbers-10 text-text-secondary">{row.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-secondary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
                      title="Rotate key"
                    >
                      <RotateCw className="h-3 w-3" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-secondary transition-colors hover:bg-action-fall-dim hover:text-[#FF3B3B]"
                      title="Remove key"
                    >
                      <Trash2 className="h-3 w-3" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
