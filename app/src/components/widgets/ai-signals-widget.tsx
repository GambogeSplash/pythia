"use client";

import Link from "next/link";
import { Widget } from "@/components/ui/widget";
import { Badge } from "@/components/ui/badge";
import { useAISignals } from "@/hooks/use-ai";
import { truncate } from "@/lib/format";
import { Brain, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const signalConfig = {
  bullish: { variant: "green" as const, label: "Bullish" },
  bearish: { variant: "red" as const, label: "Bearish" },
  neutral: { variant: "neutral" as const, label: "Neutral" },
};

function ConfidenceBar({ value }: { value: number }) {
  const clamped = Math.max(1, Math.min(10, value));
  const percent = clamped * 10;
  const color =
    clamped >= 7
      ? "var(--color-signal-green)"
      : clamped >= 4
        ? "var(--color-signal-amber)"
        : "var(--color-signal-red)";

  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-bg-base-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-numbers-10 text-text-tertiary">{clamped}</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <div className="min-w-0 flex-1">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton mt-1.5 h-2.5 w-16 rounded" />
          </div>
          <div className="skeleton h-4 w-14 rounded" />
          <div className="skeleton h-2 w-12 rounded" />
        </div>
      ))}
    </div>
  );
}

export function AISignalsWidget() {
  const { signals, isLoading, isError, mutate } = useAISignals();

  return (
    <Widget
      id="ai-signals"
      title="AI SIGNALS"
      liveIndicator
      accentColor="#00FF85"
      icon={<Brain className="h-3.5 w-3.5 text-text-tertiary" />}
      actions={
        <button
          onClick={() => mutate()}
          className="flex h-5 items-center gap-1 rounded-[4px] bg-action-secondary px-2 text-caption-10 text-text-secondary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary active:bg-action-secondary-active"
          title="Refresh signals"
        >
          <RefreshCw className="h-2.5 w-2.5" />
        </button>
      }
    >
      {/* Table header */}
      <div
        className="grid grid-cols-[1fr_64px_56px_80px] gap-1 px-3 py-1.5"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <span className="text-label-10 text-text-quaternary">
          Market
        </span>
        <span className="text-right text-label-10 text-text-quaternary">
          Signal
        </span>
        <span className="text-right text-label-10 text-text-quaternary">
          Conf.
        </span>
        <span className="text-right text-label-10 text-text-quaternary">
          Entry / Target
        </span>
      </div>

      {isLoading && <SkeletonRows />}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-secondary">
          <AlertTriangle className="h-5 w-5 text-signal-amber" />
          <span className="text-body-12">Failed to load AI signals</span>
        </div>
      )}

      {!isLoading && !isError && signals.length === 0 && (
        <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
          No signals available
        </div>
      )}

      {!isLoading && !isError && signals.length > 0 && (
        <div>
          {signals.map((signal, idx) => {
            const cfg = signalConfig[signal.signal];
            const entryCents = Math.round(signal.entryPrice * 100);
            const targetCents = Math.round(signal.targetPrice * 100);
            const stopCents = Math.round(signal.stopLoss * 100);

            return (
              <motion.div
                key={signal.marketId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link
                  href={`/dashboard/markets/${signal.marketId}`}
                  className="grid grid-cols-[1fr_64px_56px_80px] items-center gap-1 px-3 py-2.5 transition-colors duration-150 hover:bg-action-translucent-hover"
                  style={{
                    boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)",
                  }}
                >
                  {/* Market question + reasoning tooltip */}
                  <div className="min-w-0">
                    <span className="block truncate text-body-12 text-text-primary">
                      {truncate(signal.question, 55)}
                    </span>
                    <span className="mt-0.5 block truncate text-caption-10 text-text-quaternary">
                      {truncate(signal.reasoning, 60)}
                    </span>
                  </div>

                  {/* Signal badge */}
                  <div className="flex justify-end">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>

                  {/* Confidence */}
                  <div className="flex justify-end">
                    <ConfidenceBar value={signal.confidence} />
                  </div>

                  {/* Entry / Target / Stop */}
                  <div className="text-right">
                    <span className="text-numbers-10 text-text-primary">
                      {entryCents}c
                    </span>
                    <span className="text-numbers-10 text-text-quaternary">
                      {" / "}
                    </span>
                    <span className="text-numbers-10 text-action-rise">
                      {targetCents}c
                    </span>
                    <div className="text-numbers-10 text-action-fall">
                      SL {stopCents}c
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </Widget>
  );
}
