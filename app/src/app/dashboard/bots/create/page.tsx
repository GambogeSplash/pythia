"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  TrendingUp,
  Brain,
  Newspaper,
  Shield,
  Copy,
  Bot,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  Rocket,
  FileText,
  AlertTriangle,
  BarChart3,
  Target,
  Sliders,
  Settings,
  Activity,
} from "lucide-react";

/* ── Bot Types ────────────────────────────────────────────────────── */

const BOT_TYPES = [
  {
    id: "arbitrage",
    icon: Zap,
    name: "Arbitrage Bot",
    desc: "Detects YES + NO < $1 on same venue, or cross-platform price divergence. Fee-aware, settlement-aware.",
    difficulty: "Intermediate",
    avgReturn: "+12-24% APY",
    color: "#FFB800",
  },
  {
    id: "momentum",
    icon: TrendingUp,
    name: "Momentum Bot",
    desc: "Rides or fades trending probability swings. Signal-triggered from heatmap thresholds.",
    difficulty: "Beginner",
    avgReturn: "+8-18% APY",
    color: "#00FF85",
  },
  {
    id: "alpha",
    icon: Brain,
    name: "Alpha Bot",
    desc: "Scans for Pythia Score anomalies, insider wallet clusters, sentiment-price divergence.",
    difficulty: "Advanced",
    avgReturn: "+15-35% APY",
    color: "#9B59FF",
  },
  {
    id: "news-reactor",
    icon: Newspaper,
    name: "News Reactor",
    desc: "Monitors live news feeds for keywords. Evaluates affected markets and places pre-set orders.",
    difficulty: "Intermediate",
    avgReturn: "+10-28% APY",
    color: "#4DA6FF",
  },
  {
    id: "portfolio-guard",
    icon: Shield,
    name: "Portfolio Guard",
    desc: "Exposure rebalancer, drawdown guard, Kelly-based position sizer. Auto allocation management.",
    difficulty: "Beginner",
    avgReturn: "Risk mgmt",
    color: "#2DD4BF",
  },
  {
    id: "copy-trade",
    icon: Copy,
    name: "Copy Trading Bot",
    desc: "Follow traders by wallet. Full or scaled copy, category-specific, whitelist/blacklist.",
    difficulty: "Beginner",
    avgReturn: "Mirrors target",
    color: "#FF8664",
  },
];

/* ── Trigger / Action Options ─────────────────────────────────────── */

const TRIGGER_OPTIONS = [
  "Price moves > X%",
  "Volume spike > X%",
  "Pythia Score < X",
  "Sentiment diverges",
  "Whale entry detected",
  "News keyword match",
];

const ACTION_OPTIONS = [
  "Buy YES",
  "Buy NO",
  "Sell position",
  "Adjust size",
  "Send alert",
];

const MARKET_CATEGORIES = ["Politics", "Macro", "Crypto", "Sports", "Culture"];
const VENUES = ["Polymarket", "Kalshi", "Opinion Labs"];

/* ── Types ────────────────────────────────────────────────────────── */

interface TriggerAction {
  trigger: string;
  threshold: number;
  action: string;
  positionSize: number;
  maxPositions: number;
  stopLoss: number;
  takeProfit: number;
}

interface BotSettings {
  botName: string;
  capital: number;
  maxDrawdown: number;
  markets: string[];
  venues: string[];
  mode: "live" | "paper";
  riskLevel: "conservative" | "moderate" | "aggressive";
}

/* ── Slider Component ─────────────────────────────────────────────── */

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] text-text-quaternary">{label}</span>
        <span className="text-numbers-12 font-medium text-text-primary">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-green h-1 w-full cursor-pointer appearance-none rounded-full bg-bg-base-3"
          style={{
            background: `linear-gradient(to right, var(--color-signal-green) 0%, var(--color-signal-green) ${pct}%, var(--color-bg-base-3) ${pct}%, var(--color-bg-base-3) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Dropdown Component ───────────────────────────────────────────── */

function Dropdown({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-full items-center justify-between rounded-[6px] bg-bg-base-3 px-3 text-body-12 text-text-primary transition-colors hover:bg-action-translucent-hover"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-thin)" }}
      >
        <span className={value ? "text-text-primary" : "text-text-quaternary"}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-3 w-3 text-text-quaternary" />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-9 z-50 rounded-[8px] bg-bg-base-2 py-1"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.6), inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-1.5 text-body-12 transition-colors hover:bg-action-translucent-hover ${
                value === opt ? "text-signal-green" : "text-text-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */

export default function BotCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBotType, setSelectedBotType] = useState("");
  const [deploying, setDeploying] = useState(false);

  const [triggerActions, setTriggerActions] = useState<TriggerAction[]>([
    {
      trigger: "Price moves > X%",
      threshold: 15,
      action: "Buy YES",
      positionSize: 500,
      maxPositions: 5,
      stopLoss: 10,
      takeProfit: 25,
    },
  ]);

  const [settings, setSettings] = useState<BotSettings>({
    botName: "",
    capital: 5000,
    maxDrawdown: 15,
    markets: ["Politics", "Crypto"],
    venues: ["Polymarket"],
    mode: "paper",
    riskLevel: "moderate",
  });

  const selectedType = BOT_TYPES.find((b) => b.id === selectedBotType);

  // Auto-set bot name when type is selected
  const handleSelectType = (id: string) => {
    setSelectedBotType(id);
    const bt = BOT_TYPES.find((b) => b.id === id);
    if (bt && !settings.botName) {
      setSettings((s) => ({ ...s, botName: `My ${bt.name}` }));
    }
  };

  const updateTriggerAction = (
    idx: number,
    field: keyof TriggerAction,
    value: string | number
  ) => {
    setTriggerActions((prev) =>
      prev.map((ta, i) => (i === idx ? { ...ta, [field]: value } : ta))
    );
  };

  const addCondition = () => {
    if (triggerActions.length >= 3) return;
    setTriggerActions((prev) => [
      ...prev,
      {
        trigger: "Volume spike > X%",
        threshold: 20,
        action: "Buy NO",
        positionSize: 300,
        maxPositions: 3,
        stopLoss: 8,
        takeProfit: 20,
      },
    ]);
  };

  const removeCondition = (idx: number) => {
    if (triggerActions.length <= 1) return;
    setTriggerActions((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleMarket = (m: string) => {
    setSettings((s) => ({
      ...s,
      markets: s.markets.includes(m)
        ? s.markets.filter((x) => x !== m)
        : [...s.markets, m],
    }));
  };

  const toggleVenue = (v: string) => {
    setSettings((s) => ({
      ...s,
      venues: s.venues.includes(v)
        ? s.venues.filter((x) => x !== v)
        : [...s.venues, v],
    }));
  };

  const canProceed =
    (currentStep === 1 && selectedBotType !== "") ||
    (currentStep === 2 && settings.botName.trim() !== "") ||
    currentStep === 3;

  const handleDeploy = async (mode: "live" | "paper") => {
    if (deploying) return;
    setDeploying(true);
    try {
      const res = await fetch("/api/user/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settings.botName,
          type: selectedBotType,
          status: mode === "paper" ? "paused" : "running",
          mode,
          capital: settings.capital,
          config: {
            maxDrawdown: settings.maxDrawdown,
            markets: settings.markets,
            venues: settings.venues,
            riskLevel: settings.riskLevel,
            triggerActions,
          },
        }),
      });
      if (res.ok) {
        await mutate("/api/user/bots");
        router.push("/dashboard/bots");
      } else {
        alert("Failed to deploy bot. Please try again.");
      }
    } catch {
      alert("Failed to deploy bot. Please try again.");
    } finally {
      setDeploying(false);
    }
  };

  /* ── Step indicators ────────────────────────────────────────────── */
  const steps = [
    { n: 1, label: "Choose Type" },
    { n: 2, label: "Configure" },
    { n: 3, label: "Review" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header */}
      <div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <Link
          href="/dashboard/bots"
          className="mr-2 flex h-5 w-5 items-center justify-center rounded text-text-quaternary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Bot className="h-3 w-3 text-signal-green" />
          BOT BUILDER
        </div>

        {/* Step indicator */}
        <div className="ml-4 flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-1">
              {i > 0 && (
                <div
                  className={`h-px w-6 ${
                    currentStep > s.n - 1
                      ? "bg-signal-green"
                      : "bg-divider-heavy"
                  }`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  currentStep === s.n
                    ? "bg-signal-green/15 text-signal-green"
                    : currentStep > s.n
                    ? "bg-action-rise-dim text-action-rise"
                    : "bg-bg-base-3 text-text-quaternary"
                }`}
              >
                {currentStep > s.n ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{s.n}</span>
                )}
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="ml-auto text-numbers-12 text-text-quaternary">
          Step {currentStep}/3
        </div>
      </div>

      {/* Content area */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        {/* ─── STEP 1: Choose Bot Type ─────────────────────────────── */}
        {currentStep === 1 && (
          <div className="flex flex-1 flex-col">
            <div
              className="flex-1 rounded-[18px] bg-bg-base-1 p-6"
              style={{
                boxShadow:
                  "inset 0 0 0 1px var(--color-divider-heavy)",
              }}
            >
              <div className="mb-1 text-body-12 font-semibold text-text-primary">
                Choose Bot Type
              </div>
              <p className="mb-6 text-[10px] text-text-quaternary">
                Select the strategy archetype for your bot. You can customize
                triggers and parameters in the next step.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {BOT_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  const isSelected = selectedBotType === bt.id;
                  return (
                    <button
                      key={bt.id}
                      onClick={() => handleSelectType(bt.id)}
                      className={`flex flex-col rounded-[12px] bg-bg-base-2 p-4 text-left transition-all duration-150 hover:bg-action-translucent-hover ${
                        isSelected ? "ring-1 ring-signal-green" : ""
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? "inset 0 0 0 1px #00FF85"
                          : "inset 0 0 0 1px var(--color-divider-thin)",
                      }}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[8px]"
                          style={{
                            backgroundColor: `${bt.color}20`,
                            color: bt.color,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-signal-green">
                              <Check className="h-3 w-3 text-bg-base-0" />
                            </div>
                          )}
                          <span className="rounded-full bg-bg-base-3 px-2 py-0.5 text-[9px] text-text-quaternary">
                            {bt.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="text-body-12 font-semibold text-text-primary">
                        {bt.name}
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-text-quaternary">
                        {bt.desc}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-numbers-10 text-text-quaternary">
                          Avg Return
                        </span>
                        <span className="text-numbers-10 font-medium text-action-rise">
                          {bt.avgReturn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Configure Strategy ──────────────────────────── */}
        {currentStep === 2 && (
          <div className="flex min-h-0 flex-1 gap-2">
            {/* Left: Logic Builder (2/3) */}
            <div
              className="flex min-h-0 flex-[2] flex-col rounded-[18px] bg-bg-base-1"
              style={{
                boxShadow:
                  "inset 0 0 0 1px var(--color-divider-heavy)",
              }}
            >
              <div
                className="flex h-10 items-center gap-2 px-4"
                style={{
                  boxShadow:
                    "inset 0 -1px 0 0 var(--color-divider-heavy)",
                }}
              >
                <Sliders className="h-3.5 w-3.5 text-signal-green" />
                <span className="text-body-12 font-semibold text-text-primary">
                  Logic Builder
                </span>
                <span className="ml-auto text-[10px] text-text-quaternary">
                  {triggerActions.length}/3 conditions
                </span>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {triggerActions.map((ta, idx) => (
                    <div key={idx} className="relative">
                      {/* Condition block */}
                      <div
                        className="rounded-[12px] bg-bg-base-2 p-4"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px var(--color-divider-thin)",
                        }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase text-text-quaternary">
                            Condition {idx + 1}
                          </span>
                          {triggerActions.length > 1 && (
                            <button
                              onClick={() => removeCondition(idx)}
                              className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-action-fall-dim hover:text-action-fall"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex gap-3">
                          {/* IF block */}
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-1.5">
                              <div className="flex h-5 items-center rounded bg-signal-blue/15 px-1.5 text-[10px] font-bold text-signal-blue">
                                IF
                              </div>
                              <span className="text-[10px] text-text-quaternary">
                                Trigger
                              </span>
                            </div>
                            <Dropdown
                              value={ta.trigger}
                              options={TRIGGER_OPTIONS}
                              onChange={(v) =>
                                updateTriggerAction(idx, "trigger", v)
                              }
                              placeholder="Select trigger..."
                            />

                            <div className="mt-3">
                              <ParamSlider
                                label="Threshold"
                                value={ta.threshold}
                                min={0}
                                max={100}
                                step={1}
                                suffix="%"
                                onChange={(v) =>
                                  updateTriggerAction(idx, "threshold", v)
                                }
                              />
                            </div>
                          </div>

                          {/* Connector */}
                          <div className="flex flex-col items-center justify-center px-2">
                            <div className="h-full w-px bg-divider-heavy" />
                            <div className="my-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg-base-3">
                              <ArrowRight className="h-3 w-3 text-signal-green" />
                            </div>
                            <div className="h-full w-px bg-divider-heavy" />
                          </div>

                          {/* THEN block */}
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-1.5">
                              <div className="flex h-5 items-center rounded bg-signal-green/15 px-1.5 text-[10px] font-bold text-signal-green">
                                THEN
                              </div>
                              <span className="text-[10px] text-text-quaternary">
                                Action
                              </span>
                            </div>
                            <Dropdown
                              value={ta.action}
                              options={ACTION_OPTIONS}
                              onChange={(v) =>
                                updateTriggerAction(idx, "action", v)
                              }
                              placeholder="Select action..."
                            />

                            <div className="mt-3">
                              <ParamSlider
                                label="Position Size"
                                value={ta.positionSize}
                                min={100}
                                max={10000}
                                step={100}
                                prefix="$"
                                onChange={(v) =>
                                  updateTriggerAction(idx, "positionSize", v)
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional params */}
                        <div
                          className="mt-3 grid grid-cols-3 gap-4 border-t pt-3"
                          style={{
                            borderColor: "var(--color-divider-thin)",
                          }}
                        >
                          <ParamSlider
                            label="Max Positions"
                            value={ta.maxPositions}
                            min={1}
                            max={20}
                            step={1}
                            onChange={(v) =>
                              updateTriggerAction(idx, "maxPositions", v)
                            }
                          />
                          <ParamSlider
                            label="Stop Loss"
                            value={ta.stopLoss}
                            min={1}
                            max={50}
                            step={1}
                            suffix="%"
                            onChange={(v) =>
                              updateTriggerAction(idx, "stopLoss", v)
                            }
                          />
                          <ParamSlider
                            label="Take Profit"
                            value={ta.takeProfit}
                            min={1}
                            max={100}
                            step={1}
                            suffix="%"
                            onChange={(v) =>
                              updateTriggerAction(idx, "takeProfit", v)
                            }
                          />
                        </div>
                      </div>

                      {/* Connector between blocks */}
                      {idx < triggerActions.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="flex h-6 items-center gap-1 rounded-full bg-bg-base-3 px-2 text-[9px] font-semibold text-text-quaternary">
                            AND
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {triggerActions.length < 3 && (
                  <button
                    onClick={addCondition}
                    className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-divider-heavy bg-bg-base-2/50 text-body-12 font-medium text-text-quaternary transition-colors hover:border-signal-green/30 hover:text-text-secondary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Condition
                  </button>
                )}
              </div>
            </div>

            {/* Right: Settings (1/3) */}
            <div
              className="flex min-h-0 flex-1 flex-col rounded-[18px] bg-bg-base-1"
              style={{
                boxShadow:
                  "inset 0 0 0 1px var(--color-divider-heavy)",
              }}
            >
              <div
                className="flex h-10 items-center gap-2 px-4"
                style={{
                  boxShadow:
                    "inset 0 -1px 0 0 var(--color-divider-heavy)",
                }}
              >
                <Settings className="h-3.5 w-3.5 text-text-secondary" />
                <span className="text-body-12 font-semibold text-text-primary">
                  Settings
                </span>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {/* Bot name */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={settings.botName}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, botName: e.target.value }))
                    }
                    placeholder="My Arbitrage Bot"
                    className="h-8 w-full rounded-[6px] bg-bg-base-3 px-3 text-body-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-signal-green"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                  />
                </div>

                {/* Capital allocation */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Capital Allocation
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-12 text-text-quaternary">
                      $
                    </span>
                    <input
                      type="number"
                      value={settings.capital}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          capital: Number(e.target.value),
                        }))
                      }
                      className="h-8 w-full rounded-[6px] bg-bg-base-3 pl-7 pr-3 text-numbers-12 text-text-primary focus:outline-none focus:ring-1 focus:ring-signal-green"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px var(--color-divider-thin)",
                      }}
                    />
                  </div>
                </div>

                {/* Max drawdown */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Max Drawdown
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.maxDrawdown}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          maxDrawdown: Number(e.target.value),
                        }))
                      }
                      className="h-8 w-full rounded-[6px] bg-bg-base-3 pl-3 pr-7 text-numbers-12 text-text-primary focus:outline-none focus:ring-1 focus:ring-signal-green"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px var(--color-divider-thin)",
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-body-12 text-text-quaternary">
                      %
                    </span>
                  </div>
                </div>

                {/* Markets */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Markets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MARKET_CATEGORIES.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleMarket(m)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                          settings.markets.includes(m)
                            ? "bg-signal-green/15 text-signal-green"
                            : "bg-bg-base-3 text-text-quaternary hover:text-text-secondary"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Venues */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Venues
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VENUES.map((v) => (
                      <button
                        key={v}
                        onClick={() => toggleVenue(v)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                          settings.venues.includes(v)
                            ? "bg-signal-green/15 text-signal-green"
                            : "bg-bg-base-3 text-text-quaternary hover:text-text-secondary"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Mode
                  </label>
                  <div
                    className="flex rounded-[6px] bg-bg-base-3 p-0.5"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                  >
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, mode: "paper" }))
                      }
                      className={`flex-1 rounded-[4px] py-1.5 text-[10px] font-semibold transition-colors ${
                        settings.mode === "paper"
                          ? "bg-signal-amber/15 text-signal-amber"
                          : "text-text-quaternary hover:text-text-secondary"
                      }`}
                    >
                      Paper
                    </button>
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, mode: "live" }))
                      }
                      className={`flex-1 rounded-[4px] py-1.5 text-[10px] font-semibold transition-colors ${
                        settings.mode === "live"
                          ? "bg-action-rise-dim text-action-rise"
                          : "text-text-quaternary hover:text-text-secondary"
                      }`}
                    >
                      Live
                    </button>
                  </div>
                </div>

                {/* Risk level */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-text-quaternary">
                    Risk Level
                  </label>
                  <div
                    className="flex rounded-[6px] bg-bg-base-3 p-0.5"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                  >
                    {(
                      [
                        { id: "conservative" as const, label: "Conservative", color: "text-signal-blue bg-signal-blue/15" },
                        { id: "moderate" as const, label: "Moderate", color: "text-signal-amber bg-signal-amber/15" },
                        { id: "aggressive" as const, label: "Aggressive", color: "text-action-fall bg-action-fall-dim" },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        onClick={() =>
                          setSettings((s) => ({ ...s, riskLevel: r.id }))
                        }
                        className={`flex-1 rounded-[4px] py-1.5 text-[10px] font-semibold transition-colors ${
                          settings.riskLevel === r.id
                            ? r.color
                            : "text-text-quaternary hover:text-text-secondary"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review & Deploy ─────────────────────────────── */}
        {currentStep === 3 && (
          <div className="flex min-h-0 flex-1 gap-2">
            {/* Summary */}
            <div
              className="flex min-h-0 flex-[2] flex-col rounded-[18px] bg-bg-base-1"
              style={{
                boxShadow:
                  "inset 0 0 0 1px var(--color-divider-heavy)",
              }}
            >
              <div
                className="flex h-10 items-center gap-2 px-4"
                style={{
                  boxShadow:
                    "inset 0 -1px 0 0 var(--color-divider-heavy)",
                }}
              >
                <FileText className="h-3.5 w-3.5 text-signal-green" />
                <span className="text-body-12 font-semibold text-text-primary">
                  Configuration Summary
                </span>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {/* Bot overview */}
                <div
                  className="mb-4 rounded-[12px] bg-bg-base-2 p-4"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px var(--color-divider-thin)",
                  }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    {selectedType && (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-[8px]"
                        style={{
                          backgroundColor: `${selectedType.color}20`,
                          color: selectedType.color,
                        }}
                      >
                        <selectedType.icon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-body-12 font-semibold text-text-primary">
                        {settings.botName || "Unnamed Bot"}
                      </div>
                      <div className="text-[10px] text-text-quaternary">
                        {selectedType?.name} &middot;{" "}
                        {selectedType?.difficulty}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          settings.mode === "paper"
                            ? "bg-signal-amber-dim text-signal-amber"
                            : "bg-action-rise-dim text-action-rise"
                        }`}
                      >
                        {settings.mode === "paper" ? "Paper" : "Live"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] text-text-quaternary">
                        Capital
                      </div>
                      <div className="text-numbers-12 font-medium text-text-primary">
                        ${settings.capital.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-quaternary">
                        Max Drawdown
                      </div>
                      <div className="text-numbers-12 font-medium text-action-fall">
                        {settings.maxDrawdown}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-quaternary">
                        Risk Level
                      </div>
                      <div className="text-numbers-12 font-medium text-text-primary capitalize">
                        {settings.riskLevel}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-quaternary">
                        Conditions
                      </div>
                      <div className="text-numbers-12 font-medium text-text-primary">
                        {triggerActions.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trigger/Action summary */}
                <div className="mb-4">
                  <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">
                    Logic Rules
                  </div>
                  <div className="space-y-2">
                    {triggerActions.map((ta, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-[8px] bg-bg-base-2 px-3 py-2.5"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px var(--color-divider-thin)",
                        }}
                      >
                        <div className="flex h-5 items-center rounded bg-signal-blue/15 px-1.5 text-[9px] font-bold text-signal-blue">
                          IF
                        </div>
                        <span className="text-body-12 text-text-primary">
                          {ta.trigger}
                        </span>
                        <span className="text-numbers-12 font-medium text-signal-amber">
                          {ta.threshold}%
                        </span>
                        <ArrowRight className="h-3 w-3 text-text-muted" />
                        <div className="flex h-5 items-center rounded bg-signal-green/15 px-1.5 text-[9px] font-bold text-signal-green">
                          THEN
                        </div>
                        <span className="text-body-12 text-text-primary">
                          {ta.action}
                        </span>
                        <span className="text-numbers-12 text-text-secondary">
                          ${ta.positionSize.toLocaleString()}
                        </span>
                        <span className="ml-auto text-[10px] text-text-quaternary">
                          SL: {ta.stopLoss}% / TP: {ta.takeProfit}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Markets & Venues */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-[8px] bg-bg-base-2 p-3"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                  >
                    <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">
                      Markets
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {settings.markets.map((m) => (
                        <span
                          key={m}
                          className="rounded-full bg-signal-green/10 px-2 py-0.5 text-[10px] font-medium text-signal-green"
                        >
                          {m}
                        </span>
                      ))}
                      {settings.markets.length === 0 && (
                        <span className="text-[10px] text-text-muted">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="rounded-[8px] bg-bg-base-2 p-3"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px var(--color-divider-thin)",
                    }}
                  >
                    <div className="mb-2 text-[10px] font-medium uppercase text-text-quaternary">
                      Venues
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {settings.venues.map((v) => (
                        <span
                          key={v}
                          className="rounded-full bg-signal-blue/10 px-2 py-0.5 text-[10px] font-medium text-signal-blue"
                        >
                          {v}
                        </span>
                      ))}
                      {settings.venues.length === 0 && (
                        <span className="text-[10px] text-text-muted">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Estimated Metrics & Deploy */}
            <div className="flex flex-1 flex-col gap-2">
              <div
                className="rounded-[18px] bg-bg-base-1 p-4"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px var(--color-divider-heavy)",
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-chart-purple" />
                  <span className="text-body-12 font-semibold text-text-primary">
                    Estimated Risk Metrics
                  </span>
                </div>
                <p className="mb-3 text-[9px] text-text-muted">
                  Estimates based on historical backtests. Not financial advice.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-quaternary">
                      Expected PnL Range (30d)
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-numbers-12 text-action-fall">
                        -${Math.round(settings.capital * 0.08).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-text-muted">to</span>
                      <span className="text-numbers-12 text-action-rise">
                        +${Math.round(settings.capital * 0.22).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-quaternary">
                      Max Drawdown Estimate
                    </span>
                    <span className="text-numbers-12 font-medium text-action-fall">
                      -{settings.maxDrawdown}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-quaternary">
                      Sharpe Ratio Estimate
                    </span>
                    <span className="text-numbers-12 font-medium text-text-primary">
                      {settings.riskLevel === "conservative"
                        ? "1.8"
                        : settings.riskLevel === "moderate"
                        ? "1.4"
                        : "0.9"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-quaternary">
                      Win Rate Estimate
                    </span>
                    <span className="text-numbers-12 font-medium text-text-primary">
                      {settings.riskLevel === "conservative"
                        ? "72%"
                        : settings.riskLevel === "moderate"
                        ? "64%"
                        : "55%"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-quaternary">
                      Avg Trade Duration
                    </span>
                    <span className="text-numbers-12 text-text-secondary">
                      2.4 hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk warning */}
              {settings.mode === "live" && (
                <div
                  className="rounded-[12px] bg-action-fall-dim p-3"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255,59,59,0.2)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action-fall" />
                    <div>
                      <div className="text-[10px] font-semibold text-action-fall">
                        Live Trading Warning
                      </div>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-action-fall/70">
                        This bot will execute real trades with real funds. Start
                        with paper trading to validate your strategy first.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deploy actions */}
              <div
                className="flex-1 rounded-[18px] bg-bg-base-1 p-4"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px var(--color-divider-heavy)",
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5 text-signal-green" />
                  <span className="text-body-12 font-semibold text-text-primary">
                    Deploy
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleDeploy("live")}
                    disabled={deploying}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-signal-green text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover disabled:opacity-50"
                  >
                    <Rocket className="h-4 w-4" />
                    {deploying ? "Deploying…" : "Deploy Bot"}
                  </button>
                  <button
                    onClick={() => handleDeploy("paper")}
                    disabled={deploying}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-signal-amber/15 text-body-12 font-semibold text-signal-amber transition-colors hover:bg-signal-amber/25 disabled:opacity-50"
                  >
                    <Activity className="h-4 w-4" />
                    {deploying ? "Starting…" : "Start Paper Trading"}
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex h-8 w-full items-center justify-center text-body-12 text-text-quaternary transition-colors hover:text-text-secondary"
                  >
                    Back to Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation ──────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className={`flex h-8 items-center gap-1.5 rounded-[6px] px-4 text-body-12 font-medium transition-colors ${
              currentStep === 1
                ? "cursor-not-allowed text-text-muted"
                : "bg-bg-base-2 text-text-primary hover:bg-bg-base-3"
            }`}
            style={
              currentStep > 1
                ? {
                    boxShadow:
                      "inset 0 0 0 1px var(--color-divider-heavy)",
                  }
                : undefined
            }
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() =>
                canProceed && setCurrentStep((s) => Math.min(3, s + 1))
              }
              disabled={!canProceed}
              className={`flex h-8 items-center gap-1.5 rounded-[6px] px-6 text-body-12 font-semibold transition-colors ${
                canProceed
                  ? "bg-signal-green text-bg-base-0 hover:bg-action-brand-hover"
                  : "cursor-not-allowed bg-bg-base-3 text-text-muted"
              }`}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleDeploy("live")}
              disabled={deploying}
              className="flex h-8 items-center gap-1.5 rounded-[6px] bg-signal-green px-6 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover disabled:opacity-50"
            >
              <Rocket className="h-3.5 w-3.5" />
              {deploying ? "Deploying…" : "Deploy Bot"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
