interface MetricProps {
  value: string | number;
  change?: number;
  suffix?: string;
  className?: string;
}

export function Metric({ value, change, suffix, className = "" }: MetricProps) {
  return (
    <span className={`text-numbers-12 ${className}`}>
      <span className="text-text-primary">{value}</span>
      {suffix && <span className="text-text-quaternary">{suffix}</span>}
      {change !== undefined && (
        <span
          className={`ml-1 text-numbers-10 ${
            change >= 0 ? "text-action-rise" : "text-action-fall"
          }`}
        >
          {change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(change)}%
        </span>
      )}
    </span>
  );
}
