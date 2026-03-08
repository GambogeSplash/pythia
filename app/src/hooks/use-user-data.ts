import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (r.status === 401) return null;
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

// ── Positions ───────────────────────────────────────────────────────────────

interface Position {
  id: string;
  marketId: string;
  marketQuestion: string;
  venue: string;
  side: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  category: string | null;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

export function usePositions() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Position[] } | null>(
    "/api/user/positions",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    positions: data?.data ?? [],
    isLoading,
    isError: !!error,
    isAuthenticated: data !== null,
    mutate,
  };
}

// ── Trades ──────────────────────────────────────────────────────────────────

interface Trade {
  id: string;
  positionId: string | null;
  marketId: string;
  marketQuestion: string;
  venue: string;
  side: string;
  action: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  pnl: number | null;
  executedAt: string;
}

export function useTrades(limit = 100) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Trade[] } | null>(
    `/api/user/trades?limit=${limit}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    trades: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ── Bots ────────────────────────────────────────────────────────────────────

interface Bot {
  id: string;
  name: string;
  type: string;
  status: string;
  mode: string;
  config: Record<string, unknown>;
  capital: number;
  pnl: number;
  pnlPercent: number;
  totalTrades: number;
  winRate: number;
  sharpe: number;
  maxDrawdown: number;
  marketsCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useBots() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Bot[] } | null>(
    "/api/user/bots",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 5_000 },
  );

  return {
    bots: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ── Alerts ──────────────────────────────────────────────────────────────────

interface Alert {
  id: string;
  type: string;
  marketId: string;
  marketQuestion: string;
  condition: string;
  threshold: string;
  status: string;
  channels: string[];
  triggered: number;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Alert[] } | null>(
    "/api/user/alerts",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    alerts: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
