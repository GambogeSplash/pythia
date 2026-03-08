import useSWR from "swr";
import type { Market, MarketEvent, PricePoint, ApiResponse, Orderbook, MarketStats } from "@/lib/api/types";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
});

/** Fetch paginated markets list */
export function useMarkets(params: {
  limit?: number;
  offset?: number;
  mode?: "trending" | "closing" | "movers" | "new" | "category";
  category?: string;
} = {}) {
  const { limit = 50, offset = 0, mode, category } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));
  searchParams.set("offset", String(offset));
  if (mode) searchParams.set("mode", mode);
  if (mode === "category" && category) searchParams.set("category", category);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Market[]>>(
    `/api/markets?${searchParams}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    markets: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/** Fetch trending markets (by 24h volume) */
export function useTrendingMarkets(limit = 10) {
  return useMarkets({ limit, mode: "trending" });
}

/** Fetch markets closing soon */
export function useClosingSoonMarkets(limit = 10) {
  return useMarkets({ limit, mode: "closing" });
}

/** Search markets by query */
export function useSearchMarkets(query: string, limit = 20) {
  const { data, error, isLoading } = useSWR<ApiResponse<Market[]>>(
    query.trim().length >= 2 ? `/api/markets?q=${encodeURIComponent(query)}&limit=${limit}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 },
  );

  return {
    markets: data?.data ?? [],
    isLoading,
    isError: !!error,
  };
}

/** Fetch single market by ID, optionally with price history */
export function useMarket(id: string | null, opts: { history?: boolean; interval?: string } = {}) {
  const { history = false, interval = "1m" } = opts;
  const searchParams = new URLSearchParams();
  if (history) searchParams.set("history", "true");
  if (interval) searchParams.set("interval", interval);

  const { data, error, isLoading, mutate } = useSWR<{ data: Market; priceHistory?: PricePoint[] }>(
    id ? `/api/markets/${id}?${searchParams}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    market: data?.data ?? null,
    priceHistory: data?.priceHistory ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

/** Fetch events list */
export function useEvents(limit = 30) {
  const { data, error, isLoading } = useSWR<ApiResponse<MarketEvent[]>>(
    `/api/events?limit=${limit}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    events: data?.data ?? [],
    isLoading,
    isError: !!error,
  };
}

/** Fetch newest markets */
export function useNewMarkets(limit = 10) {
  return useMarkets({ limit, mode: "new" });
}

/** Fetch aggregated market statistics */
export function useMarketStats() {
  const { data, error, isLoading } = useSWR<ApiResponse<MarketStats>>(
    "/api/markets/stats",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    stats: data?.data ?? null,
    isLoading,
    isError: !!error,
  };
}

/** Fetch orderbook for a market */
export function useOrderbook(marketId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Orderbook }>(
    marketId ? `/api/markets/${marketId}/orderbook` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000, refreshInterval: 15_000 },
  );

  return {
    orderbook: data?.data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/** Fetch price history for a market (dedicated route) */
export function usePriceHistory(marketId: string | null, interval: string = "1m") {
  const { data, error, isLoading } = useSWR<{ data: PricePoint[] }>(
    marketId ? `/api/markets/${marketId}/history?interval=${interval}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    history: data?.data ?? [],
    isLoading,
    isError: !!error,
  };
}
