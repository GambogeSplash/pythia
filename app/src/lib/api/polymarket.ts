/* ------------------------------------------------------------------ */
/*  Polymarket API client                                              */
/*  Gamma API: market metadata, events                                 */
/*  CLOB API: prices, orderbooks, price history                        */
/* ------------------------------------------------------------------ */

import type { Market, MarketEvent, PricePoint, Orderbook, OrderbookLevel } from "./types";

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const CLOB_BASE = "https://clob.polymarket.com";

/* ── Raw Gamma API types ── */

interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string; // JSON string
  outcomePrices: string; // JSON string
  volume: string;
  active: boolean;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  clobTokenIds: string; // JSON string
  liquidityClob: number;
  acceptingOrders: boolean;
  negRisk: boolean;
  groupItemTitle: string;
  events?: GammaEvent[];
}

interface GammaEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  liquidity: number;
  volume: number;
  volume24hr: number;
  volume1wk: number;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  markets?: GammaMarket[];
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

  if (!res.ok) {
    throw new Error(`Polymarket API error: ${res.status} ${res.statusText} for ${url}`);
  }

  const data = await res.json() as T;
  cache.set(url, { data, expiry: now + ttl });
  return data;
}

/* ── Normalizers ── */

function parseJsonField<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeMarket(raw: GammaMarket): Market {
  const outcomes = parseJsonField<string[]>(raw.outcomes, ["Yes", "No"]);
  const prices = parseJsonField<string[]>(raw.outcomePrices, ["0", "0"]);
  const clobTokenIds = parseJsonField<string[]>(raw.clobTokenIds, []);

  return {
    id: raw.id,
    slug: raw.slug,
    question: raw.question,
    description: raw.description,
    category: categorizeMarket(raw.question, raw.events?.[0]?.slug),
    venue: "polymarket",
    image: raw.image || raw.icon,
    endDate: raw.endDate,
    active: raw.active,
    closed: raw.closed,
    yesPrice: parseFloat(prices[0]) || 0,
    noPrice: parseFloat(prices[1]) || 0,
    volume: parseFloat(raw.volume) || 0,
    volume24h: raw.volume24hr || 0,
    liquidity: raw.liquidityClob || parseFloat(raw.liquidity) || 0,
    outcomes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    conditionId: raw.conditionId,
    clobTokenIds,
    eventSlug: raw.events?.[0]?.slug,
  };
}

function normalizeEvent(raw: GammaEvent): MarketEvent {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    image: raw.image || raw.icon,
    startDate: raw.startDate,
    endDate: raw.endDate,
    active: raw.active,
    closed: raw.closed,
    volume: raw.volume,
    volume24h: raw.volume24hr,
    liquidity: raw.liquidity,
    markets: (raw.markets || []).map(normalizeMarket),
    commentCount: raw.commentCount,
  };
}

/* ── Category inference ── */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Politics: ["president", "trump", "biden", "election", "congress", "senate", "governor", "democrat", "republican", "gop", "vote", "primary", "scotus", "supreme court"],
  Crypto: ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto", "token", "defi", "nft", "blockchain", "binance", "coinbase"],
  Sports: ["nba", "nfl", "mlb", "nhl", "ufc", "f1", "soccer", "football", "basketball", "baseball", "tennis", "championship", "finals", "super bowl", "world cup", "grand prix"],
  Macro: ["fed", "interest rate", "gdp", "inflation", "recession", "unemployment", "cpi", "s&p", "nasdaq", "stock", "treasury", "tariff"],
  Science: ["ai", "gpt", "openai", "spacex", "nasa", "climate", "fda", "vaccine", "fusion", "quantum"],
  Culture: ["oscar", "grammy", "tiktok", "twitter", "elon", "meta", "apple", "google", "netflix"],
};

function categorizeMarket(question: string, slug?: string): string {
  const text = `${question} ${slug || ""}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "Other";
}

/* ── Public API ── */

export async function getMarkets(params: {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  order?: string;
  ascending?: boolean;
} = {}): Promise<{ markets: Market[]; raw_count: number }> {
  const {
    limit = 50,
    offset = 0,
    active = true,
    closed = false,
    order = "volume24hr",
    ascending = false,
  } = params;

  const url = `${GAMMA_BASE}/markets?limit=${limit}&offset=${offset}&active=${active}&closed=${closed}&order=${order}&ascending=${ascending}`;
  const raw = await cachedFetch<GammaMarket[]>(url);
  return {
    markets: raw.map(normalizeMarket),
    raw_count: raw.length,
  };
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  const url = `${GAMMA_BASE}/markets?slug=${encodeURIComponent(slug)}&limit=1`;
  const raw = await cachedFetch<GammaMarket[]>(url);
  if (!raw.length) return null;
  return normalizeMarket(raw[0]);
}

export async function getMarketById(id: string): Promise<Market | null> {
  const url = `${GAMMA_BASE}/markets/${id}`;
  try {
    const raw = await cachedFetch<GammaMarket>(url);
    return normalizeMarket(raw);
  } catch {
    return null;
  }
}

export async function getEvents(params: {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  order?: string;
  ascending?: boolean;
} = {}): Promise<MarketEvent[]> {
  const {
    limit = 30,
    offset = 0,
    active = true,
    closed = false,
    order = "volume24hr",
    ascending = false,
  } = params;

  const url = `${GAMMA_BASE}/events?limit=${limit}&offset=${offset}&active=${active}&closed=${closed}&order=${order}&ascending=${ascending}`;
  const raw = await cachedFetch<GammaEvent[]>(url);
  return raw.map(normalizeEvent);
}

export async function searchMarkets(query: string, limit = 20): Promise<Market[]> {
  const url = `${GAMMA_BASE}/markets?limit=${limit}&active=true&closed=false&_q=${encodeURIComponent(query)}`;
  const raw = await cachedFetch<GammaMarket[]>(url, 30_000); // shorter cache for search
  return raw.map(normalizeMarket);
}

export async function getPriceHistory(
  clobTokenId: string,
  interval: "1d" | "1w" | "1m" | "3m" | "all" = "1m",
  fidelity = 60,
): Promise<PricePoint[]> {
  const url = `${CLOB_BASE}/prices-history?market=${clobTokenId}&interval=${interval}&fidelity=${fidelity}`;
  const data = await cachedFetch<{ history: PricePoint[] }>(url, 120_000);
  return data.history || [];
}

export async function getTrendingMarkets(limit = 10): Promise<Market[]> {
  const { markets } = await getMarkets({
    limit,
    order: "volume24hr",
    ascending: false,
    active: true,
    closed: false,
  });
  return markets;
}

export async function getClosingSoon(limit = 10): Promise<Market[]> {
  const { markets } = await getMarkets({
    limit: 100,
    order: "endDate",
    ascending: true,
    active: true,
    closed: false,
  });

  const now = new Date();
  return markets
    .filter((m) => new Date(m.endDate) > now)
    .slice(0, limit);
}

export async function getTopMovers(limit = 10): Promise<Market[]> {
  // Fetch by liquidity to get different markets than trending (which sorts by volume)
  const { markets } = await getMarkets({
    limit,
    order: "liquidity",
    ascending: false,
    active: true,
    closed: false,
  });
  return markets;
}

export async function getNewMarkets(limit = 10): Promise<Market[]> {
  const { markets } = await getMarkets({
    limit,
    order: "createdAt",
    ascending: false,
    active: true,
    closed: false,
  });
  return markets;
}

export async function getMarketsByCategory(category: string, limit = 20): Promise<Market[]> {
  // Gamma doesn't support category filtering — fetch a larger batch and filter client-side
  const { markets } = await getMarkets({
    limit: 200,
    order: "volume24hr",
    ascending: false,
    active: true,
    closed: false,
  });

  return markets
    .filter((m) => m.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit);
}

/* ── Raw CLOB orderbook type ── */

interface ClobOrderbook {
  market: string;
  asset_id: string;
  hash?: string;
  timestamp: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export async function getOrderbook(tokenId: string): Promise<Orderbook> {
  const url = `${CLOB_BASE}/book?token_id=${tokenId}`;
  const raw = await cachedFetch<ClobOrderbook>(url, 10_000); // 10s cache — orderbooks are volatile

  const bestBid = raw.bids.length ? parseFloat(raw.bids[0].price) : 0;
  const bestAsk = raw.asks.length ? parseFloat(raw.asks[0].price) : 1;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;

  return {
    bids: raw.bids,
    asks: raw.asks,
    spread,
    midPrice,
  };
}
