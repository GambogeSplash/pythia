/**
 * Format a number as a compact dollar volume string.
 * e.g. 1_200_000 -> "$1.2M", 340_000 -> "$340K", 12_500 -> "$12.5K", 850 -> "$850"
 */
export function formatVolume(n: number): string {
  if (n >= 1_000_000_000) {
    return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (n >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${Math.round(n)}`;
}

/**
 * Compute a human-readable "time left" string from an ISO end date.
 * e.g. "2d 4h", "12h", "45m", "Ended"
 */
export function formatTimeLeft(endDate: string): string {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Compute a human-readable "time ago" string from an ISO date.
 * e.g. "2h ago", "1d ago", "5m ago"
 */
export function formatTimeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  if (diff < 0) return "just now";

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

/**
 * Truncate a string to `max` characters, appending "..." if truncated.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "...";
}
