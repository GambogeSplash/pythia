"use client";

import { ChevronDown, Plus, Check, LayoutGrid, TrendingUp, Zap, BarChart3, Shield } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";

const DASHBOARDS = [
  { id: "market", label: "MARKET DASHBOARD", icon: LayoutGrid, description: "Live market signals & heatmaps" },
  { id: "momentum", label: "MOMENTUM SCANNER", icon: TrendingUp, description: "Trending markets & volume spikes" },
  { id: "alpha", label: "ALPHA FEED", icon: Zap, description: "News, anomalies & insider signals" },
  { id: "portfolio", label: "PORTFOLIO TRACKER", icon: BarChart3, description: "Your positions & PnL" },
  { id: "risk", label: "RISK MONITOR", icon: Shield, description: "Exposure, drawdown & alerts" },
];

export function SubHeader() {
  const [time, setTime] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState("market");
  const toggleWidgetPanel = useAppStore((s) => s.toggleWidgetPanel);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const current = DASHBOARDS.find((d) => d.id === activeDashboard) ?? DASHBOARDS[0];

  return (
    <div
      className="flex h-8 items-center bg-bg-base-0 px-3"
      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
    >
      {/* Workspace selector with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex h-6 items-center overflow-hidden rounded-[4px] bg-bg-base-2 outline outline-1 -outline-offset-1 outline-divider-heavy">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate whitespace-nowrap px-2 text-body-12 font-semibold text-text-primary transition-colors duration-150 hover:bg-action-translucent-hover active:bg-action-translucent-active"
          >
            {current.label}
          </button>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex h-full items-center px-1 text-text-primary transition-colors duration-150 before:absolute before:-left-px before:bottom-1 before:top-1 before:w-px before:bg-divider-heavy hover:bg-action-translucent-hover active:bg-action-translucent-active"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {dropdownOpen && (
          <div
            className="absolute left-0 top-8 z-50 w-64 overflow-hidden rounded-[8px] bg-bg-base-2 py-1"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)" }}
          >
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-medium uppercase text-text-quaternary">Workspaces</span>
            </div>
            {DASHBOARDS.map((d) => {
              const Icon = d.icon;
              const isActive = d.id === activeDashboard;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDashboard(d.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 ${
                    isActive ? "bg-action-translucent-hover" : "hover:bg-action-translucent-hover"
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-[4px] ${
                    isActive ? "bg-signal-green/12 text-signal-green" : "bg-bg-base-3 text-text-tertiary"
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-body-12 font-semibold text-text-primary">{d.label}</div>
                    <div className="text-[10px] text-text-quaternary">{d.description}</div>
                  </div>
                  {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0 text-signal-green" />}
                </button>
              );
            })}
            <div className="mx-2 my-1 h-px bg-divider-heavy" />
            <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary">
              <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-bg-base-3 text-text-tertiary">
                <Plus className="h-3.5 w-3.5" />
              </div>
              Create Workspace
            </button>
          </div>
        )}
      </div>

      {/* Add widget */}
      <button
        onClick={toggleWidgetPanel}
        className="ml-2 flex h-6 items-center gap-1 rounded-[4px] bg-action-translucent px-2 text-body-12 font-semibold text-text-primary transition-colors duration-150 hover:bg-action-translucent-hover active:bg-action-translucent-active sm:ml-3"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Add Widgets</span>
      </button>

      {/* Right: live clock — hidden on mobile */}
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <span className="text-numbers-10 text-text-quaternary">Last Updated</span>
        <span className="text-numbers-12 text-text-secondary">{time}</span>
      </div>
    </div>
  );
}
