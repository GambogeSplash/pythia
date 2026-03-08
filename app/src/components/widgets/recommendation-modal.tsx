"use client";

import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type RecommendationState = "snipe" | "wait";

interface RecommendationModalProps {
  state?: RecommendationState;
  onClose?: () => void;
}

export function RecommendationModal({
  state = "snipe",
  onClose,
}: RecommendationModalProps) {
  const isSnipe = state === "snipe";

  return (
    <div className="w-[420px] overflow-hidden rounded-[18px] border border-border-primary bg-bg-base-1 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-bg-surface-raised text-[10px] text-text-secondary">
            A¹
          </span>
          <span className="text-sm font-semibold text-text-primary">
            Recommendation
          </span>
          <Badge variant="blue">Beta</Badge>
        </div>
        <button
          onClick={onClose}
          className="text-text-quaternary transition-colors duration-150 hover:text-text-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }} />

      {/* Action + Alpha Window */}
      <div className="grid grid-cols-2 gap-4 px-4 py-4">
        <div>
          <div className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
            RECOMMENDED ACTION
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-body-14 font-semibold text-text-primary">
              {isSnipe ? "Snipe" : "Wait"}
            </span>
            <span className="text-[10px] text-text-quaternary">⊞</span>
          </div>
        </div>
        <div>
          <div className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
            ALPHA WINDOW
          </div>
          <div
            className={`mt-1 text-body-14 font-semibold ${
              isSnipe ? "text-action-rise" : "text-action-fall"
            }`}
          >
            {isSnipe ? "Ride Now (1:40)" : "Expired"}
          </div>
        </div>
      </div>

      {/* Best Market */}
      <div className="px-4 pb-3">
        <div className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
          BEST MARKET
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-signal-blue text-[10px] font-bold text-white">
            ⊞
          </div>
          <span className="text-sm text-text-primary">
            Will Grokipedia launch by 31 Dec?
          </span>
        </div>
        <button className="mt-1 text-[11px] text-signal-green hover:underline">
          Other market ⌄
        </button>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-4">
        <div>
          <div className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
            HIGHEST &ldquo;YES&rdquo; PRICE
          </div>
          <div className="mt-1 font-data text-base font-bold text-text-primary">
            75¢
          </div>
        </div>
        <div>
          <div className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
            LOWEST &ldquo;YES&rdquo; PRICE
          </div>
          <div className="mt-1 font-data text-base font-bold text-text-primary">
            72¢
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 rounded-md border border-border-primary bg-bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="text-numbers-10 font-medium uppercase tracking-wider text-text-quaternary">
            SUMMARY
          </span>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-3 w-3 text-text-tertiary hover:text-text-secondary" />
            <ThumbsDown className="h-3 w-3 text-text-tertiary hover:text-text-secondary" />
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-text-primary">
          {isSnipe
            ? "This sounds like a direct confirmation for the launch of Grokipedia from the CEO. Aggression ↑ · Volume ↑ · Spread OK"
            : "Buy aggression cooled off. Wait for next alpha"}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <IndicatorChip
            label="Buy Aggression"
            direction={isSnipe ? "up" : "down"}
          />
          <IndicatorChip
            label="Volume"
            direction={isSnipe ? "up" : "down"}
          />
          <IndicatorChip label="Okay Spread" direction="ok" />
        </div>
      </div>

      {/* Bot CTA */}
      <div className="mx-4 mt-3 rounded-md border border-border-primary bg-bg-surface p-3">
        <p className="text-[12px] text-text-secondary">
          You can also create automation bot for future opportunities like this.{" "}
          <button className="font-semibold text-signal-green hover:underline">
            CREATE
          </button>
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3 px-4 py-3" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
        {isSnipe ? (
          <button className="flex-1 rounded-md bg-signal-green py-2.5 text-sm font-semibold text-bg-primary transition-colors duration-150 hover:bg-signal-green/90">
            BUY &ldquo;YES&rdquo;
          </button>
        ) : (
          <button className="flex-1 rounded-md bg-signal-green py-2.5 text-sm font-semibold text-bg-primary transition-colors duration-150 hover:bg-signal-green/90">
            SET ALERT
          </button>
        )}
        <button className="flex-1 rounded-md border border-border-secondary bg-bg-surface py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover">
          CANCEL
        </button>
      </div>
    </div>
  );
}

function IndicatorChip({
  label,
  direction,
}: {
  label: string;
  direction: "up" | "down" | "ok";
}) {
  const styles = {
    up: "border-action-rise/30 text-action-rise",
    down: "border-action-fall/30 text-action-fall",
    ok: "border-action-rise/30 text-action-rise",
  };
  const icons = { up: "↑", down: "↓", ok: "✓" };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[direction]}`}
    >
      {icons[direction]} {label}
    </span>
  );
}
