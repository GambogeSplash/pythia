"use client";

import { useState } from "react";
import { Widget } from "@/components/ui/widget";
import { GitBranch } from "lucide-react";

// ---------- Types ----------

interface CorrelationPair {
  id: string;
  marketA: { id: string; icon: string; title: string };
  marketB: { id: string; icon: string; title: string };
  coefficient: number;
  trend: "strengthening" | "weakening" | "stable";
  category: string;
}

interface CascadeEvent {
  id: string;
  icon: string;
  name: string;
  date: string;
  impacts: {
    marketId: string;
    marketTitle: string;
    direction: "up" | "down";
    strength: number; // 0-1
    label: string;
  }[];
}

/* Awaiting historical data integration */

// ---------- Helpers ----------

function coefficientColor(coeff: number): string {
  const abs = Math.abs(coeff);
  if (abs >= 0.7) return coeff > 0 ? "text-signal-green" : "text-signal-red";
  if (abs >= 0.4) return "text-signal-amber";
  return "text-text-tertiary";
}

function coefficientBadgeVariant(coeff: number): "green" | "red" | "amber" {
  if (coeff >= 0.4) return "green";
  if (coeff <= -0.4) return "red";
  return "amber";
}

function trendIcon(trend: "strengthening" | "weakening" | "stable"): string {
  if (trend === "strengthening") return "\u25B2";
  if (trend === "weakening") return "\u25BC";
  return "\u25CF";
}

function trendColor(trend: "strengthening" | "weakening" | "stable"): string {
  if (trend === "strengthening") return "text-signal-green";
  if (trend === "weakening") return "text-signal-red";
  return "text-text-quaternary";
}

// ---------- Tabs ----------

const tabs = ["Market Pairs", "Event Cascades"] as const;
type Tab = (typeof tabs)[number];

// ---------- Component ----------

export function CorrelationWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("Market Pairs");

  return (
    <Widget
      id="correlation"
      title="Correlation Board"
      icon={<GitBranch className="h-3.5 w-3.5 text-text-tertiary" />}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-signal-green text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content — Empty State */}
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <GitBranch className="mb-2 h-8 w-8 text-text-muted" />
        <p className="text-body-12 text-text-quaternary text-center">Correlation analysis requires historical data</p>
      </div>
    </Widget>
  );
}
