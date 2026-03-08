import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alerts, alertEvents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getMarketById } from "@/lib/api/polymarket";
import type { Market } from "@/lib/api/types";

/* ------------------------------------------------------------------ */
/*  Cron: Check active alerts against live Polymarket data             */
/*  Schedule: every 5 minutes (see vercel.json)                        */
/* ------------------------------------------------------------------ */

interface AlertRow {
  id: string;
  userId: string;
  type: string;
  marketId: string;
  marketQuestion: string;
  condition: string;
  threshold: string;
  status: string;
  triggered: number;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

/**
 * Evaluate whether an alert condition is met for a given market.
 * Returns a human-readable detail string if triggered, or null if not.
 */
function evaluateCondition(
  alert: AlertRow,
  market: Market,
): string | null {
  const threshold = parseFloat(alert.threshold);
  if (isNaN(threshold)) return null;

  switch (alert.condition) {
    case "price_above": {
      if (market.yesPrice > threshold) {
        return `YES price ${(market.yesPrice * 100).toFixed(1)}% exceeded threshold ${(threshold * 100).toFixed(1)}% for "${market.question}"`;
      }
      return null;
    }

    case "price_below": {
      if (market.yesPrice < threshold) {
        return `YES price ${(market.yesPrice * 100).toFixed(1)}% dropped below threshold ${(threshold * 100).toFixed(1)}% for "${market.question}"`;
      }
      return null;
    }

    case "volume_above": {
      if (market.volume24h > threshold) {
        return `24h volume $${market.volume24h.toLocaleString()} exceeded threshold $${threshold.toLocaleString()} for "${market.question}"`;
      }
      return null;
    }

    case "price_change": {
      // threshold is a percentage (e.g. 5 = 5%)
      // Use the absolute difference between yes/no as a proxy for movement
      // In production you'd compare against a stored baseline price
      const change = Math.abs(market.yesPrice - 0.5) * 200; // deviation from 50% as %
      if (change > threshold) {
        return `Price deviation ${change.toFixed(1)}% exceeded ${threshold}% threshold for "${market.question}"`;
      }
      return null;
    }

    default:
      return null;
  }
}

function severityForCondition(condition: string): string {
  switch (condition) {
    case "price_above":
    case "price_below":
      return "high";
    case "volume_above":
      return "medium";
    case "price_change":
      return "high";
    default:
      return "medium";
  }
}

export async function GET(req: Request) {
  // Optional: verify cron secret for production
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: "No database" }, { status: 503 });
  }

  // 1. Fetch all active alerts
  const activeAlerts = (await db
    .select()
    .from(alerts)
    .where(eq(alerts.status, "active"))) as AlertRow[];

  if (activeAlerts.length === 0) {
    return NextResponse.json({
      checked: 0,
      triggered: 0,
      message: "No active alerts",
    });
  }

  // 2. Group alerts by marketId to minimize API calls
  const alertsByMarket = new Map<string, AlertRow[]>();
  for (const alert of activeAlerts) {
    const group = alertsByMarket.get(alert.marketId) || [];
    group.push(alert);
    alertsByMarket.set(alert.marketId, group);
  }

  // 3. Fetch market data for each unique marketId
  const marketData = new Map<string, Market>();
  const fetchPromises = Array.from(alertsByMarket.keys()).map(
    async (marketId) => {
      try {
        const market = await getMarketById(marketId);
        if (market) {
          marketData.set(marketId, market);
        }
      } catch (error) {
        console.error(
          `[check-alerts] Failed to fetch market ${marketId}:`,
          error,
        );
      }
    },
  );
  await Promise.all(fetchPromises);

  // 4. Evaluate each alert and create events for triggered ones
  let triggeredCount = 0;
  const now = new Date();

  for (const alert of activeAlerts) {
    const market = marketData.get(alert.marketId);
    if (!market) continue;

    // Skip if alert was triggered less than 5 minutes ago (debounce)
    if (
      alert.lastTriggeredAt &&
      now.getTime() - alert.lastTriggeredAt.getTime() < 5 * 60 * 1000
    ) {
      continue;
    }

    const detail = evaluateCondition(alert, market);
    if (!detail) continue;

    // Alert triggered
    triggeredCount++;

    // Create alert event
    await db.insert(alertEvents).values({
      alertId: alert.id,
      userId: alert.userId,
      detail,
      severity: severityForCondition(alert.condition),
      read: false,
    });

    // Update alert: increment triggered count and set lastTriggeredAt
    await db
      .update(alerts)
      .set({
        triggered: sql`${alerts.triggered} + 1`,
        lastTriggeredAt: now,
      })
      .where(eq(alerts.id, alert.id));
  }

  return NextResponse.json({
    checked: activeAlerts.length,
    marketsQueried: marketData.size,
    triggered: triggeredCount,
    timestamp: now.toISOString(),
  });
}
