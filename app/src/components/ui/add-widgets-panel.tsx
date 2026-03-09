"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { ALL_WIDGETS } from "@/lib/widget-registry";
import { useAppStore } from "@/lib/store";

export function AddWidgetsPanel() {
  const [open, setOpen] = useState(false);
  const dashboardWidgets = useAppStore((s) => s.dashboardWidgets);
  const addWidget = useAppStore((s) => s.addWidget);
  const removeWidget = useAppStore((s) => s.removeWidget);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="absolute -top-9 right-0 z-10 flex items-center gap-1.5 rounded-[18px] border border-border-primary bg-bg-surface px-2.5 py-1 text-body-12 font-medium text-text-secondary transition-colors duration-150 hover:border-signal-green hover:text-signal-green"
      >
        <Plus className="h-3 w-3" />
        Add Widgets
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute -top-9 right-0 z-50 w-72 rounded-[18px] border border-border-secondary bg-bg-surface shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
              <span className="text-body-12 font-semibold text-text-primary">Add Widgets</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-5 w-5 items-center justify-center rounded text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="max-h-80 overflow-auto p-2">
              {ALL_WIDGETS.map((w) => {
                const isActive = dashboardWidgets.includes(w.id);
                return (
                  <button
                    key={w.id}
                    onClick={() => (isActive ? removeWidget(w.id) : addWidget(w.id))}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors duration-150 ${
                      isActive
                        ? "bg-action-rise-dim text-action-rise"
                        : "text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        isActive
                          ? "border-signal-green bg-signal-green"
                          : "border-border-secondary bg-transparent"
                      }`}
                    >
                      {isActive && <Check className="h-3 w-3 text-bg-primary" />}
                    </div>
                    <span className="text-body-12 font-medium">{w.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
