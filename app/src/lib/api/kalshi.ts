/* ------------------------------------------------------------------ */
/*  Kalshi API client                                                  */
/*  Public endpoints only (no auth needed for market data)             */
/* ------------------------------------------------------------------ */

import type { Market, MarketEvent, PricePoint, Orderbook, OrderbookLevel } from "./types";

const KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2";

/* ── Raw Kalshi API types ── */

interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  open_time: string;
  close_time: string;
  expiration_time: string;
  status: string;
  category: string;
  result: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_interest: number;
  rules_primary: string;
  rules_secondary: string;
  strike_type: string;
  floor_strike: number;
  cap_strike: number;
  image_url?: string;
}

interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle: string;
  category: string;
  mutually_exclusive: boolean;
  markets: KalshiMarket[];
}

interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string;
}

interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor: string;
}

interface KalshiOrderbookResponse {
  orderbook: {
    yes: [number, number][]; // [price, quantity]
    no: [number, number][];
  };
}

interface KalshiCandlestick {
  ts: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  open_interest?: number;
}

interface KalshiCandlesticksResponse {
  candles: KalshiCandlestick[];
}

/* ── Simple in-memory cache ── */

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 60_000; // 60 seconds

async function cachedFetch<T>(url: string, ttl = CACHE_TTL): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && cached.expiry > now) return cached.data as T;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (res.status === 429) {
    // Rate limited — wait and retry once
    const retryAfter = parseInt(res.headers.get("retry-after") || "2", 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    const retryRes = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!retryRes.ok) {
      throw new Error(`Kalshi API error: ${retryRes.status} ${retryRes.statusText} for ${url}`);
    }
    const data = (await retryRes.json()) as T;
    cache.set(url, { data, expiry: now + ttl });
    return data;
  }

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status} ${res.statusText} for ${url}`);
  }

  const data = (await res.json()) as T;
  cache.set(url, { data, expiry: now + ttl });
  return data;
}

/* ── Normalizers ── */

/** Convert Kalshi cents (0-100) to decimal (0-1) */
function centsToDecimal(cents: number): number {
  return Math.round((cents / 100) * 1000) / 1000; // 3 decimal places
}

function normalizeMarket(raw: KalshiMarket): Market {
  const isActive = raw.status === "open" || raw.status === "active";
  const isClosed = raw.status === "closed" || raw.status === "settled";

  // Compute yes/no price from bid/ask midpoints, fallback to last_price
  const yesPrice =
    raw.yes_bid && raw.yes_ask
      ? centsToDecimal((raw.yes_bid + raw.yes_ask) / 2)
      : raw.last_price
        ? centsToDecimal(raw.last_price)
        : 0;
  const noPrice =
    raw.no_bid && raw.no_ask
      ? centsToDecimal((raw.no_bid + raw.no_ask) / 2)
      : 1 - yesPrice;

  return {
    id: raw.ticker,
    slug: raw.ticker.toLowerCase(),
    question: raw.title,
    description: raw.subtitle || raw.rules_primary || "",
    category: mapKalshiCategory(raw.category),
    venue: "kalshi",
    image: raw.image_url || "",
    endDate: raw.close_time || raw.expiration_time || "",
    active: isActive,
    closed: isClosed,
    yesPrice,
    noPrice,
    volume: raw.volume || 0,
    volume24h: raw.volume_24h || 0,
    liquidity: raw.liquidity || raw.open_interest || 0,
    outcomes: ["Yes", "No"],
    createdAt: raw.open_time || "",
    updatedAt: raw.open_time || "",
  };
}

function normalizeEvent(raw: KalshiEvent): MarketEvent {
  const markets = (raw.markets || []).map(normalizeMarket);
  const totalVolume = markets.reduce((s, m) => s + m.volume, 0);
  const totalVolume24h = markets.reduce((s, m) => s + m.volume24h, 0);
  const totalLiquidity = markets.reduce((s, m) => s + m.liquidity, 0);

  // Derive dates from child markets
  const endDates = markets.map((m) => m.endDate).filter(Boolean);
  const startDates = markets.map((m) => m.createdAt).filter(Boolean);
  const latestEnd = endDates.length ? endDates.sort().reverse()[0] : "";
  const earliestStart = startDates.length ? startDates.sort()[0] : "";

  const anyActive = markets.some((m) => m.active);
  const allClosed = markets.length > 0 && markets.every((m) => m.closed);

  return {
    id: raw.event_ticker,
    slug: raw.event_ticker.toLowerCase(),
    title: raw.title,
    description: raw.subtitle || "",
    image: markets[0]?.image || "",
    startDate: earliestStart,
    endDate: latestEnd,
    active: anyActive,
    closed: allClosed,
    volume: totalVolume,
    volume24h: totalVolume24h,
    liquidity: totalLiquidity,
    markets,
  };
}

/* ── Category mapping ── */

const KALSHI_CATEGORY_MAP: Record<string, string> = {
  Politics: "Politics",
  Economics: "Macro",
  Finance: "Macro",
  Climate: "Science",
  Tech: "Science",
  Science: "Science",
  Sports: "Sports",
  Entertainment: "Culture",
  Culture: "Culture",
  Crypto: "Crypto",
};

function mapKalshiCategory(kalshiCategory: string): string {
  if (!kalshiCategory) return "Other";
  // Direct match
  if (KALSHI_CATEGORY_MAP[kalshiCategory]) return KALSHI_CATEGORY_MAP[kalshiCategory];
  // Case-insensitive partial match
  const lower = kalshiCategory.toLowerCase();
  for (const [key, value] of Object.entries(KALSHI_CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase())) return value;
  }
  return "Other";
}

/* ── Public API ── */

export async function getKalshiMarkets(params: {
  limit?: number;
  cursor?: string;
  status?: string;
  eventTicker?: string;
  seriesTicker?: string;
} = {}): Promise<{ markets: Market[]; cursor: string }> {
  const { limit = 50, cursor, status = "open", eventTicker, seriesTicker } = params;

  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (status) qs.set("status", status);
  if (cursor) qs.set("cursor", cursor);
  if (eventTicker) qs.set("event_ticker", eventTicker);
  if (seriesTicker) qs.set("series_ticker", seriesTicker);

  const url = `${KALSHI_BASE}/markets?${qs.toString()}`;
  const data = await cachedFetch<KalshiMarketsResponse>(url);

  return {
    markets: (data.markets || []).map(normalizeMarket),
    cursor: data.cursor || "",
  };
}

export async function getKalshiMarketByTicker(ticker: string): Promise<Market | null> {
  const url = `${KALSHI_BASE}/markets/${encodeURIComponent(ticker)}`;
  try {
    const data = await cachedFetch<{ market: KalshiMarket }>(url);
    if (!data.market) return null;
    return normalizeMarket(data.market);
  } catch {
    return null;
  }
}

export async function searchKalshiMarkets(query: string, limit = 20): Promise<Market[]> {
  // Kalshi doesn't have a dedicated search endpoint — fetch a larger set and filter client-side
  const { markets } = await getKalshiMarkets({ limit: 200, status: "open" });
  const lower = query.toLowerCase();
  return markets
    .filter(
      (m) =>
        m.question.toLowerCase().includes(lower) ||
        m.description.toLowerCase().includes(lower) ||
        m.category.toLowerCase().includes(lower),
    )
    .slice(0, limit);
}

export async function getKalshiEvents(params: {
  limit?: number;
  cursor?: string;
  status?: string;
} = {}): Promise<{ events: MarketEvent[]; cursor: string }> {
  const { limit = 30, cursor, status = "open" } = params;

  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (status) qs.set("status", status);
  if (cursor) qs.set("cursor", cursor);

  const url = `${KALSHI_BASE}/events?${qs.toString()}`;
  const data = await cachedFetch<KalshiEventsResponse>(url);

  return {
    events: (data.events || []).map(normalizeEvent),
    cursor: data.cursor || "",
  };
}

export async function getKalshiOrderbook(ticker: string): Promise<Orderbook> {
  const url = `${KALSHI_BASE}/markets/${encodeURIComponent(ticker)}/orderbook`;
  const data = await cachedFetch<KalshiOrderbookResponse>(url, 10_000); // 10s cache

  const bids: OrderbookLevel[] = (data.orderbook?.yes || []).map(([price, qty]) => ({
    price: centsToDecimal(price).toString(),
    size: qty.toString(),
  }));

  const asks: OrderbookLevel[] = (data.orderbook?.no || []).map(([price, qty]) => ({
    price: centsToDecimal(price).toString(),
    size: qty.toString(),
  }));

  const bestBid = bids.length ? parseFloat(bids[0].price) : 0;
  const bestAsk = asks.length ? parseFloat(asks[0].price) : 1;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;

  return { bids, asks, spread, midPrice };
}

export async function getKalshiPriceHistory(
  ticker: string,
  interval: "1d" | "1w" | "1m" | "3m" | "all" = "1m",
): Promise<PricePoint[]> {
  const now = Math.floor(Date.now() / 1000);
  let startTs: number;

  switch (interval) {
    case "1d":
      startTs = now - 86_400;
      break;
    case "1w":
      startTs = now - 7 * 86_400;
      break;
    case "1m":
      startTs = now - 30 * 86_400;
      break;
    case "3m":
      startTs = now - 90 * 86_400;
      break;
    case "all":
      startTs = now - 365 * 86_400;
      break;
  }

  // Pick candlestick period based on interval
  const periodInterval =
    interval === "1d" ? 1 : interval === "1w" ? 60 : interval === "1m" ? 360 : 1440;

  const qs = new URLSearchParams();
  qs.set("start_ts", String(startTs));
  qs.set("end_ts", String(now));
  qs.set("period_interval", String(periodInterval));

  const url = `${KALSHI_BASE}/markets/${encodeURIComponent(ticker)}/candlesticks?${qs.toString()}`;
  const data = await cachedFetch<KalshiCandlesticksResponse>(url, 120_000);

  return (data.candles || []).map((c) => ({
    t: c.ts,
    p: centsToDecimal(c.close),
  }));
}

/* ── Convenience helpers (matching Polymarket API shape) ── */

export async function getTrendingKalshiMarkets(limit = 10): Promise<Market[]> {
  const { markets } = await getKalshiMarkets({ limit: 100, status: "open" });
  // Sort by 24h volume descending
  return markets.sort((a, b) => b.volume24h - a.volume24h).slice(0, limit);
}

export async function getClosingSoonKalshi(limit = 10): Promise<Market[]> {
  const { markets } = await getKalshiMarkets({ limit: 100, status: "open" });
  const now = new Date();
  return markets
    .filter((m) => m.endDate && new Date(m.endDate) > now)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, limit);
}

export async function getNewKalshiMarkets(limit = 10): Promise<Market[]> {
  const { markets } = await getKalshiMarkets({ limit: 100, status: "open" });
  return markets
    .filter((m) => m.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
