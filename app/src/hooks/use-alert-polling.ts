import { useEffect } from "react";

/**
 * Dev-mode polling hook that triggers the alert-check cron endpoint
 * every 5 minutes. In production, Vercel Cron handles this automatically.
 */
export function useAlertPolling(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // Fire once immediately on mount
    fetch("/api/cron/check-alerts").catch(() => {});

    const interval = setInterval(
      () => {
        fetch("/api/cron/check-alerts").catch(() => {});
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [enabled]);
}
