interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-[4px] bg-bg-base-3 ${className}`} />
  );
}

export function WidgetSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] bg-bg-base-1" style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}>
      <div className="flex h-9 items-center gap-2 px-3">
        <Skeleton className="h-3.5 w-3.5" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? "flex-1" : "w-16"}`} />
      ))}
    </div>
  );
}
