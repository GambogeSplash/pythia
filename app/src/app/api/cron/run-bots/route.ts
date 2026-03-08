import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bots, botLogs, trades, positions } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getTrendingMarkets, getNewMarkets, getMarkets } from "@/lib/api/polymarket";
import type { Market } from "@/lib/api/types";

/* ------------------------------------------------------------------ */
/*  Bot execution cron — runs every 5 minutes via Vercel Cron          */
/*  GET /api/cron/run-bots                                             */
/* ------------------------------------------------------------------ */

const MIN_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes — skip if run too recently

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this header for cron jobs)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - MIN_INTERVAL_MS);

  // Fetch all running bots that haven't been updated in the last 4 minutes
  const runningBots = await db
    .select()
    .from(bots)
    .where(eq(bots.status, "running"));

  const eligibleBots = runningBots.filter(
    (bot) => !bot.updatedAt || bot.updatedAt < cutoff,
  );

  if (eligibleBots.length === 0) {
    return NextResponse.json({ message: "No eligible bots", processed: 0 });
  }

  // Pre-fetch market data once (shared across all bots)
  let trendingMarkets: Market[] = [];
  let newMarkets: Market[] = [];
  let allMarkets: Market[] = [];

  try {
    [trendingMarkets, newMarkets, { markets: allMarkets }] = await Promise.all([
      getTrendingMarkets(50),
      getNewMarkets(50),
      getMarkets({ limit: 100, active: true, closed: false }),
    ]);
  } catch (err) {
    console.error("[cron/run-bots] Failed to fetch market data:", err);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 502 });
  }

  const results: { botId: string; botName: string; actions: string[] }[] = [];

  for (const bot of eligibleBots) {
    const actions: string[] = [];
    const config = (bot.config ?? {}) as Record<string, unknown>;

    try {
      switch (bot.type) {
        case "momentum":
          await executeMomentum(bot, config, trendingMarkets, actions);
          break;
        case "arbitrage":
          await executeArbitrage(bot, config, allMarkets, actions);
          break;
        case "alpha":
          await executeAlpha(bot, config, allMarkets, actions);
          break;
        case "news-reactor":
          await executeNewsReactor(bot, config, newMarkets, actions);
          break;
        case "portfolio-guard":
          await executePortfolioGuard(bot, config, actions);
          break;
        case "copy-trade":
          actions.push("copy-trade: no-op (wallet tracking not implemented)");
          await logBotAction(bot.id, "scan", "Copy-trade strategy not yet implemented");
          break;
        default:
          actions.push(`unknown bot type: ${bot.type}`);
          await logBotAction(bot.id, "error", `Unknown bot type: ${bot.type}`);
      }

      // Update bot timestamp and stats
      await updateBotStats(bot.id);

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      actions.push(`error: ${message}`);
      await logBotAction(bot.id, "error", message);
    }

    results.push({ botId: bot.id, botName: bot.name, actions });
  }

  return NextResponse.json({
    message: "Bot execution complete",
    processed: eligibleBots.length,
    results,
  });
}

/* ── Strategy Executors ─────────────────────────────────────────────── */

type BotRow = typeof bots.$inferSelect;

async function executeMomentum(
  bot: BotRow,
  config: Record<string, unknown>,
  trendingMarkets: Market[],
  actions: string[],
) {
  const threshold = Number(config.triggerThreshold ?? config.trigger_threshold ?? 0.1);

  // Look for markets with large price deviation from 0.5 (strong momentum)
  // volume24h as a proxy for momentum strength
  const candidates = trendingMarkets.filter((m) => {
    const priceMove = Math.abs(m.yesPrice - 0.5);
    return priceMove >= threshold && m.volume24h > 0;
  });

  if (candidates.length === 0) {
    actions.push("momentum: no markets exceed threshold");
    await logBotAction(bot.id, "scan", `Scanned ${trendingMarkets.length} markets, none exceed momentum threshold of ${threshold}`);
    return;
  }

  // Take the top candidate by volume
  const market = candidates[0];
  const side = market.yesPrice > 0.5 ? "YES" : "NO";
  const price = side === "YES" ? market.yesPrice : market.noPrice;
  const shares = Math.min(bot.capital * 0.1, 50) / price; // Use 10% of capital or $50 max
  const amount = shares * price;

  await simulateTrade(bot, market, side, "buy", shares, price, amount, actions);
}

async function executeArbitrage(
  bot: BotRow,
  config: Record<string, unknown>,
  markets: Market[],
  actions: string[],
) {
  const threshold = Number(config.spreadThreshold ?? config.spread_threshold ?? 0.98);

  const opportunities = markets.filter((m) => {
    const sum = m.yesPrice + m.noPrice;
    return sum > 0 && sum < threshold;
  });

  if (opportunities.length === 0) {
    actions.push("arbitrage: no opportunities found");
    await logBotAction(bot.id, "scan", `Scanned ${markets.length} markets, no arbitrage opportunities (YES+NO < ${threshold})`);
    return;
  }

  for (const market of opportunities.slice(0, 3)) {
    const sum = market.yesPrice + market.noPrice;
    const detail = `Arbitrage opportunity: ${market.question} — YES(${market.yesPrice.toFixed(3)}) + NO(${market.noPrice.toFixed(3)}) = ${sum.toFixed(3)}`;
    actions.push(detail);
    await logBotAction(bot.id, "alert", detail, market.id);
  }
}

async function executeAlpha(
  bot: BotRow,
  config: Record<string, unknown>,
  markets: Market[],
  actions: string[],
) {
  const volumeMultiplier = Number(config.volumeMultiplier ?? config.volume_multiplier ?? 3);

  // Find markets where 24h volume is unusually high relative to liquidity
  const candidates = markets.filter((m) => {
    if (m.liquidity <= 0) return false;
    const ratio = m.volume24h / m.liquidity;
    return ratio >= volumeMultiplier;
  });

  if (candidates.length === 0) {
    actions.push("alpha: no unusual volume detected");
    await logBotAction(bot.id, "scan", `Scanned ${markets.length} markets, no volume anomalies (threshold: ${volumeMultiplier}x liquidity)`);
    return;
  }

  // Take the top candidate
  const market = candidates[0];
  const side = "YES";
  const price = market.yesPrice;
  const shares = Math.min(bot.capital * 0.05, 25) / price; // 5% of capital or $25 max
  const amount = shares * price;

  await simulateTrade(bot, market, side, "buy", shares, price, amount, actions);
}

async function executeNewsReactor(
  bot: BotRow,
  config: Record<string, unknown>,
  newMarkets: Market[],
  actions: string[],
) {
  const keywords = (config.keywords ?? config.topics ?? []) as string[];

  if (keywords.length === 0) {
    actions.push("news-reactor: no keywords configured");
    await logBotAction(bot.id, "scan", "No keywords configured for news-reactor bot");
    return;
  }

  // Filter new markets created recently that match keywords
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentMatches = newMarkets.filter((m) => {
    const created = new Date(m.createdAt);
    if (created < fiveMinutesAgo) return false;
    const text = m.question.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });

  if (recentMatches.length === 0) {
    actions.push("news-reactor: no matching new markets");
    await logBotAction(bot.id, "scan", `Scanned ${newMarkets.length} new markets, none match keywords [${keywords.join(", ")}]`);
    return;
  }

  for (const market of recentMatches.slice(0, 2)) {
    const side = "YES";
    const price = market.yesPrice;
    const shares = Math.min(bot.capital * 0.05, 25) / price;
    const amount = shares * price;
    await simulateTrade(bot, market, side, "buy", shares, price, amount, actions);
  }
}

async function executePortfolioGuard(
  bot: BotRow,
  config: Record<string, unknown>,
  actions: string[],
) {
  if (!db) return;

  const maxDrawdown = Number(config.maxDrawdown ?? config.max_drawdown ?? -0.15);

  // Check open positions for this user
  const openPositions = await db
    .select()
    .from(positions)
    .where(and(eq(positions.userId, bot.userId), eq(positions.status, "open")));

  if (openPositions.length === 0) {
    actions.push("portfolio-guard: no open positions");
    await logBotAction(bot.id, "scan", "No open positions to guard");
    return;
  }

  const atRisk = openPositions.filter((pos) => {
    const pnlPercent = pos.pnlPercent / 100; // stored as percentage
    return pnlPercent <= maxDrawdown;
  });

  if (atRisk.length === 0) {
    actions.push("portfolio-guard: all positions within limits");
    await logBotAction(bot.id, "scan", `Checked ${openPositions.length} positions, all within max drawdown of ${(maxDrawdown * 100).toFixed(1)}%`);
    return;
  }

  for (const pos of atRisk.slice(0, 3)) {
    const detail = `Position at risk: ${pos.marketQuestion} — PnL: ${pos.pnlPercent.toFixed(1)}% (threshold: ${(maxDrawdown * 100).toFixed(1)}%)`;
    actions.push(detail);
    await logBotAction(bot.id, "alert", detail, pos.marketId);

    // Simulate a sell
    const price = pos.currentPrice;
    const shares = pos.shares;
    const amount = shares * price;
    const pnl = amount - pos.costBasis;

    const [trade] = await db!
      .insert(trades)
      .values({
        userId: bot.userId,
        positionId: pos.id,
        marketId: pos.marketId,
        marketQuestion: pos.marketQuestion,
        venue: pos.venue,
        side: pos.side,
        action: "sell",
        shares,
        price,
        amount,
        fee: 0,
        pnl,
      })
      .returning();

    await logBotAction(bot.id, "trade", `Simulated sell: ${shares.toFixed(2)} shares @ ${price.toFixed(3)} = $${amount.toFixed(2)} (PnL: $${pnl.toFixed(2)})`, pos.marketId, trade.id);
    actions.push(`trade: sold ${shares.toFixed(2)} shares of "${pos.marketQuestion}"`);
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

async function simulateTrade(
  bot: BotRow,
  market: Market,
  side: string,
  action: string,
  shares: number,
  price: number,
  amount: number,
  actions: string[],
) {
  if (!db) return;

  // Idempotency: check if we already placed a trade for this bot+market in the last 5 minutes
  const recentTrades = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.userId, bot.userId),
        eq(trades.marketId, market.id),
      ),
    );

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const duplicate = recentTrades.find(
    (t) => t.executedAt > fiveMinutesAgo && t.action === action,
  );

  if (duplicate) {
    actions.push(`skipped: duplicate trade for ${market.question}`);
    await logBotAction(bot.id, "scan", `Skipped duplicate ${action} for "${market.question}"`, market.id);
    return;
  }

  const modeLabel = bot.mode === "live" ? "[LIVE]" : "[PAPER]";

  const [trade] = await db
    .insert(trades)
    .values({
      userId: bot.userId,
      marketId: market.id,
      marketQuestion: market.question,
      venue: "polymarket",
      side,
      action,
      shares,
      price,
      amount,
      fee: 0,
      pnl: 0,
    })
    .returning();

  const detail = `${modeLabel} Simulated ${action}: ${shares.toFixed(2)} ${side} shares of "${market.question}" @ ${price.toFixed(3)} = $${amount.toFixed(2)}`;
  actions.push(detail);
  await logBotAction(bot.id, "trade", detail, market.id, trade.id);
}

async function logBotAction(
  botId: string,
  action: string,
  detail: string,
  marketId?: string,
  tradeId?: string,
) {
  if (!db) return;
  await db.insert(botLogs).values({
    botId,
    action,
    detail,
    marketId: marketId ?? null,
    tradeId: tradeId ?? null,
  });
}

async function updateBotStats(botId: string) {
  if (!db) return;

  // Count total trades and sum PnL for this bot's trades
  const botRow = await db.select().from(bots).where(eq(bots.id, botId)).then((r) => r[0]);
  if (!botRow) return;

  // Get all trades for this bot's user that were logged by this bot
  const botTradeLog = await db
    .select()
    .from(botLogs)
    .where(and(eq(botLogs.botId, botId), eq(botLogs.action, "trade")));

  const tradeIds = botTradeLog
    .map((l) => l.tradeId)
    .filter((id): id is string => id !== null);

  let totalTrades = tradeIds.length;
  let totalPnl = 0;

  if (tradeIds.length > 0) {
    const botTrades = await db
      .select()
      .from(trades)
      .where(sql`${trades.id} = ANY(ARRAY[${sql.join(tradeIds.map(id => sql`${id}::uuid`), sql`, `)}])`);

    totalPnl = botTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  }

  await db
    .update(bots)
    .set({
      totalTrades,
      pnl: totalPnl,
      pnlPercent: botRow.capital > 0 ? (totalPnl / botRow.capital) * 100 : 0,
      updatedAt: new Date(),
    })
    .where(eq(bots.id, botId));
}
