import type { ReactNode } from "react";

type BadgeVariant = "green" | "red" | "amber" | "blue" | "neutral" | "buy" | "sell" | "rise" | "fall";

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-signal-green-dim text-signal-green",
  red: "bg-signal-red-dim text-signal-red",
  amber: "bg-signal-amber-dim text-signal-amber",
  blue: "bg-signal-blue-dim text-signal-blue",
  neutral: "bg-action-translucent text-text-secondary",
  buy: "bg-action-buy-dim text-action-buy",
  sell: "bg-action-sell-dim text-action-sell",
  rise: "bg-action-rise-dim text-action-rise",
  fall: "bg-action-fall-dim text-action-fall",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
