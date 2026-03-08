interface PriceDisplayProps {
  yes: number;
  spread: number;
  no: number;
  className?: string;
}

export function PriceDisplay({ yes, spread, no, className = "" }: PriceDisplayProps) {
  return (
    <span className={`text-numbers-10 ${className}`}>
      <span className="text-action-buy">{yes}&cent;</span>
      <span className="text-text-muted"> [{spread}&cent;] </span>
      <span className="text-action-sell">{no}&cent;</span>
    </span>
  );
}
