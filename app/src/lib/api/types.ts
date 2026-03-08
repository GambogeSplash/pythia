/* ------------------------------------------------------------------ */
/*  Pythia unified types for prediction market data                     */
/* ------------------------------------------------------------------ */

/** Venue identifier */
export type VenueId = "polymarket" | "kalshi";

/** Normalized market from any venue */
export interface Market {
  id: string;
  slug: string;
  question: string;
  description: string;
  category: string;
  venue: VenueId;
  image: string;
  endDate: string;
  active: boolean;
  closed: boolean;

  // Prices (0-1 probability)
  yesPrice: number;
  noPrice: number;

  // Volume & liquidity
  volume: number;
  volume24h: number;
  liquidity: number;

  // Metadata
  outcomes: string[];
  createdAt: string;
  updatedAt: string;

  // Polymarket-specific (optional)
  conditionId?: string;
  clobTokenIds?: string[];
  eventSlug?: string;
}

/** Event groups markets under a single topic */
export interface MarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24h: number;
  liquidity: number;
  markets: Market[];
  commentCount?: number;
}

/** Price history point */
export interface PricePoint {
  t: number; // unix timestamp
  p: number; // price 0-1
}

/** Orderbook price level */
export interface OrderbookLevel {
  price: string;
  size: string;
}

/** Normalized orderbook with computed spread/midPrice */
export interface Orderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: number;
  midPrice: number;
}

/** Aggregated market statistics */
export interface MarketStats {
  totalMarkets: number;
  totalVolume24h: number;
  totalLiquidity: number;
  topCategories: { name: string; count: number; volume: number }[];
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    cached?: boolean;
  };
}
