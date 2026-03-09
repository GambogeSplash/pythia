"use client";

import { useEffect, useRef, useState } from "react";
import { Search, TrendingUp, User, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PythiaBrandMark } from "@/components/ui/empty-state";

interface CommandItem {
  id: string;
  label: string;
  category: "Markets" | "Traders" | "Actions";
  icon: React.ReactNode;
}

const commandItems: CommandItem[] = [
  { id: "m1", label: "Fed Interest Rate Decision", category: "Markets", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "m2", label: "China-Taiwan Relations", category: "Markets", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "m3", label: "Ethereum ETF Approval", category: "Markets", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "m4", label: "NYC Mayoral Election", category: "Markets", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "t1", label: "ShimaTakashi", category: "Traders", icon: <User className="h-3.5 w-3.5" /> },
  { id: "t2", label: "AidaYudai", category: "Traders", icon: <User className="h-3.5 w-3.5" /> },
  { id: "t3", label: "IkedaSuzuka", category: "Traders", icon: <User className="h-3.5 w-3.5" /> },
  { id: "a1", label: "Go to Dashboard", category: "Actions", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "a2", label: "Go to Trade", category: "Actions", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "a3", label: "Go to Bots", category: "Actions", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "a4", label: "Toggle Sidebar", category: "Actions", icon: <Zap className="h-3.5 w-3.5" /> },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filtered = query
    ? commandItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : commandItems;

  const categories = ["Markets", "Traders", "Actions"] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* Backdrop (ref: TakeProfit overlay-0) */}
      <div className="absolute inset-0 bg-bg-overlay backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[12px] bg-bg-base-2"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 24px 48px -12px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          <Search className="h-4 w-4 text-text-quaternary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets, traders, actions..."
            className="flex-1 bg-transparent text-body-14 text-text-primary placeholder-text-quaternary outline-none"
          />
          <kbd className="rounded-[4px] bg-bg-base-3 px-1.5 py-0.5 font-mono text-caption-10 text-text-quaternary" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="scrollbar-hide max-h-80 overflow-auto py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <PythiaBrandMark size={48} className="text-text-quaternary opacity-20" />
              <span className="text-body-12 text-text-quaternary">No results found</span>
            </div>
          ) : (
            categories.map((cat) => {
              const items = filtered.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="px-4 py-1.5 text-label-9 tracking-widest text-text-quaternary">
                    {cat}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary active:bg-action-translucent-active"
                      onClick={() => setCommandPaletteOpen(false)}
                    >
                      <span className="text-text-tertiary">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
