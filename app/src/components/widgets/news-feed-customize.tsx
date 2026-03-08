"use client";

import { useState } from "react";
import { Search, EyeOff, Trash2, Maximize2, MoreHorizontal } from "lucide-react";

interface Handle {
  id: string;
  name: string;
  type: "Twitter";
  selected: boolean;
}

const handles: Handle[] = [];

export function NewsFeedCustomize() {
  const [activeTab, setActiveTab] = useState<"list" | "subscription">("list");
  const [settings, setSettings] = useState({
    showMedia: true,
    showQuoted: true,
    showRetweets: false,
  });

  return (
    <div className="flex w-full max-w-[700px] flex-col overflow-hidden rounded-[18px] border border-border-primary bg-bg-base-1">
      {/* Header */}
      <div className="flex h-9 items-center gap-3 px-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
        <span className="text-xs text-text-quaternary">⊞</span>
        <span className="text-body-12 font-semibold text-text-primary">News Feed</span>
        <button className="text-xs font-medium text-signal-green hover:underline">
          View Alerts
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-action-translucent-hover">
            <MoreHorizontal className="h-3 w-3" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-action-translucent-hover">
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="rounded border border-signal-green bg-action-rise-dim px-4 py-1.5 text-[11px] font-semibold uppercase text-action-rise transition-colors duration-150 hover:bg-signal-green/20">
            ADD HANDLE
          </button>
          <button className="rounded border border-border-secondary bg-bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase text-text-primary transition-colors duration-150 hover:bg-action-translucent-hover">
            IMPORT
          </button>
        </div>

        {/* Settings */}
        <div className="mt-4 rounded border border-border-primary bg-bg-surface p-3">
          <div className="text-body-12 font-semibold text-text-primary">Settings</div>
          <div className="mt-2 space-y-2">
            <ToggleSetting
              label="Show media in feed"
              checked={settings.showMedia}
              onChange={(v) => setSettings({ ...settings, showMedia: v })}
            />
            <ToggleSetting
              label="Show quoted posts"
              checked={settings.showQuoted}
              onChange={(v) => setSettings({ ...settings, showQuoted: v })}
            />
            <ToggleSetting
              label="Show retweets"
              checked={settings.showRetweets}
              onChange={(v) => setSettings({ ...settings, showRetweets: v })}
            />
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-0.5">
            <button
              onClick={() => setActiveTab("list")}
              className={`rounded px-3 py-1 text-[11px] font-medium ${
                activeTab === "list"
                  ? "bg-signal-green text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              My list
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`rounded px-3 py-1 text-[11px] font-medium ${
                activeTab === "subscription"
                  ? "bg-signal-green text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Market Subscription
            </button>
          </div>
          <div className="flex h-7 w-48 items-center gap-2 rounded border border-border-primary bg-bg-surface px-2">
            <Search className="h-3 w-3 text-text-tertiary" />
            <span className="text-[11px] text-text-tertiary">Search handle</span>
          </div>
        </div>

        {/* Handle table */}
        <div className="mt-3">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 pb-1.5" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
            <span className="w-5" />
            <span className="text-[10px] font-medium uppercase text-text-quaternary">Handle</span>
            <span className="text-[10px] font-medium uppercase text-text-quaternary">Type</span>
            <span className="w-14" />
          </div>
          <div>
            {handles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-body-12 text-text-quaternary text-center">No handles configured. Add handles to customize your feed.</p>
              </div>
            ) : (
              handles.map((handle) => (
                <div
                  key={handle.id}
                  className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 py-3"
                  style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-secondary bg-bg-surface accent-signal-green"
                  />
                  <span className="text-body-12 font-medium text-text-primary">
                    {handle.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-signal-blue" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-body-12 text-text-secondary">Twitter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-text-tertiary hover:text-text-secondary">
                      <EyeOff className="h-4 w-4" />
                    </button>
                    <button className="text-text-tertiary hover:text-action-fall">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        onClick={() => onChange(!checked)}
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-signal-green" : "bg-bg-surface-raised"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-[12px] text-text-secondary">{label}</span>
    </label>
  );
}
